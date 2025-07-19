const express = require('express');
const authController = require('../controllers/authController');
const testController = require('../../test-controller');
const { authMiddleware } = require('../middleware/auth');
const { userTypeTransformMiddleware } = require('../middleware/userTypeTransform');

const router = express.Router();

// Apply user type transformation to all routes
router.use(userTypeTransformMiddleware);

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me
router.get('/me', authMiddleware, authController.getCurrentUser);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// PUT /api/auth/profile
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;