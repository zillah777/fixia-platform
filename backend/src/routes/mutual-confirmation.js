const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// POST /api/mutual-confirmation/confirm-completion/:connectionId - Confirm service completion
router.post('/confirm-completion/:connectionId', authMiddleware, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const {
      confirmation_message,
      work_quality_satisfaction = 'good',
      payment_received, // Solo para AS
      service_delivered // Solo para Explorer
    } = req.body;

    // Verify connection exists and user has access
    const [connections] = await pool.execute(`
      SELECT eac.*, 
             CASE WHEN eac.explorer_id = ? THEN 'explorer' ELSE 'as' END as user_role
      FROM explorer_as_connections eac
      WHERE eac.id = ? AND (eac.explorer_id = ? OR eac.as_id = ?) AND eac.status = 'service_in_progress'
    `, [req.user.id, connectionId, req.user.id, req.user.id]);

    if (connections.length === 0) {
      return res.status(404).json(formatError('Conexión no encontrada o no válida'));
    }

    const connection = connections[0];
    const userRole = connection.user_role;

    // Check if user already confirmed
    const [existingConfirmation] = await pool.execute(`
      SELECT id FROM service_completion_confirmations 
      WHERE connection_id = ? AND user_id = ?
    `, [connectionId, req.user.id]);

    if (existingConfirmation.length > 0) {
      return res.status(400).json(formatError('Ya confirmaste la finalización de este servicio'));
    }

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Insert confirmation
      await pool.execute(`
        INSERT INTO service_completion_confirmations (
          connection_id, user_id, user_type, confirmation_message,
          work_quality_satisfaction, payment_received, service_delivered
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        connectionId, req.user.id, userRole, confirmation_message,
        work_quality_satisfaction, 
        userRole === 'as' ? (payment_received || false) : null,
        userRole === 'explorer' ? (service_delivered || false) : null
      ]);

      // Update connection confirmation status
      if (userRole === 'explorer') {
        await pool.execute(`
          UPDATE explorer_as_connections 
          SET explorer_confirmed_completion = TRUE, explorer_confirmed_at = NOW()
          WHERE id = ?
        `, [connectionId]);
      } else {
        await pool.execute(`
          UPDATE explorer_as_connections 
          SET as_confirmed_completion = TRUE, as_confirmed_at = NOW()
          WHERE id = ?
        `, [connectionId]);
      }

      // Check if both parties have confirmed
      const [updatedConnection] = await pool.execute(`
        SELECT explorer_confirmed_completion, as_confirmed_completion 
        FROM explorer_as_connections 
        WHERE id = ?
      `, [connectionId]);

      const bothConfirmed = updatedConnection[0].explorer_confirmed_completion && 
                           updatedConnection[0].as_confirmed_completion;

      let responseMessage = `Confirmación registrada exitosamente. `;

      if (bothConfirmed) {
        // Both confirmed - complete the service and create review obligations
        await pool.execute(`
          UPDATE explorer_as_connections 
          SET status = 'completed', service_completed_at = NOW()
          WHERE id = ?
        `, [connectionId]);

        // Create review obligations for both parties
        const reviewDueDate = new Date();
        reviewDueDate.setDate(reviewDueDate.getDate() + 7); // 7 days to review

        // Explorer must review AS
        await pool.execute(`
          INSERT INTO explorer_review_obligations (
            explorer_id, connection_id, as_id, service_completed_at, 
            review_due_date, is_blocking_new_services
          )
          VALUES (?, ?, ?, NOW(), ?, TRUE)
          ON DUPLICATE KEY UPDATE 
            service_completed_at = NOW(),
            review_due_date = VALUES(review_due_date),
            is_blocking_new_services = TRUE
        `, [connection.explorer_id, connectionId, connection.as_id, reviewDueDate]);

        // AS must review Explorer
        await pool.execute(`
          INSERT INTO as_review_obligations (
            as_id, connection_id, explorer_id, service_completed_at, 
            review_due_date, is_blocking_new_services
          )
          VALUES (?, ?, ?, NOW(), ?, TRUE)
          ON DUPLICATE KEY UPDATE 
            service_completed_at = NOW(),
            review_due_date = VALUES(review_due_date),
            is_blocking_new_services = TRUE
        `, [connection.as_id, connectionId, connection.explorer_id, reviewDueDate]);

        responseMessage += '🎉 Ambas partes han confirmado. Servicio completado. Ahora AMBOS deben calificarse mutuamente para continuar usando la plataforma.';

        // Notify both parties
        if (req.io) {
          const notificationMessage = {
            connection_id: connectionId,
            message: 'Servicio completado. Califica a la otra parte para continuar usando Fixia.',
            both_confirmed: true
          };

          req.io.to(`user_${connection.explorer_id}`).emit('service_mutually_completed', notificationMessage);
          req.io.to(`user_${connection.as_id}`).emit('service_mutually_completed', notificationMessage);
        }

      } else {
        const otherParty = userRole === 'explorer' ? 'AS' : 'Explorador';
        responseMessage += `Esperando confirmación del ${otherParty} para completar el servicio.`;

        // Notify other party
        const otherUserId = userRole === 'explorer' ? connection.as_id : connection.explorer_id;
        if (req.io) {
          req.io.to(`user_${otherUserId}`).emit('partner_confirmed_completion', {
            connection_id: connectionId,
            confirmed_by: userRole,
            confirmer_name: `${req.user.first_name} ${req.user.last_name}`,
            message: `${req.user.first_name} confirmó la finalización del servicio. ¿También confirmas que fue exitoso?`
          });
        }
      }

      await pool.execute('COMMIT');

      res.json(formatResponse({
        both_confirmed: bothConfirmed,
        service_completed: bothConfirmed
      }, responseMessage));

    } catch (transactionError) {
      await pool.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Confirm completion error:', error);
    res.status(500).json(formatError('Error al confirmar finalización del servicio'));
  }
});

// GET /api/mutual-confirmation/pending-confirmations - Get services pending confirmation
router.get('/pending-confirmations', authMiddleware, async (req, res) => {
  try {
    const [connections] = await pool.execute(`
      SELECT eac.*, 
             CASE 
               WHEN eac.explorer_id = ? THEN 'explorer'
               ELSE 'as'
             END as user_role,
             CASE 
               WHEN eac.explorer_id = ? THEN eac.explorer_confirmed_completion
               ELSE eac.as_confirmed_completion
             END as user_confirmed,
             CASE 
               WHEN eac.explorer_id = ? THEN eac.as_confirmed_completion
               ELSE eac.explorer_confirmed_completion
             END as partner_confirmed,
             CASE 
               WHEN eac.explorer_id = ? THEN u_as.first_name
               ELSE u_explorer.first_name
             END as partner_first_name,
             CASE 
               WHEN eac.explorer_id = ? THEN u_as.last_name
               ELSE u_explorer.last_name
             END as partner_last_name,
             esr.title as service_title, c.name as category_name
      FROM explorer_as_connections eac
      INNER JOIN users u_explorer ON eac.explorer_id = u_explorer.id
      INNER JOIN users u_as ON eac.as_id = u_as.id
      LEFT JOIN explorer_service_requests esr ON eac.request_id = esr.id
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE (eac.explorer_id = ? OR eac.as_id = ?) 
        AND eac.status = 'service_in_progress'
        AND eac.requires_mutual_confirmation = TRUE
      ORDER BY eac.service_started_at DESC
    `, [
      req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id,
      req.user.id, req.user.id
    ]);

    res.json(formatResponse(connections, 'Servicios pendientes de confirmación obtenidos exitosamente'));
  } catch (error) {
    console.error('Get pending confirmations error:', error);
    res.status(500).json(formatError('Error al obtener servicios pendientes'));
  }
});

// GET /api/mutual-confirmation/connection/:id/status - Get connection confirmation status
router.get('/connection/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [connections] = await pool.execute(`
      SELECT eac.*,
             scc_explorer.confirmed_at as explorer_confirmation_date,
             scc_explorer.confirmation_message as explorer_confirmation_message,
             scc_explorer.work_quality_satisfaction as explorer_satisfaction,
             scc_as.confirmed_at as as_confirmation_date,
             scc_as.confirmation_message as as_confirmation_message,
             scc_as.work_quality_satisfaction as as_satisfaction,
             scc_as.payment_received,
             scc_explorer.service_delivered
      FROM explorer_as_connections eac
      LEFT JOIN service_completion_confirmations scc_explorer 
        ON eac.id = scc_explorer.connection_id AND scc_explorer.user_type = 'explorer'
      LEFT JOIN service_completion_confirmations scc_as 
        ON eac.id = scc_as.connection_id AND scc_as.user_type = 'as'
      WHERE eac.id = ? AND (eac.explorer_id = ? OR eac.as_id = ?)
    `, [id, req.user.id, req.user.id]);

    if (connections.length === 0) {
      return res.status(404).json(formatError('Conexión no encontrada'));
    }

    const connection = connections[0];
    const userRole = connection.explorer_id === req.user.id ? 'explorer' : 'as';

    const status = {
      both_confirmed: connection.explorer_confirmed_completion && connection.as_confirmed_completion,
      user_confirmed: userRole === 'explorer' ? connection.explorer_confirmed_completion : connection.as_confirmed_completion,
      partner_confirmed: userRole === 'explorer' ? connection.as_confirmed_completion : connection.explorer_confirmed_completion,
      service_completed: connection.status === 'completed',
      confirmations: {
        explorer: {
          confirmed: connection.explorer_confirmed_completion,
          confirmed_at: connection.explorer_confirmation_date,
          message: connection.explorer_confirmation_message,
          satisfaction: connection.explorer_satisfaction,
          service_delivered: connection.service_delivered
        },
        as: {
          confirmed: connection.as_confirmed_completion,
          confirmed_at: connection.as_confirmation_date,
          message: connection.as_confirmation_message,
          satisfaction: connection.as_satisfaction,
          payment_received: connection.payment_received
        }
      }
    };

    res.json(formatResponse(status, 'Estado de confirmación obtenido exitosamente'));
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json(formatError('Error al obtener estado de conexión'));
  }
});

// GET /api/mutual-confirmation/blocking-status - Check if user is blocked due to pending reviews
router.get('/blocking-status', authMiddleware, async (req, res) => {
  try {
    let blockingInfo = {
      is_blocked: false,
      blocking_reasons: [],
      pending_explorer_reviews: 0,
      pending_as_reviews: 0,
      total_blocking: 0
    };

    // Check Explorer review obligations (if user is Explorer)
    if (req.user.user_type === 'client') {
      const [explorerObligations] = await pool.execute(`
        SELECT COUNT(*) as pending_count
        FROM explorer_review_obligations 
        WHERE explorer_id = ? AND is_reviewed = FALSE AND is_blocking_new_services = TRUE
      `, [req.user.id]);

      blockingInfo.pending_explorer_reviews = explorerObligations[0].pending_count;
      if (explorerObligations[0].pending_count > 0) {
        blockingInfo.is_blocked = true;
        blockingInfo.blocking_reasons.push(`Debes calificar ${explorerObligations[0].pending_count} AS antes de crear nuevas solicitudes`);
      }
    }

    // Check AS review obligations (if user is AS)
    if (req.user.user_type === 'provider') {
      const [asObligations] = await pool.execute(`
        SELECT COUNT(*) as pending_count
        FROM as_review_obligations 
        WHERE as_id = ? AND is_reviewed = FALSE AND is_blocking_new_services = TRUE
      `, [req.user.id]);

      blockingInfo.pending_as_reviews = asObligations[0].pending_count;
      if (asObligations[0].pending_count > 0) {
        blockingInfo.is_blocked = true;
        blockingInfo.blocking_reasons.push(`Debes calificar ${asObligations[0].pending_count} Exploradores antes de aceptar nuevos trabajos`);
      }
    }

    blockingInfo.total_blocking = blockingInfo.pending_explorer_reviews + blockingInfo.pending_as_reviews;

    const message = blockingInfo.is_blocked 
      ? 'Tienes calificaciones pendientes que bloquean tu actividad'
      : 'No tienes restricciones de calificación';

    res.json(formatResponse(blockingInfo, message));
  } catch (error) {
    console.error('Check blocking status error:', error);
    res.status(500).json(formatError('Error al verificar estado de bloqueo'));
  }
});

module.exports = router;