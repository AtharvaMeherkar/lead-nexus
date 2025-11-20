from typing import Any

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    role: str
    subscription_status: str
    plan: str | None


class UserRead(UserBase):
    id: str
    billing_address: dict[str, Any] | None = None

    class Config:
        from_attributes = True


class UserBillingAddress(BaseModel):
    full_name: str
    country: str
    address_line1: str
    city: str
    state: str
    postal_code: str


class UserProfile(BaseModel):
    email: EmailStr
    billing_address: dict[str, Any] | None
    plan: str | None
    subscription_status: str


class LeadListCreate(BaseModel):
    list_name: str


class LeadListRead(BaseModel):
    id: str
    list_name: str

    class Config:
        from_attributes = True


