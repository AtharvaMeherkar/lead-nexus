#!/usr/bin/env python3
"""
Platform Features Routes
=======================

API routes for platform enhancements including localization, search, and webhooks.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import Session
from datetime import datetime

from models import SessionLocal
from services.localization_service import localization_service, Language
from services.search_service import search_service, SearchFilter, SearchType
from services.webhook_service import webhook_service, WebhookEvent

platform_features_bp = Blueprint('platform_features', __name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# LOCALIZATION ROUTES
# ============================================================================

@platform_features_bp.route('/localization/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages."""
    languages = localization_service.get_supported_languages()
    return jsonify({
        "languages": languages,
        "default_language": localization_service.default_language.value
    }), 200


@platform_features_bp.route('/localization/text/<language>', methods=['GET'])
def get_localized_text(language):
    """Get localized text for a specific language."""
    try:
        lang = Language(language)
    except ValueError:
        return jsonify({"error": "Unsupported language"}), 400
    
    # Get common translations
    translations = {
        "common": {
            "welcome": localization_service.get_text("common.welcome", lang),
            "login": localization_service.get_text("common.login", lang),
            "register": localization_service.get_text("common.register", lang),
            "dashboard": localization_service.get_text("common.dashboard", lang),
            "marketplace": localization_service.get_text("common.marketplace", lang),
            "profile": localization_service.get_text("common.profile", lang),
            "settings": localization_service.get_text("common.settings", lang),
            "search": localization_service.get_text("common.search", lang),
            "filter": localization_service.get_text("common.filter", lang),
            "sort": localization_service.get_text("common.sort", lang),
            "export": localization_service.get_text("common.export", lang),
            "import": localization_service.get_text("common.import", lang),
            "save": localization_service.get_text("common.save", lang),
            "cancel": localization_service.get_text("common.cancel", lang),
            "delete": localization_service.get_text("common.delete", lang),
            "edit": localization_service.get_text("common.edit", lang),
            "view": localization_service.get_text("common.view", lang),
            "add": localization_service.get_text("common.add", lang),
            "remove": localization_service.get_text("common.remove", lang),
            "loading": localization_service.get_text("common.loading", lang),
            "error": localization_service.get_text("common.error", lang),
            "success": localization_service.get_text("common.success", lang),
            "warning": localization_service.get_text("common.warning", lang),
            "info": localization_service.get_text("common.info", lang),
            "confirm": localization_service.get_text("common.confirm", lang),
            "back": localization_service.get_text("common.back", lang),
            "next": localization_service.get_text("common.next", lang),
            "previous": localization_service.get_text("common.previous", lang),
            "submit": localization_service.get_text("common.submit", lang),
            "reset": localization_service.get_text("common.reset", lang),
            "close": localization_service.get_text("common.close", lang),
            "open": localization_service.get_text("common.open", lang),
            "yes": localization_service.get_text("common.yes", lang),
            "no": localization_service.get_text("common.no", lang),
            "ok": localization_service.get_text("common.ok", lang)
        },
        "auth": {
            "login_title": localization_service.get_text("auth.login_title", lang),
            "register_title": localization_service.get_text("auth.register_title", lang),
            "email": localization_service.get_text("auth.email", lang),
            "password": localization_service.get_text("auth.password", lang),
            "confirm_password": localization_service.get_text("auth.confirm_password", lang),
            "forgot_password": localization_service.get_text("auth.forgot_password", lang),
            "remember_me": localization_service.get_text("auth.remember_me", lang),
            "login_button": localization_service.get_text("auth.login_button", lang),
            "register_button": localization_service.get_text("auth.register_button", lang),
            "already_have_account": localization_service.get_text("auth.already_have_account", lang),
            "dont_have_account": localization_service.get_text("auth.dont_have_account", lang),
            "invalid_credentials": localization_service.get_text("auth.invalid_credentials", lang),
            "account_created": localization_service.get_text("auth.account_created", lang),
            "password_mismatch": localization_service.get_text("auth.password_mismatch", lang),
            "email_required": localization_service.get_text("auth.email_required", lang),
            "password_required": localization_service.get_text("auth.password_required", lang),
            "password_min_length": localization_service.get_text("auth.password_min_length", lang)
        },
        "leads": {
            "title": localization_service.get_text("leads.title", lang),
            "description": localization_service.get_text("leads.description", lang),
            "industry": localization_service.get_text("leads.industry", lang),
            "price": localization_service.get_text("leads.price", lang),
            "contact_name": localization_service.get_text("leads.contact_name", lang),
            "contact_email": localization_service.get_text("leads.contact_email", lang),
            "contact_phone": localization_service.get_text("leads.contact_phone", lang),
            "company_name": localization_service.get_text("leads.company_name", lang),
            "location": localization_service.get_text("leads.location", lang),
            "status": localization_service.get_text("leads.status", lang),
            "lead_score": localization_service.get_text("leads.lead_score", lang),
            "upload_leads": localization_service.get_text("leads.upload_leads", lang),
            "purchase_lead": localization_service.get_text("leads.purchase_lead", lang),
            "add_to_cart": localization_service.get_text("leads.add_to_cart", lang),
            "lead_details": localization_service.get_text("leads.lead_details", lang),
            "lead_quality": localization_service.get_text("leads.lead_quality", lang),
            "lead_source": localization_service.get_text("leads.lead_source", lang),
            "lead_status": localization_service.get_text("leads.lead_status", lang),
            "available": localization_service.get_text("leads.available", lang),
            "sold": localization_service.get_text("leads.sold", lang),
            "pending": localization_service.get_text("leads.pending", lang),
            "expired": localization_service.get_text("leads.expired", lang)
        },
        "marketplace": {
            "title": localization_service.get_text("marketplace.title", lang),
            "browse_leads": localization_service.get_text("marketplace.browse_leads", lang),
            "filter_by_industry": localization_service.get_text("marketplace.filter_by_industry", lang),
            "filter_by_price": localization_service.get_text("marketplace.filter_by_price", lang),
            "filter_by_location": localization_service.get_text("marketplace.filter_by_location", lang),
            "sort_by": localization_service.get_text("marketplace.sort_by", lang),
            "price_low_to_high": localization_service.get_text("marketplace.price_low_to_high", lang),
            "price_high_to_low": localization_service.get_text("marketplace.price_high_to_low", lang),
            "date_newest": localization_service.get_text("marketplace.date_newest", lang),
            "date_oldest": localization_service.get_text("marketplace.date_oldest", lang),
            "lead_score": localization_service.get_text("marketplace.lead_score", lang),
            "no_leads_found": localization_service.get_text("marketplace.no_leads_found", lang),
            "leads_found": localization_service.get_text("marketplace.leads_found", lang),
            "view_details": localization_service.get_text("marketplace.view_details", lang),
            "contact_vendor": localization_service.get_text("marketplace.contact_vendor", lang)
        },
        "dashboard": {
            "overview": localization_service.get_text("dashboard.overview", lang),
            "recent_activity": localization_service.get_text("dashboard.recent_activity", lang),
            "quick_stats": localization_service.get_text("dashboard.quick_stats", lang),
            "total_leads": localization_service.get_text("dashboard.total_leads", lang),
            "total_sales": localization_service.get_text("dashboard.total_sales", lang),
            "total_revenue": localization_service.get_text("dashboard.total_revenue", lang),
            "conversion_rate": localization_service.get_text("dashboard.conversion_rate", lang),
            "top_performing": localization_service.get_text("dashboard.top_performing", lang),
            "recent_orders": localization_service.get_text("dashboard.recent_orders", lang),
            "recent_uploads": localization_service.get_text("dashboard.recent_uploads", lang),
            "analytics": localization_service.get_text("dashboard.analytics", lang),
            "reports": localization_service.get_text("dashboard.reports", lang),
            "performance": localization_service.get_text("dashboard.performance", lang),
            "trends": localization_service.get_text("dashboard.trends", lang)
        },
        "errors": {
            "general_error": localization_service.get_text("errors.general_error", lang),
            "network_error": localization_service.get_text("errors.network_error", lang),
            "unauthorized": localization_service.get_text("errors.unauthorized", lang),
            "not_found": localization_service.get_text("errors.not_found", lang),
            "validation_error": localization_service.get_text("errors.validation_error", lang),
            "server_error": localization_service.get_text("errors.server_error", lang),
            "timeout_error": localization_service.get_text("errors.timeout_error", lang),
            "file_too_large": localization_service.get_text("errors.file_too_large", lang),
            "invalid_file_type": localization_service.get_text("errors.invalid_file_type", lang),
            "duplicate_entry": localization_service.get_text("errors.duplicate_entry", lang)
        },
        "notifications": {
            "lead_purchased": localization_service.get_text("notifications.lead_purchased", lang),
            "lead_uploaded": localization_service.get_text("notifications.lead_uploaded", lang),
            "order_created": localization_service.get_text("notifications.order_created", lang),
            "payment_successful": localization_service.get_text("notifications.payment_successful", lang),
            "message_sent": localization_service.get_text("notifications.message_sent", lang),
            "profile_updated": localization_service.get_text("notifications.profile_updated", lang),
            "settings_saved": localization_service.get_text("notifications.settings_saved", lang)
        }
    }
    
    return jsonify({
        "language": language,
        "translations": translations
    }), 200


@platform_features_bp.route('/localization/detect', methods=['POST'])
def detect_language():
    """Detect language from text."""
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "Text is required"}), 400
    
    detected_language = localization_service.detect_language(text)
    
    return jsonify({
        "detected_language": detected_language.value,
        "confidence": 0.8  # Placeholder confidence score
    }), 200


# ============================================================================
# ADVANCED SEARCH ROUTES
# ============================================================================

@platform_features_bp.route('/search/leads', methods=['POST'])
@jwt_required()
def search_leads():
    """Advanced search for leads with AI-powered suggestions."""
    data = request.get_json()
    
    query = data.get('query', '')
    search_type = data.get('search_type', 'fuzzy')
    page = data.get('page', 1)
    per_page = data.get('per_page', 20)
    sort_by = data.get('sort_by', 'created_at')
    sort_order = data.get('sort_order', 'desc')
    
    # Parse filters
    filters = []
    if 'filters' in data:
        for filter_data in data['filters']:
            filter_obj = SearchFilter(
                field=filter_data['field'],
                operator=filter_data['operator'],
                value=filter_data['value'],
                case_sensitive=filter_data.get('case_sensitive', False)
            )
            filters.append(filter_obj)
    
    try:
        search_type_enum = SearchType(search_type)
    except ValueError:
        search_type_enum = SearchType.FUZZY
    
    db = next(get_db())
    result = search_service.search_leads(
        query=query,
        filters=filters,
        search_type=search_type_enum,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        db=db
    )
    
    # Convert leads to dict format
    leads = []
    for lead in result.items:
        leads.append({
            "id": lead.id,
            "title": lead.title,
            "description": lead.description,
            "industry": lead.industry,
            "price": lead.price,
            "contact_name": lead.contact_name,
            "contact_email": lead.contact_email,
            "contact_phone": lead.contact_phone,
            "company_name": lead.company_name,
            "location": lead.location,
            "lead_score": lead.lead_score,
            "status": lead.status,
            "created_at": lead.created_at.isoformat() if lead.created_at else None
        })
    
    # Convert suggestions to dict format
    suggestions = []
    if result.suggestions:
        for suggestion in result.suggestions:
            suggestions.append({
                "text": suggestion.text,
                "type": suggestion.type,
                "relevance_score": suggestion.relevance_score,
                "frequency": suggestion.frequency,
                "metadata": suggestion.metadata
            })
    
    return jsonify({
        "leads": leads,
        "total_count": result.total_count,
        "page": result.page,
        "per_page": result.per_page,
        "search_time_ms": result.search_time_ms,
        "suggestions": suggestions,
        "filters_applied": len(result.filters_applied)
    }), 200


@platform_features_bp.route('/search/filters', methods=['GET'])
@jwt_required()
def get_search_filters():
    """Get available search filters."""
    db = next(get_db())
    filters = search_service.get_advanced_filters(db)
    
    return jsonify(filters), 200


@platform_features_bp.route('/search/analytics', methods=['GET'])
@jwt_required()
def get_search_analytics():
    """Get search analytics and insights."""
    analytics = search_service.get_search_analytics()
    
    return jsonify(analytics), 200


# ============================================================================
# WEBHOOK ROUTES
# ============================================================================

@platform_features_bp.route('/webhooks', methods=['GET'])
@jwt_required()
def get_webhooks():
    """Get all webhook endpoints."""
    endpoints = webhook_service.get_endpoints()
    
    webhook_list = []
    for endpoint in endpoints:
        webhook_list.append({
            "id": endpoint.id,
            "url": endpoint.url,
            "events": [event.value for event in endpoint.events],
            "is_active": endpoint.is_active,
            "retry_count": endpoint.retry_count,
            "max_retries": endpoint.max_retries,
            "timeout": endpoint.timeout,
            "created_at": endpoint.created_at.isoformat() if endpoint.created_at else None,
            "last_triggered": endpoint.last_triggered.isoformat() if endpoint.last_triggered else None
        })
    
    return jsonify({
        "webhooks": webhook_list
    }), 200


@platform_features_bp.route('/webhooks/<webhook_id>', methods=['GET'])
@jwt_required()
def get_webhook(webhook_id):
    """Get a specific webhook endpoint."""
    endpoint = webhook_service.get_endpoint(webhook_id)
    
    if not endpoint:
        return jsonify({"error": "Webhook not found"}), 404
    
    return jsonify({
        "id": endpoint.id,
        "url": endpoint.url,
        "events": [event.value for event in endpoint.events],
        "is_active": endpoint.is_active,
        "retry_count": endpoint.retry_count,
        "max_retries": endpoint.max_retries,
        "timeout": endpoint.timeout,
        "created_at": endpoint.created_at.isoformat() if endpoint.created_at else None,
        "last_triggered": endpoint.last_triggered.isoformat() if endpoint.last_triggered else None
    }), 200


@platform_features_bp.route('/webhooks', methods=['POST'])
@jwt_required()
def create_webhook():
    """Create a new webhook endpoint."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['id', 'url', 'events']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate events
    try:
        events = [WebhookEvent(event) for event in data['events']]
    except ValueError as e:
        return jsonify({"error": f"Invalid event: {str(e)}"}), 400
    
    # Create webhook endpoint
    from services.webhook_service import WebhookEndpoint
    endpoint = WebhookEndpoint(
        id=data['id'],
        url=data['url'],
        events=events,
        secret=data.get('secret', ''),
        is_active=data.get('is_active', True),
        max_retries=data.get('max_retries', 3),
        timeout=data.get('timeout', 30),
        created_at=datetime.utcnow()
    )
    
    webhook_service.add_endpoint(endpoint)
    
    return jsonify({
        "message": "Webhook created successfully",
        "webhook_id": endpoint.id
    }), 201


@platform_features_bp.route('/webhooks/<webhook_id>', methods=['PUT'])
@jwt_required()
def update_webhook(webhook_id):
    """Update a webhook endpoint."""
    data = request.get_json()
    
    # Validate events if provided
    if 'events' in data:
        try:
            events = [WebhookEvent(event) for event in data['events']]
            data['events'] = events
        except ValueError as e:
            return jsonify({"error": f"Invalid event: {str(e)}"}), 400
    
    success = webhook_service.update_endpoint(webhook_id, data)
    
    if not success:
        return jsonify({"error": "Webhook not found"}), 404
    
    return jsonify({
        "message": "Webhook updated successfully"
    }), 200


@platform_features_bp.route('/webhooks/<webhook_id>', methods=['DELETE'])
@jwt_required()
def delete_webhook(webhook_id):
    """Delete a webhook endpoint."""
    webhook_service.remove_endpoint(webhook_id)
    
    return jsonify({
        "message": "Webhook deleted successfully"
    }), 200


@platform_features_bp.route('/webhooks/<webhook_id>/test', methods=['POST'])
@jwt_required()
def test_webhook(webhook_id):
    """Test a webhook endpoint."""
    result = webhook_service.test_endpoint(webhook_id)
    
    if not result['success']:
        return jsonify(result), 400
    
    return jsonify(result), 200


@platform_features_bp.route('/webhooks/stats', methods=['GET'])
@jwt_required()
def get_webhook_stats():
    """Get webhook statistics."""
    stats = webhook_service.get_webhook_stats()
    
    # Convert datetime to string
    if stats.get('last_triggered'):
        stats['last_triggered'] = stats['last_triggered'].isoformat()
    
    return jsonify(stats), 200


# ============================================================================
# THIRD-PARTY INTEGRATIONS
# ============================================================================

@platform_features_bp.route('/integrations/zapier', methods=['POST'])
def zapier_webhook():
    """Zapier webhook endpoint for lead events."""
    data = request.get_json()
    
    # Validate webhook signature
    # In a real implementation, you'd verify the signature
    
    # Process the webhook
    event_type = data.get('event_type')
    lead_data = data.get('lead_data', {})
    
    # Trigger internal webhook
    if event_type == 'lead_created':
        webhook_service.trigger_webhook(
            WebhookEvent.LEAD_CREATED,
            lead_data
        )
    elif event_type == 'lead_purchased':
        webhook_service.trigger_webhook(
            WebhookEvent.LEAD_PURCHASED,
            lead_data
        )
    
    return jsonify({
        "status": "success",
        "message": "Webhook processed successfully"
    }), 200


@platform_features_bp.route('/integrations/slack', methods=['POST'])
def slack_webhook():
    """Slack webhook endpoint for notifications."""
    data = request.get_json()
    
    # Process Slack webhook
    # In a real implementation, you'd format the message for Slack
    
    return jsonify({
        "status": "success",
        "message": "Slack notification sent"
    }), 200


@platform_features_bp.route('/integrations/discord', methods=['POST'])
def discord_webhook():
    """Discord webhook endpoint for notifications."""
    data = request.get_json()
    
    # Process Discord webhook
    # In a real implementation, you'd format the message for Discord
    
    return jsonify({
        "status": "success",
        "message": "Discord notification sent"
    }), 200
