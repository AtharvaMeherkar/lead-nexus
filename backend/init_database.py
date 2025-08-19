#!/usr/bin/env python3
"""
Database initialization script for Lead-Nexus.
Creates all tables and adds sample data for testing.
"""

import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import init_db, SessionLocal, User, Lead, Purchase
from auth import hash_password


def create_sample_data():
    """Create sample users and leads for testing."""
    print("📝 Creating sample data...")
    
    with SessionLocal() as db:
        # Check if we already have users
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("✅ Sample data already exists, skipping...")
            return
        
        # Create sample users
        users = [
            User(
                email="client@example.com",
                password_hash=hash_password("password123"),
                role="client",
                is_active=True
            ),
            User(
                email="vendor@example.com", 
                password_hash=hash_password("password123"),
                role="vendor",
                is_active=True
            ),
            User(
                email="admin@example.com",
                password_hash=hash_password("password123"), 
                role="admin",
                is_active=True
            )
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # Get the vendor user for creating leads
        vendor = db.query(User).filter_by(role="vendor").first()
        
        # Create sample leads
        sample_leads = [
            {
                "title": "Tech Startup Looking for Investors",
                "description": "Promising SaaS startup in the fintech space seeking Series A funding",
                "industry": "technology",
                "price": 150.0,
                "contact_name": "John Smith",
                "contact_email": "john@techstartup.com",
                "contact_phone": "+1-555-0123",
                "company_name": "TechStartup Inc",
                "location": "San Francisco, CA",
                "extra": {
                    "description": "High-growth SaaS company with 200% YoY growth",
                    "annual_revenue": "500000",
                    "employee_count": "25"
                }
            },
            {
                "title": "Healthcare Provider Expansion Opportunity",
                "description": "Established healthcare provider looking to expand into new markets",
                "industry": "healthcare", 
                "price": 250.0,
                "contact_name": "Dr. Sarah Johnson",
                "contact_email": "sarah@healthcare.com",
                "contact_phone": "+1-555-0456",
                "company_name": "HealthCare Plus",
                "location": "New York, NY",
                "extra": {
                    "description": "Multi-location healthcare provider with 15 years in business",
                    "annual_revenue": "2000000",
                    "employee_count": "150"
                }
            },
            {
                "title": "Manufacturing Company Seeking Partners",
                "description": "Automotive parts manufacturer looking for distribution partners",
                "industry": "manufacturing",
                "price": 100.0,
                "contact_name": "Mike Chen",
                "contact_email": "mike@manufacturing.com", 
                "contact_phone": "+1-555-0789",
                "company_name": "AutoParts Manufacturing",
                "location": "Detroit, MI",
                "extra": {
                    "description": "Established manufacturer with ISO 9001 certification",
                    "annual_revenue": "5000000",
                    "employee_count": "300"
                }
            },
            {
                "title": "E-commerce Business for Sale",
                "description": "Profitable online retail business with established customer base",
                "industry": "retail",
                "price": 500.0,
                "contact_name": "Lisa Rodriguez",
                "contact_email": "lisa@ecommerce.com",
                "contact_phone": "+1-555-0321",
                "company_name": "OnlineRetail Pro",
                "location": "Austin, TX", 
                "extra": {
                    "description": "Profitable e-commerce business with 50K monthly visitors",
                    "annual_revenue": "800000",
                    "employee_count": "12"
                }
            },
            {
                "title": "Real Estate Investment Opportunity",
                "description": "Commercial property portfolio with strong rental income",
                "industry": "real estate",
                "price": 300.0,
                "contact_name": "David Wilson",
                "contact_email": "david@realestate.com",
                "contact_phone": "+1-555-0654",
                "company_name": "Wilson Properties",
                "location": "Miami, FL",
                "extra": {
                    "description": "Portfolio of 5 commercial properties with 95% occupancy",
                    "annual_revenue": "1200000",
                    "employee_count": "8"
                }
            }
        ]
        
        for lead_data in sample_leads:
            lead = Lead(
                title=lead_data["title"],
                description=lead_data["description"],
                industry=lead_data["industry"],
                price=lead_data["price"],
                contact_name=lead_data["contact_name"],
                contact_email=lead_data["contact_email"],
                contact_phone=lead_data["contact_phone"],
                company_name=lead_data["company_name"],
                location=lead_data["location"],
                extra=lead_data["extra"],
                vendor_id=vendor.id,
                status="available"
            )
            db.add(lead)
        
        db.commit()
        print(f"✅ Created {len(users)} users and {len(sample_leads)} leads")


def main():
    """Main initialization function."""
    print("🚀 Initializing Lead-Nexus Database...")
    
    try:
        # Initialize database tables
        print("📊 Creating database tables...")
        init_db()
        print("✅ Database tables created successfully")
        
        # Create sample data
        create_sample_data()
        
        print("🎉 Database initialization completed successfully!")
        print("\n📋 Sample Login Credentials:")
        print("  Client: client@example.com / password123")
        print("  Vendor: vendor@example.com / password123") 
        print("  Admin:  admin@example.com / password123")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
