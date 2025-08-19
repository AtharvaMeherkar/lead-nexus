from __future__ import annotations

from typing import Any, Dict

from flask import Blueprint, jsonify, request
from sqlalchemy import select

from auth import token_required
from models import SessionLocal, User

bp = Blueprint("profile", __name__, url_prefix="/api/profile")


@bp.get("")
@token_required()
def get_profile():
    """Get current user's profile information."""
    user_id = request.user_id  # type: ignore[attr-defined]
    
    with SessionLocal() as db:
        user = db.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        profile_data = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "username": user.email.split('@')[0],  # Use email prefix as username
        }
        
        return jsonify(profile_data)


@bp.put("")
@token_required()
def update_profile():
    """Update current user's profile information."""
    user_id = request.user_id  # type: ignore[attr-defined]
    data = request.get_json(force=True)
    
    with SessionLocal() as db:
        user = db.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Only allow updating certain fields
        if "email" in data:
            # Check if email is already taken by another user
            existing_user = db.execute(
                select(User).where(User.email == data["email"].lower())
            ).scalar_one_or_none()
            
            if existing_user and existing_user.id != user_id:
                return jsonify({"error": "Email already in use"}), 400
            
            user.email = data["email"].lower()
        
        db.commit()
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
            }
        })


@bp.post("/change-password")
@token_required()
def change_password():
    """Change user's password."""
    user_id = request.user_id  # type: ignore[attr-defined]
    data = request.get_json(force=True)
    
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"error": "Current password and new password are required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400
    
    with SessionLocal() as db:
        user = db.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Verify current password
        from auth import verify_password, hash_password
        if not verify_password(current_password, user.password_hash):
            return jsonify({"error": "Current password is incorrect"}), 400
        
        # Update password
        user.password_hash = hash_password(new_password)
        db.commit()
        
        return jsonify({"message": "Password changed successfully"})


@bp.delete("")
@token_required()
def delete_account():
    """Delete user account (soft delete by deactivating)."""
    user_id = request.user_id  # type: ignore[attr-defined]
    
    with SessionLocal() as db:
        user = db.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Soft delete by deactivating the account
        user.is_active = False
        db.commit()
        
        return jsonify({"message": "Account deactivated successfully"})
