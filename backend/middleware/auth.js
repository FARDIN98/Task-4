const User = require('../models/User');


const requireAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        redirect: '/login'
      });
    }

    
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ 
        error: 'User not found',
        redirect: '/login'
      });
    }

    if (user.status === 'blocked') {
      req.session.destroy();
      return res.status(403).json({ 
        error: 'Account is blocked',
        redirect: '/login'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const redirectIfAuthenticated = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user && user.status === 'active') {
        return res.status(200).json({ 
          message: 'Already authenticated',
          redirect: '/dashboard'
        });
      } else {
        
        req.session.destroy();
      }
    }
    next();
  } catch (error) {
    console.error('Redirect middleware error:', error);
    next();
  }
};

module.exports = {
  requireAuth,
  redirectIfAuthenticated
};