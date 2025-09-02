"""
Advanced Lead Scoring Service
============================

This module provides sophisticated lead scoring algorithms for evaluating lead quality
in real-time. It includes multiple scoring models, predictive analytics, and quality metrics.

Features:
- Multi-factor scoring algorithms
- Real-time quality assessment
- Predictive lead conversion probability
- Industry-specific scoring models
- Machine learning integration ready
"""

import re
import math
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ScoringFactor(Enum):
    """Scoring factors and their weights"""
    COMPANY_SIZE = 0.25
    REVENUE = 0.20
    INDUSTRY = 0.15
    CONTACT_QUALITY = 0.15
    LOCATION = 0.10
    WEBSITE_PRESENCE = 0.05
    SOCIAL_PRESENCE = 0.05
    RECENCY = 0.05


@dataclass
class LeadScore:
    """Lead scoring result with detailed breakdown"""
    overall_score: float
    conversion_probability: float
    quality_grade: str
    factors: Dict[str, float]
    recommendations: List[str]
    risk_factors: List[str]
    confidence_level: float


class LeadScoringEngine:
    """
    Advanced lead scoring engine with multiple algorithms and real-time processing.
    
    This engine evaluates leads based on multiple factors including:
    - Company characteristics (size, revenue, industry)
    - Contact information quality
    - Geographic and market factors
    - Digital presence indicators
    - Temporal factors
    """
    
    def __init__(self):
        self.industry_scores = {
            'technology': 0.9,
            'healthcare': 0.85,
            'finance': 0.8,
            'education': 0.75,
            'retail': 0.7,
            'manufacturing': 0.75,
            'real_estate': 0.65,
            'legal': 0.7,
            'marketing': 0.8,
            'consulting': 0.85,
            'e-commerce': 0.8,
            'construction': 0.6,
            'non_profit': 0.5,
            'food_beverage': 0.65,
            'automotive': 0.7,
            'energy': 0.8,
            'telecommunications': 0.85,
            'media': 0.75,
            'transportation': 0.7,
            'hospitality': 0.65
        }
        
        self.location_scores = {
            'san_francisco': 0.9,
            'new_york': 0.9,
            'los_angeles': 0.85,
            'chicago': 0.8,
            'boston': 0.85,
            'seattle': 0.85,
            'austin': 0.8,
            'denver': 0.75,
            'atlanta': 0.75,
            'dallas': 0.75,
            'miami': 0.7,
            'phoenix': 0.65,
            'las_vegas': 0.6,
            'orlando': 0.65,
            'nashville': 0.7
        }
        
        self.employee_count_scores = {
            (1, 10): 0.6,      # Startup
            (11, 50): 0.7,     # Small business
            (51, 200): 0.8,    # Medium business
            (201, 1000): 0.85, # Large business
            (1001, 5000): 0.9, # Enterprise
            (5001, float('inf')): 0.95  # Fortune 500
        }
        
        self.revenue_scores = {
            (0, 1000000): 0.6,      # < $1M
            (1000000, 10000000): 0.7,   # $1M - $10M
            (10000000, 50000000): 0.8,  # $10M - $50M
            (50000000, 200000000): 0.85, # $50M - $200M
            (200000000, 1000000000): 0.9, # $200M - $1B
            (1000000000, float('inf')): 0.95  # > $1B
        }

    def calculate_company_size_score(self, employee_count: Optional[str]) -> Tuple[float, List[str]]:
        """
        Calculate score based on company size (employee count).
        
        Args:
            employee_count: Employee count as string
            
        Returns:
            Tuple of (score, recommendations)
        """
        if not employee_count:
            return 0.5, ["Employee count not provided - consider requesting this information"]
        
        try:
            # Extract numeric value from string
            count = self._extract_number(employee_count)
            if count is None:
                return 0.5, ["Unable to parse employee count"]
            
            # Find appropriate score range
            for (min_emp, max_emp), score in self.employee_count_scores.items():
                if min_emp <= count <= max_emp:
                    recommendations = []
                    if count < 50:
                        recommendations.append("Small company - may have limited budget")
                    elif count > 1000:
                        recommendations.append("Large company - high potential value")
                    return score, recommendations
            
            return 0.7, ["Employee count outside expected ranges"]
            
        except Exception as e:
            logger.error(f"Error calculating company size score: {e}")
            return 0.5, ["Error processing employee count"]

    def calculate_revenue_score(self, revenue: Optional[str]) -> Tuple[float, List[str]]:
        """
        Calculate score based on annual revenue.
        
        Args:
            revenue: Annual revenue as string
            
        Returns:
            Tuple of (score, recommendations)
        """
        if not revenue:
            return 0.5, ["Revenue information not provided"]
        
        try:
            # Extract numeric value from string
            revenue_value = self._extract_revenue(revenue)
            if revenue_value is None:
                return 0.5, ["Unable to parse revenue information"]
            
            # Find appropriate score range
            for (min_rev, max_rev), score in self.revenue_scores.items():
                if min_rev <= revenue_value <= max_rev:
                    recommendations = []
                    if revenue_value < 10000000:
                        recommendations.append("Lower revenue - may have budget constraints")
                    elif revenue_value > 100000000:
                        recommendations.append("High revenue company - significant opportunity")
                    return score, recommendations
            
            return 0.7, ["Revenue outside expected ranges"]
            
        except Exception as e:
            logger.error(f"Error calculating revenue score: {e}")
            return 0.5, ["Error processing revenue information"]

    def calculate_industry_score(self, industry: Optional[str]) -> Tuple[float, List[str]]:
        """
        Calculate score based on industry.
        
        Args:
            industry: Industry name
            
        Returns:
            Tuple of (score, recommendations)
        """
        if not industry:
            return 0.6, ["Industry not specified"]
        
        industry_lower = industry.lower().replace(' ', '_').replace('-', '_')
        
        # Direct match
        if industry_lower in self.industry_scores:
            score = self.industry_scores[industry_lower]
            recommendations = []
            if score >= 0.8:
                recommendations.append("High-value industry with strong growth potential")
            elif score <= 0.6:
                recommendations.append("Lower-value industry - consider pricing strategy")
            return score, recommendations
        
        # Partial match
        for key, score in self.industry_scores.items():
            if key in industry_lower or industry_lower in key:
                return score, [f"Industry matched to '{key}' category"]
        
        return 0.6, ["Industry not in high-value categories"]

    def calculate_contact_quality_score(self, contact_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """
        Calculate score based on contact information quality.
        
        Args:
            contact_data: Dictionary containing contact information
            
        Returns:
            Tuple of (score, recommendations)
        """
        score = 0.5
        recommendations = []
        
        # Email quality
        email = contact_data.get('contact_email', '')
        if email:
            if self._is_valid_email(email):
                score += 0.2
                if '@' in email and '.' in email.split('@')[1]:
                    score += 0.1  # Professional email domain
            else:
                recommendations.append("Invalid email format detected")
        else:
            recommendations.append("Email address missing")
        
        # Phone quality
        phone = contact_data.get('contact_phone', '')
        if phone:
            if self._is_valid_phone(phone):
                score += 0.15
            else:
                recommendations.append("Phone number format issues")
        else:
            recommendations.append("Phone number missing")
        
        # Name quality
        name = contact_data.get('contact_name', '')
        if name and len(name.strip()) > 2:
            score += 0.15
        else:
            recommendations.append("Contact name incomplete or missing")
        
        return min(score, 1.0), recommendations

    def calculate_location_score(self, location: Optional[str]) -> Tuple[float, List[str]]:
        """
        Calculate score based on location.
        
        Args:
            location: Location string
            
        Returns:
            Tuple of (score, recommendations)
        """
        if not location:
            return 0.5, ["Location not specified"]
        
        location_lower = location.lower().replace(' ', '_').replace(',', '_')
        
        # Direct match
        for key, score in self.location_scores.items():
            if key in location_lower:
                recommendations = []
                if score >= 0.8:
                    recommendations.append("Premium location with high market potential")
                return score, recommendations
        
        # Check for major cities
        major_cities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 
                       'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose']
        
        for city in major_cities:
            if city in location_lower:
                return 0.75, [f"Major city detected: {city.title()}"]
        
        return 0.6, ["Standard location - moderate market potential"]

    def calculate_digital_presence_score(self, extra_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """
        Calculate score based on digital presence indicators.
        
        Args:
            extra_data: Additional lead data
            
        Returns:
            Tuple of (score, recommendations)
        """
        score = 0.5
        recommendations = []
        
        # Website presence
        website = extra_data.get('website', '')
        if website:
            if self._is_valid_website(website):
                score += 0.3
            else:
                recommendations.append("Website URL format issues")
        else:
            recommendations.append("Website not provided")
        
        # LinkedIn presence
        linkedin = extra_data.get('linkedin', '')
        if linkedin:
            if 'linkedin.com' in linkedin.lower():
                score += 0.2
            else:
                recommendations.append("LinkedIn URL format issues")
        
        return min(score, 1.0), recommendations

    def calculate_recency_score(self, created_at: Optional[datetime]) -> Tuple[float, List[str]]:
        """
        Calculate score based on lead recency.
        
        Args:
            created_at: Lead creation timestamp
            
        Returns:
            Tuple of (score, recommendations)
        """
        if not created_at:
            return 0.5, ["Creation date not available"]
        
        now = datetime.utcnow()
        age_days = (now - created_at).days
        
        if age_days <= 1:
            return 0.9, ["Fresh lead - high urgency"]
        elif age_days <= 7:
            return 0.8, ["Recent lead - good timing"]
        elif age_days <= 30:
            return 0.7, ["Moderate age - still relevant"]
        elif age_days <= 90:
            return 0.6, ["Older lead - may need re-engagement"]
        else:
            return 0.4, ["Stale lead - consider re-qualification"]

    def _extract_number(self, text: str) -> Optional[int]:
        """Extract numeric value from text string."""
        if not text:
            return None
        
        # Remove common words and extract numbers
        import re
        numbers = re.findall(r'\d+(?:,\d+)*(?:\.\d+)?', text.replace(',', ''))
        if numbers:
            try:
                return int(float(numbers[0]))
            except (ValueError, TypeError):
                pass
        return None

    def _extract_revenue(self, text: str) -> Optional[float]:
        """Extract revenue value from text string."""
        if not text:
            return None
        
        import re
        
        # Handle common revenue formats
        text_lower = text.lower()
        
        # Extract numbers with multipliers
        multipliers = {
            'k': 1000,
            'thousand': 1000,
            'm': 1000000,
            'million': 1000000,
            'b': 1000000000,
            'billion': 1000000000
        }
        
        # Find numbers with multipliers
        for suffix, multiplier in multipliers.items():
            pattern = rf'(\d+(?:,\d+)*(?:\.\d+)?)\s*{suffix}'
            match = re.search(pattern, text_lower)
            if match:
                try:
                    return float(match.group(1).replace(',', '')) * multiplier
                except (ValueError, TypeError):
                    pass
        
        # Try to extract plain numbers
        numbers = re.findall(r'\d+(?:,\d+)*(?:\.\d+)?', text.replace(',', ''))
        if numbers:
            try:
                return float(numbers[0])
            except (ValueError, TypeError):
                pass
        
        return None

    def _is_valid_email(self, email: str) -> bool:
        """Validate email format."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))

    def _is_valid_phone(self, phone: str) -> bool:
        """Validate phone number format."""
        import re
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone)
        return len(digits) >= 10

    def _is_valid_website(self, website: str) -> bool:
        """Validate website URL format."""
        import re
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        return bool(re.match(pattern, website))

    def calculate_overall_score(self, lead_data: Dict[str, Any]) -> LeadScore:
        """
        Calculate comprehensive lead score with all factors.
        
        Args:
            lead_data: Complete lead data dictionary
            
        Returns:
            LeadScore object with detailed breakdown
        """
        factors = {}
        all_recommendations = []
        risk_factors = []
        
        # Calculate individual factor scores
        company_size_score, recs = self.calculate_company_size_score(
            lead_data.get('extra', {}).get('employee_count')
        )
        factors['company_size'] = company_size_score
        all_recommendations.extend(recs)
        
        revenue_score, recs = self.calculate_revenue_score(
            lead_data.get('extra', {}).get('annual_revenue')
        )
        factors['revenue'] = revenue_score
        all_recommendations.extend(recs)
        
        industry_score, recs = self.calculate_industry_score(
            lead_data.get('industry')
        )
        factors['industry'] = industry_score
        all_recommendations.extend(recs)
        
        contact_quality_score, recs = self.calculate_contact_quality_score({
            'contact_email': lead_data.get('contact_email'),
            'contact_phone': lead_data.get('extra', {}).get('contact_phone'),
            'contact_name': lead_data.get('extra', {}).get('contact_name')
        })
        factors['contact_quality'] = contact_quality_score
        all_recommendations.extend(recs)
        
        location_score, recs = self.calculate_location_score(
            lead_data.get('extra', {}).get('location')
        )
        factors['location'] = location_score
        all_recommendations.extend(recs)
        
        digital_presence_score, recs = self.calculate_digital_presence_score(
            lead_data.get('extra', {})
        )
        factors['digital_presence'] = digital_presence_score
        all_recommendations.extend(recs)
        
        recency_score, recs = self.calculate_recency_score(
            lead_data.get('created_at')
        )
        factors['recency'] = recency_score
        all_recommendations.extend(recs)
        
        # Calculate weighted overall score
        overall_score = sum(
            factors[factor.value] * factor.value 
            for factor in ScoringFactor 
            if factor.name.lower() in factors
        )
        
        # Calculate conversion probability
        conversion_probability = self._calculate_conversion_probability(overall_score, factors)
        
        # Determine quality grade
        quality_grade = self._determine_quality_grade(overall_score)
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(factors, lead_data)
        
        # Calculate confidence level
        confidence_level = self._calculate_confidence_level(factors, lead_data)
        
        return LeadScore(
            overall_score=round(overall_score, 3),
            conversion_probability=round(conversion_probability, 3),
            quality_grade=quality_grade,
            factors=factors,
            recommendations=all_recommendations,
            risk_factors=risk_factors,
            confidence_level=round(confidence_level, 3)
        )

    def _calculate_conversion_probability(self, overall_score: float, factors: Dict[str, float]) -> float:
        """Calculate lead conversion probability based on score and factors."""
        # Base conversion rate
        base_rate = 0.15  # 15% base conversion rate
        
        # Adjust based on overall score
        score_multiplier = overall_score * 2  # 0-2x multiplier
        
        # Industry adjustment
        industry_factor = factors.get('industry', 0.6)
        industry_multiplier = 0.8 + (industry_factor * 0.4)  # 0.8-1.2x
        
        # Contact quality adjustment
        contact_factor = factors.get('contact_quality', 0.5)
        contact_multiplier = 0.7 + (contact_factor * 0.6)  # 0.7-1.3x
        
        conversion_probability = base_rate * score_multiplier * industry_multiplier * contact_multiplier
        
        return min(conversion_probability, 0.95)  # Cap at 95%

    def _determine_quality_grade(self, overall_score: float) -> str:
        """Determine quality grade based on overall score."""
        if overall_score >= 0.85:
            return "A+"
        elif overall_score >= 0.8:
            return "A"
        elif overall_score >= 0.75:
            return "A-"
        elif overall_score >= 0.7:
            return "B+"
        elif overall_score >= 0.65:
            return "B"
        elif overall_score >= 0.6:
            return "B-"
        elif overall_score >= 0.55:
            return "C+"
        elif overall_score >= 0.5:
            return "C"
        else:
            return "D"

    def _identify_risk_factors(self, factors: Dict[str, float], lead_data: Dict[str, Any]) -> List[str]:
        """Identify potential risk factors for the lead."""
        risk_factors = []
        
        if factors.get('contact_quality', 0) < 0.6:
            risk_factors.append("Poor contact information quality")
        
        if factors.get('company_size', 0) < 0.6:
            risk_factors.append("Small company size - limited budget potential")
        
        if factors.get('revenue', 0) < 0.6:
            risk_factors.append("Low revenue - budget constraints likely")
        
        if factors.get('industry', 0) < 0.6:
            risk_factors.append("Low-value industry segment")
        
        if factors.get('location', 0) < 0.6:
            risk_factors.append("Non-premium location")
        
        # Check for missing critical data
        if not lead_data.get('contact_email'):
            risk_factors.append("Missing email address")
        
        if not lead_data.get('extra', {}).get('contact_phone'):
            risk_factors.append("Missing phone number")
        
        return risk_factors

    def _calculate_confidence_level(self, factors: Dict[str, float], lead_data: Dict[str, Any]) -> float:
        """Calculate confidence level in the scoring assessment."""
        # Base confidence
        confidence = 0.7
        
        # Increase confidence for complete data
        data_completeness = 0
        required_fields = ['contact_email', 'industry', 'title']
        for field in required_fields:
            if lead_data.get(field):
                data_completeness += 1
        
        confidence += (data_completeness / len(required_fields)) * 0.2
        
        # Increase confidence for high-quality data
        high_quality_factors = sum(1 for score in factors.values() if score > 0.7)
        confidence += (high_quality_factors / len(factors)) * 0.1
        
        return min(confidence, 1.0)


# Global scoring engine instance
scoring_engine = LeadScoringEngine()


def score_lead(lead_data: Dict[str, Any]) -> LeadScore:
    """
    Score a lead using the advanced scoring engine.
    
    Args:
        lead_data: Lead data dictionary
        
    Returns:
        LeadScore object with comprehensive scoring results
    """
    return scoring_engine.calculate_overall_score(lead_data)


def get_lead_quality_insights(lead_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get detailed insights about lead quality.
    
    Args:
        lead_data: Lead data dictionary
        
    Returns:
        Dictionary with quality insights and recommendations
    """
    score_result = score_lead(lead_data)
    
    return {
        'score': score_result.overall_score,
        'grade': score_result.quality_grade,
        'conversion_probability': score_result.conversion_probability,
        'confidence_level': score_result.confidence_level,
        'factor_breakdown': score_result.factors,
        'recommendations': score_result.recommendations,
        'risk_factors': score_result.risk_factors,
        'priority_level': _determine_priority_level(score_result.overall_score),
        'estimated_value': _estimate_lead_value(lead_data, score_result),
        'follow_up_urgency': _determine_follow_up_urgency(score_result)
    }


def _determine_priority_level(score: float) -> str:
    """Determine priority level based on score."""
    if score >= 0.8:
        return "High"
    elif score >= 0.65:
        return "Medium"
    else:
        return "Low"


def _estimate_lead_value(lead_data: Dict[str, Any], score_result: LeadScore) -> Dict[str, Any]:
    """Estimate the potential value of the lead."""
    base_value = 1000  # Base lead value
    
    # Adjust for company size
    employee_count = score_result.factors.get('company_size', 0.5)
    size_multiplier = 0.5 + (employee_count * 1.0)
    
    # Adjust for revenue
    revenue_score = score_result.factors.get('revenue', 0.5)
    revenue_multiplier = 0.5 + (revenue_score * 1.5)
    
    # Adjust for industry
    industry_score = score_result.factors.get('industry', 0.6)
    industry_multiplier = 0.7 + (industry_score * 0.6)
    
    estimated_value = base_value * size_multiplier * revenue_multiplier * industry_multiplier
    
    return {
        'estimated_value': round(estimated_value, 2),
        'value_range': f"${estimated_value * 0.7:.0f} - ${estimated_value * 1.3:.0f}",
        'confidence': score_result.confidence_level
    }


def _determine_follow_up_urgency(score_result: LeadScore) -> str:
    """Determine follow-up urgency based on scoring results."""
    if score_result.overall_score >= 0.8:
        return "Immediate"
    elif score_result.overall_score >= 0.7:
        return "High"
    elif score_result.overall_score >= 0.6:
        return "Medium"
    else:
        return "Low"
