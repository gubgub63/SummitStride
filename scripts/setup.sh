#!/bin/bash

# Coach IA Hugo - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Coach IA Hugo development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Docker and Node.js are available"

# Copy environment files
echo "📝 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
fi

if [ ! -f packages/backend/.env ]; then
    cp packages/backend/.env.example packages/backend/.env
    echo "✅ Created backend .env file"
fi

# Install dependencies
echo "📦 Installing dependencies..."

# Try to install with clean cache first
npm ci --prefer-offline 2>/dev/null || {
    echo "🧹 Cleaning npm cache and node_modules..."
    rm -rf node_modules package-lock.json
    rm -rf packages/*/node_modules
    npm cache clean --force

    echo "📦 Installing dependencies (attempt 1/3)..."
    npm install || {
        echo "⚠️  Standard installation failed, trying with legacy peer deps..."
        npm install --legacy-peer-deps || {
            echo "⚠️  Legacy peer deps failed, trying with force flag..."
            npm install --force || {
                echo "❌ All installation attempts failed. Please check the error messages above."
                echo "💡 You can try running: npm install --legacy-peer-deps manually"
                exit 1
            }
        }
    }
}

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U coach_user -d coach_ia_hugo_dev; do sleep 2; done'
timeout 60 bash -c 'until docker-compose exec redis redis-cli ping; do sleep 2; done'

echo "✅ Docker services are ready"

# Build shared package
echo "🔨 Building shared package..."
npm run build --workspace=@coach-ia-hugo/shared

# Setup git hooks
echo "🪝 Setting up git hooks..."
npm run prepare

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env files with your API keys"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Visit http://localhost:3000 for frontend"
echo "4. Visit http://localhost:4000 for backend API"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start all development servers"
echo "  npm run build        - Build all packages"
echo "  npm run lint         - Lint all packages"
echo "  npm run type-check   - Type check all packages"
echo "  npm run format       - Format all code"