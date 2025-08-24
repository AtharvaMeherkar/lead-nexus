#!/usr/bin/env python3
"""
Security Service
===============

Handles security features including 2FA, audit logging, GDPR compliance, and security monitoring.
"""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import secrets
import hashlib
import hmac
import base64
import json
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import qrcode
import io
import base64

from models import User, AuditLog, DataRequest, DataDeletion


class SecurityEvent(Enum):
    """Security event types for audit logging."""
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    USER_REGISTER = "user.register"
    PASSWORD_CHANGE = "password.change"
    PASSWORD_RESET = "password.reset"
    TWO_FACTOR_ENABLE = "2fa.enable"
    TWO_FACTOR_DISABLE = "2fa.disable"
    TWO_FACTOR_VERIFY = "2fa.verify"
    LEAD_CREATED = "lead.created"
    LEAD_PURCHASED = "lead.purchased"
    LEAD_DELETED = "lead.deleted"
    PAYMENT_PROCESSED = "payment.processed"
    DATA_EXPORT = "data.export"
    DATA_DELETION = "data.deletion"
    SUSPICIOUS_ACTIVITY = "suspicious.activity"
    ADMIN_ACTION = "admin.action"


class DataRequestType(Enum):
    """GDPR data request types."""
    EXPORT = "export"
    DELETION = "deletion"
    RECTIFICATION = "rectification"
    RESTRICTION = "restriction"


@dataclass
class AuditLogEntry:
    """Audit log entry structure."""
    user_id: Optional[int]
    event: SecurityEvent
    description: str
    ip_address: str
    user_agent: str
    metadata: Dict[str, Any] = None
    timestamp: datetime = None


@dataclass
class TwoFactorConfig:
    """Two-factor authentication configuration."""
    user_id: int
    secret: str
    backup_codes: List[str]
    is_enabled: bool
    created_at: datetime
    last_used: Optional[datetime] = None


@dataclass
class SecurityAlert:
    """Security alert structure."""
    alert_id: str
    type: str
    severity: str  # low, medium, high, critical
    description: str
    user_id: Optional[int]
    ip_address: str
    metadata: Dict[str, Any]
    timestamp: datetime
    resolved: bool = False


class SecurityService:
    """Service for handling security features."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.security_alerts: List[SecurityAlert] = []
        self.failed_login_attempts: Dict[str, List[datetime]] = {}
        self.suspicious_ips: Dict[str, int] = {}
    
    # ============================================================================
    # TWO-FACTOR AUTHENTICATION
    # ============================================================================
    
    def generate_two_factor_secret(self, user_id: int) -> Tuple[str, str]:
        """
        Generate a new 2FA secret and QR code.
        
        Args:
            user_id: User ID
            
        Returns:
            Tuple of (secret, qr_code_base64)
        """
        # Generate a random secret
        secret = base64.b32encode(secrets.token_bytes(20)).decode('utf-8')
        
        # Generate backup codes
        backup_codes = [secrets.token_hex(4).upper() for _ in range(8)]
        
        # Create QR code
        qr_data = f"otpauth://totp/Lead-Nexus:{user_id}?secret={secret}&issuer=Lead-Nexus"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Convert to base64
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return secret, qr_base64, backup_codes
    
    def verify_two_factor_code(self, secret: str, code: str, window: int = 1) -> bool:
        """
        Verify a 2FA code.
        
        Args:
            secret: 2FA secret
            code: Code to verify
            window: Time window for verification
            
        Returns:
            True if code is valid
        """
        try:
            # Convert secret to bytes
            secret_bytes = base64.b32decode(secret)
            
            # Get current timestamp
            timestamp = int(datetime.utcnow().timestamp())
            
            # Check current and previous windows
            for i in range(-window, window + 1):
                check_time = timestamp + (i * 30)  # 30-second windows
                
                # Generate expected code
                expected_code = self._generate_totp(secret_bytes, check_time)
                
                if code == expected_code:
                    return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error verifying 2FA code: {e}")
            return False
    
    def _generate_totp(self, secret: bytes, timestamp: int) -> str:
        """Generate TOTP code."""
        # Convert timestamp to bytes
        time_bytes = timestamp.to_bytes(8, 'big')
        
        # Generate HMAC
        hmac_obj = hmac.new(secret, time_bytes, hashlib.sha1)
        hmac_result = hmac_obj.digest()
        
        # Get offset
        offset = hmac_result[-1] & 0x0f
        
        # Generate 4-byte code
        code_bytes = hmac_result[offset:offset + 4]
        code_int = int.from_bytes(code_bytes, 'big') & 0x7fffffff
        
        # Convert to 6-digit string
        return f"{code_int % 1000000:06d}"
    
    def verify_backup_code(self, backup_codes: List[str], code: str) -> Tuple[bool, List[str]]:
        """
        Verify a backup code and return updated list.
        
        Args:
            backup_codes: List of backup codes
            code: Code to verify
            
        Returns:
            Tuple of (is_valid, updated_backup_codes)
        """
        if code in backup_codes:
            # Remove used backup code
            updated_codes = [c for c in backup_codes if c != code]
            return True, updated_codes
        return False, backup_codes
    
    # ============================================================================
    # AUDIT LOGGING
    # ============================================================================
    
    def log_security_event(
        self,
        user_id: Optional[int],
        event: SecurityEvent,
        description: str,
        ip_address: str,
        user_agent: str,
        metadata: Dict[str, Any] = None,
        db: Session = None
    ):
        """
        Log a security event.
        
        Args:
            user_id: User ID (None for anonymous events)
            event: Security event type
            description: Event description
            ip_address: IP address
            user_agent: User agent string
            metadata: Additional metadata
            db: Database session
        """
        try:
            log_entry = AuditLogEntry(
                user_id=user_id,
                event=event,
                description=description,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata=metadata or {},
                timestamp=datetime.utcnow()
            )
            
            # Save to database if session provided
            if db:
                audit_log = AuditLog(
                    user_id=user_id,
                    event=event.value,
                    description=description,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    event_metadata=metadata or {},
                    timestamp=datetime.utcnow()
                )
                db.add(audit_log)
                db.commit()
            
            # Log to console
            self.logger.info(f"Security Event: {event.value} - {description} - User: {user_id} - IP: {ip_address}")
            
            # Check for suspicious activity
            self._check_suspicious_activity(log_entry)
            
        except Exception as e:
            self.logger.error(f"Error logging security event: {e}")
    
    def get_audit_logs(
        self,
        user_id: Optional[int] = None,
        event: Optional[SecurityEvent] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        db: Session = None
    ) -> List[AuditLogEntry]:
        """
        Get audit logs with filtering.
        
        Args:
            user_id: Filter by user ID
            event: Filter by event type
            start_date: Start date filter
            end_date: End date filter
            limit: Maximum number of logs
            db: Database session
            
        Returns:
            List of audit log entries
        """
        if not db:
            return []
        
        query = db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        if event:
            query = query.filter(AuditLog.event == event.value)
        
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        
        logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
        
        return [
            AuditLogEntry(
                user_id=log.user_id,
                event=SecurityEvent(log.event),
                description=log.description,
                ip_address=log.ip_address,
                user_agent=log.user_agent,
                metadata=log.event_metadata,
                timestamp=log.timestamp
            )
            for log in logs
        ]
    
    # ============================================================================
    # GDPR COMPLIANCE
    # ============================================================================
    
    def create_data_request(
        self,
        user_id: int,
        request_type: DataRequestType,
        description: str,
        db: Session
    ) -> DataRequest:
        """
        Create a GDPR data request.
        
        Args:
            user_id: User ID
            request_type: Type of request
            description: Request description
            db: Database session
            
        Returns:
            Data request object
        """
        data_request = DataRequest(
            user_id=user_id,
            request_type=request_type.value,
            description=description,
            status="pending",
            created_at=datetime.utcnow()
        )
        
        db.add(data_request)
        db.commit()
        
        # Log the request
        self.log_security_event(
            user_id=user_id,
            event=SecurityEvent.DATA_EXPORT if request_type == DataRequestType.EXPORT else SecurityEvent.DATA_DELETION,
            description=f"GDPR {request_type.value} request created",
            ip_address="system",
            user_agent="system",
            metadata={"request_id": data_request.id, "request_type": request_type.value},
            db=db
        )
        
        return data_request
    
    def export_user_data(self, user_id: int, db: Session) -> Dict[str, Any]:
        """
        Export all user data for GDPR compliance.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Dictionary containing all user data
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        # Get user's leads
        leads = db.query(Lead).filter(Lead.vendor_id == user_id).all()
        
        # Get user's purchases
        purchases = db.query(Purchase).filter(Purchase.user_id == user_id).all()
        
        # Get user's audit logs
        audit_logs = self.get_audit_logs(user_id=user_id, db=db)
        
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "credits": user.credits,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            },
            "leads": [
                {
                    "id": lead.id,
                    "title": lead.title,
                    "description": lead.description,
                    "industry": lead.industry,
                    "price": lead.price,
                    "contact_name": lead.contact_name,
                    "contact_email": lead.contact_email,
                    "contact_phone": lead.contact_phone,
                    "company_name": lead.company_name,
                    "location": lead.location,
                    "status": lead.status,
                    "created_at": lead.created_at.isoformat()
                }
                for lead in leads
            ],
            "purchases": [
                {
                    "id": purchase.id,
                    "lead_id": purchase.lead_id,
                    "amount": purchase.amount,
                    "status": purchase.status,
                    "payment_method": purchase.payment_method,
                    "created_at": purchase.created_at.isoformat()
                }
                for purchase in purchases
            ],
            "audit_logs": [
                {
                    "event": log.event.value,
                    "description": log.description,
                    "ip_address": log.ip_address,
                    "timestamp": log.timestamp.isoformat(),
                    "metadata": log.metadata
                }
                for log in audit_logs
            ],
            "export_date": datetime.utcnow().isoformat(),
            "export_reason": "GDPR Data Subject Access Request"
        }
    
    def delete_user_data(self, user_id: int, db: Session) -> bool:
        """
        Delete all user data for GDPR compliance.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            True if deletion was successful
        """
        try:
            # Create deletion record
            deletion_record = DataDeletion(
                user_id=user_id,
                deletion_date=datetime.utcnow(),
                reason="GDPR Right to be Forgotten"
            )
            db.add(deletion_record)
            
            # Anonymize user data (soft delete)
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.email = f"deleted_{user_id}@deleted.com"
                user.password_hash = "deleted"
                user.is_active = False
                user.credits = 0.0
            
            # Anonymize leads
            leads = db.query(Lead).filter(Lead.vendor_id == user_id).all()
            for lead in leads:
                lead.contact_name = "Deleted"
                lead.contact_email = "deleted@deleted.com"
                lead.contact_phone = "000-000-0000"
                lead.company_name = "Deleted Company"
                lead.location = "Deleted"
                lead.status = "deleted"
            
            db.commit()
            
            # Log the deletion
            self.log_security_event(
                user_id=user_id,
                event=SecurityEvent.DATA_DELETION,
                description="User data deleted for GDPR compliance",
                ip_address="system",
                user_agent="system",
                metadata={"deletion_record_id": deletion_record.id},
                db=db
            )
            
            return True
            
        except Exception as e:
            db.rollback()
            self.logger.error(f"Error deleting user data: {e}")
            return False
    
    # ============================================================================
    # SECURITY MONITORING
    # ============================================================================
    
    def _check_suspicious_activity(self, log_entry: AuditLogEntry):
        """Check for suspicious activity patterns."""
        # Check for multiple failed login attempts
        if log_entry.event == SecurityEvent.USER_LOGIN:
            self._check_failed_logins(log_entry.ip_address)
        
        # Check for unusual activity patterns
        self._check_unusual_patterns(log_entry)
        
        # Check for known malicious IPs
        self._check_malicious_ips(log_entry.ip_address)
    
    def _check_failed_logins(self, ip_address: str):
        """Check for multiple failed login attempts from same IP."""
        now = datetime.utcnow()
        
        if ip_address not in self.failed_login_attempts:
            self.failed_login_attempts[ip_address] = []
        
        # Add current attempt
        self.failed_login_attempts[ip_address].append(now)
        
        # Remove attempts older than 1 hour
        cutoff = now - timedelta(hours=1)
        self.failed_login_attempts[ip_address] = [
            attempt for attempt in self.failed_login_attempts[ip_address]
            if attempt > cutoff
        ]
        
        # Check if too many failed attempts
        if len(self.failed_login_attempts[ip_address]) >= 5:
            self._create_security_alert(
                "multiple_failed_logins",
                "high",
                f"Multiple failed login attempts from IP {ip_address}",
                None,
                ip_address,
                {"failed_attempts": len(self.failed_login_attempts[ip_address])}
            )
    
    def _check_unusual_patterns(self, log_entry: AuditLogEntry):
        """Check for unusual activity patterns."""
        # This is a basic implementation
        # In a real system, you'd use machine learning for pattern detection
        
        # Check for rapid-fire actions
        if log_entry.user_id:
            recent_events = [
                event for event in self.security_alerts
                if event.user_id == log_entry.user_id
                and event.timestamp > datetime.utcnow() - timedelta(minutes=5)
            ]
            
            if len(recent_events) > 10:
                self._create_security_alert(
                    "rapid_activity",
                    "medium",
                    f"Unusual rapid activity detected for user {log_entry.user_id}",
                    log_entry.user_id,
                    log_entry.ip_address,
                    {"events_in_5min": len(recent_events)}
                )
    
    def _check_malicious_ips(self, ip_address: str):
        """Check if IP is known to be malicious."""
        # This is a basic implementation
        # In a real system, you'd integrate with threat intelligence feeds
        
        malicious_ips = [
            "192.168.1.100",  # Example malicious IP
            "10.0.0.50"       # Example malicious IP
        ]
        
        if ip_address in malicious_ips:
            self._create_security_alert(
                "malicious_ip",
                "critical",
                f"Activity from known malicious IP {ip_address}",
                None,
                ip_address,
                {"ip_reputation": "malicious"}
            )
    
    def _create_security_alert(
        self,
        alert_type: str,
        severity: str,
        description: str,
        user_id: Optional[int],
        ip_address: str,
        metadata: Dict[str, Any]
    ):
        """Create a security alert."""
        alert = SecurityAlert(
            alert_id=secrets.token_hex(8),
            type=alert_type,
            severity=severity,
            description=description,
            user_id=user_id,
            ip_address=ip_address,
            metadata=metadata,
            timestamp=datetime.utcnow()
        )
        
        self.security_alerts.append(alert)
        
        # Log the alert
        self.logger.warning(f"Security Alert: {alert_type} - {description} - Severity: {severity}")
        
        # In a real system, you'd send notifications here
        # self._send_security_notification(alert)
    
    def get_security_alerts(
        self,
        severity: Optional[str] = None,
        resolved: Optional[bool] = None,
        limit: int = 50
    ) -> List[SecurityAlert]:
        """Get security alerts with filtering."""
        alerts = self.security_alerts
        
        if severity:
            alerts = [a for a in alerts if a.severity == severity]
        
        if resolved is not None:
            alerts = [a for a in alerts if a.resolved == resolved]
        
        # Sort by timestamp (newest first)
        alerts.sort(key=lambda x: x.timestamp, reverse=True)
        
        return alerts[:limit]
    
    def resolve_security_alert(self, alert_id: str) -> bool:
        """Mark a security alert as resolved."""
        for alert in self.security_alerts:
            if alert.alert_id == alert_id:
                alert.resolved = True
                return True
        return False
    
    def get_security_stats(self) -> Dict[str, Any]:
        """Get security statistics."""
        total_alerts = len(self.security_alerts)
        unresolved_alerts = len([a for a in self.security_alerts if not a.resolved])
        
        severity_counts = {}
        for alert in self.security_alerts:
            severity_counts[alert.severity] = severity_counts.get(alert.severity, 0) + 1
        
        return {
            "total_alerts": total_alerts,
            "unresolved_alerts": unresolved_alerts,
            "severity_distribution": severity_counts,
            "failed_login_attempts": len(self.failed_login_attempts),
            "suspicious_ips": len(self.suspicious_ips)
        }


# Global instance
security_service = SecurityService()
