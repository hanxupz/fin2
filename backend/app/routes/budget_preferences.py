from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging
from ..schemas.budget_preference_schemas import (
    BudgetPreferenceCreate,
    BudgetPreferenceUpdate,
    BudgetPreferenceResponse,
    BudgetPreferencesSummary,
    BudgetPreferenceValidationError
)
from ..services.budget_preference_service import budget_preference_service
from ..core.security import get_current_user
from ..schemas.user_schemas import User


router = APIRouter()

# Set up logger
logger = logging.getLogger(__name__)


@router.post(
    "/", 
    response_model=BudgetPreferenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Budget Preference",
    description="Create a new budget preference with categories. Validates category uniqueness and total percentage limits."
)
async def create_budget_preference(
    budget_preference_data: BudgetPreferenceCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new budget preference for the current user.
    
    - **name**: Name for the budget preference (e.g., "Essential Expenses")
    - **percentage**: Percentage allocation (0.01-100.00)
    - **categories**: List of categories assigned to this budget preference
    
    Validations:
    - Categories cannot overlap between budget preferences for the same user
    - Total percentage across all budget preferences cannot exceed 100%
    - At least one category must be assigned
    """
    try:
        result = await budget_preference_service.create_budget_preference(
            budget_preference_data, current_user.id, current_user.id
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create budget preference"
        )


@router.get(
    "/",
    response_model=BudgetPreferencesSummary,
    summary="Get Budget Preferences Summary",
    description="Get all budget preferences for the current user with validation summary."
)
async def get_budget_preferences_summary(
    current_user: User = Depends(get_current_user)
):
    """
    Get all budget preferences for the current user with summary information.
    
    Returns:
    - All budget preferences with their categories
    - Total percentage allocated
    - Whether the allocation is complete (100%)
    - Missing percentage to reach 100%
    - Any overlapping categories (validation errors)
    """
    try:
        logger.info(f"Getting budget preferences for user_id: {current_user.id}")
        logger.debug(f"Current user details: {current_user}")
        
        result = await budget_preference_service.get_user_budget_preferences(current_user.id)
        
        logger.info(f"Successfully retrieved budget preferences for user_id: {current_user.id}")
        logger.debug(f"Result summary - Total preferences: {len(result.budget_preferences)}, Total percentage: {result.total_percentage}")
        
        return result
    except Exception as e:
        logger.error(f"Error getting budget preferences for user_id: {current_user.id}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {str(e)}")
        logger.exception("Full traceback:")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve budget preferences"
        )


@router.get(
    "/{budget_preference_id}",
    response_model=BudgetPreferenceResponse,
    summary="Get Budget Preference",
    description="Get a specific budget preference by ID."
)
async def get_budget_preference(
    budget_preference_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific budget preference by ID.
    
    - **budget_preference_id**: ID of the budget preference to retrieve
    """
    result = await budget_preference_service.get_budget_preference(
        budget_preference_id, current_user.id
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget preference not found"
        )
    
    return result


@router.put(
    "/{budget_preference_id}",
    response_model=BudgetPreferenceResponse,
    summary="Update Budget Preference",
    description="Update a budget preference. Validates category uniqueness and total percentage limits."
)
async def update_budget_preference(
    budget_preference_id: int,
    budget_preference_data: BudgetPreferenceUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing budget preference.
    
    - **budget_preference_id**: ID of the budget preference to update
    - **name**: Optional new name for the budget preference
    - **percentage**: Optional new percentage allocation (0.01-100.00)
    - **categories**: Optional new list of categories
    
    Validations:
    - Categories cannot overlap between budget preferences for the same user
    - Total percentage across all budget preferences cannot exceed 100%
    - At least one category must be assigned (if categories are updated)
    """
    try:
        result = await budget_preference_service.update_budget_preference(
            budget_preference_id, budget_preference_data, current_user.id, current_user.id
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget preference not found"
            )
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update budget preference"
        )


@router.delete(
    "/{budget_preference_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Budget Preference",
    description="Delete a budget preference and all its associated categories."
)
async def delete_budget_preference(
    budget_preference_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a budget preference and all its associated categories.
    
    - **budget_preference_id**: ID of the budget preference to delete
    """
    try:
        logger.info(f"Attempting to delete budget preference {budget_preference_id} for user {current_user.id}")
        
        result = await budget_preference_service.delete_budget_preference(
            budget_preference_id, current_user.id
        )
        
        if not result:
            logger.warning(f"Budget preference {budget_preference_id} not found for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget preference not found"
            )
        
        logger.info(f"Successfully deleted budget preference {budget_preference_id} for user {current_user.id}")
        return None
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error deleting budget preference {budget_preference_id} for user {current_user.id}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete budget preference"
        )


@router.post(
    "/validate",
    response_model=BudgetPreferencesSummary,
    summary="Validate Budget Preferences",
    description="Validate current budget preferences without making changes."
)
async def validate_budget_preferences(
    current_user: User = Depends(get_current_user)
):
    """
    Validate the current budget preferences setup.
    
    This endpoint provides the same information as the GET /budget-preferences endpoint
    but is semantically clearer when used for validation purposes.
    
    Returns validation information including:
    - Total percentage allocated
    - Whether allocation is complete (100%)
    - Missing percentage
    - Any overlapping categories
    """
    try:
        return await budget_preference_service.get_user_budget_preferences(current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate budget preferences"
        )