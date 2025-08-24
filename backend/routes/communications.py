"""
Communication API Routes
=======================

This module provides API endpoints for the communication system including:
- In-app messaging
- Lead inquiries
- Notifications
- Bulk messaging
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import Session

from models import SessionLocal
from services.communication_service import CommunicationService, MessageType, NotificationType

communications_bp = Blueprint('communications', __name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@communications_bp.route('/messages', methods=['GET'])
@jwt_required()
def get_messages():
    """Get user messages"""
    try:
        user_id = get_jwt_identity()
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 50))
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        messages = communication_service.get_user_messages(
            user_id=user_id,
            unread_only=unread_only,
            limit=limit
        )
        
        return jsonify({
            'messages': messages,
            'count': len(messages)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/messages/<int:message_id>/read', methods=['POST'])
@jwt_required()
def mark_message_read(message_id):
    """Mark a message as read"""
    try:
        user_id = get_jwt_identity()
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        result = communication_service.mark_message_read(message_id, user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['recipient_id', 'subject', 'body']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        result = communication_service.send_message(
            sender_id=user_id,
            recipient_id=data['recipient_id'],
            subject=data['subject'],
            body=data['body'],
            message_type=MessageType(data.get('message_type', 'inquiry')),
            lead_id=data.get('lead_id')
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/leads/<int:lead_id>/inquiry', methods=['POST'])
@jwt_required()
def send_lead_inquiry(lead_id):
    """Send a lead inquiry"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'inquiry_text' not in data:
            return jsonify({'error': 'Missing inquiry_text'}), 400
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        result = communication_service.send_lead_inquiry(
            client_id=user_id,
            lead_id=lead_id,
            inquiry_text=data['inquiry_text']
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/conversations/<int:other_user_id>', methods=['GET'])
@jwt_required()
def get_conversation_history(other_user_id):
    """Get conversation history with another user"""
    try:
        user_id = get_jwt_identity()
        limit = int(request.args.get('limit', 50))
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        messages = communication_service.get_conversation_history(
            user1_id=user_id,
            user2_id=other_user_id,
            limit=limit
        )
        
        return jsonify({
            'messages': messages,
            'count': len(messages)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user notifications"""
    try:
        user_id = get_jwt_identity()
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 50))
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        notifications = communication_service.get_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
            limit=limit
        )
        
        return jsonify({
            'notifications': notifications,
            'count': len(notifications)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        user_id = get_jwt_identity()
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        result = communication_service.mark_notification_read(notification_id, user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/notifications/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read"""
    try:
        user_id = get_jwt_identity()
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        result = communication_service.mark_all_notifications_read(user_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/notifications/summary', methods=['GET'])
@jwt_required()
def get_notification_summary():
    """Get notification summary"""
    try:
        user_id = get_jwt_identity()
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        summary = communication_service.get_notification_summary(user_id)
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@communications_bp.route('/bulk-message', methods=['POST'])
@jwt_required()
def send_bulk_message():
    """Send bulk message to multiple recipients"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['recipient_ids', 'subject', 'body']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        db = next(get_db())
        communication_service = CommunicationService(db)
        
        result = communication_service.send_bulk_message(
            sender_id=user_id,
            recipient_ids=data['recipient_ids'],
            subject=data['subject'],
            body=data['body'],
            message_type=MessageType(data.get('message_type', 'bulk'))
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
