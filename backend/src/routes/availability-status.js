const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// GET /api/availability-status - Get user's availability status
router.get('/', authMiddleware, async (req, res) => {
  try {
    let [status] = await pool.execute(`
      SELECT * FROM user_availability_status WHERE user_id = ?
    `, [req.user.id]);

    if (status.length === 0) {
      // Create default availability status
      await pool.execute(`
        INSERT INTO user_availability_status (user_id, is_available, availability_type)
        VALUES (?, FALSE, 'offline')
      `, [req.user.id]);
      
      [status] = await pool.execute(`
        SELECT * FROM user_availability_status WHERE user_id = ?
      `, [req.user.id]);
    }

    res.json(formatResponse(status[0], 'Estado de disponibilidad obtenido exitosamente'));
  } catch (error) {
    console.error('Get availability status error:', error);
    res.status(500).json(formatError('Error al obtener estado de disponibilidad'));
  }
});

// PUT /api/availability-status - Update user's availability status
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { 
      is_available, 
      availability_type, 
      location_lat, 
      location_lng,
      push_notifications_enabled 
    } = req.body;

    // Validate availability_type
    const validTypes = ['online', 'busy', 'offline'];
    if (availability_type && !validTypes.includes(availability_type)) {
      return res.status(400).json(formatError('Tipo de disponibilidad inválido'));
    }

    const updates = {};
    if (typeof is_available === 'boolean') updates.is_available = is_available;
    if (availability_type) updates.availability_type = availability_type;
    if (typeof push_notifications_enabled === 'boolean') updates.push_notifications_enabled = push_notifications_enabled;
    
    // Update location if provided
    if (location_lat && location_lng) {
      updates.location_lat = location_lat;
      updates.location_lng = location_lng;
      updates.location_updated_at = new Date();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.execute(`
      INSERT INTO user_availability_status (user_id, ${Object.keys(updates).join(', ')})
      VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${setClause}, last_seen = NOW()
    `, [req.user.id, ...values, ...values]);

    // Get updated status
    const [updatedStatus] = await pool.execute(`
      SELECT * FROM user_availability_status WHERE user_id = ?
    `, [req.user.id]);

    // Notify via Socket.IO if availability changed
    if (req.io && typeof is_available === 'boolean') {
      req.io.to(`user_${req.user.id}`).emit('availability_updated', {
        is_available: is_available,
        availability_type: availability_type || updatedStatus[0].availability_type
      });
    }

    res.json(formatResponse(updatedStatus[0], 'Estado de disponibilidad actualizado exitosamente'));
  } catch (error) {
    console.error('Update availability status error:', error);
    res.status(500).json(formatError('Error al actualizar estado de disponibilidad'));
  }
});

// POST /api/availability-status/quick-toggle - Quick toggle availability (for AS)
router.post('/quick-toggle', authMiddleware, requireProvider, async (req, res) => {
  try {
    // Get current status
    const [currentStatus] = await pool.execute(`
      SELECT is_available FROM user_availability_status WHERE user_id = ?
    `, [req.user.id]);

    let newAvailability;
    if (currentStatus.length === 0) {
      // First time, set to available
      newAvailability = true;
      await pool.execute(`
        INSERT INTO user_availability_status (user_id, is_available, availability_type)
        VALUES (?, TRUE, 'online')
      `, [req.user.id]);
    } else {
      // Toggle current state
      newAvailability = !currentStatus[0].is_available;
      const newType = newAvailability ? 'online' : 'offline';
      
      await pool.execute(`
        UPDATE user_availability_status 
        SET is_available = ?, availability_type = ?, last_seen = NOW()
        WHERE user_id = ?
      `, [newAvailability, newType, req.user.id]);
    }

    // Notify via Socket.IO
    if (req.io) {
      req.io.to(`user_${req.user.id}`).emit('availability_toggled', {
        is_available: newAvailability,
        message: newAvailability ? 
          'Ahora estás disponible para recibir solicitudes' : 
          'Ya no recibirás solicitudes de servicio'
      });
    }

    res.json(formatResponse({
      is_available: newAvailability
    }, newAvailability ? 'Disponibilidad activada' : 'Disponibilidad desactivada'));

  } catch (error) {
    console.error('Quick toggle availability error:', error);
    res.status(500).json(formatError('Error al cambiar disponibilidad'));
  }
});

// GET /api/availability-status/nearby-providers - Get nearby available providers (for clients)
router.get('/nearby-providers', authMiddleware, async (req, res) => {
  try {
    const { 
      category_id, 
      latitude, 
      longitude, 
      radius = 10, // kilometers
      limit = 20 
    } = req.query;

    if (!category_id) {
      return res.status(400).json(formatError('Categoría es requerida'));
    }

    let query = `
      SELECT DISTINCT 
        u.id, u.first_name, u.last_name, u.profile_image,
        uas.is_available, uas.availability_type, uas.last_seen,
        uas.location_lat, uas.location_lng,
        (SELECT AVG(rating) FROM reviews WHERE provider_id = u.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE provider_id = u.id) as total_reviews,
        u.subscription_type, u.verification_status
    `;

    // Add distance calculation if coordinates provided
    if (latitude && longitude) {
      query += `, (
        6371 * acos(
          cos(radians(?)) * cos(radians(uas.location_lat)) *
          cos(radians(uas.location_lng) - radians(?)) +
          sin(radians(?)) * sin(radians(uas.location_lat))
        )
      ) AS distance_km`;
    }

    query += `
      FROM users u
      INNER JOIN as_work_categories awc ON u.id = awc.user_id
      INNER JOIN user_availability_status uas ON u.id = uas.user_id
      WHERE u.user_type = 'provider'
        AND u.verification_status = 'verified'
        AND awc.category_id = ?
        AND awc.is_active = TRUE
        AND uas.is_available = TRUE
        AND uas.availability_type IN ('online', 'busy')
    `;

    const params = [];
    
    if (latitude && longitude) {
      params.push(latitude, longitude, latitude);
    }
    
    params.push(category_id);

    // Add distance filter if coordinates provided
    if (latitude && longitude) {
      query += ` HAVING distance_km <= ? ORDER BY distance_km ASC, avg_rating DESC`;
      params.push(radius);
    } else {
      query += ` ORDER BY avg_rating DESC, last_seen DESC`;
    }

    query += ` LIMIT ?`;
    params.push(parseInt(limit));

    const [providers] = await pool.execute(query, params);

    res.json(formatResponse({
      providers: providers,
      total: providers.length,
      search_criteria: {
        category_id: parseInt(category_id),
        radius: parseInt(radius),
        has_location: !!(latitude && longitude)
      }
    }, 'Proveedores cercanos obtenidos exitosamente'));

  } catch (error) {
    console.error('Get nearby providers error:', error);
    res.status(500).json(formatError('Error al obtener proveedores cercanos'));
  }
});

// GET /api/availability-status/stats - Get availability statistics (for dashboard)
router.get('/stats', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d

    let dateFilter = '';
    if (period === '7d') {
      dateFilter = 'AND DATE(uas.last_seen) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === '30d') {
      dateFilter = 'AND DATE(uas.last_seen) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (period === '90d') {
      dateFilter = 'AND DATE(uas.last_seen) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)';
    }

    // Get availability stats for the user
    const [availabilityStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN uas.is_available = TRUE THEN 1 END) as available_sessions,
        COUNT(CASE WHEN uas.availability_type = 'online' THEN 1 END) as online_sessions,
        COUNT(CASE WHEN uas.availability_type = 'busy' THEN 1 END) as busy_sessions,
        AVG(CASE WHEN uas.is_available = TRUE THEN 1 ELSE 0 END) * 100 as availability_percentage
      FROM user_availability_status uas
      WHERE uas.user_id = ? ${dateFilter}
    `, [req.user.id]);

    // Get notifications received during available periods
    const [notificationStats] = await pool.execute(`
      SELECT COUNT(*) as notifications_received
      FROM smart_search_notifications ssn
      INNER JOIN smart_search_requests ssr ON ssn.search_request_id = ssr.id
      WHERE ssn.provider_id = ? ${dateFilter.replace('uas.', 'ssn.')}
    `, [req.user.id]);

    res.json(formatResponse({
      period: period,
      availability: availabilityStats[0],
      notifications: notificationStats[0]
    }, 'Estadísticas de disponibilidad obtenidas exitosamente'));

  } catch (error) {
    console.error('Get availability stats error:', error);
    res.status(500).json(formatError('Error al obtener estadísticas de disponibilidad'));
  }
});

module.exports = router;