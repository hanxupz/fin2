from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
import logging

from ..schemas.transaction_schemas import Transaction, TransactionCreate, TransactionUpdate
from ..services.transaction_service import TransactionService
from ..core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Transaction])
async def get_transactions(
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get paginated transactions for the current user."""
    transactions = await TransactionService.get_user_transactions(
        current_user["id"], limit=limit, offset=offset
    )
    logger.info(f"Fetched {len(transactions)} transactions from DB for user {current_user['username']} (limit={limit}, offset={offset})")
    return transactions

@router.get("/count", response_model=dict)
async def get_transactions_count(current_user: dict = Depends(get_current_user)):
    """Get total count of transactions for the current user."""
    count = await TransactionService.get_user_transactions_count(current_user["id"])
    return {"total": count}

@router.post("/", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new transaction."""
    logger.info(f"Creating transaction for user {current_user['username']}: {transaction.dict()}")
    
    new_transaction = await TransactionService.create_transaction(transaction, current_user["id"])
    return new_transaction

@router.post("/bulk/", status_code=status.HTTP_201_CREATED)
async def create_transactions_bulk(
    transactions: List[TransactionCreate],
    current_user: dict = Depends(get_current_user)
):
    """Create multiple transactions at once."""
    if not transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transactions provided"
        )
    
    logger.info(f"Creating {len(transactions)} transactions in bulk for user {current_user['username']}")
    result = await TransactionService.create_transactions_bulk(transactions, current_user["id"])
    return result

@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an existing transaction."""
    updated_transaction = await TransactionService.update_transaction(
        transaction_id, transaction, current_user["id"]
    )
    
    if not updated_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return updated_transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a transaction."""
    deleted = await TransactionService.delete_transaction(transaction_id, current_user["id"])
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return None
