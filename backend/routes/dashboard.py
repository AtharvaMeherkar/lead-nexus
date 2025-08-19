from flask import Blueprint, jsonify, request
from sqlalchemy import func, extract, desc, case
from models import SessionLocal, Purchase, Lead, User
from auth import token_required
from datetime import datetime, timedelta
import calendar

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@bp.get("/client")
@token_required(roles=["client", "admin"])
def client_summary():
    buyer_id = request.user_id # type: ignore[attr-defined]
    with SessionLocal() as db:
        # Basic metrics
        total_purchases = db.query(Purchase).filter(Purchase.buyer_id == buyer_id).count()
        paid_purchases = db.query(Purchase).filter(Purchase.buyer_id == buyer_id, Purchase.status == "paid").count()
        pending_purchases = db.query(Purchase).filter(Purchase.buyer_id == buyer_id, Purchase.status == "pending").count()
        total_spent = db.query(func.sum(Purchase.amount)).filter(Purchase.buyer_id == buyer_id, Purchase.status == "paid").scalar() or 0
        
        # Average order value
        avg_order_value = total_spent / paid_purchases if paid_purchases > 0 else 0
        
        # This month's spending
        current_month = datetime.now().strftime('%Y-%m')
        month_spent = db.query(func.sum(Purchase.amount)).filter(
            Purchase.buyer_id == buyer_id, 
            Purchase.status == "paid",
            func.strftime('%Y-%m', Purchase.created_at) == current_month
        ).scalar() or 0
        
        # Most expensive purchase
        max_purchase = db.query(func.max(Purchase.amount)).filter(
            Purchase.buyer_id == buyer_id, 
            Purchase.status == "paid"
        ).scalar() or 0
        
        # Recent activity (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_purchases = db.query(Purchase).filter(
            Purchase.buyer_id == buyer_id,
            Purchase.created_at >= week_ago
        ).count()
        
        # Lead categories purchased
        lead_categories = db.query(
            Lead.industry,
            func.count(Purchase.id).label('count')
        ).join(Purchase, Lead.id == Purchase.lead_id).filter(
            Purchase.buyer_id == buyer_id,
            Purchase.status == "paid"
        ).group_by(Lead.industry).order_by(desc('count')).limit(5).all()
        
        return jsonify({
            "totalPurchases": total_purchases,
            "paidPurchases": paid_purchases,
            "pendingPurchases": pending_purchases,
            "totalSpent": float(total_spent),
            "avgOrderValue": float(avg_order_value),
            "monthSpent": float(month_spent),
            "maxPurchase": float(max_purchase),
            "recentActivity": recent_purchases,
            "topCategories": [{
                "industry": cat.industry or "Unknown",
                "count": cat.count
            } for cat in lead_categories]
        })


@bp.get("/client/purchase-trends")
@token_required(roles=["client", "admin"])
def client_purchase_trends():
    buyer_id = request.user_id # type: ignore[attr-defined]
    with SessionLocal() as db:
        # Get purchase trends for the last 6 months
        trends = []
        for i in range(6):
            date = datetime.now() - timedelta(days=30*i)
            month = date.strftime('%Y-%m')
            month_name = date.strftime('%B')
            
            # Count purchases for this month
            month_purchases = db.query(Purchase).filter(
                Purchase.buyer_id == buyer_id,
                Purchase.status == "paid",
                func.strftime('%Y-%m', Purchase.created_at) == month
            ).count()
            
            # Sum spent for this month
            month_spent = db.query(func.sum(Purchase.amount)).filter(
                Purchase.buyer_id == buyer_id,
                Purchase.status == "paid",
                func.strftime('%Y-%m', Purchase.created_at) == month
            ).scalar() or 0
            
            trends.append({
                "month": month_name,
                "totalPurchases": month_purchases,
                "totalSpent": float(month_spent)
            })
        
        return jsonify(trends[::-1])  # Reverse to show oldest first


@bp.get("/client/industry-breakdown")
@token_required(roles=["client", "admin"])
def client_industry_breakdown():
    buyer_id = request.user_id # type: ignore[attr-defined]
    with SessionLocal() as db:
        # Get industry breakdown of purchased leads
        industry_data = db.query(
            Lead.industry,
            func.count(Purchase.id).label('count'),
            func.sum(Purchase.amount).label('totalSpent')
        ).join(Purchase, Lead.id == Purchase.lead_id).filter(
            Purchase.buyer_id == buyer_id,
            Purchase.status == "paid"
        ).group_by(Lead.industry).order_by(desc('count')).all()
        
        return jsonify([{
            "industry": item.industry or "Unknown",
            "count": item.count,
            "totalSpent": float(item.totalSpent or 0)
        } for item in industry_data])

@bp.get("/vendor")
@token_required(roles=["vendor", "admin"])
def vendor_summary():
    vendor_id = request.user_id # type: ignore[attr-defined]
    with SessionLocal() as db:
        # Basic metrics
        total_leads = db.query(Lead).filter(Lead.vendor_id == vendor_id).count()
        sold_leads = db.query(Lead).filter(Lead.vendor_id == vendor_id, Lead.status == "sold").count()
        available_leads = db.query(Lead).filter(Lead.vendor_id == vendor_id, Lead.status == "available").count()
        
        # Revenue calculation
        revenue_query = db.query(func.sum(Purchase.amount)).join(
            Lead, Purchase.lead_id == Lead.id
        ).filter(
            Lead.vendor_id == vendor_id,
            Purchase.status == "paid"
        )
        total_revenue = revenue_query.scalar() or 0
        
        # Average lead price
        avg_lead_price = db.query(func.avg(Lead.price)).filter(Lead.vendor_id == vendor_id).scalar() or 0
        
        # Conversion rate
        conversion_rate = (sold_leads / total_leads * 100) if total_leads > 0 else 0
        
        # This month's revenue
        current_month = datetime.now().strftime('%Y-%m')
        month_revenue = db.query(func.sum(Purchase.amount)).join(
            Lead, Purchase.lead_id == Lead.id
        ).filter(
            Lead.vendor_id == vendor_id,
            Purchase.status == "paid",
            func.strftime('%Y-%m', Purchase.created_at) == current_month
        ).scalar() or 0
        
        # Best performing industry
        top_industry = db.query(
            Lead.industry,
            func.count(Purchase.id).label('sales'),
            func.sum(Purchase.amount).label('revenue')
        ).join(Purchase, Lead.id == Purchase.lead_id).filter(
            Lead.vendor_id == vendor_id,
            Purchase.status == "paid"
        ).group_by(Lead.industry).order_by(desc('revenue')).first()
        
        # Recent sales (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_sales = db.query(Purchase).join(
            Lead, Purchase.lead_id == Lead.id
        ).filter(
            Lead.vendor_id == vendor_id,
            Purchase.status == "paid",
            Purchase.created_at >= week_ago
        ).count()
        
        return jsonify({
            "totalLeads": total_leads,
            "soldLeads": sold_leads,
            "availableLeads": available_leads,
            "revenue": float(total_revenue),
            "avgLeadPrice": float(avg_lead_price),
            "conversionRate": float(conversion_rate),
            "monthRevenue": float(month_revenue),
            "recentSales": recent_sales,
            "topIndustry": {
                "name": top_industry.industry if top_industry else "N/A",
                "sales": top_industry.sales if top_industry else 0,
                "revenue": float(top_industry.revenue) if top_industry else 0
            }
        })


@bp.get("/vendor/sales-trends")
@token_required(roles=["vendor", "admin"])
def vendor_sales_trends():
    vendor_id = request.user_id # type: ignore[attr-defined]
    with SessionLocal() as db:
        # Get sales trends for the last 6 months
        trends = []
        for i in range(6):
            date = datetime.now() - timedelta(days=30*i)
            month = date.strftime('%Y-%m')
            month_name = date.strftime('%B')
            
            # Count leads sold this month
            month_sales = db.query(Purchase).join(
                Lead, Purchase.lead_id == Lead.id
            ).filter(
                Lead.vendor_id == vendor_id,
                Purchase.status == "paid",
                func.strftime('%Y-%m', Purchase.created_at) == month
            ).count()
            
            # Sum revenue for this month
            month_revenue = db.query(func.sum(Purchase.amount)).join(
                Lead, Purchase.lead_id == Lead.id
            ).filter(
                Lead.vendor_id == vendor_id,
                Purchase.status == "paid",
                func.strftime('%Y-%m', Purchase.created_at) == month
            ).scalar() or 0
            
            trends.append({
                "month": month_name,
                "leadsSold": month_sales,
                "revenue": float(month_revenue)
            })
        
        return jsonify(trends[::-1])  # Reverse to show oldest first




@bp.get("/vendor/industry-performance")
@token_required(roles=["vendor", "admin"])
def vendor_industry_performance():
    vendor_id = request.user_id # type: ignore[attr-defined]
    with SessionLocal() as db:
        # Get industry performance data
        industry_data = db.query(
            Lead.industry,
            func.count(Lead.id).label('leadsCount'),
            func.sum(case((Lead.status == "sold", 1), else_=0)).label('soldCount'),
            func.sum(case((Lead.status == "sold", Purchase.amount), else_=0)).label('revenue')
        ).outerjoin(Purchase, Lead.id == Purchase.lead_id).filter(
            Lead.vendor_id == vendor_id
        ).group_by(Lead.industry).order_by(desc('revenue')).all()
        
        return jsonify([{
            "industry": item.industry or "Unknown",
            "leadsCount": item.leadsCount,
            "soldCount": item.soldCount,
            "revenue": float(item.revenue or 0)
        } for item in industry_data])
