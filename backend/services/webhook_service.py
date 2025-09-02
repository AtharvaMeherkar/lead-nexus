#!/usr/bin/env python3
"""
Webhook Service
==============

Handles webhook integrations for third-party services in Lead-Nexus.
"""

from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import json
import hashlib
import hmac
import time
import requests
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from models import User, Lead, Purchase, Message


class WebhookEvent(Enum):
    """Webhook event types."""
    LEAD_CREATED = "lead.created"
    LEAD_PURCHASED = "lead.purchased"
    LEAD_UPDATED = "lead.updated"
    USER_REGISTERED = "user.registered"
    USER_LOGIN = "user.login"
    MESSAGE_SENT = "message.sent"
    PAYMENT_COMPLETED = "payment.completed"
    PAYMENT_FAILED = "payment.failed"
    SUBSCRIPTION_CREATED = "subscription.created"
    SUBSCRIPTION_CANCELLED = "subscription.cancelled"


@dataclass
class WebhookPayload:
    """Webhook payload structure."""
    event: str
    timestamp: str
    data: Dict[str, Any]
    user_id: Optional[int] = None
    metadata: Dict[str, Any] = None


@dataclass
class WebhookEndpoint:
    """Webhook endpoint configuration."""
    id: str
    url: str
    events: List[WebhookEvent]
    secret: str
    is_active: bool
    retry_count: int = 0
    max_retries: int = 3
    timeout: int = 30
    created_at: datetime = None
    last_triggered: datetime = None


class WebhookService:
    """Service for managing webhook integrations."""
    
    def __init__(self):
        self.endpoints: Dict[str, WebhookEndpoint] = {}
        self.event_handlers: Dict[WebhookEvent, List[Callable]] = {}
        self._load_default_endpoints()
        self._register_default_handlers()
    
    def _load_default_endpoints(self):
        """Load default webhook endpoints."""
        # Example endpoints - in production, these would be stored in database
        self.endpoints = {
            "zapier": WebhookEndpoint(
                id="zapier",
                url="https://hooks.zapier.com/hooks/catch/123456/abc123/",
                events=[
                    WebhookEvent.LEAD_CREATED,
                    WebhookEvent.LEAD_PURCHASED,
                    WebhookEvent.USER_REGISTERED
                ],
                secret="zapier_secret_key",
                is_active=True,
                created_at=datetime.utcnow()
            ),
            "slack": WebhookEndpoint(
                id="slack",
                url="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
                events=[
                    WebhookEvent.LEAD_PURCHASED,
                    WebhookEvent.PAYMENT_COMPLETED,
                    WebhookEvent.PAYMENT_FAILED
                ],
                secret="slack_secret_key",
                is_active=True,
                created_at=datetime.utcnow()
            ),
            "discord": WebhookEndpoint(
                id="discord",
                url="https://discord.com/api/webhooks/123456789/abcdefghijklmnop",
                events=[
                    WebhookEvent.LEAD_CREATED,
                    WebhookEvent.LEAD_PURCHASED
                ],
                secret="discord_secret_key",
                is_active=True,
                created_at=datetime.utcnow()
            )
        }
    
    def _register_default_handlers(self):
        """Register default event handlers."""
        self.register_handler(WebhookEvent.LEAD_CREATED, self._handle_lead_created)
        self.register_handler(WebhookEvent.LEAD_PURCHASED, self._handle_lead_purchased)
        self.register_handler(WebhookEvent.USER_REGISTERED, self._handle_user_registered)
        self.register_handler(WebhookEvent.PAYMENT_COMPLETED, self._handle_payment_completed)
    
    def register_handler(self, event: WebhookEvent, handler: Callable):
        """Register an event handler."""
        if event not in self.event_handlers:
            self.event_handlers[event] = []
        self.event_handlers[event].append(handler)
    
    def add_endpoint(self, endpoint: WebhookEndpoint):
        """Add a new webhook endpoint."""
        self.endpoints[endpoint.id] = endpoint
    
    def remove_endpoint(self, endpoint_id: str):
        """Remove a webhook endpoint."""
        if endpoint_id in self.endpoints:
            del self.endpoints[endpoint_id]
    
    def trigger_webhook(self, event: WebhookEvent, data: Dict[str, Any], user_id: Optional[int] = None):
        """Trigger webhooks for a specific event."""
        payload = WebhookPayload(
            event=event.value,
            timestamp=datetime.utcnow().isoformat(),
            data=data,
            user_id=user_id,
            metadata={
                "source": "lead-nexus",
                "version": "1.0.0"
            }
        )
        
        # Call event handlers
        if event in self.event_handlers:
            for handler in self.event_handlers[event]:
                try:
                    handler(payload)
                except Exception as e:
                    print(f"Error in webhook handler: {e}")
        
        # Send to webhook endpoints
        for endpoint in self.endpoints.values():
            if event in endpoint.events and endpoint.is_active:
                self._send_webhook(endpoint, payload)
    
    def _send_webhook(self, endpoint: WebhookEndpoint, payload: WebhookPayload):
        """Send webhook to endpoint."""
        try:
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "Lead-Nexus-Webhook/1.0",
                "X-Webhook-Event": payload.event,
                "X-Webhook-Timestamp": payload.timestamp
            }
            
            # Add signature if secret is provided
            if endpoint.secret:
                signature = self._generate_signature(payload, endpoint.secret)
                headers["X-Webhook-Signature"] = signature
            
            # Send request
            response = requests.post(
                endpoint.url,
                json=payload.__dict__,
                headers=headers,
                timeout=endpoint.timeout
            )
            
            # Update endpoint stats
            endpoint.last_triggered = datetime.utcnow()
            
            # Handle response
            if response.status_code >= 200 and response.status_code < 300:
                endpoint.retry_count = 0  # Reset retry count on success
                print(f"Webhook sent successfully to {endpoint.id}")
            else:
                self._handle_webhook_failure(endpoint, payload, response)
                
        except requests.exceptions.RequestException as e:
            self._handle_webhook_failure(endpoint, payload, None, str(e))
    
    def _generate_signature(self, payload: WebhookPayload, secret: str) -> str:
        """Generate HMAC signature for webhook payload."""
        message = f"{payload.event}.{payload.timestamp}.{json.dumps(payload.data, sort_keys=True)}"
        signature = hmac.new(
            secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return f"sha256={signature}"
    
    def _handle_webhook_failure(self, endpoint: WebhookEndpoint, payload: WebhookPayload, response=None, error=None):
        """Handle webhook delivery failure."""
        endpoint.retry_count += 1
        
        if endpoint.retry_count <= endpoint.max_retries:
            # Retry with exponential backoff
            retry_delay = min(60 * (2 ** (endpoint.retry_count - 1)), 3600)  # Max 1 hour
            print(f"Webhook failed for {endpoint.id}, retrying in {retry_delay} seconds")
            
            # In a real implementation, you'd use a task queue for retries
            # For now, we'll just log the failure
            print(f"Webhook retry scheduled for {endpoint.id}")
        else:
            # Max retries exceeded
            print(f"Webhook failed permanently for {endpoint.id}")
            endpoint.is_active = False
    
    def _handle_lead_created(self, payload: WebhookPayload):
        """Handle lead created event."""
        print(f"Lead created webhook triggered: {payload.data.get('lead_id')}")
    
    def _handle_lead_purchased(self, payload: WebhookPayload):
        """Handle lead purchased event."""
        print(f"Lead purchased webhook triggered: {payload.data.get('lead_id')}")
    
    def _handle_user_registered(self, payload: WebhookPayload):
        """Handle user registered event."""
        print(f"User registered webhook triggered: {payload.data.get('user_id')}")
    
    def _handle_payment_completed(self, payload: WebhookPayload):
        """Handle payment completed event."""
        print(f"Payment completed webhook triggered: {payload.data.get('payment_id')}")
    
    def get_endpoints(self) -> List[WebhookEndpoint]:
        """Get all webhook endpoints."""
        return list(self.endpoints.values())
    
    def get_endpoint(self, endpoint_id: str) -> Optional[WebhookEndpoint]:
        """Get a specific webhook endpoint."""
        return self.endpoints.get(endpoint_id)
    
    def update_endpoint(self, endpoint_id: str, updates: Dict[str, Any]) -> bool:
        """Update a webhook endpoint."""
        if endpoint_id not in self.endpoints:
            return False
        
        endpoint = self.endpoints[endpoint_id]
        
        for key, value in updates.items():
            if hasattr(endpoint, key):
                setattr(endpoint, key, value)
        
        return True
    
    def test_endpoint(self, endpoint_id: str) -> Dict[str, Any]:
        """Test a webhook endpoint with a test payload."""
        endpoint = self.get_endpoint(endpoint_id)
        if not endpoint:
            return {"success": False, "error": "Endpoint not found"}
        
        test_payload = WebhookPayload(
            event="test",
            timestamp=datetime.utcnow().isoformat(),
            data={"message": "This is a test webhook from Lead-Nexus"},
            metadata={"test": True}
        )
        
        try:
            # Send test webhook
            self._send_webhook(endpoint, test_payload)
            return {"success": True, "message": "Test webhook sent successfully"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_webhook_stats(self) -> Dict[str, Any]:
        """Get webhook statistics."""
        total_endpoints = len(self.endpoints)
        active_endpoints = sum(1 for e in self.endpoints.values() if e.is_active)
        
        event_counts = {}
        for endpoint in self.endpoints.values():
            for event in endpoint.events:
                event_counts[event.value] = event_counts.get(event.value, 0) + 1
        
        return {
            "total_endpoints": total_endpoints,
            "active_endpoints": active_endpoints,
            "events_configured": event_counts,
            "last_triggered": max(
                (e.last_triggered for e in self.endpoints.values() if e.last_triggered),
                default=None
            )
        }


# Global instance
webhook_service = WebhookService()
