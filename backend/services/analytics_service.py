"""
Advanced Analytics & Reporting Service
====================================

This service provides comprehensive analytics and reporting features including:
- Real-time analytics and dashboards
- Predictive analytics and insights
- Advanced filtering and segmentation
- Custom report generation
- Data visualization support
"""

import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from sqlalchemy import and_, or_, desc, asc, func, case, extract
from sqlalchemy.orm import Session

from models import User, Lead, Purchase, LeadValidation, LeadApproval, Message

logger = logging.getLogger(__name__)


class AnalyticsPeriod(Enum):
    """Analytics time periods"""
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class ReportType(Enum):
    """Report types"""
    LEAD_PERFORMANCE = "lead_performance"
    VENDOR_PERFORMANCE = "vendor_performance"
    CLIENT_ACTIVITY = "client_activity"
    REVENUE_ANALYSIS = "revenue_analysis"
    CONVERSION_FUNNEL = "conversion_funnel"
    MARKET_TRENDS = "market_trends"


@dataclass
class PredictiveInsight:
    """Predictive insight data"""
    insight_type: str
    confidence: float
    prediction: str
    factors: List[str]
    timeframe: str


class AnalyticsService:
    """
    Advanced analytics and reporting service.
    
    Features:
    - Real-time analytics
    - Predictive insights
    - Custom reporting
    - Data visualization
    - Market intelligence
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def get_real_time_analytics(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Get real-time analytics dashboard data.
        
        Args:
            filters: Optional filters to apply
            
        Returns:
            Dictionary with real-time analytics
        """
        try:
            # Base queries
            leads_query = self.db.query(Lead)
            purchases_query = self.db.query(Purchase)
            
            # Apply filters
            if filters:
                if filters.get('date_range'):
                    start_date, end_date = filters['date_range']
                    leads_query = leads_query.filter(
                        and_(Lead.created_at >= start_date, Lead.created_at <= end_date)
                    )
                    purchases_query = purchases_query.filter(
                        and_(Purchase.created_at >= start_date, Purchase.created_at <= end_date)
                    )
                
                if filters.get('industry'):
                    leads_query = leads_query.filter(Lead.industry == filters['industry'])
                
                if filters.get('vendor_id'):
                    leads_query = leads_query.filter(Lead.vendor_id == filters['vendor_id'])
            
            # Calculate key metrics
            total_leads = leads_query.count()
            available_leads = leads_query.filter(Lead.status == 'available').count()
            sold_leads = leads_query.filter(Lead.status == 'sold').count()
            total_revenue = purchases_query.with_entities(func.sum(Purchase.amount)).scalar() or 0.0
            
            # Calculate conversion rate
            conversion_rate = (sold_leads / total_leads * 100) if total_leads > 0 else 0.0
            
            # Get average lead price
            avg_lead_price = leads_query.with_entities(func.avg(Lead.price)).scalar() or 0.0
            
            # Get lead quality distribution
            quality_distribution = self._get_lead_quality_distribution(leads_query)
            
            # Get industry performance
            industry_performance = self._get_industry_performance(leads_query)
            
            # Get recent activity
            recent_activity = self._get_recent_activity()
            
            return {
                'key_metrics': {
                    'total_leads': total_leads,
                    'available_leads': available_leads,
                    'sold_leads': sold_leads,
                    'total_revenue': float(total_revenue),
                    'conversion_rate': round(conversion_rate, 2),
                    'average_lead_price': float(avg_lead_price)
                },
                'quality_distribution': quality_distribution,
                'industry_performance': industry_performance,
                'recent_activity': recent_activity,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting real-time analytics: {e}")
            return {'error': 'Failed to get analytics'}
    
    def _get_lead_quality_distribution(self, leads_query) -> Dict[str, Any]:
        """Get lead quality distribution."""
        try:
            hot_leads = leads_query.filter(Lead.lead_score >= 80).count()
            warm_leads = leads_query.filter(and_(Lead.lead_score >= 60, Lead.lead_score < 80)).count()
            cold_leads = leads_query.filter(and_(Lead.lead_score >= 40, Lead.lead_score < 60)).count()
            dead_leads = leads_query.filter(Lead.lead_score < 40).count()
            
            return {
                'hot': hot_leads,
                'warm': warm_leads,
                'cold': cold_leads,
                'dead': dead_leads
            }
        except Exception as e:
            logger.error(f"Error getting lead quality distribution: {e}")
            return {}
    
    def _get_industry_performance(self, leads_query) -> List[Dict[str, Any]]:
        """Get industry performance metrics."""
        try:
            industry_stats = self.db.query(
                Lead.industry,
                func.count(Lead.id).label('total_leads'),
                func.sum(case([(Lead.status == 'sold', Lead.price)], else_=0)).label('revenue'),
                func.avg(Lead.lead_score).label('avg_score')
            ).group_by(Lead.industry).order_by(
                desc(func.sum(case([(Lead.status == 'sold', Lead.price)], else_=0)))
            ).limit(10).all()
            
            return [
                {
                    'industry': item.industry,
                    'total_leads': item.total_leads,
                    'revenue': float(item.revenue or 0),
                    'average_score': float(item.avg_score or 0)
                }
                for item in industry_stats
            ]
        except Exception as e:
            logger.error(f"Error getting industry performance: {e}")
            return []
    
    def _get_recent_activity(self) -> List[Dict[str, Any]]:
        """Get recent platform activity."""
        try:
            # Get recent leads
            recent_leads = self.db.query(Lead).order_by(desc(Lead.created_at)).limit(5).all()
            
            # Get recent purchases
            recent_purchases = self.db.query(Purchase).order_by(desc(Purchase.created_at)).limit(5).all()
            
            activities = []
            
            # Add lead activities
            for lead in recent_leads:
                activities.append({
                    'type': 'lead_created',
                    'title': lead.title,
                    'industry': lead.industry,
                    'price': float(lead.price),
                    'timestamp': lead.created_at.isoformat() if lead.created_at else None
                })
            
            # Add purchase activities
            for purchase in recent_purchases:
                lead = self.db.query(Lead).filter(Lead.id == purchase.lead_id).first()
                if lead:
                    activities.append({
                        'type': 'lead_purchased',
                        'title': lead.title,
                        'amount': float(purchase.amount),
                        'timestamp': purchase.created_at.isoformat() if purchase.created_at else None
                    })
            
            # Sort by timestamp and return top 10
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            return activities[:10]
            
        except Exception as e:
            logger.error(f"Error getting recent activity: {e}")
            return []
    
    def get_predictive_insights(self, user_id: int = None, user_role: str = None) -> List[PredictiveInsight]:
        """
        Get predictive insights based on data analysis.
        
        Args:
            user_id: Optional user ID for personalized insights
            user_role: User role for role-specific insights
            
        Returns:
            List of predictive insights
        """
        try:
            insights = []
            
            # Get overall platform data
            total_leads = self.db.query(Lead).count()
            sold_leads = self.db.query(Lead).filter(Lead.status == 'sold').count()
            total_revenue = self.db.query(Purchase).with_entities(func.sum(Purchase.amount)).scalar() or 0.0
            
            # Insight 1: Conversion rate trend
            if total_leads > 0:
                conversion_rate = (sold_leads / total_leads) * 100
                if conversion_rate < 15:
                    insights.append(PredictiveInsight(
                        insight_type="conversion_optimization",
                        confidence=0.85,
                        prediction="Low conversion rate detected. Consider improving lead quality and follow-up processes.",
                        factors=["Conversion rate below 15%", "Lead quality metrics", "Follow-up timing"],
                        timeframe="30 days"
                    ))
            
            # Insight 2: Revenue prediction
            if total_revenue > 0:
                # Simple linear prediction based on current trend
                avg_revenue_per_lead = total_revenue / sold_leads if sold_leads > 0 else 0
                predicted_revenue = avg_revenue_per_lead * (total_leads - sold_leads) * 0.15  # 15% conversion rate
                
                insights.append(PredictiveInsight(
                    insight_type="revenue_forecast",
                    confidence=0.75,
                    prediction=f"Potential revenue from current leads: ${predicted_revenue:.2f}",
                    factors=["Current lead inventory", "Historical conversion rate", "Average lead value"],
                    timeframe="90 days"
                ))
            
            # Insight 3: Industry performance
            industry_performance = self.db.query(
                Lead.industry,
                func.count(Lead.id).label('total'),
                func.sum(case([(Lead.status == 'sold', 1)], else_=0)).label('sold')
            ).group_by(Lead.industry).having(func.count(Lead.id) >= 5).all()
            
            for industry, total, sold in industry_performance:
                if total > 0:
                    industry_conversion = (sold / total) * 100
                    if industry_conversion > 25:
                        insights.append(PredictiveInsight(
                            insight_type="high_performing_industry",
                            confidence=0.90,
                            prediction=f"{industry} shows excellent conversion rate ({industry_conversion:.1f}%). Focus on this industry.",
                            factors=[f"{industry} conversion rate", "Industry demand", "Lead quality"],
                            timeframe="60 days"
                        ))
            
            # Role-specific insights
            if user_role == "vendor":
                vendor_insights = self._get_vendor_specific_insights(user_id)
                insights.extend(vendor_insights)
            elif user_role == "client":
                client_insights = self._get_client_specific_insights(user_id)
                insights.extend(client_insights)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting predictive insights: {e}")
            return []
    
    def _get_vendor_specific_insights(self, vendor_id: int) -> List[PredictiveInsight]:
        """Get vendor-specific predictive insights."""
        try:
            insights = []
            
            if not vendor_id:
                return insights
            
            # Get vendor's performance
            vendor_leads = self.db.query(Lead).filter(Lead.vendor_id == vendor_id)
            total_vendor_leads = vendor_leads.count()
            sold_vendor_leads = vendor_leads.filter(Lead.status == 'sold').count()
            
            if total_vendor_leads > 0:
                vendor_conversion = (sold_vendor_leads / total_vendor_leads) * 100
                
                if vendor_conversion < 10:
                    insights.append(PredictiveInsight(
                        insight_type="vendor_performance",
                        confidence=0.80,
                        prediction="Your conversion rate is below average. Consider improving lead quality and pricing strategy.",
                        factors=["Low conversion rate", "Lead quality", "Pricing strategy"],
                        timeframe="45 days"
                    ))
                
                # Price optimization insight
                avg_price = vendor_leads.with_entities(func.avg(Lead.price)).scalar() or 0
                if avg_price < 100:
                    insights.append(PredictiveInsight(
                        insight_type="pricing_optimization",
                        confidence=0.70,
                        prediction="Consider increasing lead prices. Higher-priced leads often convert better.",
                        factors=["Average lead price", "Market pricing", "Quality perception"],
                        timeframe="30 days"
                    ))
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting vendor insights: {e}")
            return []
    
    def _get_client_specific_insights(self, client_id: int) -> List[PredictiveInsight]:
        """Get client-specific predictive insights."""
        try:
            insights = []
            
            if not client_id:
                return insights
            
            # Get client's purchase history
            client_purchases = self.db.query(Purchase).filter(Purchase.buyer_id == client_id)
            total_spent = client_purchases.with_entities(func.sum(Purchase.amount)).scalar() or 0
            purchase_count = client_purchases.count()
            
            if purchase_count > 0:
                avg_purchase = total_spent / purchase_count
                
                insights.append(PredictiveInsight(
                    insight_type="client_spending_pattern",
                    confidence=0.85,
                    prediction=f"Your average lead purchase is ${avg_purchase:.2f}. Consider diversifying your lead portfolio.",
                    factors=["Purchase history", "Spending patterns", "Lead diversity"],
                    timeframe="60 days"
                ))
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting client insights: {e}")
            return []
    
    def generate_custom_report(self, report_type: str, filters: Dict[str, Any], 
                             date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """
        Generate custom report based on type and filters.
        
        Args:
            report_type: Type of report to generate
            filters: Report filters
            date_range: Optional date range
            
        Returns:
            Dictionary with report data
        """
        try:
            if report_type == ReportType.LEAD_PERFORMANCE.value:
                return self._generate_lead_performance_report(filters, date_range)
            elif report_type == ReportType.VENDOR_PERFORMANCE.value:
                return self._generate_vendor_performance_report(filters, date_range)
            elif report_type == ReportType.REVENUE_ANALYSIS.value:
                return self._generate_revenue_analysis_report(filters, date_range)
            elif report_type == ReportType.CONVERSION_FUNNEL.value:
                return self._generate_conversion_funnel_report(filters, date_range)
            else:
                return {'error': 'Invalid report type'}
                
        except Exception as e:
            logger.error(f"Error generating custom report: {e}")
            return {'error': 'Failed to generate report'}
    
    def _generate_lead_performance_report(self, filters: Dict[str, Any], 
                                        date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Generate lead performance report."""
        try:
            query = self.db.query(Lead)
            
            # Apply date range
            if date_range:
                start_date, end_date = date_range
                query = query.filter(
                    and_(Lead.created_at >= start_date, Lead.created_at <= end_date)
                )
            
            # Apply filters
            if filters.get('industry'):
                query = query.filter(Lead.industry == filters['industry'])
            if filters.get('vendor_id'):
                query = query.filter(Lead.vendor_id == filters['vendor_id'])
            
            # Get lead statistics
            total_leads = query.count()
            available_leads = query.filter(Lead.status == 'available').count()
            sold_leads = query.filter(Lead.status == 'sold').count()
            avg_price = query.with_entities(func.avg(Lead.price)).scalar() or 0
            avg_score = query.with_entities(func.avg(Lead.lead_score)).scalar() or 0
            
            # Get performance by industry
            industry_stats = self.db.query(
                Lead.industry,
                func.count(Lead.id).label('total'),
                func.sum(case([(Lead.status == 'sold', 1)], else_=0)).label('sold'),
                func.avg(Lead.price).label('avg_price')
            ).group_by(Lead.industry).all()
            
            return {
                'report_type': 'lead_performance',
                'summary': {
                    'total_leads': total_leads,
                    'available_leads': available_leads,
                    'sold_leads': sold_leads,
                    'conversion_rate': round((sold_leads / total_leads * 100), 2) if total_leads > 0 else 0,
                    'average_price': float(avg_price),
                    'average_score': float(avg_score)
                },
                'industry_breakdown': [
                    {
                        'industry': item.industry,
                        'total': item.total,
                        'sold': item.sold,
                        'conversion_rate': round((item.sold / item.total * 100), 2) if item.total > 0 else 0,
                        'average_price': float(item.avg_price or 0)
                    }
                    for item in industry_stats
                ],
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating lead performance report: {e}")
            return {'error': 'Failed to generate lead performance report'}
    
    def _generate_vendor_performance_report(self, filters: Dict[str, Any], 
                                          date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Generate vendor performance report."""
        try:
            # Get vendor statistics
            vendor_stats = self.db.query(
                User.id,
                User.email,
                func.count(Lead.id).label('total_leads'),
                func.sum(case([(Lead.status == 'sold', 1)], else_=0)).label('sold_leads'),
                func.avg(Lead.price).label('avg_price'),
                func.avg(Lead.lead_score).label('avg_score')
            ).join(Lead, User.id == Lead.vendor_id).filter(User.role == 'vendor')
            
            # Apply date range
            if date_range:
                start_date, end_date = date_range
                vendor_stats = vendor_stats.filter(
                    and_(Lead.created_at >= start_date, Lead.created_at <= end_date)
                )
            
            vendor_stats = vendor_stats.group_by(User.id, User.email).all()
            
            return {
                'report_type': 'vendor_performance',
                'vendors': [
                    {
                        'vendor_id': item.id,
                        'email': item.email,
                        'total_leads': item.total_leads,
                        'sold_leads': item.sold_leads,
                        'conversion_rate': round((item.sold_leads / item.total_leads * 100), 2) if item.total_leads > 0 else 0,
                        'average_price': float(item.avg_price or 0),
                        'average_score': float(item.avg_score or 0)
                    }
                    for item in vendor_stats
                ],
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating vendor performance report: {e}")
            return {'error': 'Failed to generate vendor performance report'}
    
    def _generate_revenue_analysis_report(self, filters: Dict[str, Any], 
                                        date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Generate revenue analysis report."""
        try:
            # Get revenue data
            revenue_query = self.db.query(Purchase)
            
            # Apply date range
            if date_range:
                start_date, end_date = date_range
                revenue_query = revenue_query.filter(
                    and_(Purchase.created_at >= start_date, Purchase.created_at <= end_date)
                )
            
            # Get total revenue
            total_revenue = revenue_query.with_entities(func.sum(Purchase.amount)).scalar() or 0
            
            # Get revenue by month
            monthly_revenue = self.db.query(
                extract('year', Purchase.created_at).label('year'),
                extract('month', Purchase.created_at).label('month'),
                func.sum(Purchase.amount).label('revenue')
            ).group_by(
                extract('year', Purchase.created_at),
                extract('month', Purchase.created_at)
            ).order_by(
                extract('year', Purchase.created_at),
                extract('month', Purchase.created_at)
            ).all()
            
            return {
                'report_type': 'revenue_analysis',
                'summary': {
                    'total_revenue': float(total_revenue),
                    'total_transactions': revenue_query.count()
                },
                'monthly_breakdown': [
                    {
                        'year': int(item.year),
                        'month': int(item.month),
                        'revenue': float(item.revenue or 0)
                    }
                    for item in monthly_revenue
                ],
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating revenue analysis report: {e}")
            return {'error': 'Failed to generate revenue analysis report'}
    
    def _generate_conversion_funnel_report(self, filters: Dict[str, Any], 
                                         date_range: Optional[Tuple[datetime, datetime]] = None) -> Dict[str, Any]:
        """Generate conversion funnel report."""
        try:
            # Get funnel data
            total_leads = self.db.query(Lead).count()
            viewed_leads = total_leads  # Assuming all leads are viewed
            inquired_leads = self.db.query(Message).filter(Message.message_type == 'inquiry').count()
            purchased_leads = self.db.query(Lead).filter(Lead.status == 'sold').count()
            
            # Calculate conversion rates
            view_to_inquiry = (inquired_leads / viewed_leads * 100) if viewed_leads > 0 else 0
            inquiry_to_purchase = (purchased_leads / inquired_leads * 100) if inquired_leads > 0 else 0
            overall_conversion = (purchased_leads / total_leads * 100) if total_leads > 0 else 0
            
            return {
                'report_type': 'conversion_funnel',
                'funnel_stages': [
                    {
                        'stage': 'Total Leads',
                        'count': total_leads,
                        'conversion_rate': 100.0
                    },
                    {
                        'stage': 'Viewed',
                        'count': viewed_leads,
                        'conversion_rate': 100.0
                    },
                    {
                        'stage': 'Inquired',
                        'count': inquired_leads,
                        'conversion_rate': round(view_to_inquiry, 2)
                    },
                    {
                        'stage': 'Purchased',
                        'count': purchased_leads,
                        'conversion_rate': round(overall_conversion, 2)
                    }
                ],
                'summary': {
                    'view_to_inquiry_rate': round(view_to_inquiry, 2),
                    'inquiry_to_purchase_rate': round(inquiry_to_purchase, 2),
                    'overall_conversion_rate': round(overall_conversion, 2)
                },
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating conversion funnel report: {e}")
            return {'error': 'Failed to generate conversion funnel report'}
