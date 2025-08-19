#!/usr/bin/env python3
"""
Script to create sample leads in the database for testing.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import SessionLocal, Lead, User
from sqlalchemy import select

def create_sample_data():
    with SessionLocal() as db:
        # Check if we have any vendors
        vendors = db.execute(select(User).where(User.role == "vendor")).all()
        if not vendors:
            print("No vendors found. Please create a vendor account first.")
            return
        
        vendor = vendors[0][0]  # Get the first vendor
        
        # Check if we already have leads
        existing_leads = db.execute(select(Lead)).all()
        if existing_leads:
            print(f"Found {len(existing_leads)} existing leads. Skipping sample data creation.")
            return
        
        # Create sample leads
        sample_leads = [
            {
                "title": "Healthcare Decision Makers",
                "industry": "Healthcare",
                "price": 149.50,
                "contact_email": "contact@healthcare.com",
                "extra": {
                    "description": "High-quality leads for healthcare decision makers including hospital administrators, clinic managers, and medical practice owners.",
                    "company_name": "Healthcare Solutions Inc.",
                    "contact_name": "Dr. Sarah Johnson",
                    "contact_phone": "+1-555-0123",
                    "location": "New York, NY"
                }
            },
            {
                "title": "Tech Startup Founders",
                "industry": "Technology",
                "price": 199.99,
                "contact_email": "founders@techstartup.com",
                "extra": {
                    "description": "Verified leads for technology startup founders and CTOs looking for growth solutions.",
                    "company_name": "TechStart Ventures",
                    "contact_name": "Mike Chen",
                    "contact_phone": "+1-555-0456",
                    "location": "San Francisco, CA"
                }
            },
            {
                "title": "Financial Services Executives",
                "industry": "Finance",
                "price": 299.00,
                "contact_email": "executives@financecorp.com",
                "extra": {
                    "description": "Senior executives in financial services including banks, investment firms, and insurance companies.",
                    "company_name": "FinanceCorp International",
                    "contact_name": "Jennifer Williams",
                    "contact_phone": "+1-555-0789",
                    "location": "Chicago, IL"
                }
            },
            {
                "title": "Educational Institution Leaders",
                "industry": "Education",
                "price": 89.99,
                "contact_email": "leaders@eduinst.com",
                "extra": {
                    "description": "School principals, university deans, and educational administrators seeking innovative solutions.",
                    "company_name": "EduInst Network",
                    "contact_name": "Prof. Robert Davis",
                    "contact_phone": "+1-555-0321",
                    "location": "Boston, MA"
                }
            },
            {
                "title": "Retail Chain Managers",
                "industry": "Retail",
                "price": 129.50,
                "contact_email": "managers@retailchain.com",
                "extra": {
                    "description": "Store managers and retail chain executives looking for operational improvements.",
                    "company_name": "RetailChain Solutions",
                    "contact_name": "Lisa Rodriguez",
                    "contact_phone": "+1-555-0654",
                    "location": "Miami, FL"
                }
            }
        ]
        
        for lead_data in sample_leads:
            lead = Lead(
                title=lead_data["title"],
                industry=lead_data["industry"],
                price=lead_data["price"],
                contact_email=lead_data["contact_email"],
                extra=lead_data["extra"],
                vendor_id=vendor.id,
                status="available"
            )
            db.add(lead)
        
        db.commit()
        print(f"Created {len(sample_leads)} sample leads successfully!")

if __name__ == "__main__":
    create_sample_data()
