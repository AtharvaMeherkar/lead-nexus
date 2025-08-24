"""
Advanced Lead Management Service
===============================

This service provides comprehensive lead management features including:
- Lead nurturing workflows
- Lead scoring algorithms
- Lead categorization and tagging
- Bulk lead operations
- Lead import/export in multiple formats
"""

import json
import csv
import io
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from sqlalchemy import and_, or_, desc, asc, func
from sqlalchemy.orm import Session

from models import User, Lead, LeadStatusHistory, LeadValidation, LeadApproval
from services.communication_service import CommunicationService

logger = logging.getLogger(__name__)


class LeadScore(Enum):
    """Lead scoring categories"""
    HOT = "hot"           # 80-100 points
    WARM = "warm"         # 60-79 points
    COLD = "cold"         # 40-59 points
    DEAD = "dead"         # 0-39 points


class LeadCategory(Enum):
    """Lead categorization"""
    PROSPECT = "prospect"
    QUALIFIED = "qualified"
    OPPORTUNITY = "opportunity"
    CUSTOMER = "customer"
    CHURNED = "churned"


class LeadTag(Enum):
    """Common lead tags"""
    HIGH_VALUE = "high_value"
    DECISION_MAKER = "decision_maker"
    URGENT = "urgent"
    FOLLOW_UP = "follow_up"
    REFERRAL = "referral"
    TRADE_SHOW = "trade_show"
    WEBSITE = "website"
    SOCIAL_MEDIA = "social_media"


@dataclass
class LeadScoreCriteria:
    """Criteria for lead scoring"""
    company_size: int = 0
    budget_range: str = ""
    decision_maker_level: str = ""
    timeline: str = ""
    engagement_level: int = 0
    contact_quality: int = 0
    industry_match: int = 0


class LeadManagementService:
    """
    Advanced lead management service providing comprehensive lead handling capabilities.
    
    Features:
    - Lead nurturing workflows
    - Automated lead scoring
    - Lead categorization and tagging
    - Bulk operations
    - Import/export functionality
    - Lead pipeline management
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.communication_service = CommunicationService(db_session)
    
    def calculate_lead_score(self, lead: Lead, criteria: LeadScoreCriteria) -> Dict[str, Any]:
        """
        Calculate lead score based on multiple criteria.
        
        Args:
            lead: Lead object
            criteria: Scoring criteria
            
        Returns:
            Dictionary with score details
        """
        try:
            total_score = 0
            score_breakdown = {}
            
            # Company size scoring (0-20 points)
            company_size_score = min(criteria.company_size / 100, 20)
            score_breakdown['company_size'] = company_size_score
            total_score += company_size_score
            
            # Budget range scoring (0-25 points)
            budget_scores = {
                "under_10k": 5,
                "10k_50k": 10,
                "50k_100k": 15,
                "100k_500k": 20,
                "over_500k": 25
            }
            budget_score = budget_scores.get(criteria.budget_range, 0)
            score_breakdown['budget'] = budget_score
            total_score += budget_score
            
            # Decision maker level (0-20 points)
            decision_scores = {
                "individual": 5,
                "manager": 10,
                "director": 15,
                "vp": 18,
                "c_level": 20
            }
            decision_score = decision_scores.get(criteria.decision_maker_level, 0)
            score_breakdown['decision_maker'] = decision_score
            total_score += decision_score
            
            # Timeline scoring (0-15 points)
            timeline_scores = {
                "immediate": 15,
                "within_30_days": 12,
                "within_90_days": 8,
                "within_6_months": 5,
                "no_timeline": 0
            }
            timeline_score = timeline_scores.get(criteria.timeline, 0)
            score_breakdown['timeline'] = timeline_score
            total_score += timeline_score
            
            # Engagement level (0-10 points)
            engagement_score = min(criteria.engagement_level * 2, 10)
            score_breakdown['engagement'] = engagement_score
            total_score += engagement_score
            
            # Contact quality (0-10 points)
            contact_score = min(criteria.contact_quality * 2, 10)
            score_breakdown['contact_quality'] = contact_score
            total_score += contact_score
            
            # Industry match (0-10 points)
            industry_score = min(criteria.industry_match * 2, 10)
            score_breakdown['industry_match'] = industry_score
            total_score += industry_score
            
            # Determine score category
            if total_score >= 80:
                score_category = LeadScore.HOT
            elif total_score >= 60:
                score_category = LeadScore.WARM
            elif total_score >= 40:
                score_category = LeadScore.COLD
            else:
                score_category = LeadScore.DEAD
            
            return {
                'total_score': round(total_score, 2),
                'score_category': score_category.value,
                'score_breakdown': score_breakdown,
                'calculated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating lead score: {e}")
            return {'error': 'Failed to calculate lead score'}
    
    def categorize_lead(self, lead: Lead, score_result: Dict[str, Any]) -> str:
        """
        Categorize lead based on score and other factors.
        
        Args:
            lead: Lead object
            score_result: Score calculation result
            
        Returns:
            Lead category
        """
        try:
            score = score_result.get('total_score', 0)
            score_category = score_result.get('score_category', 'cold')
            
            # Additional factors for categorization
            has_contact_info = bool(lead.contact_email or lead.contact_phone)
            has_company_info = bool(lead.company_name)
            is_qualified = score >= 60 and has_contact_info and has_company_info
            
            if score >= 80 and is_qualified:
                return LeadCategory.OPPORTUNITY.value
            elif score >= 60 and is_qualified:
                return LeadCategory.QUALIFIED.value
            elif score >= 40:
                return LeadCategory.PROSPECT.value
            else:
                return LeadCategory.PROSPECT.value
                
        except Exception as e:
            logger.error(f"Error categorizing lead: {e}")
            return LeadCategory.PROSPECT.value
    
    def add_lead_tags(self, lead: Lead, tags: List[str]) -> Dict[str, Any]:
        """
        Add tags to a lead.
        
        Args:
            lead: Lead object
            tags: List of tags to add
            
        Returns:
            Dictionary with operation result
        """
        try:
            current_tags = lead.extra.get('tags', []) if lead.extra else []
            
            # Add new tags
            for tag in tags:
                if tag not in current_tags:
                    current_tags.append(tag)
            
            # Update lead extra data
            if not lead.extra:
                lead.extra = {}
            lead.extra['tags'] = current_tags
            lead.last_updated = datetime.utcnow()
            
            self.db.commit()
            
            return {
                'status': 'success',
                'tags_added': tags,
                'total_tags': len(current_tags)
            }
            
        except Exception as e:
            logger.error(f"Error adding lead tags: {e}")
            self.db.rollback()
            return {'error': 'Failed to add tags'}
    
    def remove_lead_tags(self, lead: Lead, tags: List[str]) -> Dict[str, Any]:
        """
        Remove tags from a lead.
        
        Args:
            lead: Lead object
            tags: List of tags to remove
            
        Returns:
            Dictionary with operation result
        """
        try:
            current_tags = lead.extra.get('tags', []) if lead.extra else []
            
            # Remove specified tags
            for tag in tags:
                if tag in current_tags:
                    current_tags.remove(tag)
            
            # Update lead extra data
            if not lead.extra:
                lead.extra = {}
            lead.extra['tags'] = current_tags
            lead.last_updated = datetime.utcnow()
            
            self.db.commit()
            
            return {
                'status': 'success',
                'tags_removed': tags,
                'total_tags': len(current_tags)
            }
            
        except Exception as e:
            logger.error(f"Error removing lead tags: {e}")
            self.db.rollback()
            return {'error': 'Failed to remove tags'}
    
    def bulk_update_leads(self, lead_ids: List[int], updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Bulk update multiple leads.
        
        Args:
            lead_ids: List of lead IDs to update
            updates: Dictionary of fields to update
            
        Returns:
            Dictionary with operation result
        """
        try:
            updated_count = 0
            failed_updates = []
            
            for lead_id in lead_ids:
                try:
                    lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
                    if not lead:
                        failed_updates.append({'lead_id': lead_id, 'error': 'Lead not found'})
                        continue
                    
                    # Update fields
                    for field, value in updates.items():
                        if hasattr(lead, field):
                            setattr(lead, field, value)
                    
                    lead.last_updated = datetime.utcnow()
                    updated_count += 1
                    
                except Exception as e:
                    failed_updates.append({'lead_id': lead_id, 'error': str(e)})
            
            self.db.commit()
            
            return {
                'status': 'success',
                'updated_count': updated_count,
                'failed_updates': failed_updates,
                'total_processed': len(lead_ids)
            }
            
        except Exception as e:
            logger.error(f"Error in bulk update: {e}")
            self.db.rollback()
            return {'error': 'Failed to perform bulk update'}
    
    def export_leads_csv(self, lead_ids: List[int] = None, filters: Dict[str, Any] = None) -> str:
        """
        Export leads to CSV format.
        
        Args:
            lead_ids: Specific lead IDs to export (if None, export all)
            filters: Dictionary of filters to apply
            
        Returns:
            CSV string
        """
        try:
            query = self.db.query(Lead)
            
            # Apply filters
            if filters:
                if filters.get('industry'):
                    query = query.filter(Lead.industry == filters['industry'])
                if filters.get('status'):
                    query = query.filter(Lead.status == filters['status'])
                if filters.get('min_price'):
                    query = query.filter(Lead.price >= filters['min_price'])
                if filters.get('max_price'):
                    query = query.filter(Lead.price <= filters['max_price'])
                if filters.get('vendor_id'):
                    query = query.filter(Lead.vendor_id == filters['vendor_id'])
            
            # Apply specific lead IDs if provided
            if lead_ids:
                query = query.filter(Lead.id.in_(lead_ids))
            
            leads = query.all()
            
            # Create CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'ID', 'Title', 'Description', 'Industry', 'Price', 'Status',
                'Contact Name', 'Contact Email', 'Contact Phone', 'Company Name',
                'Location', 'Lead Score', 'Tags', 'Created At', 'Last Updated'
            ])
            
            # Write data
            for lead in leads:
                tags = ', '.join(lead.extra.get('tags', [])) if lead.extra else ''
                writer.writerow([
                    lead.id, lead.title, lead.description, lead.industry, lead.price,
                    lead.status, lead.contact_name, lead.contact_email, lead.contact_phone,
                    lead.company_name, lead.location, lead.lead_score, tags,
                    lead.created_at.isoformat() if lead.created_at else '',
                    lead.last_updated.isoformat() if lead.last_updated else ''
                ])
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error exporting leads to CSV: {e}")
            return ""
    
    def import_leads_csv(self, csv_content: str, vendor_id: int) -> Dict[str, Any]:
        """
        Import leads from CSV format.
        
        Args:
            csv_content: CSV string content
            vendor_id: Vendor ID for the imported leads
            
        Returns:
            Dictionary with import results
        """
        try:
            input_file = io.StringIO(csv_content)
            reader = csv.DictReader(input_file)
            
            imported_count = 0
            failed_imports = []
            
            for row_num, row in enumerate(reader, 1):
                try:
                    # Validate required fields
                    if not row.get('Title') or not row.get('Industry') or not row.get('Price'):
                        failed_imports.append({
                            'row': row_num,
                            'error': 'Missing required fields (Title, Industry, Price)'
                        })
                        continue
                    
                    # Create lead
                    lead = Lead(
                        title=row['Title'],
                        description=row.get('Description', ''),
                        industry=row['Industry'],
                        price=float(row['Price']),
                        vendor_id=vendor_id,
                        status=row.get('Status', 'available'),
                        contact_name=row.get('Contact Name', ''),
                        contact_email=row.get('Contact Email', ''),
                        contact_phone=row.get('Contact Phone', ''),
                        company_name=row.get('Company Name', ''),
                        location=row.get('Location', ''),
                        extra={
                            'tags': row.get('Tags', '').split(',') if row.get('Tags') else [],
                            'imported_from_csv': True,
                            'import_date': datetime.utcnow().isoformat()
                        },
                        created_at=datetime.utcnow()
                    )
                    
                    self.db.add(lead)
                    imported_count += 1
                    
                except Exception as e:
                    failed_imports.append({
                        'row': row_num,
                        'error': str(e)
                    })
            
            self.db.commit()
            
            return {
                'status': 'success',
                'imported_count': imported_count,
                'failed_imports': failed_imports,
                'total_rows': len(list(reader))
            }
            
        except Exception as e:
            logger.error(f"Error importing leads from CSV: {e}")
            self.db.rollback()
            return {'error': 'Failed to import leads'}
    
    def get_lead_pipeline_summary(self, vendor_id: int = None) -> Dict[str, Any]:
        """
        Get lead pipeline summary with counts by status and category.
        
        Args:
            vendor_id: Optional vendor ID to filter by
            
        Returns:
            Dictionary with pipeline summary
        """
        try:
            query = self.db.query(Lead)
            
            if vendor_id:
                query = query.filter(Lead.vendor_id == vendor_id)
            
            # Get counts by status
            status_counts = {}
            for status in ['available', 'pending', 'processing', 'sold', 'delivered', 'expired']:
                count = query.filter(Lead.status == status).count()
                status_counts[status] = count
            
            # Get counts by score category
            score_counts = {}
            for score in ['hot', 'warm', 'cold', 'dead']:
                count = query.filter(Lead.lead_score >= self._get_score_threshold(score)).count()
                score_counts[score] = count
            
            # Get total value
            total_value = query.filter(Lead.status == 'available').with_entities(
                func.sum(Lead.price)
            ).scalar() or 0
            
            return {
                'status_counts': status_counts,
                'score_counts': score_counts,
                'total_leads': query.count(),
                'total_value': float(total_value),
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting lead pipeline summary: {e}")
            return {'error': 'Failed to get pipeline summary'}
    
    def _get_score_threshold(self, score_category: str) -> float:
        """Get score threshold for a category."""
        thresholds = {
            'hot': 80.0,
            'warm': 60.0,
            'cold': 40.0,
            'dead': 0.0
        }
        return thresholds.get(score_category, 0.0)
