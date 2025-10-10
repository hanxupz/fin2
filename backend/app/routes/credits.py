from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

from ..core.security import get_current_user
from ..services.credit_service import CreditService
from ..schemas.credit_schemas import (
    Credit, CreditCreate, CreditUpdate,
    CreditPayment, CreditPaymentCreate, CreditPaymentUpdate
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Credit endpoints
@router.get("/", response_model=List[Credit])
async def list_credits(current_user: dict = Depends(get_current_user)):
    credits = await CreditService.get_credits_by_user(current_user["id"])
    return credits

@router.get("/with-payments", response_model=List[dict])
async def list_credits_with_payments(current_user: dict = Depends(get_current_user)):
    """Get all credits with their associated payments in a single request."""
    return await CreditService.get_all_credits_with_payments(current_user["id"])

@router.post("/", response_model=Credit, status_code=status.HTTP_201_CREATED)
async def create_credit(data: CreditCreate, current_user: dict = Depends(get_current_user)):
    created = await CreditService.create_credit(data, current_user["id"])
    return created

@router.put("/{credit_id}", response_model=Credit)
async def update_credit(credit_id: int, data: CreditUpdate, current_user: dict = Depends(get_current_user)):
    updated = await CreditService.update_credit(credit_id, data, current_user["id"])
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")
    return updated

@router.delete("/{credit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_credit(credit_id: int, current_user: dict = Depends(get_current_user)):
    deleted = await CreditService.delete_credit(credit_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")
    return None

# Credit payment endpoints
@router.get("/{credit_id}/payments", response_model=List[CreditPayment])
async def list_payments(credit_id: int, current_user: dict = Depends(get_current_user)):
    payments = await CreditService.get_payments_by_credit(credit_id, current_user["id"])
    if payments == []:
        # Check if credit exists to differentiate between no payments vs not found
        credit = await CreditService.get_credit_by_id(credit_id, current_user["id"])
        if not credit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")
    return payments

@router.post("/payments", response_model=CreditPayment, status_code=status.HTTP_201_CREATED)
async def create_payment(data: CreditPaymentCreate, current_user: dict = Depends(get_current_user)):
    created = await CreditService.create_payment(data, current_user["id"])
    if not created:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found or not owned by user")
    return created

@router.put("/payments/{payment_id}", response_model=CreditPayment)
async def update_payment(payment_id: int, data: CreditPaymentUpdate, current_user: dict = Depends(get_current_user)):
    updated = await CreditService.update_payment(payment_id, data, current_user["id"])
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return updated

@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(payment_id: int, current_user: dict = Depends(get_current_user)):
    deleted = await CreditService.delete_payment(payment_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return None
