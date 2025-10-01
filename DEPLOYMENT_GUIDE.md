# Finance Tracker Backend - Deployment Guide

## Overview
This guide covers deploying the Finance Tracker backend API in various environments, from local development to production deployment.

## Prerequisites

### System Requirements
- **Python**: 3.12+ (recommended)
- **PostgreSQL**: 12+ 
- **Docker**: 20.10+ (for containerized deployment)
- **Docker Compose**: 2.0+ (for local development)

### Dependencies
See `requirements.txt` for complete Python dependencies:
- FastAPI 0.100.0+
- uvicorn[standard] 0.23.0+
- databases[postgresql] 0.8.0+
- SQLAlchemy 2.0.0+
- psycopg2-binary 2.9.0+
- passlib[bcrypt] 1.7.4+
- python-jose[cryptography] 3.3.0+
- bcrypt 4.3.0

## Environment Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql+psycopg2://user:password@db:5432/transactions` | PostgreSQL connection string |
| `JWT_SECRET` | No | `supersecretkey` | JWT signing secret (use secure random string in production) |
| `DEBUG` | No | `False` | Enable debug mode (`true`/`false`) |

### Production Environment Variables
```bash
# Database
DATABASE_URL=postgresql+psycopg2://prod_user:secure_password@prod-db-host:5432/finance_tracker

# Security
JWT_SECRET=your-cryptographically-secure-random-string-here

# Application
DEBUG=false
```

### Development Environment Variables
```bash
# Database  
DATABASE_URL=postgresql+psycopg2://dev_user:dev_password@localhost:5432/finance_tracker_dev

# Security (development only)
JWT_SECRET=dev-secret-key

# Application
DEBUG=true
```

## Local Development Setup

### Option 1: Docker Compose (Recommended)

1. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: transactions
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+psycopg2://user:password@db:5432/transactions
      JWT_SECRET: dev-secret-key
      DEBUG: "true"
    depends_on:
      - db
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

2. **Start services**:
```bash
docker-compose up -d
```

3. **Access API**:
   - Backend: http://localhost:8000
   - API docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

### Option 2: Manual Setup

1. **Install PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download and install from https://www.postgresql.org/download/
```

2. **Create database**:
```sql
sudo -u postgres psql
CREATE DATABASE finance_tracker_dev;
CREATE USER dev_user WITH ENCRYPTED PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE finance_tracker_dev TO dev_user;
\q
```

3. **Install Python dependencies**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Set environment variables**:
```bash
export DATABASE_URL="postgresql+psycopg2://dev_user:dev_password@localhost:5432/finance_tracker_dev"
export JWT_SECRET="dev-secret-key"
export DEBUG="true"
```

5. **Run application**:
```bash
python run.py
# OR
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Production Deployment

### Option 1: Docker Container

1. **Build production image**:
```dockerfile
# Dockerfile (production optimized)
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY run.py .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build and run**:
```bash
docker build -t finance-tracker-backend .
docker run -d \
  --name finance-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql+psycopg2://prod_user:secure_password@prod-db:5432/finance_tracker" \
  -e JWT_SECRET="your-secure-jwt-secret" \
  -e DEBUG="false" \
  finance-tracker-backend
```

### Option 2: Traditional Server Deployment

1. **Server setup** (Ubuntu 20.04+):
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.12 python3.12-venv python3-pip nginx postgresql-client -y

# Create application user
sudo useradd --system --shell /bin/bash --create-home finance-app
```

2. **Application deployment**:
```bash
# Switch to app user
sudo su - finance-app

# Clone and setup application
git clone <repository-url> finance-tracker
cd finance-tracker/backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install production server
pip install gunicorn
```

3. **Create systemd service** (`/etc/systemd/system/finance-backend.service`):
```ini
[Unit]
Description=Finance Tracker Backend
After=network.target

[Service]
Type=notify
User=finance-app
Group=finance-app
WorkingDirectory=/home/finance-app/finance-tracker/backend
Environment=DATABASE_URL=postgresql+psycopg2://prod_user:secure_password@localhost:5432/finance_tracker
Environment=JWT_SECRET=your-secure-jwt-secret
Environment=DEBUG=false
ExecStart=/home/finance-app/finance-tracker/backend/venv/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
ExecReload=/bin/kill -HUP $MAINPID
Restart=always

[Install]
WantedBy=multi-user.target
```

4. **Start and enable service**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable finance-backend
sudo systemctl start finance-backend
sudo systemctl status finance-backend
```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create finance-tracker-backend
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set DEBUG=false
git push heroku main
```

#### AWS ECS/Fargate
```yaml
# task-definition.json
{
  "family": "finance-tracker-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/finance-tracker-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql+psycopg2://user:password@rds-endpoint:5432/database"
        },
        {
          "name": "JWT_SECRET",
          "value": "your-secure-jwt-secret"
        },
        {
          "name": "DEBUG",
          "value": "false"
        }
      ]
    }
  ]
}
```

#### Google Cloud Run
```yaml
# cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/finance-tracker-backend', './backend']
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/finance-tracker-backend']
- name: 'gcr.io/cloud-builders/gcloud'
  args:
  - 'run'
  - 'deploy'
  - 'finance-tracker-backend'
  - '--image'
  - 'gcr.io/$PROJECT_ID/finance-tracker-backend'
  - '--region'
  - 'us-central1'
  - '--platform'
  - 'managed'
  - '--allow-unauthenticated'
```

## Database Setup

### PostgreSQL Production Setup

1. **Install PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Configure PostgreSQL
sudo postgresql-setup --initdb  # CentOS/RHEL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

2. **Create production database**:
```sql
sudo -u postgres psql

-- Create database and user
CREATE DATABASE finance_tracker;
CREATE USER finance_user WITH ENCRYPTED PASSWORD 'secure_production_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO finance_user;
GRANT CREATE ON SCHEMA public TO finance_user;

-- Exit
\q
```

3. **Configure PostgreSQL** (`/etc/postgresql/15/main/postgresql.conf`):
```ini
# Connection settings
listen_addresses = 'localhost'  # or '*' for remote connections
port = 5432

# Performance settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

4. **Configure authentication** (`/etc/postgresql/15/main/pg_hba.conf`):
```
# Local connections
local   finance_tracker    finance_user                     md5
host    finance_tracker    finance_user    127.0.0.1/32    md5
```

## Reverse Proxy Setup (Nginx)

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/finance-backend
server {
    listen 80;
    server_name finance-backend.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name finance-backend.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/finance-backend.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finance-backend.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin "https://finance.yourdomain.com";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }

    # Health check endpoint (bypass rate limiting)
    location /health {
        proxy_pass http://127.0.0.1:8000;
        limit_req off;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/finance-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Security Configuration

### SSL/TLS Setup (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d finance-backend.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration (UFW)
```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 8000/tcp  # Block direct access to backend
sudo ufw enable
```

### JWT Secret Generation
```bash
# Generate secure JWT secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Monitoring and Logging

### Application Logs
```bash
# View application logs
sudo journalctl -u finance-backend -f

# Log rotation
sudo vim /etc/logrotate.d/finance-backend
```

```
/var/log/finance-backend/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    create 644 finance-app finance-app
    postrotate
        systemctl reload finance-backend
    endscript
}
```

### Health Monitoring Script
```bash
#!/bin/bash
# health_check.sh

BACKEND_URL="https://finance-backend.yourdomain.com/health"
TIMEOUT=10

response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$BACKEND_URL")

if [ "$response" = "200" ]; then
    echo "Backend is healthy"
    exit 0
else
    echo "Backend is unhealthy (HTTP $response)"
    exit 1
fi
```

### Basic Monitoring with cron
```bash
# Add to crontab
*/5 * * * * /home/finance-app/health_check.sh || echo "Backend down at $(date)" >> /var/log/backend-alerts.log
```

## Backup and Recovery

### Database Backup
```bash
#!/bin/bash
# backup_db.sh

DB_NAME="finance_tracker"
DB_USER="finance_user"
BACKUP_DIR="/var/backups/finance-tracker"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Database Restore
```bash
# Restore from backup
gunzip -c /var/backups/finance-tracker/backup_20251001_120000.sql.gz | psql -U finance_user -h localhost finance_tracker
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
psql -U finance_user -h localhost -d finance_tracker -c "SELECT version();"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

2. **Application Won't Start**:
```bash
# Check service status
sudo systemctl status finance-backend

# Check application logs
sudo journalctl -u finance-backend -n 50

# Test application manually
cd /home/finance-app/finance-tracker/backend
source venv/bin/activate
python run.py
```

3. **CORS Issues**:
```bash
# Check CORS configuration in app/core/config.py
# Verify DEBUG setting
# Check nginx CORS headers
```

4. **Performance Issues**:
```bash
# Check system resources
htop
df -h

# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Log Locations
- **Application**: `journalctl -u finance-backend`
- **Nginx**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **PostgreSQL**: `/var/log/postgresql/postgresql-15-main.log`

## Performance Tuning

### Application Level
- Use connection pooling (already configured)
- Enable gzip compression in nginx
- Use database indexes (already configured)
- Monitor query performance with `EXPLAIN ANALYZE`

### System Level
```bash
# Increase file descriptor limits
echo "finance-app soft nofile 65536" >> /etc/security/limits.conf
echo "finance-app hard nofile 65536" >> /etc/security/limits.conf
```

### Database Tuning
```sql
-- Monitor slow queries
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
SELECT pg_reload_conf();

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = 1 ORDER BY control_date DESC;
```