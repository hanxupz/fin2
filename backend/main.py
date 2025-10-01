from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import date as dtdate
import databases
import sqlalchemy
import logging
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os

# -------------------------------
DATABASE_URL = "postgresql://user:password@db:5432/transactions"
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# Users table
users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True, index=True),
    sqlalchemy.Column("hashed_password", sqlalchemy.String),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.Datetime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.Datetime, nullable=False),
)

control_dates = sqlalchemy.Table(
    "control_dates",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("year", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("month", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("control_date", sqlalchemy.Date, nullable=False),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.Datetime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.Datetime, nullable=False),
)

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
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.Datetime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.Datetime, nullable=False),
)

engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config
SECRET_KEY = os.environ.get("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# -------------------------------
# FastAPI setup
# -------------------------------
app = FastAPI()

# CORS settings
origins = [
    "https://finance.theonet.uk",
    "https://finance-backend.theonet.uk",
    "http://192.168.1.97:3000",
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
try:
    import bcrypt
    logger.info(f"bcrypt version: {getattr(bcrypt, '__version__', 'unknown')}")
except Exception as e:
    logger.warning(f"Could not determine bcrypt version: {e}")
logger.info(f"CORS middleware configured. Allowed origins: {origins}")

# -------------------------------
# Pydantic Model
# -------------------------------
class UserCreate(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str

class Token(BaseModel):
    access_token: str
    token_type: str
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

control_date_config: Optional[ControlDateSetting] = None  # legacy, not used

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Ensure password is a string and truncate if too long
    if not isinstance(password, str):
        password = str(password)
    password = password[:72]
    return pwd_context.hash(password)

async def get_user(username: str):
    query = users.select().where(users.c.username == username)
    user = await database.fetch_one(query)
    return user

async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict):
    from datetime import datetime, timedelta
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user(username)
    if user is None:
        raise credentials_exception
    return user

# -------------------------------
# Lifecycle
# -------------------------------
@app.on_event("startup")
async def startup():
    logger.info("Connecting to database...")
    try:
        await database.connect()
        logger.info("Database connection established.")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# -------------------------------
# Routes
# -------------------------------

# Registration endpoint
@app.post("/register", response_model=User)
async def register(user: UserCreate):
    logger.info(f"Register request received: username={user.username}")
    try:
        existing = await get_user(user.username)
        if existing:
            logger.warning(f"Username already registered: {user.username}")
            raise HTTPException(status_code=400, detail="Username already registered")
        logger.warning(f"Password for {user.username}: {user.password}, {type(user.password)}, length: {len(user.password)}")
        safe_password = user.password
        hashed_password = get_password_hash(safe_password)
        logger.debug(f"Hashed password for {user.username}: {hashed_password}")
        
        current_time = datetime.utcnow()
        query = users.insert().values(
            username=user.username, 
            hashed_password=hashed_password,
            create_by=-1,  # System user for new registrations
            create_date=current_time,
            update_by=-1,
            update_date=current_time
        )
        user_id = await database.execute(query)
        logger.info(f"User registered successfully: id={user_id}, username={user.username}")
        return {"id": user_id, "username": user.username}
    except Exception as e:
        logger.error(f"Error during registration for {user.username}: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {e}")


# Login endpoint (token)
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/config/control_date/")
async def set_control_date(config: ControlDateSetting, current_user: dict = Depends(get_current_user)):
    # Upsert control date for user
    current_time = datetime.utcnow()
    query = control_dates.select().where(control_dates.c.user_id == current_user["id"])
    existing = await database.fetch_one(query)
    
    if existing:
        update_query = control_dates.update().where(control_dates.c.user_id == current_user["id"]).values(
            year=config.year,
            month=config.month,
            control_date=config.control_date,
            update_by=current_user["id"],
            update_date=current_time
        )
        await database.execute(update_query)
    else:
        insert_query = control_dates.insert().values(
            user_id=current_user["id"],
            year=config.year,
            month=config.month,
            control_date=config.control_date,
            create_by=current_user["id"],
            create_date=current_time,
            update_by=current_user["id"],
            update_date=current_time
        )
        await database.execute(insert_query)
    return {"control_date": config.control_date}


@app.get("/config/control_date/")
async def get_control_date(current_user: dict = Depends(get_current_user)):
    query = control_dates.select().where(control_dates.c.user_id == current_user["id"])
    result = await database.fetch_one(query)
    if not result:
        raise HTTPException(status_code=404, detail="Control date not configured for user")
    return {
        "year": result["year"],
        "month": result["month"],
        "control_date": result["control_date"]
    }

@app.post("/transactions/")
async def create_transaction(transaction: Transaction, request: Request, current_user: dict = Depends(get_current_user)):
    logger.info(f"Received payload: {transaction.dict()}")  # Debug log

    current_time = datetime.utcnow()
    query = transactions.insert().values(
        description=transaction.description,
        amount=transaction.amount,
        date=transaction.date,
        control_date=transaction.control_date,
        category=transaction.category,
        account=transaction.account,
        user_id=current_user["id"],
        create_by=current_user["id"],
        create_date=current_time,
        update_by=current_user["id"],
        update_date=current_time
    )
    last_record_id = await database.execute(query)
    return {**transaction.dict(), "id": last_record_id}


@app.get("/transactions/", response_model=List[Transaction])
async def read_transactions(current_user: dict = Depends(get_current_user)):
    query = transactions.select().where(transactions.c.user_id == current_user["id"]).order_by(transactions.c.control_date.desc(), transactions.c.date.desc())
    results = await database.fetch_all(query)
    logger.info(f"Fetched {len(results)} transactions from DB for user {current_user['username']}")  # Debug log
    return results

@app.post("/transactions/bulk/")
async def create_transactions_bulk(transactions_list: List[Transaction], current_user: dict = Depends(get_current_user)):
    if not transactions_list:
        raise HTTPException(status_code=400, detail="No transactions provided")
    
    current_time = datetime.utcnow()
    query = transactions.insert()
    values = [
        {
            "description": t.description,
            "amount": t.amount,
            "date": t.date,
            "control_date": t.control_date,
            "category": t.category,
            "account": t.account,
            "user_id": current_user["id"],
            "create_by": current_user["id"],
            "create_date": current_time,
            "update_by": current_user["id"],
            "update_date": current_time
        }
        for t in transactions_list
    ]
    
    # Execute all inserts at once
    last_record_id = await database.execute_many(query=query, values=values)
    
    return {"inserted_count": len(values)}

@app.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: int, current_user: dict = Depends(get_current_user)):
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
async def update_transaction(transaction_id: int, transaction: Transaction, current_user: dict = Depends(get_current_user)):
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

    # Add audit fields
    current_time = datetime.utcnow()
    update_data["update_by"] = current_user["id"]
    update_data["update_date"] = current_time

    # Update the transaction
    update_query = transactions.update().where(transactions.c.id == transaction_id).values(**update_data)
    await database.execute(update_query)

    # Return the updated transaction
    updated_transaction = await database.fetch_one(transactions.select().where(transactions.c.id == transaction_id))
    return updated_transaction
