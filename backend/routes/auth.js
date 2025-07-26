const express = require('express');
const User = require('../models/User');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', redirectIfAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    if (password.length < 1) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 1 character' 
      });
    }

    // Create user
    const user = await User.create({ name, email, password });
    
    // Don't auto login after registration
    // User should login manually after registration

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'Email already exists') {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login
router.post('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, error: 'Account is blocked' });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Create session and save explicitly
    req.session.userId = user.id;
    
    console.log('Login - Setting session userId:', user.id);
    console.log('Login - Session before save:', req.session);
    
    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, error: 'Session creation failed' });
      }
      
      console.log('Login - Session saved successfully');
      console.log('Login - Session after save:', req.session);
      
      // Update last login after session is saved
      User.updateLastLogin(user.id).then(() => {
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status
          },
          sessionId: req.sessionID
        });
      }).catch((updateError) => {
        console.error('Last login update error:', updateError);
        // Still return success since login worked
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status
          },
          sessionId: req.sessionID
        });
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Check auth status
router.get('/check', async (req, res) => {
  try {
    console.log('Auth check - Session:', req.session);
    console.log('Auth check - Session ID:', req.sessionID);
    console.log('Auth check - User ID from session:', req.session?.userId);
    
    if (!req.session.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const user = await User.findById(req.session.userId);
    if (!user || user.status === 'blocked') {
      req.session.destroy();
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;