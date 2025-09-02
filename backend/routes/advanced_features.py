"""
Advanced Features API Routes
===========================

This module provides API routes for advanced features including:
- Advanced lead management
- Vendor analytics and tools
- Client tools and features
- Analytics and reporting
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from models import SessionLocal, User, Lead
from services.lead_management_service import LeadManagementService, LeadScoreCriteria
from services.vendor_analytics_service import VendorAnalyticsService
from services.client_tools_service import ClientToolsService
from services.analytics_service import AnalyticsService

advanced_features_bp = Blueprint('advanced_features', __name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# LEAD MANAGEMENT ROUTES
# ============================================================================

@advanced_features_bp.route('/leads/score', methods=['POST'])
@jwt_required()
def calculate_lead_score():
    """Calculate lead score based on criteria."""
    try:
        data = request.get_json()
        lead_id = data.get('lead_id')
        criteria_data = data.get('criteria', {})
        
        if not lead_id:
            return jsonify({'error': 'Lead ID is required'}), 400
        
        db = SessionLocal()
        lead_management = LeadManagementService(db)
        
        # Get lead
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return jsonify({'error': 'Lead not found'}), 404
        
        # Create criteria object
        criteria = LeadScoreCriteria(
            company_size=criteria_data.get('company_size', 0),
            budget_range=criteria_data.get('budget_range', ''),
            decision_maker_level=criteria_data.get('decision_maker_level', ''),
            timeline=criteria_data.get('timeline', ''),
            engagement_level=criteria_data.get('engagement_level', 0),
            contact_quality=criteria_data.get('contact_quality', 0),
            industry_match=criteria_data.get('industry_match', 0)
        )
        
        # Calculate score
        result = lead_management.calculate_lead_score(lead, criteria)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/leads/<int:lead_id>/tags', methods=['POST'])
@jwt_required()
def add_lead_tags():
    """Add tags to a lead."""
    try:
        data = request.get_json()
        tags = data.get('tags', [])
        
        if not tags:
            return jsonify({'error': 'Tags are required'}), 400
        
        db = SessionLocal()
        lead_management = LeadManagementService(db)
        
        lead = db.query(Lead).filter(Lead.id == request.view_args['lead_id']).first()
        if not lead:
            return jsonify({'error': 'Lead not found'}), 404
        
        result = lead_management.add_lead_tags(lead, tags)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/leads/<int:lead_id>/tags', methods=['DELETE'])
@jwt_required()
def remove_lead_tags():
    """Remove tags from a lead."""
    try:
        data = request.get_json()
        tags = data.get('tags', [])
        
        if not tags:
            return jsonify({'error': 'Tags are required'}), 400
        
        db = SessionLocal()
        lead_management = LeadManagementService(db)
        
        lead = db.query(Lead).filter(Lead.id == request.view_args['lead_id']).first()
        if not lead:
            return jsonify({'error': 'Lead not found'}), 404
        
        result = lead_management.remove_lead_tags(lead, tags)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/leads/bulk-update', methods=['POST'])
@jwt_required()
def bulk_update_leads():
    """Bulk update multiple leads."""
    try:
        data = request.get_json()
        lead_ids = data.get('lead_ids', [])
        updates = data.get('updates', {})
        
        if not lead_ids:
            return jsonify({'error': 'Lead IDs are required'}), 400
        
        if not updates:
            return jsonify({'error': 'Updates are required'}), 400
        
        db = SessionLocal()
        lead_management = LeadManagementService(db)
        
        result = lead_management.bulk_update_leads(lead_ids, updates)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/leads/export', methods=['POST'])
@jwt_required()
def export_leads():
    """Export leads to CSV format."""
    try:
        data = request.get_json()
        lead_ids = data.get('lead_ids')
        filters = data.get('filters', {})
        
        db = SessionLocal()
        lead_management = LeadManagementService(db)
        
        csv_content = lead_management.export_leads_csv(lead_ids, filters)
        
        if not csv_content:
            return jsonify({'error': 'Failed to export leads'}), 400
        
        return jsonify({
            'csv_content': csv_content,
            'filename': f'leads_export_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/leads/import', methods=['POST'])
@jwt_required()
def import_leads():
    """Import leads from CSV format."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'vendor':
            return jsonify({'error': 'Only vendors can import leads'}), 403
        
        data = request.get_json()
        csv_content = data.get('csv_content')
        
        if not csv_content:
            return jsonify({'error': 'CSV content is required'}), 400
        
        db = SessionLocal()
        lead_management = LeadManagementService(db)
        
        result = lead_management.import_leads_csv(csv_content, current_user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/leads/pipeline-summary', methods=['GET'])
@jwt_required()
def get_lead_pipeline_summary():
    """Get lead pipeline summary."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        db = SessionLocal()
        lead_management = LeadManagementService(db)
        
        vendor_id = current_user_id if user.role == 'vendor' else None
        result = lead_management.get_lead_pipeline_summary(vendor_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# VENDOR ANALYTICS ROUTES
# ============================================================================

@advanced_features_bp.route('/vendor/performance-metrics', methods=['GET'])
@jwt_required()
def get_vendor_performance_metrics():
    """Get vendor performance metrics."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'vendor':
            return jsonify({'error': 'Only vendors can access performance metrics'}), 403
        
        # Parse date range if provided
        date_range = None
        if request.args.get('start_date') and request.args.get('end_date'):
            start_date = datetime.fromisoformat(request.args.get('start_date'))
            end_date = datetime.fromisoformat(request.args.get('end_date'))
            date_range = (start_date, end_date)
        
        db = SessionLocal()
        vendor_analytics = VendorAnalyticsService(db)
        
        result = vendor_analytics.get_vendor_performance_metrics(current_user_id, date_range)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/vendor/reputation-score', methods=['GET'])
@jwt_required()
def get_vendor_reputation_score():
    """Get vendor reputation score."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'vendor':
            return jsonify({'error': 'Only vendors can access reputation score'}), 403
        
        db = SessionLocal()
        vendor_analytics = VendorAnalyticsService(db)
        
        result = vendor_analytics.get_vendor_reputation_score(current_user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/vendor/dashboard', methods=['GET'])
@jwt_required()
def get_vendor_dashboard():
    """Get vendor dashboard data."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'vendor':
            return jsonify({'error': 'Only vendors can access dashboard'}), 403
        
        db = SessionLocal()
        vendor_analytics = VendorAnalyticsService(db)
        
        result = vendor_analytics.get_vendor_dashboard_data(current_user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/vendor/commission-summary', methods=['GET'])
@jwt_required()
def get_commission_summary():
    """Get vendor commission summary."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'vendor':
            return jsonify({'error': 'Only vendors can access commission summary'}), 403
        
        # Parse date range if provided
        date_range = None
        if request.args.get('start_date') and request.args.get('end_date'):
            start_date = datetime.fromisoformat(request.args.get('start_date'))
            end_date = datetime.fromisoformat(request.args.get('end_date'))
            date_range = (start_date, end_date)
        
        db = SessionLocal()
        vendor_analytics = VendorAnalyticsService(db)
        
        result = vendor_analytics.get_commission_summary(current_user_id, date_range)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# CLIENT TOOLS ROUTES
# ============================================================================

@advanced_features_bp.route('/client/pipeline', methods=['POST'])
@jwt_required()
def create_lead_pipeline():
    """Create or update lead pipeline entry."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'client':
            return jsonify({'error': 'Only clients can create pipeline entries'}), 403
        
        data = request.get_json()
        lead_id = data.get('lead_id')
        stage = data.get('stage', 'prospect')
        
        if not lead_id:
            return jsonify({'error': 'Lead ID is required'}), 400
        
        db = SessionLocal()
        client_tools = ClientToolsService(db)
        
        result = client_tools.create_lead_pipeline(current_user_id, lead_id, stage)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/client/pipeline/<int:lead_id>/stage', methods=['PUT'])
@jwt_required()
def update_lead_stage():
    """Update lead pipeline stage."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'client':
            return jsonify({'error': 'Only clients can update pipeline stages'}), 403
        
        data = request.get_json()
        new_stage = data.get('stage')
        notes = data.get('notes')
        
        if not new_stage:
            return jsonify({'error': 'New stage is required'}), 400
        
        db = SessionLocal()
        client_tools = ClientToolsService(db)
        
        result = client_tools.update_lead_stage(current_user_id, request.view_args['lead_id'], new_stage, notes)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/client/follow-up', methods=['POST'])
@jwt_required()
def create_follow_up_reminder():
    """Create follow-up reminder."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'client':
            return jsonify({'error': 'Only clients can create follow-up reminders'}), 403
        
        data = request.get_json()
        lead_id = data.get('lead_id')
        reminder_type = data.get('type')
        due_date_str = data.get('due_date')
        notes = data.get('notes')
        
        if not all([lead_id, reminder_type, due_date_str]):
            return jsonify({'error': 'Lead ID, type, and due date are required'}), 400
        
        try:
            due_date = datetime.fromisoformat(due_date_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        
        db = SessionLocal()
        client_tools = ClientToolsService(db)
        
        result = client_tools.create_follow_up_reminder(current_user_id, lead_id, reminder_type, due_date, notes)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/client/pipeline-summary', methods=['GET'])
@jwt_required()
def get_client_pipeline_summary():
    """Get client pipeline summary."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'client':
            return jsonify({'error': 'Only clients can access pipeline summary'}), 403
        
        db = SessionLocal()
        client_tools = ClientToolsService(db)
        
        result = client_tools.get_client_pipeline_summary(current_user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/client/compare-leads', methods=['POST'])
@jwt_required()
def compare_leads():
    """Compare multiple leads."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'client':
            return jsonify({'error': 'Only clients can compare leads'}), 403
        
        data = request.get_json()
        lead_ids = data.get('lead_ids', [])
        
        if len(lead_ids) < 2:
            return jsonify({'error': 'At least 2 leads are required for comparison'}), 400
        
        db = SessionLocal()
        client_tools = ClientToolsService(db)
        
        result = client_tools.compare_leads(lead_ids, current_user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/client/dashboard', methods=['GET'])
@jwt_required()
def get_client_dashboard():
    """Get client dashboard data."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'client':
            return jsonify({'error': 'Only clients can access dashboard'}), 403
        
        db = SessionLocal()
        client_tools = ClientToolsService(db)
        
        result = client_tools.get_client_dashboard_data(current_user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/client/export-crm', methods=['POST'])
@jwt_required()
def export_crm_data():
    """Export client data in CRM format."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        if user.role != 'client':
            return jsonify({'error': 'Only clients can export CRM data'}), 403
        
        data = request.get_json()
        format_type = data.get('format', 'json')
        
        if format_type not in ['json', 'csv']:
            return jsonify({'error': 'Invalid format type'}), 400
        
        db = SessionLocal()
        client_tools = ClientToolsService(db)
        
        crm_data = client_tools.export_crm_data(current_user_id, format_type)
        
        if not crm_data:
            return jsonify({'error': 'Failed to export CRM data'}), 400
        
        return jsonify({
            'data': crm_data,
            'format': format_type,
            'filename': f'crm_export_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.{format_type}'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ANALYTICS ROUTES
# ============================================================================

@advanced_features_bp.route('/analytics/real-time', methods=['GET'])
@jwt_required()
def get_real_time_analytics():
    """Get real-time analytics."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        # Parse filters
        filters = {}
        if request.args.get('industry'):
            filters['industry'] = request.args.get('industry')
        if request.args.get('vendor_id'):
            filters['vendor_id'] = int(request.args.get('vendor_id'))
        if request.args.get('start_date') and request.args.get('end_date'):
            start_date = datetime.fromisoformat(request.args.get('start_date'))
            end_date = datetime.fromisoformat(request.args.get('end_date'))
            filters['date_range'] = (start_date, end_date)
        
        db = SessionLocal()
        analytics = AnalyticsService(db)
        
        result = analytics.get_real_time_analytics(filters)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/analytics/predictive-insights', methods=['GET'])
@jwt_required()
def get_predictive_insights():
    """Get predictive insights."""
    try:
        current_user_id = get_jwt_identity()
        user = SessionLocal().query(User).filter(User.id == current_user_id).first()
        
        db = SessionLocal()
        analytics = AnalyticsService(db)
        
        insights = analytics.get_predictive_insights(current_user_id, user.role)
        
        return jsonify({
            'insights': [
                {
                    'type': insight.insight_type,
                    'confidence': insight.confidence,
                    'prediction': insight.prediction,
                    'factors': insight.factors,
                    'timeframe': insight.timeframe
                }
                for insight in insights
            ],
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@advanced_features_bp.route('/analytics/reports', methods=['POST'])
@jwt_required()
def generate_custom_report():
    """Generate custom report."""
    try:
        data = request.get_json()
        report_type = data.get('report_type')
        filters = data.get('filters', {})
        
        if not report_type:
            return jsonify({'error': 'Report type is required'}), 400
        
        # Parse date range if provided
        date_range = None
        if data.get('start_date') and data.get('end_date'):
            start_date = datetime.fromisoformat(data.get('start_date'))
            end_date = datetime.fromisoformat(data.get('end_date'))
            date_range = (start_date, end_date)
        
        db = SessionLocal()
        analytics = AnalyticsService(db)
        
        result = analytics.generate_custom_report(report_type, filters, date_range)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
