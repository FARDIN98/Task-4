const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create users table with unique index on email
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
        last_login TIMESTAMP,
        registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create unique index on email (as required)
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique 
      ON users (email);
    `);

    // Create sessions table for express-session
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire 
      ON session (expire);
    `);

    // Create a test user if it doesn't exist
    const testEmail = 'test@example.com';
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [testEmail]);
    
    if (existingUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, status) VALUES ($1, $2, $3, $4)',
        ['Test User', testEmail, hashedPassword, 'active']
      );
      console.log('Test user created:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      console.log('Test user already exists:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }

    console.log('Database initialized successfully!');
    console.log('Tables created:');
    console.log('- users (with unique index on email)');
    console.log('- session (for session management)');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;