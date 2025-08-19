#!/usr/bin/env python3
"""
Test script to verify database contents.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import SessionLocal, User, Lead
from auth import hash_password

def test_database():
    """Test database contents."""
    print("🔍 Testing database contents...")
    
    with SessionLocal() as db:
        # Check users
        users = db.query(User).all()
        print(f"📊 Found {len(users)} users:")
        for user in users:
            print(f"  - {user.email} (role: {user.role}, active: {user.is_active})")
        
        # Check leads
        leads = db.query(Lead).all()
        print(f"📊 Found {len(leads)} leads:")
        for lead in leads:
            print(f"  - {lead.title} (${lead.price}, status: {lead.status})")
        
        # Test password verification
        if users:
            test_user = users[0]
            test_password = "password123"
            from auth import verify_password
            is_valid = verify_password(test_password, test_user.password_hash)
            print(f"🔐 Password test for {test_user.email}: {'✅ Valid' if is_valid else '❌ Invalid'}")

if __name__ == "__main__":
    test_database()
