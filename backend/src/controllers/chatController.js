const { query } = require('../config/database');

// GET /api/chats
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const chatsQuery = `
      SELECT 
        c.id,
        c.customer_id,
        c.provider_id,
        c.booking_id,
        c.created_at,
        c.updated_at,
        CASE 
          WHEN c.customer_id = $1 THEN up.first_name
          ELSE uc.first_name
        END as other_user_first_name,
        CASE 
          WHEN c.customer_id = $1 THEN up.last_name
          ELSE uc.last_name
        END as other_user_last_name,
        CASE 
          WHEN c.customer_id = $1 THEN up.profile_photo_url
          ELSE uc.profile_photo_url
        END as other_user_photo,
        s.title as service_title,
        last_msg.content as last_message,
        last_msg.created_at as last_message_time,
        COALESCE(unread_count.count, 0) as unread_count
      FROM chats c
      JOIN users uc ON c.customer_id = uc.id
      JOIN users up ON c.provider_id = up.id
      LEFT JOIN services s ON c.booking_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM bookings b WHERE b.id = c.booking_id AND b.service_id = s.id
      )
      LEFT JOIN (
        SELECT DISTINCT ON (chat_id) 
          chat_id, content, created_at, sender_id
        FROM messages 
        ORDER BY chat_id, created_at DESC
      ) last_msg ON c.id = last_msg.chat_id
      LEFT JOIN (
        SELECT 
          chat_id, 
          COUNT(*) as count
        FROM messages 
        WHERE is_read = false AND sender_id != $1
        GROUP BY chat_id
      ) unread_count ON c.id = unread_count.chat_id
      WHERE c.customer_id = $1 OR c.provider_id = $1
      ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(chatsQuery, [userId, parseInt(limit), offset]);

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM chats c
      WHERE c.customer_id = $1 OR c.provider_id = $1
    `, [userId]);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Chats obtenidos exitosamente',
      data: {
        chats: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/chats/:id
exports.getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has access to this chat
    const chatResult = await query(`
      SELECT 
        c.id,
        c.customer_id,
        c.provider_id,
        c.booking_id,
        c.created_at,
        c.updated_at,
        CASE 
          WHEN c.customer_id = $2 THEN up.first_name
          ELSE uc.first_name
        END as other_user_first_name,
        CASE 
          WHEN c.customer_id = $2 THEN up.last_name
          ELSE uc.last_name
        END as other_user_last_name,
        CASE 
          WHEN c.customer_id = $2 THEN up.profile_photo_url
          ELSE uc.profile_photo_url
        END as other_user_photo,
        s.title as service_title
      FROM chats c
      JOIN users uc ON c.customer_id = uc.id
      JOIN users up ON c.provider_id = up.id
      LEFT JOIN services s ON c.booking_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM bookings b WHERE b.id = c.booking_id AND b.service_id = s.id
      )
      WHERE c.id = $1 AND (c.customer_id = $2 OR c.provider_id = $2)
    `, [id, userId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Chat obtenido exitosamente',
      data: chatResult.rows[0]
    });

  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/chats
exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customer_id, provider_id, booking_id } = req.body;

    // Validation
    if (!customer_id || !provider_id) {
      return res.status(400).json({
        success: false,
        error: 'El ID del cliente y del proveedor son requeridos'
      });
    }

    // Check if user is involved in this chat
    if (userId !== customer_id && userId !== provider_id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para crear este chat'
      });
    }

    // Check if chat already exists
    const existingChatResult = await query(`
      SELECT id FROM chats 
      WHERE customer_id = $1 AND provider_id = $2 AND (booking_id = $3 OR (booking_id IS NULL AND $3 IS NULL))
    `, [customer_id, provider_id, booking_id]);

    if (existingChatResult.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Chat ya existe',
        data: { id: existingChatResult.rows[0].id }
      });
    }

    // Verify users exist
    const usersResult = await query(`
      SELECT id, user_type FROM users 
      WHERE id IN ($1, $2) AND is_active = true
    `, [customer_id, provider_id]);

    if (usersResult.rows.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Usuarios no encontrados'
      });
    }

    // Verify user types
    const customer = usersResult.rows.find(u => u.id == customer_id);
    const provider = usersResult.rows.find(u => u.id == provider_id);

    if (!customer || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Usuarios no válidos'
      });
    }

    // If booking_id is provided, verify it exists and involves these users
    if (booking_id) {
      const bookingResult = await query(`
        SELECT id FROM bookings 
        WHERE id = $1 AND customer_id = $2 AND provider_id = $3
      `, [booking_id, customer_id, provider_id]);

      if (bookingResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Reserva no encontrada'
        });
      }
    }

    // Create chat
    const result = await query(`
      INSERT INTO chats (customer_id, provider_id, booking_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [customer_id, provider_id, booking_id]);

    res.status(201).json({
      success: true,
      message: 'Chat creado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/chats/:id/messages
exports.getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Check if user has access to this chat
    const chatResult = await query(`
      SELECT id FROM chats 
      WHERE id = $1 AND (customer_id = $2 OR provider_id = $2)
    `, [id, userId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat no encontrado'
      });
    }

    const offset = (page - 1) * limit;

    const messagesQuery = `
      SELECT 
        m.id,
        m.chat_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.is_read,
        m.created_at,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.profile_photo_url as sender_photo
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(messagesQuery, [id, parseInt(limit), offset]);

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM messages
      WHERE chat_id = $1
    `, [id]);

    const total = parseInt(countResult.rows[0].total);

    // Mark messages as read for the current user
    await query(`
      UPDATE messages 
      SET is_read = true 
      WHERE chat_id = $1 AND sender_id != $2 AND is_read = false
    `, [id, userId]);

    res.json({
      success: true,
      message: 'Mensajes obtenidos exitosamente',
      data: {
        messages: result.rows.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/chats/:id/messages
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, message_type = 'text' } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'El contenido del mensaje es requerido'
      });
    }

    if (!['text', 'image'].includes(message_type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de mensaje inválido'
      });
    }

    // Check if user has access to this chat
    const chatResult = await query(`
      SELECT customer_id, provider_id FROM chats 
      WHERE id = $1 AND (customer_id = $2 OR provider_id = $2)
    `, [id, userId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat no encontrado'
      });
    }

    const chat = chatResult.rows[0];

    // Create message
    const result = await query(`
      INSERT INTO messages (chat_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [id, userId, content, message_type]);

    const message = result.rows[0];

    // Update chat's updated_at timestamp
    await query(`
      UPDATE chats 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);

    // Create notification for the other user
    const recipientId = chat.customer_id === userId ? chat.provider_id : chat.customer_id;
    
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      recipientId,
      'Nuevo mensaje',
      `Tienes un nuevo mensaje: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      'chat',
      id
    ]);

    // Get sender info for response
    const senderResult = await query(`
      SELECT first_name, last_name, profile_photo_url
      FROM users 
      WHERE id = $1
    `, [userId]);

    const sender = senderResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: {
        ...message,
        sender_first_name: sender.first_name,
        sender_last_name: sender.last_name,
        sender_photo: sender.profile_photo_url
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/chats/:id/read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has access to this chat
    const chatResult = await query(`
      SELECT id FROM chats 
      WHERE id = $1 AND (customer_id = $2 OR provider_id = $2)
    `, [id, userId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat no encontrado'
      });
    }

    // Mark messages as read
    const result = await query(`
      UPDATE messages 
      SET is_read = true 
      WHERE chat_id = $1 AND sender_id != $2 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `, [id, userId]);

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos',
      data: {
        updated_count: result.rowCount
      }
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// DELETE /api/chats/:id
exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has access to this chat
    const chatResult = await query(`
      SELECT customer_id, provider_id FROM chats 
      WHERE id = $1 AND (customer_id = $2 OR provider_id = $2)
    `, [id, userId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat no encontrado'
      });
    }

    // Delete chat (messages will be deleted by CASCADE)
    await query('DELETE FROM chats WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Chat eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/chats/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT COALESCE(SUM(
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM chats c 
            WHERE c.id = m.chat_id 
            AND (c.customer_id = $1 OR c.provider_id = $1)
          ) THEN 1 
          ELSE 0 
        END
      ), 0) as unread_count
      FROM messages m
      WHERE m.sender_id != $1 AND m.is_read = false
    `, [userId]);

    res.json({
      success: true,
      message: 'Contador de mensajes no leídos obtenido exitosamente',
      data: {
        unread_count: parseInt(result.rows[0].unread_count)
      }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};