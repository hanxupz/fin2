# Quick Start Guide

This guide will help you get started with exposing your financial transactions application using Cloudflare Tunnels.

## Prerequisites

- Docker and Docker Compose installed
- Cloudflare account (free tier works)
- Applications configured with environment variables

## Option 1: Quick Test with Temporary Tunnels (Recommended for Testing)

This is the fastest way to test your application with Cloudflare Tunnels:

### 1. Install Cloudflared

**Windows:**
```bash
curl -L --output cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

**macOS:**
```bash
brew install cloudflared
```

### 2. Start Your Application Locally

```bash
# No .env file needed for local testing - defaults to localhost
docker-compose up --build
```

Wait until both services are running:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### 3. Create Quick Tunnels

In a new terminal:
```bash
# Start backend tunnel
cloudflared tunnel --url http://localhost:8000
```

You'll see output like:
```
Your quick Tunnel has been created! Visit it at:
https://random-name-1234.trycloudflare.com
```

**Copy the backend tunnel URL!**

In another new terminal:
```bash
# Start frontend tunnel
cloudflared tunnel --url http://localhost:3000
```

### 4. Update Frontend Configuration

Stop the Docker containers (Ctrl+C), then:

Create a `.env` file:
```bash
# Use the backend tunnel URL from step 3
REACT_APP_BACKEND_URL=https://random-name-1234.trycloudflare.com
JWT_SECRET=your-secret-key-here
```

Restart the containers:
```bash
docker-compose up --build
```

### 5. Access Your Application

Open the frontend tunnel URL in your browser:
```
https://random-frontend-5678.trycloudflare.com
```

You should now be able to:
- Register a new account
- Login
- Use all features from anywhere

**Note:** Quick tunnel URLs change every time you restart cloudflared. This is perfect for testing but not for production.

## Option 2: Production Setup with Named Tunnels

For a persistent, production-ready setup, follow the complete guide in [CLOUDFLARE_TUNNELS_SETUP.md](./CLOUDFLARE_TUNNELS_SETUP.md).

## Troubleshooting

### Backend connection errors

**Problem:** Frontend shows "Network error" when trying to login

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check REACT_APP_BACKEND_URL is set correctly in .env
3. Ensure you rebuilt the frontend container after changing .env: `docker-compose up --build frontend`

### CORS errors in browser console

**Problem:** Browser shows CORS policy errors

**Solution:**
1. The backend CORS is configured to allow all origins (`["*"]`)
2. If you still see errors, verify the backend tunnel is working: `curl https://your-backend-tunnel.trycloudflare.com/docs`
3. Clear browser cache and try again

### Tunnel not connecting

**Problem:** cloudflared shows "connection failed" errors

**Solution:**
1. Check your local service is running and accessible
2. Verify the port number is correct (8000 for backend, 3000 for frontend)
3. Try `curl http://localhost:8000` and `curl http://localhost:3000` to verify local services

### 502 Bad Gateway

**Problem:** Cloudflare tunnel shows 502 error

**Solution:**
1. Ensure Docker containers are running: `docker ps`
2. Check container logs: `docker logs transactions_backend` and `docker logs transactions_frontend`
3. Restart the containers: `docker-compose restart`

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_BACKEND_URL` | `http://localhost:8000` | Backend API URL (use Cloudflare tunnel URL for external access) |
| `JWT_SECRET` | `supersecretkey` | Secret key for JWT token generation (change in production!) |

## Security Best Practices

1. **Never commit .env files** - They're already in .gitignore
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Monitor tunnel access** - Check cloudflared logs regularly
4. **Use named tunnels for production** - Quick tunnels are for testing only

## Need Help?

- For complete Cloudflare Tunnels setup: See [CLOUDFLARE_TUNNELS_SETUP.md](./CLOUDFLARE_TUNNELS_SETUP.md)
- For environment configuration: See [.env.example](./.env.example)
- For issues: Check Docker logs with `docker-compose logs`

## Architecture

```
Internet
    ↓
Cloudflare Tunnel (HTTPS)
    ↓
Your Computer
    ↓
Docker Compose
    ├── Frontend (React) :3000
    ├── Backend (FastAPI) :8000
    └── Database (PostgreSQL) :5432
```

The Cloudflare Tunnel creates a secure, encrypted connection from your local Docker containers to the internet, without requiring port forwarding or exposing your home IP address.
