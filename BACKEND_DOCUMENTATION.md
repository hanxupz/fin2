# Finance Tracker Backend Documentation

## Overview
The Finance Tracker backend is a FastAPI-based REST API that provides user authentication, transaction management, and control date configuration for a personal finance tracking application. It uses PostgreSQL as the database and implements JWT-based authentication.

## Architecture

### Technology Stack
- **Framework**: FastAPI 0.100.0+
- **Database**: PostgreSQL with SQLAlchemy Core
- **Authentication**: JWT with bcrypt password hashing
- **Web Server**: Uvicorn
- **Database Driver**: psycopg2-binary
- **Password Hashing**: bcrypt 4.3.0
- **Environment**: Docker containerized

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization and configuration
│   ├── core/
│   │   ├── config.py          # Application configuration and settings
│   │   ├── database.py        # Database connection and setup
│   │   └── security.py        # Authentication and security utilities
│   ├── models/
│   │   └── database_models.py # SQLAlchemy table definitions
│   ├── routes/
│   │   ├── __init__.py        # Router exports
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── transactions.py    # Transaction CRUD endpoints
│   │   └── control_dates.py   # Control date configuration endpoints
│   ├── schemas/
│   │   ├── user_schemas.py        # User Pydantic models
│   │   ├── transaction_schemas.py # Transaction Pydantic models
│   │   └── control_date_schemas.py # Control date Pydantic models
│   └── services/
│       ├── user_service.py        # User business logic
│       ├── transaction_service.py # Transaction business logic
│       └── control_date_service.py # Control date business logic
├── run.py                     # Application entry point
├── requirements.txt           # Python dependencies
└── Dockerfile                 # Docker container configuration
```

## Core Components

### 1. Application Configuration (`core/config.py`)
Centralizes all application settings with environment variable support:

- **Database Configuration**: PostgreSQL connection URL
- **JWT Settings**: Secret key, algorithm, token expiration (60 minutes)
- **CORS Configuration**: Production-ready origin whitelist including:
  - `https://finance.theonet.uk` (production frontend)
  - `https://finance-backend.theonet.uk` (production backend)
  - Local development endpoints
- **Debug Mode**: Controlled via `DEBUG` environment variable

### 2. Database Layer (`core/database.py`)
- **Connection Management**: Async database connection with proper connection pooling
- **Driver Configuration**: Automatic PostgreSQL driver setup (`postgresql+psycopg2://`)
- **Connection Pooling**: Pre-ping enabled, 300-second recycle time
- **Table Creation**: Automatic schema creation on startup

### 3. Security (`core/security.py`)
- **Password Hashing**: bcrypt with 72-character limit
- **JWT Tokens**: HS256 algorithm, 60-minute expiration
- **Authentication Middleware**: OAuth2PasswordBearer with token validation
- **User Context**: Dependency injection for current user access

## Data Models

### Database Tables

#### Users Table (`users`)
```sql
- id: INTEGER (Primary Key)
- username: STRING (Unique, Indexed)
- hashed_password: STRING
- create_by: INTEGER (Audit field)
- create_date: DATETIME (Audit field)
- update_by: INTEGER (Audit field)  
- update_date: DATETIME (Audit field)
```

#### Transactions Table (`transactions`)
```sql
- id: INTEGER (Primary Key)
- description: STRING
- amount: FLOAT
- date: DATE
- control_date: DATE
- category: STRING
- account: STRING
- user_id: INTEGER (Foreign Key to users)
- create_by: INTEGER (Audit field)
- create_date: DATETIME (Audit field)
- update_by: INTEGER (Audit field)
- update_date: DATETIME (Audit field)
```

#### Control Dates Table (`control_dates`)
```sql
- id: INTEGER (Primary Key)
- user_id: INTEGER (Foreign Key to users)
- year: INTEGER
- month: INTEGER
- control_date: DATE
- create_by: INTEGER (Audit field)
- create_date: DATETIME (Audit field)
- update_by: INTEGER (Audit field)
- update_date: DATETIME (Audit field)
```

### Pydantic Schemas

#### User Schemas
- **UserCreate**: Registration data (username, password)
- **User**: User response model (id, username)
- **Token**: JWT token response (access_token, token_type)

#### Transaction Schemas
- **TransactionBase**: Core transaction fields
- **TransactionCreate**: New transaction data
- **TransactionUpdate**: Partial update data (all fields optional)
- **Transaction**: Full transaction response with ID and user_id

#### Control Date Schemas
- **ControlDateSetting**: Input for setting control dates (year, month, optional control_date)
- **ControlDateResponse**: Control date configuration response

## API Endpoints

### Authentication Routes (`/`)

#### POST `/register`
- **Purpose**: User registration
- **Input**: `UserCreate` (username, password)
- **Output**: `User` (id, username)
- **Status**: 201 Created
- **Errors**: 400 (username exists), 500 (server error)

#### POST `/token`
- **Purpose**: User login and token generation
- **Input**: OAuth2PasswordRequestForm (username, password)
- **Output**: `Token` (access_token, token_type)
- **Authentication**: None required
- **Errors**: 401 (invalid credentials)

### Transaction Routes (`/transactions`)
All endpoints require JWT authentication.

#### GET `/transactions/`
- **Purpose**: Get all user transactions
- **Output**: List of `Transaction` objects
- **Ordering**: By control_date DESC, date DESC

#### POST `/transactions/`
- **Purpose**: Create single transaction
- **Input**: `TransactionCreate`
- **Output**: `Transaction`
- **Status**: 201 Created

#### POST `/transactions/bulk/`
- **Purpose**: Create multiple transactions
- **Input**: List of `TransactionCreate`
- **Output**: Success message with count
- **Status**: 201 Created

#### PUT `/transactions/{transaction_id}`
- **Purpose**: Update existing transaction
- **Input**: `TransactionUpdate` (partial update)
- **Output**: Updated `Transaction`
- **Errors**: 404 (not found)

#### DELETE `/transactions/{transaction_id}`
- **Purpose**: Delete transaction
- **Output**: No content
- **Status**: 204 No Content
- **Errors**: 404 (not found)

### Control Date Routes (`/config/control_date`)
All endpoints require JWT authentication.

#### GET `/config/control_date/`
- **Purpose**: Get user's control date configuration
- **Output**: `ControlDateResponse`
- **Errors**: 404 (not configured)

#### POST `/config/control_date/`
- **Purpose**: Set/update control date configuration
- **Input**: `ControlDateSetting`
- **Output**: `ControlDateResponse`
- **Default**: If control_date not provided, defaults to 1st of month

### System Routes

#### GET `/health`
- **Purpose**: Health check endpoint
- **Output**: Status and app name
- **Authentication**: None required

#### OPTIONS `/{path:path}`
- **Purpose**: CORS preflight handling
- **Output**: OK message

## Business Logic (Services)

### UserService
- **User Management**: Registration, authentication, user lookup
- **Password Security**: Automated hashing and verification
- **Audit Trail**: Automatic creation/update tracking

### TransactionService  
- **CRUD Operations**: Complete transaction lifecycle management
- **Bulk Operations**: Efficient multiple transaction creation
- **User Isolation**: All operations scoped to authenticated user
- **Audit Trail**: Full change tracking with user ID and timestamps

### ControlDateService
- **Configuration Management**: User-specific control date settings
- **Upsert Logic**: Automatic create or update behavior
- **Default Handling**: Intelligent defaults for control dates

## Security Features

### Authentication Flow
1. User registers with username/password
2. Password is hashed with bcrypt
3. User logs in to receive JWT token
4. Token is included in `Authorization: Bearer <token>` header
5. Token is validated on each protected endpoint

### Security Measures
- **Password Hashing**: bcrypt with automatic salt generation
- **JWT Security**: Signed tokens with expiration
- **User Isolation**: All data operations scoped to authenticated user
- **CORS Protection**: Strict origin whitelist for production
- **Input Validation**: Pydantic schema validation on all inputs

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (default: "supersecretkey")
- `DEBUG`: Enable debug mode (default: "False")

### Production Configuration
- Database URL points to production PostgreSQL instance
- JWT secret should be cryptographically secure random string
- Debug mode disabled
- CORS origins restricted to known frontend domains

## Deployment

### Docker Setup
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
COPY run.py .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Application Startup
1. **Database Tables**: Automatic creation/verification
2. **Database Connection**: Async connection establishment
3. **CORS Configuration**: Middleware setup based on debug mode
4. **Router Registration**: All endpoint routes registered
5. **Health Check**: `/health` endpoint available

### Application Shutdown
1. **Database Disconnection**: Clean database connection closure
2. **Resource Cleanup**: Proper resource deallocation

## Logging
- **Structured Logging**: Python logging module with INFO level
- **Request Tracking**: User operations logged with usernames/IDs
- **Error Handling**: Comprehensive error logging with context
- **Startup/Shutdown**: Application lifecycle events logged

## Error Handling
- **Validation Errors**: Automatic Pydantic validation with detailed messages
- **Authentication Errors**: Clear 401 responses for auth failures
- **Not Found Errors**: 404 responses for missing resources
- **Server Errors**: 500 responses with error details in debug mode
- **Database Errors**: Proper exception handling and user feedback

## Performance Considerations
- **Connection Pooling**: Database connections reused efficiently
- **Bulk Operations**: Optimized multi-transaction creation
- **Async Operations**: Non-blocking database operations
- **Query Optimization**: Indexed lookups and efficient ordering
- **Minimal Dependencies**: Lean dependency tree for faster startup

## Audit Trail
All database operations include comprehensive audit fields:
- `create_by`: User ID of creator
- `create_date`: Timestamp of creation
- `update_by`: User ID of last updater  
- `update_date`: Timestamp of last update

This enables full traceability of all data changes in the system.