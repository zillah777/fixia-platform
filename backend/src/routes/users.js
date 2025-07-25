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

    const user = result.rows[0];
    // Map profile_image to profile_photo_url for frontend compatibility
    if (user.profile_image) {
      user.profile_photo_url = user.profile_image;
    }
    res.json(formatResponse(sanitizeUser(user), 'Perfil obtenido exitosamente'));

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(formatError('Error al obtener perfil'));
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      phone, 
      address, 
      bio,
      date_of_birth,
      gender,
      locality
    } = req.body;

    // Update all available profile fields
    await query(
      `UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        bio = COALESCE($5, bio),
        date_of_birth = COALESCE($6, date_of_birth),
        gender = COALESCE($7, gender),
        locality = COALESCE($8, locality),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [first_name, last_name, phone, address, bio, date_of_birth, gender, locality, req.user.id]
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
    // Full URL for frontend display
    const fullPhotoUrl = `${process.env.BACKEND_URL || 'https://fixia-platform-production.up.railway.app'}${photoUrl}`;

    await query(
      'UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [photoUrl, req.user.id]
    );

    res.json(formatResponse({
      profile_photo_url: fullPhotoUrl,
      profile_image: photoUrl // Also return relative URL for database consistency
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
      'UPDATE users SET profile_image = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
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
      `SELECT id, first_name, last_name, user_type, profile_image, profile_image as profile_photo_url, 
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
      // OPTIMIZED: Single query instead of 3 separate queries (N+1 fix)
      // Combines service count, review stats, and booking count with JOINs
      const providerStatsResult = await query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN s.is_active = TRUE THEN s.id END) as total_services,
          COUNT(DISTINCT r.id) as total_reviews,
          ROUND(AVG(r.rating), 2) as average_rating,
          COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings
        FROM users u
        LEFT JOIN services s ON u.id = s.provider_id
        LEFT JOIN reviews r ON u.id = r.provider_id  
        LEFT JOIN bookings b ON u.id = b.provider_id
        WHERE u.id = $1
        GROUP BY u.id
      `, [id]);

      const stats = providerStatsResult.rows[0] || {};
      user.stats = {
        total_services: parseInt(stats.total_services) || 0,
        total_reviews: parseInt(stats.total_reviews) || 0,
        average_rating: parseFloat(stats.average_rating) || 0,
        completed_bookings: parseInt(stats.completed_bookings) || 0
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