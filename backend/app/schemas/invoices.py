from datetime import datetime

from pydantic import BaseModel


class InvoiceRead(BaseModel):
    id: str
    plan_name: str
    amount: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


