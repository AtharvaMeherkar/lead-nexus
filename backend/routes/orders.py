from flask import Blueprint, jsonify, request
from sqlalchemy import select

from auth import token_required
from models import Purchase, Lead, SessionLocal


bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@bp.get("/my")
@token_required(roles=["client", "admin"])
def my_orders():
    buyer_id = request.user_id  # type: ignore[attr-defined]
    with SessionLocal() as db:
        stmt = select(Purchase, Lead).where(Purchase.buyer_id == buyer_id).join(Lead, Purchase.lead_id == Lead.id)
        rows = db.execute(stmt).all()
        items = []
        for purchase, lead in rows:
            items.append({
                "purchase_id": purchase.id,
                "lead_id": lead.id,
                "title": lead.title,
                "industry": lead.industry,
                "price": lead.price,
                "status": purchase.status,
                "created_at": purchase.created_at.isoformat() + "Z",
            })
    return jsonify({"items": items})


