#!/bin/bash

echo "🚀 Starting Development Environment..."
echo "=================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies if needed
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Install frontend dependencies if needed
echo "📦 Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "🎯 Development Environment Ready!"
echo "=================================="
echo ""
echo "To start development:"
echo "1. Backend:  cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or run both in separate terminals:"
echo "Terminal 1: ./run-backend.sh"
echo "Terminal 2: ./run-frontend.sh"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:5173"
echo "- Backend:  http://localhost:3002"
echo "- API:      http://localhost:3002/api"