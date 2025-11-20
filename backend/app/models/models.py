import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def generate_uuid() -> uuid.UUID:
    return uuid.uuid4()


list_leads_association = Table(
    "list_leads_association",
    Base.metadata,
    Column("list_id", UUID(as_uuid=True), ForeignKey("lead_lists.id", ondelete="CASCADE"), primary_key=True),
    Column("lead_id", UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="client")
    subscription_status: Mapped[str] = mapped_column(String(50), default="inactive")
    plan: Mapped[str | None] = mapped_column(String(50), nullable=True)
    billing_address: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    lead_lists: Mapped[list["LeadList"]] = relationship("LeadList", back_populates="owner", cascade="all, delete-orphan")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True)

    lead_lists: Mapped[list["LeadList"]] = relationship(
        "LeadList", secondary=list_leads_association, back_populates="leads"
    )


class LeadList(Base):
    __tablename__ = "lead_lists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    list_name: Mapped[str] = mapped_column(String(255), nullable=False)

    owner: Mapped[User] = relationship("User", back_populates="lead_lists")
    leads: Mapped[list[Lead]] = relationship("Lead", secondary=list_leads_association, back_populates="lead_lists")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    plan_name: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Paid")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    user: Mapped[User] = relationship("User", back_populates="invoices")


