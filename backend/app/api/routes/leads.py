from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, or_, and_

from app.api.deps import get_current_active_user, get_db
from app.schemas.leads import LeadGroup, LeadRead, LeadSearchFilters
from app.schemas.users import LeadListCreate, LeadListRead
from app.services.leads import add_lead_to_list, create_lead_list, list_user_lead_lists, search_leads
from app.services.ml_lead_scoring import calculate_lead_score
from app.models import Lead


class MergeDuplicatesRequest(BaseModel):
    keep_lead_id: str
    duplicate_ids: list[str]

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/search")
async def search(
    job_title: str | None = None,
    company: str | None = None,
    location: str | None = None,
    domain: str | None = None,
    # Advanced search parameters
    job_titles: list[str] | None = Query(None),
    companies: list[str] | None = Query(None),
    locations: list[str] | None = Query(None),
    boolean_operator: str | None = Query("AND", regex="^(AND|OR|NOT)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    group_by_company: bool = False,
    sort_by: str | None = Query(None, regex="^(name|company|job_title|location|score)$"),
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    filters = LeadSearchFilters(
        job_title=job_title,
        company=company,
        location=location,
        domain=domain,
        job_titles=job_titles,
        companies=companies,
        locations=locations,
        boolean_operator=boolean_operator,
        page=page,
        limit=limit,
        group_by_company=group_by_company,
        sort_by=sort_by,
    )
    total, data = await search_leads(session, filters)
    serialized = []
    
    if isinstance(data, dict):
        # Grouped by company
        for company_name, leads in data.items():
            serialized_leads = [
                LeadRead(
                    id=str(lead.id),
                    full_name=lead.full_name,
                    email=lead.email,
                    job_title=lead.job_title,
                    company_name=lead.company_name,
                    location=lead.location,
                    domain=lead.domain,
                    lead_score=calculate_lead_score(lead),
                ).model_dump()
                for lead in leads
            ]
            serialized.append({
                "company_name": company_name,
                "leads": serialized_leads,
            })
    else:
        # Regular list of leads
        for lead in data:
            serialized.append(LeadRead(
                id=str(lead.id),
                full_name=lead.full_name,
                email=lead.email,
                job_title=lead.job_title,
                company_name=lead.company_name,
                location=lead.location,
                domain=lead.domain,
                lead_score=calculate_lead_score(lead),
            ).model_dump())
    
    return {"total": total, "page": page, "limit": limit, "data": serialized}


@router.get("/duplicates")
async def find_duplicates(
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
    threshold: float = Query(0.8, ge=0.0, le=1.0),
):
    """Find duplicate leads based on email similarity and other criteria"""
    from fastapi import HTTPException
    
    # Get all leads
    result = await session.execute(select(Lead))
    all_leads = result.scalars().all()
    
    duplicates = []
    processed = set()
    
    for i, lead1 in enumerate(all_leads):
        if str(lead1.id) in processed:
            continue
            
        group = [lead1]
        for lead2 in all_leads[i+1:]:
            if str(lead2.id) in processed:
                continue
                
            # Check for duplicates: same email (exact match) or similar email + name
            is_duplicate = False
            
            # Exact email match
            if lead1.email.lower() == lead2.email.lower():
                is_duplicate = True
            # Similar email and name
            elif (
                lead1.email.lower().split("@")[0] == lead2.email.lower().split("@")[0] and
                lead1.full_name.lower() == lead2.full_name.lower()
            ):
                is_duplicate = True
            # Same name and company
            elif (
                lead1.full_name.lower() == lead2.full_name.lower() and
                lead1.company_name.lower() == lead2.company_name.lower()
            ):
                is_duplicate = True
            
            if is_duplicate:
                group.append(lead2)
                processed.add(str(lead2.id))
        
        if len(group) > 1:
            duplicates.append({
                "group_id": str(group[0].id),
                "count": len(group),
                "leads": [
                    LeadRead(
                        id=str(lead.id),
                        full_name=lead.full_name,
                        email=lead.email,
                        job_title=lead.job_title,
                        company_name=lead.company_name,
                        location=lead.location,
                        domain=lead.domain,
                        lead_score=calculate_lead_score(lead),
                    ).model_dump()
                    for lead in group
                ]
            })
            processed.add(str(lead1.id))
    
    return {
        "total_duplicate_groups": len(duplicates),
        "total_duplicate_leads": sum(g["count"] for g in duplicates),
        "duplicates": duplicates,
    }


@router.post("/duplicates/merge")
async def merge_duplicates(
    request: MergeDuplicatesRequest,
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Merge duplicate leads, keeping one and deleting others"""
    from uuid import UUID
    from fastapi import HTTPException
    
    try:
        keep_uuid = UUID(request.keep_lead_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lead ID format")
    
    # Get the lead to keep
    lead_to_keep = await session.get(Lead, keep_uuid)
    if not lead_to_keep:
        raise HTTPException(status_code=404, detail="Lead to keep not found")
    
    # Delete duplicate leads
    deleted_count = 0
    for dup_id in request.duplicate_ids:
        try:
            dup_uuid = UUID(dup_id)
            if dup_uuid == keep_uuid:
                continue  # Skip the lead we're keeping
            lead_to_delete = await session.get(Lead, dup_uuid)
            if lead_to_delete:
                await session.delete(lead_to_delete)
                deleted_count += 1
        except ValueError:
            continue
    
    await session.commit()
    
    return {
        "detail": f"Successfully merged {deleted_count} duplicate(s)",
        "kept_lead_id": request.keep_lead_id,
        "deleted_count": deleted_count
    }


@router.post("/lists", response_model=LeadListRead, status_code=201)
async def create_list(
    payload: LeadListCreate,
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    lead_list = await create_lead_list(session, str(current_user.id), payload.list_name)
    return lead_list


@router.get("/lists", response_model=list[LeadListRead])
async def list_lists(
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    return await list_user_lead_lists(session, str(current_user.id))


@router.post("/lists/{list_id}/add/{lead_id}", status_code=204)
async def add_to_list(
    list_id: str,
    lead_id: str,
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    await add_lead_to_list(session, str(current_user.id), list_id, lead_id)
    return {"detail": "Lead added"}

