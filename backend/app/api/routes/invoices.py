from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import Invoice
from app.schemas.invoices import InvoiceRead

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("/", response_model=list[InvoiceRead])
async def list_invoices(
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await session.execute(select(Invoice).where(Invoice.user_id == current_user.id))
    return result.scalars().all()


@router.get("/{invoice_id}/download")
async def download_invoice(
    invoice_id: str,
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    invoice = await session.get(Invoice, invoice_id)
    if not invoice or invoice.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invoice not found")
    html = f"""
    <html>
    <body>
    <h2>Lead Nexus Invoice</h2>
    <p>Invoice ID: {invoice.id}</p>
    <p>Plan: {invoice.plan_name}</p>
    <p>Amount: {invoice.amount}</p>
    <p>Status: {invoice.status}</p>
    <p>Date: {invoice.created_at:%Y-%m-%d}</p>
    </body>
    </html>
    """
    return {"html": html}


