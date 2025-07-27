const supabase = require('../config/database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('Initializing Supabase database...');
    
    // Note: In Supabase, you typically create tables through the dashboard or SQL editor
    // This script will check if tables exist and create test data
    
    console.log('Checking if users table exists...');
    
    // Try to query the users table to see if it exists
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('Users table does not exist. Please create it in Supabase dashboard with the following structure:');
      console.log(`
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  last_login TIMESTAMPTZ,
  registration_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email);
      `);
      
      console.log('Also create the sessions table:');
      console.log(`
CREATE TABLE sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

-- Create index on expire for cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions (expire);
      `);
      
      throw new Error('Please create the required tables in Supabase dashboard first');
    }
    
    console.log('Users table exists!');
    
    // Check if sessions table exists
    const { data: sessionsCheck, error: sessionsError } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);
    
    if (sessionsError && sessionsError.code === 'PGRST116') {
      console.log('Sessions table does not exist. Please create it in Supabase dashboard.');
      throw new Error('Please create the sessions table in Supabase dashboard');
    }
    
    console.log('Sessions table exists!');

    // Create a test user if it doesn't exist
    const testEmail = 'test@example.com';
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            name: 'Test User',
            email: testEmail,
            password: hashedPassword,
            status: 'active'
          }
        ])
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      console.log('Test user created:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      console.log('Test user already exists:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }

    console.log('Supabase database initialized successfully!');
    console.log('Tables verified:');
    console.log('- users (with unique index on email)');
    console.log('- sessions (for session management)');
    
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