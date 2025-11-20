import uuid
from collections import defaultdict

from fastapi import HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Lead, LeadList
from app.schemas.leads import LeadSearchFilters


def _apply_filters(query, filters: LeadSearchFilters):
    from sqlalchemy import or_
    
    conditions = []
    operator = filters.boolean_operator or "AND"
    
    # Support both single and multi-select filters (backward compatible)
    if filters.job_title:
        conditions.append(Lead.job_title.ilike(f"%{filters.job_title}%"))
    elif filters.job_titles:
        if operator == "OR":
            job_conditions = [Lead.job_title.ilike(f"%{jt}%") for jt in filters.job_titles if jt.strip()]
            if job_conditions:
                conditions.append(or_(*job_conditions))
        elif operator == "NOT":
            # NOT operator: exclude these job titles
            for jt in filters.job_titles:
                if jt.strip():
                    conditions.append(~Lead.job_title.ilike(f"%{jt}%"))
        else:  # AND
            for jt in filters.job_titles:
                if jt.strip():
                    conditions.append(Lead.job_title.ilike(f"%{jt}%"))
    
    if filters.company:
        conditions.append(Lead.company_name.ilike(f"%{filters.company}%"))
    elif filters.companies:
        if operator == "OR":
            company_conditions = [Lead.company_name.ilike(f"%{c}%") for c in filters.companies if c.strip()]
            if company_conditions:
                conditions.append(or_(*company_conditions))
        elif operator == "NOT":
            for c in filters.companies:
                if c.strip():
                    conditions.append(~Lead.company_name.ilike(f"%{c}%"))
        else:  # AND
            for c in filters.companies:
                if c.strip():
                    conditions.append(Lead.company_name.ilike(f"%{c}%"))
    
    if filters.location:
        conditions.append(Lead.location.ilike(f"%{filters.location}%"))
    elif filters.locations:
        if operator == "OR":
            location_conditions = [Lead.location.ilike(f"%{l}%") for l in filters.locations if l.strip()]
            if location_conditions:
                conditions.append(or_(*location_conditions))
        elif operator == "NOT":
            for l in filters.locations:
                if l.strip():
                    conditions.append(~Lead.location.ilike(f"%{l}%"))
        else:  # AND
            for l in filters.locations:
                if l.strip():
                    conditions.append(Lead.location.ilike(f"%{l}%"))
    
    if filters.domain:
        conditions.append(Lead.domain.ilike(f"%{filters.domain}%"))
    
    if conditions:
        if operator == "OR":
            query = query.where(or_(*conditions))
        else:
            query = query.where(and_(*conditions))
    return query


async def search_leads(session: AsyncSession, filters: LeadSearchFilters) -> tuple[int, list[Lead] | dict[str, list[Lead]]]:
    base_query = select(Lead)
    base_query = _apply_filters(base_query, filters)

    count_query = select(func.count()).select_from(base_query.subquery())
    total = await session.scalar(count_query)

    offset = (filters.page - 1) * filters.limit
    
    # Handle score sorting differently (computed field, not in DB)
    if filters.sort_by == "score":
        # For score sorting, fetch all matching leads, calculate scores, sort, then paginate
        from app.services.ml_lead_scoring import calculate_lead_score
        
        # Fetch all leads matching filters (without limit for sorting)
        all_leads_result = await session.execute(base_query)
        all_leads: list[Lead] = all_leads_result.scalars().all()
        
        # Calculate scores and sort
        leads_with_scores = [(lead, calculate_lead_score(lead)) for lead in all_leads]
        leads_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Apply pagination after sorting
        paginated_leads = leads_with_scores[offset:offset + filters.limit]
        leads = [lead for lead, _ in paginated_leads]
    else:
        # Apply regular sorting
        order_by = Lead.company_name  # default
        if filters.sort_by == "name":
            order_by = Lead.full_name
        elif filters.sort_by == "company":
            order_by = Lead.company_name
        elif filters.sort_by == "job_title":
            order_by = Lead.job_title
        elif filters.sort_by == "location":
            order_by = Lead.location
        
        leads_result = await session.execute(
            base_query.order_by(order_by).offset(offset).limit(filters.limit)
        )
        leads: list[Lead] = leads_result.scalars().all()

    # Group by company if requested (after sorting)
    if filters.group_by_company:
        # Group leads by company name - return as dict for route to serialize
        grouped: dict[str, list[Lead]] = defaultdict(list)
        for lead in leads:
            grouped[lead.company_name].append(lead)
        return total or 0, grouped

    return total or 0, leads


async def create_lead_list(session: AsyncSession, user_id: str, list_name: str) -> LeadList:
    lead_list = LeadList(list_name=list_name, user_id=uuid.UUID(user_id))
    session.add(lead_list)
    await session.commit()
    await session.refresh(lead_list)
    return lead_list


async def list_user_lead_lists(session: AsyncSession, user_id: str) -> list[LeadList]:
    result = await session.execute(select(LeadList).where(LeadList.user_id == uuid.UUID(user_id)))
    return result.scalars().all()


async def add_lead_to_list(session: AsyncSession, user_id: str, list_id: str, lead_id: str) -> None:
    lead_list = await session.get(LeadList, list_id, options=[selectinload(LeadList.leads)])
    if not lead_list or lead_list.user_id != uuid.UUID(user_id):
        raise HTTPException(status_code=404, detail="List not found")

    lead = await session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead not in lead_list.leads:
        lead_list.leads.append(lead)
        await session.commit()


