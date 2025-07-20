const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// POST /api/as-interests/lo-tengo - AS expresses interest in Explorer's request ("LO TENGO")
router.post('/lo-tengo', authMiddleware, requireProvider, async (req, res) => {
  try {
    // Check if AS has pending review obligations
    const [asObligations] = await pool.execute(`
      SELECT COUNT(*) as pending_reviews 
      FROM as_review_obligations 
      WHERE as_id = ? AND is_reviewed = FALSE AND is_blocking_new_services = TRUE
    `, [req.user.id]);

    if (asObligations[0].pending_reviews > 0) {
      return res.status(403).json(formatError(
        'CALIFICA A LOS EXPLORADORES QUE CONTRATASTE PARA CONTINUAR ACEPTANDO TRABAJOS. ' +
        'Ve a "Mis Calificaciones" para completar las calificaciones obligatorias.'
      ));
    }
    const {
      request_id,
      message,
      proposed_price,
      estimated_completion_time,
      availability_date,
      availability_time
    } = req.body;

    if (!request_id) {
      return res.status(400).json(formatError('ID de solicitud es requerido'));
    }

    // Get request details and verify it's active
    const [requests] = await pool.execute(`
      SELECT esr.*, c.name as category_name, u.first_name as explorer_name, u.last_name
      FROM explorer_service_requests esr
      INNER JOIN categories c ON esr.category_id = c.id
      INNER JOIN users u ON esr.explorer_id = u.id
      WHERE esr.id = ? AND esr.status = 'active' AND esr.expires_at > NOW()
    `, [request_id]);

    if (requests.length === 0) {
      return res.status(404).json(formatError('Solicitud no encontrada o expirada'));
    }

    const request = requests[0];

    // Check if AS works in this category
    const [workCategories] = await pool.execute(`
      SELECT id FROM as_work_categories 
      WHERE user_id = ? AND category_id = ? AND is_active = TRUE
    `, [req.user.id, request.category_id]);

    if (workCategories.length === 0) {
      return res.status(403).json(formatError('No trabajas en esta categoría de servicios'));
    }

    // Check if AS works in this locality
    const [workLocations] = await pool.execute(`
      SELECT id FROM as_work_locations 
      WHERE user_id = ? AND (locality = ? OR locality = 'Todas las localidades') AND is_active = TRUE
    `, [req.user.id, request.locality]);

    if (workLocations.length === 0) {
      return res.status(403).json(formatError('No trabajas en esta localidad'));
    }

    // Check if AS already expressed interest
    const [existingInterest] = await pool.execute(`
      SELECT id FROM as_service_interests 
      WHERE request_id = ? AND as_id = ?
    `, [request_id, req.user.id]);

    if (existingInterest.length > 0) {
      return res.status(400).json(formatError('Ya expresaste interés en esta solicitud'));
    }

    // Create interest record
    const [result] = await pool.execute(`
      INSERT INTO as_service_interests (
        request_id, as_id, message, proposed_price, estimated_completion_time,
        availability_date, availability_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      request_id, req.user.id, message, proposed_price, estimated_completion_time,
      availability_date, availability_time
    ]);

    // Update interested AS count in request
    await pool.execute(`
      UPDATE explorer_service_requests 
      SET interested_as_count = interested_as_count + 1 
      WHERE id = ?
    `, [request_id]);

    // Notify Explorer via Socket.IO
    if (req.io) {
      req.io.to(`user_${request.explorer_id}`).emit('new_as_interest', {
        request_id: request_id,
        as_id: req.user.id,
        as_name: `${req.user.first_name} ${req.user.last_name}`,
        proposed_price: proposed_price,
        message: `${req.user.first_name} está interesado en tu solicitud: "${request.title}"`
      });
    }

    res.json(formatResponse({
      interest_id: result.insertId,
      request_title: request.title,
      explorer_name: `${request.explorer_name} ${request.last_name}`
    }, 'Interés expresado exitosamente. El explorador será notificado.'));

  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json(formatError('Error al expresar interés'));
  }
});

// GET /api/as-interests/my-interests - Get AS's expressed interests
router.get('/my-interests', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const [interests] = await pool.execute(`
      SELECT asi.*, esr.title, esr.description, esr.locality, esr.budget_min, esr.budget_max,
             esr.preferred_date, esr.preferred_time, esr.urgency, esr.status as request_status,
             c.name as category_name, c.icon as category_icon,
             u.first_name as explorer_name, u.last_name as explorer_last_name
      FROM as_service_interests asi
      INNER JOIN explorer_service_requests esr ON asi.request_id = esr.id
      INNER JOIN categories c ON esr.category_id = c.id
      INNER JOIN users u ON esr.explorer_id = u.id
      WHERE asi.as_id = ? AND asi.status = ?
      ORDER BY asi.created_at DESC
    `, [req.user.id, status]);

    res.json(formatResponse(interests, 'Intereses obtenidos exitosamente'));
  } catch (error) {
    console.error('Get my interests error:', error);
    res.status(500).json(formatError('Error al obtener intereses'));
  }
});

// GET /api/as-interests/available-requests - Get available service requests for AS
router.get('/available-requests', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { 
      category_id, 
      locality, 
      urgency,
      min_budget,
      limit = 20 
    } = req.query;

    // Get AS work categories and locations
    const [asCategories] = await pool.execute(`
      SELECT category_id FROM as_work_categories 
      WHERE user_id = ? AND is_active = TRUE
    `, [req.user.id]);

    const [asLocations] = await pool.execute(`
      SELECT locality FROM as_work_locations 
      WHERE user_id = ? AND is_active = TRUE
    `, [req.user.id]);

    if (asCategories.length === 0 || asLocations.length === 0) {
      return res.json(formatResponse([], 'No tienes categorías o localidades configuradas'));
    }

    const categoryIds = asCategories.map(cat => cat.category_id);
    const localities = asLocations.map(loc => loc.locality);
    const includesAllLocalities = localities.includes('Todas las localidades');

    let query = `
      SELECT esr.*, c.name as category_name, c.icon as category_icon,
             u.first_name as explorer_name, u.last_name as explorer_last_name,
             u.profile_photo_url as explorer_profile_image,
             (SELECT AVG(rating) FROM as_explorer_reviews WHERE explorer_id = esr.explorer_id) as explorer_rating,
             (SELECT COUNT(*) FROM as_explorer_reviews WHERE explorer_id = esr.explorer_id) as explorer_reviews_count,
             (SELECT COUNT(*) FROM as_service_interests WHERE request_id = esr.id) as total_interests,
             CASE WHEN asi.id IS NOT NULL THEN TRUE ELSE FALSE END as already_interested
      FROM explorer_service_requests esr
      INNER JOIN categories c ON esr.category_id = c.id
      INNER JOIN users u ON esr.explorer_id = u.id
      LEFT JOIN as_service_interests asi ON esr.id = asi.request_id AND asi.as_id = ?
      WHERE esr.status = 'active' 
        AND esr.expires_at > NOW()
        AND esr.category_id IN (${categoryIds.map(() => '?').join(',')})
    `;

    const params = [req.user.id, ...categoryIds];

    if (!includesAllLocalities) {
      query += ` AND esr.locality IN (${localities.map(() => '?').join(',')})`;
      params.push(...localities);
    }

    if (category_id) {
      query += ' AND esr.category_id = ?';
      params.push(category_id);
    }

    if (locality) {
      query += ' AND esr.locality = ?';
      params.push(locality);
    }

    if (urgency) {
      query += ' AND esr.urgency = ?';
      params.push(urgency);
    }

    if (min_budget) {
      query += ' AND esr.budget_max >= ?';
      params.push(min_budget);
    }

    query += ` 
      ORDER BY 
        CASE esr.urgency 
          WHEN 'emergency' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        esr.created_at DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));

    const [requests] = await pool.execute(query, params);

    res.json(formatResponse(requests, 'Solicitudes disponibles obtenidas exitosamente'));
  } catch (error) {
    console.error('Get available requests error:', error);
    res.status(500).json(formatError('Error al obtener solicitudes disponibles'));
  }
});

// GET /api/as-interests/request/:id - Get specific request details for AS
router.get('/request/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await pool.execute(`
      SELECT esr.*, c.name as category_name, c.icon as category_icon,
             u.first_name as explorer_name, u.last_name as explorer_last_name,
             u.profile_photo_url as explorer_profile_image, u.phone as explorer_phone,
             u.created_at as explorer_member_since,
             (SELECT AVG(rating) FROM as_explorer_reviews WHERE explorer_id = esr.explorer_id) as explorer_rating,
             (SELECT COUNT(*) FROM as_explorer_reviews WHERE explorer_id = esr.explorer_id) as explorer_reviews_count,
             (SELECT COUNT(*) FROM explorer_as_connections WHERE explorer_id = esr.explorer_id AND status = 'completed') as explorer_completed_services,
             ep.communication_preference, ep.preferred_payment_method, ep.special_requirements
      FROM explorer_service_requests esr
      INNER JOIN categories c ON esr.category_id = c.id
      INNER JOIN users u ON esr.explorer_id = u.id
      LEFT JOIN explorer_profiles ep ON esr.explorer_id = ep.user_id
      WHERE esr.id = ? AND esr.status = 'active' AND esr.expires_at > NOW()
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json(formatError('Solicitud no encontrada o expirada'));
    }

    // Get explorer's recent reviews (as client)
    const [explorerReviews] = await pool.execute(`
      SELECT aer.*, u.first_name as as_name
      FROM as_explorer_reviews aer
      INNER JOIN users u ON aer.as_id = u.id
      WHERE aer.explorer_id = ?
      ORDER BY aer.created_at DESC
      LIMIT 3
    `, [requests[0].explorer_id]);

    // Check if current AS already expressed interest
    const [currentASInterest] = await pool.execute(`
      SELECT * FROM as_service_interests 
      WHERE request_id = ? AND as_id = ?
    `, [id, req.user.id]);

    // Get other AS interests (for competitive info)
    const [otherInterests] = await pool.execute(`
      SELECT COUNT(*) as total_interests,
             AVG(proposed_price) as avg_proposed_price,
             MIN(proposed_price) as min_proposed_price,
             MAX(proposed_price) as max_proposed_price
      FROM as_service_interests 
      WHERE request_id = ? AND status = 'pending'
    `, [id]);

    const requestData = {
      ...requests[0],
      explorer_recent_reviews: explorerReviews,
      current_as_interest: currentASInterest[0] || null,
      competition_info: otherInterests[0]
    };

    res.json(formatResponse(requestData, 'Detalles de solicitud obtenidos exitosamente'));
  } catch (error) {
    console.error('Get request details error:', error);
    res.status(500).json(formatError('Error al obtener detalles de solicitud'));
  }
});

// PUT /api/as-interests/:id - Update AS interest
router.put('/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      message,
      proposed_price,
      estimated_completion_time,
      availability_date,
      availability_time
    } = req.body;

    // Verify interest belongs to AS and is still pending
    const [interests] = await pool.execute(`
      SELECT asi.*, esr.status as request_status
      FROM as_service_interests asi
      INNER JOIN explorer_service_requests esr ON asi.request_id = esr.id
      WHERE asi.id = ? AND asi.as_id = ? AND asi.status = 'pending' AND esr.status = 'active'
    `, [id, req.user.id]);

    if (interests.length === 0) {
      return res.status(404).json(formatError('Interés no encontrado o no modificable'));
    }

    const updates = {};
    if (message !== undefined) updates.message = message;
    if (proposed_price !== undefined) updates.proposed_price = proposed_price;
    if (estimated_completion_time !== undefined) updates.estimated_completion_time = estimated_completion_time;
    if (availability_date !== undefined) updates.availability_date = availability_date;
    if (availability_time !== undefined) updates.availability_time = availability_time;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.execute(`
      UPDATE as_service_interests 
      SET ${setClause}, updated_at = NOW()
      WHERE id = ?
    `, [...values, id]);

    res.json(formatResponse(null, 'Interés actualizado exitosamente'));
  } catch (error) {
    console.error('Update interest error:', error);
    res.status(500).json(formatError('Error al actualizar interés'));
  }
});

// DELETE /api/as-interests/:id - Cancel AS interest
router.delete('/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify interest belongs to AS and is still pending
    const [result] = await pool.execute(`
      DELETE asi FROM as_service_interests asi
      INNER JOIN explorer_service_requests esr ON asi.request_id = esr.id
      WHERE asi.id = ? AND asi.as_id = ? AND asi.status = 'pending' AND esr.status = 'active'
    `, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Interés no encontrado o no cancelable'));
    }

    res.json(formatResponse(null, 'Interés cancelado exitosamente'));
  } catch (error) {
    console.error('Cancel interest error:', error);
    res.status(500).json(formatError('Error al cancelar interés'));
  }
});

// GET /api/as-interests/dashboard-stats - Get AS dashboard statistics
router.get('/dashboard-stats', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN asi.status = 'pending' THEN 1 END) as pending_interests,
        COUNT(CASE WHEN asi.status = 'accepted' THEN 1 END) as accepted_interests,
        COUNT(CASE WHEN asi.status = 'rejected' THEN 1 END) as rejected_interests,
        AVG(asi.proposed_price) as avg_proposed_price,
        COUNT(CASE WHEN asi.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as interests_this_week
      FROM as_service_interests asi
      WHERE asi.as_id = ?
    `, [req.user.id]);

    const [activeConnections] = await pool.execute(`
      SELECT COUNT(*) as active_connections
      FROM explorer_as_connections
      WHERE as_id = ? AND status IN ('active', 'service_in_progress')
    `, [req.user.id]);

    const [availableRequests] = await pool.execute(`
      SELECT COUNT(*) as available_requests
      FROM explorer_service_requests esr
      INNER JOIN as_work_categories awc ON esr.category_id = awc.category_id
      LEFT JOIN as_work_locations awl ON awc.user_id = awl.user_id
      WHERE awc.user_id = ? 
        AND awc.is_active = TRUE
        AND esr.status = 'active'
        AND esr.expires_at > NOW()
        AND (awl.locality = esr.locality OR awl.locality = 'Todas las localidades')
        AND esr.id NOT IN (
          SELECT request_id FROM as_service_interests WHERE as_id = ?
        )
    `, [req.user.id, req.user.id]);

    const dashboardStats = {
      ...stats[0],
      active_connections: activeConnections[0].active_connections,
      available_requests: availableRequests[0].available_requests
    };

    res.json(formatResponse(dashboardStats, 'Estadísticas obtenidas exitosamente'));
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(formatError('Error al obtener estadísticas'));
  }
});

module.exports = router;