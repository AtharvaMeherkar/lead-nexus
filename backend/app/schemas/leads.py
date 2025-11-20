from pydantic import BaseModel


class LeadBase(BaseModel):
    full_name: str
    email: str
    job_title: str
    company_name: str
    location: str | None = None
    domain: str | None = None


class LeadRead(LeadBase):
    id: str
    lead_score: float | None = None  # ML-based lead quality score (0-100)

    class Config:
        from_attributes = True


class LeadSearchFilters(BaseModel):
    job_title: str | None = None
    company: str | None = None
    location: str | None = None
    domain: str | None = None
    # Advanced search fields
    job_titles: list[str] | None = None  # Multi-select
    companies: list[str] | None = None  # Multi-select
    locations: list[str] | None = None  # Multi-select
    boolean_operator: str | None = "AND"  # AND, OR, NOT
    page: int = 1
    limit: int = 25
    group_by_company: bool = False
    sort_by: str | None = None  # "name", "company", "job_title", "location", "score"


class LeadGroup(BaseModel):
    company_name: str
    leads: list[LeadRead]


