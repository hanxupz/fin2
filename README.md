# Financial Transactions Application

A full-stack financial transactions tracking application with FastAPI backend and React frontend, designed to work with Cloudflare Tunnels for secure external access.

## Features

- 💰 Track financial transactions with categories and accounts
- 📊 Visualize spending with charts and graphs
- 📅 Calendar view of transactions
- 🔐 Secure authentication with JWT tokens
- 🌐 External access via Cloudflare Tunnels
- 📱 Responsive mobile and desktop layouts
- 🌙 Dark and light theme support

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database for transaction storage
- **JWT** - Secure authentication
- **SQLAlchemy** - Database ORM

### Frontend
- **React** - UI framework
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization
- **date-fns** - Date manipulation

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Cloudflare Tunnels** - Secure external access

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Cloudflare account (for external access)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/hanxupz/fin2.git
cd fin2
```

2. Start the application:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### External Access with Cloudflare Tunnels

For step-by-step instructions to expose your application to the internet:

- **Quick testing**: See [QUICK_START.md](./QUICK_START.md)
- **Production setup**: See [CLOUDFLARE_TUNNELS_SETUP.md](./CLOUDFLARE_TUNNELS_SETUP.md)

## Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `http://localhost:8000` |
| `JWT_SECRET` | Secret key for JWT tokens | `supersecretkey` |

**Important:** Change `JWT_SECRET` in production!

Generate a secure secret:
```bash
openssl rand -base64 32
```

## Project Structure

```
fin2/
├── backend/                # FastAPI backend
│   ├── main.py            # Main application file
│   ├── Dockerfile         # Backend container configuration
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.js        # Main application component
│   │   ├── components/   # React components
│   │   └── ...
│   ├── Dockerfile        # Frontend container configuration
│   └── package.json      # Node dependencies
├── docker-compose.yml     # Docker orchestration
├── .env.example          # Example environment configuration
└── README.md             # This file
```

## Usage

### Register a New Account

1. Navigate to the application URL
2. Click "Register"
3. Enter username and password
4. Click "Register" button

### Login

1. Enter your credentials
2. Click "Login"

### Configure Control Date

Control dates help organize transactions by billing period:

1. Click the settings (⚙️) button
2. Select year and month
3. Click "Update Control Date"

### Add Transactions

1. Click the + button
2. Fill in transaction details:
   - Description
   - Amount (negative for expenses, positive for income)
   - Date
   - Control date (billing period)
   - Category
   - Account
3. Click "Save"

### View Reports

The application provides several visualizations:
- **Account Summary** - Current balance by account
- **Calendar View** - Daily transaction overview
- **Category Charts** - Spending by category
- **Account Charts** - Balance trends over time

## API Documentation

When the backend is running, interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Security

### Authentication
- JWT tokens with 60-minute expiration
- Passwords hashed with bcrypt
- User-specific data isolation

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000` (local development)
- `https://finance.theonet.uk` (production domain)
- `https://*.trycloudflare.com` (Cloudflare tunnels)

For production, consider restricting CORS to specific domains in `backend/main.py`.

### Best Practices
1. **Never commit .env files** - Use .env.example for documentation
2. **Use strong JWT secrets** - Minimum 32 random characters
3. **Keep dependencies updated** - Regularly update Docker images and packages
4. **Monitor access logs** - Check cloudflared logs for suspicious activity
5. **Use HTTPS in production** - Cloudflare Tunnels provide automatic HTTPS

## Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Database Migrations

The application automatically creates tables on startup. For manual database operations:

```bash
docker exec -it transactions_db psql -U user -d transactions
```

## Troubleshooting

### Application won't start
- Check Docker is running: `docker ps`
- Check logs: `docker-compose logs`
- Verify ports 3000, 8000, and 5432 are available

### Can't connect to backend
- Verify REACT_APP_BACKEND_URL in .env
- Check backend is running: `curl http://localhost:8000/docs`
- Rebuild containers: `docker-compose up --build`

### CORS errors
- Verify backend CORS configuration includes your domain
- Clear browser cache
- Check browser console for specific error messages

### Database connection errors
- Ensure PostgreSQL container is running: `docker ps | grep transactions_db`
- Check database logs: `docker logs transactions_db`
- Verify DATABASE_URL in docker-compose.yml

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Description of changes"`
6. Push: `git push origin feature-name`
7. Open a pull request

## License

This project is available for personal and educational use.

## Support

For issues and questions:
- Check [QUICK_START.md](./QUICK_START.md) for setup help
- Review [CLOUDFLARE_TUNNELS_SETUP.md](./CLOUDFLARE_TUNNELS_SETUP.md) for tunnel configuration
- Check Docker logs: `docker-compose logs`
- Review API documentation at http://localhost:8000/docs

## Acknowledgments

- FastAPI for the excellent backend framework
- Material-UI for the beautiful React components
- Cloudflare for providing secure tunnel infrastructure
