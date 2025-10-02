from datetime import datetime
from typing import Optional
from ..core.database import database
from ..models.database_models import control_dates_table
from ..schemas.control_date_schemas import ControlDateSetting

class ControlDateService:
    @staticmethod
    async def get_user_control_date(user_id: int) -> Optional[dict]:
        """Get control date configuration for a user."""
        query = control_dates_table.select().where(control_dates_table.c.user_id == user_id)
        return await database.fetch_one(query)
    
    @staticmethod
    async def set_user_control_date(user_id: int, config: ControlDateSetting) -> dict:
        """Set or update control date configuration for a user."""
        current_time = datetime.utcnow()
        existing = await ControlDateService.get_user_control_date(user_id)
        
        if existing:
            # Update existing record
            update_query = control_dates_table.update().where(
                control_dates_table.c.user_id == user_id
            ).values(
                year=config.year,
                month=config.month,
                control_date=config.control_date,
                update_by=user_id,
                update_date=current_time
            )
            await database.execute(update_query)
        else:
            # Create new record
            insert_query = control_dates_table.insert().values(
                user_id=user_id,
                year=config.year,
                month=config.month,
                control_date=config.control_date,
                create_by=user_id,
                create_date=current_time,
                update_by=user_id,
                update_date=current_time
            )
            await database.execute(insert_query)
        
        return {
            "year": config.year,
            "month": config.month,
            "control_date": config.control_date
        }
