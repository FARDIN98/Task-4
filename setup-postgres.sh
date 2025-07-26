#!/bin/bash

echo "🐘 PostgreSQL Local Setup"
echo "========================="

# Function to check if PostgreSQL is installed
check_postgres() {
    if command -v psql >/dev/null 2>&1; then
        echo "✅ PostgreSQL is installed"
        return 0
    else
        echo "❌ PostgreSQL is not installed"
        return 1
    fi
}

# Function to check if PostgreSQL service is running
check_postgres_running() {
    if pg_isready >/dev/null 2>&1; then
        echo "✅ PostgreSQL service is running"
        return 0
    else
        echo "❌ PostgreSQL service is not running"
        return 1
    fi
}

# Check PostgreSQL installation
if ! check_postgres; then
    echo ""
    echo "📥 Installing PostgreSQL..."
    echo "Please install PostgreSQL first:"
    echo ""
    echo "macOS (Homebrew):"
    echo "  brew install postgresql"
    echo "  brew services start postgresql"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo "  sudo systemctl start postgresql"
    echo ""
    echo "Windows:"
    echo "  Download from: https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
fi

# Check if PostgreSQL is running
if ! check_postgres_running; then
    echo ""
    echo "🚀 Starting PostgreSQL service..."
    
    # Try to start PostgreSQL (macOS with Homebrew)
    if command -v brew >/dev/null 2>&1; then
        echo "Starting PostgreSQL with Homebrew..."
        brew services start postgresql
        sleep 3
        
        if check_postgres_running; then
            echo "✅ PostgreSQL started successfully"
        else
            echo "❌ Failed to start PostgreSQL with Homebrew"
            echo "Please start PostgreSQL manually:"
            echo "  brew services start postgresql"
            exit 1
        fi
    else
        echo "❌ Please start PostgreSQL service manually"
        echo ""
        echo "macOS: brew services start postgresql"
        echo "Linux: sudo systemctl start postgresql"
        echo "Windows: Start PostgreSQL service from Services"
        exit 1
    fi
fi

echo ""
echo "🗄️ Setting up database..."

# Create database and user
echo "Creating database and user..."

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw user_management; then
    echo "✅ Database 'user_management' already exists"
else
    echo "📝 Creating database 'user_management'..."
    createdb user_management
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Failed to create database"
        echo "You may need to run: createdb user_management"
        exit 1
    fi
fi

# Run SQL setup script
echo "📝 Setting up tables and sample data..."
if [ -f "local-db-setup.sql" ]; then
    psql -d user_management -f local-db-setup.sql
    if [ $? -eq 0 ]; then
        echo "✅ Database setup completed successfully"
    else
        echo "❌ Failed to setup database tables"
        exit 1
    fi
else
    echo "❌ local-db-setup.sql file not found"
    exit 1
fi

echo ""
echo "🎉 PostgreSQL setup completed!"
echo "================================"
echo ""
echo "Database Details:"
echo "- Host: localhost"
echo "- Port: 5432"
echo "- Database: user_management"
echo "- User: $USER (current user)"
echo ""
echo "Test Credentials:"
echo "- Email: fardin@example.com"
echo "- Password: 123456"
echo ""
echo "You can now start the backend server:"
echo "  ./run-backend.sh"