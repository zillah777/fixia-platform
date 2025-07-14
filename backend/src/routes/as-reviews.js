const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// Middleware to ensure user is provider (AS)
const requireProvider = async (req, res, next) => {
  if (req.user.user_type !== 'provider') {
    return res.status(403).json(formatError('Solo los AS pueden acceder a esta funcionalidad'));
  }
  next();
};

// GET /api/as-reviews/pending-obligations - Get pending review obligations for AS
router.get('/pending-obligations', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [obligations] = await pool.execute(`
      SELECT aro.*, eac.chat_room_id, eac.final_agreed_price,
             u.first_name as explorer_name, u.last_name as explorer_last_name,
             u.profile_image as explorer_profile_image,
             esr.title as service_title, c.name as category_name,
             DATEDIFF(aro.review_due_date, NOW()) as days_remaining
      FROM as_review_obligations aro
      INNER JOIN explorer_as_connections eac ON aro.connection_id = eac.id
      INNER JOIN users u ON aro.explorer_id = u.id
      LEFT JOIN explorer_service_requests esr ON eac.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE aro.as_id = ? AND aro.is_reviewed = FALSE
      ORDER BY aro.review_due_date ASC
    `, [req.user.id]);

    // Mark overdue obligations as blocking
    const overdueObligations = obligations.filter(o => o.days_remaining < 0);
    if (overdueObligations.length > 0) {
      await pool.execute(`
        UPDATE as_review_obligations 
        SET is_blocking_new_services = TRUE 
        WHERE as_id = ? AND is_reviewed = FALSE AND review_due_date < NOW()
      `, [req.user.id]);
    }

    res.json(formatResponse({
      obligations: obligations,
      total_pending: obligations.length,
      blocking_count: obligations.filter(o => o.is_blocking_new_services || o.days_remaining < 0).length
    }, 'Obligaciones de calificación obtenidas exitosamente'));

  } catch (error) {
    console.error('Get AS pending obligations error:', error);
    res.status(500).json(formatError('Error al obtener obligaciones pendientes'));
  }
});

// POST /api/as-reviews/submit - Submit review for Explorer
router.post('/submit', authMiddleware, requireProvider, async (req, res) => {
  try {
    const {
      connection_id,
      rating,
      comment,
      payment_reliability_rating,
      communication_rating,
      clarity_of_requirements_rating,
      respect_rating,
      would_work_again = true,
      recommend_to_others = true
    } = req.body;

    if (!connection_id || !rating || !comment) {
      return res.status(400).json(formatError('ID de conexión, calificación y comentario son requeridos'));
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json(formatError('La calificación debe ser entre 1 y 5'));
    }

    // Verify connection and review obligation
    const [obligations] = await pool.execute(`
      SELECT aro.*, eac.as_id, eac.explorer_id, eac.request_id
      FROM as_review_obligations aro
      INNER JOIN explorer_as_connections eac ON aro.connection_id = eac.id
      WHERE aro.connection_id = ? AND aro.as_id = ? AND aro.is_reviewed = FALSE
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
        INSERT INTO as_explorer_reviews (
          connection_id, as_id, explorer_id, request_id, rating, comment,
          payment_reliability_rating, communication_rating, clarity_of_requirements_rating,
          respect_rating, would_work_again, recommend_to_others
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        connection_id, req.user.id, obligation.explorer_id, obligation.request_id,
        rating, comment, payment_reliability_rating, communication_rating,
        clarity_of_requirements_rating, respect_rating, would_work_again, recommend_to_others
      ]);

      // Update obligation as completed
      await pool.execute(`
        UPDATE as_review_obligations 
        SET is_reviewed = TRUE, review_id = ?, is_blocking_new_services = FALSE
        WHERE id = ?
      `, [reviewResult.insertId, obligation.id]);

      await pool.execute('COMMIT');

      // Notify Explorer via Socket.IO
      if (req.io) {
        req.io.to(`user_${obligation.explorer_id}`).emit('new_review_from_as', {
          review_id: reviewResult.insertId,
          as_name: `${req.user.first_name} ${req.user.last_name}`,
          rating: rating,
          message: 'Has recibido una nueva calificación de un AS'
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
    console.error('Submit AS review error:', error);
    res.status(500).json(formatError('Error al enviar calificación'));
  }
});

// GET /api/as-reviews/my-reviews - Get AS's submitted reviews
router.get('/my-reviews', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const [reviews] = await pool.execute(`
      SELECT aer.*, u.first_name as explorer_name, u.last_name as explorer_last_name,
             u.profile_image as explorer_profile_image,
             esr.title as service_title, c.name as category_name
      FROM as_explorer_reviews aer
      INNER JOIN users u ON aer.explorer_id = u.id
      LEFT JOIN explorer_service_requests esr ON aer.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE aer.as_id = ?
      ORDER BY aer.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), parseInt(offset)]);

    res.json(formatResponse(reviews, 'Calificaciones enviadas obtenidas exitosamente'));
  } catch (error) {
    console.error('Get AS reviews error:', error);
    res.status(500).json(formatError('Error al obtener calificaciones enviadas'));
  }
});

// GET /api/as-reviews/blocking-status - Check if AS is blocked from new services
router.get('/blocking-status', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [blockingCheck] = await pool.execute(`
      SELECT COUNT(*) as blocking_reviews,
             GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as pending_explorer_names
      FROM as_review_obligations aro
      INNER JOIN users u ON aro.explorer_id = u.id
      WHERE aro.as_id = ? AND aro.is_reviewed = FALSE AND aro.is_blocking_new_services = TRUE
    `, [req.user.id]);

    const isBlocked = blockingCheck[0].blocking_reviews > 0;

    res.json(formatResponse({
      is_blocked: isBlocked,
      blocking_reviews_count: blockingCheck[0].blocking_reviews,
      pending_explorer_names: blockingCheck[0].pending_explorer_names,
      message: isBlocked 
        ? `Debes calificar a ${blockingCheck[0].blocking_reviews} Exploradores antes de poder aceptar nuevos trabajos`
        : 'Puedes aceptar nuevos trabajos normalmente'
    }, 'Estado de bloqueo verificado'));

  } catch (error) {
    console.error('Check AS blocking status error:', error);
    res.status(500).json(formatError('Error al verificar estado de bloqueo'));
  }
});

// PUT /api/as-reviews/:reviewId - Update review (within 24 hours)
router.put('/:reviewId', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      rating,
      comment,
      payment_reliability_rating,
      communication_rating,
      clarity_of_requirements_rating,
      respect_rating,
      would_work_again,
      recommend_to_others
    } = req.body;

    // Verify review belongs to AS and is recent (within 24 hours)
    const [reviews] = await pool.execute(`
      SELECT * FROM as_explorer_reviews 
      WHERE id = ? AND as_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `, [reviewId, req.user.id]);

    if (reviews.length === 0) {
      return res.status(404).json(formatError('Calificación no encontrada o no editable (solo se puede editar dentro de las primeras 24 horas)'));
    }

    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;
    if (payment_reliability_rating !== undefined) updates.payment_reliability_rating = payment_reliability_rating;
    if (communication_rating !== undefined) updates.communication_rating = communication_rating;
    if (clarity_of_requirements_rating !== undefined) updates.clarity_of_requirements_rating = clarity_of_requirements_rating;
    if (respect_rating !== undefined) updates.respect_rating = respect_rating;
    if (would_work_again !== undefined) updates.would_work_again = would_work_again;
    if (recommend_to_others !== undefined) updates.recommend_to_others = recommend_to_others;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.execute(`
      UPDATE as_explorer_reviews 
      SET ${setClause}, updated_at = NOW()
      WHERE id = ?
    `, [...values, reviewId]);

    res.json(formatResponse(null, 'Calificación actualizada exitosamente'));
  } catch (error) {
    console.error('Update AS review error:', error);
    res.status(500).json(formatError('Error al actualizar calificación'));
  }
});

// GET /api/as-reviews/explorer/:explorerId - Get reviews for specific Explorer
router.get('/explorer/:explorerId', authMiddleware, async (req, res) => {
  try {
    const { explorerId } = req.params;
    const { limit = 10, offset = 0, sort_by = 'recent' } = req.query;

    let orderClause = 'aer.created_at DESC';
    if (sort_by === 'rating_high') orderClause = 'aer.rating DESC, aer.created_at DESC';
    if (sort_by === 'rating_low') orderClause = 'aer.rating ASC, aer.created_at DESC';

    const [reviews] = await pool.execute(`
      SELECT aer.*, u.first_name as as_name, u.last_name as as_last_name,
             esr.title as service_title, c.name as category_name
      FROM as_explorer_reviews aer
      INNER JOIN users u ON aer.as_id = u.id
      LEFT JOIN explorer_service_requests esr ON aer.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE aer.explorer_id = ?
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `, [explorerId, parseInt(limit), parseInt(offset)]);

    // Get review statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        AVG(payment_reliability_rating) as avg_payment_reliability,
        AVG(communication_rating) as avg_communication,
        AVG(clarity_of_requirements_rating) as avg_clarity,
        AVG(respect_rating) as avg_respect,
        SUM(CASE WHEN would_work_again = TRUE THEN 1 ELSE 0 END) as would_work_again_count,
        SUM(CASE WHEN recommend_to_others = TRUE THEN 1 ELSE 0 END) as recommend_count
      FROM as_explorer_reviews 
      WHERE explorer_id = ?
    `, [explorerId]);

    res.json(formatResponse({
      reviews: reviews,
      statistics: stats[0],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: reviews.length === parseInt(limit)
      }
    }, 'Calificaciones de Explorador obtenidas exitosamente'));

  } catch (error) {
    console.error('Get Explorer reviews error:', error);
    res.status(500).json(formatError('Error al obtener calificaciones de Explorador'));
  }
});

module.exports = router;