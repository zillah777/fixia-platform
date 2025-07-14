const { query } = require('../config/database');

// GET /api/reviews
exports.getReviews = async (req, res) => {
  try {
    const {
      provider_id,
      customer_id,
      service_id,
      min_rating,
      max_rating,
      page = 1,
      limit = 10
    } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (provider_id) {
      whereConditions.push(`r.provider_id = $${paramIndex}`);
      params.push(provider_id);
      paramIndex++;
    }

    if (customer_id) {
      whereConditions.push(`r.customer_id = $${paramIndex}`);
      params.push(customer_id);
      paramIndex++;
    }

    if (service_id) {
      whereConditions.push(`r.service_id = $${paramIndex}`);
      params.push(service_id);
      paramIndex++;
    }

    if (min_rating) {
      whereConditions.push(`r.rating >= $${paramIndex}`);
      params.push(parseInt(min_rating));
      paramIndex++;
    }

    if (max_rating) {
      whereConditions.push(`r.rating <= $${paramIndex}`);
      params.push(parseInt(max_rating));
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const reviewsQuery = `
      SELECT 
        r.id,
        r.customer_id,
        r.provider_id,
        r.service_id,
        r.booking_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        uc.first_name as customer_first_name,
        uc.last_name as customer_last_name,
        uc.profile_photo_url as customer_photo,
        up.first_name as provider_first_name,
        up.last_name as provider_last_name,
        up.profile_photo_url as provider_photo,
        s.title as service_title
      FROM reviews r
      JOIN users uc ON r.customer_id = uc.id
      JOIN users up ON r.provider_id = up.id
      JOIN services s ON r.service_id = s.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex - 1} OFFSET $${paramIndex}
    `;

    const result = await query(reviewsQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Reseñas obtenidas exitosamente',
      data: {
        reviews: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/reviews/:id
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        r.id,
        r.customer_id,
        r.provider_id,
        r.service_id,
        r.booking_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        uc.first_name as customer_first_name,
        uc.last_name as customer_last_name,
        uc.profile_photo_url as customer_photo,
        up.first_name as provider_first_name,
        up.last_name as provider_last_name,
        up.profile_photo_url as provider_photo,
        s.title as service_title,
        s.description as service_description
      FROM reviews r
      JOIN users uc ON r.customer_id = uc.id
      JOIN users up ON r.provider_id = up.id
      JOIN services s ON r.service_id = s.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Reseña obtenida exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { booking_id, rating, comment } = req.body;

    // Validation
    if (!booking_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'El ID de la reserva y la calificación son requeridos'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Check if booking exists and belongs to the customer
    const bookingResult = await query(`
      SELECT b.*, s.provider_id, s.id as service_id, s.title as service_title
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1 AND b.customer_id = $2
    `, [booking_id, customerId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    const booking = bookingResult.rows[0];

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden calificar reservas completadas'
      });
    }

    // Check if review already exists
    const existingReviewResult = await query(
      'SELECT id FROM reviews WHERE booking_id = $1',
      [booking_id]
    );

    if (existingReviewResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Esta reserva ya ha sido calificada'
      });
    }

    // Create review
    const result = await query(`
      INSERT INTO reviews (customer_id, provider_id, service_id, booking_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [customerId, booking.provider_id, booking.service_id, booking_id, rating, comment]);

    const review = result.rows[0];

    // Update service rating statistics
    await updateServiceRatingStats(booking.service_id);

    // Create notification for provider
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      booking.provider_id,
      'Nueva reseña recibida',
      `Has recibido una reseña de ${rating} estrellas para ${booking.service_title}`,
      'review',
      review.id
    ]);

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Check if review exists and belongs to the user
    const reviewResult = await query(`
      SELECT r.*, s.id as service_id
      FROM reviews r
      JOIN services s ON r.service_id = s.id
      WHERE r.id = $1 AND r.customer_id = $2
    `, [id, userId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    const review = reviewResult.rows[0];

    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Build update query
    const updates = {};
    const values = [];
    let paramIndex = 1;

    if (rating !== undefined) {
      updates.rating = `$${paramIndex}`;
      values.push(rating);
      paramIndex++;
    }

    if (comment !== undefined) {
      updates.comment = `$${paramIndex}`;
      values.push(comment);
      paramIndex++;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay campos para actualizar'
      });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ${updates[key]}`).join(', ');
    values.push(id);

    const result = await query(`
      UPDATE reviews 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    // Update service rating statistics if rating changed
    if (rating !== undefined) {
      await updateServiceRatingStats(review.service_id);
    }

    res.json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to the user
    const reviewResult = await query(`
      SELECT r.*, s.id as service_id
      FROM reviews r
      JOIN services s ON r.service_id = s.id
      WHERE r.id = $1 AND r.customer_id = $2
    `, [id, userId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    const review = reviewResult.rows[0];

    // Delete review
    await query('DELETE FROM reviews WHERE id = $1', [id]);

    // Update service rating statistics
    await updateServiceRatingStats(review.service_id);

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/reviews/provider/:providerId/stats
exports.getProviderReviewStats = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Get overall stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1
      FROM reviews 
      WHERE provider_id = $1
    `, [providerId]);

    const stats = statsResult.rows[0];

    // Get recent reviews
    const recentReviewsResult = await query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        uc.first_name as customer_first_name,
        uc.last_name as customer_last_name,
        uc.profile_photo_url as customer_photo,
        s.title as service_title
      FROM reviews r
      JOIN users uc ON r.customer_id = uc.id
      JOIN services s ON r.service_id = s.id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [providerId]);

    res.json({
      success: true,
      message: 'Estadísticas de reseñas obtenidas exitosamente',
      data: {
        total_reviews: parseInt(stats.total_reviews),
        average_rating: parseFloat(stats.average_rating),
        rating_distribution: {
          5: parseInt(stats.rating_5),
          4: parseInt(stats.rating_4),
          3: parseInt(stats.rating_3),
          2: parseInt(stats.rating_2),
          1: parseInt(stats.rating_1)
        },
        recent_reviews: recentReviewsResult.rows
      }
    });

  } catch (error) {
    console.error('Get provider review stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/reviews/service/:serviceId/stats
exports.getServiceReviewStats = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Get overall stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1
      FROM reviews 
      WHERE service_id = $1
    `, [serviceId]);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      message: 'Estadísticas de reseñas del servicio obtenidas exitosamente',
      data: {
        total_reviews: parseInt(stats.total_reviews),
        average_rating: parseFloat(stats.average_rating),
        rating_distribution: {
          5: parseInt(stats.rating_5),
          4: parseInt(stats.rating_4),
          3: parseInt(stats.rating_3),
          2: parseInt(stats.rating_2),
          1: parseInt(stats.rating_1)
        }
      }
    });

  } catch (error) {
    console.error('Get service review stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Helper function to update service rating statistics
async function updateServiceRatingStats(serviceId) {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating
      FROM reviews 
      WHERE service_id = $1
    `, [serviceId]);

    const stats = statsResult.rows[0];

    await query(`
      UPDATE services 
      SET 
        total_reviews = $1,
        average_rating = $2
      WHERE id = $3
    `, [
      parseInt(stats.total_reviews),
      parseFloat(stats.average_rating),
      serviceId
    ]);

  } catch (error) {
    console.error('Update service rating stats error:', error);
  }
}