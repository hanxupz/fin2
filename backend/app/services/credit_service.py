from datetime import datetime
from typing import List, Optional
from ..core.database import database
from ..models.database_models import credits_table, credit_payments_table
from ..schemas.credit_schemas import (
    CreditCreate, CreditUpdate, CreditPaymentCreate, CreditPaymentUpdate
)

class CreditService:
    # Credits
    @staticmethod
    async def get_credits_by_user(user_id: int) -> List[dict]:
        query = credits_table.select().where(credits_table.c.user_id == user_id).order_by(credits_table.c.name.asc())
        return await database.fetch_all(query)

    @staticmethod
    async def get_credit_by_id(credit_id: int, user_id: int) -> Optional[dict]:
        query = credits_table.select().where(
            credits_table.c.id == credit_id,
            credits_table.c.user_id == user_id
        )
        return await database.fetch_one(query)

    @staticmethod
    async def create_credit(data: CreditCreate, user_id: int) -> dict:
        now = datetime.utcnow()
        insert = credits_table.insert().values(
            name=data.name,
            monthly_value=data.monthly_value,
            payment_day=data.payment_day,
            total_amount=data.total_amount,
            user_id=user_id,
            create_by=user_id,
            create_date=now,
            update_by=user_id,
            update_date=now
        )
        new_id = await database.execute(insert)
        return {**data.dict(), "id": new_id, "user_id": user_id}

    @staticmethod
    async def update_credit(credit_id: int, data: CreditUpdate, user_id: int) -> Optional[dict]:
        # Optimize by checking existence within the update query
        update_data = data.dict(exclude_unset=True)
        if not update_data:
            return await CreditService.get_credit_by_id(credit_id, user_id)
        
        update_data["update_by"] = user_id
        update_data["update_date"] = datetime.utcnow()
        
        upd = credits_table.update().where(
            credits_table.c.id == credit_id,
            credits_table.c.user_id == user_id
        ).values(**update_data)
        
        result = await database.execute(upd)
        if result == 0:  # No rows affected
            return None
            
        return await CreditService.get_credit_by_id(credit_id, user_id)

    @staticmethod
    async def delete_credit(credit_id: int, user_id: int) -> bool:
        existing = await CreditService.get_credit_by_id(credit_id, user_id)
        if not existing:
            return False
        # Delete payments first (cascade manually)
        del_payments = credit_payments_table.delete().where(credit_payments_table.c.credit_id == credit_id)
        await database.execute(del_payments)
        # Delete credit
        delete_credit = credits_table.delete().where(
            credits_table.c.id == credit_id,
            credits_table.c.user_id == user_id
        )
        await database.execute(delete_credit)
        return True

    # Credit Payments
    @staticmethod
    async def get_all_credits_with_payments(user_id: int) -> List[dict]:
        # First get all credits for the user
        credits = await CreditService.get_credits_by_user(user_id)
        
        if not credits:
            return []
            
        # Get all credit IDs
        credit_ids = [credit['id'] for credit in credits]
        
        # Fetch all payments for these credits in a single query
        payments_query = credit_payments_table.select().where(
            credit_payments_table.c.credit_id.in_(credit_ids)
        ).order_by(credit_payments_table.c.date.desc())
        
        all_payments = await database.fetch_all(payments_query)
        
        # Group payments by credit_id
        payments_by_credit = {}
        for payment in all_payments:
            credit_id = payment['credit_id']
            if credit_id not in payments_by_credit:
                payments_by_credit[credit_id] = []
            payments_by_credit[credit_id].append(dict(payment))
        
        # Combine credits with their payments
        result = []
        for credit in credits:
            credit_dict = dict(credit)
            credit_dict['payments'] = payments_by_credit.get(credit['id'], [])
            result.append(credit_dict)
            
        return result

    @staticmethod
    async def get_payments_by_credit(credit_id: int, user_id: int) -> List[dict]:
        # Ensure credit belongs to user
        credit = await CreditService.get_credit_by_id(credit_id, user_id)
        if not credit:
            return []
        query = credit_payments_table.select().where(
            credit_payments_table.c.credit_id == credit_id
        ).order_by(credit_payments_table.c.date.desc())
        return await database.fetch_all(query)

    @staticmethod
    async def get_payment_by_id(payment_id: int) -> Optional[dict]:
        query = credit_payments_table.select().where(credit_payments_table.c.id == payment_id)
        return await database.fetch_one(query)

    @staticmethod
    async def create_payment(data: CreditPaymentCreate, user_id: int) -> Optional[dict]:
        # Validate credit ownership
        credit = await CreditService.get_credit_by_id(data.credit_id, user_id)
        if not credit:
            return None
        now = datetime.utcnow()
        insert = credit_payments_table.insert().values(
            credit_id=data.credit_id,
            value=data.value,
            date=data.date,
            type=data.type,
            create_by=user_id,
            create_date=now,
            update_by=user_id,
            update_date=now
        )
        new_id = await database.execute(insert)
        return {**data.dict(), "id": new_id}

    @staticmethod
    async def update_payment(payment_id: int, data: CreditPaymentUpdate, user_id: int) -> Optional[dict]:
        existing = await CreditService.get_payment_by_id(payment_id)
        if not existing:
            return None
        # Validate credit ownership
        credit = await CreditService.get_credit_by_id(existing["credit_id"], user_id)
        if not credit:
            return None
        update_data = data.dict(exclude_unset=True)
        if not update_data:
            return existing
        update_data["update_by"] = user_id
        update_data["update_date"] = datetime.utcnow()
        upd = credit_payments_table.update().where(credit_payments_table.c.id == payment_id).values(**update_data)
        await database.execute(upd)
        return await CreditService.get_payment_by_id(payment_id)

    @staticmethod
    async def delete_payment(payment_id: int, user_id: int) -> bool:
        existing = await CreditService.get_payment_by_id(payment_id)
        if not existing:
            return False
        credit = await CreditService.get_credit_by_id(existing["credit_id"], user_id)
        if not credit:
            return False
        delete_q = credit_payments_table.delete().where(credit_payments_table.c.id == payment_id)
        await database.execute(delete_q)
        return True
