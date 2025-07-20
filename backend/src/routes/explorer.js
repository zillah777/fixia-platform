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
    let profileResult = await query(`
      SELECT ep.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image,
             (SELECT AVG(rating) FROM as_explorer_reviews WHERE explorer_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM as_explorer_reviews WHERE explorer_id = u.id) as total_reviews
      FROM users u
      LEFT JOIN explorer_profiles ep ON u.id = ep.user_id
      WHERE u.id = $1
    `, [req.user.id]);

    if (profileResult.rows.length === 0 || !profileResult.rows[0].user_id) {
      // Create default explorer profile
      await query(`
        INSERT INTO explorer_profiles (user_id, preferred_localities, preferred_categories)
        VALUES ($1, '[]', '[]')
      `, [req.user.id]);
      
      profileResult = await query(`
        SELECT ep.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image,
               0 as avg_rating, 0 as total_reviews
        FROM users u
        INNER JOIN explorer_profiles ep ON u.id = ep.user_id
        WHERE u.id = $1
      `, [req.user.id]);
    }

    const profile = profileResult.rows[0];
    const explorerProfile = {
      ...profile,
      preferred_localities: profile.preferred_localities ? JSON.parse(profile.preferred_localities) : [],
      preferred_categories: profile.preferred_categories ? JSON.parse(profile.preferred_categories) : []
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

    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);

    await query(`
      INSERT INTO explorer_profiles (user_id, ${Object.keys(updates).join(', ')})
      VALUES ($1, ${Object.keys(updates).map((_, index) => `$${index + 2}`).join(', ')})
      ON CONFLICT (user_id) DO UPDATE SET ${setClause}, updated_at = NOW()
    `, [req.user.id, ...values]);

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
    const obligationsResult = await query(`
      SELECT COUNT(*) as pending_reviews 
      FROM explorer_review_obligations 
      WHERE explorer_id = $1 AND is_reviewed = FALSE AND is_blocking_new_services = TRUE
    `, [req.user.id]);

    if (obligationsResult.rows[0].pending_reviews > 0) {
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

    // Verify locality exists in Chubut (with debugging)
    console.log('🏘️ Validating locality:', locality);
    
    try {
      const localityResult = await query(`
        SELECT id FROM chubut_localities WHERE name ILIKE $1 AND is_active = TRUE
      `, [locality]);

      console.log('🏘️ Locality validation result:', localityResult.rows.length);

      if (localityResult.rows.length === 0) {
        // Try to find similar localities for debugging
        const similarResult = await query(`
          SELECT name FROM chubut_localities WHERE name ILIKE $1 LIMIT 3
        `, [`%${locality}%`]);
        
        console.log('🏘️ Similar localities found:', similarResult.rows);
        
        return res.status(400).json(formatError(
          `La localidad "${locality}" no está disponible en Chubut. ` +
          (similarResult.rows.length > 0 ? 
            `Localidades similares: ${similarResult.rows.map(r => r.name).join(', ')}` : 
            'No se encontraron localidades similares.')
        ));
      }
    } catch (localityError) {
      console.error('🏘️ Locality validation error:', localityError);
      // Continue without strict validation if there's a database error
      console.log('🏘️ Continuing without strict locality validation');
    }

    // Calculate expiry date (7 days for normal, 3 days for urgent, 1 day for emergency)
    const expiryHours = { low: 168, medium: 120, high: 72, emergency: 24 };
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + (expiryHours[urgency] || 120));

    // Validate and clean date/time fields
    const cleanPreferredDate = preferred_date && preferred_date.trim() !== '' ? preferred_date : null;
    const cleanPreferredTime = preferred_time && preferred_time.trim() !== '' ? preferred_time : null;

    console.log('📝 Creating service request with params:', {
      explorer_id: req.user.id,
      category_id,
      title,
      description,
      locality,
      specific_address,
      urgency,
      budget_min,
      budget_max,
      preferred_date: cleanPreferredDate,
      preferred_time: cleanPreferredTime,
      flexible_timing,
      expires_at: expiryDate
    });

    const result = await query(`
      INSERT INTO explorer_service_requests (
        explorer_id, category_id, title, description, locality, specific_address,
        urgency, budget_min, budget_max, preferred_date, preferred_time, 
        flexible_timing, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [
      req.user.id, category_id, title, description, locality, specific_address,
      urgency, budget_min, budget_max, cleanPreferredDate, cleanPreferredTime, 
      flexible_timing, expiryDate
    ]);

    const insertId = result.rows[0].id;

    // Notify relevant AS professionals
    await notifyRelevantAS(insertId, category_id, locality, urgency, req.io);

    res.json(formatResponse({
      request_id: insertId,
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

    const result = await query(`
      SELECT esr.*, c.name as category_name, c.icon as category_icon,
             COUNT(asi.id) as interested_as_count,
             (SELECT COUNT(*) FROM as_service_interests WHERE request_id = esr.id AND status = 'pending') as pending_interests
      FROM explorer_service_requests esr
      INNER JOIN categories c ON esr.category_id = c.id
      LEFT JOIN as_service_interests asi ON esr.id = asi.request_id
      WHERE esr.explorer_id = $1 AND esr.status = $2
      GROUP BY esr.id, c.name, c.icon
      ORDER BY esr.created_at DESC
    `, [req.user.id, status]);

    res.json(formatResponse(result.rows, 'Solicitudes obtenidas exitosamente'));
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
    const requestCheckResult = await query(`
      SELECT id FROM explorer_service_requests WHERE id = $1 AND explorer_id = $2
    `, [id, req.user.id]);

    if (requestCheckResult.rows.length === 0) {
      return res.status(404).json(formatError('Solicitud no encontrada'));
    }

    const interestsResult = await query(`
      SELECT asi.*, u.first_name, u.last_name, u.profile_image, u.verification_status,
             (SELECT AVG(rating) FROM explorer_as_reviews WHERE as_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM explorer_as_reviews WHERE as_id = u.id) as total_reviews,
             u.subscription_type
      FROM as_service_interests asi
      INNER JOIN users u ON asi.as_id = u.id
      WHERE asi.request_id = $1
      ORDER BY asi.created_at ASC
    `, [id]);

    // Mark interests as viewed by explorer
    await query(`
      UPDATE as_service_interests 
      SET viewed_by_explorer = TRUE 
      WHERE request_id = $1 AND viewed_by_explorer = FALSE
    `, [id]);

    res.json(formatResponse(interestsResult.rows, 'Intereses obtenidos exitosamente'));
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
    const interestsResult = await query(`
      SELECT asi.*, esr.explorer_id, esr.id as request_id
      FROM as_service_interests asi
      INNER JOIN explorer_service_requests esr ON asi.request_id = esr.id
      WHERE asi.id = $1 AND esr.explorer_id = $2
    `, [interest_id, req.user.id]);

    if (interestsResult.rows.length === 0) {
      return res.status(404).json(formatError('Interés no encontrado'));
    }

    const interest = interestsResult.rows[0];

    // Create chat room ID
    const chatRoomId = crypto.randomBytes(16).toString('hex');

    // Start transaction
    await query('BEGIN');

    try {
      // Accept the interest
      await query(`
        UPDATE as_service_interests 
        SET status = 'accepted' 
        WHERE id = $1
      `, [interest_id]);

      // Reject other interests for this request
      await query(`
        UPDATE as_service_interests 
        SET status = 'rejected' 
        WHERE request_id = $1 AND id != $2
      `, [interest.request_id, interest_id]);

      // Update request status
      await query(`
        UPDATE explorer_service_requests 
        SET status = 'in_progress', selected_as_id = $1 
        WHERE id = $2
      `, [interest.as_id, interest.request_id]);

      // Create connection record
      const connectionResult = await query(`
        INSERT INTO explorer_as_connections (
          explorer_id, as_id, request_id, connection_type, chat_room_id,
          status, service_started_at, final_agreed_price
        )
        VALUES ($1, $2, $3, 'service_request', $4, 'service_in_progress', NOW(), $5)
        RETURNING id
      `, [req.user.id, interest.as_id, interest.request_id, chatRoomId, final_agreed_price]);

      await query('COMMIT');

      // Notify AS via Socket.IO
      if (req.io) {
        req.io.to(`user_${interest.as_id}`).emit('service_accepted', {
          connection_id: connectionResult.rows[0].id,
          chat_room_id: chatRoomId,
          explorer_name: `${req.user.first_name} ${req.user.last_name}`,
          message: 'Tu propuesta ha sido aceptada. ¡Puedes comenzar a chatear!'
        });
      }

      res.json(formatResponse({
        connection_id: connectionResult.rows[0].id,
        chat_room_id: chatRoomId
      }, 'AS aceptado exitosamente. Chat iniciado.'));

    } catch (transactionError) {
      await query('ROLLBACK');
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

    let sqlQuery = `
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.profile_image, 
             u.verification_status, u.subscription_type, u.created_at,
             (SELECT AVG(rating) FROM explorer_as_reviews WHERE as_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM explorer_as_reviews WHERE as_id = u.id) as total_reviews,
             ap.base_price, ap.service_type, ap.currency,
             STRING_AGG(DISTINCT awl.locality, ', ') as work_localities,
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
    let paramIndex = 1;

    if (category_id) {
      sqlQuery += ` AND awc.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (locality) {
      sqlQuery += ` AND awl.locality = $${paramIndex}`;
      params.push(locality);
      paramIndex++;
    }

    if (subscription_type) {
      sqlQuery += ` AND u.subscription_type = $${paramIndex}`;
      params.push(subscription_type);
      paramIndex++;
    }

    sqlQuery += ` GROUP BY u.id, u.first_name, u.last_name, u.profile_image, u.verification_status, 
                         u.subscription_type, u.created_at, ap.base_price, ap.service_type, 
                         ap.currency, upi.years_experience, upi.about_me`;

    if (min_rating > 0) {
      sqlQuery += ` HAVING AVG((SELECT AVG(rating) FROM explorer_as_reviews WHERE as_id = u.id)) >= $${paramIndex}`;
      params.push(min_rating);
      paramIndex++;
    }

    // Sorting
    if (sort_by === 'rating') {
      sqlQuery += ' ORDER BY avg_rating DESC, total_reviews DESC';
    } else if (sort_by === 'price') {
      sqlQuery += ' ORDER BY ap.base_price ASC';
    } else if (sort_by === 'newest') {
      sqlQuery += ' ORDER BY u.created_at DESC';
    }

    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const profilesResult = await query(sqlQuery, params);

    res.json(formatResponse({
      profiles: profilesResult.rows,
      total: profilesResult.rows.length,
      has_more: profilesResult.rows.length === parseInt(limit)
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
    const asInfoResult = await query(`
      SELECT u.*, upi.*, 
             (SELECT AVG(rating) FROM explorer_as_reviews WHERE as_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM explorer_as_reviews WHERE as_id = u.id) as total_reviews
      FROM users u
      LEFT JOIN user_professional_info upi ON u.id = upi.user_id
      WHERE u.id = $1 AND u.user_type = 'provider'
    `, [id]);

    if (asInfoResult.rows.length === 0) {
      return res.status(404).json(formatError('Perfil de AS no encontrado'));
    }

    // Get work categories
    const categoriesResult = await query(`
      SELECT awc.*, c.name as category_name, c.icon as category_icon
      FROM as_work_categories awc
      INNER JOIN categories c ON awc.category_id = c.id
      WHERE awc.user_id = $1 AND awc.is_active = TRUE
    `, [id]);

    // Get work locations
    const locationsResult = await query(`
      SELECT * FROM as_work_locations 
      WHERE user_id = $1 AND is_active = TRUE
    `, [id]);

    // Get pricing info
    const pricingResult = await query(`
      SELECT ap.*, c.name as category_name
      FROM as_pricing ap
      INNER JOIN categories c ON ap.category_id = c.id
      WHERE ap.user_id = $1 AND ap.is_active = TRUE
    `, [id]);

    // Get portfolio (if visible)
    const portfolioResult = await query(`
      SELECT * FROM as_portfolio 
      WHERE user_id = $1 AND is_visible = TRUE 
      ORDER BY is_featured DESC, sort_order ASC
      LIMIT 6
    `, [id]);

    // Get recent reviews
    const reviewsResult = await query(`
      SELECT ear.*, u.first_name as explorer_name
      FROM explorer_as_reviews ear
      INNER JOIN users u ON ear.explorer_id = u.id
      WHERE ear.as_id = $1
      ORDER BY ear.created_at DESC
      LIMIT 5
    `, [id]);

    const profileData = {
      basic_info: asInfoResult.rows[0],
      categories: categoriesResult.rows,
      locations: locationsResult.rows,
      pricing: pricingResult.rows,
      portfolio: portfolioResult.rows,
      recent_reviews: reviewsResult.rows
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
    const relevantASResult = await query(`
      SELECT DISTINCT u.id, u.first_name, u.last_name
      FROM users u
      INNER JOIN as_work_categories awc ON u.id = awc.user_id
      INNER JOIN as_work_locations awl ON u.id = awl.user_id
      LEFT JOIN user_availability_status uas ON u.id = uas.user_id
      WHERE u.user_type = 'provider'
        AND u.subscription_type IN ('basic', 'premium')
        AND u.verification_status = 'verified'
        AND awc.category_id = $1
        AND awc.is_active = TRUE
        AND (awl.locality = $2 OR awl.locality = 'Todas las localidades')
        AND awl.is_active = TRUE
        AND (uas.is_available = TRUE OR uas.availability_type = 'online')
    `, [categoryId, locality]);
    const relevantAS = relevantASResult.rows;

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