from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from sqlalchemy import select, delete, and_, func
from ..core.database import database
from ..models.database_models import (
    budget_preferences_table, 
    budget_preference_categories_table
)
from ..schemas.budget_preference_schemas import (
    BudgetPreferenceCreate,
    BudgetPreferenceUpdate,
    BudgetPreferenceResponse,
    BudgetPreferencesSummary,
    BudgetPreferenceValidationError
)

# Set up logger
logger = logging.getLogger(__name__)


class BudgetPreferenceService:
    
    @staticmethod
    async def create_budget_preference(
        budget_preference_data: BudgetPreferenceCreate, 
        user_id: int, 
        current_user_id: int
    ) -> BudgetPreferenceResponse:
        """Create a new budget preference with categories."""
        
        # Validate that categories don't overlap with existing budget preferences
        await BudgetPreferenceService._validate_no_category_overlap(
            user_id, budget_preference_data.categories
        )
        
        # Validate that total percentage doesn't exceed 100%
        await BudgetPreferenceService._validate_total_percentage(
            user_id, budget_preference_data.percentage
        )
        
        # Create budget preference
        now = datetime.utcnow()
        budget_preference_data_dict = {
            "name": budget_preference_data.name,
            "percentage": budget_preference_data.percentage,
            "user_id": user_id,
            "create_by": current_user_id,
            "create_date": now,
            "update_by": current_user_id,
            "update_date": now,
        }
        
        # Insert budget preference and get ID
        query = budget_preferences_table.insert().values(**budget_preference_data_dict)
        budget_preference_id = await database.execute(query)
        
        # Insert categories
        category_data = [
            {
                "budget_preference_id": budget_preference_id,
                "category": category,
                "create_by": current_user_id,
                "create_date": now,
            }
            for category in budget_preference_data.categories
        ]
        
        if category_data:
            query = budget_preference_categories_table.insert().values(category_data)
            await database.execute(query)
        
        # Fetch and return the created budget preference
        return await BudgetPreferenceService.get_budget_preference(budget_preference_id, user_id)
    
    @staticmethod
    async def get_budget_preference(budget_preference_id: int, user_id: int) -> Optional[BudgetPreferenceResponse]:
        """Get a budget preference by ID."""
        
        # Get budget preference
        query = select(budget_preferences_table).where(
            and_(
                budget_preferences_table.c.id == budget_preference_id,
                budget_preferences_table.c.user_id == user_id
            )
        )
        budget_preference = await database.fetch_one(query)
        
        if not budget_preference:
            return None
        
        # Get categories
        query = select(budget_preference_categories_table.c.category).where(
            budget_preference_categories_table.c.budget_preference_id == budget_preference_id
        )
        categories_result = await database.fetch_all(query)
        categories = [row["category"] for row in categories_result]
        
        return BudgetPreferenceResponse(
            id=budget_preference["id"],
            name=budget_preference["name"],
            percentage=budget_preference["percentage"],
            categories=categories,
            user_id=budget_preference["user_id"],
            create_date=budget_preference["create_date"],
            update_date=budget_preference["update_date"],
        )
    
    @staticmethod
    async def get_user_budget_preferences(user_id: int) -> BudgetPreferencesSummary:
        """Get all budget preferences for a user with summary information."""
        
        try:
            logger.info(f"Starting get_user_budget_preferences for user_id: {user_id}")
            
            # Get all budget preferences for user
            query = select(budget_preferences_table).where(
                budget_preferences_table.c.user_id == user_id
            ).order_by(budget_preferences_table.c.create_date)
            
            logger.debug(f"Executing query: {query}")
            budget_preferences_raw = await database.fetch_all(query)
            logger.info(f"Found {len(budget_preferences_raw)} budget preferences for user_id: {user_id}")
            
            budget_preferences = []
            all_categories = []
            total_percentage = 0.0
            
            for i, bp in enumerate(budget_preferences_raw):
                logger.debug(f"Processing budget preference {i+1}/{len(budget_preferences_raw)}: {bp['name']} (id={bp['id']})")
                
                # Get categories for this budget preference
                query = select(budget_preference_categories_table.c.category).where(
                    budget_preference_categories_table.c.budget_preference_id == bp["id"]
                )
                logger.debug(f"Fetching categories for budget_preference_id: {bp['id']}")
                categories_result = await database.fetch_all(query)
                categories = [row["category"] for row in categories_result]
                logger.debug(f"Found {len(categories)} categories for budget preference {bp['name']}: {categories}")
                
                budget_preferences.append(BudgetPreferenceResponse(
                    id=bp["id"],
                    name=bp["name"],
                    percentage=bp["percentage"],
                    categories=categories,
                    user_id=bp["user_id"],
                    create_date=bp["create_date"],
                    update_date=bp["update_date"],
                ))
                
                all_categories.extend(categories)
                total_percentage += bp["percentage"]
                logger.debug(f"Running total percentage: {total_percentage}")
            
            # Find overlapping categories
            logger.debug(f"Checking for overlapping categories in: {all_categories}")
            category_counts = {}
            for category in all_categories:
                category_counts[category] = category_counts.get(category, 0) + 1
            
            overlapping_categories = [cat for cat, count in category_counts.items() if count > 1]
            logger.debug(f"Overlapping categories found: {overlapping_categories}")
            
            total_percentage = round(total_percentage, 2)
            missing_percentage = round(100.0 - total_percentage, 2)
            is_complete = abs(total_percentage - 100.0) < 0.01  # Allow for small floating point errors
            
            logger.info(f"Summary for user_id {user_id}: {len(budget_preferences)} preferences, {total_percentage}% allocated, complete: {is_complete}")
            
            result = BudgetPreferencesSummary(
                budget_preferences=budget_preferences,
                total_percentage=total_percentage,
                is_complete=is_complete,
                missing_percentage=missing_percentage,
                overlapping_categories=overlapping_categories,
            )
            
            logger.info(f"Successfully created BudgetPreferencesSummary for user_id: {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error in get_user_budget_preferences for user_id: {user_id}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error details: {str(e)}")
            logger.exception("Full traceback:")
            raise
    
    @staticmethod
    async def update_budget_preference(
        budget_preference_id: int,
        budget_preference_data: BudgetPreferenceUpdate,
        user_id: int,
        current_user_id: int
    ) -> Optional[BudgetPreferenceResponse]:
        """Update a budget preference."""
        
        # Check if budget preference exists and belongs to user
        existing = await BudgetPreferenceService.get_budget_preference(budget_preference_id, user_id)
        if not existing:
            return None
        
        update_data = {}
        
        # Validate categories if provided
        if budget_preference_data.categories is not None:
            await BudgetPreferenceService._validate_no_category_overlap(
                user_id, budget_preference_data.categories, exclude_budget_preference_id=budget_preference_id
            )
            
            # Delete existing categories
            query = delete(budget_preference_categories_table).where(
                budget_preference_categories_table.c.budget_preference_id == budget_preference_id
            )
            await database.execute(query)
            
            # Insert new categories
            now = datetime.utcnow()
            category_data = [
                {
                    "budget_preference_id": budget_preference_id,
                    "category": category,
                    "create_by": current_user_id,
                    "create_date": now,
                }
                for category in budget_preference_data.categories
            ]
            
            if category_data:
                query = budget_preference_categories_table.insert().values(category_data)
                await database.execute(query)
        
        # Validate percentage if provided
        if budget_preference_data.percentage is not None:
            await BudgetPreferenceService._validate_total_percentage(
                user_id, budget_preference_data.percentage, exclude_budget_preference_id=budget_preference_id
            )
            update_data["percentage"] = budget_preference_data.percentage
        
        # Update name if provided
        if budget_preference_data.name is not None:
            update_data["name"] = budget_preference_data.name
        
        # Update budget preference if there are changes
        if update_data:
            update_data.update({
                "update_by": current_user_id,
                "update_date": datetime.utcnow(),
            })
            
            query = budget_preferences_table.update().where(
                and_(
                    budget_preferences_table.c.id == budget_preference_id,
                    budget_preferences_table.c.user_id == user_id
                )
            ).values(**update_data)
            
            await database.execute(query)
        
        # Return updated budget preference
        return await BudgetPreferenceService.get_budget_preference(budget_preference_id, user_id)
    
    @staticmethod
    async def delete_budget_preference(budget_preference_id: int, user_id: int) -> bool:
        """Delete a budget preference and its categories."""
        
        # Check if budget preference exists and belongs to user
        existing = await BudgetPreferenceService.get_budget_preference(budget_preference_id, user_id)
        if not existing:
            return False
        
        # Delete categories first (due to foreign key constraint)
        query = delete(budget_preference_categories_table).where(
            budget_preference_categories_table.c.budget_preference_id == budget_preference_id
        )
        await database.execute(query)
        
        # Delete budget preference
        query = delete(budget_preferences_table).where(
            and_(
                budget_preferences_table.c.id == budget_preference_id,
                budget_preferences_table.c.user_id == user_id
            )
        )
        result = await database.execute(query)
        
        return result > 0
    
    @staticmethod
    async def _validate_no_category_overlap(
        user_id: int, 
        categories: List[str], 
        exclude_budget_preference_id: Optional[int] = None
    ):
        """Validate that categories don't overlap with existing budget preferences."""
        
        # Get existing categories for user
        query = select(
            budget_preference_categories_table.c.category,
            budget_preference_categories_table.c.budget_preference_id
        ).select_from(
            budget_preference_categories_table.join(
                budget_preferences_table,
                budget_preference_categories_table.c.budget_preference_id == budget_preferences_table.c.id
            )
        ).where(
            budget_preferences_table.c.user_id == user_id
        )
        
        if exclude_budget_preference_id:
            query = query.where(
                budget_preference_categories_table.c.budget_preference_id != exclude_budget_preference_id
            )
        
        existing_categories = await database.fetch_all(query)
        existing_category_names = {row["category"] for row in existing_categories}
        
        # Check for overlaps
        overlapping = set(categories) & existing_category_names
        if overlapping:
            raise ValueError(f"Categories already assigned to other budget preferences: {', '.join(overlapping)}")
    
    @staticmethod
    async def _validate_total_percentage(
        user_id: int, 
        percentage: float, 
        exclude_budget_preference_id: Optional[int] = None
    ):
        """Validate that total percentage doesn't exceed 100%."""
        
        # Get sum of existing percentages
        query = select(func.sum(budget_preferences_table.c.percentage)).where(
            budget_preferences_table.c.user_id == user_id
        )
        
        if exclude_budget_preference_id:
            query = query.where(
                budget_preferences_table.c.id != exclude_budget_preference_id
            )
        
        result = await database.fetch_one(query)
        existing_total = result[0] or 0.0
        
        new_total = existing_total + percentage
        
        if new_total > 100.01:  # Allow for small floating point errors
            raise ValueError(f"Total percentage would exceed 100%: {existing_total:.2f}% + {percentage:.2f}% = {new_total:.2f}%")


budget_preference_service = BudgetPreferenceService()