const express = require('express');
const User = require('../models/User');
const { redirectIfAuthenticated } = require('../middleware/auth');
const { sendSuccess, sendValidationError, sendUnauthorized, sendForbidden, sendConflict, sendError } = require('../utils/responses');
const { validateRequired, validatePassword } = require('../utils/validation');

const router = express.Router();

// Helper function to format user data
const formatUserData = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status
});

// Register
router.post('/register', redirectIfAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    const missingFields = validateRequired(['name', 'email', 'password'], req.body);
    if (missingFields) {
      return sendValidationError(res, missingFields);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return sendValidationError(res, passwordError);
    }

    // Create user
    const user = await User.create({ name, email, password });
    
    return sendSuccess(res, { user: formatUserData(user) }, 'Registration successful', 201);

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'Email already exists') {
      return sendConflict(res, 'Email already exists');
    }
    
    return sendError(res, 'Registration failed');
  }
});

// Login
router.post('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    const missingFields = validateRequired(['email', 'password'], req.body);
    if (missingFields) {
      return sendValidationError(res, missingFields);
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return sendForbidden(res, 'Account is blocked');
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Create session
    req.session.userId = user.id;
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return sendError(res, 'Session creation failed');
      }
      
      // Update last login
      User.updateLastLogin(user.id).catch(console.error);
      
      return sendSuccess(res, { 
        user: formatUserData(user),
        sessionId: req.sessionID 
      }, 'Login successful');
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return sendError(res, 'Logout failed');
    }
    return sendSuccess(res, null, 'Logout successful');
  });
});

// Check auth status
router.get('/check', async (req, res) => {
  try {
    if (!req.session.userId) {
      return sendUnauthorized(res, 'Not authenticated');
    }

    const user = await User.findById(req.session.userId);
    if (!user || user.status === 'blocked') {
      req.session.destroy();
      return sendUnauthorized(res, 'Invalid session');
    }

    return sendSuccess(res, { user: formatUserData(user) });
  } catch (error) {
    console.error('Auth check error:', error);
    return sendError(res, 'Internal server error');
  }
});

module.exports = router;