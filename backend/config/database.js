const { Pool } = require('pg');
require('dotenv').config();

// Local PostgreSQL configuration only
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'user_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to local PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  console.log('Make sure PostgreSQL is running and database exists');
});

module.exports = pool;