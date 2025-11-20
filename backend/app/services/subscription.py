from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Invoice, User


async def activate_subscription(
    session: AsyncSession,
    user: User,
    plan_name: str,
    billing_address: dict,
    amount: str = "₹500.00",
) -> User:
    user.subscription_status = "active"
    user.plan = plan_name
    user.billing_address = billing_address

    invoice = Invoice(user_id=user.id, plan_name=plan_name.title(), amount=amount, status="Paid")
    session.add(invoice)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def cancel_subscription(session: AsyncSession, user: User) -> User:
    if user.subscription_status != "active":
        raise HTTPException(status_code=400, detail="Subscription already inactive")
    user.subscription_status = "inactive"
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


