const express = require('express');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');
const { userTypeTransformMiddleware } = require('../middleware/userTypeTransform');
const crypto = require('crypto');

const router = express.Router();

// Apply user type transformation to all routes
router.use(userTypeTransformMiddleware);

// Middleware to ensure user is client (Explorer)
const requireExplorer = async (req, res, next) => {
  if (req.user.user_type !== 'client') {
    return res.status(403).json(formatError('Solo los exploradores pueden acceder a esta funcionalidad'));
  }
  next();
};

// GET /api/explorer/profile - Get or create Explorer profile
router.get('/profile', authMiddleware, requireExplorer, async (req, res) => {
  try {
    let [profile] = await pool.execute(`
      SELECT ep.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image,
             (SELECT AVG(rating) FROM as_explorer_reviews WHERE explorer_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM as_explorer_reviews WHERE explorer_id = u.id) as total_reviews
      FROM users u
      LEFT JOIN explorer_profiles ep ON u.id = ep.user_id
      WHERE u.id = ?
    `, [req.user.id]);

    if (profile.length === 0 || !profile[0].user_id) {
      // Create default explorer profile
      await pool.execute(`
        INSERT INTO explorer_profiles (user_id, preferred_localities, preferred_categories)
        VALUES (?, '[]', '[]')
      `, [req.user.id]);
      
      [profile] = await pool.execute(`
        SELECT ep.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image,
               0 as avg_rating, 0 as total_reviews
        FROM users u
        INNER JOIN explorer_profiles ep ON u.id = ep.user_id
        WHERE u.id = ?
      `, [req.user.id]);
    }

    const explorerProfile = {
      ...profile[0],
      preferred_localities: profile[0].preferred_localities ? JSON.parse(profile[0].preferred_localities) : [],
      preferred_categories: profile[0].preferred_categories ? JSON.parse(profile[0].preferred_categories) : []
    };

    res.json(formatResponse(explorerProfile, 'Perfil de explorador obtenido exitosamente'));
  } catch (error) {
    console.error('Get explorer profile error:', error);
    res.status(500).json(formatError('Error al obtener perfil de explorador'));
  }
});

// PUT /api/explorer/profile - Update Explorer profile
router.put('/profile', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const {
      preferred_localities,
      preferred_categories,
      average_budget_range,
      communication_preference,
      preferred_payment_method,
      special_requirements
    } = req.body;

    const updates = {};
    if (preferred_localities) updates.preferred_localities = JSON.stringify(preferred_localities);
    if (preferred_categories) updates.preferred_categories = JSON.stringify(preferred_categories);
    if (average_budget_range) updates.average_budget_range = average_budget_range;
    if (communication_preference) updates.communication_preference = communication_preference;
    if (preferred_payment_method) updates.preferred_payment_method = preferred_payment_method;
    if (special_requirements) updates.special_requirements = special_requirements;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.execute(`
      INSERT INTO explorer_profiles (user_id, ${Object.keys(updates).join(', ')})
      VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${setClause}, updated_at = NOW()
    `, [req.user.id, ...values, ...values]);

    res.json(formatResponse(null, 'Perfil de explorador actualizado exitosamente'));
  } catch (error) {
    console.error('Update explorer profile error:', error);
    res.status(500).json(formatError('Error al actualizar perfil de explorador'));
  }
});

// POST /api/explorer/service-request - Create service request ("BUSCO ALBAÑIL PARA TRABAJO EN RAWSON")
router.post('/service-request', authMiddleware, requireExplorer, async (req, res) => {
  try {
    // Check if explorer has pending review obligations
    const [obligations] = await pool.execute(`
      SELECT COUNT(*) as pending_reviews 
      FROM explorer_review_obligations 
      WHERE explorer_id = ? AND is_reviewed = FALSE AND is_blocking_new_services = TRUE
    `, [req.user.id]);

    if (obligations[0].pending_reviews > 0) {
      return res.status(403).json(formatError(
        'CALIFICA A LOS AS QUE CONTRATASTE PARA CONTINUAR BUSCANDO A LOS MEJORES. ' +
        'Ve a "Mis Calificaciones" para completar las calificaciones obligatorias.'
      ));
    }

    const {
      category_id,
      title,
      description,
      locality,
      specific_address,
      location_lat,
      location_lng,
      urgency = 'medium',
      budget_min,
      budget_max,
      preferred_date,
      preferred_time,
      flexible_timing = true
    } = req.body;

    if (!category_id || !title || !description || !locality) {
      return res.status(400).json(formatError('Categoría, título, descripción y localidad son requeridos'));
    }

    // Verify locality exists in Chubut
    const localityResult = await query(`
      SELECT id FROM chubut_localities WHERE name = $1 AND is_active = TRUE
    `, [locality]);

    if (localityResult.rows.length === 0) {
      return res.status(400).json(formatError('La localidad especificada no está disponible en Chubut'));
    }

    // Calculate expiry date (7 days for normal, 3 days for urgent, 1 day for emergency)
    const expiryHours = { low: 168, medium: 120, high: 72, emergency: 24 };
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + (expiryHours[urgency] || 120));

    const [result] = await pool.execute(`
      INSERT INTO explorer_service_requests (
        explorer_id, category_id, title, description, locality, specific_address,
        location_lat, location_lng, urgency, budget_min, budget_max,
        preferred_date, preferred_time, flexible_timing, expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, category_id, title, description, locality, specific_address,
      location_lat, location_lng, urgency, budget_min, budget_max,
      preferred_date, preferred_time, flexible_timing, expiryDate
    ]);

    // Notify relevant AS professionals
    await notifyRelevantAS(result.insertId, category_id, locality, urgency, req.io);

    res.json(formatResponse({
      request_id: result.insertId,
      expires_at: expiryDate
    }, 'Solicitud de servicio creada exitosamente'));

  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json(formatError('Error al crear solicitud de servicio'));
  }
});

// GET /api/explorer/my-requests - Get Explorer's service requests
router.get('/my-requests', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const [requests] = await pool.execute(`
      SELECT esr.*, c.name as category_name, c.icon as category_icon,
             COUNT(asi.id) as interested_as_count,
             (SELECT COUNT(*) FROM as_service_interests WHERE request_id = esr.id AND status = 'pending') as pending_interests
      FROM explorer_service_requests esr
      INNER JOIN categories c ON esr.category_id = c.id
      LEFT JOIN as_service_interests asi ON esr.id = asi.request_id
      WHERE esr.explorer_id = ? AND esr.status = ?
      GROUP BY esr.id
      ORDER BY esr.created_at DESC
    `, [req.user.id, status]);

    res.json(formatResponse(requests, 'Solicitudes obtenidas exitosamente'));
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json(formatError('Error al obtener solicitudes'));
  }
});

// GET /api/explorer/request/:id/interests - Get AS interests for a specific request
router.get('/request/:id/interests', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify request belongs to explorer
    const [requestCheck] = await pool.execute(`
      SELECT id FROM explorer_service_requests WHERE id = ? AND explorer_id = ?
    `, [id, req.user.id]);

    if (requestCheck.length === 0) {
      return res.status(404).json(formatError('Solicitud no encontrada'));
    }

    const [interests] = await pool.execute(`
      SELECT asi.*, u.first_name, u.last_name, u.profile_image, u.verification_status,
             (SELECT AVG(rating) FROM explorer_as_reviews WHERE as_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM explorer_as_reviews WHERE as_id = u.id) as total_reviews,
             u.subscription_type
      FROM as_service_interests asi
      INNER JOIN users u ON asi.as_id = u.id
      WHERE asi.request_id = ?
      ORDER BY asi.created_at ASC
    `, [id]);

    // Mark interests as viewed by explorer
    await pool.execute(`
      UPDATE as_service_interests 
      SET viewed_by_explorer = TRUE 
      WHERE request_id = ? AND viewed_by_explorer = FALSE
    `, [id]);

    res.json(formatResponse(interests, 'Intereses obtenidos exitosamente'));
  } catch (error) {
    console.error('Get request interests error:', error);
    res.status(500).json(formatError('Error al obtener intereses'));
  }
});

// POST /api/explorer/accept-as - Accept an AS for a service request
router.post('/accept-as', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const { interest_id, final_agreed_price } = req.body;

    if (!interest_id) {
      return res.status(400).json(formatError('ID de interés es requerido'));
    }

    // Get interest details
    const [interests] = await pool.execute(`
      SELECT asi.*, esr.explorer_id, esr.id as request_id
      FROM as_service_interests asi
      INNER JOIN explorer_service_requests esr ON asi.request_id = esr.id
      WHERE asi.id = ? AND esr.explorer_id = ?
    `, [interest_id, req.user.id]);

    if (interests.length === 0) {
      return res.status(404).json(formatError('Interés no encontrado'));
    }

    const interest = interests[0];

    // Create chat room ID
    const chatRoomId = crypto.randomBytes(16).toString('hex');

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Accept the interest
      await pool.execute(`
        UPDATE as_service_interests 
        SET status = 'accepted' 
        WHERE id = ?
      `, [interest_id]);

      // Reject other interests for this request
      await pool.execute(`
        UPDATE as_service_interests 
        SET status = 'rejected' 
        WHERE request_id = ? AND id != ?
      `, [interest.request_id, interest_id]);

      // Update request status
      await pool.execute(`
        UPDATE explorer_service_requests 
        SET status = 'in_progress', selected_as_id = ? 
        WHERE id = ?
      `, [interest.as_id, interest.request_id]);

      // Create connection record
      const [connectionResult] = await pool.execute(`
        INSERT INTO explorer_as_connections (
          explorer_id, as_id, request_id, connection_type, chat_room_id,
          status, service_started_at, final_agreed_price
        )
        VALUES (?, ?, ?, 'service_request', ?, 'service_in_progress', NOW(), ?)
      `, [req.user.id, interest.as_id, interest.request_id, chatRoomId, final_agreed_price]);

      await pool.execute('COMMIT');

      // Notify AS via Socket.IO
      if (req.io) {
        req.io.to(`user_${interest.as_id}`).emit('service_accepted', {
          connection_id: connectionResult.insertId,
          chat_room_id: chatRoomId,
          explorer_name: `${req.user.first_name} ${req.user.last_name}`,
          message: 'Tu propuesta ha sido aceptada. ¡Puedes comenzar a chatear!'
        });
      }

      res.json(formatResponse({
        connection_id: connectionResult.insertId,
        chat_room_id: chatRoomId
      }, 'AS aceptado exitosamente. Chat iniciado.'));

    } catch (transactionError) {
      await pool.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Accept AS error:', error);
    res.status(500).json(formatError('Error al aceptar AS'));
  }
});

// GET /api/explorer/browse-as - Browse AS profiles by category
router.get('/browse-as', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const { 
      category_id, 
      locality, 
      min_rating = 0, 
      subscription_type,
      sort_by = 'rating', // rating, price, distance
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.profile_image, 
             u.verification_status, u.subscription_type, u.created_at,
             (SELECT AVG(rating) FROM explorer_as_reviews WHERE as_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM explorer_as_reviews WHERE as_id = u.id) as total_reviews,
             ap.base_price, ap.service_type, ap.currency,
             GROUP_CONCAT(DISTINCT awl.locality) as work_localities,
             upi.years_experience, upi.about_me,
             (SELECT COUNT(*) FROM as_portfolio WHERE user_id = u.id AND is_visible = TRUE) as portfolio_count
      FROM users u
      INNER JOIN as_work_categories awc ON u.id = awc.user_id
      LEFT JOIN as_pricing ap ON u.id = ap.user_id AND ap.category_id = awc.category_id
      LEFT JOIN as_work_locations awl ON u.id = awl.user_id
      LEFT JOIN user_professional_info upi ON u.id = upi.user_id
      WHERE u.user_type = 'provider' 
        AND u.verification_status = 'verified'
        AND awc.is_active = TRUE
    `;

    const params = [];

    if (category_id) {
      query += ' AND awc.category_id = ?';
      params.push(category_id);
    }

    if (locality) {
      query += ' AND awl.locality = ?';
      params.push(locality);
    }

    if (subscription_type) {
      query += ' AND u.subscription_type = ?';
      params.push(subscription_type);
    }

    query += ' GROUP BY u.id';

    if (min_rating > 0) {
      query += ' HAVING avg_rating >= ?';
      params.push(min_rating);
    }

    // Sorting
    if (sort_by === 'rating') {
      query += ' ORDER BY avg_rating DESC, total_reviews DESC';
    } else if (sort_by === 'price') {
      query += ' ORDER BY ap.base_price ASC';
    } else if (sort_by === 'newest') {
      query += ' ORDER BY u.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [profiles] = await pool.execute(query, params);

    res.json(formatResponse({
      profiles: profiles,
      total: profiles.length,
      has_more: profiles.length === parseInt(limit)
    }, 'Perfiles de AS obtenidos exitosamente'));

  } catch (error) {
    console.error('Browse AS error:', error);
    res.status(500).json(formatError('Error al explorar perfiles de AS'));
  }
});

// GET /api/explorer/as-profile/:id - Get detailed AS profile for Explorer view
router.get('/as-profile/:id', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const { id } = req.params;

    // Get AS basic info
    const [asInfo] = await pool.execute(`
      SELECT u.*, upi.*, 
             (SELECT AVG(rating) FROM explorer_as_reviews WHERE as_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM explorer_as_reviews WHERE as_id = u.id) as total_reviews
      FROM users u
      LEFT JOIN user_professional_info upi ON u.id = upi.user_id
      WHERE u.id = ? AND u.user_type = 'provider'
    `, [id]);

    if (asInfo.length === 0) {
      return res.status(404).json(formatError('Perfil de AS no encontrado'));
    }

    // Get work categories
    const [categories] = await pool.execute(`
      SELECT awc.*, c.name as category_name, c.icon as category_icon
      FROM as_work_categories awc
      INNER JOIN categories c ON awc.category_id = c.id
      WHERE awc.user_id = ? AND awc.is_active = TRUE
    `, [id]);

    // Get work locations
    const [locations] = await pool.execute(`
      SELECT * FROM as_work_locations 
      WHERE user_id = ? AND is_active = TRUE
    `, [id]);

    // Get pricing info
    const [pricing] = await pool.execute(`
      SELECT ap.*, c.name as category_name
      FROM as_pricing ap
      INNER JOIN categories c ON ap.category_id = c.id
      WHERE ap.user_id = ? AND ap.is_active = TRUE
    `, [id]);

    // Get portfolio (if visible)
    const [portfolio] = await pool.execute(`
      SELECT * FROM as_portfolio 
      WHERE user_id = ? AND is_visible = TRUE 
      ORDER BY is_featured DESC, sort_order ASC
      LIMIT 6
    `, [id]);

    // Get recent reviews
    const [reviews] = await pool.execute(`
      SELECT ear.*, u.first_name as explorer_name
      FROM explorer_as_reviews ear
      INNER JOIN users u ON ear.explorer_id = u.id
      WHERE ear.as_id = ?
      ORDER BY ear.created_at DESC
      LIMIT 5
    `, [id]);

    const profileData = {
      basic_info: asInfo[0],
      categories: categories,
      locations: locations,
      pricing: pricing,
      portfolio: portfolio,
      recent_reviews: reviews
    };

    res.json(formatResponse(profileData, 'Perfil de AS obtenido exitosamente'));
  } catch (error) {
    console.error('Get AS profile error:', error);
    res.status(500).json(formatError('Error al obtener perfil de AS'));
  }
});

// Helper function to notify relevant AS
const notifyRelevantAS = async (requestId, categoryId, locality, urgency, io) => {
  try {
    // Find AS that work in this category and locality
    const [relevantAS] = await pool.execute(`
      SELECT DISTINCT u.id, u.first_name, u.last_name
      FROM users u
      INNER JOIN as_work_categories awc ON u.id = awc.user_id
      INNER JOIN as_work_locations awl ON u.id = awl.user_id
      LEFT JOIN user_availability_status uas ON u.id = uas.user_id
      WHERE u.user_type = 'provider'
        AND u.subscription_type IN ('basic', 'premium')
        AND u.verification_status = 'verified'
        AND awc.category_id = ?
        AND awc.is_active = TRUE
        AND (awl.locality = ? OR awl.locality = 'Todas las localidades')
        AND awl.is_active = TRUE
        AND (uas.is_available = TRUE OR uas.availability_type = 'online')
    `, [categoryId, locality]);

    // Send notifications via Socket.IO
    if (io) {
      for (const as of relevantAS) {
        io.to(`user_${as.id}`).emit('new_service_request', {
          request_id: requestId,
          urgency: urgency,
          locality: locality,
          message: urgency === 'emergency' ? 
            '🚨 SOLICITUD URGENTE - Nueva oportunidad de trabajo' :
            '📢 Nueva solicitud de servicio en tu área'
        });
      }
    }

    console.log(`Notified ${relevantAS.length} AS about new service request ${requestId}`);
  } catch (error) {
    console.error('Error notifying relevant AS:', error);
  }
};

module.exports = router;