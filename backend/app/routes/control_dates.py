from fastapi import APIRouter, HTTPException, Depends, status

from ..schemas.control_date_schemas import ControlDateSetting, ControlDateResponse
from ..services.control_date_service import ControlDateService
from ..core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=ControlDateResponse)
async def get_control_date(current_user: dict = Depends(get_current_user)):
    """Get control date configuration for the current user."""
    result = await ControlDateService.get_user_control_date(current_user["id"])
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control date not configured for user"
        )
    
    return {
        "year": result["year"],
        "month": result["month"],
        "control_date": result["control_date"]
    }

@router.post("/", response_model=ControlDateResponse)
async def set_control_date(
    config: ControlDateSetting,
    current_user: dict = Depends(get_current_user)
):
    """Set or update control date configuration for the current user."""
    result = await ControlDateService.set_user_control_date(current_user["id"], config)
    return result
