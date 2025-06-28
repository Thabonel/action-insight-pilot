#!/bin/bash

set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set"
        exit 1
    fi
done

# Build and test frontend
echo "📦 Building frontend..."
npm ci
npm run lint
npm run test
npm run build

# Test backend
echo "🐍 Testing backend..."
cd backend
pip install -r requirements.txt
pytest
cd ..

# Deploy to production
echo "🌐 Deploying to production..."

# Option 1: Deploy via Docker
if command -v docker &> /dev/null; then
    echo "Using Docker deployment..."
    docker-compose build
    docker-compose up -d
fi

# Option 2: Deploy via Lovable (automatic when connected to GitHub)
echo "✅ Deployment complete!"
echo "🔗 Your app is available at: https://your-domain.com"

# Health check
echo "🏥 Running health checks..."
sleep 10

# Check frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

echo "🎉 Deployment process completed!"