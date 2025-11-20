from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.services.subscription import activate_subscription, cancel_subscription


class ActivatePayload(BaseModel):
    plan_name: str
    billing_address: dict
    amount: str | None = None


router = APIRouter(prefix="/subscription", tags=["subscription"])


@router.post("/activate")
async def activate(
    payload: ActivatePayload,
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    updated_user = await activate_subscription(
        session,
        current_user,
        payload.plan_name,
        payload.billing_address,
        payload.amount or "₹500.00",
    )
    return {"status": updated_user.subscription_status, "plan": updated_user.plan}


@router.post("/cancel")
async def cancel(
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    updated_user = await cancel_subscription(session, current_user)
    return {"status": updated_user.subscription_status}


