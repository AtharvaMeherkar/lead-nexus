from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models import Lead

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


