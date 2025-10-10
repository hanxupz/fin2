from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime


class BudgetPreferenceCategoryBase(BaseModel):
    category: str = Field(..., description="Category name")


class BudgetPreferenceCategoryCreate(BudgetPreferenceCategoryBase):
    pass


class BudgetPreferenceCategoryUpdate(BudgetPreferenceCategoryBase):
    pass


class BudgetPreferenceCategory(BudgetPreferenceCategoryBase):
    id: int
    budget_preference_id: int
    create_by: int
    create_date: datetime

    class Config:
        orm_mode = True


class BudgetPreferenceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Budget preference name")
    percentage: float = Field(..., ge=0.01, le=100, description="Percentage allocation (0.01-100)")
    categories: List[str] = Field(..., min_items=1, description="List of categories for this budget preference")

    @validator('percentage')
    def validate_percentage(cls, v):
        # Round to 2 decimal places to avoid floating point precision issues
        return round(v, 2)

    @validator('categories')
    def validate_categories(cls, v):
        if not v:
            raise ValueError('At least one category is required')
        # Remove duplicates while preserving order
        seen = set()
        unique_categories = []
        for category in v:
            if category not in seen:
                seen.add(category)
                unique_categories.append(category)
        return unique_categories


class BudgetPreferenceCreate(BudgetPreferenceBase):
    pass


class BudgetPreferenceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Budget preference name")
    percentage: Optional[float] = Field(None, ge=0.01, le=100, description="Percentage allocation (0.01-100)")
    categories: Optional[List[str]] = Field(None, min_items=1, description="List of categories for this budget preference")

    @validator('percentage')
    def validate_percentage(cls, v):
        if v is not None:
            return round(v, 2)
        return v

    @validator('categories')
    def validate_categories(cls, v):
        if v is not None:
            if not v:
                raise ValueError('At least one category is required')
            # Remove duplicates while preserving order
            seen = set()
            unique_categories = []
            for category in v:
                if category not in seen:
                    seen.add(category)
                    unique_categories.append(category)
            return unique_categories
        return v


class BudgetPreference(BudgetPreferenceBase):
    id: int
    user_id: int
    create_by: int
    create_date: datetime
    update_by: int
    update_date: datetime
    budget_preference_categories: List[BudgetPreferenceCategory] = []

    class Config:
        orm_mode = True


class BudgetPreferenceResponse(BaseModel):
    id: int
    name: str
    percentage: float
    categories: List[str]
    user_id: int
    create_date: datetime
    update_date: datetime

    class Config:
        orm_mode = True


class BudgetPreferencesSummary(BaseModel):
    budget_preferences: List[BudgetPreferenceResponse]
    total_percentage: float
    is_complete: bool = Field(description="True if total percentage equals 100%")
    missing_percentage: float = Field(description="Percentage needed to reach 100%")
    overlapping_categories: List[str] = Field(description="Categories assigned to multiple budget preferences")

    @validator('total_percentage')
    def validate_total_percentage(cls, v):
        return round(v, 2)

    @validator('missing_percentage')
    def validate_missing_percentage(cls, v):
        return round(v, 2)


class BudgetPreferenceValidationError(BaseModel):
    error_type: str
    message: str
    details: Optional[dict] = None