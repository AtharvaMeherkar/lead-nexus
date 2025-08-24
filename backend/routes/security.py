#!/usr/bin/env python3
"""
Security Routes
==============

API routes for security and compliance features.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import Session
from datetime import datetime

from models import SessionLocal
from services.security_service import (
    security_service, 
    SecurityEvent, 
    DataRequestType,
    TwoFactorConfig
)

security_bp = Blueprint('security', __name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# TWO-FACTOR AUTHENTICATION ROUTES
# ============================================================================

@security_bp.route('/2fa/setup', methods=['POST'])
@jwt_required()
def setup_two_factor():
    """Setup two-factor authentication for user."""
    user_id = get_jwt_identity()
    db = next(get_db())
    
    try:
        # Generate 2FA secret and QR code
        secret, qr_base64, backup_codes = security_service.generate_two_factor_secret(user_id)
        
        # Save to database
        from models import TwoFactorAuth
        two_factor = TwoFactorAuth(
            user_id=user_id,
            secret=secret,
            backup_codes=backup_codes,
            is_enabled=False,  # Not enabled until verified
            created_at=datetime.utcnow()
        )
        
        # Check if user already has 2FA setup
        existing = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user_id).first()
        if existing:
            existing.secret = secret
            existing.backup_codes = backup_codes
            existing.is_enabled = False
        else:
            db.add(two_factor)
        
        db.commit()
        
        # Log security event
        security_service.log_security_event(
            user_id=user_id,
            event=SecurityEvent.TWO_FACTOR_ENABLE,
            description="2FA setup initiated",
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', ''),
            db=db
        )
        
        return jsonify({
            "secret": secret,
            "qr_code": qr_base64,
            "backup_codes": backup_codes,
            "message": "2FA setup initiated. Please verify with a code to enable."
        }), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@security_bp.route('/2fa/verify', methods=['POST'])
@jwt_required()
def verify_two_factor():
    """Verify and enable two-factor authentication."""
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get('code', '')
    
    if not code:
        return jsonify({"error": "Verification code is required"}), 400
    
    db = next(get_db())
    
    try:
        # Get user's 2FA configuration
        from models import TwoFactorAuth
        two_factor = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user_id).first()
        
        if not two_factor:
            return jsonify({"error": "2FA not set up"}), 400
        
        # Verify the code
        if security_service.verify_two_factor_code(two_factor.secret, code):
            # Enable 2FA
            two_factor.is_enabled = True
            two_factor.last_used = datetime.utcnow()
            db.commit()
            
            # Log security event
            security_service.log_security_event(
                user_id=user_id,
                event=SecurityEvent.TWO_FACTOR_VERIFY,
                description="2FA verified and enabled",
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', ''),
                db=db
            )
            
            return jsonify({
                "message": "Two-factor authentication enabled successfully"
            }), 200
        else:
            return jsonify({"error": "Invalid verification code"}), 400
            
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@security_bp.route('/2fa/verify-login', methods=['POST'])
@jwt_required()
def verify_two_factor_login():
    """Verify 2FA code during login."""
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get('code', '')
    
    if not code:
        return jsonify({"error": "Verification code is required"}), 400
    
    db = next(get_db())
    
    try:
        # Get user's 2FA configuration
        from models import TwoFactorAuth
        two_factor = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user_id).first()
        
        if not two_factor or not two_factor.is_enabled:
            return jsonify({"error": "2FA not enabled"}), 400
        
        # Try to verify with 2FA code first
        if security_service.verify_two_factor_code(two_factor.secret, code):
            two_factor.last_used = datetime.utcnow()
            db.commit()
            
            # Log security event
            security_service.log_security_event(
                user_id=user_id,
                event=SecurityEvent.TWO_FACTOR_VERIFY,
                description="2FA login verification successful",
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', ''),
                db=db
            )
            
            return jsonify({
                "message": "2FA verification successful"
            }), 200
        
        # Try backup code
        is_valid, updated_codes = security_service.verify_backup_code(two_factor.backup_codes, code)
        if is_valid:
            two_factor.backup_codes = updated_codes
            two_factor.last_used = datetime.utcnow()
            db.commit()
            
            # Log security event
            security_service.log_security_event(
                user_id=user_id,
                event=SecurityEvent.TWO_FACTOR_VERIFY,
                description="2FA login verification with backup code",
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', ''),
                db=db
            )
            
            return jsonify({
                "message": "2FA verification with backup code successful"
            }), 200
        
        return jsonify({"error": "Invalid verification code"}), 400
        
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@security_bp.route('/2fa/disable', methods=['POST'])
@jwt_required()
def disable_two_factor():
    """Disable two-factor authentication."""
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get('code', '')
    
    if not code:
        return jsonify({"error": "Verification code is required"}), 400
    
    db = next(get_db())
    
    try:
        # Get user's 2FA configuration
        from models import TwoFactorAuth
        two_factor = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user_id).first()
        
        if not two_factor or not two_factor.is_enabled:
            return jsonify({"error": "2FA not enabled"}), 400
        
        # Verify the code before disabling
        if (security_service.verify_two_factor_code(two_factor.secret, code) or 
            security_service.verify_backup_code(two_factor.backup_codes, code)[0]):
            
            # Disable 2FA
            two_factor.is_enabled = False
            db.commit()
            
            # Log security event
            security_service.log_security_event(
                user_id=user_id,
                event=SecurityEvent.TWO_FACTOR_DISABLE,
                description="2FA disabled",
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', ''),
                db=db
            )
            
            return jsonify({
                "message": "Two-factor authentication disabled successfully"
            }), 200
        else:
            return jsonify({"error": "Invalid verification code"}), 400
            
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@security_bp.route('/2fa/status', methods=['GET'])
@jwt_required()
def get_two_factor_status():
    """Get two-factor authentication status."""
    user_id = get_jwt_identity()
    db = next(get_db())
    
    try:
        from models import TwoFactorAuth
        two_factor = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user_id).first()
        
        if not two_factor:
            return jsonify({
                "enabled": False,
                "setup_complete": False
            }), 200
        
        return jsonify({
            "enabled": two_factor.is_enabled,
            "setup_complete": True,
            "backup_codes_remaining": len(two_factor.backup_codes),
            "last_used": two_factor.last_used.isoformat() if two_factor.last_used else None
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# AUDIT LOGGING ROUTES
# ============================================================================

@security_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    """Get audit logs with filtering."""
    user_id = get_jwt_identity()
    
    # Get query parameters
    event = request.args.get('event')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = int(request.args.get('limit', 100))
    
    # Parse dates
    start_dt = None
    end_dt = None
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    # Parse event
    event_enum = None
    if event:
        try:
            event_enum = SecurityEvent(event)
        except ValueError:
            return jsonify({"error": "Invalid event type"}), 400
    
    db = next(get_db())
    logs = security_service.get_audit_logs(
        user_id=user_id,
        event=event_enum,
        start_date=start_dt,
        end_date=end_dt,
        limit=limit,
        db=db
    )
    
    # Convert to dict format
    log_list = []
    for log in logs:
        log_list.append({
            "id": log.user_id,  # Using user_id as placeholder for log ID
            "event": log.event.value,
            "description": log.description,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "metadata": log.metadata,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        })
    
    return jsonify({
        "logs": log_list,
        "total": len(log_list)
    }), 200


# ============================================================================
# GDPR COMPLIANCE ROUTES
# ============================================================================

@security_bp.route('/gdpr/request', methods=['POST'])
@jwt_required()
def create_gdpr_request():
    """Create a GDPR data request."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    request_type = data.get('request_type')
    description = data.get('description', '')
    
    if not request_type:
        return jsonify({"error": "Request type is required"}), 400
    
    try:
        request_type_enum = DataRequestType(request_type)
    except ValueError:
        return jsonify({"error": "Invalid request type"}), 400
    
    db = next(get_db())
    
    try:
        data_request = security_service.create_data_request(
            user_id=user_id,
            request_type=request_type_enum,
            description=description,
            db=db
        )
        
        return jsonify({
            "request_id": data_request.id,
            "request_type": data_request.request_type,
            "status": data_request.status,
            "created_at": data_request.created_at.isoformat(),
            "message": "GDPR request created successfully"
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@security_bp.route('/gdpr/export', methods=['POST'])
@jwt_required()
def export_user_data():
    """Export user data for GDPR compliance."""
    user_id = get_jwt_identity()
    db = next(get_db())
    
    try:
        user_data = security_service.export_user_data(user_id, db)
        
        # Log the export
        security_service.log_security_event(
            user_id=user_id,
            event=SecurityEvent.DATA_EXPORT,
            description="User data exported for GDPR compliance",
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', ''),
            metadata={"export_size": len(str(user_data))},
            db=db
        )
        
        return jsonify({
            "data": user_data,
            "export_date": datetime.utcnow().isoformat(),
            "message": "Data exported successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@security_bp.route('/gdpr/delete', methods=['POST'])
@jwt_required()
def delete_user_data():
    """Delete user data for GDPR compliance."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Require confirmation
    confirmation = data.get('confirmation')
    if confirmation != 'I understand this action cannot be undone':
        return jsonify({
            "error": "Please confirm deletion by typing: 'I understand this action cannot be undone'"
        }), 400
    
    db = next(get_db())
    
    try:
        success = security_service.delete_user_data(user_id, db)
        
        if success:
            return jsonify({
                "message": "User data deleted successfully for GDPR compliance"
            }), 200
        else:
            return jsonify({"error": "Failed to delete user data"}), 500
            
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@security_bp.route('/gdpr/requests', methods=['GET'])
@jwt_required()
def get_gdpr_requests():
    """Get user's GDPR requests."""
    user_id = get_jwt_identity()
    db = next(get_db())
    
    try:
        from models import DataRequest
        requests = db.query(DataRequest).filter(DataRequest.user_id == user_id).all()
        
        request_list = []
        for req in requests:
            request_list.append({
                "id": req.id,
                "request_type": req.request_type,
                "description": req.description,
                "status": req.status,
                "data_url": req.data_url,
                "created_at": req.created_at.isoformat(),
                "completed_at": req.completed_at.isoformat() if req.completed_at else None
            })
        
        return jsonify({
            "requests": request_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# SECURITY MONITORING ROUTES
# ============================================================================

@security_bp.route('/security/alerts', methods=['GET'])
@jwt_required()
def get_security_alerts():
    """Get security alerts."""
    severity = request.args.get('severity')
    resolved = request.args.get('resolved')
    limit = int(request.args.get('limit', 50))
    
    # Parse resolved parameter
    resolved_bool = None
    if resolved is not None:
        resolved_bool = resolved.lower() == 'true'
    
    alerts = security_service.get_security_alerts(
        severity=severity,
        resolved=resolved_bool,
        limit=limit
    )
    
    # Convert to dict format
    alert_list = []
    for alert in alerts:
        alert_list.append({
            "alert_id": alert.alert_id,
            "type": alert.type,
            "severity": alert.severity,
            "description": alert.description,
            "user_id": alert.user_id,
            "ip_address": alert.ip_address,
            "metadata": alert.metadata,
            "resolved": alert.resolved,
            "timestamp": alert.timestamp.isoformat()
        })
    
    return jsonify({
        "alerts": alert_list,
        "total": len(alert_list)
    }), 200


@security_bp.route('/security/alerts/<alert_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_security_alert(alert_id):
    """Resolve a security alert."""
    success = security_service.resolve_security_alert(alert_id)
    
    if success:
        return jsonify({
            "message": "Security alert resolved successfully"
        }), 200
    else:
        return jsonify({"error": "Alert not found"}), 404


@security_bp.route('/security/stats', methods=['GET'])
@jwt_required()
def get_security_stats():
    """Get security statistics."""
    stats = security_service.get_security_stats()
    
    return jsonify(stats), 200


# ============================================================================
# PASSWORD MANAGEMENT ROUTES
# ============================================================================

@security_bp.route('/password/change', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({"error": "Current and new passwords are required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400
    
    db = next(get_db())
    
    try:
        from models import User
        from auth import verify_password, hash_password
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Verify current password
        if not verify_password(current_password, user.password_hash):
            return jsonify({"error": "Current password is incorrect"}), 400
        
        # Update password
        user.password_hash = hash_password(new_password)
        db.commit()
        
        # Log security event
        security_service.log_security_event(
            user_id=user_id,
            event=SecurityEvent.PASSWORD_CHANGE,
            description="Password changed successfully",
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', ''),
            db=db
        )
        
        return jsonify({
            "message": "Password changed successfully"
        }), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@security_bp.route('/password/reset', methods=['POST'])
def reset_password():
    """Request password reset."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    db = next(get_db())
    
    try:
        from models import User
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Don't reveal if user exists or not
            return jsonify({
                "message": "If the email exists, a password reset link has been sent"
            }), 200
        
        # Generate reset token (in a real app, you'd send an email)
        reset_token = "reset_token_placeholder"  # This would be a real token
        
        # Log security event
        security_service.log_security_event(
            user_id=user.id,
            event=SecurityEvent.PASSWORD_RESET,
            description="Password reset requested",
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', ''),
            db=db
        )
        
        return jsonify({
            "message": "If the email exists, a password reset link has been sent"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
