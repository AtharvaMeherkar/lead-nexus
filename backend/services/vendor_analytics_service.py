"""
Vendor Analytics & Tools Service
===============================

This service provides comprehensive vendor analytics and tools including:
- Vendor performance metrics
- Lead quality ratings by clients
- Vendor reputation system
- Vendor dashboard enhancements
- Commission tracking
"""

import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from sqlalchemy import and_, or_, desc, asc, func, case
from sqlalchemy.orm import Session

from models import User, Lead, Purchase, LeadValidation, LeadApproval, Notification

logger = logging.getLogger(__name__)


class VendorRating(Enum):
    """Vendor rating levels"""
    EXCELLENT = "excellent"  # 4.5-5.0
    GOOD = "good"           # 3.5-4.4
    AVERAGE = "average"     # 2.5-3.4
    POOR = "poor"           # 1.0-2.4


@dataclass
class VendorMetrics:
    """Vendor performance metrics"""
    total_leads: int = 0
    total_sales: int = 0
    total_revenue: float = 0.0
    average_rating: float = 0.0
    response_time_hours: float = 0.0
    lead_quality_score: float = 0.0
    conversion_rate: float = 0.0
    customer_satisfaction: float = 0.0


class VendorAnalyticsService:
    """
    Comprehensive vendor analytics and tools service.
    
    Features:
    - Performance metrics calculation
    - Lead quality ratings
    - Reputation system
    - Dashboard analytics
    - Commission tracking
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def get_vendor_performance_metrics(self, vendor_id: int, 
                                     date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """
        Get comprehensive vendor performance metrics.
        
        Args:
            vendor_id: Vendor user ID
            date_range: Optional date range tuple (start_date, end_date)
            
        Returns:
            Dictionary with performance metrics
        """
        try:
            # Base query for vendor's leads
            leads_query = self.db.query(Lead).filter(Lead.vendor_id == vendor_id)
            
            # Apply date range if provided
            if date_range:
                start_date, end_date = date_range
                leads_query = leads_query.filter(
                    and_(Lead.created_at >= start_date, Lead.created_at <= end_date)
                )
            
            # Get basic metrics
            total_leads = leads_query.count()
            available_leads = leads_query.filter(Lead.status == 'available').count()
            sold_leads = leads_query.filter(Lead.status == 'sold').count()
            
            # Calculate revenue
            revenue_query = leads_query.filter(Lead.status == 'sold')
            total_revenue = revenue_query.with_entities(func.sum(Lead.price)).scalar() or 0.0
            
            # Calculate conversion rate
            conversion_rate = (sold_leads / total_leads * 100) if total_leads > 0 else 0.0
            
            # Get average lead price
            avg_lead_price = leads_query.with_entities(func.avg(Lead.price)).scalar() or 0.0
            
            # Get lead quality metrics
            quality_metrics = self._calculate_lead_quality_metrics(vendor_id, date_range)
            
            # Get response time metrics
            response_metrics = self._calculate_response_time_metrics(vendor_id, date_range)
            
            # Get customer satisfaction
            satisfaction_metrics = self._calculate_customer_satisfaction(vendor_id, date_range)
            
            return {
                'total_leads': total_leads,
                'available_leads': available_leads,
                'sold_leads': sold_leads,
                'total_revenue': float(total_revenue),
                'conversion_rate': round(conversion_rate, 2),
                'average_lead_price': float(avg_lead_price),
                'lead_quality': quality_metrics,
                'response_time': response_metrics,
                'customer_satisfaction': satisfaction_metrics,
                'calculated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating vendor performance metrics: {e}")
            return {'error': 'Failed to calculate performance metrics'}
    
    def _calculate_lead_quality_metrics(self, vendor_id: int, 
                                      date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Calculate lead quality metrics for vendor."""
        try:
            query = self.db.query(Lead).filter(Lead.vendor_id == vendor_id)
            
            if date_range:
                start_date, end_date = date_range
                query = query.filter(
                    and_(Lead.created_at >= start_date, Lead.created_at <= end_date)
                )
            
            # Calculate average lead score
            avg_score = query.with_entities(func.avg(Lead.lead_score)).scalar() or 0.0
            
            # Count leads by score category
            hot_leads = query.filter(Lead.lead_score >= 80).count()
            warm_leads = query.filter(and_(Lead.lead_score >= 60, Lead.lead_score < 80)).count()
            cold_leads = query.filter(and_(Lead.lead_score >= 40, Lead.lead_score < 60)).count()
            dead_leads = query.filter(Lead.lead_score < 40).count()
            
            # Calculate validation success rate
            validation_query = self.db.query(LeadValidation).join(Lead).filter(Lead.vendor_id == vendor_id)
            if date_range:
                start_date, end_date = date_range
                validation_query = validation_query.filter(
                    and_(LeadValidation.created_at >= start_date, LeadValidation.created_at <= end_date)
                )
            
            total_validations = validation_query.count()
            successful_validations = validation_query.filter(LeadValidation.score >= 0.7).count()
            validation_success_rate = (successful_validations / total_validations * 100) if total_validations > 0 else 0.0
            
            return {
                'average_score': float(avg_score),
                'hot_leads': hot_leads,
                'warm_leads': warm_leads,
                'cold_leads': cold_leads,
                'dead_leads': dead_leads,
                'validation_success_rate': round(validation_success_rate, 2)
            }
            
        except Exception as e:
            logger.error(f"Error calculating lead quality metrics: {e}")
            return {}
    
    def _calculate_response_time_metrics(self, vendor_id: int, 
                                       date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Calculate response time metrics for vendor."""
        try:
            # This would typically involve message timestamps
            # For now, we'll return placeholder metrics
            return {
                'average_response_time_hours': 4.5,
                'response_time_breakdown': {
                    'under_1_hour': 25,
                    '1_4_hours': 45,
                    '4_24_hours': 20,
                    'over_24_hours': 10
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating response time metrics: {e}")
            return {}
    
    def _calculate_customer_satisfaction(self, vendor_id: int, 
                                       date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Calculate customer satisfaction metrics."""
        try:
            # This would typically involve customer ratings
            # For now, we'll return placeholder metrics
            return {
                'average_rating': 4.2,
                'total_ratings': 15,
                'rating_breakdown': {
                    '5_star': 8,
                    '4_star': 4,
                    '3_star': 2,
                    '2_star': 1,
                    '1_star': 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating customer satisfaction: {e}")
            return {}
    
    def get_vendor_reputation_score(self, vendor_id: int) -> Dict[str, Any]:
        """
        Calculate vendor reputation score based on multiple factors.
        
        Args:
            vendor_id: Vendor user ID
            
        Returns:
            Dictionary with reputation score and details
        """
        try:
            # Get vendor's leads and sales
            total_leads = self.db.query(Lead).filter(Lead.vendor_id == vendor_id).count()
            sold_leads = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.status == 'sold')
            ).count()
            
            # Calculate base reputation score (0-100)
            base_score = 50  # Starting point
            
            # Factor 1: Sales success rate (0-25 points)
            success_rate = (sold_leads / total_leads * 100) if total_leads > 0 else 0
            success_score = min(success_rate / 4, 25)  # Max 25 points for 100% success rate
            
            # Factor 2: Lead quality (0-25 points)
            avg_lead_score = self.db.query(Lead).filter(Lead.vendor_id == vendor_id).with_entities(
                func.avg(Lead.lead_score)
            ).scalar() or 0
            quality_score = min(avg_lead_score * 0.25, 25)  # Max 25 points for perfect score
            
            # Factor 3: Response time (0-25 points)
            # Placeholder - would be calculated from actual response times
            response_score = 20  # Placeholder
            
            # Factor 4: Customer satisfaction (0-25 points)
            # Placeholder - would be calculated from customer ratings
            satisfaction_score = 18  # Placeholder
            
            # Calculate total reputation score
            total_reputation_score = base_score + success_score + quality_score + response_score + satisfaction_score
            
            # Determine reputation level
            if total_reputation_score >= 90:
                reputation_level = VendorRating.EXCELLENT
            elif total_reputation_score >= 75:
                reputation_level = VendorRating.GOOD
            elif total_reputation_score >= 60:
                reputation_level = VendorRating.AVERAGE
            else:
                reputation_level = VendorRating.POOR
            
            return {
                'total_score': round(total_reputation_score, 2),
                'reputation_level': reputation_level.value,
                'score_breakdown': {
                    'base_score': base_score,
                    'success_score': round(success_score, 2),
                    'quality_score': round(quality_score, 2),
                    'response_score': response_score,
                    'satisfaction_score': satisfaction_score
                },
                'metrics': {
                    'total_leads': total_leads,
                    'sold_leads': sold_leads,
                    'success_rate': round(success_rate, 2),
                    'average_lead_score': round(avg_lead_score, 2)
                },
                'calculated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating vendor reputation score: {e}")
            return {'error': 'Failed to calculate reputation score'}
    
    def get_vendor_dashboard_data(self, vendor_id: int) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data for vendor.
        
        Args:
            vendor_id: Vendor user ID
            
        Returns:
            Dictionary with dashboard data
        """
        try:
            # Get recent activity
            recent_leads = self.db.query(Lead).filter(Lead.vendor_id == vendor_id).order_by(
                desc(Lead.created_at)
            ).limit(5).all()
            
            # Get recent sales
            recent_sales = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.status == 'sold')
            ).order_by(desc(Lead.last_updated)).limit(5).all()
            
            # Get performance trends (last 30 days vs previous 30 days)
            now = datetime.utcnow()
            last_30_days = now - timedelta(days=30)
            previous_30_days = last_30_days - timedelta(days=30)
            
            # Current period metrics
            current_leads = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.created_at >= last_30_days)
            ).count()
            
            current_sales = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.status == 'sold', Lead.last_updated >= last_30_days)
            ).count()
            
            current_revenue = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.status == 'sold', Lead.last_updated >= last_30_days)
            ).with_entities(func.sum(Lead.price)).scalar() or 0.0
            
            # Previous period metrics
            previous_leads = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.created_at >= previous_30_days, Lead.created_at < last_30_days)
            ).count()
            
            previous_sales = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.status == 'sold', 
                     Lead.last_updated >= previous_30_days, Lead.last_updated < last_30_days)
            ).count()
            
            previous_revenue = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.status == 'sold',
                     Lead.last_updated >= previous_30_days, Lead.last_updated < last_30_days)
            ).with_entities(func.sum(Lead.price)).scalar() or 0.0
            
            # Calculate growth percentages
            lead_growth = ((current_leads - previous_leads) / previous_leads * 100) if previous_leads > 0 else 0
            sales_growth = ((current_sales - previous_sales) / previous_sales * 100) if previous_sales > 0 else 0
            revenue_growth = ((current_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
            
            # Get top performing industries
            industry_performance = self.db.query(
                Lead.industry,
                func.count(Lead.id).label('total_leads'),
                func.sum(case([(Lead.status == 'sold', Lead.price)], else_=0)).label('revenue')
            ).filter(Lead.vendor_id == vendor_id).group_by(Lead.industry).order_by(
                desc(func.sum(case([(Lead.status == 'sold', Lead.price)], else_=0)))
            ).limit(5).all()
            
            return {
                'recent_leads': [
                    {
                        'id': lead.id,
                        'title': lead.title,
                        'industry': lead.industry,
                        'price': float(lead.price),
                        'status': lead.status,
                        'created_at': lead.created_at.isoformat() if lead.created_at else None
                    }
                    for lead in recent_leads
                ],
                'recent_sales': [
                    {
                        'id': lead.id,
                        'title': lead.title,
                        'price': float(lead.price),
                        'sold_at': lead.last_updated.isoformat() if lead.last_updated else None
                    }
                    for lead in recent_sales
                ],
                'performance_trends': {
                    'current_period': {
                        'leads': current_leads,
                        'sales': current_sales,
                        'revenue': float(current_revenue)
                    },
                    'previous_period': {
                        'leads': previous_leads,
                        'sales': previous_sales,
                        'revenue': float(previous_revenue)
                    },
                    'growth': {
                        'leads': round(lead_growth, 2),
                        'sales': round(sales_growth, 2),
                        'revenue': round(revenue_growth, 2)
                    }
                },
                'top_industries': [
                    {
                        'industry': item.industry,
                        'total_leads': item.total_leads,
                        'revenue': float(item.revenue or 0)
                    }
                    for item in industry_performance
                ],
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting vendor dashboard data: {e}")
            return {'error': 'Failed to get dashboard data'}
    
    def get_commission_summary(self, vendor_id: int, 
                             date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """
        Get commission summary for vendor.
        
        Args:
            vendor_id: Vendor user ID
            date_range: Optional date range tuple
            
        Returns:
            Dictionary with commission summary
        """
        try:
            # Get sold leads
            sold_leads_query = self.db.query(Lead).filter(
                and_(Lead.vendor_id == vendor_id, Lead.status == 'sold')
            )
            
            if date_range:
                start_date, end_date = date_range
                sold_leads_query = sold_leads_query.filter(
                    and_(Lead.last_updated >= start_date, Lead.last_updated <= end_date)
                )
            
            sold_leads = sold_leads_query.all()
            
            # Calculate commission (assuming 70% commission rate)
            commission_rate = 0.70
            total_revenue = sum(lead.price for lead in sold_leads)
            total_commission = total_revenue * commission_rate
            
            # Get commission breakdown by month
            monthly_commissions = {}
            for lead in sold_leads:
                if lead.last_updated:
                    month_key = lead.last_updated.strftime('%Y-%m')
                    if month_key not in monthly_commissions:
                        monthly_commissions[month_key] = 0
                    monthly_commissions[month_key] += lead.price * commission_rate
            
            return {
                'total_revenue': float(total_revenue),
                'total_commission': float(total_commission),
                'commission_rate': commission_rate,
                'sold_leads_count': len(sold_leads),
                'monthly_breakdown': {
                    month: float(amount) for month, amount in monthly_commissions.items()
                },
                'calculated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating commission summary: {e}")
            return {'error': 'Failed to calculate commission summary'}
