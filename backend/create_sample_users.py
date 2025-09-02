#!/usr/bin/env python3
"""
Sample User Creation Script
===========================

This script creates sample users for testing the Lead-Nexus application.
"""

from models import SessionLocal, User, init_db
from auth import hash_password
from datetime import datetime

def create_sample_users():
    """Create sample users for testing."""
    
    # Initialize database
    print("🚀 Initializing database...")
    init_db()
    
    # Sample users data
    sample_users = [
        {
            "email": "client@example.com",
            "password": "password123",
            "role": "client"
        },
        {
            "email": "vendor@example.com", 
            "password": "password123",
            "role": "vendor"
        },
        {
            "email": "admin@example.com",
            "password": "password123", 
            "role": "admin"
        }
    ]
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).all()
        if existing_users:
            print("⚠️  Users already exist in database. Skipping creation.")
            return
        
        # Create sample users
        created_users = []
        for user_data in sample_users:
            # Check if user already exists
            existing_user = db.query(User).filter_by(email=user_data["email"]).first()
            if existing_user:
                print(f"⚠️  User {user_data['email']} already exists. Skipping.")
                continue
            
            # Create new user
            user = User(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"],
                is_active=True,
                credits=100.0 if user_data["role"] == "client" else 0.0,  # Give clients some credits
                auto_response_enabled=False,
                notification_preferences={
                    'email_messages': True,
                    'email_notifications': True,
                    'in_app_notifications': True
                },
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(user)
            created_users.append(user_data["email"])
        
        # Commit changes
        db.commit()
        
        print("✅ Sample users created successfully!")
        print("\n📋 Sample Login Credentials:")
        print("  Client: client@example.com / password123")
        print("  Vendor: vendor@example.com / password123") 
        print("  Admin:  admin@example.com / password123")
        print(f"\nCreated {len(created_users)} new users: {', '.join(created_users)}")
        
    except Exception as e:
        print(f"❌ Error creating sample users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_users()
