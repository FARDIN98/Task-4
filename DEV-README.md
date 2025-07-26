# 🚀 Local Development Setup

This guide will help you run the project in development mode on your local machine with local PostgreSQL.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm
- PostgreSQL (local installation)

## 🔧 Quick Start

### 1. Setup PostgreSQL Database
```bash
# Automatic PostgreSQL setup (recommended)
./setup-postgres.sh
```

**Manual PostgreSQL Setup (if needed):**
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb user_management

# Setup tables
psql -d user_management -f local-db-setup.sql
```

### 2. Install Dependencies & Start Servers
```bash
# Install dependencies and get setup instructions
./start-dev.sh

# Start backend (Terminal 1)
./run-backend.sh

# Start frontend (Terminal 2)
./run-frontend.sh
```

## 🌐 Development URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3002
- **API**: http://localhost:3002/api

## 🔑 Test Credentials

Use these credentials to test the application:
- **Email**: fardin@example.com
- **Password**: 123456

## 📁 Project Structure

```
Task-4/
├── backend/              # Express.js API server
│   ├── .env             # Environment variables (local PostgreSQL)
│   ├── server.js        # Main server file
│   ├── config/          # Database configuration
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   └── middleware/      # Custom middleware
├── frontend/            # React + TypeScript frontend
│   ├── .env            # Environment variables (local API)
│   ├── src/            # Source code
│   └── public/         # Static assets
├── local-db-setup.sql  # PostgreSQL database setup
├── setup-postgres.sh   # PostgreSQL installation & setup script
├── start-dev.sh        # Development setup script
├── run-backend.sh      # Backend startup script
└── run-frontend.sh     # Frontend startup script
```

## 🛠️ Development Features

- ✅ Hot reload for both frontend and backend
- ✅ Session-based authentication
- ✅ Cookie persistence
- ✅ CORS configured for local development
- ✅ Local PostgreSQL database
- ✅ User management system
- ✅ Responsive UI with Tailwind CSS

## 🗄️ Database Information

- **Host**: localhost
- **Port**: 5432
- **Database**: user_management
- **User**: Your system user
- **Password**: (empty for local development)

## 🐛 Troubleshooting

### PostgreSQL Issues
- **Database connection failed**: Run `./setup-postgres.sh`
- **PostgreSQL not running**: `brew services start postgresql` (macOS)
- **Database doesn't exist**: `createdb user_management`
- **Tables missing**: `psql -d user_management -f local-db-setup.sql`

### Backend Issues
- Check if port 3002 is available
- Verify PostgreSQL is running: `pg_isready`
- Check backend logs for database connection errors

### Frontend Issues
- Check if port 5173 is available
- Verify API URL in `frontend/.env`
- Clear browser cache and cookies

### Session Issues
- Clear browser cookies
- Restart both servers
- Check PostgreSQL connection

## 📝 Notes

- The project uses local PostgreSQL instead of cloud databases
- All Neon and Render configurations have been removed
- Session data persists in local PostgreSQL
- Configured for development with `secure: false` cookies
- CORS configured only for localhost origins