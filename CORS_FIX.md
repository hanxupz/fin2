# Backend Deployment Fix for PostgreSQL and CORS Issues

## Root Cause
The error `sqlalchemy.exc.NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres` indicates that:
1. The PostgreSQL driver isn't properly installed
2. The database URL format needs to be corrected
3. The refactored backend structure needs proper deployment

## Quick Fix Steps

### 1. Run the automated fix script:
```bash
chmod +x fix_deployment.sh
./fix_deployment.sh
```

### OR manually rebuild the backend:
```bash
docker-compose down
docker-compose build --no-cache backend  
docker-compose up -d
```

### 2. Check if the new backend structure is running:
```bash
# Check container logs
docker logs transactions_backend

# Test the health endpoint
curl -X GET https://finance-backend.theonet.uk/health

# Test CORS preflight
curl -X OPTIONS https://finance-backend.theonet.uk/transactions/ \
  -H "Origin: https://finance.theonet.uk" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

### 3. Verify the new app structure is being used:
The backend should now be using:
- `app.main:app` instead of `main:app` 
- New modular structure with CORS properly configured
- Debug mode enabled for more permissive CORS

### 4. If still having issues, check:
- The container is using the new Dockerfile
- Environment variables are set correctly (DEBUG=true)
- The new app structure files are copied into the container

## What Changed:
- **CORS Configuration**: Now more permissive with explicit headers
- **App Structure**: Modular FastAPI app with proper separation of concerns
- **Debug Mode**: Allows all origins when DEBUG=true
- **Explicit OPTIONS Handler**: Better preflight request handling

## Testing:
After rebuild, test at: https://finance-backend.theonet.uk/health
Should return: `{"status": "healthy", "app": "Finance Tracker API"}`