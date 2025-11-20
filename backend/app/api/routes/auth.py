from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.auth import Token, UserLogin, UserRegister
from app.schemas.users import UserRead
from app.services.auth import authenticate_user, issue_token, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=201)
async def register(payload: UserRegister, session: AsyncSession = Depends(get_db)):
    user = await register_user(session, payload.email, payload.password)
    token = issue_token(user)
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, session: AsyncSession = Depends(get_db)):
    user = await authenticate_user(session, payload.email, payload.password)
    token = issue_token(user)
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
async def read_profile(current_user: User = Depends(get_current_user)):
    # Convert UUID to string for the response
    return UserRead(
        id=str(current_user.id),
        email=current_user.email,
        role=current_user.role,
        subscription_status=current_user.subscription_status,
        plan=current_user.plan,
        billing_address=current_user.billing_address,
    )


