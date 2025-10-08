from datetime import datetime
from typing import List, Optional
from ..core.database import database
from ..models.database_models import transactions_table
from ..schemas.transaction_schemas import TransactionCreate, TransactionUpdate

class TransactionService:
    @staticmethod
    async def get_user_transactions(user_id: int, limit: int = 100, offset: int = 0) -> List[dict]:
        """Get paginated transactions for a user."""
        query = transactions_table.select().where(
            transactions_table.c.user_id == user_id
        ).order_by(
            transactions_table.c.control_date.desc(),
            transactions_table.c.date.desc()
        ).limit(limit).offset(offset)
        return await database.fetch_all(query)
    
    @staticmethod
    async def get_user_transactions_count(user_id: int) -> int:
        """Get total count of transactions for a user."""
        from sqlalchemy import func
        query = transactions_table.select().with_only_columns([func.count()]).where(
            transactions_table.c.user_id == user_id
        )
        result = await database.fetch_one(query)
        return result[0] if result else 0
    
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
        """Create multiple transactions at once using optimized bulk insert."""
        if not transactions:
            return {"inserted_count": 0}
        
        current_time = datetime.utcnow()
        
        # Use bulk insert for better performance
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
        
        # Use execute_many for true bulk operation
        query = transactions_table.insert()
        await database.execute_many(query=query, values=values)
        
        return {"inserted_count": len(values)}
    
    @staticmethod
    async def update_transaction(transaction_id: int, transaction: TransactionUpdate, user_id: int) -> Optional[dict]:
        """Update an existing transaction."""
        # Prepare update data
        update_data = transaction.dict(exclude_unset=True)
        if not update_data:
            return await TransactionService.get_transaction_by_id(transaction_id, user_id)
        
        # Add audit fields
        current_time = datetime.utcnow()
        update_data["update_by"] = user_id
        update_data["update_date"] = current_time
        
        # Update transaction with existence check in one query
        update_query = transactions_table.update().where(
            transactions_table.c.id == transaction_id,
            transactions_table.c.user_id == user_id
        ).values(**update_data)
        
        result = await database.execute(update_query)
        if result == 0:  # No rows affected means transaction doesn't exist or doesn't belong to user
            return None
        
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
