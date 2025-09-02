"""
Enhanced Communication Service
=============================

This module provides comprehensive communication features including:
- In-app messaging between vendors and clients
- Lead inquiry system with automated responses
- Email notifications for lead status changes
- Bulk messaging capabilities
- Real-time notifications
"""

import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from sqlalchemy import and_, or_, desc, asc
from sqlalchemy.orm import Session

from models import User, Lead, Purchase, Notification, Message
from services.email_service import EmailService

logger = logging.getLogger(__name__)


class MessageType(Enum):
    """Message types for the communication system"""
    INQUIRY = "inquiry"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    SYSTEM = "system"
    BULK = "bulk"


class NotificationType(Enum):
    """Notification types"""
    LEAD_PURCHASED = "lead_purchased"
    LEAD_APPROVED = "lead_approved"
    LEAD_REJECTED = "lead_rejected"
    MESSAGE_RECEIVED = "message_received"
    PAYMENT_RECEIVED = "payment_received"
    SYSTEM_UPDATE = "system_update"


@dataclass
class MessageTemplate:
    """Message template for automated responses"""
    name: str
    subject: str
    body: str
    variables: List[str]
    message_type: MessageType


class CommunicationService:
    """
    Enhanced communication service providing messaging, notifications, and automated responses.
    
    Features:
    - In-app messaging between users
    - Lead inquiry system
    - Automated response templates
    - Email notifications
    - Bulk messaging
    - Real-time notifications
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.email_service = EmailService()
        self.message_templates = self._initialize_templates()
    
    def send_message(self, sender_id: int, recipient_id: int, subject: str, 
                    body: str, message_type: MessageType = MessageType.INQUIRY,
                    lead_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Send a message between users.
        
        Args:
            sender_id: Sender user ID
            recipient_id: Recipient user ID
            subject: Message subject
            body: Message body
            message_type: Type of message
            lead_id: Associated lead ID (optional)
            
        Returns:
            Dictionary with message details
        """
        try:
            # Validate users exist
            sender = self.db.query(User).filter(User.id == sender_id).first()
            recipient = self.db.query(User).filter(User.id == recipient_id).first()
            
            if not sender or not recipient:
                return {'error': 'Invalid sender or recipient'}
            
            # Create message
            message = Message(
                sender_id=sender_id,
                recipient_id=recipient_id,
                subject=subject,
                body=body,
                message_type=message_type.value,
                lead_id=lead_id,
                created_at=datetime.utcnow()
            )
            
            self.db.add(message)
            self.db.commit()
            
            # Create notification for recipient
            self._create_notification(
                user_id=recipient_id,
                notification_type=NotificationType.MESSAGE_RECEIVED,
                title="New Message Received",
                message=f"You have received a new message: {subject}",
                data={'message_id': message.id, 'sender_email': sender.email}
            )
            
            # Send email notification if enabled
            if recipient.notification_preferences.get('email_messages', True):
                self._send_email_notification(recipient.email, subject, body, sender.email)
            
            return {
                'message_id': message.id,
                'status': 'sent',
                'created_at': message.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.db.rollback()
            return {'error': 'Failed to send message'}
    
    def send_lead_inquiry(self, client_id: int, lead_id: int, inquiry_text: str) -> Dict[str, Any]:
        """
        Send a lead inquiry from client to vendor.
        
        Args:
            client_id: Client user ID
            lead_id: Lead ID
            inquiry_text: Inquiry message
            
        Returns:
            Dictionary with inquiry details
        """
        try:
            # Get lead and vendor
            lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
            if not lead:
                return {'error': 'Lead not found'}
            
            vendor_id = lead.vendor_id
            client = self.db.query(User).filter(User.id == client_id).first()
            
            # Create inquiry subject
            subject = f"Inquiry about Lead: {lead.title}"
            
            # Send inquiry message
            message_result = self.send_message(
                sender_id=client_id,
                recipient_id=vendor_id,
                subject=subject,
                body=inquiry_text,
                message_type=MessageType.INQUIRY,
                lead_id=lead_id
            )
            
            if 'error' in message_result:
                return message_result
            
            # Create automated response if vendor has auto-response enabled
            vendor = self.db.query(User).filter(User.id == vendor_id).first()
            if vendor and vendor.auto_response_enabled:
                self._send_automated_response(vendor_id, client_id, lead_id, inquiry_text)
            
            return {
                'inquiry_id': message_result['message_id'],
                'status': 'sent',
                'vendor_id': vendor_id,
                'lead_title': lead.title
            }
            
        except Exception as e:
            logger.error(f"Error sending lead inquiry: {e}")
            return {'error': 'Failed to send inquiry'}
    
    def send_automated_response(self, vendor_id: int, client_id: int, lead_id: int, 
                              original_inquiry: str) -> Dict[str, Any]:
        """
        Send automated response from vendor to client.
        
        Args:
            vendor_id: Vendor user ID
            client_id: Client user ID
            lead_id: Lead ID
            original_inquiry: Original inquiry text
            
        Returns:
            Dictionary with response details
        """
        try:
            vendor = self.db.query(User).filter(User.id == vendor_id).first()
            lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
            
            if not vendor or not lead:
                return {'error': 'Vendor or lead not found'}
            
            # Get automated response template
            template = self._get_automated_response_template(vendor, lead, original_inquiry)
            
            # Send automated response
            message_result = self.send_message(
                sender_id=vendor_id,
                recipient_id=client_id,
                subject=template['subject'],
                body=template['body'],
                message_type=MessageType.RESPONSE,
                lead_id=lead_id
            )
            
            return {
                'response_id': message_result.get('message_id'),
                'status': 'automated_response_sent',
                'template_used': template['name']
            }
            
        except Exception as e:
            logger.error(f"Error sending automated response: {e}")
            return {'error': 'Failed to send automated response'}
    
    def get_conversation_history(self, user1_id: int, user2_id: int, 
                                limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get conversation history between two users.
        
        Args:
            user1_id: First user ID
            user2_id: Second user ID
            limit: Maximum number of messages to return
            
        Returns:
            List of messages in conversation
        """
        try:
            messages = self.db.query(Message).filter(
                or_(
                    and_(Message.sender_id == user1_id, Message.recipient_id == user2_id),
                    and_(Message.sender_id == user2_id, Message.recipient_id == user1_id)
                )
            ).order_by(asc(Message.created_at)).limit(limit).all()
            
            return [
                {
                    'id': msg.id,
                    'sender_id': msg.sender_id,
                    'recipient_id': msg.recipient_id,
                    'subject': msg.subject,
                    'body': msg.body,
                    'message_type': msg.message_type,
                    'lead_id': msg.lead_id,
                    'created_at': msg.created_at.isoformat(),
                    'read': msg.read
                }
                for msg in messages
            ]
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    def get_user_messages(self, user_id: int, unread_only: bool = False, 
                         limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get messages for a user.
        
        Args:
            user_id: User ID
            unread_only: Return only unread messages
            limit: Maximum number of messages to return
            
        Returns:
            List of messages
        """
        try:
            query = self.db.query(Message).filter(Message.recipient_id == user_id)
            
            if unread_only:
                query = query.filter(Message.read == False)
            
            messages = query.order_by(desc(Message.created_at)).limit(limit).all()
            
            return [
                {
                    'id': msg.id,
                    'sender_id': msg.sender_id,
                    'sender_email': self._get_user_email(msg.sender_id),
                    'subject': msg.subject,
                    'body': msg.body,
                    'message_type': msg.message_type,
                    'lead_id': msg.lead_id,
                    'created_at': msg.created_at.isoformat(),
                    'read': msg.read
                }
                for msg in messages
            ]
            
        except Exception as e:
            logger.error(f"Error getting user messages: {e}")
            return []
    
    def mark_message_read(self, message_id: int, user_id: int) -> Dict[str, Any]:
        """
        Mark a message as read.
        
        Args:
            message_id: Message ID
            user_id: User ID (recipient)
            
        Returns:
            Dictionary with status
        """
        try:
            message = self.db.query(Message).filter(
                and_(Message.id == message_id, Message.recipient_id == user_id)
            ).first()
            
            if not message:
                return {'error': 'Message not found'}
            
            message.read = True
            message.read_at = datetime.utcnow()
            self.db.commit()
            
            return {'status': 'marked_read', 'message_id': message_id}
            
        except Exception as e:
            logger.error(f"Error marking message read: {e}")
            self.db.rollback()
            return {'error': 'Failed to mark message as read'}
    
    def send_bulk_message(self, sender_id: int, recipient_ids: List[int], 
                         subject: str, body: str, message_type: MessageType = MessageType.BULK) -> Dict[str, Any]:
        """
        Send bulk message to multiple recipients.
        
        Args:
            sender_id: Sender user ID
            recipient_ids: List of recipient user IDs
            subject: Message subject
            body: Message body
            message_type: Type of message
            
        Returns:
            Dictionary with bulk message results
        """
        try:
            results = {
                'sent': 0,
                'failed': 0,
                'errors': []
            }
            
            for recipient_id in recipient_ids:
                try:
                    message_result = self.send_message(
                        sender_id=sender_id,
                        recipient_id=recipient_id,
                        subject=subject,
                        body=body,
                        message_type=message_type
                    )
                    
                    if 'error' not in message_result:
                        results['sent'] += 1
                    else:
                        results['failed'] += 1
                        results['errors'].append({
                            'recipient_id': recipient_id,
                            'error': message_result['error']
                        })
                        
                except Exception as e:
                    results['failed'] += 1
                    results['errors'].append({
                        'recipient_id': recipient_id,
                        'error': str(e)
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Error sending bulk message: {e}")
            return {'error': 'Failed to send bulk message'}
    
    def create_notification(self, user_id: int, notification_type: NotificationType,
                           title: str, message: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a notification for a user.
        
        Args:
            user_id: User ID
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            data: Additional data
            
        Returns:
            Dictionary with notification details
        """
        return self._create_notification(user_id, notification_type, title, message, data)
    
    def get_user_notifications(self, user_id: int, unread_only: bool = False, 
                              limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get notifications for a user.
        
        Args:
            user_id: User ID
            unread_only: Return only unread notifications
            limit: Maximum number of notifications to return
            
        Returns:
            List of notifications
        """
        try:
            query = self.db.query(Notification).filter(Notification.user_id == user_id)
            
            if unread_only:
                query = query.filter(Notification.read == False)
            
            notifications = query.order_by(desc(Notification.created_at)).limit(limit).all()
            
            return [
                {
                    'id': notif.id,
                    'type': notif.notification_type,
                    'title': notif.title,
                    'message': notif.message,
                    'data': notif.data,
                    'created_at': notif.created_at.isoformat(),
                    'read': notif.read
                }
                for notif in notifications
            ]
            
        except Exception as e:
            logger.error(f"Error getting user notifications: {e}")
            return []
    
    def mark_notification_read(self, notification_id: int, user_id: int) -> Dict[str, Any]:
        """
        Mark a notification as read.
        
        Args:
            notification_id: Notification ID
            user_id: User ID
            
        Returns:
            Dictionary with status
        """
        try:
            notification = self.db.query(Notification).filter(
                and_(Notification.id == notification_id, Notification.user_id == user_id)
            ).first()
            
            if not notification:
                return {'error': 'Notification not found'}
            
            notification.read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
            
            return {'status': 'marked_read', 'notification_id': notification_id}
            
        except Exception as e:
            logger.error(f"Error marking notification read: {e}")
            self.db.rollback()
            return {'error': 'Failed to mark notification as read'}
    
    def mark_all_notifications_read(self, user_id: int) -> Dict[str, Any]:
        """
        Mark all notifications as read for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with status
        """
        try:
            updated = self.db.query(Notification).filter(
                and_(Notification.user_id == user_id, Notification.read == False)
            ).update({
                'read': True,
                'read_at': datetime.utcnow()
            })
            
            self.db.commit()
            
            return {'status': 'marked_read', 'count': updated}
            
        except Exception as e:
            logger.error(f"Error marking all notifications read: {e}")
            self.db.rollback()
            return {'error': 'Failed to mark notifications as read'}
    
    def get_notification_summary(self, user_id: int) -> Dict[str, Any]:
        """
        Get notification summary for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with notification summary
        """
        try:
            total_notifications = self.db.query(Notification).filter(
                Notification.user_id == user_id
            ).count()
            
            unread_notifications = self.db.query(Notification).filter(
                and_(Notification.user_id == user_id, Notification.read == False)
            ).count()
            
            unread_messages = self.db.query(Message).filter(
                and_(Message.recipient_id == user_id, Message.read == False)
            ).count()
            
            return {
                'total_notifications': total_notifications,
                'unread_notifications': unread_notifications,
                'unread_messages': unread_messages,
                'total_unread': unread_notifications + unread_messages
            }
            
        except Exception as e:
            logger.error(f"Error getting notification summary: {e}")
            return {
                'total_notifications': 0,
                'unread_notifications': 0,
                'unread_messages': 0,
                'total_unread': 0
            }
    
    # Helper methods
    def _initialize_templates(self) -> Dict[str, MessageTemplate]:
        """Initialize message templates."""
        return {
            'lead_inquiry_auto_response': MessageTemplate(
                name='Lead Inquiry Auto-Response',
                subject='Re: Inquiry about {lead_title}',
                body="""
Thank you for your inquiry about our lead: {lead_title}

We have received your message and will respond with detailed information within 24 hours.

Lead Details:
- Title: {lead_title}
- Industry: {industry}
- Price: ${price}
- Company: {company_name}

In the meantime, you can view more details about this lead in our marketplace.

Best regards,
{vendor_name}
                """,
                variables=['lead_title', 'industry', 'price', 'company_name', 'vendor_name'],
                message_type=MessageType.RESPONSE
            ),
            'lead_purchased_notification': MessageTemplate(
                name='Lead Purchased Notification',
                subject='Lead Purchase Confirmation: {lead_title}',
                body="""
Congratulations! You have successfully purchased the lead: {lead_title}

Purchase Details:
- Lead ID: {lead_id}
- Price: ${price}
- Purchase Date: {purchase_date}

You can now access the complete contact information and lead details in your dashboard.

Thank you for using Lead-Nexus!
                """,
                variables=['lead_title', 'lead_id', 'price', 'purchase_date'],
                message_type=MessageType.NOTIFICATION
            )
        }
    
    def _get_automated_response_template(self, vendor: User, lead: Lead, 
                                       original_inquiry: str) -> Dict[str, Any]:
        """Get automated response template for vendor."""
        template = self.message_templates['lead_inquiry_auto_response']
        
        # Replace template variables
        body = template.body.format(
            lead_title=lead.title,
            industry=lead.industry,
            price=lead.price,
            company_name=lead.extra.get('company_name', 'N/A'),
            vendor_name=vendor.email.split('@')[0]  # Use email prefix as name
        )
        
        subject = template.subject.format(lead_title=lead.title)
        
        return {
            'name': template.name,
            'subject': subject,
            'body': body
        }
    
    def _create_notification(self, user_id: int, notification_type: NotificationType,
                           title: str, message: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a notification for a user."""
        try:
            notification = Notification(
                user_id=user_id,
                notification_type=notification_type.value,
                title=title,
                message=message,
                data=data or {},
                created_at=datetime.utcnow()
            )
            
            self.db.add(notification)
            self.db.commit()
            
            return {
                'notification_id': notification.id,
                'status': 'created'
            }
            
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            self.db.rollback()
            return {'error': 'Failed to create notification'}
    
    def _send_email_notification(self, recipient_email: str, subject: str, 
                                body: str, sender_email: str) -> bool:
        """Send email notification."""
        try:
            return self.email_service.send_email(
                to_email=recipient_email,
                subject=f"Lead-Nexus Message: {subject}",
                body=f"""
You have received a new message from {sender_email}:

Subject: {subject}

{body}

Login to Lead-Nexus to view and respond to this message.

Best regards,
Lead-Nexus Team
                """
            )
        except Exception as e:
            logger.error(f"Error sending email notification: {e}")
            return False
    
    def _get_user_email(self, user_id: int) -> str:
        """Get user email by ID."""
        user = self.db.query(User).filter(User.id == user_id).first()
        return user.email if user else 'Unknown'
