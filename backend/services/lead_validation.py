import re
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from models import Lead, LeadValidation, LeadValidationStatus, ApprovalStatus


class LeadValidator:
    """Comprehensive lead validation service with automated scoring and quality checks."""
    
    def __init__(self):
        self.validation_rules = {
            'email': {
                'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                'weight': 0.15
            },
            'phone': {
                'pattern': r'^[\+]?[1-9][\d]{0,15}$',
                'weight': 0.10
            },
            'company_name': {
                'min_length': 2,
                'max_length': 100,
                'weight': 0.10
            },
            'contact_name': {
                'min_length': 2,
                'max_length': 50,
                'weight': 0.10
            },
            'price': {
                'min_value': 10.0,
                'max_value': 10000.0,
                'weight': 0.05
            },
            'industry': {
                'valid_industries': [
                    'technology', 'healthcare', 'finance', 'education', 'retail',
                    'manufacturing', 'real estate', 'legal', 'marketing',
                    'food & beverage', 'construction', 'consulting', 'non-profit', 'e-commerce'
                ],
                'weight': 0.05
            },
            'location': {
                'min_length': 3,
                'max_length': 100,
                'weight': 0.05
            },
            'description': {
                'min_length': 10,
                'max_length': 1000,
                'weight': 0.10
            }
        }
    
    def validate_lead(self, lead_data: Dict) -> Tuple[float, Dict, List[str]]:
        """
        Validate a lead and return score, details, and issues.
        
        Args:
            lead_data: Dictionary containing lead information
            
        Returns:
            Tuple of (score, validation_details, issues)
        """
        score = 0.0
        validation_details = {}
        issues = []
        
        # Validate email
        email_score, email_details, email_issues = self._validate_email(lead_data.get('contact_email', ''))
        score += email_score
        validation_details['email'] = email_details
        issues.extend(email_issues)
        
        # Validate phone
        phone_score, phone_details, phone_issues = self._validate_phone(lead_data.get('contact_phone', ''))
        score += phone_score
        validation_details['phone'] = phone_details
        issues.extend(phone_issues)
        
        # Validate company name
        company_score, company_details, company_issues = self._validate_company_name(lead_data.get('company_name', ''))
        score += company_score
        validation_details['company_name'] = company_details
        issues.extend(company_issues)
        
        # Validate contact name
        contact_score, contact_details, contact_issues = self._validate_contact_name(lead_data.get('contact_name', ''))
        score += contact_score
        validation_details['contact_name'] = contact_details
        issues.extend(contact_issues)
        
        # Validate price
        price_score, price_details, price_issues = self._validate_price(lead_data.get('price', 0))
        score += price_score
        validation_details['price'] = price_details
        issues.extend(price_issues)
        
        # Validate industry
        industry_score, industry_details, industry_issues = self._validate_industry(lead_data.get('industry', ''))
        score += industry_score
        validation_details['industry'] = industry_details
        issues.extend(industry_issues)
        
        # Validate location
        location_score, location_details, location_issues = self._validate_location(lead_data.get('location', ''))
        score += location_score
        validation_details['location'] = location_details
        issues.extend(location_issues)
        
        # Validate description
        description_score, description_details, description_issues = self._validate_description(lead_data.get('description', ''))
        score += description_score
        validation_details['description'] = description_details
        issues.extend(description_issues)
        
        # Bonus points for complete information
        completeness_bonus = self._calculate_completeness_bonus(lead_data)
        score += completeness_bonus
        validation_details['completeness_bonus'] = {
            'score': completeness_bonus,
            'reason': 'Bonus for complete lead information'
        }
        
        return min(score, 1.0), validation_details, issues
    
    def _validate_email(self, email: str) -> Tuple[float, Dict, List[str]]:
        """Validate email format and quality."""
        if not email:
            return 0.0, {'valid': False, 'reason': 'Email is required'}, ['Email is required']
        
        pattern = self.validation_rules['email']['pattern']
        weight = self.validation_rules['email']['weight']
        
        if re.match(pattern, email):
            # Additional quality checks
            quality_score = 0.0
            issues = []
            
            # Check for common disposable email domains
            disposable_domains = ['temp-mail.org', '10minutemail.com', 'guerrillamail.com']
            domain = email.split('@')[1].lower()
            if domain in disposable_domains:
                quality_score = 0.5
                issues.append('Disposable email domain detected')
            
            # Check for business email indicators
            business_indicators = ['info@', 'contact@', 'sales@', 'hello@', 'support@']
            if any(indicator in email.lower() for indicator in business_indicators):
                quality_score = 1.0
            elif quality_score == 0.0:
                quality_score = 0.8
            
            return weight * quality_score, {
                'valid': True,
                'quality_score': quality_score,
                'domain': domain
            }, issues
        else:
            return 0.0, {'valid': False, 'reason': 'Invalid email format'}, ['Invalid email format']
    
    def _validate_phone(self, phone: str) -> Tuple[float, Dict, List[str]]:
        """Validate phone number format."""
        if not phone:
            return 0.0, {'valid': False, 'reason': 'Phone number is required'}, ['Phone number is required']
        
        pattern = self.validation_rules['phone']['pattern']
        weight = self.validation_rules['phone']['weight']
        
        # Clean phone number
        clean_phone = re.sub(r'[^\d+]', '', phone)
        
        if re.match(pattern, clean_phone):
            return weight, {'valid': True, 'clean_number': clean_phone}, []
        else:
            return 0.0, {'valid': False, 'reason': 'Invalid phone format'}, ['Invalid phone format']
    
    def _validate_company_name(self, company_name: str) -> Tuple[float, Dict, List[str]]:
        """Validate company name."""
        if not company_name:
            return 0.0, {'valid': False, 'reason': 'Company name is required'}, ['Company name is required']
        
        min_length = self.validation_rules['company_name']['min_length']
        max_length = self.validation_rules['company_name']['max_length']
        weight = self.validation_rules['company_name']['weight']
        
        if min_length <= len(company_name) <= max_length:
            return weight, {'valid': True, 'length': len(company_name)}, []
        else:
            return 0.0, {
                'valid': False,
                'reason': f'Company name must be between {min_length} and {max_length} characters'
            }, [f'Company name must be between {min_length} and {max_length} characters']
    
    def _validate_contact_name(self, contact_name: str) -> Tuple[float, Dict, List[str]]:
        """Validate contact name."""
        if not contact_name:
            return 0.0, {'valid': False, 'reason': 'Contact name is required'}, ['Contact name is required']
        
        min_length = self.validation_rules['contact_name']['min_length']
        max_length = self.validation_rules['contact_name']['max_length']
        weight = self.validation_rules['contact_name']['weight']
        
        if min_length <= len(contact_name) <= max_length:
            return weight, {'valid': True, 'length': len(contact_name)}, []
        else:
            return 0.0, {
                'valid': False,
                'reason': f'Contact name must be between {min_length} and {max_length} characters'
            }, [f'Contact name must be between {min_length} and {max_length} characters']
    
    def _validate_price(self, price: float) -> Tuple[float, Dict, List[str]]:
        """Validate lead price."""
        min_value = self.validation_rules['price']['min_value']
        max_value = self.validation_rules['price']['max_value']
        weight = self.validation_rules['price']['weight']
        
        if min_value <= price <= max_value:
            return weight, {'valid': True, 'price': price}, []
        else:
            return 0.0, {
                'valid': False,
                'reason': f'Price must be between ${min_value} and ${max_value}'
            }, [f'Price must be between ${min_value} and ${max_value}']
    
    def _validate_industry(self, industry: str) -> Tuple[float, Dict, List[str]]:
        """Validate industry."""
        valid_industries = self.validation_rules['industry']['valid_industries']
        weight = self.validation_rules['industry']['weight']
        
        if industry.lower() in valid_industries:
            return weight, {'valid': True, 'industry': industry}, []
        else:
            return 0.0, {
                'valid': False,
                'reason': f'Industry must be one of: {", ".join(valid_industries)}'
            }, [f'Industry must be one of: {", ".join(valid_industries)}']
    
    def _validate_location(self, location: str) -> Tuple[float, Dict, List[str]]:
        """Validate location."""
        if not location:
            return 0.0, {'valid': False, 'reason': 'Location is required'}, ['Location is required']
        
        min_length = self.validation_rules['location']['min_length']
        max_length = self.validation_rules['location']['max_length']
        weight = self.validation_rules['location']['weight']
        
        if min_length <= len(location) <= max_length:
            return weight, {'valid': True, 'length': len(location)}, []
        else:
            return 0.0, {
                'valid': False,
                'reason': f'Location must be between {min_length} and {max_length} characters'
            }, [f'Location must be between {min_length} and {max_length} characters']
    
    def _validate_description(self, description: str) -> Tuple[float, Dict, List[str]]:
        """Validate lead description."""
        if not description:
            return 0.0, {'valid': False, 'reason': 'Description is required'}, ['Description is required']
        
        min_length = self.validation_rules['description']['min_length']
        max_length = self.validation_rules['description']['max_length']
        weight = self.validation_rules['description']['weight']
        
        if min_length <= len(description) <= max_length:
            return weight, {'valid': True, 'length': len(description)}, []
        else:
            return 0.0, {
                'valid': False,
                'reason': f'Description must be between {min_length} and {max_length} characters'
            }, [f'Description must be between {min_length} and {max_length} characters']
    
    def _calculate_completeness_bonus(self, lead_data: Dict) -> float:
        """Calculate bonus points for complete lead information."""
        required_fields = ['contact_email', 'contact_phone', 'company_name', 'contact_name', 'location', 'description']
        optional_fields = ['extra']
        
        completed_required = sum(1 for field in required_fields if lead_data.get(field))
        completed_optional = sum(1 for field in optional_fields if lead_data.get(field))
        
        required_completion = completed_required / len(required_fields)
        optional_bonus = completed_optional / len(optional_fields) * 0.1
        
        return (required_completion * 0.2) + optional_bonus  # Max 0.3 bonus
    
    def determine_validation_status(self, score: float, issues: List[str]) -> LeadValidationStatus:
        """Determine validation status based on score and issues."""
        if score >= 0.8 and len(issues) == 0:
            return LeadValidationStatus.VALIDATED
        elif score >= 0.6:
            return LeadValidationStatus.NEEDS_REVIEW
        else:
            return LeadValidationStatus.REJECTED
    
    def determine_approval_status(self, validation_status: LeadValidationStatus, score: float) -> ApprovalStatus:
        """Determine approval status based on validation status and score."""
        if validation_status == LeadValidationStatus.VALIDATED and score >= 0.8:
            return ApprovalStatus.APPROVED
        elif validation_status == LeadValidationStatus.REJECTED:
            return ApprovalStatus.REJECTED
        else:
            return ApprovalStatus.UNDER_REVIEW


def validate_and_save_lead(db: Session, lead_data: Dict, vendor_id: int) -> Tuple[Lead, LeadValidation]:
    """Validate a lead and save it to the database with validation results."""
    validator = LeadValidator()
    score, validation_details, issues = validator.validate_lead(lead_data)
    
    # Create lead
    lead = Lead(
        title=lead_data.get('title', ''),
        description=lead_data.get('description', ''),
        industry=lead_data.get('industry', ''),
        price=lead_data.get('price', 0.0),
        contact_name=lead_data.get('contact_name', ''),
        contact_email=lead_data.get('contact_email', ''),
        contact_phone=lead_data.get('contact_phone', ''),
        company_name=lead_data.get('company_name', ''),
        location=lead_data.get('location', ''),
        extra=lead_data.get('extra', {}),
        vendor_id=vendor_id,
        lead_score=score,
        validation_score=score,
        validation_status=validator.determine_validation_status(score, issues),
        approval_status=validator.determine_approval_status(
            validator.determine_validation_status(score, issues), score
        ),
        validation_notes='; '.join(issues) if issues else 'Validation passed',
        validation_date=datetime.utcnow()
    )
    
    db.add(lead)
    db.flush()  # Get the lead ID
    
    # Create validation record
    validation = LeadValidation(
        lead_id=lead.id,
        validation_type='automated',
        score=score,
        details=validation_details,
        notes='; '.join(issues) if issues else 'Automated validation completed successfully'
    )
    
    db.add(validation)
    db.commit()
    
    return lead, validation
