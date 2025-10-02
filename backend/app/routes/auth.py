from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
import logging

from ..schemas.user_schemas import UserCreate, User, Token
from ..services.user_service import UserService
from ..core.security import create_access_token

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user."""
    logger.info(f"Register request received: username={user.username}")
    
    try:
        # Check if user already exists
        existing = await UserService.get_user_by_username(user.username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Create user
        new_user = await UserService.create_user(user)
        logger.info(f"User registered successfully: id={new_user['id']}, username={new_user['username']}")
        
        return new_user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration for {user.username}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return access token."""
    user = await UserService.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}
