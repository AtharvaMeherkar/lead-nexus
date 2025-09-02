#!/usr/bin/env python3
"""
API Documentation Service
========================

Generates comprehensive API documentation and developer tools for Lead-Nexus.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import json
import inspect
from datetime import datetime
from pathlib import Path


class HTTPMethod(Enum):
    """HTTP methods."""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"


class AuthType(Enum):
    """Authentication types."""
    NONE = "none"
    JWT = "jwt"
    API_KEY = "api_key"
    BASIC = "basic"


@dataclass
class Parameter:
    """API parameter definition."""
    name: str
    type: str
    required: bool
    description: str
    default: Any = None
    example: Any = None
    enum: List[Any] = None


@dataclass
class ResponseExample:
    """API response example."""
    status_code: int
    description: str
    example: Dict[str, Any]
    schema: Dict[str, Any] = None


@dataclass
class Endpoint:
    """API endpoint definition."""
    path: str
    method: HTTPMethod
    summary: str
    description: str
    auth_required: bool
    auth_type: AuthType
    parameters: List[Parameter]
    request_body: Dict[str, Any] = None
    responses: List[ResponseExample] = None
    tags: List[str] = None
    deprecated: bool = False


@dataclass
class APIDocumentation:
    """Complete API documentation."""
    title: str
    version: str
    description: str
    base_url: str
    endpoints: List[Endpoint]
    schemas: Dict[str, Any]
    tags: List[str]
    info: Dict[str, Any]


class APIDocumentationService:
    """Service for generating and managing API documentation."""
    
    def __init__(self):
        self.endpoints = []
        self.schemas = {}
        self._load_endpoint_definitions()
        self._load_schemas()
    
    def _load_endpoint_definitions(self):
        """Load all API endpoint definitions."""
        self.endpoints = [
            # Authentication Endpoints
            Endpoint(
                path="/api/auth/register",
                method=HTTPMethod.POST,
                summary="Register a new user",
                description="Create a new user account with email, password, and role",
                auth_required=False,
                auth_type=AuthType.NONE,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "email": {"type": "string", "format": "email"},
                        "password": {"type": "string", "minLength": 6},
                        "role": {"type": "string", "enum": ["client", "vendor", "admin"]}
                    },
                    "required": ["email", "password"]
                },
                responses=[
                    ResponseExample(
                        status_code=201,
                        description="User created successfully",
                        example={
                            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                            "role": "client",
                            "message": "Account created successfully"
                        }
                    ),
                    ResponseExample(
                        status_code=400,
                        description="Validation error",
                        example={
                            "error": "Email already registered"
                        }
                    )
                ],
                tags=["Authentication"]
            ),
            
            Endpoint(
                path="/api/auth/login",
                method=HTTPMethod.POST,
                summary="Authenticate user",
                description="Login with email and password to get access token",
                auth_required=False,
                auth_type=AuthType.NONE,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "email": {"type": "string", "format": "email"},
                        "password": {"type": "string"}
                    },
                    "required": ["email", "password"]
                },
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Login successful",
                        example={
                            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                            "role": "client",
                            "message": "Login successful"
                        }
                    ),
                    ResponseExample(
                        status_code=401,
                        description="Invalid credentials",
                        example={
                            "error": "Invalid email or password"
                        }
                    )
                ],
                tags=["Authentication"]
            ),
            
            # Lead Management Endpoints
            Endpoint(
                path="/api/leads",
                method=HTTPMethod.GET,
                summary="Get all leads",
                description="Retrieve all available leads with optional filtering",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[
                    Parameter("page", "integer", False, "Page number", 1),
                    Parameter("per_page", "integer", False, "Items per page", 20),
                    Parameter("industry", "string", False, "Filter by industry"),
                    Parameter("location", "string", False, "Filter by location"),
                    Parameter("min_price", "number", False, "Minimum price filter"),
                    Parameter("max_price", "number", False, "Maximum price filter"),
                    Parameter("status", "string", False, "Filter by status", enum=["available", "sold", "pending"])
                ],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Leads retrieved successfully",
                        example={
                            "leads": [
                                {
                                    "id": 1,
                                    "title": "Tech Startup CEO",
                                    "description": "CEO of a rapidly growing tech startup",
                                    "industry": "Technology",
                                    "price": 150.00,
                                    "contact_name": "Alice Johnson",
                                    "company_name": "InnovateX Solutions",
                                    "location": "San Francisco, CA",
                                    "lead_score": 92.5,
                                    "status": "available"
                                }
                            ],
                            "total": 1,
                            "page": 1,
                            "per_page": 20
                        }
                    )
                ],
                tags=["Leads"]
            ),
            
            Endpoint(
                path="/api/leads/{lead_id}",
                method=HTTPMethod.GET,
                summary="Get lead details",
                description="Retrieve detailed information about a specific lead",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[
                    Parameter("lead_id", "integer", True, "Lead ID")
                ],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Lead details retrieved",
                        example={
                            "id": 1,
                            "title": "Tech Startup CEO",
                            "description": "CEO of a rapidly growing tech startup",
                            "industry": "Technology",
                            "price": 150.00,
                            "contact_name": "Alice Johnson",
                            "contact_email": "alice.j@techcorp.com",
                            "contact_phone": "555-1001",
                            "company_name": "InnovateX Solutions",
                            "location": "San Francisco, CA",
                            "lead_score": 92.5,
                            "status": "available",
                            "vendor": {
                                "id": 2,
                                "email": "vendor@example.com"
                            }
                        }
                    ),
                    ResponseExample(
                        status_code=404,
                        description="Lead not found",
                        example={
                            "error": "Lead not found"
                        }
                    )
                ],
                tags=["Leads"]
            ),
            
            # Lead Upload Endpoints
            Endpoint(
                path="/api/leads/upload",
                method=HTTPMethod.POST,
                summary="Upload leads CSV",
                description="Upload a CSV file containing lead data for parsing",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "file": {"type": "string", "format": "binary"}
                    },
                    "required": ["file"]
                },
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="CSV parsed successfully",
                        example={
                            "parsed_leads": [
                                {
                                    "title": "Tech Startup CEO",
                                    "description": "CEO of a rapidly growing tech startup",
                                    "industry": "Technology",
                                    "price": 150.00,
                                    "contact_name": "Alice Johnson",
                                    "contact_email": "alice.j@techcorp.com",
                                    "contact_phone": "555-1001",
                                    "company_name": "InnovateX Solutions",
                                    "location": "San Francisco, CA"
                                }
                            ],
                            "total_parsed": 1,
                            "validation_errors": []
                        }
                    )
                ],
                tags=["Leads", "Upload"]
            ),
            
            Endpoint(
                path="/api/leads/upload/confirm",
                method=HTTPMethod.POST,
                summary="Confirm lead upload",
                description="Confirm and create leads from parsed CSV data",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "leads": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/LeadInput"}
                        }
                    },
                    "required": ["leads"]
                },
                responses=[
                    ResponseExample(
                        status_code=201,
                        description="Leads created successfully",
                        example={
                            "created": 5,
                            "skipped": 2,
                            "message": "Successfully created 5 leads. 2 leads were skipped as duplicates."
                        }
                    )
                ],
                tags=["Leads", "Upload"]
            ),
            
            # Marketplace Endpoints
            Endpoint(
                path="/api/marketplace",
                method=HTTPMethod.GET,
                summary="Get marketplace leads",
                description="Get leads available for purchase in the marketplace",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[
                    Parameter("page", "integer", False, "Page number", 1),
                    Parameter("per_page", "integer", False, "Items per page", 20),
                    Parameter("search", "string", False, "Search query"),
                    Parameter("industry", "string", False, "Filter by industry"),
                    Parameter("location", "string", False, "Filter by location"),
                    Parameter("min_price", "number", False, "Minimum price"),
                    Parameter("max_price", "number", False, "Maximum price"),
                    Parameter("sort_by", "string", False, "Sort field", enum=["price", "lead_score", "created_at"]),
                    Parameter("sort_order", "string", False, "Sort order", enum=["asc", "desc"])
                ],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Marketplace leads retrieved",
                        example={
                            "leads": [
                                {
                                    "id": 1,
                                    "title": "Tech Startup CEO",
                                    "description": "CEO of a rapidly growing tech startup",
                                    "industry": "Technology",
                                    "price": 150.00,
                                    "lead_score": 92.5,
                                    "status": "available"
                                }
                            ],
                            "total": 1,
                            "page": 1,
                            "per_page": 20,
                            "filters": {
                                "industries": ["Technology", "Healthcare", "Finance"],
                                "locations": ["San Francisco", "New York", "London"],
                                "price_range": {"min": 50, "max": 500, "avg": 150}
                            }
                        }
                    )
                ],
                tags=["Marketplace"]
            ),
            
            # Purchase Endpoints
            Endpoint(
                path="/api/purchases",
                method=HTTPMethod.POST,
                summary="Purchase lead",
                description="Purchase a single lead or multiple leads",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "lead_ids": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "Array of lead IDs to purchase"
                        },
                        "payment_method": {
                            "type": "string",
                            "enum": ["credits", "subscription"],
                            "description": "Payment method to use"
                        }
                    },
                    "required": ["lead_ids", "payment_method"]
                },
                responses=[
                    ResponseExample(
                        status_code=201,
                        description="Purchase successful",
                        example={
                            "purchase_id": 123,
                            "total_amount": 300.00,
                            "leads_purchased": 2,
                            "payment_status": "completed",
                            "message": "Purchase completed successfully"
                        }
                    ),
                    ResponseExample(
                        status_code=400,
                        description="Purchase failed",
                        example={
                            "error": "Insufficient credits"
                        }
                    )
                ],
                tags=["Purchases"]
            ),
            
            # Cart Endpoints
            Endpoint(
                path="/api/cart",
                method=HTTPMethod.GET,
                summary="Get cart items",
                description="Retrieve items in the user's shopping cart",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Cart items retrieved",
                        example={
                            "items": [
                                {
                                    "id": 1,
                                    "title": "Tech Startup CEO",
                                    "price": 150.00,
                                    "added_at": "2024-01-15T10:30:00Z"
                                }
                            ],
                            "total": 150.00,
                            "item_count": 1
                        }
                    )
                ],
                tags=["Cart"]
            ),
            
            Endpoint(
                path="/api/cart/add",
                method=HTTPMethod.POST,
                summary="Add item to cart",
                description="Add a lead to the shopping cart",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "lead_id": {"type": "integer"}
                    },
                    "required": ["lead_id"]
                },
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Item added to cart",
                        example={
                            "message": "Item added to cart successfully",
                            "cart_total": 150.00,
                            "item_count": 1
                        }
                    )
                ],
                tags=["Cart"]
            ),
            
            Endpoint(
                path="/api/cart/remove/{item_id}",
                method=HTTPMethod.DELETE,
                summary="Remove item from cart",
                description="Remove a lead from the shopping cart",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[
                    Parameter("item_id", "integer", True, "Cart item ID")
                ],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Item removed from cart",
                        example={
                            "message": "Item removed from cart successfully",
                            "cart_total": 0.00,
                            "item_count": 0
                        }
                    )
                ],
                tags=["Cart"]
            ),
            
            # Dashboard Endpoints
            Endpoint(
                path="/api/dashboard/stats",
                method=HTTPMethod.GET,
                summary="Get dashboard statistics",
                description="Retrieve key statistics for the user dashboard",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Dashboard stats retrieved",
                        example={
                            "total_leads": 25,
                            "total_sales": 1500.00,
                            "conversion_rate": 0.15,
                            "recent_activity": [
                                {
                                    "type": "lead_purchased",
                                    "description": "Purchased Tech Startup CEO lead",
                                    "amount": 150.00,
                                    "timestamp": "2024-01-15T10:30:00Z"
                                }
                            ]
                        }
                    )
                ],
                tags=["Dashboard"]
            ),
            
            # Communication Endpoints
            Endpoint(
                path="/api/messages",
                method=HTTPMethod.GET,
                summary="Get messages",
                description="Retrieve user's messages",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[
                    Parameter("page", "integer", False, "Page number", 1),
                    Parameter("per_page", "integer", False, "Items per page", 20),
                    Parameter("unread_only", "boolean", False, "Show only unread messages", False)
                ],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Messages retrieved",
                        example={
                            "messages": [
                                {
                                    "id": 1,
                                    "subject": "Lead Inquiry",
                                    "body": "I'm interested in your Tech Startup CEO lead",
                                    "sender": {
                                        "id": 3,
                                        "email": "client@example.com"
                                    },
                                    "read": False,
                                    "created_at": "2024-01-15T10:30:00Z"
                                }
                            ],
                            "total": 1,
                            "unread_count": 1
                        }
                    )
                ],
                tags=["Communication"]
            ),
            
            Endpoint(
                path="/api/messages",
                method=HTTPMethod.POST,
                summary="Send message",
                description="Send a new message to another user",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "recipient_id": {"type": "integer"},
                        "subject": {"type": "string"},
                        "body": {"type": "string"},
                        "lead_id": {"type": "integer", "description": "Optional lead reference"}
                    },
                    "required": ["recipient_id", "subject", "body"]
                },
                responses=[
                    ResponseExample(
                        status_code=201,
                        description="Message sent successfully",
                        example={
                            "message_id": 1,
                            "message": "Message sent successfully"
                        }
                    )
                ],
                tags=["Communication"]
            ),
            
            # Advanced Features Endpoints
            Endpoint(
                path="/api/advanced/leads/score",
                method=HTTPMethod.POST,
                summary="Calculate lead score",
                description="Calculate lead score based on various criteria",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[],
                request_body={
                    "type": "object",
                    "properties": {
                        "lead_id": {"type": "integer"},
                        "criteria": {
                            "type": "object",
                            "properties": {
                                "company_size_weight": {"type": "number"},
                                "decision_maker_weight": {"type": "number"},
                                "timeline_weight": {"type": "number"},
                                "budget_weight": {"type": "number"}
                            }
                        }
                    },
                    "required": ["lead_id"]
                },
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Lead score calculated",
                        example={
                            "lead_id": 1,
                            "score": 92.5,
                            "factors": {
                                "company_size": 25.0,
                                "decision_maker": 30.0,
                                "timeline": 20.0,
                                "budget": 17.5
                            }
                        }
                    )
                ],
                tags=["Advanced Features"]
            ),
            
            Endpoint(
                path="/api/advanced/analytics/realtime",
                method=HTTPMethod.GET,
                summary="Get real-time analytics",
                description="Retrieve real-time analytics and insights",
                auth_required=True,
                auth_type=AuthType.JWT,
                parameters=[
                    Parameter("timeframe", "string", False, "Time frame for analytics", "24h", enum=["1h", "24h", "7d", "30d"])
                ],
                responses=[
                    ResponseExample(
                        status_code=200,
                        description="Real-time analytics retrieved",
                        example={
                            "leads_uploaded": 15,
                            "leads_purchased": 8,
                            "revenue_generated": 1200.00,
                            "conversion_rate": 0.53,
                            "top_industries": [
                                {"industry": "Technology", "count": 5},
                                {"industry": "Healthcare", "count": 3}
                            ],
                            "trends": {
                                "leads_trend": [10, 12, 15, 8, 11, 9, 13],
                                "revenue_trend": [800, 950, 1200, 750, 1100, 850, 1300]
                            }
                        }
                    )
                ],
                tags=["Advanced Features", "Analytics"]
            )
        ]
    
    def _load_schemas(self):
        """Load JSON schemas for request/response models."""
        self.schemas = {
            "User": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "email": {"type": "string", "format": "email"},
                    "role": {"type": "string", "enum": ["client", "vendor", "admin"]},
                    "is_active": {"type": "boolean"},
                    "credits": {"type": "number"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            },
            "Lead": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "industry": {"type": "string"},
                    "price": {"type": "number"},
                    "contact_name": {"type": "string"},
                    "contact_email": {"type": "string", "format": "email"},
                    "contact_phone": {"type": "string"},
                    "company_name": {"type": "string"},
                    "location": {"type": "string"},
                    "lead_score": {"type": "number"},
                    "status": {"type": "string", "enum": ["available", "sold", "pending", "expired"]},
                    "vendor_id": {"type": "integer"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            },
            "LeadInput": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "industry": {"type": "string"},
                    "price": {"type": "number"},
                    "contact_name": {"type": "string"},
                    "contact_email": {"type": "string", "format": "email"},
                    "contact_phone": {"type": "string"},
                    "company_name": {"type": "string"},
                    "location": {"type": "string"}
                },
                "required": ["title", "description", "price", "contact_name", "company_name"]
            },
            "Purchase": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "user_id": {"type": "integer"},
                    "lead_id": {"type": "integer"},
                    "amount": {"type": "number"},
                    "status": {"type": "string", "enum": ["pending", "completed", "failed", "refunded"]},
                    "payment_method": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            },
            "Message": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "sender_id": {"type": "integer"},
                    "recipient_id": {"type": "integer"},
                    "subject": {"type": "string"},
                    "body": {"type": "string"},
                    "read": {"type": "boolean"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            },
            "Error": {
                "type": "object",
                "properties": {
                    "error": {"type": "string"},
                    "message": {"type": "string"},
                    "details": {"type": "object"}
                }
            }
        }
    
    def generate_openapi_spec(self) -> Dict[str, Any]:
        """Generate OpenAPI 3.0 specification."""
        paths = {}
        
        for endpoint in self.endpoints:
            path_item = {
                endpoint.method.value.lower(): {
                    "summary": endpoint.summary,
                    "description": endpoint.description,
                    "tags": endpoint.tags or [],
                    "security": self._get_security_requirement(endpoint),
                    "parameters": self._convert_parameters(endpoint.parameters),
                    "responses": self._convert_responses(endpoint.responses)
                }
            }
            
            if endpoint.request_body:
                path_item[endpoint.method.value.lower()]["requestBody"] = {
                    "content": {
                        "application/json": {
                            "schema": endpoint.request_body
                        }
                    },
                    "required": True
                }
            
            if endpoint.path in paths:
                paths[endpoint.path].update(path_item)
            else:
                paths[endpoint.path] = path_item
        
        return {
            "openapi": "3.0.0",
            "info": {
                "title": "Lead-Nexus API",
                "version": "1.0.0",
                "description": "Comprehensive B2B lead management API for Lead-Nexus platform",
                "contact": {
                    "name": "Lead-Nexus Support",
                    "email": "support@lead-nexus.com"
                }
            },
            "servers": [
                {
                    "url": "http://localhost:5001",
                    "description": "Development server"
                },
                {
                    "url": "https://api.lead-nexus.com",
                    "description": "Production server"
                }
            ],
            "paths": paths,
            "components": {
                "schemas": self.schemas,
                "securitySchemes": {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                }
            },
            "tags": [
                {"name": "Authentication", "description": "User authentication and registration"},
                {"name": "Leads", "description": "Lead management operations"},
                {"name": "Upload", "description": "Lead upload and CSV processing"},
                {"name": "Marketplace", "description": "Lead marketplace operations"},
                {"name": "Purchases", "description": "Lead purchase operations"},
                {"name": "Cart", "description": "Shopping cart management"},
                {"name": "Dashboard", "description": "User dashboard and statistics"},
                {"name": "Communication", "description": "In-app messaging system"},
                {"name": "Advanced Features", "description": "Advanced lead management features"},
                {"name": "Analytics", "description": "Analytics and reporting"}
            ]
        }
    
    def _get_security_requirement(self, endpoint: Endpoint) -> List[Dict[str, List[str]]]:
        """Get security requirements for endpoint."""
        if endpoint.auth_required:
            return [{"bearerAuth": []}]
        return []
    
    def _convert_parameters(self, parameters: List[Parameter]) -> List[Dict[str, Any]]:
        """Convert parameters to OpenAPI format."""
        converted = []
        
        for param in parameters:
            converted_param = {
                "name": param.name,
                "in": "query" if param.name not in ["lead_id", "item_id"] else "path",
                "description": param.description,
                "required": param.required,
                "schema": {
                    "type": param.type
                }
            }
            
            if param.default is not None:
                converted_param["schema"]["default"] = param.default
            
            if param.enum:
                converted_param["schema"]["enum"] = param.enum
            
            if param.example is not None:
                converted_param["example"] = param.example
            
            converted.append(converted_param)
        
        return converted
    
    def _convert_responses(self, responses: List[ResponseExample]) -> Dict[str, Any]:
        """Convert responses to OpenAPI format."""
        converted = {}
        
        for response in responses:
            converted[str(response.status_code)] = {
                "description": response.description,
                "content": {
                    "application/json": {
                        "example": response.example
                    }
                }
            }
            
            if response.schema:
                converted[str(response.status_code)]["content"]["application/json"]["schema"] = response.schema
        
        return converted
    
    def generate_postman_collection(self) -> Dict[str, Any]:
        """Generate Postman collection for API testing."""
        items = []
        
        for endpoint in self.endpoints:
            item = {
                "name": f"{endpoint.method.value} {endpoint.path}",
                "request": {
                    "method": endpoint.method.value,
                    "header": [],
                    "url": {
                        "raw": f"{{base_url}}{endpoint.path}",
                        "host": ["{{base_url}}"],
                        "path": endpoint.path.split("/")[1:]
                    }
                },
                "response": []
            }
            
            # Add authentication header if required
            if endpoint.auth_required:
                item["request"]["header"].append({
                    "key": "Authorization",
                    "value": "Bearer {{token}}",
                    "type": "text"
                })
            
            # Add content-type header for POST/PUT requests
            if endpoint.method in [HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.PATCH]:
                item["request"]["header"].append({
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                })
            
            # Add request body if present
            if endpoint.request_body:
                item["request"]["body"] = {
                    "mode": "raw",
                    "raw": json.dumps(endpoint.request_body.get("example", {}), indent=2)
                }
            
            items.append(item)
        
        return {
            "info": {
                "name": "Lead-Nexus API",
                "description": "Complete API collection for Lead-Nexus platform",
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            "variable": [
                {
                    "key": "base_url",
                    "value": "http://localhost:5001",
                    "type": "string"
                },
                {
                    "key": "token",
                    "value": "your_jwt_token_here",
                    "type": "string"
                }
            ],
            "item": items
        }
    
    def generate_curl_examples(self) -> Dict[str, List[str]]:
        """Generate cURL examples for all endpoints."""
        examples = {}
        
        for endpoint in self.endpoints:
            curl_commands = []
            
            # Basic cURL command
            curl = f"curl -X {endpoint.method.value}"
            
            # Add headers
            headers = ["Content-Type: application/json"]
            if endpoint.auth_required:
                headers.append("Authorization: Bearer YOUR_JWT_TOKEN")
            
            for header in headers:
                curl += f" -H '{header}'"
            
            # Add URL
            curl += f" 'http://localhost:5001{endpoint.path}'"
            
            # Add body for POST/PUT requests
            if endpoint.request_body and endpoint.method in [HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.PATCH]:
                example_body = endpoint.request_body.get("example", {})
                curl += f" -d '{json.dumps(example_body)}'"
            
            curl_commands.append(curl)
            
            # Add authenticated version
            if not endpoint.auth_required:
                auth_curl = curl.replace("'http://localhost:5001", "'http://localhost:5001")
                curl_commands.append(auth_curl)
            
            examples[f"{endpoint.method.value} {endpoint.path}"] = curl_commands
        
        return examples
    
    def generate_api_documentation(self) -> APIDocumentation:
        """Generate complete API documentation."""
        return APIDocumentation(
            title="Lead-Nexus API Documentation",
            version="1.0.0",
            description="Comprehensive API documentation for the Lead-Nexus B2B lead management platform",
            base_url="http://localhost:5001",
            endpoints=self.endpoints,
            schemas=self.schemas,
            tags=["Authentication", "Leads", "Upload", "Marketplace", "Purchases", "Cart", "Dashboard", "Communication", "Advanced Features", "Analytics"],
            info={
                "generated_at": datetime.utcnow().isoformat(),
                "total_endpoints": len(self.endpoints),
                "auth_methods": ["JWT Bearer Token"],
                "rate_limits": "1000 requests per hour per user"
            }
        )
    
    def save_documentation_files(self, output_dir: str = "docs"):
        """Save all documentation files to disk."""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Save OpenAPI spec
        with open(output_path / "openapi.json", "w") as f:
            json.dump(self.generate_openapi_spec(), f, indent=2)
        
        # Save Postman collection
        with open(output_path / "postman_collection.json", "w") as f:
            json.dump(self.generate_postman_collection(), f, indent=2)
        
        # Save cURL examples
        with open(output_path / "curl_examples.json", "w") as f:
            json.dump(self.generate_curl_examples(), f, indent=2)
        
        # Save complete documentation
        doc = self.generate_api_documentation()
        with open(output_path / "api_documentation.json", "w") as f:
            json.dump(asdict(doc), f, indent=2, default=str)
        
        # Generate README
        self._generate_readme(output_path)
    
    def _generate_readme(self, output_path: Path):
        """Generate README file for documentation."""
        readme_content = """# Lead-Nexus API Documentation

## Overview
This directory contains comprehensive API documentation for the Lead-Nexus B2B lead management platform.

## Files
- `openapi.json` - OpenAPI 3.0 specification
- `postman_collection.json` - Postman collection for testing
- `curl_examples.json` - cURL examples for all endpoints
- `api_documentation.json` - Complete API documentation

## Quick Start

### Authentication
All authenticated endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Base URL
- Development: `http://localhost:5001`
- Production: `https://api.lead-nexus.com`

### Example Request
```bash
curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"email": "user@example.com", "password": "password123"}' \\
  http://localhost:5001/api/auth/login
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/{id}` - Get lead details
- `POST /api/leads/upload` - Upload leads CSV
- `POST /api/leads/upload/confirm` - Confirm lead upload

### Marketplace
- `GET /api/marketplace` - Get marketplace leads

### Purchases
- `POST /api/purchases` - Purchase leads

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/{id}` - Remove item from cart

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Communication
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

### Advanced Features
- `POST /api/advanced/leads/score` - Calculate lead score
- `GET /api/advanced/analytics/realtime` - Get real-time analytics

## Testing
1. Import `postman_collection.json` into Postman
2. Set the `base_url` and `token` variables
3. Start testing the API endpoints

## Support
For API support, contact: support@lead-nexus.com
"""
        
        with open(output_path / "README.md", "w") as f:
            f.write(readme_content)


# Global instance
api_documentation_service = APIDocumentationService()
