from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import date as dtdate
import databases
import sqlalchemy
import logging

# -------------------------------
# Database setup
# -------------------------------
DATABASE_URL = "postgresql://user:password@db:5432/transactions"
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

transactions = sqlalchemy.Table(
    "transactions",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("amount", sqlalchemy.Float),
    sqlalchemy.Column("date", sqlalchemy.Date),
    sqlalchemy.Column("control_date", sqlalchemy.Date),
    sqlalchemy.Column("category", sqlalchemy.String),   # plain string
    sqlalchemy.Column("account", sqlalchemy.String),    # plain string
)

engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)

# -------------------------------
# FastAPI setup
# -------------------------------
app = FastAPI()

# CORS settings
origins = [
    "http://localhost:3000",
    "http://192.168.1.97:3000",  # Replace with your host IP
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Logging setup
# -------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------
# Pydantic Model
# -------------------------------
class Transaction(BaseModel):
    id: Optional[int] = None
    description: str
    amount: float
    date: Optional[dtdate] = None
    control_date: Optional[dtdate] = None
    category: Optional[str] = None  # loose validation (string, not enum)
    account: Optional[str] = None   # loose validation (string, not enum)

class ControlDateSetting(BaseModel):
    year: int
    month: int
    control_date: Optional[dtdate] = None

    @validator("control_date", always=True)
    def set_default_control_date(cls, v, values):
        # Default to the first day of the month/year
        if v is None:
            year = values.get("year")
            month = values.get("month")
            if year is None or month is None:
                raise ValueError("Year and month must be provided")
            return dtdate(year, month, 1)
        return v

control_date_config: Optional[ControlDateSetting] = None

# -------------------------------
# Lifecycle
# -------------------------------
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# -------------------------------
# Routes
# -------------------------------

@app.post("/config/control_date/")
async def set_control_date(config: ControlDateSetting):
    global control_date_config
    control_date_config = config
    return {"control_date": control_date_config.control_date}

@app.get("/config/control_date/")
async def get_control_date():
    if control_date_config is None:
        raise HTTPException(status_code=404, detail="Control date not configured")
    return {"control_date": control_date_config.control_date}

@app.post("/transactions/")
async def create_transaction(transaction: Transaction, request: Request):
    logger.info(f"Received payload: {transaction.dict()}")  # Debug log

    query = transactions.insert().values(
        description=transaction.description,
        amount=transaction.amount,
        date=transaction.date,
        control_date=transaction.control_date,
        category=transaction.category,
        account=transaction.account,
    )
    last_record_id = await database.execute(query)
    return {**transaction.dict(), "id": last_record_id}

@app.get("/transactions/", response_model=List[Transaction])
async def read_transactions():
    query = transactions.select().order_by(transactions.c.control_date.desc(), transactions.c.date.desc())
    results = await database.fetch_all(query)
    logger.info(f"Fetched {len(results)} transactions from DB")  # Debug log
    # Format amount to 2 decimals
    formatted = []
    for r in results:
        r_dict = dict(r)
        if r_dict.get("amount") is not None:
            r_dict["amount"] = round(float(r_dict["amount"]), 2)
        formatted.append(r_dict)
    return formatted

@app.post("/transactions/bulk/")
async def create_transactions_bulk(transactions_list: List[Transaction]):
    if not transactions_list:
        raise HTTPException(status_code=400, detail="No transactions provided")
    
    query = transactions.insert()
    values = [
        {
            "description": t.description,
            "amount": t.amount,
            "date": t.date,
            "control_date": t.control_date,
            "category": t.category,
            "account": t.account,
        }
        for t in transactions_list
    ]
    
    # Execute all inserts at once
    last_record_id = await database.execute_many(query=query, values=values)
    
    return {"inserted_count": len(values)}

@app.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int):
    # Check if the transaction exists
    query = transactions.select().where(transactions.c.id == transaction_id)
    transaction = await database.fetch_one(query)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Delete the transaction
    delete_query = transactions.delete().where(transactions.c.id == transaction_id)
    await database.execute(delete_query)
    return {"message": f"Transaction with id {transaction_id} deleted successfully"}

@app.put("/transactions/{transaction_id}")
async def update_transaction(transaction_id: int, transaction: Transaction):
    # Check if the transaction exists
    query = transactions.select().where(transactions.c.id == transaction_id)
    existing_transaction = await database.fetch_one(query)
    if not existing_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Prepare update data (only update fields provided)
    update_data = transaction.dict(exclude_unset=True)
    if "id" in update_data:
        update_data.pop("id")  # Ensure ID is not updated

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Update the transaction
    update_query = transactions.update().where(transactions.c.id == transaction_id).values(**update_data)
    await database.execute(update_query)

    # Return the updated transaction
    updated_transaction = await database.fetch_one(transactions.select().where(transactions.c.id == transaction_id))
    return updated_transaction
