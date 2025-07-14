const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// GET /api/explorer-chat/connections - Get Explorer's active chat connections
router.get('/connections', authMiddleware, async (req, res) => {
  try {
    const [connections] = await pool.execute(`
      SELECT eac.*, u.first_name as as_name, u.last_name as as_last_name,
             u.profile_image as as_profile_image, u.verification_status,
             esr.title as service_title, c.name as category_name,
             (SELECT COUNT(*) FROM chat_messages cm WHERE cm.chat_room_id = eac.chat_room_id AND cm.sender_id != ? AND cm.is_read = FALSE) as unread_messages,
             (SELECT message FROM chat_messages cm WHERE cm.chat_room_id = eac.chat_room_id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM chat_messages cm WHERE cm.chat_room_id = eac.chat_room_id ORDER BY cm.created_at DESC LIMIT 1) as last_message_time
      FROM explorer_as_connections eac
      INNER JOIN users u ON eac.as_id = u.id
      LEFT JOIN explorer_service_requests esr ON eac.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE eac.explorer_id = ? AND eac.status IN ('active', 'service_in_progress')
      ORDER BY last_message_time DESC NULLS LAST, eac.created_at DESC
    `, [req.user.id, req.user.id]);

    res.json(formatResponse(connections, 'Conexiones de chat obtenidas exitosamente'));
  } catch (error) {
    console.error('Get chat connections error:', error);
    res.status(500).json(formatError('Error al obtener conexiones de chat'));
  }
});

// GET /api/explorer-chat/:chatRoomId/messages - Get chat messages
router.get('/:chatRoomId/messages', authMiddleware, async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user has access to this chat room
    const [accessCheck] = await pool.execute(`
      SELECT id FROM explorer_as_connections 
      WHERE chat_room_id = ? AND (explorer_id = ? OR as_id = ?)
    `, [chatRoomId, req.user.id, req.user.id]);

    if (accessCheck.length === 0) {
      return res.status(403).json(formatError('No tienes acceso a este chat'));
    }

    const [messages] = await pool.execute(`
      SELECT cm.*, u.first_name, u.last_name, u.profile_image
      FROM chat_messages cm
      INNER JOIN users u ON cm.sender_id = u.id
      WHERE cm.chat_room_id = ?
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?
    `, [chatRoomId, parseInt(limit), parseInt(offset)]);

    // Mark messages as read for current user
    await pool.execute(`
      UPDATE chat_messages 
      SET is_read = TRUE 
      WHERE chat_room_id = ? AND sender_id != ? AND is_read = FALSE
    `, [chatRoomId, req.user.id]);

    res.json(formatResponse(messages.reverse(), 'Mensajes obtenidos exitosamente'));
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json(formatError('Error al obtener mensajes'));
  }
});

// POST /api/explorer-chat/:chatRoomId/message - Send chat message
router.post('/:chatRoomId/message', authMiddleware, async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { message, message_type = 'text' } = req.body;

    if (!message) {
      return res.status(400).json(formatError('Mensaje es requerido'));
    }

    // Verify user has access to this chat room
    const [accessCheck] = await pool.execute(`
      SELECT eac.*, 
             CASE WHEN eac.explorer_id = ? THEN eac.as_id ELSE eac.explorer_id END as recipient_id
      FROM explorer_as_connections eac
      WHERE eac.chat_room_id = ? AND (eac.explorer_id = ? OR eac.as_id = ?)
    `, [req.user.id, chatRoomId, req.user.id, req.user.id]);

    if (accessCheck.length === 0) {
      return res.status(403).json(formatError('No tienes acceso a este chat'));
    }

    const connection = accessCheck[0];

    // Insert message
    const [result] = await pool.execute(`
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type)
      VALUES (?, ?, ?, ?)
    `, [chatRoomId, req.user.id, message, message_type]);

    // Get complete message data
    const [messageData] = await pool.execute(`
      SELECT cm.*, u.first_name, u.last_name, u.profile_image
      FROM chat_messages cm
      INNER JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = ?
    `, [result.insertId]);

    // Send real-time notification via Socket.IO
    if (req.io) {
      req.io.to(`user_${connection.recipient_id}`).emit('new_chat_message', {
        chat_room_id: chatRoomId,
        message: messageData[0],
        sender_name: `${req.user.first_name} ${req.user.last_name}`
      });
    }

    res.json(formatResponse(messageData[0], 'Mensaje enviado exitosamente'));
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json(formatError('Error al enviar mensaje'));
  }
});

// @DEPRECATED: Use /api/mutual-confirmation/confirm-completion/:connectionId instead
// POST /api/explorer-chat/service-completed/:connectionId - Mark service as completed (DEPRECATED)
// 
// ⚠️  WARNING: This endpoint is deprecated and will be removed in a future version.
// This endpoint does not implement mutual confirmation - only one party can mark as completed.
// Use the mutual confirmation system instead to ensure both parties agree the service was successful.
//
// New endpoint: POST /api/mutual-confirmation/confirm-completion/:connectionId
// This requires BOTH parties to confirm before creating review obligations.
router.post('/service-completed/:connectionId', authMiddleware, async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Verify connection exists and user has access
    const [connections] = await pool.execute(`
      SELECT * FROM explorer_as_connections 
      WHERE id = ? AND (explorer_id = ? OR as_id = ?) AND status = 'service_in_progress'
    `, [connectionId, req.user.id, req.user.id]);

    if (connections.length === 0) {
      return res.status(404).json(formatError('Conexión no encontrada o no válida'));
    }

    const connection = connections[0];

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Update connection status
      await pool.execute(`
        UPDATE explorer_as_connections 
        SET status = 'completed', service_completed_at = NOW()
        WHERE id = ?
      `, [connectionId]);

      // Create review obligation for Explorer if they haven't reviewed yet
      if (req.user.id === connection.explorer_id) {
        const reviewDueDate = new Date();
        reviewDueDate.setDate(reviewDueDate.getDate() + 7); // 7 days to review

        await pool.execute(`
          INSERT INTO explorer_review_obligations (
            explorer_id, connection_id, as_id, service_completed_at, 
            review_due_date, is_blocking_new_services
          )
          VALUES (?, ?, ?, NOW(), ?, TRUE)
          ON DUPLICATE KEY UPDATE 
            service_completed_at = NOW(),
            review_due_date = VALUES(review_due_date),
            is_blocking_new_services = TRUE
        `, [connection.explorer_id, connectionId, connection.as_id, reviewDueDate]);
      }

      await pool.execute('COMMIT');

      // Notify other party via Socket.IO
      const otherUserId = req.user.id === connection.explorer_id ? connection.as_id : connection.explorer_id;
      if (req.io) {
        req.io.to(`user_${otherUserId}`).emit('service_completed', {
          connection_id: connectionId,
          completed_by: req.user.id,
          message: 'El servicio ha sido marcado como completado'
        });
      }

      res.json(formatResponse(null, 'Servicio marcado como completado exitosamente'));

    } catch (transactionError) {
      await pool.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Mark service completed error:', error);
    res.status(500).json(formatError('Error al marcar servicio como completado'));
  }
});

// GET /api/explorer-chat/connection/:connectionId - Get connection details
router.get('/connection/:connectionId', authMiddleware, async (req, res) => {
  try {
    const { connectionId } = req.params;

    const [connections] = await pool.execute(`
      SELECT eac.*, 
             eu.first_name as explorer_name, eu.last_name as explorer_last_name,
             eu.profile_image as explorer_profile_image,
             au.first_name as as_name, au.last_name as as_last_name,
             au.profile_image as as_profile_image, au.verification_status,
             esr.title as service_title, esr.description as service_description,
             c.name as category_name, c.icon as category_icon
      FROM explorer_as_connections eac
      INNER JOIN users eu ON eac.explorer_id = eu.id
      INNER JOIN users au ON eac.as_id = au.id
      LEFT JOIN explorer_service_requests esr ON eac.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE eac.id = ? AND (eac.explorer_id = ? OR eac.as_id = ?)
    `, [connectionId, req.user.id, req.user.id]);

    if (connections.length === 0) {
      return res.status(404).json(formatError('Conexión no encontrada'));
    }

    res.json(formatResponse(connections[0], 'Detalles de conexión obtenidos exitosamente'));
  } catch (error) {
    console.error('Get connection details error:', error);
    res.status(500).json(formatError('Error al obtener detalles de conexión'));
  }
});

module.exports = router;