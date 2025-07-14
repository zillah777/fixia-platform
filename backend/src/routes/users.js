const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError, sanitizeUser, paginate } = require('../utils/helpers');

const router = express.Router();

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
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    res.json(formatResponse(sanitizeUser(users[0]), 'Perfil obtenido exitosamente'));

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(formatError('Error al obtener perfil'));
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { first_name, last_name, phone, address, latitude, longitude } = req.body;

    await pool.execute(
      `UPDATE users SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [first_name, last_name, phone, address, latitude, longitude, req.user.id]
    );

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(formatResponse(sanitizeUser(users[0]), 'Perfil actualizado exitosamente'));

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

    await pool.execute(
      'UPDATE users SET profile_photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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

// GET /api/users/:id - Get public user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      `SELECT id, first_name, last_name, user_type, profile_photo_url, 
              address, latitude, longitude, is_verified, created_at
       FROM users WHERE id = ? AND is_active = TRUE`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    const user = users[0];

    // If it's a provider, get additional stats
    if (user.user_type === 'provider') {
      const [serviceStats] = await pool.execute(
        'SELECT COUNT(*) as total_services FROM services WHERE provider_id = ? AND is_active = TRUE',
        [id]
      );

      const [reviewStats] = await pool.execute(
        'SELECT COUNT(*) as total_reviews, AVG(rating) as average_rating FROM reviews WHERE provider_id = ?',
        [id]
      );

      const [completedBookings] = await pool.execute(
        'SELECT COUNT(*) as completed_bookings FROM bookings WHERE provider_id = ? AND status = "completed"',
        [id]
      );

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

    let query = `
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

    if (category) {
      query += ' AND s.category = ?';
      params.push(category);
    }

    // Distance calculation if coordinates provided
    if (latitude && longitude) {
      query += ` AND (
        6371 * acos(
          cos(radians(?)) * cos(radians(u.latitude)) * 
          cos(radians(u.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(u.latitude))
        )
      ) <= ?`;
      params.push(latitude, longitude, latitude, radius);
    }

    query += ' GROUP BY u.id';

    if (min_rating > 0) {
      query += ' HAVING average_rating >= ?';
      params.push(min_rating);
    }

    query += ' ORDER BY average_rating DESC, total_reviews DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(queryLimit, offset);

    const [providers] = await pool.execute(query, params);

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