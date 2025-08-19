from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models import Notification, User, Lead, Purchase


class NotificationService:
    """Comprehensive notification service for real-time alerts and communications."""
    
    def __init__(self, db: Session):
        self.db = db
        self.notification_types = {
            'lead_approved': {
                'title': 'Lead Approved',
                'template': 'Your lead "{lead_title}" has been approved and is now live on the marketplace.',
                'type': 'success'
            },
            'lead_rejected': {
                'title': 'Lead Rejected',
                'template': 'Your lead "{lead_title}" has been rejected. Please review and resubmit.',
                'type': 'error'
            },
            'lead_purchased': {
                'title': 'Lead Sold!',
                'template': 'Congratulations! Your lead "{lead_title}" has been purchased for ${amount}.',
                'type': 'success'
            },

            'payment_received': {
                'title': 'Payment Received',
                'template': 'Payment of ${amount} has been received for lead "{lead_title}".',
                'type': 'success'
            },
            'lead_delivered': {
                'title': 'Lead Delivered',
                'template': 'Your purchased lead "{lead_title}" has been delivered. Check your dashboard for details.',
                'type': 'info'
            },
            'system_alert': {
                'title': 'System Alert',
                'template': '{message}',
                'type': 'warning'
            },
            'welcome': {
                'title': 'Welcome to Lead-Nexus!',
                'template': 'Welcome to Lead-Nexus! Your account has been successfully created.',
                'type': 'info'
            },
            'profile_updated': {
                'title': 'Profile Updated',
                'template': 'Your profile has been successfully updated.',
                'type': 'success'
            }
        }
    
    def create_notification(self, user_id: int, notification_type: str, 
                          data: Optional[Dict] = None, title: Optional[str] = None,
                          message: Optional[str] = None) -> Notification:
        """
        Create a new notification for a user.
        
        Args:
            user_id: User ID to notify
            notification_type: Type of notification
            data: Additional data for the notification
            title: Custom title (overrides default)
            message: Custom message (overrides default)
            
        Returns:
            Notification object
        """
        if notification_type not in self.notification_types:
            raise ValueError(f"Invalid notification type: {notification_type}")
        
        notification_config = self.notification_types[notification_type]
        
        # Use custom title/message or default template
        notification_title = title or notification_config['title']
        notification_message = message or notification_config['template']
        
        # Format message with data if provided
        if data:
            try:
                notification_message = notification_message.format(**data)
            except KeyError as e:
                # If formatting fails, use the original message
                pass
        
        notification = Notification(
            user_id=user_id,
            title=notification_title,
            message=notification_message,
            type=notification_config['type'],
            data=data or {}
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def notify_lead_approved(self, lead: Lead) -> Notification:
        """Notify vendor when their lead is approved."""
        data = {
            'lead_title': lead.title,
            'lead_id': lead.id
        }
        return self.create_notification(
            lead.vendor_id, 'lead_approved', data
        )
    
    def notify_lead_rejected(self, lead: Lead, reason: str = None) -> Notification:
        """Notify vendor when their lead is rejected."""
        data = {
            'lead_title': lead.title,
            'lead_id': lead.id,
            'reason': reason or 'Quality standards not met'
        }
        message = f"Your lead \"{lead.title}\" has been rejected. Reason: {data['reason']}"
        return self.create_notification(
            lead.vendor_id, 'lead_rejected', data, message=message
        )
    
    def notify_lead_purchased(self, purchase: Purchase) -> Notification:
        """Notify vendor when their lead is purchased."""
        data = {
            'lead_title': purchase.lead.title,
            'amount': f"${purchase.amount:.2f}",
            'purchase_id': purchase.id
        }
        return self.create_notification(
            purchase.lead.vendor_id, 'lead_purchased', data
        )
    

    
    def notify_payment_received(self, purchase: Purchase) -> Notification:
        """Notify client when payment is received."""
        data = {
            'amount': f"${purchase.amount:.2f}",
            'lead_title': purchase.lead.title,
            'purchase_id': purchase.id
        }
        return self.create_notification(
            purchase.buyer_id, 'payment_received', data
        )
    
    def notify_lead_delivered(self, purchase: Purchase) -> Notification:
        """Notify client when lead is delivered."""
        data = {
            'lead_title': purchase.lead.title,
            'purchase_id': purchase.id
        }
        return self.create_notification(
            purchase.buyer_id, 'lead_delivered', data
        )
    
    def notify_welcome(self, user: User) -> Notification:
        """Send welcome notification to new user."""
        return self.create_notification(user.id, 'welcome')
    
    def notify_profile_updated(self, user: User) -> Notification:
        """Notify user when profile is updated."""
        return self.create_notification(user.id, 'profile_updated')
    
    def get_user_notifications(self, user_id: int, unread_only: bool = False,
                             limit: int = 50, offset: int = 0) -> List[Notification]:
        """
        Get notifications for a user.
        
        Args:
            user_id: User ID
            unread_only: Only return unread notifications
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip
            
        Returns:
            List of Notification objects
        """
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.read == False)
        
        return query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    
    def mark_notification_read(self, notification_id: int, user_id: int) -> Notification:
        """
        Mark a notification as read.
        
        Args:
            notification_id: Notification ID
            user_id: User ID (for security)
            
        Returns:
            Updated Notification object
        """
        notification = self.db.query(Notification).filter(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        ).first()
        
        if not notification:
            raise ValueError(f"Notification {notification_id} not found for user {user_id}")
        
        notification.read = True
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def mark_all_notifications_read(self, user_id: int) -> int:
        """
        Mark all notifications as read for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Number of notifications marked as read
        """
        result = self.db.query(Notification).filter(
            and_(Notification.user_id == user_id, Notification.read == False)
        ).update({'read': True})
        
        self.db.commit()
        return result
    
    def get_notification_count(self, user_id: int, unread_only: bool = False) -> int:
        """
        Get notification count for a user.
        
        Args:
            user_id: User ID
            unread_only: Only count unread notifications
            
        Returns:
            Number of notifications
        """
        query = self.db.query(func.count(Notification.id)).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.read == False)
        
        return query.scalar() or 0
    
    def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """
        Delete a notification.
        
        Args:
            notification_id: Notification ID
            user_id: User ID (for security)
            
        Returns:
            True if deleted, False if not found
        """
        notification = self.db.query(Notification).filter(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        ).first()
        
        if not notification:
            return False
        
        self.db.delete(notification)
        self.db.commit()
        return True
    
    def delete_old_notifications(self, days_old: int = 30) -> int:
        """
        Delete notifications older than specified days.
        
        Args:
            days_old: Number of days old to delete
            
        Returns:
            Number of notifications deleted
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        result = self.db.query(Notification).filter(
            Notification.created_at < cutoff_date
        ).delete()
        
        self.db.commit()
        return result
    
    def get_notification_summary(self, user_id: int) -> Dict:
        """
        Get notification summary for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with notification summary
        """
        total_notifications = self.get_notification_count(user_id)
        unread_notifications = self.get_notification_count(user_id, unread_only=True)
        
        # Get notifications by type
        type_counts = self.db.query(
            Notification.type,
            func.count(Notification.id).label('count')
        ).filter(
            Notification.user_id == user_id
        ).group_by(Notification.type).all()
        
        return {
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'read_notifications': total_notifications - unread_notifications,
            'type_breakdown': {
                count.type: count.count for count in type_counts
            }
        }


def send_bulk_notifications(db: Session, user_ids: List[int], notification_type: str,
                          data: Optional[Dict] = None) -> List[Notification]:
    """
    Send notifications to multiple users.
    
    Args:
        db: Database session
        user_ids: List of user IDs
        notification_type: Type of notification
        data: Additional data for the notification
        
    Returns:
        List of created Notification objects
    """
    service = NotificationService(db)
    notifications = []
    
    for user_id in user_ids:
        try:
            notification = service.create_notification(user_id, notification_type, data)
            notifications.append(notification)
        except Exception as e:
            # Log error but continue with other users
            print(f"Failed to send notification to user {user_id}: {e}")
    
    return notifications
