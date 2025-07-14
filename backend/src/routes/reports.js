const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, paginate } = require('../utils/helpers');

const router = express.Router();

// POST /api/reports/user - Report a user
router.post('/user', authMiddleware, async (req, res) => {
  try {
    const { reported_user_id, booking_id, report_type, description, evidence_urls } = req.body;

    if (!reported_user_id || !report_type || !description) {
      return res.status(400).json(formatError('Usuario reportado, tipo de reporte y descripción son requeridos'));
    }

    // Validate report type
    const validTypes = ['no_show', 'poor_service', 'inappropriate_behavior', 'fake_profile', 'pricing_issue', 'other'];
    if (!validTypes.includes(report_type)) {
      return res.status(400).json(formatError('Tipo de reporte inválido'));
    }

    // Check if reported user exists
    const [reportedUser] = await pool.execute(
      'SELECT id, user_type FROM users WHERE id = ? AND is_active = TRUE',
      [reported_user_id]
    );

    if (reportedUser.length === 0) {
      return res.status(404).json(formatError('Usuario reportado no encontrado'));
    }

    // Check if booking exists and involves both users (if booking_id provided)
    if (booking_id) {
      const [booking] = await pool.execute(
        'SELECT id FROM bookings WHERE id = ? AND (customer_id = ? OR provider_id = ?) AND (customer_id = ? OR provider_id = ?)',
        [booking_id, req.user.id, req.user.id, reported_user_id, reported_user_id]
      );

      if (booking.length === 0) {
        return res.status(404).json(formatError('Reserva no encontrada o no estás involucrado en ella'));
      }
    }

    // Check if user has already reported this user recently (within 24 hours for same issue)
    const [existingReport] = await pool.execute(
      `SELECT id FROM user_reports 
       WHERE reporter_id = ? AND reported_user_id = ? AND report_type = ? 
       AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [req.user.id, reported_user_id, report_type]
    );

    if (existingReport.length > 0) {
      return res.status(400).json(formatError('Ya has reportado a este usuario por este motivo en las últimas 24 horas'));
    }

    // Create report
    const [result] = await pool.execute(
      `INSERT INTO user_reports 
       (reporter_id, reported_user_id, booking_id, report_type, description, evidence_urls)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, reported_user_id, booking_id, report_type, description, JSON.stringify(evidence_urls || [])]
    );

    // Create notification for admins (simplified - in real app would notify admin users)
    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, related_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        1, // Assuming admin user has ID 1
        'Nuevo Reporte de Usuario',
        `Se ha recibido un nuevo reporte de tipo "${report_type}" contra el usuario ${reported_user_id}`,
        'system',
        result.insertId
      ]
    );

    // Increment report count for reported user (for automatic actions)
    await pool.execute(
      `UPDATE users SET 
        verification_score = verification_score - 5
       WHERE id = ?`,
      [reported_user_id]
    );

    const [report] = await pool.execute(
      `SELECT r.*, 
              ru.first_name as reported_first_name, ru.last_name as reported_last_name,
              rep.first_name as reporter_first_name, rep.last_name as reporter_last_name
       FROM user_reports r
       INNER JOIN users ru ON r.reported_user_id = ru.id
       INNER JOIN users rep ON r.reporter_id = rep.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json(formatResponse(report[0], 'Reporte enviado exitosamente'));

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json(formatError('Error al enviar reporte'));
  }
});

// GET /api/reports/my-reports - Get user's submitted reports
router.get('/my-reports', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let query = `
      SELECT r.*, 
             ru.first_name as reported_first_name, ru.last_name as reported_last_name,
             ru.profile_photo_url as reported_photo
      FROM user_reports r
      INNER JOIN users ru ON r.reported_user_id = ru.id
      WHERE r.reporter_id = ?
    `;

    const params = [req.user.id];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(queryLimit, offset);

    const [reports] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM user_reports WHERE reporter_id = ?';
    const countParams = [req.user.id];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json(formatResponse({
      reports,
      pagination: {
        page: parseInt(page),
        limit: queryLimit,
        total,
        pages: Math.ceil(total / queryLimit)
      }
    }, 'Reportes obtenidos exitosamente'));

  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json(formatError('Error al obtener reportes'));
  }
});

// GET /api/reports/against-me - Get reports against current user
router.get('/against-me', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    let query = `
      SELECT r.report_type, r.description, r.status, r.created_at, r.resolved_at,
             rep.first_name as reporter_first_name, rep.last_name as reporter_last_name
      FROM user_reports r
      INNER JOIN users rep ON r.reporter_id = rep.id
      WHERE r.reported_user_id = ?
    `;

    const params = [req.user.id];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(queryLimit, offset);

    const [reports] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM user_reports WHERE reported_user_id = ?';
    const countParams = [req.user.id];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json(formatResponse({
      reports,
      pagination: {
        page: parseInt(page),
        limit: queryLimit,
        total,
        pages: Math.ceil(total / queryLimit)
      }
    }, 'Reportes en tu contra obtenidos exitosamente'));

  } catch (error) {
    console.error('Get reports against me error:', error);
    res.status(500).json(formatError('Error al obtener reportes en tu contra'));
  }
});

// GET /api/reports/types - Get available report types
router.get('/types', (req, res) => {
  const reportTypes = [
    {
      value: 'no_show',
      label: 'No se presentó',
      description: 'El usuario no se presentó a la cita acordada'
    },
    {
      value: 'poor_service',
      label: 'Servicio deficiente',
      description: 'El servicio prestado fue de mala calidad'
    },
    {
      value: 'inappropriate_behavior',
      label: 'Comportamiento inapropiado',
      description: 'El usuario tuvo un comportamiento inapropiado o irrespetuoso'
    },
    {
      value: 'fake_profile',
      label: 'Perfil falso',
      description: 'Sospecha de que el perfil contiene información falsa'
    },
    {
      value: 'pricing_issue',
      label: 'Problema de precios',
      description: 'Cobró diferente al precio acordado o hubo problemas con el pago'
    },
    {
      value: 'other',
      label: 'Otro',
      description: 'Otro tipo de problema no cubierto en las opciones anteriores'
    }
  ];

  res.json(formatResponse(reportTypes, 'Tipos de reporte obtenidos exitosamente'));
});

// PUT /api/reports/:id/response - Respond to a report (for reported user)
router.put('/:id/response', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length < 10) {
      return res.status(400).json(formatError('La respuesta debe tener al menos 10 caracteres'));
    }

    // Check if report exists and user is the reported user
    const [reports] = await pool.execute(
      'SELECT id, status FROM user_reports WHERE id = ? AND reported_user_id = ?',
      [id, req.user.id]
    );

    if (reports.length === 0) {
      return res.status(404).json(formatError('Reporte no encontrado'));
    }

    if (reports[0].status !== 'pending' && reports[0].status !== 'investigating') {
      return res.status(400).json(formatError('No puedes responder a este reporte'));
    }

    // Add response (in a real app, you might have a separate responses table)
    await pool.execute(
      'UPDATE user_reports SET admin_notes = CONCAT(COALESCE(admin_notes, ""), "\n\nRespuesta del usuario: ", ?) WHERE id = ?',
      [response, id]
    );

    res.json(formatResponse(null, 'Respuesta enviada exitosamente'));

  } catch (error) {
    console.error('Respond to report error:', error);
    res.status(500).json(formatError('Error al responder al reporte'));
  }
});

// GET /api/reports/stats - Get report statistics for current user
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Reports made by user
    const [reportsMade] = await pool.execute(
      `SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_reports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports
       FROM user_reports WHERE reporter_id = ?`,
      [req.user.id]
    );

    // Reports against user
    const [reportsAgainst] = await pool.execute(
      `SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_reports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports
       FROM user_reports WHERE reported_user_id = ?`,
      [req.user.id]
    );

    // Current verification score
    const [userScore] = await pool.execute(
      'SELECT verification_score FROM users WHERE id = ?',
      [req.user.id]
    );

    const stats = {
      reports_made: reportsMade[0],
      reports_against: reportsAgainst[0],
      verification_score: userScore[0].verification_score,
      reputation_level: getReputationLevel(userScore[0].verification_score)
    };

    res.json(formatResponse(stats, 'Estadísticas de reportes obtenidas exitosamente'));

  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json(formatError('Error al obtener estadísticas de reportes'));
  }
});

// Helper function to determine reputation level
const getReputationLevel = (score) => {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Muy Bueno';
  if (score >= 50) return 'Bueno';
  if (score >= 30) return 'Regular';
  if (score >= 10) return 'Bajo';
  return 'Muy Bajo';
};

module.exports = router;