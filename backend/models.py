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
    created_at = Column(DateTime, default=datetime.utcnow)

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
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # info | success | warning | error
    read = Column(Boolean, default=False)
    data = Column(JSON, nullable=True)  # Additional data for the notification
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")


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


