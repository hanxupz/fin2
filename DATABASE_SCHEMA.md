# Finance Tracker - Database Schema Documentation

## Database Overview

The Finance Tracker application uses PostgreSQL as its primary database. The schema is designed to support multi-user functionality with proper data isolation and audit trailing.

## Database Connection Configuration

### Connection URL Format
```
postgresql+psycopg2://username:password@host:port/database_name
```

### Production Configuration
- **Driver**: psycopg2-binary (PostgreSQL adapter)
- **Connection Pooling**: Enabled with pre-ping
- **Pool Recycle**: 300 seconds
- **Echo**: Controlled by DEBUG setting

## Table Schemas

### 1. Users Table (`users`)

Stores user authentication and profile information.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    create_by INTEGER NOT NULL,
    create_date TIMESTAMP NOT NULL,
    update_by INTEGER NOT NULL,
    update_date TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
```

#### Column Details
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-incrementing user identifier |
| `username` | VARCHAR | UNIQUE, NOT NULL | User's login name |
| `hashed_password` | VARCHAR | NOT NULL | bcrypt hashed password |
| `create_by` | INTEGER | NOT NULL | ID of user who created this record |
| `create_date` | TIMESTAMP | NOT NULL | When the record was created |
| `update_by` | INTEGER | NOT NULL | ID of user who last updated this record |
| `update_date` | TIMESTAMP | NOT NULL | When the record was last updated |

#### Special Values
- `create_by = -1`: System-created user (during registration)
- `update_by = -1`: System-updated record

---

### 2. Transactions Table (`transactions`)

Stores all financial transactions for users.

```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    description VARCHAR,
    amount FLOAT,
    date DATE,
    control_date DATE,
    category VARCHAR,
    account VARCHAR,
    user_id INTEGER NOT NULL,
    create_by INTEGER NOT NULL,
    create_date TIMESTAMP NOT NULL,
    update_by INTEGER NOT NULL,
    update_date TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_control_date ON transactions(control_date DESC);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_account ON transactions(account);
```

#### Column Details
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-incrementing transaction identifier |
| `description` | VARCHAR | | Transaction description/memo |
| `amount` | FLOAT | | Transaction amount (negative=expense, positive=income) |
| `date` | DATE | | Actual transaction date |
| `control_date` | DATE | | Budget period assignment date |
| `category` | VARCHAR | | Transaction category (Food, Transportation, etc.) |
| `account` | VARCHAR | | Account name (Checking, Credit Card, etc.) |
| `user_id` | INTEGER | NOT NULL | Foreign key to users table |
| `create_by` | INTEGER | NOT NULL | ID of user who created this transaction |
| `create_date` | TIMESTAMP | NOT NULL | When the transaction was created |
| `update_by` | INTEGER | NOT NULL | ID of user who last updated this transaction |
| `update_date` | TIMESTAMP | NOT NULL | When the transaction was last updated |

#### Business Rules
- **Amount Convention**: Negative values represent expenses, positive values represent income
- **User Isolation**: All queries filtered by `user_id` to ensure data privacy
- **Default Ordering**: By `control_date DESC, date DESC` for consistent display

---

### 3. Control Dates Table (`control_dates`)

Stores user-specific control date configurations for budget periods.

```sql
CREATE TABLE control_dates (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    control_date DATE NOT NULL,
    create_by INTEGER NOT NULL,
    create_date TIMESTAMP NOT NULL,
    update_by INTEGER NOT NULL,
    update_date TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_control_dates_user_id ON control_dates(user_id);
CREATE UNIQUE INDEX idx_control_dates_user_year_month ON control_dates(user_id, year, month);
```

#### Column Details
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-incrementing control date identifier |
| `user_id` | INTEGER | NOT NULL | Foreign key to users table |
| `year` | INTEGER | NOT NULL | Year for this control date setting |
| `month` | INTEGER | NOT NULL | Month (1-12) for this control date setting |
| `control_date` | DATE | NOT NULL | The actual control date for the period |
| `create_by` | INTEGER | NOT NULL | ID of user who created this setting |
| `create_date` | TIMESTAMP | NOT NULL | When the setting was created |
| `update_by` | INTEGER | NOT NULL | ID of user who last updated this setting |
| `update_date` | TIMESTAMP | NOT NULL | When the setting was last updated |

#### Business Rules
- **One Per Period**: Each user can have only one control date per year/month combination
- **Default Value**: If not specified, control_date defaults to the 1st of the month
- **User Isolation**: Each user maintains their own control date configurations

## Relationships

### Entity Relationship Diagram
```
┌─────────────────┐         ┌─────────────────────┐
│     users       │         │    transactions     │
├─────────────────┤         ├─────────────────────┤
│ id (PK)         │◄────────┤ user_id (FK)        │
│ username        │         │ id (PK)             │
│ hashed_password │         │ description         │
│ create_by       │         │ amount              │
│ create_date     │         │ date                │
│ update_by       │         │ control_date        │
│ update_date     │         │ category            │
└─────────────────┘         │ account             │
                            │ create_by           │
        │                   │ create_date         │
        │                   │ update_by           │
        │                   │ update_date         │
        │                   └─────────────────────┘
        │
        │
        │                   ┌─────────────────────┐
        │                   │   control_dates     │
        │                   ├─────────────────────┤
        └───────────────────┤ user_id (FK)        │
                            │ id (PK)             │
                            │ year                │
                            │ month               │
                            │ control_date        │
                            │ create_by           │
                            │ create_date         │
                            │ update_by           │
                            │ update_date         │
                            └─────────────────────┘
```

### Foreign Key Relationships
- `transactions.user_id` → `users.id`
- `control_dates.user_id` → `users.id`

## Data Types and Constraints

### PostgreSQL Data Types Used
- **INTEGER**: Auto-incrementing IDs, user references, year/month values
- **VARCHAR**: Text fields (username, description, category, account)
- **FLOAT**: Financial amounts (supports decimals)
- **DATE**: Date fields (transaction dates, control dates)
- **TIMESTAMP**: Audit timestamps (create_date, update_date)

### Constraint Patterns
- **Primary Keys**: All tables have integer primary keys
- **Unique Constraints**: 
  - `users.username` (unique usernames)
  - `control_dates(user_id, year, month)` (one control date per user per period)
- **Not Null Constraints**: Essential fields and audit fields
- **Indexes**: Performance optimization for common queries

## Audit Trail Design

All tables implement a consistent audit pattern:

### Audit Fields
```sql
create_by INTEGER NOT NULL,    -- Who created the record
create_date TIMESTAMP NOT NULL, -- When it was created
update_by INTEGER NOT NULL,    -- Who last modified the record
update_date TIMESTAMP NOT NULL  -- When it was last modified
```

### Audit Values
- **User Operations**: `create_by` and `update_by` contain the user's ID
- **System Operations**: Use `-1` for system-generated operations
- **Timestamps**: Always in UTC, automatically managed by application

## Performance Optimizations

### Indexing Strategy
1. **Primary Keys**: Automatic unique indexes
2. **Foreign Keys**: Indexed for join performance
3. **User Isolation**: `user_id` indexed on all user data tables
4. **Sorting**: `control_date` and `date` indexed for default ordering
5. **Filtering**: Common filter fields (`category`, `account`) indexed

### Query Patterns
- **User Data Isolation**: All queries include `WHERE user_id = ?`
- **Pagination Ready**: Consistent ordering enables efficient pagination
- **Bulk Operations**: Supported through batch inserts

## Security Considerations

### Data Isolation
- **User Scoping**: All data queries filtered by authenticated user ID
- **No Cross-User Access**: Impossible to access another user's data
- **Service Layer Enforcement**: All data access goes through user-aware services

### Password Security
- **Hashing**: bcrypt with automatic salt generation
- **Length Limit**: 72 characters (bcrypt limitation)
- **No Plain Text**: Passwords never stored in plain text

### Audit Trail
- **Change Tracking**: All modifications tracked with user ID and timestamp
- **Accountability**: Every change can be traced to a specific user
- **System Operations**: Distinguished from user operations

## Migration and Maintenance

### Schema Creation
- **Automatic**: Tables created on application startup
- **Idempotent**: Safe to run multiple times
- **SQLAlchemy Managed**: Schema defined in code, not SQL files

### Backup Considerations
- **User Data**: All user data in `transactions` and `control_dates`
- **Authentication**: User credentials in `users` table
- **Audit Data**: Complete change history in audit fields

### Scaling Considerations
- **Connection Pooling**: Handles multiple concurrent users
- **Indexes**: Support efficient queries as data grows
- **Partitioning**: Future consideration for large transaction volumes (by user_id or date)

## Sample Data

### Example User Record
```sql
INSERT INTO users (username, hashed_password, create_by, create_date, update_by, update_date)
VALUES ('john_doe', '$2b$12$...', -1, '2025-10-01 10:00:00', -1, '2025-10-01 10:00:00');
```

### Example Transaction Record
```sql
INSERT INTO transactions (description, amount, date, control_date, category, account, user_id, create_by, create_date, update_by, update_date)
VALUES ('Grocery Store', -85.50, '2025-10-01', '2025-10-01', 'Food', 'Checking', 1, 1, '2025-10-01 14:30:00', 1, '2025-10-01 14:30:00');
```

### Example Control Date Record
```sql
INSERT INTO control_dates (user_id, year, month, control_date, create_by, create_date, update_by, update_date)
VALUES (1, 2025, 10, '2025-10-15', 1, '2025-10-01 09:00:00', 1, '2025-10-01 09:00:00');
```