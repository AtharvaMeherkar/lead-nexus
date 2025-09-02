#!/usr/bin/env python3
"""
Search Service
=============

Advanced search functionality with AI-powered suggestions for Lead-Nexus.
"""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import re
import json
from datetime import datetime, timedelta
from sqlalchemy import or_, and_, func, desc, asc
from sqlalchemy.orm import Session

from models import Lead, User, Purchase, LeadStatusHistory
from services.analytics_service import AnalyticsService


class SearchType(Enum):
    """Types of search operations."""
    EXACT = "exact"
    FUZZY = "fuzzy"
    SEMANTIC = "semantic"
    FILTER = "filter"


@dataclass
class SearchFilter:
    """Search filter configuration."""
    field: str
    operator: str  # eq, ne, gt, lt, gte, lte, in, not_in, contains, starts_with, ends_with
    value: Any
    case_sensitive: bool = False


@dataclass
class SearchSuggestion:
    """Search suggestion result."""
    text: str
    type: str  # lead, company, industry, location
    relevance_score: float
    frequency: int
    metadata: Dict[str, Any] = None


@dataclass
class SearchResult:
    """Search result with metadata."""
    items: List[Any]
    total_count: int
    page: int
    per_page: int
    filters_applied: List[SearchFilter]
    search_time_ms: float
    suggestions: List[SearchSuggestion] = None


class SearchService:
    """Advanced search service with AI-powered suggestions."""
    
    def __init__(self):
        self.analytics_service = None  # Will be initialized when needed
        self.search_history = {}  # In production, this would be stored in database
        self.popular_searches = {}  # Track popular search terms
    
    def search_leads(
        self,
        query: str = "",
        filters: List[SearchFilter] = None,
        search_type: SearchType = SearchType.FUZZY,
        page: int = 1,
        per_page: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        db: Session = None
    ) -> SearchResult:
        """
        Search leads with advanced filtering and AI suggestions.
        
        Args:
            query: Search query string
            filters: List of search filters
            search_type: Type of search to perform
            page: Page number for pagination
            per_page: Items per page
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)
            db: Database session
            
        Returns:
            SearchResult with items and metadata
        """
        import time
        start_time = time.time()
        
        if filters is None:
            filters = []
        
        # Build base query
        base_query = db.query(Lead)
        
        # Apply search query
        if query:
            base_query = self._apply_search_query(base_query, query, search_type)
        
        # Apply filters
        if filters:
            base_query = self._apply_filters(base_query, filters)
        
        # Apply sorting
        base_query = self._apply_sorting(base_query, sort_by, sort_order)
        
        # Get total count
        total_count = base_query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        leads = base_query.offset(offset).limit(per_page).all()
        
        # Generate suggestions
        suggestions = self._generate_suggestions(query, db) if query else []
        
        # Track search
        self._track_search(query, filters, len(leads))
        
        search_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        return SearchResult(
            items=leads,
            total_count=total_count,
            page=page,
            per_page=per_page,
            filters_applied=filters,
            search_time_ms=search_time,
            suggestions=suggestions
        )
    
    def _apply_search_query(self, query, search_text: str, search_type: SearchType):
        """Apply search query based on search type."""
        if search_type == SearchType.EXACT:
            return query.filter(
                or_(
                    Lead.title.ilike(f"%{search_text}%"),
                    Lead.description.ilike(f"%{search_text}%"),
                    Lead.company_name.ilike(f"%{search_text}%"),
                    Lead.contact_name.ilike(f"%{search_text}%"),
                    Lead.industry.ilike(f"%{search_text}%"),
                    Lead.location.ilike(f"%{search_text}%")
                )
            )
        elif search_type == SearchType.FUZZY:
            # Fuzzy search with word boundaries
            words = search_text.split()
            conditions = []
            
            for word in words:
                if len(word) >= 2:  # Only search for words with 2+ characters
                    conditions.append(
                        or_(
                            Lead.title.ilike(f"%{word}%"),
                            Lead.description.ilike(f"%{word}%"),
                            Lead.company_name.ilike(f"%{word}%"),
                            Lead.contact_name.ilike(f"%{word}%"),
                            Lead.industry.ilike(f"%{word}%"),
                            Lead.location.ilike(f"%{word}%")
                        )
                    )
            
            if conditions:
                return query.filter(and_(*conditions))
        
        elif search_type == SearchType.SEMANTIC:
            # Semantic search using keywords and synonyms
            semantic_keywords = self._get_semantic_keywords(search_text)
            conditions = []
            
            for keyword in semantic_keywords:
                conditions.append(
                    or_(
                        Lead.title.ilike(f"%{keyword}%"),
                        Lead.description.ilike(f"%{keyword}%"),
                        Lead.industry.ilike(f"%{keyword}%")
                    )
                )
            
            if conditions:
                return query.filter(or_(*conditions))
        
        return query
    
    def _apply_filters(self, query, filters: List[SearchFilter]):
        """Apply search filters to query."""
        for filter_obj in filters:
            field = getattr(Lead, filter_obj.field, None)
            if field is None:
                continue
            
            if filter_obj.operator == "eq":
                query = query.filter(field == filter_obj.value)
            elif filter_obj.operator == "ne":
                query = query.filter(field != filter_obj.value)
            elif filter_obj.operator == "gt":
                query = query.filter(field > filter_obj.value)
            elif filter_obj.operator == "lt":
                query = query.filter(field < filter_obj.value)
            elif filter_obj.operator == "gte":
                query = query.filter(field >= filter_obj.value)
            elif filter_obj.operator == "lte":
                query = query.filter(field <= filter_obj.value)
            elif filter_obj.operator == "in":
                query = query.filter(field.in_(filter_obj.value))
            elif filter_obj.operator == "not_in":
                query = query.filter(~field.in_(filter_obj.value))
            elif filter_obj.operator == "contains":
                if filter_obj.case_sensitive:
                    query = query.filter(field.contains(filter_obj.value))
                else:
                    query = query.filter(field.ilike(f"%{filter_obj.value}%"))
            elif filter_obj.operator == "starts_with":
                if filter_obj.case_sensitive:
                    query = query.filter(field.startswith(filter_obj.value))
                else:
                    query = query.filter(field.ilike(f"{filter_obj.value}%"))
            elif filter_obj.operator == "ends_with":
                if filter_obj.case_sensitive:
                    query = query.filter(field.endswith(filter_obj.value))
                else:
                    query = query.filter(field.ilike(f"%{filter_obj.value}"))
        
        return query
    
    def _apply_sorting(self, query, sort_by: str, sort_order: str):
        """Apply sorting to query."""
        field = getattr(Lead, sort_by, Lead.created_at)
        
        if sort_order.lower() == "asc":
            return query.order_by(asc(field))
        else:
            return query.order_by(desc(field))
    
    def _generate_suggestions(self, query: str, db: Session) -> List[SearchSuggestion]:
        """Generate AI-powered search suggestions."""
        suggestions = []
        
        if not query or len(query) < 2:
            return suggestions
        
        # Get popular searches
        popular_suggestions = self._get_popular_suggestions(query)
        suggestions.extend(popular_suggestions)
        
        # Get industry suggestions
        industry_suggestions = self._get_industry_suggestions(query, db)
        suggestions.extend(industry_suggestions)
        
        # Get company suggestions
        company_suggestions = self._get_company_suggestions(query, db)
        suggestions.extend(company_suggestions)
        
        # Get location suggestions
        location_suggestions = self._get_location_suggestions(query, db)
        suggestions.extend(location_suggestions)
        
        # Sort by relevance and remove duplicates
        unique_suggestions = {}
        for suggestion in suggestions:
            key = f"{suggestion.type}:{suggestion.text.lower()}"
            if key not in unique_suggestions or suggestion.relevance_score > unique_suggestions[key].relevance_score:
                unique_suggestions[key] = suggestion
        
        # Return top suggestions sorted by relevance
        return sorted(
            unique_suggestions.values(),
            key=lambda x: x.relevance_score,
            reverse=True
        )[:10]
    
    def _get_popular_suggestions(self, query: str) -> List[SearchSuggestion]:
        """Get suggestions based on popular searches."""
        suggestions = []
        
        # Find popular searches that contain the query
        for search_term, data in self.popular_searches.items():
            if query.lower() in search_term.lower():
                relevance = data.get('count', 1) * 0.1  # Weight by popularity
                suggestions.append(SearchSuggestion(
                    text=search_term,
                    type="popular",
                    relevance_score=relevance,
                    frequency=data.get('count', 1)
                ))
        
        return suggestions
    
    def _get_industry_suggestions(self, query: str, db: Session) -> List[SearchSuggestion]:
        """Get industry-based suggestions."""
        suggestions = []
        
        # Get industries that match the query
        industries = db.query(Lead.industry, func.count(Lead.id).label('count'))\
            .filter(Lead.industry.ilike(f"%{query}%"))\
            .group_by(Lead.industry)\
            .order_by(desc('count'))\
            .limit(5)\
            .all()
        
        for industry, count in industries:
            relevance = self._calculate_relevance(query, industry, count)
            suggestions.append(SearchSuggestion(
                text=industry,
                type="industry",
                relevance_score=relevance,
                frequency=count
            ))
        
        return suggestions
    
    def _get_company_suggestions(self, query: str, db: Session) -> List[SearchSuggestion]:
        """Get company-based suggestions."""
        suggestions = []
        
        # Get companies that match the query
        companies = db.query(Lead.company_name, func.count(Lead.id).label('count'))\
            .filter(Lead.company_name.ilike(f"%{query}%"))\
            .group_by(Lead.company_name)\
            .order_by(desc('count'))\
            .limit(5)\
            .all()
        
        for company, count in companies:
            relevance = self._calculate_relevance(query, company, count)
            suggestions.append(SearchSuggestion(
                text=company,
                type="company",
                relevance_score=relevance,
                frequency=count
            ))
        
        return suggestions
    
    def _get_location_suggestions(self, query: str, db: Session) -> List[SearchSuggestion]:
        """Get location-based suggestions."""
        suggestions = []
        
        # Get locations that match the query
        locations = db.query(Lead.location, func.count(Lead.id).label('count'))\
            .filter(Lead.location.ilike(f"%{query}%"))\
            .group_by(Lead.location)\
            .order_by(desc('count'))\
            .limit(5)\
            .all()
        
        for location, count in locations:
            relevance = self._calculate_relevance(query, location, count)
            suggestions.append(SearchSuggestion(
                text=location,
                type="location",
                relevance_score=relevance,
                frequency=count
            ))
        
        return suggestions
    
    def _calculate_relevance(self, query: str, text: str, frequency: int) -> float:
        """Calculate relevance score for a suggestion."""
        # Base relevance on frequency
        relevance = frequency * 0.1
        
        # Boost relevance if query is at the start
        if text.lower().startswith(query.lower()):
            relevance += 0.5
        
        # Boost relevance for exact matches
        if query.lower() in text.lower():
            relevance += 0.3
        
        # Boost relevance for shorter text (more specific)
        relevance += max(0, (10 - len(text)) * 0.01)
        
        return min(relevance, 1.0)
    
    def _get_semantic_keywords(self, text: str) -> List[str]:
        """Get semantic keywords and synonyms for search."""
        # This is a basic implementation
        # In a real app, you'd use NLP libraries or AI services
        
        keywords = [text]
        
        # Add common synonyms
        synonyms = {
            "tech": ["technology", "software", "IT", "digital"],
            "marketing": ["advertising", "promotion", "branding", "sales"],
            "finance": ["banking", "investment", "financial", "money"],
            "healthcare": ["medical", "health", "hospital", "clinic"],
            "education": ["learning", "school", "university", "training"],
            "retail": ["commerce", "shopping", "store", "ecommerce"],
            "manufacturing": ["production", "factory", "industrial", "manufacturing"],
            "consulting": ["advisory", "consulting", "professional services"],
            "startup": ["startup", "new company", "emerging business"],
            "enterprise": ["large company", "corporation", "enterprise"]
        }
        
        for word in text.lower().split():
            if word in synonyms:
                keywords.extend(synonyms[word])
        
        return list(set(keywords))
    
    def _track_search(self, query: str, filters: List[SearchFilter], result_count: int):
        """Track search for analytics and suggestions."""
        if not query:
            return
        
        search_key = query.lower().strip()
        
        if search_key in self.popular_searches:
            self.popular_searches[search_key]['count'] += 1
            self.popular_searches[search_key]['last_used'] = datetime.utcnow()
        else:
            self.popular_searches[search_key] = {
                'count': 1,
                'first_used': datetime.utcnow(),
                'last_used': datetime.utcnow(),
                'result_count': result_count
            }
    
    def get_search_analytics(self) -> Dict[str, Any]:
        """Get search analytics and insights."""
        total_searches = sum(data['count'] for data in self.popular_searches.values())
        
        # Get top searches
        top_searches = sorted(
            self.popular_searches.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        )[:10]
        
        # Get recent searches
        recent_searches = sorted(
            self.popular_searches.items(),
            key=lambda x: x[1]['last_used'],
            reverse=True
        )[:10]
        
        return {
            'total_searches': total_searches,
            'unique_searches': len(self.popular_searches),
            'top_searches': top_searches,
            'recent_searches': recent_searches,
            'avg_results_per_search': sum(
                data['result_count'] for data in self.popular_searches.values()
            ) / len(self.popular_searches) if self.popular_searches else 0
        }
    
    def get_advanced_filters(self, db: Session) -> Dict[str, List[str]]:
        """Get available filter options for advanced search."""
        # Get unique industries
        industries = [row[0] for row in db.query(Lead.industry.distinct()).all() if row[0]]
        
        # Get unique locations
        locations = [row[0] for row in db.query(Lead.location.distinct()).all() if row[0]]
        
        # Get price ranges
        price_stats = db.query(
            func.min(Lead.price).label('min_price'),
            func.max(Lead.price).label('max_price'),
            func.avg(Lead.price).label('avg_price')
        ).first()
        
        # Get lead score ranges
        score_stats = db.query(
            func.min(Lead.lead_score).label('min_score'),
            func.max(Lead.lead_score).label('max_score'),
            func.avg(Lead.lead_score).label('avg_score')
        ).first()
        
        return {
            'industries': sorted(industries),
            'locations': sorted(locations),
            'price_range': {
                'min': float(price_stats.min_price or 0),
                'max': float(price_stats.max_price or 1000),
                'avg': float(price_stats.avg_price or 100)
            },
            'score_range': {
                'min': float(score_stats.min_score or 0),
                'max': float(score_stats.max_score or 100),
                'avg': float(score_stats.avg_score or 50)
            },
            'statuses': ['available', 'sold', 'pending', 'expired']
        }


# Global instance
search_service = SearchService()
