from datetime import datetime
from typing import List, Optional
from ..core.database_clean import database
from ..models.database_models import transactions_table
from ..schemas.transaction_schemas import TransactionCreate, TransactionUpdate

class TransactionService:
    @staticmethod
    async def get_user_transactions(user_id: int) -> List[dict]:
        """Get all transactions for a user."""
        query = transactions_table.select().where(
            transactions_table.c.user_id == user_id
        ).order_by(
            transactions_table.c.control_date.desc(),
            transactions_table.c.date.desc()
        )
        return await database.fetch_all(query)
    
    @staticmethod
    async def get_transaction_by_id(transaction_id: int, user_id: int) -> Optional[dict]:
        """Get a specific transaction by ID for a user."""
        query = transactions_table.select().where(
            transactions_table.c.id == transaction_id,
            transactions_table.c.user_id == user_id
        )
        return await database.fetch_one(query)
    
    @staticmethod
    async def create_transaction(transaction: TransactionCreate, user_id: int) -> dict:
        """Create a new transaction."""
        current_time = datetime.utcnow()
        
        query = transactions_table.insert().values(
            description=transaction.description,
            amount=transaction.amount,
            date=transaction.date,
            control_date=transaction.control_date,
            category=transaction.category,
            account=transaction.account,
            user_id=user_id,
            create_by=user_id,
            create_date=current_time,
            update_by=user_id,
            update_date=current_time
        )
        
        transaction_id = await database.execute(query)
        return {**transaction.dict(), "id": transaction_id, "user_id": user_id}
    
    @staticmethod
    async def create_transactions_bulk(transactions: List[TransactionCreate], user_id: int) -> dict:
        """Create multiple transactions at once."""
        current_time = datetime.utcnow()
        
        values = [
            {
                "description": t.description,
                "amount": t.amount,
                "date": t.date,
                "control_date": t.control_date,
                "category": t.category,
                "account": t.account,
                "user_id": user_id,
                "create_by": user_id,
                "create_date": current_time,
                "update_by": user_id,
                "update_date": current_time
            }
            for t in transactions
        ]
        
        query = transactions_table.insert()
        await database.execute_many(query=query, values=values)
        
        return {"inserted_count": len(values)}
    
    @staticmethod
    async def update_transaction(transaction_id: int, transaction: TransactionUpdate, user_id: int) -> Optional[dict]:
        """Update an existing transaction."""
        # Check if transaction exists and belongs to user
        existing = await TransactionService.get_transaction_by_id(transaction_id, user_id)
        if not existing:
            return None
        
        # Prepare update data
        update_data = transaction.dict(exclude_unset=True)
        if not update_data:
            return existing
        
        # Add audit fields
        current_time = datetime.utcnow()
        update_data["update_by"] = user_id
        update_data["update_date"] = current_time
        
        # Update transaction
        update_query = transactions_table.update().where(
            transactions_table.c.id == transaction_id,
            transactions_table.c.user_id == user_id
        ).values(**update_data)
        
        await database.execute(update_query)
        
        # Return updated transaction
        return await TransactionService.get_transaction_by_id(transaction_id, user_id)
    
    @staticmethod
    async def delete_transaction(transaction_id: int, user_id: int) -> bool:
        """Delete a transaction."""
        # Check if transaction exists and belongs to user
        existing = await TransactionService.get_transaction_by_id(transaction_id, user_id)
        if not existing:
            return False
        
        # Delete transaction
        delete_query = transactions_table.delete().where(
            transactions_table.c.id == transaction_id,
            transactions_table.c.user_id == user_id
        )
        
        await database.execute(delete_query)
        return True
