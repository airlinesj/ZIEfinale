#!/bin/bash

# ZIE Membership Portal - Setup Script
# This script sets up both backend and frontend

set -e

echo "================================"
echo "ZIE Membership Portal Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Setup Backend
echo ""
echo "================================"
echo "Setting up Backend..."
echo "================================"

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed."
fi

# Copy .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your configuration:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - SMTP settings"
    echo "   - EXCHANGE_RATE"
fi

# Return to root
cd ..

# Setup Frontend
echo ""
echo "================================"
echo "Setting up Frontend..."
echo "================================"

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed."
fi

# Return to root
cd ..

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your settings"
echo "2. Start MongoDB service"
echo "3. Run backend: cd backend && npm run dev"
echo "4. In another terminal, run frontend: cd frontend && ng serve"
echo "5. Visit http://localhost:4200 in your browser"
echo ""
echo "For more details, see README.md"
