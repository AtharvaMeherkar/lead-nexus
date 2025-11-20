from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import HTMLResponse
from fastapi_admin.app import FastAPIAdmin
from fastapi_admin.providers.login import UsernamePasswordProvider
from fastapi_admin.resources import Field, Model
from fastapi_admin.widgets import displays, inputs
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_admin_user, get_db
from app.core.security import verify_password
from app.db.database import async_session_maker, engine
from app.models import Lead, User
from app.utils.csv_loader import process_leads_csv
from app.services.ml_lead_scoring import calculate_lead_score

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

admin = FastAPIAdmin()
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])


class RoleBasedProvider(UsernamePasswordProvider):
    async def authenticate(self, request):
        form = await self.login_form_class.from_request(request)
        async with async_session_maker() as session:
            result = await session.execute(select(User).where(User.email == form.username))
            user = result.scalars().first()
            if not user or user.role != "admin" or not verify_password(form.password, user.hashed_password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            request.state.identity = user
            return user


class UserResource(Model):
    label = "Users"
    model = User
    fields = [
        "id",
        "email",
        Field("role", input_=inputs.Text(), display=displays.InputOnly()),
        Field("subscription_status", input_=inputs.Text(), display=displays.InputOnly()),
    ]


class LeadResource(Model):
    label = "Leads"
    model = Lead
    fields = [
        "id",
        "full_name",
        "email",
        "job_title",
        "company_name",
        "location",
        "domain",
    ]


async def init_admin(app):
    # Skip admin panel configuration for now - fastapi-admin 1.0.4 has API compatibility issues
    # The basic API endpoints will work without the admin panel
    # Admin panel can be configured later if needed
    print("Info: Admin panel setup skipped. Basic API endpoints are available.")
    print("Info: Custom admin routes (/api/admin/*) are still available.")
    # Always include our custom admin routes
    app.include_router(admin_router)


@admin_router.get("/stats")
async def admin_stats(
    session: AsyncSession = Depends(get_db),
    user=Depends(get_admin_user),
):
    # User statistics
    total_users = await session.scalar(select(func.count(User.id))) or 0
    active_clients = await session.scalar(
        select(func.count(User.id)).where(User.subscription_status == "active")
    ) or 0
    inactive_clients = await session.scalar(
        select(func.count(User.id)).where(User.subscription_status == "inactive")
    ) or 0
    admin_users = await session.scalar(
        select(func.count(User.id)).where(User.role == "admin")
    ) or 0
    
    # Lead statistics
    total_leads = await session.scalar(select(func.count(Lead.id))) or 0
    total_companies = await session.scalar(
        select(func.count(func.distinct(Lead.company_name)))
    ) or 0
    total_job_titles = await session.scalar(
        select(func.count(func.distinct(Lead.job_title)))
    ) or 0
    
    # Subscription statistics
    weekly_plan = await session.scalar(
        select(func.count(User.id)).where(User.plan == "weekly")
    ) or 0
    monthly_plan = await session.scalar(
        select(func.count(User.id)).where(User.plan == "monthly")
    ) or 0
    yearly_plan = await session.scalar(
        select(func.count(User.id)).where(User.plan == "yearly")
    ) or 0
    
    return {
        "users": {
            "total": total_users,
            "active_clients": active_clients,
            "inactive_clients": inactive_clients,
            "admin_users": admin_users,
        },
        "leads": {
            "total": total_leads,
            "total_companies": total_companies,
            "total_job_titles": total_job_titles,
        },
        "subscriptions": {
            "weekly": weekly_plan,
            "monthly": monthly_plan,
            "yearly": yearly_plan,
        },
    }


@admin_router.get("/users")
async def list_users(
    session: AsyncSession = Depends(get_db),
    user=Depends(get_admin_user),
    limit: int = 50,
    offset: int = 0,
):
    """List all users with pagination"""
    result = await session.execute(
        select(User).order_by(User.email).limit(limit).offset(offset)
    )
    users = result.scalars().all()
    
    total = await session.scalar(select(func.count(User.id))) or 0
    
    return {
        "total": total,
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "role": u.role,
                "subscription_status": u.subscription_status,
                "plan": u.plan,
            }
            for u in users
        ],
    }


@admin_router.get("/recent-leads")
async def recent_leads(
    session: AsyncSession = Depends(get_db),
    user=Depends(get_admin_user),
    limit: int = 20,
):
    """Get recent leads"""
    result = await session.execute(
        select(Lead).order_by(Lead.id.desc()).limit(limit)
    )
    leads = result.scalars().all()
    
    return {
        "leads": [
            {
                "id": str(l.id),
                "full_name": l.full_name,
                "email": l.email,
                "job_title": l.job_title,
                "company_name": l.company_name,
                "location": l.location,
                "domain": l.domain,
                "lead_score": calculate_lead_score(l),
            }
            for l in leads
        ],
    }


@admin_router.get("/upload-csv", response_class=HTMLResponse)
async def upload_csv_form(user=Depends(get_admin_user)):
    return """
    <html>
    <body style="font-family:Arial;background:#0b0e15;color:#fff;padding:40px;">
        <h2>Smart Lead Import</h2>
        <form action="/api/admin/upload-csv" method="post" enctype="multipart/form-data">
            <input type="file" name="file" accept=".csv,.xlsx,.xls" />
            <button type="submit">Upload</button>
        </form>
    </body>
    </html>
    """


@admin_router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    user=Depends(get_admin_user),
):
    inserted = await process_leads_csv(session, file)
    return {"detail": f"{inserted} leads imported"}


@admin_router.delete("/leads/{lead_id}")
async def delete_lead(
    lead_id: str,
    session: AsyncSession = Depends(get_db),
    user=Depends(get_admin_user),
):
    """Delete a single lead by ID"""
    from uuid import UUID
    
    try:
        lead_uuid = UUID(lead_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lead ID format")
    
    result = await session.execute(select(Lead).where(Lead.id == lead_uuid))
    lead = result.scalar_one_or_none()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    await session.delete(lead)
    await session.commit()
    
    return {"detail": "Lead deleted successfully"}


@admin_router.post("/leads/bulk-delete")
async def bulk_delete_leads(
    request: dict,
    session: AsyncSession = Depends(get_db),
    user=Depends(get_admin_user),
):
    """Delete multiple leads by IDs"""
    from uuid import UUID
    
    # Extract lead_ids from request body
    lead_ids = request.get("lead_ids", []) if isinstance(request, dict) else []
    
    if not lead_ids:
        raise HTTPException(status_code=400, detail="No lead IDs provided")
    
    valid_uuids = []
    for lead_id in lead_ids:
        try:
            valid_uuids.append(UUID(lead_id))
        except ValueError:
            continue
    
    if not valid_uuids:
        raise HTTPException(status_code=400, detail="No valid lead IDs provided")
    
    result = await session.execute(select(Lead).where(Lead.id.in_(valid_uuids)))
    leads = result.scalars().all()
    
    deleted_count = 0
    for lead in leads:
        await session.delete(lead)
        deleted_count += 1
    
    await session.commit()
    
    return {"detail": f"{deleted_count} leads deleted successfully", "deleted_count": deleted_count}


