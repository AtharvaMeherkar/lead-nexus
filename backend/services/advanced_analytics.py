"""
Advanced Analytics & Reporting Service
=====================================

This module provides comprehensive analytics, reporting, and insights for the Lead-Nexus platform.
It includes real-time dashboards, predictive analytics, and advanced filtering capabilities.

Features:
- Real-time analytics dashboards
- Predictive lead quality assessment
- Advanced filtering and search
- Export functionality for reports
- Custom dashboard widgets
- Performance metrics and KPIs
"""

import json
import csv
import io
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.orm import Session

from models import Lead, User, Purchase, LeadValidation, LeadApproval
from services.lead_scoring import score_lead, get_lead_quality_insights

logger = logging.getLogger(__name__)


class AnalyticsPeriod(Enum):
    """Analytics time periods"""
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


@dataclass
class AnalyticsMetrics:
    """Analytics metrics container"""
    total_leads: int
    total_revenue: float
    conversion_rate: float
    average_lead_price: float
    top_industries: List[Dict[str, Any]]
    top_locations: List[Dict[str, Any]]
    quality_distribution: Dict[str, int]
    performance_trends: List[Dict[str, Any]]


class AdvancedAnalyticsService:
    """
    Advanced analytics service providing comprehensive insights and reporting.
    
    This service offers:
    - Real-time performance metrics
    - Predictive analytics
    - Advanced filtering capabilities
    - Export functionality
    - Custom dashboard widgets
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def get_vendor_analytics(self, vendor_id: int, period: AnalyticsPeriod = AnalyticsPeriod.MONTH) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a vendor.
        
        Args:
            vendor_id: Vendor user ID
            period: Analytics time period
            
        Returns:
            Dictionary with vendor analytics data
        """
        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = self._get_start_date(end_date, period)
            
            # Basic metrics
            total_leads = self._get_vendor_leads_count(vendor_id, start_date, end_date)
            total_revenue = self._get_vendor_revenue(vendor_id, start_date, end_date)
            conversion_rate = self._get_vendor_conversion_rate(vendor_id, start_date, end_date)
            average_price = self._get_vendor_average_price(vendor_id, start_date, end_date)
            
            # Advanced metrics
            industry_breakdown = self._get_vendor_industry_breakdown(vendor_id, start_date, end_date)
            quality_metrics = self._get_vendor_quality_metrics(vendor_id, start_date, end_date)
            performance_trends = self._get_vendor_performance_trends(vendor_id, period)
            
            # Predictive insights
            predictive_insights = self._get_predictive_insights(vendor_id)
            
            return {
                'period': period.value,
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat()
                },
                'metrics': {
                    'total_leads': total_leads,
                    'total_revenue': round(total_revenue, 2),
                    'conversion_rate': round(conversion_rate * 100, 2),
                    'average_price': round(average_price, 2),
                    'leads_per_day': round(total_leads / max((end_date - start_date).days, 1), 2),
                    'revenue_per_lead': round(total_revenue / max(total_leads, 1), 2)
                },
                'industry_breakdown': industry_breakdown,
                'quality_metrics': quality_metrics,
                'performance_trends': performance_trends,
                'predictive_insights': predictive_insights,
                'recommendations': self._generate_vendor_recommendations(
                    total_leads, conversion_rate, average_price, quality_metrics
                )
            }
            
        except Exception as e:
            logger.error(f"Error getting vendor analytics: {e}")
            return {'error': 'Failed to generate analytics'}
    
    def get_client_analytics(self, client_id: int, period: AnalyticsPeriod = AnalyticsPeriod.MONTH) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a client.
        
        Args:
            client_id: Client user ID
            period: Analytics time period
            
        Returns:
            Dictionary with client analytics data
        """
        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = self._get_start_date(end_date, period)
            
            # Basic metrics
            total_purchases = self._get_client_purchases_count(client_id, start_date, end_date)
            total_spent = self._get_client_total_spent(client_id, start_date, end_date)
            average_purchase_value = self._get_client_average_purchase_value(client_id, start_date, end_date)
            
            # Advanced metrics
            industry_preferences = self._get_client_industry_preferences(client_id, start_date, end_date)
            purchase_patterns = self._get_client_purchase_patterns(client_id, start_date, end_date)
            roi_metrics = self._get_client_roi_metrics(client_id, start_date, end_date)
            
            # Predictive insights
            predictive_insights = self._get_client_predictive_insights(client_id)
            
            return {
                'period': period.value,
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat()
                },
                'metrics': {
                    'total_purchases': total_purchases,
                    'total_spent': round(total_spent, 2),
                    'average_purchase_value': round(average_purchase_value, 2),
                    'purchases_per_month': round(total_purchases / max((end_date - start_date).days / 30, 1), 2),
                    'spending_per_month': round(total_spent / max((end_date - start_date).days / 30, 1), 2)
                },
                'industry_preferences': industry_preferences,
                'purchase_patterns': purchase_patterns,
                'roi_metrics': roi_metrics,
                'predictive_insights': predictive_insights,
                'recommendations': self._generate_client_recommendations(
                    total_purchases, total_spent, average_purchase_value, industry_preferences
                )
            }
            
        except Exception as e:
            logger.error(f"Error getting client analytics: {e}")
            return {'error': 'Failed to generate analytics'}
    
    def get_platform_analytics(self, period: AnalyticsPeriod = AnalyticsPeriod.MONTH) -> Dict[str, Any]:
        """
        Get comprehensive platform-wide analytics.
        
        Args:
            period: Analytics time period
            
        Returns:
            Dictionary with platform analytics data
        """
        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = self._get_start_date(end_date, period)
            
            # Platform metrics
            total_leads = self._get_platform_leads_count(start_date, end_date)
            total_revenue = self._get_platform_revenue(start_date, end_date)
            total_users = self._get_platform_users_count(start_date, end_date)
            conversion_rate = self._get_platform_conversion_rate(start_date, end_date)
            
            # Advanced metrics
            top_industries = self._get_platform_top_industries(start_date, end_date)
            top_locations = self._get_platform_top_locations(start_date, end_date)
            quality_distribution = self._get_platform_quality_distribution(start_date, end_date)
            performance_trends = self._get_platform_performance_trends(period)
            
            return {
                'period': period.value,
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat()
                },
                'metrics': {
                    'total_leads': total_leads,
                    'total_revenue': round(total_revenue, 2),
                    'total_users': total_users,
                    'conversion_rate': round(conversion_rate * 100, 2),
                    'average_lead_price': round(total_revenue / max(total_leads, 1), 2),
                    'leads_per_day': round(total_leads / max((end_date - start_date).days, 1), 2),
                    'revenue_per_day': round(total_revenue / max((end_date - start_date).days, 1), 2)
                },
                'top_industries': top_industries,
                'top_locations': top_locations,
                'quality_distribution': quality_distribution,
                'performance_trends': performance_trends,
                'growth_metrics': self._get_platform_growth_metrics(start_date, end_date)
            }
            
        except Exception as e:
            logger.error(f"Error getting platform analytics: {e}")
            return {'error': 'Failed to generate analytics'}
    
    def export_analytics_report(self, user_id: int, user_role: str, period: AnalyticsPeriod, 
                               format_type: str = 'csv') -> Tuple[str, bytes]:
        """
        Export analytics report in specified format.
        
        Args:
            user_id: User ID
            user_role: User role (vendor/client/admin)
            period: Analytics period
            format_type: Export format (csv/json)
            
        Returns:
            Tuple of (filename, file_content)
        """
        try:
            # Get analytics data
            if user_role == 'vendor':
                data = self.get_vendor_analytics(user_id, period)
            elif user_role == 'client':
                data = self.get_client_analytics(user_id, period)
            else:
                data = self.get_platform_analytics(period)
            
            # Generate filename
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"{user_role}_analytics_{period.value}_{timestamp}.{format_type}"
            
            # Export in specified format
            if format_type == 'csv':
                file_content = self._export_to_csv(data)
            elif format_type == 'json':
                file_content = json.dumps(data, indent=2, default=str).encode('utf-8')
            else:
                raise ValueError(f"Unsupported format: {format_type}")
            
            return filename, file_content
            
        except Exception as e:
            logger.error(f"Error exporting analytics report: {e}")
            raise
    
    def get_advanced_filters(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Apply advanced filters to leads.
        
        Args:
            filters: Dictionary of filter criteria
            
        Returns:
            List of filtered leads with scores
        """
        try:
            # Build query
            query = self.db.query(Lead)
            
            # Apply filters
            if filters.get('industry'):
                query = query.filter(Lead.industry.ilike(f"%{filters['industry']}%"))
            
            if filters.get('min_price'):
                query = query.filter(Lead.price >= filters['min_price'])
            
            if filters.get('max_price'):
                query = query.filter(Lead.price <= filters['max_price'])
            
            if filters.get('location'):
                query = query.filter(Lead.extra['location'].astext.ilike(f"%{filters['location']}%"))
            
            if filters.get('min_employee_count'):
                query = query.filter(Lead.extra['employee_count'].astext.cast(int) >= filters['min_employee_count'])
            
            if filters.get('max_employee_count'):
                query = query.filter(Lead.extra['employee_count'].astext.cast(int) <= filters['max_employee_count'])
            
            if filters.get('min_revenue'):
                query = query.filter(Lead.extra['annual_revenue'].astext.cast(float) >= filters['min_revenue'])
            
            if filters.get('max_revenue'):
                query = query.filter(Lead.extra['annual_revenue'].astext.cast(float) <= filters['max_revenue'])
            
            if filters.get('quality_grade'):
                # Apply quality scoring filter
                leads = query.all()
                scored_leads = []
                for lead in leads:
                    lead_data = self._lead_to_dict(lead)
                    score_result = score_lead(lead_data)
                    if score_result.quality_grade == filters['quality_grade']:
                        scored_leads.append({
                            'lead': lead_data,
                            'score': score_result.overall_score,
                            'grade': score_result.quality_grade,
                            'conversion_probability': score_result.conversion_probability
                        })
                return scored_leads
            
            # Get leads and apply scoring
            leads = query.all()
            scored_leads = []
            
            for lead in leads:
                lead_data = self._lead_to_dict(lead)
                score_result = score_lead(lead_data)
                
                scored_leads.append({
                    'lead': lead_data,
                    'score': score_result.overall_score,
                    'grade': score_result.quality_grade,
                    'conversion_probability': score_result.conversion_probability,
                    'insights': get_lead_quality_insights(lead_data)
                })
            
            # Sort by score if requested
            if filters.get('sort_by') == 'score':
                scored_leads.sort(key=lambda x: x['score'], reverse=True)
            elif filters.get('sort_by') == 'price':
                scored_leads.sort(key=lambda x: x['lead']['price'], reverse=True)
            elif filters.get('sort_by') == 'date':
                scored_leads.sort(key=lambda x: x['lead']['created_at'], reverse=True)
            
            return scored_leads
            
        except Exception as e:
            logger.error(f"Error applying advanced filters: {e}")
            return []
    
    # Helper methods for analytics calculations
    def _get_start_date(self, end_date: datetime, period: AnalyticsPeriod) -> datetime:
        """Calculate start date based on period."""
        if period == AnalyticsPeriod.DAY:
            return end_date - timedelta(days=1)
        elif period == AnalyticsPeriod.WEEK:
            return end_date - timedelta(weeks=1)
        elif period == AnalyticsPeriod.MONTH:
            return end_date - timedelta(days=30)
        elif period == AnalyticsPeriod.QUARTER:
            return end_date - timedelta(days=90)
        elif period == AnalyticsPeriod.YEAR:
            return end_date - timedelta(days=365)
        else:
            return end_date - timedelta(days=30)
    
    def _get_vendor_leads_count(self, vendor_id: int, start_date: datetime, end_date: datetime) -> int:
        """Get vendor leads count for period."""
        return self.db.query(Lead).filter(
            and_(
                Lead.vendor_id == vendor_id,
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).count()
    
    def _get_vendor_revenue(self, vendor_id: int, start_date: datetime, end_date: datetime) -> float:
        """Get vendor revenue for period."""
        result = self.db.query(func.sum(Purchase.amount)).join(Lead).filter(
            and_(
                Lead.vendor_id == vendor_id,
                Purchase.created_at >= start_date,
                Purchase.created_at <= end_date
            )
        ).scalar()
        return float(result or 0)
    
    def _get_vendor_conversion_rate(self, vendor_id: int, start_date: datetime, end_date: datetime) -> float:
        """Get vendor conversion rate for period."""
        total_leads = self._get_vendor_leads_count(vendor_id, start_date, end_date)
        sold_leads = self.db.query(Lead).filter(
            and_(
                Lead.vendor_id == vendor_id,
                Lead.status == 'sold',
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).count()
        
        return sold_leads / max(total_leads, 1)
    
    def _get_vendor_average_price(self, vendor_id: int, start_date: datetime, end_date: datetime) -> float:
        """Get vendor average lead price for period."""
        result = self.db.query(func.avg(Lead.price)).filter(
            and_(
                Lead.vendor_id == vendor_id,
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).scalar()
        return float(result or 0)
    
    def _get_vendor_industry_breakdown(self, vendor_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get vendor industry breakdown for period."""
        results = self.db.query(
            Lead.industry,
            func.count(Lead.id).label('count'),
            func.avg(Lead.price).label('avg_price'),
            func.sum(Purchase.amount).label('total_revenue')
        ).outerjoin(Purchase).filter(
            and_(
                Lead.vendor_id == vendor_id,
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).group_by(Lead.industry).order_by(desc('count')).limit(10).all()
        
        return [
            {
                'industry': result.industry,
                'count': result.count,
                'avg_price': round(float(result.avg_price or 0), 2),
                'total_revenue': round(float(result.total_revenue or 0), 2)
            }
            for result in results
        ]
    
    def _get_vendor_quality_metrics(self, vendor_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get vendor quality metrics for period."""
        leads = self.db.query(Lead).filter(
            and_(
                Lead.vendor_id == vendor_id,
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).all()
        
        quality_grades = {'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'D': 0}
        total_score = 0
        
        for lead in leads:
            lead_data = self._lead_to_dict(lead)
            score_result = score_lead(lead_data)
            quality_grades[score_result.quality_grade] += 1
            total_score += score_result.overall_score
        
        return {
            'quality_distribution': quality_grades,
            'average_score': round(total_score / max(len(leads), 1), 3),
            'high_quality_leads': quality_grades['A+'] + quality_grades['A'] + quality_grades['A-']
        }
    
    def _get_vendor_performance_trends(self, vendor_id: int, period: AnalyticsPeriod) -> List[Dict[str, Any]]:
        """Get vendor performance trends."""
        # Implementation for trend analysis
        return []
    
    def _get_predictive_insights(self, vendor_id: int) -> Dict[str, Any]:
        """Get predictive insights for vendor."""
        # Implementation for predictive analytics
        return {
            'predicted_revenue_next_month': 0,
            'recommended_lead_price': 0,
            'best_performing_industries': [],
            'growth_opportunities': []
        }
    
    def _get_client_purchases_count(self, client_id: int, start_date: datetime, end_date: datetime) -> int:
        """Get client purchases count for period."""
        return self.db.query(Purchase).filter(
            and_(
                Purchase.buyer_id == client_id,
                Purchase.created_at >= start_date,
                Purchase.created_at <= end_date
            )
        ).count()
    
    def _get_client_total_spent(self, client_id: int, start_date: datetime, end_date: datetime) -> float:
        """Get client total spent for period."""
        result = self.db.query(func.sum(Purchase.amount)).filter(
            and_(
                Purchase.buyer_id == client_id,
                Purchase.created_at >= start_date,
                Purchase.created_at <= end_date
            )
        ).scalar()
        return float(result or 0)
    
    def _get_client_average_purchase_value(self, client_id: int, start_date: datetime, end_date: datetime) -> float:
        """Get client average purchase value for period."""
        result = self.db.query(func.avg(Purchase.amount)).filter(
            and_(
                Purchase.buyer_id == client_id,
                Purchase.created_at >= start_date,
                Purchase.created_at <= end_date
            )
        ).scalar()
        return float(result or 0)
    
    def _get_client_industry_preferences(self, client_id: int, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get client industry preferences for period."""
        results = self.db.query(
            Lead.industry,
            func.count(Purchase.id).label('purchases'),
            func.sum(Purchase.amount).label('total_spent'),
            func.avg(Purchase.amount).label('avg_spent')
        ).join(Purchase).filter(
            and_(
                Purchase.buyer_id == client_id,
                Purchase.created_at >= start_date,
                Purchase.created_at <= end_date
            )
        ).group_by(Lead.industry).order_by(desc('purchases')).limit(10).all()
        
        return [
            {
                'industry': result.industry,
                'purchases': result.purchases,
                'total_spent': round(float(result.total_spent or 0), 2),
                'avg_spent': round(float(result.avg_spent or 0), 2)
            }
            for result in results
        ]
    
    def _get_client_purchase_patterns(self, client_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get client purchase patterns for period."""
        # Implementation for purchase pattern analysis
        return {
            'preferred_days': [],
            'preferred_times': [],
            'purchase_frequency': 0,
            'seasonal_trends': []
        }
    
    def _get_client_roi_metrics(self, client_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get client ROI metrics for period."""
        # Implementation for ROI calculation
        return {
            'total_roi': 0,
            'average_roi_per_lead': 0,
            'best_performing_leads': [],
            'roi_by_industry': []
        }
    
    def _get_client_predictive_insights(self, client_id: int) -> Dict[str, Any]:
        """Get predictive insights for client."""
        # Implementation for client predictive analytics
        return {
            'predicted_spending_next_month': 0,
            'recommended_lead_types': [],
            'optimal_purchase_timing': [],
            'budget_optimization': []
        }
    
    def _get_platform_leads_count(self, start_date: datetime, end_date: datetime) -> int:
        """Get platform total leads count for period."""
        return self.db.query(Lead).filter(
            and_(
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).count()
    
    def _get_platform_revenue(self, start_date: datetime, end_date: datetime) -> float:
        """Get platform total revenue for period."""
        result = self.db.query(func.sum(Purchase.amount)).filter(
            and_(
                Purchase.created_at >= start_date,
                Purchase.created_at <= end_date
            )
        ).scalar()
        return float(result or 0)
    
    def _get_platform_users_count(self, start_date: datetime, end_date: datetime) -> int:
        """Get platform total users count for period."""
        return self.db.query(User).filter(
            and_(
                User.created_at >= start_date,
                User.created_at <= end_date
            )
        ).count()
    
    def _get_platform_conversion_rate(self, start_date: datetime, end_date: datetime) -> float:
        """Get platform conversion rate for period."""
        total_leads = self._get_platform_leads_count(start_date, end_date)
        sold_leads = self.db.query(Lead).filter(
            and_(
                Lead.status == 'sold',
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).count()
        
        return sold_leads / max(total_leads, 1)
    
    def _get_platform_top_industries(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get platform top industries for period."""
        results = self.db.query(
            Lead.industry,
            func.count(Lead.id).label('count'),
            func.avg(Lead.price).label('avg_price'),
            func.sum(Purchase.amount).label('total_revenue')
        ).outerjoin(Purchase).filter(
            and_(
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).group_by(Lead.industry).order_by(desc('count')).limit(10).all()
        
        return [
            {
                'industry': result.industry,
                'count': result.count,
                'avg_price': round(float(result.avg_price or 0), 2),
                'total_revenue': round(float(result.total_revenue or 0), 2)
            }
            for result in results
        ]
    
    def _get_platform_top_locations(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get platform top locations for period."""
        # Implementation for location analysis
        return []
    
    def _get_platform_quality_distribution(self, start_date: datetime, end_date: datetime) -> Dict[str, int]:
        """Get platform quality distribution for period."""
        leads = self.db.query(Lead).filter(
            and_(
                Lead.created_at >= start_date,
                Lead.created_at <= end_date
            )
        ).all()
        
        quality_grades = {'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'D': 0}
        
        for lead in leads:
            lead_data = self._lead_to_dict(lead)
            score_result = score_lead(lead_data)
            quality_grades[score_result.quality_grade] += 1
        
        return quality_grades
    
    def _get_platform_performance_trends(self, period: AnalyticsPeriod) -> List[Dict[str, Any]]:
        """Get platform performance trends."""
        # Implementation for trend analysis
        return []
    
    def _get_platform_growth_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get platform growth metrics."""
        # Implementation for growth analysis
        return {
            'user_growth_rate': 0,
            'revenue_growth_rate': 0,
            'lead_growth_rate': 0,
            'conversion_growth_rate': 0
        }
    
    def _generate_vendor_recommendations(self, total_leads: int, conversion_rate: float, 
                                       average_price: float, quality_metrics: Dict[str, Any]) -> List[str]:
        """Generate recommendations for vendor."""
        recommendations = []
        
        if total_leads < 10:
            recommendations.append("Consider uploading more leads to increase your marketplace presence")
        
        if conversion_rate < 0.1:
            recommendations.append("Your conversion rate is low - consider adjusting lead pricing or improving lead quality")
        
        if average_price < 50:
            recommendations.append("Your average lead price is below market - consider premium pricing for high-quality leads")
        
        if quality_metrics.get('high_quality_leads', 0) < total_leads * 0.3:
            recommendations.append("Focus on uploading higher-quality leads to improve your vendor rating")
        
        return recommendations
    
    def _generate_client_recommendations(self, total_purchases: int, total_spent: float,
                                       average_purchase_value: float, industry_preferences: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations for client."""
        recommendations = []
        
        if total_purchases < 5:
            recommendations.append("Start with smaller purchases to test lead quality before larger investments")
        
        if average_purchase_value < 100:
            recommendations.append("Consider higher-value leads for better ROI potential")
        
        if len(industry_preferences) < 3:
            recommendations.append("Diversify your lead portfolio across different industries")
        
        return recommendations
    
    def _export_to_csv(self, data: Dict[str, Any]) -> bytes:
        """Export analytics data to CSV format."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write metrics
        writer.writerow(['Metric', 'Value'])
        for key, value in data.get('metrics', {}).items():
            writer.writerow([key.replace('_', ' ').title(), value])
        
        # Write industry breakdown
        if 'industry_breakdown' in data:
            writer.writerow([])
            writer.writerow(['Industry Breakdown'])
            writer.writerow(['Industry', 'Count', 'Avg Price', 'Total Revenue'])
            for industry in data['industry_breakdown']:
                writer.writerow([
                    industry['industry'],
                    industry['count'],
                    industry['avg_price'],
                    industry['total_revenue']
                ])
        
        return output.getvalue().encode('utf-8')
    
    def _lead_to_dict(self, lead: Lead) -> Dict[str, Any]:
        """Convert Lead model to dictionary."""
        return {
            'id': lead.id,
            'title': lead.title,
            'industry': lead.industry,
            'price': lead.price,
            'contact_email': lead.contact_email,
            'created_at': lead.created_at,
            'status': lead.status,
            'extra': lead.extra or {}
        }
