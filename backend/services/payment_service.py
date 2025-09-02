"""
Payment & Billing Enhancement Service
====================================

This module provides comprehensive payment and billing features including:
- Subscription plans with recurring billing
- Credit system for lead purchases
- Invoice generation and management
- Payment history and receipts
- Refund processing system
"""

import json
import uuid
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
from sqlalchemy import and_, or_, desc, asc, func
from sqlalchemy.orm import Session

from models import User, Purchase, Invoice, Subscription, CreditTransaction

logger = logging.getLogger(__name__)


class PaymentStatus(Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class SubscriptionStatus(Enum):
    """Subscription status enumeration"""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"


@dataclass
class SubscriptionPlan:
    """Subscription plan configuration"""
    name: str
    price: float
    credits: int
    features: List[str]
    duration_days: int
    max_leads_per_month: int


class PaymentService:
    """
    Enhanced payment service providing subscription management, credit system, and billing.
    
    Features:
    - Subscription plan management
    - Credit-based purchasing
    - Invoice generation
    - Payment processing
    - Refund handling
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.subscription_plans = self._initialize_subscription_plans()
    
    def create_subscription(self, user_id: int, plan_name: str, 
                          payment_method: str = "mock") -> Dict[str, Any]:
        """
        Create a new subscription for a user.
        
        Args:
            user_id: User ID
            plan_name: Name of the subscription plan
            payment_method: Payment method used
            
        Returns:
            Dictionary with subscription details
        """
        try:
            # Validate plan exists
            if plan_name not in self.subscription_plans:
                return {'error': 'Invalid subscription plan'}
            
            plan = self.subscription_plans[plan_name]
            user = self.db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return {'error': 'User not found'}
            
            # Create subscription
            subscription = Subscription(
                user_id=user_id,
                plan_name=plan_name,
                price=plan.price,
                credits=plan.credits,
                status=SubscriptionStatus.ACTIVE.value,
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow() + timedelta(days=plan.duration_days),
                payment_method=payment_method,
                created_at=datetime.utcnow()
            )
            
            self.db.add(subscription)
            
            # Add credits to user account
            user.credits = (user.credits or 0) + plan.credits
            
            # Create invoice
            invoice = self._create_invoice(user_id, plan.price, f"Subscription: {plan_name}")
            
            self.db.commit()
            
            return {
                'subscription_id': subscription.id,
                'plan_name': plan_name,
                'credits_added': plan.credits,
                'total_credits': user.credits,
                'end_date': subscription.end_date.isoformat(),
                'invoice_id': invoice['invoice_id']
            }
            
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            self.db.rollback()
            return {'error': 'Failed to create subscription'}
    
    def purchase_with_credits(self, user_id: int, lead_id: int, 
                            lead_price: float) -> Dict[str, Any]:
        """
        Purchase a lead using credits.
        
        Args:
            user_id: User ID
            lead_id: Lead ID
            lead_price: Price of the lead
            
        Returns:
            Dictionary with purchase details
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return {'error': 'User not found'}
            
            if (user.credits or 0) < lead_price:
                return {'error': 'Insufficient credits'}
            
            # Deduct credits
            user.credits -= lead_price
            
            # Create purchase record
            purchase = Purchase(
                buyer_id=user_id,
                lead_id=lead_id,
                amount=lead_price,
                payment_method="credits",
                status=PaymentStatus.COMPLETED.value,
                created_at=datetime.utcnow()
            )
            
            self.db.add(purchase)
            
            # Create credit transaction record
            credit_transaction = CreditTransaction(
                user_id=user_id,
                amount=-lead_price,
                transaction_type="purchase",
                description=f"Lead purchase: {lead_id}",
                balance_after=user.credits,
                created_at=datetime.utcnow()
            )
            
            self.db.add(credit_transaction)
            self.db.commit()
            
            return {
                'purchase_id': purchase.id,
                'credits_used': lead_price,
                'remaining_credits': user.credits,
                'status': 'completed'
            }
            
        except Exception as e:
            logger.error(f"Error purchasing with credits: {e}")
            self.db.rollback()
            return {'error': 'Failed to process purchase'}
    
    def add_credits(self, user_id: int, amount: float, 
                   payment_method: str = "mock") -> Dict[str, Any]:
        """
        Add credits to user account.
        
        Args:
            user_id: User ID
            amount: Amount of credits to add
            payment_method: Payment method used
            
        Returns:
            Dictionary with credit addition details
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return {'error': 'User not found'}
            
            # Add credits
            user.credits = (user.credits or 0) + amount
            
            # Create credit transaction record
            credit_transaction = CreditTransaction(
                user_id=user_id,
                amount=amount,
                transaction_type="purchase",
                description=f"Credit purchase: {amount} credits",
                balance_after=user.credits,
                created_at=datetime.utcnow()
            )
            
            self.db.add(credit_transaction)
            
            # Create invoice
            invoice = self._create_invoice(user_id, amount, f"Credit purchase: {amount} credits")
            
            self.db.commit()
            
            return {
                'credits_added': amount,
                'total_credits': user.credits,
                'transaction_id': credit_transaction.id,
                'invoice_id': invoice['invoice_id']
            }
            
        except Exception as e:
            logger.error(f"Error adding credits: {e}")
            self.db.rollback()
            return {'error': 'Failed to add credits'}
    
    def get_user_credits(self, user_id: int) -> Dict[str, Any]:
        """
        Get user credit information.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with credit information
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return {'error': 'User not found'}
            
            # Get recent transactions
            transactions = self.db.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(desc(CreditTransaction.created_at)).limit(10).all()
            
            return {
                'current_credits': user.credits or 0,
                'recent_transactions': [
                    {
                        'id': t.id,
                        'amount': t.amount,
                        'type': t.transaction_type,
                        'description': t.description,
                        'balance_after': t.balance_after,
                        'created_at': t.created_at.isoformat()
                    }
                    for t in transactions
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting user credits: {e}")
            return {'error': 'Failed to get credit information'}
    
    def get_user_subscriptions(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Get user subscription history.
        
        Args:
            user_id: User ID
            
        Returns:
            List of user subscriptions
        """
        try:
            subscriptions = self.db.query(Subscription).filter(
                Subscription.user_id == user_id
            ).order_by(desc(Subscription.created_at)).all()
            
            return [
                {
                    'id': sub.id,
                    'plan_name': sub.plan_name,
                    'price': sub.price,
                    'credits': sub.credits,
                    'status': sub.status,
                    'start_date': sub.start_date.isoformat(),
                    'end_date': sub.end_date.isoformat(),
                    'payment_method': sub.payment_method,
                    'created_at': sub.created_at.isoformat()
                }
                for sub in subscriptions
            ]
            
        except Exception as e:
            logger.error(f"Error getting user subscriptions: {e}")
            return []
    
    def get_user_invoices(self, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get user invoice history.
        
        Args:
            user_id: User ID
            limit: Maximum number of invoices to return
            
        Returns:
            List of user invoices
        """
        try:
            invoices = self.db.query(Invoice).filter(
                Invoice.user_id == user_id
            ).order_by(desc(Invoice.created_at)).limit(limit).all()
            
            return [
                {
                    'id': inv.id,
                    'invoice_number': inv.invoice_number,
                    'amount': inv.amount,
                    'description': inv.description,
                    'status': inv.status,
                    'created_at': inv.created_at.isoformat(),
                    'due_date': inv.due_date.isoformat() if inv.due_date else None
                }
                for inv in invoices
            ]
            
        except Exception as e:
            logger.error(f"Error getting user invoices: {e}")
            return []
    
    def process_refund(self, purchase_id: int, refund_amount: float, 
                      reason: str) -> Dict[str, Any]:
        """
        Process a refund for a purchase.
        
        Args:
            purchase_id: Purchase ID
            refund_amount: Amount to refund
            reason: Reason for refund
            
        Returns:
            Dictionary with refund details
        """
        try:
            purchase = self.db.query(Purchase).filter(Purchase.id == purchase_id).first()
            
            if not purchase:
                return {'error': 'Purchase not found'}
            
            if purchase.status != PaymentStatus.COMPLETED.value:
                return {'error': 'Purchase not eligible for refund'}
            
            if refund_amount > purchase.amount:
                return {'error': 'Refund amount exceeds purchase amount'}
            
            # Update purchase status
            purchase.status = PaymentStatus.REFUNDED.value
            purchase.refund_amount = refund_amount
            purchase.refund_reason = reason
            purchase.refunded_at = datetime.utcnow()
            
            # If paid with credits, add credits back
            if purchase.payment_method == "credits":
                user = self.db.query(User).filter(User.id == purchase.buyer_id).first()
                if user:
                    user.credits = (user.credits or 0) + refund_amount
                    
                    # Create credit transaction for refund
                    credit_transaction = CreditTransaction(
                        user_id=purchase.buyer_id,
                        amount=refund_amount,
                        transaction_type="refund",
                        description=f"Refund for purchase {purchase_id}: {reason}",
                        balance_after=user.credits,
                        created_at=datetime.utcnow()
                    )
                    
                    self.db.add(credit_transaction)
            
            self.db.commit()
            
            return {
                'refund_id': purchase.id,
                'refund_amount': refund_amount,
                'status': 'processed',
                'reason': reason
            }
            
        except Exception as e:
            logger.error(f"Error processing refund: {e}")
            self.db.rollback()
            return {'error': 'Failed to process refund'}
    
    def get_payment_history(self, user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get user payment history.
        
        Args:
            user_id: User ID
            limit: Maximum number of records to return
            
        Returns:
            List of payment history records
        """
        try:
            # Get purchases
            purchases = self.db.query(Purchase).filter(
                Purchase.buyer_id == user_id
            ).order_by(desc(Purchase.created_at)).limit(limit).all()
            
            # Get credit transactions
            credit_transactions = self.db.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(desc(CreditTransaction.created_at)).limit(limit).all()
            
            # Combine and sort by date
            history = []
            
            for purchase in purchases:
                history.append({
                    'id': purchase.id,
                    'type': 'purchase',
                    'amount': purchase.amount,
                    'description': f"Lead purchase: {purchase.lead_id}",
                    'payment_method': purchase.payment_method,
                    'status': purchase.status,
                    'created_at': purchase.created_at.isoformat()
                })
            
            for transaction in credit_transactions:
                history.append({
                    'id': transaction.id,
                    'type': 'credit_transaction',
                    'amount': transaction.amount,
                    'description': transaction.description,
                    'payment_method': 'credits',
                    'status': 'completed',
                    'created_at': transaction.created_at.isoformat()
                })
            
            # Sort by date (newest first)
            history.sort(key=lambda x: x['created_at'], reverse=True)
            
            return history[:limit]
            
        except Exception as e:
            logger.error(f"Error getting payment history: {e}")
            return []
    
    def get_available_plans(self) -> List[Dict[str, Any]]:
        """
        Get available subscription plans.
        
        Returns:
            List of available subscription plans
        """
        return [
            {
                'name': plan.name,
                'price': plan.price,
                'credits': plan.credits,
                'features': plan.features,
                'duration_days': plan.duration_days,
                'max_leads_per_month': plan.max_leads_per_month
            }
            for plan in self.subscription_plans.values()
        ]
    
    # Helper methods
    def _initialize_subscription_plans(self) -> Dict[str, SubscriptionPlan]:
        """Initialize subscription plans."""
        return {
            'starter': SubscriptionPlan(
                name='Starter',
                price=29.99,
                credits=50,
                features=['Basic lead access', 'Email support', 'Standard analytics'],
                duration_days=30,
                max_leads_per_month=100
            ),
            'professional': SubscriptionPlan(
                name='Professional',
                price=79.99,
                credits=150,
                features=['Premium lead access', 'Priority support', 'Advanced analytics', 'Bulk messaging'],
                duration_days=30,
                max_leads_per_month=500
            ),
            'enterprise': SubscriptionPlan(
                name='Enterprise',
                price=199.99,
                credits=500,
                features=['Unlimited lead access', '24/7 support', 'Custom analytics', 'API access', 'Dedicated account manager'],
                duration_days=30,
                max_leads_per_month=2000
            )
        }
    
    def _create_invoice(self, user_id: int, amount: float, description: str) -> Dict[str, Any]:
        """Create an invoice for a payment."""
        try:
            invoice = Invoice(
                user_id=user_id,
                invoice_number=f"INV-{uuid.uuid4().hex[:8].upper()}",
                amount=amount,
                description=description,
                status=PaymentStatus.COMPLETED.value,
                created_at=datetime.utcnow(),
                due_date=datetime.utcnow() + timedelta(days=30)
            )
            
            self.db.add(invoice)
            self.db.commit()
            
            return {
                'invoice_id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'amount': invoice.amount
            }
            
        except Exception as e:
            logger.error(f"Error creating invoice: {e}")
            return {'error': 'Failed to create invoice'}
