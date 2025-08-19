from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from models import SessionLocal, Lead, LeadApproval, LeadValidation, Notification, User, Purchase
from services.lead_validation import LeadValidator

from services.notification_service import NotificationService
from auth import token_required
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

workflows_bp = Blueprint('workflows', __name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Lead Approval Workflows
@workflows_bp.route('/api/workflows/leads/<int:lead_id>/approve', methods=['POST'])
@token_required(roles=["admin", "moderator"])
def approve_lead(lead_id):
    """Approve a lead for marketplace listing."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        # Get the lead
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return jsonify({'error': 'Lead not found'}), 404
        
        # Check if user has permission to approve (admin or moderator)
        current_user = db.query(User).filter(User.id == current_user_id).first()
        if current_user.role not in ['admin', 'moderator']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Update lead status
        lead.approval_status = 'approved'
        lead.status = 'available'
        lead.last_updated = datetime.utcnow()
        
        # Create approval record
        approval = LeadApproval(
            lead_id=lead_id,
            approver_id=current_user_id,
            status='approved',
            notes=request.json.get('notes', 'Lead approved by moderator')
        )
        db.add(approval)
        
        # Send notification to vendor
        notification_service = NotificationService(db)
        notification_service.notify_lead_approved(lead)
        
        db.commit()
        
        return jsonify({
            'message': 'Lead approved successfully',
            'lead_id': lead_id,
            'approval_id': approval.id
        }), 200
        
    except Exception as e:
        logger.error(f"Error approving lead: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()


@workflows_bp.route('/api/workflows/leads/<int:lead_id>/reject', methods=['POST'])
@token_required(roles=["admin", "moderator"])
def reject_lead(lead_id):
    """Reject a lead with reason."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        # Get the lead
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return jsonify({'error': 'Lead not found'}), 404
        
        # Check if user has permission to reject
        current_user = db.query(User).filter(User.id == current_user_id).first()
        if current_user.role not in ['admin', 'moderator']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        reason = request.json.get('reason', 'Lead rejected by moderator')
        
        # Update lead status
        lead.approval_status = 'rejected'
        lead.status = 'pending'
        lead.last_updated = datetime.utcnow()
        
        # Create approval record
        approval = LeadApproval(
            lead_id=lead_id,
            approver_id=current_user_id,
            status='rejected',
            notes=reason
        )
        db.add(approval)
        
        # Send notification to vendor
        notification_service = NotificationService(db)
        notification_service.notify_lead_rejected(lead, reason)
        
        db.commit()
        
        return jsonify({
            'message': 'Lead rejected successfully',
            'lead_id': lead_id,
            'approval_id': approval.id,
            'reason': reason
        }), 200
        
    except Exception as e:
        logger.error(f"Error rejecting lead: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()


@workflows_bp.route('/api/workflows/leads/pending-approval', methods=['GET'])
@token_required(roles=["admin", "moderator"])
def get_pending_approval_leads():
    """Get leads pending approval."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        # Check if user has permission
        current_user = db.query(User).filter(User.id == current_user_id).first()
        if current_user.role not in ['admin', 'moderator']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        # Get pending leads
        pending_leads = db.query(Lead).filter(
            Lead.approval_status == 'pending'
        ).order_by(Lead.created_at.desc()).all()
        
        leads_data = []
        for lead in pending_leads:
            leads_data.append({
                'id': lead.id,
                'title': lead.title,
                'industry': lead.industry,
                'price': lead.price,
                'vendor_id': lead.vendor_id,
                'validation_score': lead.validation_score,
                'validation_status': lead.validation_status.value if lead.validation_status else None,
                'created_at': lead.created_at.isoformat(),
                'last_updated': lead.last_updated.isoformat() if lead.last_updated else None
            })
        
        return jsonify({
            'leads': leads_data,
            'count': len(leads_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting pending approval leads: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()





# Notification Management
@workflows_bp.route('/api/workflows/notifications', methods=['GET'])
@token_required(roles=["client", "vendor", "admin"])
def get_user_notifications():
    """Get notifications for the current user."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        notification_service = NotificationService(db)
        notifications = notification_service.get_user_notifications(
            current_user_id, unread_only, limit, offset
        )
        
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'read': notification.read,
                'data': notification.data,
                'created_at': notification.created_at.isoformat()
            })
        
        return jsonify({
            'notifications': notifications_data,
            'count': len(notifications_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user notifications: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()


@workflows_bp.route('/api/workflows/notifications/<int:notification_id>/read', methods=['POST'])
@token_required(roles=["client", "vendor", "admin"])
def mark_notification_read(notification_id):
    """Mark a notification as read."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        notification_service = NotificationService(db)
        notification = notification_service.mark_notification_read(notification_id, current_user_id)
        
        return jsonify({
            'message': 'Notification marked as read',
            'notification_id': notification.id,
            'read': notification.read
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Error marking notification read: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()


@workflows_bp.route('/api/workflows/notifications/mark-all-read', methods=['POST'])
@token_required(roles=["client", "vendor", "admin"])
def mark_all_notifications_read():
    """Mark all notifications as read for the current user."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        notification_service = NotificationService(db)
        count = notification_service.mark_all_notifications_read(current_user_id)
        
        return jsonify({
            'message': f'{count} notifications marked as read',
            'count': count
        }), 200
        
    except Exception as e:
        logger.error(f"Error marking all notifications read: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()


@workflows_bp.route('/api/workflows/notifications/summary', methods=['GET'])
@token_required(roles=["client", "vendor", "admin"])
def get_notification_summary():
    """Get notification summary for the current user."""
    try:
        current_user_id = get_jwt_identity()
        db = SessionLocal()
        
        notification_service = NotificationService(db)
        summary = notification_service.get_notification_summary(current_user_id)
        
        return jsonify(summary), 200
        
    except Exception as e:
        logger.error(f"Error getting notification summary: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()


@workflows_bp.route('/api/workflows/notifications/<int:notification_id>', methods=['DELETE'])
@token_required(roles=["client", "vendor", "admin"])
def delete_notification(notification_id):
    """Delete a notification."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        notification_service = NotificationService(db)
        deleted = notification_service.delete_notification(notification_id, current_user_id)
        
        if deleted:
            return jsonify({
                'message': 'Notification deleted successfully',
                'notification_id': notification_id
            }), 200
        else:
            return jsonify({'error': 'Notification not found'}), 404
        
    except Exception as e:
        logger.error(f"Error deleting notification: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()


# Automated Workflows
@workflows_bp.route('/api/workflows/purchase/<int:purchase_id>/process', methods=['POST'])
@token_required(roles=["admin"])
def process_purchase_workflow(purchase_id):
    """Process complete purchase workflow including notifications."""
    try:
        current_user_id = request.user_id
        db = SessionLocal()
        
        # Get purchase details
        purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
        
        # Send notifications
        notification_service = NotificationService(db)
        notification_service.notify_lead_purchased(purchase)
        notification_service.notify_payment_received(purchase)
        
        return jsonify({
            'message': 'Purchase workflow processed successfully',
            'purchase_id': purchase_id,
            'notifications_sent': 2
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Error processing purchase workflow: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        db.close()



