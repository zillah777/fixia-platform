const express = require('express');
const authController = require('../controllers/authController');
const testController = require('../../test-controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Inline handler working',
    timestamp: new Date().toISOString()
  });
});

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me
router.get('/me', authMiddleware, authController.getCurrentUser);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// PUT /api/auth/profile
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;