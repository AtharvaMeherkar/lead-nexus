from typing import Dict, Tuple
import re


REQUIRED_FIELDS = ["title", "industry", "price"]
EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

# Common industry categories for validation
VALID_INDUSTRIES = [
    "technology", "healthcare", "finance", "education", "manufacturing", 
    "retail", "real estate", "automotive", "consulting", "marketing",
    "software", "saas", "e-commerce", "telecommunications", "energy",
    "construction", "agriculture", "transportation", "media", "entertainment",
    "hospitality", "legal", "insurance", "banking", "pharmaceuticals"
]


def validate_lead_row(row: Dict) -> Tuple[bool, str]:
    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in row or row[field] in (None, ""):
            return False, f"Missing required field: {field}"
    
    # Validate title length and content
    title = str(row["title"]).strip()
    if len(title) < 3:
        return False, "Title must be at least 3 characters long"
    if len(title) > 200:
        return False, "Title must be less than 200 characters"
    
    # Validate industry
    industry = str(row["industry"]).strip().lower()
    if len(industry) < 2:
        return False, "Industry must be at least 2 characters long"
    
    # Validate price
    try:
        price = float(row["price"])
        if price <= 0:
            return False, "Price must be a positive number"
        if price > 100000:  # Reasonable upper limit
            return False, "Price seems unreasonably high (max $100,000)"
    except (ValueError, TypeError):
        return False, "Invalid price format - must be a number"

    # Validate contact email if provided
    contact_email = row.get("contact_email", "").strip()
    if contact_email and not re.match(EMAIL_REGEX, contact_email):
        return False, "Invalid contact email format"
    
    # Validate phone if provided
    contact_phone = row.get("contact_phone", "").strip()
    if contact_phone:
        # Remove common phone formatting
        clean_phone = re.sub(r'[^\d+]', '', contact_phone)
        if len(clean_phone) < 10 or len(clean_phone) > 15:
            return False, "Invalid phone number format"
    
    # Validate company name if provided
    company_name = row.get("company_name", "").strip()
    if company_name and len(company_name) > 100:
        return False, "Company name must be less than 100 characters"
    
    # Validate contact name if provided
    contact_name = row.get("contact_name", "").strip()
    if contact_name and len(contact_name) > 100:
        return False, "Contact name must be less than 100 characters"

    return True, "ok"


def suggest_industry_corrections(industry: str) -> list:
    """Suggest industry corrections for typos or variations"""
    industry_lower = industry.lower()
    suggestions = []
    
    for valid_industry in VALID_INDUSTRIES:
        if industry_lower in valid_industry or valid_industry in industry_lower:
            suggestions.append(valid_industry)
        # Simple edit distance for typos
        elif abs(len(industry_lower) - len(valid_industry)) <= 2:
            suggestions.append(valid_industry)
    
    return suggestions[:3]  # Return top 3 suggestions


