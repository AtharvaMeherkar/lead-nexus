from __future__ import annotations

import csv
import io
from typing import Any, Dict, List

from flask import Blueprint, jsonify, request
from sqlalchemy import and_, select

from auth import token_required
from models import Lead, SessionLocal, User, Purchase
from services.validation import validate_lead_row
from services.scoring import predict_lead_score


bp = Blueprint("leads", __name__, url_prefix="/api/leads")


@bp.post("/upload")
@token_required(roles=["vendor", "admin"])
def upload_leads():
    if "file" not in request.files:
        return jsonify({"error": "CSV file is required (form field 'file')"}), 400
    file = request.files["file"]
    try:
        text = file.read().decode("utf-8", errors="ignore")
    except Exception:
        return jsonify({"error": "Unable to read uploaded file"}), 400

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        return jsonify({"error": "CSV appears to have no header"}), 400

    # Parse and validate all rows first
    parsed_leads = []
    skipped: List[Dict[str, Any]] = []
    vendor_id = request.user_id  # type: ignore[attr-defined]

    for row_num, row in enumerate(reader, start=2):  # Start at 2 since row 1 is header
        # Clean and normalize the row data
        cleaned_row = {k.strip().lower(): str(v).strip() if v else "" for k, v in row.items()}
        
        # Map common field variations to standard names
        field_mapping = {
            'lead_title': 'title',
            'company': 'company_name',
            'company_name': 'company_name',
            'contact': 'contact_name',
            'contact_name': 'contact_name',
            'email': 'contact_email',
            'contact_email': 'contact_email',
            'phone': 'contact_phone',
            'contact_phone': 'contact_phone',
            'description': 'description',
            'location': 'location',
            'city': 'location',
            'state': 'state',
            'country': 'country',
            'website': 'website',
            'revenue': 'annual_revenue',
            'annual_revenue': 'annual_revenue',
            'employees': 'employee_count',
            'employee_count': 'employee_count'
        }
        
        # Apply field mapping
        normalized_row = {}
        for key, value in cleaned_row.items():
            mapped_key = field_mapping.get(key, key)
            normalized_row[mapped_key] = value

        # Validate the row
        valid, reason = validate_lead_row(normalized_row)
        if not valid:
            skipped.append({
                "row_number": row_num,
                "data": dict(row),  # Original row data
                "reason": reason
            })
            continue

        # Extract and validate contact email
        contact_email = normalized_row.get("contact_email", "").strip().lower() or None
        
        # Prepare the lead data with enhanced extraction
        lead_data = {
            "title": normalized_row.get("title", "").strip(),
            "industry": normalized_row.get("industry", "").strip(),
            "price": float(normalized_row.get("price", 0)),
            "contact_email": contact_email,
            "extra": {}
        }
        
        # Extract additional fields into extra
        standard_fields = {"title", "industry", "price", "contact_email"}
        for key, value in normalized_row.items():
            if key not in standard_fields and value:
                lead_data["extra"][key] = value
        
        # Add some default values if missing
        if not lead_data["extra"].get("description"):
            lead_data["extra"]["description"] = f"High-quality {lead_data['industry']} lead with strong conversion potential."
        
        parsed_leads.append(lead_data)

    # Return parsed data for vendor review if no auto-pricing is set
    return jsonify({
        "parsed_leads": parsed_leads,
        "skipped": skipped,
        "total_parsed": len(parsed_leads),
        "total_skipped": len(skipped),
        "requires_pricing": True
    }), 200


@bp.post("/upload/confirm")
@token_required(roles=["vendor", "admin"])
def confirm_upload():
    """Confirm and save leads after vendor sets pricing and reviews data"""
    data = request.get_json(force=True)
    leads_data = data.get("leads", [])
    
    if not leads_data:
        return jsonify({"error": "No leads data provided"}), 400
    
    vendor_id = request.user_id  # type: ignore[attr-defined]
    created = 0
    skipped: List[Dict[str, Any]] = []

    with SessionLocal() as db:
        for lead_data in leads_data:
            try:
                # Validate required fields
                if not all(k in lead_data for k in ["title", "industry", "price"]):
                    skipped.append({"data": lead_data, "reason": "Missing required fields"})
                    continue
                
                contact_email = lead_data.get("contact_email")
                if contact_email:
                    contact_email = contact_email.strip().lower()
                
                # Duplicate detection
                if contact_email:
                    exists = db.execute(
                        select(Lead.id).where(
                            and_(Lead.vendor_id == vendor_id, Lead.contact_email == contact_email)
                        )
                    ).first()
                    if exists:
                        skipped.append({"data": lead_data, "reason": "Duplicate by contact_email"})
                        continue

                # Create the lead
                lead = Lead(
                    title=lead_data["title"],
                    industry=lead_data["industry"],
                    price=float(lead_data["price"]),
                    contact_email=contact_email,
                    extra=lead_data.get("extra", {}),
                    vendor_id=vendor_id,
                )
                db.add(lead)
                created += 1
                
            except Exception as e:
                skipped.append({"data": lead_data, "reason": f"Error creating lead: {str(e)}"})
                
        db.commit()

    # Prepare detailed response message
    if created == 0 and len(skipped) > 0:
        duplicate_count = len([s for s in skipped if "Duplicate" in s.get("reason", "")])
        if duplicate_count > 0:
            message = f"No new leads created. {duplicate_count} leads were duplicates or already uploaded. Please upload new, unique leads instead of reusing existing data."
        else:
            message = f"No leads created. {len(skipped)} leads had validation errors. Please review and fix the issues before uploading again."
    elif created > 0 and len(skipped) > 0:
        duplicate_count = len([s for s in skipped if "Duplicate" in s.get("reason", "")])
        message = f"Successfully created {created} leads. {duplicate_count} leads were skipped as duplicates or already uploaded. Please ensure you're uploading unique data for better results."
    else:
        message = f"Successfully created {created} leads!"
    
    return jsonify({
        "created": created,
        "skipped": skipped,
        "message": message
    }), 201


@bp.get("")
@token_required(roles=["client", "vendor", "admin"])
def list_leads():
    industry = request.args.get("industry")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)

    with SessionLocal() as db:
        stmt = select(Lead).where(Lead.status == "available")
        if industry:
            stmt = stmt.where(Lead.industry.ilike(f"%{industry}%"))
        if min_price is not None:
            stmt = stmt.where(Lead.price >= min_price)
        if max_price is not None:
            stmt = stmt.where(Lead.price <= max_price)
        leads = [
            {
                "id": l.id,
                "title": l.title,
                "industry": l.industry,
                "price": l.price,
                "score": predict_lead_score({"industry": l.industry}),
            }
            for (l,) in db.execute(stmt).all()
        ]

    return jsonify({"items": leads})


@bp.get("/<int:lead_id>")
@token_required(roles=["client", "vendor", "admin"])
def get_lead(lead_id: int):
    with SessionLocal() as db:
        lead = db.get(Lead, lead_id)
        if not lead:
            return jsonify({"error": "Lead not found"}), 404
        
        # Get vendor information
        vendor = db.get(User, lead.vendor_id)
        
        lead_data = {
            "id": lead.id,
            "title": lead.title,
            "description": lead.extra.get("description", "High-quality lead with strong conversion potential."),
            "industry": lead.industry,
            "company_name": lead.extra.get("company_name", "Confidential"),
            "contact_name": lead.extra.get("contact_name", "Contact information available after purchase"),
            "contact_email": lead.contact_email or lead.extra.get("contact_email", "Email available after purchase"),
            "contact_phone": lead.extra.get("contact_phone", "Phone available after purchase"),
            "location": lead.extra.get("location", "Location available after purchase"),
            "price": lead.price,
            "status": lead.status,
            "created_at": lead.created_at.isoformat(),
            "vendor_id": lead.vendor_id,
            "vendor": {
                "username": vendor.email if vendor else "Unknown",  # Using email as username
                "email": vendor.email if vendor else "unknown@example.com"
            }
        }
        
        return jsonify(lead_data)


@bp.get("/my")
@token_required(roles=["vendor", "admin"])
def my_leads():
    vendor_id = request.user_id  # type: ignore[attr-defined]
    with SessionLocal() as db:
        stmt = select(Lead).where(Lead.vendor_id == vendor_id)
        leads = [
            {
                "id": l.id,
                "title": l.title,
                "industry": l.industry,
                "price": l.price,
                "status": l.status,
            }
            for (l,) in db.execute(stmt).all()
        ]
    return jsonify({"items": leads})


@bp.post("/purchase")
@token_required(roles=["client", "admin"])
def purchase_lead():
    data = request.get_json(force=True)
    lead_id = data.get("lead_id")
    if not lead_id:
        return jsonify({"error": "lead_id is required"}), 400

    buyer_id = request.user_id  # type: ignore[attr-defined]

    with SessionLocal() as db:
        lead = db.get(Lead, int(lead_id))
        if not lead or lead.status != "available":
            return jsonify({"error": "Lead not available"}), 404

        purchase = Purchase(buyer_id=buyer_id, lead_id=lead.id, amount=lead.price)
        lead.status = "sold"
        db.add(purchase)
        db.commit()

    return jsonify({"status": "success", "lead_id": lead_id}), 200


