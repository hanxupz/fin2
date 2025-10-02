from pydantic import BaseModel, validator
from typing import Optional
from datetime import date as dtdate

class ControlDateSetting(BaseModel):
    year: int
    month: int
    control_date: Optional[dtdate] = None

    @validator("control_date", always=True)
    def set_default_control_date(cls, v, values):
        """Default to the first day of the month/year if not provided."""
        if v is None:
            year = values.get("year")
            month = values.get("month")
            if year is None or month is None:
                raise ValueError("Year and month must be provided")
            return dtdate(year, month, 1)
        return v

class ControlDateResponse(BaseModel):
    year: int
    month: int
    control_date: dtdate
    
    class Config:
        orm_mode = True
