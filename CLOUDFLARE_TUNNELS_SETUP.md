# Cloudflare Tunnels Setup Guide

This guide explains how to expose your FastAPI backend and React frontend using Cloudflare Tunnels.

## Benefits of Cloudflare Tunnels

- ✅ No router port forwarding needed
- ✅ No firewall changes needed
- ✅ Automatic HTTPS with SSL certificates
- ✅ DDoS protection built-in
- ✅ Your origin server IP stays hidden

## Prerequisites

1. A Cloudflare account (free tier works)
2. Docker and Docker Compose installed
3. Applications running locally

## Step 1: Install Cloudflared

### Windows
```bash
# Download cloudflared
curl -L --output cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

# Or download from: https://github.com/cloudflare/cloudflared/releases
```

### Linux
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### macOS
```bash
brew install cloudflared
```

## Step 2: Login to Cloudflare

```bash
cloudflared tunnel login
```

This will open a browser window to authorize cloudflared with your Cloudflare account.

## Step 3: Create Tunnels

Create separate tunnels for backend and frontend:

```bash
# Create tunnel for backend
cloudflared tunnel create fin2-backend

# Create tunnel for frontend
cloudflared tunnel create fin2-frontend
```

Note the tunnel IDs that are created.

## Step 4: Configure Backend Tunnel

Create a file `config-backend.yml`:

```yaml
tunnel: <your-backend-tunnel-id>
credentials-file: /path/to/.cloudflared/<your-backend-tunnel-id>.json

ingress:
  - hostname: backend.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

Replace:
- `<your-backend-tunnel-id>` with the tunnel ID from step 3
- `backend.yourdomain.com` with your desired domain (must be added to Cloudflare DNS)

## Step 5: Configure Frontend Tunnel

Create a file `config-frontend.yml`:

```yaml
tunnel: <your-frontend-tunnel-id>
credentials-file: /path/to/.cloudflared/<your-frontend-tunnel-id>.json

ingress:
  - hostname: app.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

Replace:
- `<your-frontend-tunnel-id>` with the tunnel ID from step 3
- `app.yourdomain.com` with your desired domain (must be added to Cloudflare DNS)

## Step 6: Configure DNS

In your Cloudflare dashboard:

1. Go to DNS settings
2. The tunnel creation should have automatically added CNAME records
3. Verify that `backend.yourdomain.com` and `app.yourdomain.com` point to your tunnels

## Step 7: Configure Application Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
# Use your Cloudflare backend tunnel URL
REACT_APP_BACKEND_URL=https://backend.yourdomain.com

# Set a secure JWT secret
JWT_SECRET=your-super-secure-random-string-here
```

## Step 8: Update CORS (if needed)

The backend is already configured to accept Cloudflare tunnel domains. If you need to add specific domains, edit `backend/main.py`:

```python
origins = [
    "http://finance.theonet.uk",
    "http://localhost:3000",
    "http://192.168.1.97:3000",
    "https://finance.theonet.uk",
    "https://*.trycloudflare.com",  # Already included
    "https://app.yourdomain.com",   # Add your specific domain
]
```

## Step 9: Start Your Applications

```bash
# Start with docker-compose
docker-compose up --build
```

## Step 10: Start Cloudflare Tunnels

In separate terminal windows:

```bash
# Start backend tunnel
cloudflared tunnel --config config-backend.yml run

# Start frontend tunnel (in another terminal)
cloudflared tunnel --config config-frontend.yml run
```

## Step 11: Test Access

Your applications should now be accessible at:
- Frontend: `https://app.yourdomain.com`
- Backend API: `https://backend.yourdomain.com`

## Running Tunnels as a Service (Optional)

### Windows (as a service)
```bash
cloudflared service install config-backend.yml
cloudflared service install config-frontend.yml
```

### Linux (systemd)
```bash
sudo cloudflared service install --config config-backend.yml
sudo cloudflared service install --config config-frontend.yml
sudo systemctl start cloudflared
```

## Troubleshooting

### Tunnel not connecting
- Check that your local services are running on the correct ports (8000 for backend, 3000 for frontend)
- Verify tunnel configuration files have correct paths
- Check logs: `cloudflared tunnel info <tunnel-name>`

### CORS errors
- Ensure REACT_APP_BACKEND_URL is set correctly in `.env`
- Verify backend CORS configuration includes your domains
- Rebuild containers after changing environment variables: `docker-compose up --build`

### 502 Bad Gateway
- Ensure your backend/frontend containers are running
- Check that the tunnel is pointing to the correct local port
- Verify network connectivity: `curl http://localhost:8000` and `curl http://localhost:3000`

## Security Recommendations

1. **Use a strong JWT secret**: Generate a random string for production
   ```bash
   openssl rand -base64 32
   ```

2. **Restrict CORS origins**: In production, update `backend/main.py` to only allow specific domains instead of `["*"]`

3. **Use environment-specific configurations**: Create separate `.env` files for development and production

4. **Monitor tunnel logs**: Regularly check cloudflared logs for suspicious activity

5. **Rotate secrets**: Periodically update JWT secrets and database passwords

## Alternative: Quick Tunnel (Testing Only)

For quick testing without DNS setup, you can use Cloudflare's quick tunnels:

```bash
# Backend quick tunnel (no configuration needed)
cloudflared tunnel --url http://localhost:8000

# Frontend quick tunnel (in another terminal)
cloudflared tunnel --url http://localhost:3000
```

This gives you temporary `*.trycloudflare.com` URLs (they change on each run). Update REACT_APP_BACKEND_URL with the backend tunnel URL and restart the frontend.

**Note**: Quick tunnels are for testing only and should not be used in production.
