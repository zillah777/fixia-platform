const express = require('express');
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');
const { messageValidation } = require('../utils/validation');
const { chatLimiter } = require('../middleware/security');

const router = express.Router();

// GET /api/chats - Get user's chats
router.get('/', authMiddleware, chatController.getChats);

// GET /api/chats/:id - Get chat details
router.get('/:id', authMiddleware, chatController.getChatById);

// POST /api/chats - Create new chat
router.post('/', authMiddleware, chatController.createChat);

// GET /api/chats/:id/messages - Get chat messages
router.get('/:id/messages', authMiddleware, chatController.getChatMessages);

// POST /api/chats/:id/messages - Send message
router.post('/:id/messages', authMiddleware, chatLimiter, messageValidation, chatController.sendMessage);

// PUT /api/chats/:id/read - Mark messages as read
router.put('/:id/read', authMiddleware, chatController.markMessagesAsRead);

// DELETE /api/chats/:id - Delete chat
router.delete('/:id', authMiddleware, chatController.deleteChat);

// GET /api/chats/unread-count - Get unread message count
router.get('/unread-count', authMiddleware, chatController.getUnreadCount);

module.exports = router;