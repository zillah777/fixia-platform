const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for education certificates
const storage = multer.diskStorage({
  destination: 'uploads/certificates/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'certificate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF) y PDFs'));
    }
  }
});

// EDUCATION & VALIDATION PROGRESS
// GET /api/as-settings/education - Get AS education/certifications
router.get('/education', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [education] = await pool.execute(`
      SELECT * FROM as_education 
      WHERE user_id = ? 
      ORDER BY end_date DESC, start_date DESC
    `, [req.user.id]);

    res.json(formatResponse(education, 'Educación obtenida exitosamente'));
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json(formatError('Error al obtener educación'));
  }
});

// POST /api/as-settings/education - Add education/certification
router.post('/education', authMiddleware, requireProvider, upload.single('certificate_image'), async (req, res) => {
  try {
    const { 
      education_type, 
      institution_name, 
      degree_title, 
      field_of_study, 
      start_date, 
      end_date,
      is_current = false 
    } = req.body;

    if (!education_type || !institution_name || !degree_title) {
      return res.status(400).json(formatError('Tipo de educación, institución y título son requeridos'));
    }

    const certificate_image = req.file ? `/uploads/certificates/${req.file.filename}` : null;

    const [result] = await pool.execute(`
      INSERT INTO as_education (user_id, education_type, institution_name, degree_title, field_of_study, start_date, end_date, is_current, certificate_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, education_type, institution_name, degree_title, field_of_study, start_date, end_date, is_current, certificate_image]);

    res.json(formatResponse({ id: result.insertId }, 'Educación agregada exitosamente'));
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json(formatError('Error al agregar educación'));
  }
});

// GET /api/as-settings/validation-progress - Get validation progress
router.get('/validation-progress', authMiddleware, requireProvider, async (req, res) => {
  try {
    // Calculate validation progress
    const [user] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const [education] = await pool.execute('SELECT COUNT(*) as count FROM as_education WHERE user_id = ? AND verification_status = "verified"', [req.user.id]);
    const [portfolio] = await pool.execute('SELECT COUNT(*) as count FROM as_portfolio WHERE user_id = ? AND is_visible = TRUE', [req.user.id]);

    const userData = user[0];
    const educationCount = education[0].count;
    const portfolioCount = portfolio[0].count;

    const validationItems = [
      {
        name: 'Foto de Perfil',
        completed: !!userData.profile_photo_url,
        required: true,
        weight: 15
      },
      {
        name: 'Información Básica',
        completed: !!(userData.first_name && userData.last_name && userData.phone),
        required: true,
        weight: 10
      },
      {
        name: 'Verificación DNI',
        completed: userData.verification_status === 'verified',
        required: true,
        weight: 25
      },
      {
        name: 'Educación/Certificaciones',
        completed: educationCount > 0,
        required: false,
        weight: 20,
        count: educationCount
      },
      {
        name: 'Portfolio de Trabajos',
        completed: portfolioCount > 0,
        required: false,
        weight: 15,
        count: portfolioCount
      },
      {
        name: 'Descripción Profesional',
        completed: !!(userData.about_me && userData.about_me.length > 50),
        required: false,
        weight: 10
      },
      {
        name: 'Configuración de Precios',
        completed: false, // Will be calculated
        required: true,
        weight: 5
      }
    ];

    // Check if has pricing configured
    const [pricing] = await pool.execute('SELECT COUNT(*) as count FROM as_pricing WHERE user_id = ? AND is_active = TRUE', [req.user.id]);
    validationItems.find(item => item.name === 'Configuración de Precios').completed = pricing[0].count > 0;

    // Calculate overall progress
    const totalWeight = validationItems.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = validationItems
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);
    
    const progressPercentage = Math.round((completedWeight / totalWeight) * 100);

    res.json(formatResponse({
      progress_percentage: progressPercentage,
      items: validationItems,
      completed_items: validationItems.filter(item => item.completed).length,
      total_items: validationItems.length
    }, 'Progreso de validación obtenido exitosamente'));

  } catch (error) {
    console.error('Get validation progress error:', error);
    res.status(500).json(formatError('Error al obtener progreso de validación'));
  }
});

// PRIVACY SETTINGS
// GET /api/as-settings/privacy - Get privacy settings
router.get('/privacy', authMiddleware, requireProvider, async (req, res) => {
  try {
    let [settings] = await pool.execute('SELECT * FROM as_privacy_settings WHERE user_id = ?', [req.user.id]);
    
    if (settings.length === 0) {
      // Create default privacy settings
      await pool.execute(`
        INSERT INTO as_privacy_settings (user_id) VALUES (?)
      `, [req.user.id]);
      
      [settings] = await pool.execute('SELECT * FROM as_privacy_settings WHERE user_id = ?', [req.user.id]);
    }

    res.json(formatResponse(settings[0], 'Configuración de privacidad obtenida exitosamente'));
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json(formatError('Error al obtener configuración de privacidad'));
  }
});

// PUT /api/as-settings/privacy - Update privacy settings
router.put('/privacy', authMiddleware, requireProvider, async (req, res) => {
  try {
    const privacyFields = [
      'show_profile_photo', 'show_full_name', 'show_phone', 'show_whatsapp', 
      'show_email', 'show_address', 'show_exact_location', 'show_years_experience',
      'show_education', 'show_certifications', 'show_portfolio', 'show_reviews',
      'show_response_time', 'allow_direct_contact', 'allow_public_reviews'
    ];

    const updates = {};
    privacyFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.execute(`
      INSERT INTO as_privacy_settings (user_id, ${Object.keys(updates).join(', ')})
      VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${setClause}
    `, [req.user.id, ...values, ...values]);

    res.json(formatResponse(null, 'Configuración de privacidad actualizada exitosamente'));
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json(formatError('Error al actualizar configuración de privacidad'));
  }
});

// NOTIFICATION SETTINGS
// GET /api/as-settings/notifications - Get notification settings
router.get('/notifications', authMiddleware, requireProvider, async (req, res) => {
  try {
    let [settings] = await pool.execute('SELECT * FROM as_notification_settings WHERE user_id = ?', [req.user.id]);
    
    if (settings.length === 0) {
      // Create default notification settings
      await pool.execute(`
        INSERT INTO as_notification_settings (user_id) VALUES (?)
      `, [req.user.id]);
      
      [settings] = await pool.execute('SELECT * FROM as_notification_settings WHERE user_id = ?', [req.user.id]);
    }

    res.json(formatResponse(settings[0], 'Configuración de notificaciones obtenida exitosamente'));
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json(formatError('Error al obtener configuración de notificaciones'));
  }
});

// PUT /api/as-settings/notifications - Update notification settings
router.put('/notifications', authMiddleware, requireProvider, async (req, res) => {
  try {
    const notificationFields = [
      'email_new_requests', 'email_messages', 'email_reviews', 'email_payment_updates', 'email_marketing',
      'push_new_requests', 'push_messages', 'push_reviews', 'push_reminders', 'push_marketing',
      'sms_urgent_requests', 'sms_confirmations', 'notification_radius', 'quiet_hours_start', 'quiet_hours_end'
    ];

    const updates = {};
    notificationFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(formatError('No hay campos para actualizar'));
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.execute(`
      INSERT INTO as_notification_settings (user_id, ${Object.keys(updates).join(', ')})
      VALUES (?, ${Object.keys(updates).map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${setClause}
    `, [req.user.id, ...values, ...values]);

    res.json(formatResponse(null, 'Configuración de notificaciones actualizada exitosamente'));
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json(formatError('Error al actualizar configuración de notificaciones'));
  }
});

// EXPLORER REPORTS (AS reporting explorers)
// POST /api/as-settings/report-explorer - Report an explorer
router.post('/report-explorer', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { reported_user_id, booking_id, report_type, description, evidence_urls = [] } = req.body;

    if (!reported_user_id || !report_type || !description) {
      return res.status(400).json(formatError('Usuario reportado, tipo de reporte y descripción son requeridos'));
    }

    // Verify that the reported user is a client (explorer)
    const [reportedUser] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [reported_user_id]);
    if (reportedUser.length === 0 || reportedUser[0].user_type !== 'client') {
      return res.status(400).json(formatError('Solo puedes reportar exploradores (clientes)'));
    }

    const [result] = await pool.execute(`
      INSERT INTO as_explorer_reports (reporter_id, reported_user_id, booking_id, report_type, description, evidence_urls)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, reported_user_id, booking_id, report_type, description, JSON.stringify(evidence_urls)]);

    res.json(formatResponse({ id: result.insertId }, 'Reporte enviado exitosamente'));
  } catch (error) {
    console.error('Report explorer error:', error);
    res.status(500).json(formatError('Error al enviar reporte'));
  }
});

// GET /api/as-settings/my-reports - Get AS reports history
router.get('/my-reports', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [reports] = await pool.execute(`
      SELECT aer.*, u.first_name, u.last_name, u.email
      FROM as_explorer_reports aer
      INNER JOIN users u ON aer.reported_user_id = u.id
      WHERE aer.reporter_id = ?
      ORDER BY aer.created_at DESC
    `, [req.user.id]);

    const processedReports = reports.map(report => ({
      ...report,
      evidence_urls: report.evidence_urls ? JSON.parse(report.evidence_urls) : []
    }));

    res.json(formatResponse(processedReports, 'Reportes obtenidos exitosamente'));
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json(formatError('Error al obtener reportes'));
  }
});

module.exports = router;