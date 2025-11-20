"""
ML-Based Lead Scoring Service
Calculates lead quality scores (0-100) based on lead characteristics.
"""


def extract_features(lead) -> list[float]:
    """
    Extract features from lead for ML model.
    Returns a list of feature values.
    """
    job_title_lower = (lead.job_title or "").lower()
    company_name_lower = (lead.company_name or "").lower()
    location_lower = (lead.location or "").lower() if lead.location else ""
    domain_lower = (lead.domain or "").lower() if lead.domain else ""
    email_lower = (lead.email or "").lower()
    
    # Feature 1: Job title seniority score (0-3)
    # Higher positions = higher score
    seniority_keywords = {
        'ceo': 3, 'cto': 3, 'cfo': 3, 'president': 3,
        'director': 2, 'vp': 2, 'vice president': 2, 'head of': 2,
        'manager': 1, 'senior': 1, 'lead': 1, 'principal': 1
    }
    seniority_score = 0
    for keyword, score in seniority_keywords.items():
        if keyword in job_title_lower:
            seniority_score = max(seniority_score, score)
            break
    
    # Feature 2: Domain quality score (0-1)
    # Premium domains = higher score
    premium_domains = ['.com', '.io', '.co', '.ai', '.tech']
    domain_score = 1.0 if any(d in domain_lower for d in premium_domains) else 0.5
    
    # Feature 3: Location score (0-1)
    # Major cities = higher score
    major_cities = [
        'new york', 'san francisco', 'london', 'boston', 'seattle', 
        'austin', 'los angeles', 'chicago', 'denver', 'atlanta',
        'toronto', 'vancouver', 'sydney', 'melbourne'
    ]
    location_score = 1.0 if any(city in location_lower for city in major_cities) else 0.5
    
    # Feature 4: Email pattern score (0-1)
    # Professional email patterns = higher score
    # firstname.lastname@domain = 1.0
    # firstname@domain = 0.7
    # other = 0.5
    email_local = email_lower.split('@')[0] if '@' in email_lower else ""
    if '.' in email_local and len(email_local.split('.')) == 2:
        email_score = 1.0
    elif email_local and len(email_local) > 3:
        email_score = 0.7
    else:
        email_score = 0.5
    
    # Feature 5: Company name length score (0-1)
    # Established companies usually have longer names
    company_length = len(company_name_lower)
    if company_length > 15:
        company_length_score = 1.0
    elif company_length > 8:
        company_length_score = 0.7
    else:
        company_length_score = 0.5
    
    return [
        float(seniority_score),
        float(domain_score),
        float(location_score),
        float(email_score),
        float(company_length_score)
    ]


def calculate_lead_score(lead) -> float:
    """
    Calculate ML-based lead score (0-100).
    Uses rule-based scoring that can be replaced with trained ML model later.
    
    Args:
        lead: Lead model instance
        
    Returns:
        float: Lead score from 0 to 100
    """
    try:
        features = extract_features(lead)
        
        # Rule-based scoring (can be replaced with ML model)
        # Weights for each feature
        weights = [25.0, 15.0, 15.0, 20.0, 10.0]  # Total = 85, max possible = 100
        
        # Calculate weighted score
        score = sum(feature * weight for feature, weight in zip(features, weights))
        
        # Add bonus for complete profile
        completeness_bonus = 0
        if lead.location:
            completeness_bonus += 5
        if lead.domain:
            completeness_bonus += 5
        if lead.job_title and lead.job_title != "Unknown":
            completeness_bonus += 5
        
        score += completeness_bonus
        
        # Ensure score is between 0 and 100
        score = max(0.0, min(100.0, score))
        
        return round(score, 2)
        
    except Exception as e:
        # Fallback to simple scoring if anything fails
        return simple_lead_score(lead)


def simple_lead_score(lead) -> float:
    """
    Fallback: Simple rule-based scoring if ML fails.
    """
    try:
        score = 50.0  # Base score
        
        # Job title bonus
        job_title_lower = (lead.job_title or "").lower()
        if any(kw in job_title_lower for kw in ['ceo', 'cto', 'cfo', 'director', 'president']):
            score += 20
        elif any(kw in job_title_lower for kw in ['manager', 'senior', 'vp', 'head']):
            score += 10
        
        # Domain bonus
        if lead.domain and '.com' in lead.domain.lower():
            score += 10
        
        # Location bonus
        if lead.location:
            score += 5
        
        return min(score, 100.0)
    except Exception:
        return 50.0  # Default score if everything fails

