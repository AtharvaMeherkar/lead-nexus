from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models import Lead, User

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/stats")
async def public_stats(session: AsyncSession = Depends(get_db)):
    total_leads = await session.scalar(select(func.count(Lead.id))) or 0
    total_companies = await session.scalar(select(func.count(func.distinct(Lead.company_name)))) or 0
    total_jobs = await session.scalar(select(func.count(func.distinct(Lead.job_title)))) or 0
    return {
        "leads": total_leads,
        "companies": total_companies,
        "job_titles": total_jobs,
    }


class CreateAdminRequest(BaseModel):
    email: str
    password: str
    setup_token: str | None = None


@router.post("/create-admin")
async def create_admin_user(
    request: CreateAdminRequest,
    session: AsyncSession = Depends(get_db),
    x_setup_token: str | None = Header(None, alias="X-Setup-Token"),
):
    """
    Create the first admin user. 
    
    This endpoint can be called via HTTP request (no shell needed).
    
    Security options:
    1. If ADMIN_SETUP_TOKEN is set in environment, use it in header: X-Setup-Token: <token>
    2. Or pass it in request body: {"setup_token": "<token>"}
    3. If no token is configured, only works if no admin exists yet (first-time setup)
    
    Usage:
    ```bash
    curl -X POST https://your-backend.onrender.com/api/public/create-admin \
      -H "Content-Type: application/json" \
      -H "X-Setup-Token: your-secret-token" \
      -d '{"email": "admin@example.com", "password": "yourpassword123"}'
    ```
    """
    settings = get_settings()
    
    # Check if password is valid
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    # Check if user already exists (we need this for the security logic)
    existing_user_result = await session.execute(
        select(User).where(User.email == request.email)
    )
    existing_user = existing_user_result.scalar_one_or_none()
    
    # Security check: require token if configured, or allow only if no admin exists OR upgrading existing user
    setup_token = x_setup_token or request.setup_token
    
    if settings.admin_setup_token:
        # Token is required if configured
        if not setup_token or setup_token != settings.admin_setup_token:
            raise HTTPException(
                status_code=403,
                detail="Invalid setup token. Set ADMIN_SETUP_TOKEN environment variable or provide valid token."
            )
    else:
        # If no token configured:
        # - Allow if no admin exists (first-time setup)
        # - Allow if upgrading an existing user (even if admin exists)
        # - Block only if trying to create a NEW admin when one already exists
        if not existing_user:
            admin_count = await session.scalar(
                select(func.count(User.id)).where(User.role == "admin")
            ) or 0
            
            if admin_count > 0:
                raise HTTPException(
                    status_code=403,
                    detail="Admin user already exists. Set ADMIN_SETUP_TOKEN environment variable to create additional admins, or use an existing user's email to upgrade them to admin."
                )
    
    if existing_user:
        # Update existing user to admin (upgrade regular user to admin)
        existing_user.role = "admin"
        existing_user.hashed_password = get_password_hash(request.password)
        await session.commit()
        await session.refresh(existing_user)
        return {
            "message": f"User '{request.email}' updated to admin role",
            "email": existing_user.email,
            "role": existing_user.role
        }
    else:
        # Create new admin user
        admin_user = User(
            email=request.email,
            hashed_password=get_password_hash(request.password),
            role="admin",
        )
        session.add(admin_user)
        await session.commit()
        await session.refresh(admin_user)
        return {
            "message": f"Admin user '{request.email}' created successfully",
            "email": admin_user.email,
            "role": admin_user.role
        }


