const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');
const { findAvailableAS, createServiceRequestWithNotifications } = require('../utils/uber-notifications');

const router = express.Router();

// POST /api/smart-search/create - Create smart search request ("busco niñera para hoy a las 10pm")
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const {
      category_id,
      title,
      description,
      location_address,
      location_lat,
      location_lng,
      required_date,
      required_time,
      urgency = 'normal',
      max_budget,
      currency = 'ARS'
    } = req.body;

    if (!category_id || !title || !required_date || !required_time) {
      return res.status(400).json(formatError('Categoría, título, fecha y hora son requeridos'));
    }

    // Check if user is client
    const [user] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [req.user.id]);
    if (user[0].user_type !== 'client') {
      return res.status(403).json(formatError('Solo los exploradores pueden crear búsquedas'));
    }

    // Calculate expiry based on urgency and required time
    const now = new Date();
    const requiredDateTime = new Date(`${required_date} ${required_time}`);
    const timeDiffHours = (requiredDateTime - now) / (1000 * 60 * 60);

    let expiryDate = new Date();
    if (urgency === 'emergency' || timeDiffHours <= 2) {
      expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour for emergency
    } else if (urgency === 'urgent' || timeDiffHours <= 12) {
      expiryDate.setHours(expiryDate.getHours() + 4); // 4 hours for urgent
    } else {
      expiryDate.setDate(expiryDate.getDate() + 1); // 24 hours for normal
    }

    // Create smart search request
    const [result] = await pool.execute(`
      INSERT INTO smart_search_requests (
        client_id, category_id, title, description, location_address,
        location_lat, location_lng, required_date, required_time,
        urgency, max_budget, currency, expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, category_id, title, description, location_address,
      location_lat, location_lng, required_date, required_time,
      urgency, max_budget, currency, expiryDate
    ]);

    const searchRequestId = result.insertId;

    // Find and notify available AS professionals
    const availableAS = await findAvailableASForSmartSearch(
      category_id, 
      location_lat, 
      location_lng, 
      urgency,
      requiredDateTime
    );

    let notificationsSent = 0;
    
    // Send notifications to available AS
    for (const asProvider of availableAS) {
      try {
        await sendSmartSearchNotification(searchRequestId, asProvider, urgency, req.io);
        notificationsSent++;
      } catch (notificationError) {
        console.error(`Error sending notification to AS ${asProvider.id}:`, notificationError);
      }
    }

    // Update notifications count
    await pool.execute(
      'UPDATE smart_search_requests SET notifications_sent = ? WHERE id = ?',
      [notificationsSent, searchRequestId]
    );

    res.json(formatResponse({
      search_request_id: searchRequestId,
      notifications_sent: notificationsSent,
      available_providers: availableAS.length,
      expires_at: expiryDate
    }, `Búsqueda creada. ${notificationsSent} profesionales notificados.`));

  } catch (error) {
    console.error('Create smart search error:', error);
    res.status(500).json(formatError('Error al crear búsqueda inteligente'));
  }
});

// GET /api/smart-search/my-requests - Get client's search requests
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const [requests] = await pool.execute(`
      SELECT ssr.*, c.name as category_name, c.icon as category_icon,
             COUNT(ssn.id) as total_notifications,
             COUNT(CASE WHEN ssn.read_at IS NOT NULL THEN 1 END) as read_notifications,
             COUNT(CASE WHEN ssn.responded_at IS NOT NULL THEN 1 END) as responses
      FROM smart_search_requests ssr
      INNER JOIN categories c ON ssr.category_id = c.id
      LEFT JOIN smart_search_notifications ssn ON ssr.id = ssn.search_request_id
      WHERE ssr.client_id = ? AND ssr.status = ?
      GROUP BY ssr.id
      ORDER BY ssr.created_at DESC
    `, [req.user.id, status]);

    res.json(formatResponse(requests, 'Búsquedas obtenidas exitosamente'));
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json(formatError('Error al obtener búsquedas'));
  }
});

// GET /api/smart-search/notifications - Get AS notifications for smart searches
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const { unread_only = false } = req.query;

    // Check if user is provider
    const [user] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [req.user.id]);
    if (user[0].user_type !== 'provider') {
      return res.status(403).json(formatError('Solo los AS pueden ver notificaciones de búsqueda'));
    }

    let query = `
      SELECT ssn.*, ssr.title, ssr.description, ssr.location_address,
             ssr.required_date, ssr.required_time, ssr.urgency, ssr.max_budget,
             ssr.expires_at, c.name as category_name, c.icon as category_icon,
             u.first_name as client_first_name, u.last_name as client_last_name,
             u.profile_image as client_profile_image
      FROM smart_search_notifications ssn
      INNER JOIN smart_search_requests ssr ON ssn.search_request_id = ssr.id
      INNER JOIN categories c ON ssr.category_id = c.id
      INNER JOIN users u ON ssr.client_id = u.id
      WHERE ssn.provider_id = ? AND ssr.status = 'active'
    `;

    const params = [req.user.id];

    if (unread_only === 'true') {
      query += ' AND ssn.read_at IS NULL';
    }

    query += ' ORDER BY ssn.sent_at DESC LIMIT 50';

    const [notifications] = await pool.execute(query, params);

    res.json(formatResponse(notifications, 'Notificaciones obtenidas exitosamente'));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json(formatError('Error al obtener notificaciones'));
  }
});

// POST /api/smart-search/respond - AS responds to smart search notification
router.post('/respond', authMiddleware, async (req, res) => {
  try {
    const { search_request_id, response_type, message } = req.body; // response_type: 'interested', 'not_available'

    if (!search_request_id || !response_type) {
      return res.status(400).json(formatError('ID de búsqueda y tipo de respuesta son requeridos'));
    }

    // Check if user is provider
    const [user] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [req.user.id]);
    if (user[0].user_type !== 'provider') {
      return res.status(403).json(formatError('Solo los AS pueden responder búsquedas'));
    }

    // Check if search request exists and is active
    const [searchRequests] = await pool.execute(`
      SELECT * FROM smart_search_requests 
      WHERE id = ? AND status = 'active' AND expires_at > NOW()
    `, [search_request_id]);

    if (searchRequests.length === 0) {
      return res.status(404).json(formatError('Búsqueda no encontrada o expirada'));
    }

    const searchRequest = searchRequests[0];

    // Update notification as responded
    await pool.execute(`
      UPDATE smart_search_notifications 
      SET responded_at = NOW(), response_type = ?
      WHERE search_request_id = ? AND provider_id = ?
    `, [response_type, search_request_id, req.user.id]);

    // If interested, create a service request
    if (response_type === 'interested') {
      await pool.execute(`
        INSERT INTO service_requests (
          client_id, provider_id, category_id, title, description,
          location_address, location_lat, location_lng,
          preferred_date, preferred_time, budget_max, currency,
          urgency, status, expiry_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 24 HOUR))
      `, [
        searchRequest.client_id, req.user.id, searchRequest.category_id,
        searchRequest.title, message || searchRequest.description,
        searchRequest.location_address, searchRequest.location_lat, searchRequest.location_lng,
        searchRequest.required_date, searchRequest.required_time,
        searchRequest.max_budget, searchRequest.currency, searchRequest.urgency
      ]);

      // Notify client via Socket.IO
      if (req.io) {
        req.io.to(`user_${searchRequest.client_id}`).emit('new_service_response', {
          search_request_id: search_request_id,
          provider_id: req.user.id,
          provider_name: `${req.user.first_name} ${req.user.last_name}`,
          message: 'Un profesional está interesado en tu búsqueda'
        });
      }
    }

    // Update responses count
    await pool.execute(
      'UPDATE smart_search_requests SET responses_received = responses_received + 1 WHERE id = ?',
      [search_request_id]
    );

    const message_text = response_type === 'interested' ? 
      'Respuesta enviada. Se ha creado una solicitud de servicio.' :
      'Respuesta registrada como no disponible.';

    res.json(formatResponse(null, message_text));
  } catch (error) {
    console.error('Respond to smart search error:', error);
    res.status(500).json(formatError('Error al responder búsqueda'));
  }
});

// PUT /api/smart-search/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      UPDATE smart_search_notifications 
      SET read_at = NOW() 
      WHERE id = ? AND provider_id = ?
    `, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Notificación no encontrada'));
    }

    res.json(formatResponse(null, 'Notificación marcada como leída'));
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json(formatError('Error al marcar notificación como leída'));
  }
});

// Helper functions
const findAvailableASForSmartSearch = async (categoryId, locationLat, locationLng, urgency, requiredDateTime) => {
  try {
    const [availableAS] = await pool.execute(`
      SELECT DISTINCT 
        u.id, u.first_name, u.last_name, u.phone, u.email,
        u.subscription_type, u.verification_status,
        uas.is_available, uas.availability_type, uas.push_notifications_enabled,
        ans.quiet_hours_start, ans.quiet_hours_end, ans.notification_radius,
        (SELECT AVG(rating) FROM reviews WHERE provider_id = u.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE provider_id = u.id) as total_reviews
      FROM users u
      INNER JOIN as_work_categories awc ON u.id = awc.user_id
      LEFT JOIN user_availability_status uas ON u.id = uas.user_id
      LEFT JOIN as_notification_settings ans ON u.id = ans.user_id
      WHERE u.user_type = 'provider' 
        AND u.subscription_type IN ('basic', 'premium')
        AND u.verification_status = 'verified'
        AND awc.category_id = ?
        AND awc.is_active = TRUE
        AND (uas.is_available = TRUE OR uas.availability_type = 'online')
        AND uas.push_notifications_enabled = TRUE
    `, [categoryId]);

    // Filter by quiet hours and other criteria
    const filteredAS = availableAS.filter(as => {
      // Check quiet hours if it's not an emergency
      if (urgency !== 'emergency' && as.quiet_hours_start && as.quiet_hours_end) {
        const now = new Date();
        const currentHour = now.getHours();
        const quietStart = parseInt(as.quiet_hours_start.split(':')[0]);
        const quietEnd = parseInt(as.quiet_hours_end.split(':')[0]);
        
        // Skip if within quiet hours (simplified check)
        if (quietStart > quietEnd) { // Overnight quiet hours
          if (currentHour >= quietStart || currentHour <= quietEnd) {
            return false;
          }
        } else {
          if (currentHour >= quietStart && currentHour <= quietEnd) {
            return false;
          }
        }
      }

      // Check if AS is available during required time
      const requiredHour = requiredDateTime.getHours();
      const requiredDay = requiredDateTime.toLocaleLowerString('en-US', { weekday: 'long' });
      
      // TODO: Check AS availability schedule for the required time
      // For now, assume available if online
      
      return true;
    });

    // Sort by priority (rating, subscription, availability)
    filteredAS.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      // Rating factor
      if (a.avg_rating) scoreA += a.avg_rating * 20;
      if (b.avg_rating) scoreB += b.avg_rating * 20;
      
      // Subscription factor
      if (a.subscription_type === 'premium') scoreA += 30;
      else if (a.subscription_type === 'basic') scoreA += 20;
      
      if (b.subscription_type === 'premium') scoreB += 30;
      else if (b.subscription_type === 'basic') scoreB += 20;
      
      // Availability factor
      if (a.availability_type === 'online') scoreA += 10;
      if (b.availability_type === 'online') scoreB += 10;
      
      return scoreB - scoreA;
    });

    return filteredAS;

  } catch (error) {
    console.error('Error finding available AS for smart search:', error);
    return [];
  }
};

const sendSmartSearchNotification = async (searchRequestId, asProvider, urgency, io) => {
  try {
    // Send push notification via Socket.IO
    if (io && asProvider.push_notifications_enabled) {
      io.to(`user_${asProvider.id}`).emit('smart_search_notification', {
        search_request_id: searchRequestId,
        urgency: urgency,
        message: urgency === 'emergency' ? 
          '🚨 BÚSQUEDA URGENTE - Responder inmediatamente' : 
          '📢 Nueva búsqueda de servicio disponible'
      });
    }

    // Log notification in database
    await pool.execute(`
      INSERT INTO smart_search_notifications (search_request_id, provider_id, notification_type)
      VALUES (?, ?, 'push')
    `, [searchRequestId, asProvider.id]);

    // TODO: Send SMS for emergency requests
    // TODO: Send email notifications

    console.log(`Smart search notification sent to AS ${asProvider.id}`);

  } catch (error) {
    console.error('Error sending smart search notification:', error);
    throw error;
  }
};

module.exports = router;