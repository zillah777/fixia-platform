const { query } = require('../config/database');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      type, 
      is_read, 
      page = 1, 
      limit = 20 
    } = req.query;

    let whereConditions = ['user_id = $1'];
    let params = [userId];
    let paramIndex = 2;

    // Build WHERE conditions
    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (is_read !== undefined) {
      whereConditions.push(`is_read = $${paramIndex}`);
      params.push(is_read === 'true');
      paramIndex++;
    }

    // Pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const notificationsQuery = `
      SELECT 
        id,
        user_id,
        title,
        message,
        type,
        related_id,
        is_read,
        read_at,
        created_at
      FROM notifications
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${paramIndex - 1} OFFSET $${paramIndex}
    `;

    const result = await query(notificationsQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      WHERE ${whereConditions.join(' AND ')}
    `;
    
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Notificaciones obtenidas exitosamente',
      data: {
        notifications: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/notifications/:id
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        id,
        user_id,
        title,
        message,
        type,
        related_id,
        is_read,
        read_at,
        created_at
      FROM notifications
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Notificación obtenida exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/notifications/:id/read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(`
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/notifications/read-all
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
    `, [userId]);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      data: {
        updated_count: result.rowCount
      }
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(`
      DELETE FROM notifications 
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// DELETE /api/notifications/clear-all
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      DELETE FROM notifications 
      WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      message: 'Todas las notificaciones eliminadas exitosamente',
      data: {
        deleted_count: result.rowCount
      }
    });

  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `, [userId]);

    res.json({
      success: true,
      message: 'Contador de notificaciones no leídas obtenido exitosamente',
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

// GET /api/notifications/stats
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
        COUNT(CASE WHEN type = 'booking' THEN 1 END) as booking_notifications,
        COUNT(CASE WHEN type = 'payment' THEN 1 END) as payment_notifications,
        COUNT(CASE WHEN type = 'review' THEN 1 END) as review_notifications,
        COUNT(CASE WHEN type = 'chat' THEN 1 END) as chat_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications
      FROM notifications
      WHERE user_id = $1
    `, [userId]);

    const stats = statsResult.rows[0];

    // Get recent notifications
    const recentResult = await query(`
      SELECT 
        id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    res.json({
      success: true,
      message: 'Estadísticas de notificaciones obtenidas exitosamente',
      data: {
        total_notifications: parseInt(stats.total_notifications),
        unread_notifications: parseInt(stats.unread_notifications),
        by_type: {
          booking: parseInt(stats.booking_notifications),
          payment: parseInt(stats.payment_notifications),
          review: parseInt(stats.review_notifications),
          chat: parseInt(stats.chat_notifications),
          system: parseInt(stats.system_notifications)
        },
        recent_notifications: recentResult.rows
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/notifications/preferences
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        email_notifications,
        push_notifications,
        sms_notifications,
        booking_updates,
        payment_updates,
        chat_messages,
        marketing_emails
      FROM notification_preferences
      WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      // Create default preferences if they don't exist
      await query(`
        INSERT INTO notification_preferences (user_id)
        VALUES ($1)
      `, [userId]);

      return res.json({
        success: true,
        message: 'Preferencias de notificaciones obtenidas exitosamente',
        data: {
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          booking_updates: true,
          payment_updates: true,
          chat_messages: true,
          marketing_emails: false
        }
      });
    }

    res.json({
      success: true,
      message: 'Preferencias de notificaciones obtenidas exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/notifications/preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const allowedFields = [
      'email_notifications',
      'push_notifications', 
      'sms_notifications',
      'booking_updates',
      'payment_updates',
      'chat_messages',
      'marketing_emails'
    ];

    const updates = {};
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updates[key] = `$${paramIndex}`;
        values.push(req.body[key]);
        paramIndex++;
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay campos válidos para actualizar'
      });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ${updates[key]}`).join(', ');
    values.push(userId);

    const result = await query(`
      UPDATE notification_preferences 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      // Create new preferences if they don't exist
      const insertValues = [userId];
      let insertParams = ['$1'];
      let insertFields = ['user_id'];
      let insertParamIndex = 2;

      Object.keys(updates).forEach(key => {
        insertFields.push(key);
        insertParams.push(`$${insertParamIndex}`);
        insertValues.push(req.body[key]);
        insertParamIndex++;
      });

      const insertResult = await query(`
        INSERT INTO notification_preferences (${insertFields.join(', ')})
        VALUES (${insertParams.join(', ')})
        RETURNING *
      `, insertValues);

      return res.json({
        success: true,
        message: 'Preferencias de notificaciones actualizadas exitosamente',
        data: insertResult.rows[0]
      });
    }

    res.json({
      success: true,
      message: 'Preferencias de notificaciones actualizadas exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/notifications (create notification - usually called internally)
exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, related_id } = req.body;

    // Validation
    if (!user_id || !title || !message || !type) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos requeridos deben ser proporcionados'
      });
    }

    const validTypes = ['booking', 'payment', 'review', 'chat', 'system'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de notificación inválido'
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Create notification
    const result = await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, title, message, type, related_id]);

    res.status(201).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};