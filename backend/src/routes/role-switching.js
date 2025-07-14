const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// POST /api/role-switching/switch-to-provider - Explorer switches to AS
router.post('/switch-to-provider', authMiddleware, async (req, res) => {
  try {
    const { switch_reason } = req.body;

    if (req.user.user_type !== 'client') {
      return res.status(400).json(formatError('Solo los exploradores pueden cambiar a proveedor de servicios'));
    }

    // Check if user has pending review obligations
    const [pendingReviews] = await pool.execute(`
      SELECT COUNT(*) as pending_count
      FROM explorer_review_obligations 
      WHERE explorer_id = ? AND is_reviewed = FALSE AND is_blocking_new_services = TRUE
    `, [req.user.id]);

    if (pendingReviews[0].pending_count > 0) {
      return res.status(403).json(formatError(
        `No puedes cambiar a proveedor mientras tengas ${pendingReviews[0].pending_count} calificaciones pendientes. ` +
        'Completa todas las calificaciones obligatorias antes de continuar.'
      ));
    }

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Record role switch history
      await pool.execute(`
        INSERT INTO user_role_history (user_id, old_user_type, new_user_type, switch_reason)
        VALUES (?, 'client', 'provider', ?)
      `, [req.user.id, switch_reason || 'Usuario decidió convertirse en proveedor de servicios']);

      // Update user type
      await pool.execute(`
        UPDATE users 
        SET user_type = 'provider', updated_at = NOW()
        WHERE id = ?
      `, [req.user.id]);

      // Create basic AS profile
      await pool.execute(`
        INSERT INTO user_professional_info (user_id, about_me, years_experience)
        VALUES (?, 'Nuevo proveedor de servicios registrado desde Explorer', 0)
        ON DUPLICATE KEY UPDATE updated_at = NOW()
      `, [req.user.id]);

      // Create default subscription (free)
      await pool.execute(`
        INSERT INTO user_subscriptions (user_id, subscription_type, status, starts_at, expires_at)
        VALUES (?, 'free', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
        ON DUPLICATE KEY UPDATE updated_at = NOW()
      `, [req.user.id]);

      await pool.execute('COMMIT');

      res.json(formatResponse({
        new_user_type: 'provider',
        switched_at: new Date().toISOString()
      }, 'Cambio exitoso: Ahora eres un AS (Anunciante de Servicios). Completa tu perfil profesional para comenzar.'));

    } catch (transactionError) {
      await pool.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Switch to provider error:', error);
    res.status(500).json(formatError('Error al cambiar a proveedor de servicios'));
  }
});

// POST /api/role-switching/switch-to-client - AS switches to Explorer
router.post('/switch-to-client', authMiddleware, async (req, res) => {
  try {
    const { switch_reason } = req.body;

    if (req.user.user_type !== 'provider') {
      return res.status(400).json(formatError('Solo los proveedores pueden cambiar a explorador'));
    }

    // Check if AS has active connections or pending services
    const [activeServices] = await pool.execute(`
      SELECT COUNT(*) as active_count
      FROM explorer_as_connections 
      WHERE as_id = ? AND status IN ('active', 'service_in_progress')
    `, [req.user.id]);

    if (activeServices[0].active_count > 0) {
      return res.status(403).json(formatError(
        `No puedes cambiar a explorador mientras tengas ${activeServices[0].active_count} servicios activos. ` +
        'Completa todos los servicios en progreso antes de continuar.'
      ));
    }

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Record role switch history
      await pool.execute(`
        INSERT INTO user_role_history (user_id, old_user_type, new_user_type, switch_reason)
        VALUES (?, 'provider', 'client', ?)
      `, [req.user.id, switch_reason || 'Usuario decidió convertirse en explorador de servicios']);

      // Update user type
      await pool.execute(`
        UPDATE users 
        SET user_type = 'client', updated_at = NOW()
        WHERE id = ?
      `, [req.user.id]);

      // Deactivate AS-specific settings
      await pool.execute(`
        UPDATE as_work_categories SET is_active = FALSE WHERE user_id = ?
      `, [req.user.id]);

      await pool.execute(`
        UPDATE as_work_locations SET is_active = FALSE WHERE user_id = ?
      `, [req.user.id]);

      await pool.execute(`
        UPDATE as_pricing SET is_active = FALSE WHERE user_id = ?
      `, [req.user.id]);

      // Create or update Explorer profile
      await pool.execute(`
        INSERT INTO explorer_profiles (user_id, preferred_localities, preferred_categories)
        VALUES (?, '[]', '[]')
        ON DUPLICATE KEY UPDATE updated_at = NOW()
      `, [req.user.id]);

      await pool.execute('COMMIT');

      res.json(formatResponse({
        new_user_type: 'client',
        switched_at: new Date().toISOString()
      }, 'Cambio exitoso: Ahora eres un Explorer. Puedes buscar y contratar servicios.'));

    } catch (transactionError) {
      await pool.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Switch to client error:', error);
    res.status(500).json(formatError('Error al cambiar a explorador'));
  }
});

// GET /api/role-switching/history - Get user's role switching history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const [history] = await pool.execute(`
      SELECT urh.*, u.first_name as approved_by_name, u.last_name as approved_by_last_name
      FROM user_role_history urh
      LEFT JOIN users u ON urh.approved_by = u.id
      WHERE urh.user_id = ?
      ORDER BY urh.switched_at DESC
    `, [req.user.id]);

    res.json(formatResponse(history, 'Historial de cambios de rol obtenido exitosamente'));
  } catch (error) {
    console.error('Get role history error:', error);
    res.status(500).json(formatError('Error al obtener historial de cambios'));
  }
});

// GET /api/role-switching/can-switch - Check if user can switch roles
router.get('/can-switch', authMiddleware, async (req, res) => {
  try {
    let canSwitch = true;
    let blockingReasons = [];

    if (req.user.user_type === 'client') {
      // Check Explorer review obligations
      const [pendingReviews] = await pool.execute(`
        SELECT COUNT(*) as pending_count
        FROM explorer_review_obligations 
        WHERE explorer_id = ? AND is_reviewed = FALSE AND is_blocking_new_services = TRUE
      `, [req.user.id]);

      if (pendingReviews[0].pending_count > 0) {
        canSwitch = false;
        blockingReasons.push(`Tienes ${pendingReviews[0].pending_count} calificaciones pendientes`);
      }

    } else if (req.user.user_type === 'provider') {
      // Check AS active services
      const [activeServices] = await pool.execute(`
        SELECT COUNT(*) as active_count
        FROM explorer_as_connections 
        WHERE as_id = ? AND status IN ('active', 'service_in_progress')
      `, [req.user.id]);

      if (activeServices[0].active_count > 0) {
        canSwitch = false;
        blockingReasons.push(`Tienes ${activeServices[0].active_count} servicios activos`);
      }

      // Check pending interest responses
      const [pendingInterests] = await pool.execute(`
        SELECT COUNT(*) as pending_count
        FROM as_service_interests asi
        INNER JOIN explorer_service_requests esr ON asi.request_id = esr.id
        WHERE asi.as_id = ? AND asi.status = 'pending' AND esr.status = 'active'
      `, [req.user.id]);

      if (pendingInterests[0].pending_count > 0) {
        blockingReasons.push(`Tienes ${pendingInterests[0].pending_count} propuestas pendientes (recomendamos completar antes del cambio)`);
      }
    }

    res.json(formatResponse({
      can_switch: canSwitch,
      current_role: req.user.user_type,
      target_role: req.user.user_type === 'client' ? 'provider' : 'client',
      blocking_reasons: blockingReasons,
      recommendations: canSwitch ? [] : [
        'Completa todas las obligaciones pendientes antes de cambiar de rol',
        'El cambio de rol es reversible en cualquier momento'
      ]
    }, 'Verificación de cambio de rol completada'));

  } catch (error) {
    console.error('Check role switch eligibility error:', error);
    res.status(500).json(formatError('Error al verificar elegibilidad'));
  }
});

// GET /api/role-switching/stats - Get platform role switching statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN old_user_type = 'client' AND new_user_type = 'provider' THEN 1 END) as explorer_to_as_switches,
        COUNT(CASE WHEN old_user_type = 'provider' AND new_user_type = 'client' THEN 1 END) as as_to_explorer_switches,
        COUNT(*) as total_switches,
        COUNT(DISTINCT user_id) as users_who_switched,
        COUNT(CASE WHEN switched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as switches_last_30_days
      FROM user_role_history 
      WHERE is_active = TRUE
    `);

    res.json(formatResponse(stats[0], 'Estadísticas de cambio de rol obtenidas exitosamente'));
  } catch (error) {
    console.error('Get role switching stats error:', error);
    res.status(500).json(formatError('Error al obtener estadísticas'));
  }
});

module.exports = router;