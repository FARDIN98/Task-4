const User = require('../models/User');
const { sendUnauthorized, sendForbidden, sendError, sendSuccess } = require('../utils/responses');

// Helper function to destroy session and send unauthorized response
const destroySessionAndUnauthorize = (req, res, message = 'Authentication required') => {
  req.session.destroy();
  return sendUnauthorized(res, message, { redirect: '/login' });
};

const requireAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return sendUnauthorized(res, 'Authentication required', { redirect: '/login' });
    }

    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return destroySessionAndUnauthorize(req, res, 'User not found');
    }

    if (user.status === 'blocked') {
      req.session.destroy();
      return sendForbidden(res, 'Account is blocked', { redirect: '/login' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 'Internal server error');
  }
};

const redirectIfAuthenticated = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user && user.status === 'active') {
        return sendSuccess(res, null, 'Already authenticated', 200, { redirect: '/dashboard' });
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