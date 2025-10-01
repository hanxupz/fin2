#!/bin/bash
# Complete rebuild script to fix PostgreSQL connection issues

echo "🔧 Fixing PostgreSQL connection and CORS issues..."

echo "📦 Stopping existing containers..."
docker-compose down

echo "🗑️  Removing old containers and images..."
docker container prune -f
docker image rm fin2_backend 2>/dev/null || true
docker image rm fin2-backend 2>/dev/null || true
docker system prune -f

echo "🔨 Building backend (circular import fixed)..."
docker-compose build --no-cache backend

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🏥 Checking backend health..."
curl -s https://finance-backend.theonet.uk/health || echo "❌ Health check failed"

echo "🌐 Testing CORS preflight..."
curl -s -X OPTIONS https://finance-backend.theonet.uk/transactions/ \
  -H "Origin: https://finance.theonet.uk" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type" || echo "❌ CORS test failed"

echo "📋 Checking backend logs..."
docker logs --tail=20 transactions_backend

echo "✅ Deployment complete! Check the logs above for any errors."