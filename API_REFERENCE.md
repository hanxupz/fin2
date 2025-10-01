# Finance Tracker Backend - API Reference

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://finance-backend.theonet.uk`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Tokens are obtained through the `/token` endpoint and expire after 60 minutes.

---

## Authentication Endpoints

### Register User
**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe"
}
```

**Error Responses:**
- `400 Bad Request`: Username already exists
- `500 Internal Server Error`: Registration failed

---

### Login
**POST** `/token`

Authenticate user and receive JWT token.

**Request Body (Form Data):**
```
username=john_doe
password=secure_password123
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

## Transaction Endpoints

### Get All Transactions
**GET** `/transactions/`

Retrieve all transactions for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "description": "Grocery shopping",
    "amount": -85.50,
    "date": "2025-09-28",
    "control_date": "2025-10-01",
    "category": "Food",
    "account": "Checking",
    "user_id": 1
  },
  {
    "id": 2,
    "description": "Salary",
    "amount": 3500.00,
    "date": "2025-09-30",
    "control_date": "2025-10-01",
    "category": "Income",
    "account": "Checking",
    "user_id": 1
  }
]
```

---

### Create Transaction
**POST** `/transactions/`

Create a new transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "description": "Coffee shop",
  "amount": -4.50,
  "date": "2025-10-01",
  "control_date": "2025-10-01",
  "category": "Food",
  "account": "Credit Card"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "description": "Coffee shop",
  "amount": -4.50,
  "date": "2025-10-01",
  "control_date": "2025-10-01",
  "category": "Food",
  "account": "Credit Card",
  "user_id": 1
}
```

---

### Create Multiple Transactions
**POST** `/transactions/bulk/`

Create multiple transactions in a single request.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
[
  {
    "description": "Gas station",
    "amount": -45.00,
    "date": "2025-10-01",
    "control_date": "2025-10-01",
    "category": "Transportation",
    "account": "Checking"
  },
  {
    "description": "Online purchase",
    "amount": -29.99,
    "date": "2025-10-01",
    "control_date": "2025-10-01",
    "category": "Shopping",
    "account": "Credit Card"
  }
]
```

**Response (201 Created):**
```json
{
  "inserted_count": 2
}
```

**Error Responses:**
- `400 Bad Request`: No transactions provided

---

### Update Transaction
**PUT** `/transactions/{transaction_id}`

Update an existing transaction. All fields are optional.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "description": "Updated coffee shop",
  "amount": -5.25,
  "category": "Dining"
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "description": "Updated coffee shop",
  "amount": -5.25,
  "date": "2025-10-01",
  "control_date": "2025-10-01",
  "category": "Dining",
  "account": "Credit Card",
  "user_id": 1
}
```

**Error Responses:**
- `404 Not Found`: Transaction not found or doesn't belong to user

---

### Delete Transaction
**DELETE** `/transactions/{transaction_id}`

Delete a transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (204 No Content):**
```
(Empty response body)
```

**Error Responses:**
- `404 Not Found`: Transaction not found or doesn't belong to user

---

## Control Date Configuration Endpoints

### Get Control Date Configuration
**GET** `/config/control_date/`

Retrieve the control date configuration for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "year": 2025,
  "month": 10,
  "control_date": "2025-10-01"
}
```

**Error Responses:**
- `404 Not Found`: Control date not configured for user

---

### Set Control Date Configuration
**POST** `/config/control_date/`

Set or update the control date configuration.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "year": 2025,
  "month": 10,
  "control_date": "2025-10-15"
}
```

**Optional - Without control_date (defaults to 1st of month):**
```json
{
  "year": 2025,
  "month": 11
}
```

**Response (200 OK):**
```json
{
  "year": 2025,
  "month": 10,
  "control_date": "2025-10-15"
}
```

---

## System Endpoints

### Health Check
**GET** `/health`

Check if the API is running and healthy.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "app": "Finance Tracker API"
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no response body
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Data Types and Constraints

### Transaction Fields
- **description**: String, required
- **amount**: Float, required (negative for expenses, positive for income)
- **date**: Date (YYYY-MM-DD format), optional
- **control_date**: Date (YYYY-MM-DD format), optional
- **category**: String, optional
- **account**: String, optional

### User Fields
- **username**: String, required, unique
- **password**: String, required (minimum length recommended: 8 characters)

### Control Date Fields
- **year**: Integer, required
- **month**: Integer, required (1-12)
- **control_date**: Date (YYYY-MM-DD format), optional (defaults to 1st of month)

---

## Rate Limiting and CORS

### CORS Configuration
The API supports cross-origin requests from:
- `https://finance.theonet.uk` (production)
- `https://finance-backend.theonet.uk` (production backend)
- `http://192.168.1.97:3000` (local network)
- `http://localhost:3000` (development)
- `http://localhost:3001` (alternative development)

In debug mode, all origins are allowed (`*`).

### Supported Methods
- GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH

### Supported Headers
- All headers (`*`) including:
- Authorization
- Content-Type
- X-Requested-With
- Accept
- Origin

---

## Example Usage with cURL

### Register a new user:
```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

### Login and get token:
```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"
```

### Create a transaction:
```bash
curl -X POST http://localhost:8000/transactions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Lunch",
    "amount": -12.50,
    "date": "2025-10-01",
    "category": "Food",
    "account": "Checking"
  }'
```

### Get all transactions:
```bash
curl -X GET http://localhost:8000/transactions/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```