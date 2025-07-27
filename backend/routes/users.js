const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { sendSuccess, sendValidationError, sendError } = require('../utils/responses');
const { validateUserIds } = require('../utils/validation');

const router = express.Router();

// Helper function to handle bulk operations with self-action check
const handleBulkOperation = async (req, res, userIds, operation, successMessage) => {
  try {
    const result = await operation(userIds);
    const isSelfAction = userIds.includes(req.user.id);
    
    if (isSelfAction) {
      req.session.destroy();
      return sendSuccess(res, result, successMessage, 200, { selfAction: true });
    }

    return sendSuccess(res, result, successMessage);
  } catch (error) {
    console.error(`Bulk operation error:`, error);
    return sendError(res, 'Operation failed');
  }
};

// Get all users (protected route)
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.findAll();
    return sendSuccess(res, users);
  } catch (error) {
    console.error('Get users error:', error);
    return sendError(res, 'Failed to fetch users');
  }
});

// Block users (bulk operation)
router.post('/block', requireAuth, async (req, res) => {
  const { userIds } = req.body;
  
  const validationError = validateUserIds(userIds);
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  await handleBulkOperation(
    req, 
    res, 
    userIds, 
    User.blockUsers.bind(User), 
    `${userIds.length} user(s) blocked successfully`
  );
});

// Delete users (bulk operation)
router.post('/delete', requireAuth, async (req, res) => {
  const { userIds } = req.body;
  
  const validationError = validateUserIds(userIds);
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  await handleBulkOperation(
    req, 
    res, 
    userIds, 
    User.deleteUsers.bind(User), 
    `${userIds.length} user(s) deleted successfully`
  );
});

// Unblock users (bulk operation)
router.post('/unblock', requireAuth, async (req, res) => {
  const { userIds } = req.body;
  
  const validationError = validateUserIds(userIds);
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  try {
    const unblockedUsers = [];
    for (const userId of userIds) {
      const user = await User.updateStatus(userId, 'active');
      if (user) {
        unblockedUsers.push(user);
      }
    }

    return sendSuccess(res, unblockedUsers, `${unblockedUsers.length} user(s) unblocked successfully`);
  } catch (error) {
    console.error('Unblock users error:', error);
    return sendError(res, 'Failed to unblock users');
  }
});

module.exports = router;