const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (protected route)
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users' 
    });
  }
});

// Block users (bulk operation)
router.post('/block', requireAuth, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'User IDs are required' 
      });
    }

    const blockedUsers = await User.blockUsers(userIds);
    
    // If current user blocked themselves, destroy session
    if (userIds.includes(req.user.id)) {
      req.session.destroy();
      return res.json({ 
        success: true,
        message: `${blockedUsers.length} user(s) blocked successfully`,
        data: blockedUsers,
        selfBlocked: true
      });
    }

    res.json({ 
      success: true,
      message: `${blockedUsers.length} user(s) blocked successfully`,
      data: blockedUsers
    });

  } catch (error) {
    console.error('Block users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to block users' 
    });
  }
});

// Delete users (bulk operation)
router.post('/delete', requireAuth, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'User IDs are required' 
      });
    }

    const deletedUsers = await User.deleteUsers(userIds);
    
    // If current user deleted themselves, destroy session
    if (userIds.includes(req.user.id)) {
      req.session.destroy();
      return res.json({ 
        success: true,
        message: `${deletedUsers.length} user(s) deleted successfully`,
        data: deletedUsers,
        selfDeleted: true
      });
    }

    res.json({ 
      success: true,
      message: `${deletedUsers.length} user(s) deleted successfully`,
      data: deletedUsers
    });

  } catch (error) {
    console.error('Delete users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete users' 
    });
  }
});

// Unblock users (bulk operation)
router.post('/unblock', requireAuth, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'User IDs are required' 
      });
    }

    const unblockedUsers = [];
    for (const userId of userIds) {
      const user = await User.updateStatus(userId, 'active');
      if (user) {
        unblockedUsers.push(user);
      }
    }

    res.json({ 
      success: true,
      message: `${unblockedUsers.length} user(s) unblocked successfully`,
      data: unblockedUsers
    });

  } catch (error) {
    console.error('Unblock users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to unblock users' 
    });
  }
});

module.exports = router;