from datetime import datetime
from typing import Any

from pydantic import BaseModel


class Message(BaseModel):
    detail: str


class PaginatedResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: list[Any]


class TimestampedModel(BaseModel):
    created_at: datetime | None = None


