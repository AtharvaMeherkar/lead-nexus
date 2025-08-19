"""
Payment Routes - Mock Payment System Only

This module handles all payment-related operations using a mock payment system.
Stripe integration has been removed to simplify the codebase.
"""

import json
import time
from typing import Dict, Any

from flask import Blueprint, jsonify, request

from auth import token_required
from models import Lead, Purchase, SessionLocal


# Initialize Blueprint
bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@bp.post("/create-intent")
@token_required(roles=["client", "admin"])
def create_payment_intent() -> tuple[Dict[str, Any], int]:
    """
    Create a mock payment intent for a single lead purchase.
    
    Returns:
        JSON response with client_secret and payment_intent_id
    """
    data = request.get_json(force=True)
    lead_id = data.get("lead_id")
    
    if not lead_id:
        return jsonify({"error": "lead_id is required"}), 400

    with SessionLocal() as db:
        # Validate lead exists and is available
        lead = db.get(Lead, int(lead_id))
        if not lead or lead.status != "available":
            return jsonify({"error": "Lead not available"}), 404

        # Create mock payment intent
        mock_intent_id = f"pi_mock_{lead.id}_{int(time.time())}"
        
        # Create purchase record
        purchase = Purchase(
            buyer_id=request.user_id,  # type: ignore[attr-defined]
            lead_id=lead.id,
            amount=lead.price,
            status="requires_payment",
            stripe_payment_intent_id=mock_intent_id,
        )
        
        db.add(purchase)
        db.commit()
        
        return jsonify({
            "client_secret": f"cs_test_mock_{lead.id}",
            "payment_intent_id": mock_intent_id,
            "amount": lead.price,
            "currency": "usd"
        }), 200


@bp.post("/webhook")
def payment_webhook() -> tuple[Dict[str, Any], int]:
    """
    Handle payment confirmation webhook for mock payments.
    
    Expected payload: {"payment_intent_id": "pi_mock_..."}
    """
    try:
        payload = request.get_data(as_text=True)
        event = json.loads(payload or "{}")
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON payload"}), 400
    
    payment_intent_id = event.get("payment_intent_id")
    if not payment_intent_id:
        return jsonify({"error": "payment_intent_id required"}), 400
    
    with SessionLocal() as db:
        # Find and update purchase
        purchase = (
            db.query(Purchase)
            .filter(Purchase.stripe_payment_intent_id == payment_intent_id)
            .first()
        )
        
        if not purchase:
            return jsonify({"error": "Payment intent not found"}), 404
        
        # Update purchase and lead status
        lead = db.get(Lead, purchase.lead_id)
        if lead:
            lead.status = "sold"
        
        purchase.status = "paid"
        db.commit()
    
    return jsonify({
        "received": True, 
        "mode": "mock",
        "payment_intent_id": payment_intent_id
    }), 200


@bp.post("/mock-cart-intent")
@token_required(roles=["client", "admin"])
def create_cart_payment_intent() -> tuple[Dict[str, Any], int]:
    """
    Create a mock payment intent for multiple leads (cart checkout).
    
    Expected payload: {"lead_ids": [1, 2, 3]}
    """
    data = request.get_json(force=True)
    lead_ids = data.get("lead_ids", [])
    
    if not isinstance(lead_ids, list) or not lead_ids:
        return jsonify({"error": "lead_ids must be a non-empty array"}), 400

    with SessionLocal() as db:
        # Validate all leads are available
        leads = []
        for lead_id in lead_ids:
            lead = db.get(Lead, int(lead_id))
            if not lead or lead.status != "available":
                return jsonify({"error": f"Lead {lead_id} not available"}), 404
            leads.append(lead)

        # Create cart order
        order_id = f"order_{int(time.time())}_{request.user_id}"
        payment_intent_id = f"pmock_{order_id}"
        total_amount = sum(lead.price for lead in leads)

        # Create purchase records for each lead
        for lead in leads:
            purchase = Purchase(
                buyer_id=request.user_id,  # type: ignore[attr-defined]
                lead_id=lead.id,
                amount=lead.price,
                status="requires_payment",
                stripe_payment_intent_id=f"{payment_intent_id}_{lead.id}",
            )
            db.add(purchase)
        
        db.commit()

        return jsonify({
            "client_secret": f"cs_cart_mock_{order_id}",
            "payment_intent_id": payment_intent_id,
            "amount": total_amount,
            "currency": "usd",
            "lead_count": len(leads)
        }), 200


@bp.post("/mock-cart-confirm")
@token_required(roles=["client", "admin"])
def confirm_cart_payment() -> tuple[Dict[str, Any], int]:
    """
    Confirm payment for cart checkout (multiple leads).
    
    Expected payload: {"payment_intent_id": "pmock_order_..."}
    """
    data = request.get_json(force=True)
    payment_intent_id = data.get("payment_intent_id")
    
    if not payment_intent_id:
        return jsonify({"error": "payment_intent_id is required"}), 400

    updated_count = 0
    
    with SessionLocal() as db:
        # Find all purchases for this cart order
        purchases = (
            db.query(Purchase)
            .filter(Purchase.stripe_payment_intent_id.like(f"{payment_intent_id}%"))
            .all()
        )
        
        if not purchases:
            return jsonify({"error": "No purchases found for this payment intent"}), 404
        
        # Update all purchases and leads
        for purchase in purchases:
            lead = db.get(Lead, purchase.lead_id)
            if lead and lead.status == "available":
                lead.status = "sold"
            
            purchase.status = "paid"
            updated_count += 1
        
        db.commit()

    return jsonify({
        "updated": updated_count,
        "status": "paid",
        "payment_intent_id": payment_intent_id
    }), 200