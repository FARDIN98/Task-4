#!/bin/bash

echo "🔧 Starting Backend Server..."
echo "============================="

cd backend

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in backend directory"
    echo "Please make sure .env file exists with proper configuration"
    exit 1
fi

echo "✅ Environment file found"
echo "🚀 Starting backend on http://localhost:3002"
echo ""

# Start the backend server
npm run dev