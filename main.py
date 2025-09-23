from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import databases
import sqlalchemy

DATABASE_URL = "postgresql://user:password@db:5432/transactions"
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

transactions = sqlalchemy.Table(
    "transactions",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("amount", sqlalchemy.Float),
)

engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)

app = FastAPI()

class Transaction(BaseModel):
    id: int = None
    description: str
    amount: float

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/transactions/")
async def create_transaction(transaction: Transaction):
    query = transactions.insert().values(description=transaction.description, amount=transaction.amount)
    last_record_id = await database.execute(query)
    return {**transaction.dict(), "id": last_record_id}

@app.get("/transactions/", response_model=List[Transaction])
async def read_transactions():
    query = transactions.select()
    return await database.fetch_all(query)
