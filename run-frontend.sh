#!/bin/bash

echo "🎨 Starting Frontend Server..."
echo "=============================="

cd frontend

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in frontend directory"
    echo "Please make sure .env file exists with proper configuration"
    exit 1
fi

echo "✅ Environment file found"
echo "🚀 Starting frontend on http://localhost:5173"
echo ""

# Start the frontend server
npm run dev