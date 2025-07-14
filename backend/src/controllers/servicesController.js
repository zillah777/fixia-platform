const { query } = require('../config/database');

// GET /api/services
exports.getServices = async (req, res) => {
  try {
    const {
      category,
      latitude,
      longitude,
      radius = 10,
      min_price,
      max_price,
      min_rating,
      search,
      page = 1,
      limit = 10
    } = req.query;

    let whereConditions = ['s.is_active = true'];
    let params = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (category && category !== 'all') {
      whereConditions.push(`s.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (min_price) {
      whereConditions.push(`s.price >= $${paramIndex}`);
      params.push(parseFloat(min_price));
      paramIndex++;
    }

    if (max_price) {
      whereConditions.push(`s.price <= $${paramIndex}`);
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    if (min_rating) {
      whereConditions.push(`s.average_rating >= $${paramIndex}`);
      params.push(parseFloat(min_rating));
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        s.title ILIKE $${paramIndex} OR 
        s.description ILIKE $${paramIndex} OR
        u.first_name ILIKE $${paramIndex} OR
        u.last_name ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Location-based search
    let distanceSelect = '';
    let orderBy = 'ORDER BY s.created_at DESC';
    
    if (latitude && longitude) {
      distanceSelect = `, 
        CASE 
          WHEN s.latitude IS NOT NULL AND s.longitude IS NOT NULL THEN
            6371 * acos(
              cos(radians($${paramIndex})) * 
              cos(radians(s.latitude)) * 
              cos(radians(s.longitude) - radians($${paramIndex + 1})) + 
              sin(radians($${paramIndex})) * 
              sin(radians(s.latitude))
            )
          ELSE NULL
        END as distance`;
      
      params.push(parseFloat(latitude), parseFloat(longitude));
      paramIndex += 2;

      if (radius) {
        whereConditions.push(`(
          s.latitude IS NULL OR s.longitude IS NULL OR
          6371 * acos(
            cos(radians($${paramIndex})) * 
            cos(radians(s.latitude)) * 
            cos(radians(s.longitude) - radians($${paramIndex + 1})) + 
            sin(radians($${paramIndex})) * 
            sin(radians(s.latitude))
          ) <= $${paramIndex + 2}
        )`);
        params.push(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
        paramIndex += 3;
      }

      orderBy = 'ORDER BY distance ASC NULLS LAST, s.average_rating DESC, s.created_at DESC';
    }

    // Pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const servicesQuery = `
      SELECT 
        s.id,
        s.provider_id,
        s.title,
        s.description,
        s.category,
        s.price,
        s.duration_minutes,
        s.latitude,
        s.longitude,
        s.address,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.first_name,
        u.last_name,
        u.profile_photo_url,
        u.is_verified,
        s.average_rating,
        s.total_reviews,
        COALESCE(
          array_agg(si.image_url ORDER BY si.sort_order) FILTER (WHERE si.image_url IS NOT NULL), 
          ARRAY[]::text[]
        ) as images
        ${distanceSelect}
      FROM services s
      JOIN users u ON s.provider_id = u.id
      LEFT JOIN service_images si ON s.id = si.service_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY s.id, u.first_name, u.last_name, u.profile_photo_url, u.is_verified
      ${orderBy}
      LIMIT $${paramIndex - 1} OFFSET $${paramIndex}
    `;

    const result = await query(servicesQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM services s
      JOIN users u ON s.provider_id = u.id
      WHERE ${whereConditions.slice(0, -2).join(' AND ')}
    `;
    
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Servicios obtenidos exitosamente',
      data: {
        services: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/services/:id
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        s.id,
        s.provider_id,
        s.title,
        s.description,
        s.category,
        s.price,
        s.duration_minutes,
        s.latitude,
        s.longitude,
        s.address,
        s.is_active,
        s.created_at,
        s.updated_at,
        u.first_name,
        u.last_name,
        u.profile_photo_url,
        u.is_verified,
        u.about_me,
        u.city,
        s.average_rating,
        s.total_reviews,
        COALESCE(
          array_agg(si.image_url ORDER BY si.sort_order) FILTER (WHERE si.image_url IS NOT NULL), 
          ARRAY[]::text[]
        ) as images
      FROM services s
      JOIN users u ON s.provider_id = u.id
      LEFT JOIN service_images si ON s.id = si.service_id
      WHERE s.id = $1 AND s.is_active = true
      GROUP BY s.id, u.first_name, u.last_name, u.profile_photo_url, u.is_verified, u.about_me, u.city
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    // Update views count
    await query(
      'UPDATE services SET views_count = views_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Servicio obtenido exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/services
exports.createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      category,
      price,
      duration_minutes,
      address,
      latitude,
      longitude,
      images = []
    } = req.body;

    // Validation
    if (!title || !description || !category || !price || !duration_minutes) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos requeridos deben ser proporcionados'
      });
    }

    const validCategories = ['plomeria', 'electricidad', 'limpieza', 'reparaciones', 'belleza', 'otros'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Categoría inválida'
      });
    }

    if (price <= 0 || duration_minutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Precio y duración deben ser mayores a 0'
      });
    }

    // Verify user is a provider
    const userResult = await query(
      'SELECT user_type FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].user_type !== 'provider') {
      return res.status(403).json({
        success: false,
        error: 'Solo los profesionales pueden crear servicios'
      });
    }

    // Create service
    const result = await query(`
      INSERT INTO services (
        provider_id, title, description, category, price, 
        duration_minutes, address, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      userId, title, description, category, price,
      duration_minutes, address, latitude, longitude
    ]);

    const service = result.rows[0];

    // Add images if provided
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(`
          INSERT INTO service_images (service_id, image_url, sort_order, is_primary)
          VALUES ($1, $2, $3, $4)
        `, [service.id, images[i], i, i === 0]);
      }
    }

    // Update user's created services count
    await query(
      'UPDATE users SET created_services_count = created_services_count + 1 WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: service
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/services/:id
exports.updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const allowedFields = [
      'title', 'description', 'category', 'price', 
      'duration_minutes', 'address', 'latitude', 'longitude', 'is_active'
    ];

    // Verify ownership
    const ownershipResult = await query(
      'SELECT provider_id FROM services WHERE id = $1',
      [id]
    );

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    if (ownershipResult.rows[0].provider_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar este servicio'
      });
    }

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
    values.push(id);

    const result = await query(`
      UPDATE services 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// DELETE /api/services/:id
exports.deleteService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const ownershipResult = await query(
      'SELECT provider_id FROM services WHERE id = $1',
      [id]
    );

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    if (ownershipResult.rows[0].provider_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este servicio'
      });
    }

    // Check for active bookings
    const activeBookingsResult = await query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE service_id = $1 AND status IN ('pending', 'confirmed', 'in_progress')`,
      [id]
    );

    if (parseInt(activeBookingsResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un servicio con reservas activas'
      });
    }

    // Delete service (cascade will handle images)
    await query('DELETE FROM services WHERE id = $1', [id]);

    // Update user's created services count
    await query(
      'UPDATE users SET created_services_count = created_services_count - 1 WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/services/provider/:providerId
exports.getServicesByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { includeInactive = false } = req.query;

    let whereClause = 's.provider_id = $1';
    if (!includeInactive) {
      whereClause += ' AND s.is_active = true';
    }

    const result = await query(`
      SELECT 
        s.id,
        s.provider_id,
        s.title,
        s.description,
        s.category,
        s.price,
        s.duration_minutes,
        s.latitude,
        s.longitude,
        s.address,
        s.is_active,
        s.created_at,
        s.updated_at,
        s.average_rating,
        s.total_reviews,
        COALESCE(
          array_agg(si.image_url ORDER BY si.sort_order) FILTER (WHERE si.image_url IS NOT NULL), 
          ARRAY[]::text[]
        ) as images
      FROM services s
      LEFT JOIN service_images si ON s.id = si.service_id
      WHERE ${whereClause}
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [providerId]);

    res.json({
      success: true,
      message: 'Servicios del proveedor obtenidos exitosamente',
      data: result.rows
    });

  } catch (error) {
    console.error('Get services by provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/services/categories
exports.getCategories = async (req, res) => {
  try {
    const result = await query(`
      SELECT slug as value, name as label, icon
      FROM categories 
      WHERE is_active = true
      ORDER BY name
    `);

    res.json({
      success: true,
      message: 'Categorías obtenidas exitosamente',
      data: result.rows
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};