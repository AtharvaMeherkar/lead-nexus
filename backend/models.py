from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    ForeignKey,
    Boolean,
    JSON,
    create_engine,
    Text,
    Enum,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import enum

from config import settings


engine = create_engine(settings.database_url, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


class ApprovalStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    UNDER_REVIEW = "under_review"


class LeadValidationStatus(enum.Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, index=True)  # client | vendor | admin
    is_active = Column(Boolean, default=True)
    
    # Credit system
    credits = Column(Float, default=0.0)  # Credit balance
    
    # Vendor settings
    auto_response_enabled = Column(Boolean, default=False)  # For vendors
    
    # Notification preferences
    notification_preferences = Column(JSON, default=lambda: {
        'email_messages': True,
        'email_notifications': True,
        'in_app_notifications': True
    })
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    leads = relationship("Lead", back_populates="vendor", cascade="all,delete")
    purchases = relationship("Purchase", back_populates="buyer", cascade="all,delete")
    approvals = relationship("LeadApproval", back_populates="approver", cascade="all,delete")

    notifications = relationship("Notification", back_populates="user", cascade="all,delete")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default="available")  # available | pending | processing | sold | delivered | expired
    contact_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True, index=True)
    contact_phone = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    location = Column(String, nullable=True)
    extra = Column(JSON, nullable=True)
    
    # Lead quality and tracking
    lead_score = Column(Float, default=0.5)  # 0.0 to 1.0
    validation_status = Column(Enum(LeadValidationStatus), default=LeadValidationStatus.PENDING)
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Validation details
    validation_score = Column(Float, default=0.0)  # Automated validation score
    validation_notes = Column(Text, nullable=True)
    validation_date = Column(DateTime, nullable=True)
    
    # Vendor information
    vendor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vendor = relationship("User", back_populates="leads")

    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    approvals = relationship("LeadApproval", back_populates="lead", cascade="all,delete")
    validations = relationship("LeadValidation", back_populates="lead", cascade="all,delete")


class LeadApproval(Base):
    __tablename__ = "lead_approvals"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ApprovalStatus), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lead = relationship("Lead", back_populates="approvals")
    approver = relationship("User", back_populates="approvals")


class LeadValidation(Base):
    __tablename__ = "lead_validations"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    validation_type = Column(String, nullable=False)  # automated | manual
    score = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)  # Detailed validation results
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lead = relationship("Lead", back_populates="validations")


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="requires_payment")  # requires_payment | paid | processing | delivered | refunded | cancelled
    payment_method = Column(String, nullable=True)  # stripe | mock | bank_transfer
    stripe_payment_intent_id = Column(String, nullable=True, index=True)
    
    # Purchase tracking
    purchased_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Billing information
    billing_address = Column(JSON, nullable=True)
    payment_details = Column(JSON, nullable=True)
    
    buyer = relationship("User", back_populates="purchases")
    lead = relationship("Lead")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)





class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_type = Column(String, nullable=False)  # lead_purchased | lead_approved | message_received | etc.
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)  # Additional data for the notification
    read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    message_type = Column(String, nullable=False, default="inquiry")  # inquiry | response | notification | system | bulk
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")
    lead = relationship("Lead", backref="messages")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    invoice_number = Column(String, unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending | completed | failed | refunded
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="invoices")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    credits = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="active")  # active | cancelled | expired | past_due
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    payment_method = Column(String, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="subscriptions")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)  # Positive for credits added, negative for credits used
    transaction_type = Column(String, nullable=False)  # purchase | refund | subscription | etc.
    description = Column(String, nullable=False)
    balance_after = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="credit_transactions")


# ============================================================================
# SECURITY & COMPLIANCE MODELS
# ============================================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for anonymous events
    event = Column(String, nullable=False)  # user.login | lead.created | etc.
    description = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=False)
    event_metadata = Column(JSON, nullable=True)  # Additional event data
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="audit_logs")


class DataRequest(Base):
    __tablename__ = "data_requests"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    request_type = Column(String, nullable=False)  # export | deletion | rectification | restriction
    description = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending | processing | completed | failed
    data_url = Column(String, nullable=True)  # URL to download exported data
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", backref="data_requests")


class DataDeletion(Base):
    __tablename__ = "data_deletions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)  # No foreign key as user is deleted
    deletion_date = Column(DateTime, default=datetime.utcnow)
    reason = Column(String, nullable=False)
    data_types = Column(JSON, nullable=True)  # Types of data deleted
    created_at = Column(DateTime, default=datetime.utcnow)


class TwoFactorAuth(Base):
    __tablename__ = "two_factor_auth"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    secret = Column(String, nullable=False)
    backup_codes = Column(JSON, nullable=False)  # List of backup codes
    is_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", backref="two_factor_auth", uselist=False)


class SecurityAlert(Base):
    __tablename__ = "security_alerts"

    id = Column(Integer, primary_key=True)
    alert_id = Column(String, unique=True, nullable=False)
    alert_type = Column(String, nullable=False)  # multiple_failed_logins | suspicious_activity | etc.
    severity = Column(String, nullable=False)  # low | medium | high | critical
    description = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String, nullable=False)
    alert_metadata = Column(JSON, nullable=True)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="security_alerts")
    resolver = relationship("User", foreign_keys=[resolved_by], backref="resolved_alerts")


class LeadStatusHistory(Base):
    __tablename__ = "lead_status_history"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    status = Column(String, nullable=False)
    previous_status = Column(String, nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lead = relationship("Lead")
    user = relationship("User")


class PurchaseStatusHistory(Base):
    __tablename__ = "purchase_status_history"

    id = Column(Integer, primary_key=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)
    status = Column(String, nullable=False)
    previous_status = Column(String, nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    purchase = relationship("Purchase")
    user = relationship("User")


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


