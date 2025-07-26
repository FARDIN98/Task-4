const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS configuration - Local development only
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

// CORS configuration for local development
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Session configuration - Optimized for development
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

console.log('Session Configuration:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- Is Production:', isProduction);
console.log('- Is Development:', isDevelopment);
console.log('- Secure cookies:', false); // Always false for development
console.log('- SameSite:', 'lax');

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-12345',
  resave: false,
  saveUninitialized: true,
  name: 'connect.sid',
  cookie: {
    secure: false, // Always false for development
    httpOnly: false, // Allow JavaScript access for debugging
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Best for development
    domain: undefined
  }
}));

// Debug middleware to log session and cookies
app.use((req, res, next) => {
  console.log('=== Request Debug ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Origin:', req.headers.origin);
  console.log('Cookie header:', req.headers.cookie);
  console.log('Session ID:', req.sessionID);
  console.log('Session userId:', req.session?.userId);
  console.log('Session data:', req.session);
  console.log('Is Production:', isProduction);
  
  // Log response headers after they're set
  const originalSend = res.send;
  res.send = function(data) {
    console.log('=== Response Debug ===');
    console.log('Set-Cookie header:', res.getHeaders()['set-cookie']);
    console.log('Response status:', res.statusCode);
    console.log('====================');
    originalSend.call(this, data);
  };
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Test endpoint for debugging sessions
app.get('/api/test-session', (req, res) => {
  // Set a test value in session
  if (!req.session.testValue) {
    req.session.testValue = 'Session is working!';
  }
  
  res.json({
    message: 'Session test endpoint',
    sessionId: req.sessionID,
    testValue: req.session.testValue,
    userId: req.session.userId,
    cookies: req.headers.cookie,
    isProduction: isProduction,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET',
      FRONTEND_URL: process.env.FRONTEND_URL
    },
    session: {
      sessionID: req.sessionID,
      userId: req.session.userId,
      sessionData: req.session
    },
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Health check with database test
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW() as current_time');
    
    res.json({ 
      status: 'OK', 
      message: 'User Management API is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      db_time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;