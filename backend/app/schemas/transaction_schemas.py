from pydantic import BaseModel
from typing import Optional
from datetime import date as dtdate

class TransactionBase(BaseModel):
    description: str
    amount: float
    date: Optional[dtdate] = None
    control_date: Optional[dtdate] = None
    category: Optional[str] = None
    account: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[dtdate] = None
    control_date: Optional[dtdate] = None
    category: Optional[str] = None
    account: Optional[str] = None

class Transaction(TransactionBase):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True
