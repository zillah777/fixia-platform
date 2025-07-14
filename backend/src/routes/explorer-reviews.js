const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// Middleware to ensure user is client (Explorer)
const requireExplorer = async (req, res, next) => {
  if (req.user.user_type !== 'client') {
    return res.status(403).json(formatError('Solo los exploradores pueden acceder a esta funcionalidad'));
  }
  next();
};

// GET /api/explorer-reviews/pending-obligations - Get pending review obligations
router.get('/pending-obligations', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const [obligations] = await pool.execute(`
      SELECT ero.*, eac.chat_room_id, eac.final_agreed_price,
             u.first_name as as_name, u.last_name as as_last_name,
             u.profile_image as as_profile_image, u.verification_status,
             esr.title as service_title, c.name as category_name,
             DATEDIFF(ero.review_due_date, NOW()) as days_remaining
      FROM explorer_review_obligations ero
      INNER JOIN explorer_as_connections eac ON ero.connection_id = eac.id
      INNER JOIN users u ON ero.as_id = u.id
      LEFT JOIN explorer_service_requests esr ON eac.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE ero.explorer_id = ? AND ero.is_reviewed = FALSE
      ORDER BY ero.review_due_date ASC
    `, [req.user.id]);

    // Mark overdue obligations as blocking
    const overdueObligations = obligations.filter(o => o.days_remaining < 0);
    if (overdueObligations.length > 0) {
      await pool.execute(`
        UPDATE explorer_review_obligations 
        SET is_blocking_new_services = TRUE 
        WHERE explorer_id = ? AND is_reviewed = FALSE AND review_due_date < NOW()
      `, [req.user.id]);
    }

    res.json(formatResponse({
      obligations: obligations,
      total_pending: obligations.length,
      blocking_count: obligations.filter(o => o.is_blocking_new_services || o.days_remaining < 0).length
    }, 'Obligaciones de calificación obtenidas exitosamente'));

  } catch (error) {
    console.error('Get pending obligations error:', error);
    res.status(500).json(formatError('Error al obtener obligaciones pendientes'));
  }
});

// POST /api/explorer-reviews/submit - Submit review for AS
router.post('/submit', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const {
      connection_id,
      rating,
      comment,
      service_quality_rating,
      punctuality_rating,
      communication_rating,
      value_for_money_rating,
      would_hire_again = true,
      recommend_to_others = true,
      review_photos = []
    } = req.body;

    if (!connection_id || !rating || !comment) {
      return res.status(400).json(formatError('ID de conexión, calificación y comentario son requeridos'));
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json(formatError('La calificación debe ser entre 1 y 5'));
    }

    // Verify connection and review obligation
    const [obligations] = await pool.execute(`
      SELECT ero.*, eac.explorer_id, eac.as_id, eac.request_id
      FROM explorer_review_obligations ero
      INNER JOIN explorer_as_connections eac ON ero.connection_id = eac.id
      WHERE ero.connection_id = ? AND ero.explorer_id = ? AND ero.is_reviewed = FALSE
    `, [connection_id, req.user.id]);

    if (obligations.length === 0) {
      return res.status(404).json(formatError('Obligación de calificación no encontrada o ya completada'));
    }

    const obligation = obligations[0];

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Insert review
      const [reviewResult] = await pool.execute(`
        INSERT INTO explorer_as_reviews (
          connection_id, explorer_id, as_id, request_id, rating, comment,
          service_quality_rating, punctuality_rating, communication_rating,
          value_for_money_rating, would_hire_again, recommend_to_others,
          review_photos, is_verified_review
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [
        connection_id, req.user.id, obligation.as_id, obligation.request_id,
        rating, comment, service_quality_rating, punctuality_rating,
        communication_rating, value_for_money_rating, would_hire_again,
        recommend_to_others, JSON.stringify(review_photos)
      ]);

      // Update obligation as completed
      await pool.execute(`
        UPDATE explorer_review_obligations 
        SET is_reviewed = TRUE, review_id = ?, is_blocking_new_services = FALSE
        WHERE id = ?
      `, [reviewResult.insertId, obligation.id]);

      await pool.execute('COMMIT');

      // Notify AS via Socket.IO
      if (req.io) {
        req.io.to(`user_${obligation.as_id}`).emit('new_review_received', {
          review_id: reviewResult.insertId,
          explorer_name: `${req.user.first_name} ${req.user.last_name}`,
          rating: rating,
          message: 'Has recibido una nueva calificación'
        });
      }

      res.json(formatResponse({
        review_id: reviewResult.insertId
      }, 'Calificación enviada exitosamente'));

    } catch (transactionError) {
      await pool.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json(formatError('Error al enviar calificación'));
  }
});

// GET /api/explorer-reviews/my-reviews - Get Explorer's submitted reviews
router.get('/my-reviews', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const [reviews] = await pool.execute(`
      SELECT ear.*, u.first_name as as_name, u.last_name as as_last_name,
             u.profile_image as as_profile_image,
             esr.title as service_title, c.name as category_name
      FROM explorer_as_reviews ear
      INNER JOIN users u ON ear.as_id = u.id
      LEFT JOIN explorer_service_requests esr ON ear.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE ear.explorer_id = ?
      ORDER BY ear.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), parseInt(offset)]);

    res.json(formatResponse(reviews, 'Calificaciones enviadas obtenidas exitosamente'));
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json(formatError('Error al obtener calificaciones enviadas'));
  }
});

// GET /api/explorer-reviews/blocking-status - Check if Explorer is blocked from new services
router.get('/blocking-status', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const [blockingCheck] = await pool.execute(`
      SELECT COUNT(*) as blocking_reviews,
             GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as pending_as_names
      FROM explorer_review_obligations ero
      INNER JOIN users u ON ero.as_id = u.id
      WHERE ero.explorer_id = ? AND ero.is_reviewed = FALSE AND ero.is_blocking_new_services = TRUE
    `, [req.user.id]);

    const isBlocked = blockingCheck[0].blocking_reviews > 0;

    res.json(formatResponse({
      is_blocked: isBlocked,
      blocking_reviews_count: blockingCheck[0].blocking_reviews,
      pending_as_names: blockingCheck[0].pending_as_names,
      message: isBlocked 
        ? `Debes calificar a ${blockingCheck[0].blocking_reviews} AS antes de poder buscar nuevos servicios`
        : 'Puedes buscar nuevos servicios normalmente'
    }, 'Estado de bloqueo verificado'));

  } catch (error) {
    console.error('Check blocking status error:', error);
    res.status(500).json(formatError('Error al verificar estado de bloqueo'));
  }
});

// PUT /api/explorer-reviews/:reviewId - Update review (within 24 hours)
router.put('/:reviewId', authMiddleware, requireExplorer, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      rating,
      comment,
      service_quality_rating,
      punctuality_rating,
      communication_rating,
      value_for_money_rating,
      would_hire_again,
      recommend_to_others
    } = req.body;

    // Verify review belongs to Explorer and is recent (within 24 hours)
    const [reviews] = await pool.execute(`
      SELECT * FROM explorer_as_reviews 
      WHERE id = ? AND explorer_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `, [reviewId, req.user.id]);

    if (reviews.length === 0) {
      return res.status(404).json(formatError('Calificación no encontrada o no editable (solo se puede editar dentro de las primeras 24 horas)'));
    }

    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;
    if (service_quality_rating !== undefined) updates.service_quality_rating = service_quality_rating;
    if (punctuality_rating !== undefined) updates.punctuality_rating = punctuality_rating;
    if (communication_rating !== undefined) updates.communication_rating = communication_rating;
    if (value_for_money_rating !== undefined) updates.value_for_money_rating = value_for_money_rating;
    if (would_hire_again !== undefined) updates.would_hire_again = would_hire_again;
    if (recommend_to_others !== undefined) updates.recommend_to_others = recommend_to_others;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.execute(`
      UPDATE explorer_as_reviews 
      SET ${setClause}, updated_at = NOW()
      WHERE id = ?
    `, [...values, reviewId]);

    res.json(formatResponse(null, 'Calificación actualizada exitosamente'));
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json(formatError('Error al actualizar calificación'));
  }
});

// GET /api/explorer-reviews/as/:asId - Get reviews for specific AS
router.get('/as/:asId', authMiddleware, async (req, res) => {
  try {
    const { asId } = req.params;
    const { limit = 10, offset = 0, sort_by = 'recent' } = req.query;

    let orderClause = 'ear.created_at DESC';
    if (sort_by === 'rating_high') orderClause = 'ear.rating DESC, ear.created_at DESC';
    if (sort_by === 'rating_low') orderClause = 'ear.rating ASC, ear.created_at DESC';

    const [reviews] = await pool.execute(`
      SELECT ear.*, u.first_name as explorer_name,
             esr.title as service_title, c.name as category_name
      FROM explorer_as_reviews ear
      INNER JOIN users u ON ear.explorer_id = u.id
      LEFT JOIN explorer_service_requests esr ON ear.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE ear.as_id = ?
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `, [asId, parseInt(limit), parseInt(offset)]);

    // Get review statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        AVG(service_quality_rating) as avg_service_quality,
        AVG(punctuality_rating) as avg_punctuality,
        AVG(communication_rating) as avg_communication,
        AVG(value_for_money_rating) as avg_value_for_money,
        SUM(CASE WHEN would_hire_again = TRUE THEN 1 ELSE 0 END) as would_hire_again_count,
        SUM(CASE WHEN recommend_to_others = TRUE THEN 1 ELSE 0 END) as recommend_count
      FROM explorer_as_reviews 
      WHERE as_id = ?
    `, [asId]);

    res.json(formatResponse({
      reviews: reviews,
      statistics: stats[0],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: reviews.length === parseInt(limit)
      }
    }, 'Calificaciones de AS obtenidas exitosamente'));

  } catch (error) {
    console.error('Get AS reviews error:', error);
    res.status(500).json(formatError('Error al obtener calificaciones de AS'));
  }
});

module.exports = router;