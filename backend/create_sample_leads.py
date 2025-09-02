#!/usr/bin/env python3
"""
Sample Lead Creation Script
==========================

This script creates sample leads for testing the Lead-Nexus marketplace.
"""

from models import SessionLocal, Lead, User, init_db
from datetime import datetime
import random

def create_sample_leads():
    """Create sample leads for testing."""
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Get vendor user
        vendor = db.query(User).filter_by(email="vendor@example.com").first()
        if not vendor:
            print("❌ Vendor user not found. Please run create_sample_users.py first.")
            return
        
        # Check if leads already exist
        existing_leads = db.query(Lead).all()
        if existing_leads:
            print("⚠️  Leads already exist in database. Skipping creation.")
            return
        
        # Sample leads data
        sample_leads = [
            {
                "title": "Tech Startup CEO - Series A Funding",
                "description": "CEO of a promising tech startup looking for Series A funding. Company has 50+ employees and $2M ARR.",
                "industry": "Technology",
                "price": 150.0,
                "contact_name": "Sarah Johnson",
                "contact_email": "sarah.johnson@techstartup.com",
                "contact_phone": "+1-555-0123",
                "company_name": "TechStartup Inc.",
                "location": "San Francisco, CA",
                "status": "available"
            },
            {
                "title": "Manufacturing Plant Manager",
                "description": "Experienced plant manager with 15+ years in automotive manufacturing. Looking for new opportunities.",
                "industry": "Manufacturing",
                "price": 75.0,
                "contact_name": "Michael Chen",
                "contact_email": "mchen@automotive.com",
                "contact_phone": "+1-555-0456",
                "company_name": "AutoParts Manufacturing",
                "location": "Detroit, MI",
                "status": "available"
            },
            {
                "title": "Healthcare Administrator - Hospital Network",
                "description": "Senior healthcare administrator managing a network of 5 hospitals. 10+ years experience in healthcare management.",
                "industry": "Healthcare",
                "price": 200.0,
                "contact_name": "Dr. Emily Rodriguez",
                "contact_email": "erodriguez@healthcare.net",
                "contact_phone": "+1-555-0789",
                "company_name": "Metro Healthcare Network",
                "location": "Boston, MA",
                "status": "available"
            },
            {
                "title": "Real Estate Developer - Commercial Projects",
                "description": "Commercial real estate developer with portfolio of $500M+ in completed projects. Seeking new partnerships.",
                "industry": "Real Estate",
                "price": 300.0,
                "contact_name": "David Thompson",
                "contact_email": "dthompson@redev.com",
                "contact_phone": "+1-555-0321",
                "company_name": "Thompson Development Group",
                "location": "New York, NY",
                "status": "available"
            },
            {
                "title": "Marketing Director - E-commerce",
                "description": "Marketing director for a growing e-commerce company. 8+ years experience in digital marketing and growth.",
                "industry": "Marketing",
                "price": 100.0,
                "contact_name": "Lisa Wang",
                "contact_email": "lwang@ecommerce.com",
                "contact_phone": "+1-555-0654",
                "company_name": "ShopOnline Inc.",
                "location": "Austin, TX",
                "status": "available"
            },
            {
                "title": "Financial Controller - Investment Firm",
                "description": "Financial controller for a boutique investment firm. CPA with 12+ years in financial services.",
                "industry": "Finance",
                "price": 175.0,
                "contact_name": "Robert Kim",
                "contact_email": "rkim@investments.com",
                "contact_phone": "+1-555-0987",
                "company_name": "Capital Partners LLC",
                "location": "Chicago, IL",
                "status": "available"
            },
            {
                "title": "Software Engineer - AI/ML Specialist",
                "description": "Senior software engineer specializing in AI and machine learning. PhD in Computer Science with 6+ years experience.",
                "industry": "Technology",
                "price": 125.0,
                "contact_name": "Alex Patel",
                "contact_email": "apatel@ai-tech.com",
                "contact_phone": "+1-555-0124",
                "company_name": "AI Solutions Corp",
                "location": "Seattle, WA",
                "status": "available"
            },
            {
                "title": "Sales Manager - B2B Software",
                "description": "Sales manager for B2B software company. Consistently exceeds targets by 150%. 7+ years in enterprise sales.",
                "industry": "Sales",
                "price": 90.0,
                "contact_name": "Jennifer Martinez",
                "contact_email": "jmartinez@b2bsoft.com",
                "contact_phone": "+1-555-0457",
                "company_name": "Enterprise Software Solutions",
                "location": "Denver, CO",
                "status": "available"
            }
        ]
        
        # Create sample leads
        created_leads = []
        for lead_data in sample_leads:
            lead = Lead(
                title=lead_data["title"],
                description=lead_data["description"],
                industry=lead_data["industry"],
                price=lead_data["price"],
                vendor_id=vendor.id,
                status=lead_data["status"],
                extra={
                    "contact_name": lead_data["contact_name"],
                    "contact_email": lead_data["contact_email"],
                    "contact_phone": lead_data["contact_phone"],
                    "company_name": lead_data["company_name"],
                    "location": lead_data["location"]
                },
                created_at=datetime.utcnow()
            )
            
            db.add(lead)
            created_leads.append(lead_data["title"])
        
        # Commit changes
        db.commit()
        
        print("✅ Sample leads created successfully!")
        print(f"\nCreated {len(created_leads)} new leads:")
        for i, title in enumerate(created_leads, 1):
            print(f"  {i}. {title}")
        
    except Exception as e:
        print(f"❌ Error creating sample leads: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_leads()
