const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authMiddleware, requireProvider } = require('../middleware/auth');
const { formatResponse, formatError, sanitizeUser } = require('../utils/helpers');

const router = express.Router();

// Configure multer for verification images
const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/verifications/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const portfolioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/portfolios/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `portfolio-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const verificationUpload = multer({
  storage: verificationStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG)'));
    }
  }
});

const portfolioUpload = multer({
  storage: portfolioStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, WebP)'));
    }
  }
});

// PUT /api/professionals/complete-profile - Complete professional profile
router.put('/complete-profile', authMiddleware, requireProvider, async (req, res) => {
  try {
    const {
      birth_date,
      city,
      dni,
      dni_procedure_number,
      about_me,
      has_mobility,
      profession,
      license_number,
      specialization,
      years_experience
    } = req.body;

    // Update user basic info
    await pool.execute(
      `UPDATE users SET 
        birth_date = ?, city = ?, dni = ?, dni_procedure_number = ?, 
        about_me = ?, has_mobility = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [birth_date, city, dni, dni_procedure_number, about_me, has_mobility, req.user.id]
    );

    // Insert or update professional info
    const [existingProfInfo] = await pool.execute(
      'SELECT id FROM user_professional_info WHERE user_id = ?',
      [req.user.id]
    );

    if (existingProfInfo.length > 0) {
      await pool.execute(
        `UPDATE user_professional_info SET 
          profession = ?, license_number = ?, specialization = ?, 
          years_experience = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [profession, license_number, specialization, years_experience, req.user.id]
      );
    } else {
      await pool.execute(
        `INSERT INTO user_professional_info 
         (user_id, profession, license_number, specialization, years_experience)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, profession, license_number, specialization, years_experience]
      );
    }

    // Calculate and update profile completion
    await updateProfileCompletion(req.user.id);

    // Get updated user data
    const [users] = await pool.execute(
      `SELECT u.*, upi.profession, upi.license_number, upi.specialization, upi.years_experience
       FROM users u
       LEFT JOIN user_professional_info upi ON u.id = upi.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.json(formatResponse(sanitizeUser(users[0]), 'Perfil completado exitosamente'));

  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json(formatError('Error al completar perfil'));
  }
});

// POST /api/professionals/verification - Submit verification documents
router.post('/verification', authMiddleware, requireProvider, 
  verificationUpload.fields([
    { name: 'dni_front', maxCount: 1 },
    { name: 'dni_back', maxCount: 1 },
    { name: 'selfie_with_dni', maxCount: 1 }
  ]), async (req, res) => {
  try {
    if (!req.files || !req.files.dni_front || !req.files.dni_back || !req.files.selfie_with_dni) {
      return res.status(400).json(formatError('Se requieren todas las imágenes de verificación'));
    }

    const dni_front_image = `/uploads/verifications/${req.files.dni_front[0].filename}`;
    const dni_back_image = `/uploads/verifications/${req.files.dni_back[0].filename}`;
    const selfie_with_dni_image = `/uploads/verifications/${req.files.selfie_with_dni[0].filename}`;

    // Check if user already has verification record
    const [existing] = await pool.execute(
      'SELECT id, verification_attempts FROM user_verifications WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      // Update existing verification
      await pool.execute(
        `UPDATE user_verifications SET 
          dni_front_image = ?, dni_back_image = ?, selfie_with_dni_image = ?,
          verification_attempts = verification_attempts + 1,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [dni_front_image, dni_back_image, selfie_with_dni_image, req.user.id]
      );
    } else {
      // Create new verification record
      await pool.execute(
        `INSERT INTO user_verifications 
         (user_id, dni_front_image, dni_back_image, selfie_with_dni_image, verification_attempts)
         VALUES (?, ?, ?, ?, 1)`,
        [req.user.id, dni_front_image, dni_back_image, selfie_with_dni_image]
      );
    }

    // Update user verification status
    await pool.execute(
      'UPDATE users SET verification_status = "in_review" WHERE id = ?',
      [req.user.id]
    );

    // Update profile completion
    await updateProfileCompletion(req.user.id);

    res.status(201).json(formatResponse({
      dni_front_image,
      dni_back_image,
      selfie_with_dni_image
    }, 'Documentos de verificación enviados exitosamente'));

  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json(formatError('Error al enviar documentos de verificación'));
  }
});

// POST /api/professionals/references - Add personal reference
router.post('/references', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { reference_name, reference_phone, reference_email, relationship, notes } = req.body;

    if (!reference_name || !reference_phone) {
      return res.status(400).json(formatError('Nombre y teléfono de referencia son requeridos'));
    }

    // Check reference limit (max 3)
    const [existingRefs] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_references WHERE user_id = ?',
      [req.user.id]
    );

    if (existingRefs[0].count >= 3) {
      return res.status(400).json(formatError('Máximo 3 referencias permitidas'));
    }

    const [result] = await pool.execute(
      `INSERT INTO user_references 
       (user_id, reference_name, reference_phone, reference_email, relationship, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, reference_name, reference_phone, reference_email, relationship, notes]
    );

    // Update profile completion
    await updateProfileCompletion(req.user.id);

    const [reference] = await pool.execute(
      'SELECT * FROM user_references WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(formatResponse(reference[0], 'Referencia agregada exitosamente'));

  } catch (error) {
    console.error('Add reference error:', error);
    res.status(500).json(formatError('Error al agregar referencia'));
  }
});

// GET /api/professionals/references - Get user references
router.get('/references', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [references] = await pool.execute(
      'SELECT * FROM user_references WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(formatResponse(references, 'Referencias obtenidas exitosamente'));

  } catch (error) {
    console.error('Get references error:', error);
    res.status(500).json(formatError('Error al obtener referencias'));
  }
});

// DELETE /api/professionals/references/:id - Delete reference
router.delete('/references/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM user_references WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Referencia no encontrada'));
    }

    // Update profile completion
    await updateProfileCompletion(req.user.id);

    res.json(formatResponse(null, 'Referencia eliminada exitosamente'));

  } catch (error) {
    console.error('Delete reference error:', error);
    res.status(500).json(formatError('Error al eliminar referencia'));
  }
});

// POST /api/professionals/portfolio - Add portfolio item
router.post('/portfolio', authMiddleware, requireProvider, portfolioUpload.single('image'), async (req, res) => {
  try {
    const { title, description, work_date, category } = req.body;

    if (!title) {
      return res.status(400).json(formatError('Título es requerido'));
    }

    const image_url = req.file ? `/uploads/portfolios/${req.file.filename}` : null;

    // Get next sort order
    const [sortResult] = await pool.execute(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM user_portfolios WHERE user_id = ?',
      [req.user.id]
    );

    const [result] = await pool.execute(
      `INSERT INTO user_portfolios 
       (user_id, title, description, image_url, work_date, category, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, image_url, work_date, category, sortResult[0].next_order]
    );

    const [portfolio] = await pool.execute(
      'SELECT * FROM user_portfolios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(formatResponse(portfolio[0], 'Elemento de portafolio agregado exitosamente'));

  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json(formatError('Error al agregar elemento al portafolio'));
  }
});

// GET /api/professionals/portfolio - Get user portfolio
router.get('/portfolio', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [portfolio] = await pool.execute(
      'SELECT * FROM user_portfolios WHERE user_id = ? ORDER BY sort_order ASC',
      [req.user.id]
    );

    res.json(formatResponse(portfolio, 'Portafolio obtenido exitosamente'));

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json(formatError('Error al obtener portafolio'));
  }
});

// DELETE /api/professionals/portfolio/:id - Delete portfolio item
router.delete('/portfolio/:id', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM user_portfolios WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(formatError('Elemento de portafolio no encontrado'));
    }

    res.json(formatResponse(null, 'Elemento de portafolio eliminado exitosamente'));

  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json(formatError('Error al eliminar elemento del portafolio'));
  }
});

// POST /api/professionals/availability - Set availability schedule
router.post('/availability', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { schedules } = req.body; // Array of schedule objects

    if (!Array.isArray(schedules)) {
      return res.status(400).json(formatError('Horarios debe ser un array'));
    }

    // Delete existing schedules
    await pool.execute(
      'DELETE FROM user_availabilities WHERE user_id = ?',
      [req.user.id]
    );

    // Insert new schedules
    const insertPromises = schedules.map(schedule => {
      const { day_of_week, start_time, end_time, is_available, break_start_time, break_end_time } = schedule;
      
      return pool.execute(
        `INSERT INTO user_availabilities 
         (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time]
      );
    });

    await Promise.all(insertPromises);

    // Update profile completion
    await updateProfileCompletion(req.user.id);

    res.json(formatResponse(schedules, 'Disponibilidad actualizada exitosamente'));

  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json(formatError('Error al actualizar disponibilidad'));
  }
});

// GET /api/professionals/availability - Get availability schedule
router.get('/availability', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [availability] = await pool.execute(
      'SELECT * FROM user_availabilities WHERE user_id = ? ORDER BY day_of_week ASC',
      [req.user.id]
    );

    res.json(formatResponse(availability, 'Disponibilidad obtenida exitosamente'));

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json(formatError('Error al obtener disponibilidad'));
  }
});

// POST /api/professionals/work-locations - Add work location
router.post('/work-locations', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { city, province, latitude, longitude, travel_radius_km, additional_cost_per_km } = req.body;

    if (!city || !province) {
      return res.status(400).json(formatError('Ciudad y provincia son requeridas'));
    }

    const [result] = await pool.execute(
      `INSERT INTO user_work_locations 
       (user_id, city, province, latitude, longitude, travel_radius_km, additional_cost_per_km)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, city, province, latitude, longitude, travel_radius_km, additional_cost_per_km]
    );

    const [location] = await pool.execute(
      'SELECT * FROM user_work_locations WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(formatResponse(location[0], 'Ubicación de trabajo agregada exitosamente'));

  } catch (error) {
    console.error('Add work location error:', error);
    res.status(500).json(formatError('Error al agregar ubicación de trabajo'));
  }
});

// GET /api/professionals/work-locations - Get work locations
router.get('/work-locations', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [locations] = await pool.execute(
      'SELECT * FROM user_work_locations WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(formatResponse(locations, 'Ubicaciones de trabajo obtenidas exitosamente'));

  } catch (error) {
    console.error('Get work locations error:', error);
    res.status(500).json(formatError('Error al obtener ubicaciones de trabajo'));
  }
});

// GET /api/professionals/profile-completion - Get profile completion status
router.get('/profile-completion', authMiddleware, requireProvider, async (req, res) => {
  try {
    const completion = await calculateProfileCompletion(req.user.id);
    res.json(formatResponse(completion, 'Estado de completitud obtenido exitosamente'));

  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json(formatError('Error al obtener estado de completitud'));
  }
});

// Helper function to calculate profile completion
const calculateProfileCompletion = async (userId) => {
  const [user] = await pool.execute(
    `SELECT u.*, upi.profession, uv.dni_front_image, un.push_notifications
     FROM users u
     LEFT JOIN user_professional_info upi ON u.id = upi.user_id
     LEFT JOIN user_verifications uv ON u.id = uv.user_id
     LEFT JOIN user_notification_preferences un ON u.id = un.user_id
     WHERE u.id = ?`,
    [userId]
  );

  if (user.length === 0) return { percentage: 0, completed_steps: [], pending_steps: [] };

  const userData = user[0];
  const completedSteps = [];
  const pendingSteps = [];

  const steps = [
    { name: 'Información básica', check: () => userData.first_name && userData.last_name && userData.email },
    { name: 'Fecha de nacimiento', check: () => userData.birth_date },
    { name: 'Localidad y dirección', check: () => userData.city && userData.address },
    { name: 'Teléfono', check: () => userData.phone },
    { name: 'Foto de perfil', check: () => userData.profile_photo_url },
    { name: 'DNI', check: () => userData.dni && userData.dni_procedure_number },
    { name: 'Información profesional', check: () => userData.profession },
    { name: 'Descripción personal', check: () => userData.about_me },
    { name: 'Verificación con selfie', check: () => userData.dni_front_image },
    { name: 'Preferencias de notificación', check: () => userData.push_notifications !== null },
  ];

  steps.forEach(step => {
    if (step.check()) {
      completedSteps.push(step.name);
    } else {
      pendingSteps.push(step.name);
    }
  });

  const percentage = Math.round((completedSteps.length / steps.length) * 100);

  return {
    percentage,
    completed_steps: completedSteps,
    pending_steps: pendingSteps,
    total_steps: steps.length
  };
};

// Helper function to update profile completion in database
const updateProfileCompletion = async (userId) => {
  const completion = await calculateProfileCompletion(userId);
  await pool.execute(
    'UPDATE users SET profile_completion_percentage = ? WHERE id = ?',
    [completion.percentage, userId]
  );
  return completion;
};

module.exports = router;