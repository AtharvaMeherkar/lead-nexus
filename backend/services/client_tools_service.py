"""
Client Tools & Features Service
==============================

This service provides comprehensive client tools and features including:
- Lead tracking and follow-up reminders
- CRM integration capabilities
- Lead pipeline management
- Client dashboard enhancements
- Lead comparison tools
"""

import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from sqlalchemy import and_, or_, desc, asc, func, case
from sqlalchemy.orm import Session

from models import User, Lead, Purchase, Message, Notification
from services.communication_service import CommunicationService

logger = logging.getLogger(__name__)


class LeadStage(Enum):
    """Lead pipeline stages"""
    PROSPECT = "prospect"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"


class FollowUpType(Enum):
    """Follow-up reminder types"""
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"


@dataclass
class LeadComparison:
    """Lead comparison data"""
    lead_id: int
    title: str
    industry: str
    price: float
    score: float
    contact_quality: float
    company_size: str
    decision_maker_level: str
    timeline: str


class ClientToolsService:
    """
    Comprehensive client tools and features service.
    
    Features:
    - Lead tracking and follow-up management
    - CRM integration capabilities
    - Lead pipeline management
    - Dashboard enhancements
    - Lead comparison tools
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.communication_service = CommunicationService(db_session)
    
    def create_lead_pipeline(self, client_id: int, lead_id: int, 
                           stage: str = LeadStage.PROSPECT.value) -> Dict[str, Any]:
        """
        Create or update lead pipeline entry for client.
        
        Args:
            client_id: Client user ID
            lead_id: Lead ID
            stage: Pipeline stage
            
        Returns:
            Dictionary with pipeline entry details
        """
        try:
            # Check if lead exists and is purchased by client
            lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
            if not lead:
                return {'error': 'Lead not found'}
            
            # Check if client has purchased this lead
            purchase = self.db.query(Purchase).filter(
                and_(Purchase.buyer_id == client_id, Purchase.lead_id == lead_id)
            ).first()
            
            if not purchase:
                return {'error': 'Lead not purchased by client'}
            
            # Create or update pipeline entry in lead extra data
            if not lead.extra:
                lead.extra = {}
            
            pipeline_data = lead.extra.get('pipeline', {})
            pipeline_data[str(client_id)] = {
                'stage': stage,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'notes': [],
                'activities': []
            }
            
            lead.extra['pipeline'] = pipeline_data
            lead.last_updated = datetime.utcnow()
            
            self.db.commit()
            
            return {
                'status': 'success',
                'lead_id': lead_id,
                'stage': stage,
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating lead pipeline: {e}")
            self.db.rollback()
            return {'error': 'Failed to create pipeline entry'}
    
    def update_lead_stage(self, client_id: int, lead_id: int, 
                         new_stage: str, notes: str = None) -> Dict[str, Any]:
        """
        Update lead pipeline stage.
        
        Args:
            client_id: Client user ID
            lead_id: Lead ID
            new_stage: New pipeline stage
            notes: Optional notes for the stage change
            
        Returns:
            Dictionary with update result
        """
        try:
            lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
            if not lead or not lead.extra or 'pipeline' not in lead.extra:
                return {'error': 'Lead pipeline not found'}
            
            pipeline_data = lead.extra['pipeline']
            if str(client_id) not in pipeline_data:
                return {'error': 'Client pipeline entry not found'}
            
            # Update stage
            old_stage = pipeline_data[str(client_id)]['stage']
            pipeline_data[str(client_id)]['stage'] = new_stage
            pipeline_data[str(client_id)]['updated_at'] = datetime.utcnow().isoformat()
            
            # Add note if provided
            if notes:
                if 'notes' not in pipeline_data[str(client_id)]:
                    pipeline_data[str(client_id)]['notes'] = []
                
                pipeline_data[str(client_id)]['notes'].append({
                    'stage': new_stage,
                    'note': notes,
                    'timestamp': datetime.utcnow().isoformat()
                })
            
            # Add activity
            if 'activities' not in pipeline_data[str(client_id)]:
                pipeline_data[str(client_id)]['activities'] = []
            
            pipeline_data[str(client_id)]['activities'].append({
                'type': 'stage_change',
                'from_stage': old_stage,
                'to_stage': new_stage,
                'timestamp': datetime.utcnow().isoformat(),
                'notes': notes
            })
            
            lead.extra['pipeline'] = pipeline_data
            lead.last_updated = datetime.utcnow()
            
            self.db.commit()
            
            return {
                'status': 'success',
                'lead_id': lead_id,
                'old_stage': old_stage,
                'new_stage': new_stage,
                'updated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error updating lead stage: {e}")
            self.db.rollback()
            return {'error': 'Failed to update lead stage'}
    
    def create_follow_up_reminder(self, client_id: int, lead_id: int, 
                                reminder_type: str, due_date: datetime, 
                                notes: str = None) -> Dict[str, Any]:
        """
        Create follow-up reminder for a lead.
        
        Args:
            client_id: Client user ID
            lead_id: Lead ID
            reminder_type: Type of follow-up
            due_date: When the follow-up is due
            notes: Optional notes
            
        Returns:
            Dictionary with reminder details
        """
        try:
            # Validate lead ownership
            purchase = self.db.query(Purchase).filter(
                and_(Purchase.buyer_id == client_id, Purchase.lead_id == lead_id)
            ).first()
            
            if not purchase:
                return {'error': 'Lead not purchased by client'}
            
            # Create reminder in lead extra data
            lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
            if not lead:
                return {'error': 'Lead not found'}
            
            if not lead.extra:
                lead.extra = {}
            
            if 'follow_ups' not in lead.extra:
                lead.extra['follow_ups'] = []
            
            reminder = {
                'id': len(lead.extra['follow_ups']) + 1,
                'client_id': client_id,
                'type': reminder_type,
                'due_date': due_date.isoformat(),
                'notes': notes,
                'status': 'pending',
                'created_at': datetime.utcnow().isoformat(),
                'completed_at': None
            }
            
            lead.extra['follow_ups'].append(reminder)
            lead.last_updated = datetime.utcnow()
            
            self.db.commit()
            
            return {
                'status': 'success',
                'reminder_id': reminder['id'],
                'lead_id': lead_id,
                'due_date': due_date.isoformat(),
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating follow-up reminder: {e}")
            self.db.rollback()
            return {'error': 'Failed to create reminder'}
    
    def get_client_pipeline_summary(self, client_id: int) -> Dict[str, Any]:
        """
        Get client's lead pipeline summary.
        
        Args:
            client_id: Client user ID
            
        Returns:
            Dictionary with pipeline summary
        """
        try:
            # Get all leads purchased by client
            purchased_leads = self.db.query(Lead).join(Purchase).filter(
                Purchase.buyer_id == client_id
            ).all()
            
            # Count leads by stage
            stage_counts = {}
            total_leads = len(purchased_leads)
            
            for lead in purchased_leads:
                if lead.extra and 'pipeline' in lead.extra:
                    pipeline_data = lead.extra['pipeline']
                    if str(client_id) in pipeline_data:
                        stage = pipeline_data[str(client_id)]['stage']
                        stage_counts[stage] = stage_counts.get(stage, 0) + 1
            
            # Calculate conversion rates
            conversion_rates = {}
            if total_leads > 0:
                for stage in LeadStage:
                    count = stage_counts.get(stage.value, 0)
                    conversion_rates[stage.value] = round((count / total_leads) * 100, 2)
            
            # Get recent activities
            recent_activities = []
            for lead in purchased_leads[:10]:  # Last 10 leads
                if lead.extra and 'pipeline' in lead.extra:
                    pipeline_data = lead.extra['pipeline']
                    if str(client_id) in pipeline_data:
                        activities = pipeline_data[str(client_id)].get('activities', [])
                        for activity in activities[-3:]:  # Last 3 activities per lead
                            recent_activities.append({
                                'lead_id': lead.id,
                                'lead_title': lead.title,
                                'activity': activity,
                                'timestamp': activity['timestamp']
                            })
            
            # Sort activities by timestamp
            recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
            recent_activities = recent_activities[:20]  # Top 20 activities
            
            return {
                'total_leads': total_leads,
                'stage_counts': stage_counts,
                'conversion_rates': conversion_rates,
                'recent_activities': recent_activities,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting client pipeline summary: {e}")
            return {'error': 'Failed to get pipeline summary'}
    
    def compare_leads(self, lead_ids: List[int], client_id: int) -> Dict[str, Any]:
        """
        Compare multiple leads side by side.
        
        Args:
            lead_ids: List of lead IDs to compare
            client_id: Client user ID
            
        Returns:
            Dictionary with comparison data
        """
        try:
            # Validate that client has purchased all leads
            for lead_id in lead_ids:
                purchase = self.db.query(Purchase).filter(
                    and_(Purchase.buyer_id == client_id, Purchase.lead_id == lead_id)
                ).first()
                
                if not purchase:
                    return {'error': f'Lead {lead_id} not purchased by client'}
            
            # Get lead details
            leads = self.db.query(Lead).filter(Lead.id.in_(lead_ids)).all()
            
            comparison_data = []
            for lead in leads:
                comparison = LeadComparison(
                    lead_id=lead.id,
                    title=lead.title,
                    industry=lead.industry,
                    price=float(lead.price),
                    score=float(lead.lead_score or 0),
                    contact_quality=self._calculate_contact_quality(lead),
                    company_size=lead.extra.get('company_size', 'Unknown') if lead.extra else 'Unknown',
                    decision_maker_level=lead.extra.get('decision_maker_level', 'Unknown') if lead.extra else 'Unknown',
                    timeline=lead.extra.get('timeline', 'Unknown') if lead.extra else 'Unknown'
                )
                comparison_data.append(comparison)
            
            # Calculate comparison metrics
            avg_price = sum(comp.price for comp in comparison_data) / len(comparison_data)
            avg_score = sum(comp.score for comp in comparison_data) / len(comparison_data)
            
            # Find best value lead (highest score/price ratio)
            best_value = max(comparison_data, key=lambda x: x.score / x.price if x.price > 0 else 0)
            
            return {
                'leads': [
                    {
                        'lead_id': comp.lead_id,
                        'title': comp.title,
                        'industry': comp.industry,
                        'price': comp.price,
                        'score': comp.score,
                        'contact_quality': comp.contact_quality,
                        'company_size': comp.company_size,
                        'decision_maker_level': comp.decision_maker_level,
                        'timeline': comp.timeline,
                        'value_ratio': comp.score / comp.price if comp.price > 0 else 0
                    }
                    for comp in comparison_data
                ],
                'summary': {
                    'total_leads': len(comparison_data),
                    'average_price': round(avg_price, 2),
                    'average_score': round(avg_score, 2),
                    'best_value_lead': {
                        'lead_id': best_value.lead_id,
                        'title': best_value.title,
                        'value_ratio': round(best_value.score / best_value.price, 3) if best_value.price > 0 else 0
                    }
                },
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error comparing leads: {e}")
            return {'error': 'Failed to compare leads'}
    
    def get_client_dashboard_data(self, client_id: int) -> Dict[str, Any]:
        """
        Get comprehensive dashboard data for client.
        
        Args:
            client_id: Client user ID
            
        Returns:
            Dictionary with dashboard data
        """
        try:
            # Get purchased leads
            purchased_leads = self.db.query(Lead).join(Purchase).filter(
                Purchase.buyer_id == client_id
            ).all()
            
            # Get recent purchases
            recent_purchases = self.db.query(Purchase).filter(
                Purchase.buyer_id == client_id
            ).order_by(desc(Purchase.created_at)).limit(5).all()
            
            # Calculate spending metrics
            total_spent = sum(purchase.amount for purchase in recent_purchases)
            avg_purchase_price = total_spent / len(recent_purchases) if recent_purchases else 0
            
            # Get pipeline summary
            pipeline_summary = self.get_client_pipeline_summary(client_id)
            
            # Get recent activities
            recent_activities = []
            for lead in purchased_leads[:5]:
                if lead.extra and 'pipeline' in lead.extra:
                    pipeline_data = lead.extra['pipeline']
                    if str(client_id) in pipeline_data:
                        activities = pipeline_data[str(client_id)].get('activities', [])
                        if activities:
                            recent_activities.append({
                                'lead_id': lead.id,
                                'lead_title': lead.title,
                                'last_activity': activities[-1],
                                'current_stage': pipeline_data[str(client_id)]['stage']
                            })
            
            # Get upcoming follow-ups
            upcoming_follow_ups = []
            for lead in purchased_leads:
                if lead.extra and 'follow_ups' in lead.extra:
                    for follow_up in lead.extra['follow_ups']:
                        if follow_up['status'] == 'pending':
                            due_date = datetime.fromisoformat(follow_up['due_date'])
                            if due_date > datetime.utcnow():
                                upcoming_follow_ups.append({
                                    'lead_id': lead.id,
                                    'lead_title': lead.title,
                                    'follow_up': follow_up
                                })
            
            # Sort by due date
            upcoming_follow_ups.sort(key=lambda x: x['follow_up']['due_date'])
            upcoming_follow_ups = upcoming_follow_ups[:5]  # Top 5 upcoming
            
            return {
                'purchased_leads_count': len(purchased_leads),
                'total_spent': float(total_spent),
                'average_purchase_price': float(avg_purchase_price),
                'recent_purchases': [
                    {
                        'lead_id': purchase.lead_id,
                        'amount': float(purchase.amount),
                        'purchase_date': purchase.created_at.isoformat() if purchase.created_at else None
                    }
                    for purchase in recent_purchases
                ],
                'pipeline_summary': pipeline_summary,
                'recent_activities': recent_activities,
                'upcoming_follow_ups': upcoming_follow_ups,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting client dashboard data: {e}")
            return {'error': 'Failed to get dashboard data'}
    
    def export_crm_data(self, client_id: int, format_type: str = 'json') -> str:
        """
        Export client's lead data in CRM-compatible format.
        
        Args:
            client_id: Client user ID
            format_type: Export format ('json' or 'csv')
            
        Returns:
            Exported data string
        """
        try:
            # Get all purchased leads
            purchased_leads = self.db.query(Lead).join(Purchase).filter(
                Purchase.buyer_id == client_id
            ).all()
            
            crm_data = []
            for lead in purchased_leads:
                # Get pipeline data
                pipeline_data = {}
                if lead.extra and 'pipeline' in lead.extra:
                    pipeline_data = lead.extra['pipeline'].get(str(client_id), {})
                
                # Get follow-ups
                follow_ups = []
                if lead.extra and 'follow_ups' in lead.extra:
                    follow_ups = lead.extra['follow_ups']
                
                crm_entry = {
                    'lead_id': lead.id,
                    'title': lead.title,
                    'description': lead.description,
                    'industry': lead.industry,
                    'price': float(lead.price),
                    'contact_name': lead.contact_name,
                    'contact_email': lead.contact_email,
                    'contact_phone': lead.contact_phone,
                    'company_name': lead.company_name,
                    'location': lead.location,
                    'purchase_date': lead.created_at.isoformat() if lead.created_at else None,
                    'current_stage': pipeline_data.get('stage', 'prospect'),
                    'follow_ups_count': len(follow_ups),
                    'last_activity': pipeline_data.get('updated_at'),
                    'notes': pipeline_data.get('notes', [])
                }
                
                crm_data.append(crm_entry)
            
            if format_type.lower() == 'json':
                return json.dumps(crm_data, indent=2)
            else:
                # CSV format
                import csv
                import io
                
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=crm_data[0].keys() if crm_data else [])
                writer.writeheader()
                writer.writerows(crm_data)
                
                return output.getvalue()
                
        except Exception as e:
            logger.error(f"Error exporting CRM data: {e}")
            return ""
    
    def _calculate_contact_quality(self, lead: Lead) -> float:
        """Calculate contact quality score for lead."""
        score = 0.0
        
        if lead.contact_email:
            score += 0.4
        if lead.contact_phone:
            score += 0.3
        if lead.contact_name:
            score += 0.2
        if lead.company_name:
            score += 0.1
        
        return round(score, 2)
