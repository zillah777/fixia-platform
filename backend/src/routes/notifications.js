const express = require('express');
const notificationsController = require('../controllers/notificationsController');
const { authMiddleware } = require('../middleware/auth');
const { notificationValidation } = require('../utils/validation');
const { sensitiveLimiter } = require('../middleware/security');

const router = express.Router();

// GET /api/notifications - Get user's notifications
router.get('/', authMiddleware, notificationsController.getNotifications);

// GET /api/notifications/:id - Get notification details
router.get('/:id', authMiddleware, notificationsController.getNotificationById);

// POST /api/notifications - Create notification (internal use)
router.post('/', authMiddleware, sensitiveLimiter, notificationValidation, notificationsController.createNotification);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authMiddleware, notificationsController.markNotificationAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authMiddleware, notificationsController.markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authMiddleware, notificationsController.deleteNotification);

// DELETE /api/notifications/clear-all - Clear all notifications
router.delete('/clear-all', authMiddleware, notificationsController.clearAllNotifications);

// GET /api/notifications/unread-count - Get unread notifications count
router.get('/unread-count', authMiddleware, notificationsController.getUnreadCount);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', authMiddleware, notificationsController.getNotificationStats);

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', authMiddleware, notificationsController.getNotificationPreferences);

// PUT /api/notifications/preferences - Update notification preferences
router.put('/preferences', authMiddleware, notificationsController.updateNotificationPreferences);

module.exports = router;