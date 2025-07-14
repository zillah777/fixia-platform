const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// SERVICE ANNOUNCEMENTS (AS can post multiple categories)
// GET /api/service-management/announcements - Get AS service announcements
router.get('/announcements', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [announcements] = await pool.execute(`
      SELECT asa.*, c.name as category_name, c.icon as category_icon
      FROM as_service_announcements asa
      INNER JOIN categories c ON asa.category_id = c.id
      WHERE asa.user_id = ?
      ORDER BY asa.is_featured DESC, asa.created_at DESC
    `, [req.user.id]);

    res.json(formatResponse(announcements, 'Anuncios obtenidos exitosamente'));
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json(formatError('Error al obtener anuncios'));
  }
});

// POST /api/service-management/announcements - Create service announcement
router.post('/announcements', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category_id, 
      subcategory,
      service_type,
      base_price,
      location_type = 'both',
      requires_materials = false,
      estimated_duration,
      availability_note,
      is_featured = false
    } = req.body;

    if (!title || !description || !category_id || !service_type) {
      return res.status(400).json(formatError('Título, descripción, categoría y tipo de servicio son requeridos'));
    }

    // Check subscription limits for announcements
    const [user] = await pool.execute('SELECT subscription_type FROM users WHERE id = ?', [req.user.id]);
    const [currentAnnouncements] = await pool.execute('SELECT COUNT(*) as count FROM as_service_announcements WHERE user_id = ? AND is_active = TRUE', [req.user.id]);
    
    const subscriptionType = user[0].subscription_type;
    const currentCount = currentAnnouncements[0].count;

    // Subscription limits: free = 2, basic = 10, premium = unlimited
    const limits = { free: 2, basic: 10, premium: -1 };
    const maxAnnouncements = limits[subscriptionType] || 0;

    if (maxAnnouncements !== -1 && currentCount >= maxAnnouncements) {
      return res.status(403).json(formatError(`Has alcanzado el límite de ${maxAnnouncements} anuncios para tu suscripción ${subscriptionType}`));
    }

    const [result] = await pool.execute(`
      INSERT INTO as_service_announcements (
        user_id, title, description, category_id, subcategory, service_type, 
        base_price, location_type, requires_materials, estimated_duration, 
        availability_note, is_featured
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, title, description, category_id, subcategory, service_type,
      base_price, location_type, requires_materials, estimated_duration,
      availability_note, is_featured
    ]);

    res.json(formatResponse({ id: result.insertId }, 'Anuncio creado exitosamente'));
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json(formatError('Error al crear anuncio'));
  }
});

// PUT /api/service-management/announcements/:id - Update service announcement
router.put('/announcements/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = [
      'title', 'description', 'subcategory', 'service_type', 'base_price',
      'location_type', 'requires_materials', 'estimated_duration', 
      'availability_note', 'is_featured', 'is_active'
    ];

    const updates = {};
    updateFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id, req.user.id];

    const [result] = await pool.execute(`
      UPDATE as_service_announcements 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `, values);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Anuncio no encontrado'));
    }

    res.json(formatResponse(null, 'Anuncio actualizado exitosamente'));
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json(formatError('Error al actualizar anuncio'));
  }
});

// DELETE /api/service-management/announcements/:id - Delete service announcement
router.delete('/announcements/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM as_service_announcements 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Anuncio no encontrado'));
    }

    res.json(formatResponse(null, 'Anuncio eliminado exitosamente'));
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json(formatError('Error al eliminar anuncio'));
  }
});

// SERVICE REQUESTS MANAGEMENT (UBER-style)
// GET /api/service-management/requests - Get service requests for AS
router.get('/requests', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const [requests] = await pool.execute(`
      SELECT sr.*, 
             u.first_name as client_first_name, 
             u.last_name as client_last_name,
             u.profile_image as client_profile_image,
             u.phone as client_phone,
             c.name as category_name,
             c.icon as category_icon,
             (SELECT AVG(rating) FROM reviews WHERE client_id = sr.client_id) as client_rating,
             (SELECT COUNT(*) FROM reviews WHERE client_id = sr.client_id) as client_reviews_count
      FROM service_requests sr
      INNER JOIN users u ON sr.client_id = u.id
      INNER JOIN categories c ON sr.category_id = c.id
      WHERE sr.provider_id = ? AND sr.status = ?
      ORDER BY 
        CASE 
          WHEN sr.urgency = 'emergency' THEN 1
          WHEN sr.urgency = 'high' THEN 2
          WHEN sr.urgency = 'medium' THEN 3
          ELSE 4
        END,
        sr.created_at DESC
    `, [req.user.id, status]);

    res.json(formatResponse(requests, 'Solicitudes obtenidas exitosamente'));
  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json(formatError('Error al obtener solicitudes'));
  }
});

// GET /api/service-management/requests/:id - Get specific service request
router.get('/requests/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await pool.execute(`
      SELECT sr.*, 
             u.first_name as client_first_name, 
             u.last_name as client_last_name,
             u.profile_image as client_profile_image,
             u.phone as client_phone,
             u.email as client_email,
             u.created_at as client_member_since,
             c.name as category_name,
             c.icon as category_icon,
             (SELECT AVG(rating) FROM reviews WHERE client_id = sr.client_id) as client_rating,
             (SELECT COUNT(*) FROM reviews WHERE client_id = sr.client_id) as client_reviews_count,
             (SELECT COUNT(*) FROM bookings WHERE client_id = sr.client_id AND status = 'completed') as client_completed_bookings
      FROM service_requests sr
      INNER JOIN users u ON sr.client_id = u.id
      INNER JOIN categories c ON sr.category_id = c.id
      WHERE sr.id = ? AND sr.provider_id = ?
    `, [id, req.user.id]);

    if (requests.length === 0) {
      return res.status(404).json(formatError('Solicitud no encontrada'));
    }

    // Get client's recent reviews
    const [clientReviews] = await pool.execute(`
      SELECT r.*, u.first_name as provider_name
      FROM reviews r
      INNER JOIN users u ON r.provider_id = u.id
      WHERE r.client_id = ?
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [requests[0].client_id]);

    const requestData = {
      ...requests[0],
      client_recent_reviews: clientReviews
    };

    res.json(formatResponse(requestData, 'Solicitud obtenida exitosamente'));
  } catch (error) {
    console.error('Get service request error:', error);
    res.status(500).json(formatError('Error al obtener solicitud'));
  }
});

// POST /api/service-management/requests/:id/respond - Accept or reject service request
router.post('/requests/:id/respond', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, response_message } = req.body; // action: 'accept' or 'reject'

    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json(formatError('Acción debe ser "accept" o "reject"'));
    }

    // Check if request exists and is still pending
    const [requests] = await pool.execute(`
      SELECT * FROM service_requests 
      WHERE id = ? AND provider_id = ? AND status = 'pending'
    `, [id, req.user.id]);

    if (requests.length === 0) {
      return res.status(404).json(formatError('Solicitud no encontrada o ya ha sido respondida'));
    }

    const request = requests[0];

    // Check if request has expired
    if (new Date() > new Date(request.expiry_date)) {
      await pool.execute(`
        UPDATE service_requests 
        SET status = 'cancelled' 
        WHERE id = ?
      `, [id]);
      return res.status(400).json(formatError('La solicitud ha expirado'));
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    await pool.execute(`
      UPDATE service_requests 
      SET status = ?, provider_response = ?, response_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newStatus, response_message, id]);

    // If accepted, create a booking
    if (action === 'accept') {
      await pool.execute(`
        INSERT INTO bookings (
          client_id, provider_id, service_id, category_id,
          service_description, location_address, location_lat, location_lng,
          scheduled_date, scheduled_time, estimated_price, status
        )
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
      `, [
        request.client_id, request.provider_id, request.category_id,
        request.description, request.location_address, request.location_lat, request.location_lng,
        request.preferred_date, request.preferred_time, request.budget_max
      ]);
    }

    const message = action === 'accept' ? 
      'Solicitud aceptada exitosamente. Se ha creado una reserva.' :
      'Solicitud rechazada exitosamente.';

    res.json(formatResponse(null, message));
  } catch (error) {
    console.error('Respond to service request error:', error);
    res.status(500).json(formatError('Error al responder solicitud'));
  }
});

// GET /api/service-management/dashboard - Get AS dashboard stats
router.get('/dashboard', authMiddleware, requireProvider, async (req, res) => {
  try {
    // Get various stats for the AS dashboard
    const [pendingRequests] = await pool.execute(`
      SELECT COUNT(*) as count FROM service_requests 
      WHERE provider_id = ? AND status = 'pending' AND expiry_date > NOW()
    `, [req.user.id]);

    const [activeAnnouncements] = await pool.execute(`
      SELECT COUNT(*) as count FROM as_service_announcements 
      WHERE user_id = ? AND is_active = TRUE
    `, [req.user.id]);

    const [monthlyBookings] = await pool.execute(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE provider_id = ? AND status = 'completed' 
      AND MONTH(completed_at) = MONTH(NOW()) AND YEAR(completed_at) = YEAR(NOW())
    `, [req.user.id]);

    const [averageRating] = await pool.execute(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
      FROM reviews WHERE provider_id = ?
    `, [req.user.id]);

    const [recentActivity] = await pool.execute(`
      (SELECT 'request' as type, created_at, 'Nueva solicitud de servicio' as description 
       FROM service_requests WHERE provider_id = ? ORDER BY created_at DESC LIMIT 3)
      UNION ALL
      (SELECT 'booking' as type, created_at, 'Reserva confirmada' as description 
       FROM bookings WHERE provider_id = ? ORDER BY created_at DESC LIMIT 3)
      UNION ALL
      (SELECT 'review' as type, created_at, 'Nueva reseña recibida' as description 
       FROM reviews WHERE provider_id = ? ORDER BY created_at DESC LIMIT 3)
      ORDER BY created_at DESC LIMIT 10
    `, [req.user.id, req.user.id, req.user.id]);

    const dashboardData = {
      pending_requests: pendingRequests[0].count,
      active_announcements: activeAnnouncements[0].count,
      monthly_bookings: monthlyBookings[0].count,
      average_rating: averageRating[0].avg_rating ? parseFloat(averageRating[0].avg_rating).toFixed(1) : null,
      total_reviews: averageRating[0].total_reviews,
      recent_activity: recentActivity
    };

    res.json(formatResponse(dashboardData, 'Dashboard obtenido exitosamente'));
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json(formatError('Error al obtener dashboard'));
  }
});

module.exports = router;