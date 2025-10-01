from datetime import datetime
from typing import Optional
from ..core.database_clean import database
from ..core.security import get_password_hash, verify_password
from ..models.database_models import users_table
from ..schemas.user_schemas import UserCreate

class UserService:
    @staticmethod
    async def get_user_by_username(username: str) -> Optional[dict]:
        """Get a user by username."""
        query = users_table.select().where(users_table.c.username == username)
        return await database.fetch_one(query)
    
    @staticmethod
    async def get_user_by_id(user_id: int) -> Optional[dict]:
        """Get a user by ID."""
        query = users_table.select().where(users_table.c.id == user_id)
        return await database.fetch_one(query)
    
    @staticmethod
    async def create_user(user: UserCreate) -> dict:
        """Create a new user."""
        hashed_password = get_password_hash(user.password)
        current_time = datetime.utcnow()
        
        query = users_table.insert().values(
            username=user.username,
            hashed_password=hashed_password,
            create_by=-1,  # System user for new registrations
            create_date=current_time,
            update_by=-1,
            update_date=current_time
        )
        
        user_id = await database.execute(query)
        return {"id": user_id, "username": user.username}
    
    @staticmethod
    async def authenticate_user(username: str, password: str) -> Optional[dict]:
        """Authenticate a user with username and password."""
        user = await UserService.get_user_by_username(username)
        if not user:
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return user
