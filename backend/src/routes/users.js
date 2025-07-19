const express = require('express');
const multer = require('multer');
const path = require('path');
const { query } = require('../config/database');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError, sanitizeUser, paginate } = require('../utils/helpers');
const { transformUserForFrontend } = require('../utils/userTypeTransformer');
const { userTypeTransformMiddleware } = require('../middleware/userTypeTransform');

const router = express.Router();

// Apply user type transformation to all routes
router.use(userTypeTransformMiddleware);

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// GET /api/users/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    res.json(formatResponse(sanitizeUser(result.rows[0]), 'Perfil obtenido exitosamente'));

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(formatError('Error al obtener perfil'));
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { first_name, last_name, phone, address, latitude, longitude } = req.body;

    await query(
      `UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        latitude = COALESCE($5, latitude),
        longitude = COALESCE($6, longitude),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [first_name, last_name, phone, address, latitude, longitude, req.user.id]
    );

    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json(formatResponse(sanitizeUser(result.rows[0]), 'Perfil actualizado exitosamente'));

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(formatError('Error al actualizar perfil'));
  }
});

// POST /api/users/profile/photo - Upload profile photo
router.post('/profile/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatError('No se proporcionó imagen'));
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    await query(
      'UPDATE users SET profile_photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [photoUrl, req.user.id]
    );

    res.json(formatResponse({
      profile_photo_url: photoUrl
    }, 'Foto de perfil actualizada exitosamente'));

  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json(formatError('Error al subir foto'));
  }
});

// DELETE /api/users/profile/photo - Remove profile photo
router.delete('/profile/photo', async (req, res) => {
  try {
    await query(
      'UPDATE users SET profile_photo_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.user.id]
    );

    res.json(formatResponse({}, 'Foto de perfil eliminada exitosamente'));

  } catch (error) {
    console.error('Remove photo error:', error);
    res.status(500).json(formatError('Error al eliminar foto'));
  }
});

// GET /api/users/:id - Get public user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, first_name, last_name, user_type, profile_photo_url, 
              address, latitude, longitude, is_verified, created_at
       FROM users WHERE id = $1 AND is_active = TRUE`,
      [id]
    );
    const users = result.rows;

    if (users.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    const user = users[0];

    // If it's a provider, get additional stats
    if (user.user_type === 'provider') {
      const serviceStatsResult = await query(
        'SELECT COUNT(*) as total_services FROM services WHERE provider_id = $1 AND is_active = TRUE',
        [id]
      );
      const serviceStats = serviceStatsResult.rows;

      const reviewStatsResult = await query(
        'SELECT COUNT(*) as total_reviews, AVG(rating) as average_rating FROM reviews WHERE provider_id = $1',
        [id]
      );
      const reviewStats = reviewStatsResult.rows;

      const completedBookingsResult = await query(
        'SELECT COUNT(*) as completed_bookings FROM bookings WHERE provider_id = $1 AND status = $2',
        [id, 'completed']
      );
      const completedBookings = completedBookingsResult.rows;

      user.stats = {
        total_services: serviceStats[0].total_services,
        total_reviews: reviewStats[0].total_reviews,
        average_rating: parseFloat(reviewStats[0].average_rating) || 0,
        completed_bookings: completedBookings[0].completed_bookings
      };
    }

    res.json(formatResponse(user, 'Usuario obtenido exitosamente'));

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(formatError('Error al obtener usuario'));
  }
});

// GET /api/users/search/providers - Search providers
router.get('/search/providers', async (req, res) => {
  try {
    const { 
      category, 
      latitude, 
      longitude, 
      radius = 10, 
      min_rating = 0,
      page = 1, 
      limit = 10 
    } = req.query;

    const { limit: queryLimit, offset } = paginate(page, limit);

    let queryText = `
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.profile_photo_url, 
             u.address, u.latitude, u.longitude, u.is_verified,
             AVG(r.rating) as average_rating,
             COUNT(DISTINCT r.id) as total_reviews,
             COUNT(DISTINCT s.id) as total_services
      FROM users u
      LEFT JOIN services s ON u.id = s.provider_id AND s.is_active = TRUE
      LEFT JOIN reviews r ON u.id = r.provider_id
      WHERE u.user_type = 'provider' AND u.is_active = TRUE
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      queryText += ` AND s.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Distance calculation if coordinates provided
    if (latitude && longitude) {
      queryText += ` AND (
        6371 * acos(
          cos(radians($${paramIndex})) * cos(radians(u.latitude)) * 
          cos(radians(u.longitude) - radians($${paramIndex + 1})) + 
          sin(radians($${paramIndex + 2})) * sin(radians(u.latitude))
        )
      ) <= $${paramIndex + 3}`;
      params.push(latitude, longitude, latitude, radius);
      paramIndex += 4;
    }

    queryText += ' GROUP BY u.id';

    if (min_rating > 0) {
      queryText += ` HAVING average_rating >= $${paramIndex}`;
      params.push(min_rating);
      paramIndex++;
    }

    queryText += ' ORDER BY average_rating DESC, total_reviews DESC';
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(queryLimit, offset);

    const result = await query(queryText, params);
    const providers = result.rows;

    res.json(formatResponse({
      providers,
      pagination: {
        page: parseInt(page),
        limit: queryLimit,
        total: providers.length
      }
    }, 'Profesionales obtenidos exitosamente'));

  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json(formatError('Error al buscar profesionales'));
  }
});

module.exports = router;