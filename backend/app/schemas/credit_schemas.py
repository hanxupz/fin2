from pydantic import BaseModel
from typing import Optional, List
from datetime import date as dtdate

# Credit Schemas
class CreditBase(BaseModel):
    name: str
    monthly_value: float
    payment_day: int  # Day of month (1-31)
    total_amount: Optional[float] = None

class CreditCreate(CreditBase):
    pass

class CreditUpdate(BaseModel):
    name: Optional[str] = None
    monthly_value: Optional[float] = None
    payment_day: Optional[int] = None
    total_amount: Optional[float] = None

class Credit(CreditBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# Credit Payment Schemas
class CreditPaymentBase(BaseModel):
    value: float
    date: dtdate
    type: str  # scheduled, off_schedule

class CreditPaymentCreate(CreditPaymentBase):
    credit_id: int

class CreditPaymentUpdate(BaseModel):
    value: Optional[float] = None
    date: Optional[dtdate] = None
    type: Optional[str] = None

class CreditPayment(CreditPaymentBase):
    id: int
    credit_id: int

    class Config:
        orm_mode = True

class CreditWithPayments(Credit):
    payments: List[CreditPayment] = []
