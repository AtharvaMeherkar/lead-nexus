"""
Payment & Billing API Routes
===========================

This module provides API endpoints for the payment and billing system including:
- Subscription management
- Credit system
- Invoice management
- Payment processing
- Refund handling
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import Session

from models import SessionLocal
from services.payment_service import PaymentService

payments_bp = Blueprint('payments', __name__)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@payments_bp.route('/subscriptions/plans', methods=['GET'])
def get_subscription_plans():
    """Get available subscription plans"""
    try:
        db = next(get_db())
        payment_service = PaymentService(db)
        
        plans = payment_service.get_available_plans()
        
        return jsonify({
            'plans': plans,
            'count': len(plans)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/subscriptions', methods=['POST'])
@jwt_required()
def create_subscription():
    """Create a new subscription"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'plan_name' not in data:
            return jsonify({'error': 'Missing plan_name'}), 400
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        result = payment_service.create_subscription(
            user_id=user_id,
            plan_name=data['plan_name'],
            payment_method=data.get('payment_method', 'mock')
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/subscriptions', methods=['GET'])
@jwt_required()
def get_user_subscriptions():
    """Get user subscription history"""
    try:
        user_id = get_jwt_identity()
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        subscriptions = payment_service.get_user_subscriptions(user_id)
        
        return jsonify({
            'subscriptions': subscriptions,
            'count': len(subscriptions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/credits', methods=['GET'])
@jwt_required()
def get_user_credits():
    """Get user credit information"""
    try:
        user_id = get_jwt_identity()
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        credits_info = payment_service.get_user_credits(user_id)
        
        if 'error' in credits_info:
            return jsonify(credits_info), 400
        
        return jsonify(credits_info), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/credits', methods=['POST'])
@jwt_required()
def add_credits():
    """Add credits to user account"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'amount' not in data:
            return jsonify({'error': 'Missing amount'}), 400
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        result = payment_service.add_credits(
            user_id=user_id,
            amount=float(data['amount']),
            payment_method=data.get('payment_method', 'mock')
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/purchase/credits', methods=['POST'])
@jwt_required()
def purchase_with_credits():
    """Purchase a lead using credits"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['lead_id', 'lead_price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        result = payment_service.purchase_with_credits(
            user_id=user_id,
            lead_id=int(data['lead_id']),
            lead_price=float(data['lead_price'])
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/invoices', methods=['GET'])
@jwt_required()
def get_user_invoices():
    """Get user invoice history"""
    try:
        user_id = get_jwt_identity()
        limit = int(request.args.get('limit', 20))
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        invoices = payment_service.get_user_invoices(user_id, limit)
        
        return jsonify({
            'invoices': invoices,
            'count': len(invoices)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/refunds', methods=['POST'])
@jwt_required()
def process_refund():
    """Process a refund for a purchase"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['purchase_id', 'refund_amount', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        result = payment_service.process_refund(
            purchase_id=int(data['purchase_id']),
            refund_amount=float(data['refund_amount']),
            reason=data['reason']
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/payment-history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """Get user payment history"""
    try:
        user_id = get_jwt_identity()
        limit = int(request.args.get('limit', 50))
        
        db = next(get_db())
        payment_service = PaymentService(db)
        
        history = payment_service.get_payment_history(user_id, limit)
        
        return jsonify({
            'history': history,
            'count': len(history)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500