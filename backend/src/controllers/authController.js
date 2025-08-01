const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { validateEmail, validatePassword } = require('../utils/validation');
const EmailService = require('../services/emailService');
const { transformUserForFrontend, transformUserForDatabase } = require('../utils/userTypeTransformer');

// Helper function to sanitize user data
const sanitizeUser = (user) => {
  const { password_hash, ...sanitizedUser } = user;
  return transformUserForFrontend(sanitizedUser);
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      user_type = 'customer'
    } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos requeridos deben ser proporcionados'
      });
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una cuenta con este email'
      });
    }

    // Use the proper transformer for user_type
    const dbUserType = transformUserForDatabase({ user_type }).user_type;
    
    // Hash password
    const password_hash = await hashPassword(password);

    // Create user with minimal fields
    const result = await query(`
      INSERT INTO users (
        first_name, last_name, email, password_hash, user_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, user_type, created_at
    `, [
      first_name, last_name, email, password_hash, dbUserType
    ]);

    const user = result.rows[0];
    
    // Use proper transformer for frontend compatibility
    user.user_type = transformUserForFrontend({ user_type: user.user_type }).user_type;

    // Generate token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type 
    });

    // Send verification email in production only
    if (process.env.NODE_ENV === 'production') {
      try {
        const emailResult = await EmailService.sendVerificationEmail(user, user.user_type);
        if (emailResult.success) {
          console.log(`✅ Verification email sent to ${user.email}`);
        } else {
          console.error('⚠️ Failed to send verification email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('⚠️ Error sending verification email:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
        data: {
          user: sanitizeUser(user),
          emailVerificationRequired: true,
          requiresVerification: true
        }
      });
    } else {
      // Development mode - auto-login
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        data: {
          user: sanitizeUser(user),
          token,
          emailVerificationRequired: false
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Check if email is verified (production security)
    if (!user.email_verified && process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email
      });
    }

    // Generate token with database user_type (client)
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type  // Keep as 'client' for database compatibility
    });

    // Update last login AFTER token generation
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Get user stats - TEMPORARILY DISABLED due to column mismatch
    // TODO: Fix column names for provider_id vs user_id
    const statsResult = { rows: [{ 
      total_services: 0, 
      total_reviews: 0, 
      average_rating: 0, 
      completed_bookings: 0 
    }] };

    const stats = statsResult.rows[0] || {
      total_services: 0,
      total_reviews: 0,
      average_rating: 0,
      completed_bookings: 0
    };

    const sanitizedUser = sanitizeUser(user);
    
    // User type transformation is already handled by transformUserForFrontend in sanitizeUser function

    const userWithStats = {
      ...sanitizedUser,
      stats: {
        total_services: parseInt(stats.total_services),
        total_reviews: parseInt(stats.total_reviews),
        average_rating: parseFloat(stats.average_rating),
        completed_bookings: parseInt(stats.completed_bookings)
      }
    };

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userWithStats,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with stats
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    // Get user stats
    const statsResult = await query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_services,
        COUNT(DISTINCT r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings
      FROM users u
      LEFT JOIN services s ON u.id = s.provider_id AND s.is_active = true
      LEFT JOIN reviews r ON u.id = r.provider_id
      LEFT JOIN bookings b ON u.id = b.provider_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);

    const stats = statsResult.rows[0] || {
      total_services: 0,
      total_reviews: 0,
      average_rating: 0,
      completed_bookings: 0
    };

    const userWithStats = {
      ...sanitizeUser(user),
      stats: {
        total_services: parseInt(stats.total_services),
        total_reviews: parseInt(stats.total_reviews),
        average_rating: parseFloat(stats.average_rating),
        completed_bookings: parseInt(stats.completed_bookings)
      }
    };

    res.json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: userWithStats
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// In-memory blacklist for revoked tokens (in production, use Redis or database)
const tokenBlacklist = new Set();

// Helper function to add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // Optional: Set timeout to remove token after expiration
  // This helps prevent memory leaks
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000); // 7 days
};

// Helper function to check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  try {
    // Get token from request
    const token = req.headers.authorization?.replace('Bearer ', '') || req.token;
    
    if (token) {
      // Add token to blacklist
      blacklistToken(token);
      console.log('Token added to blacklist for logout');
    }
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión'
    });
  }
};

// Export blacklist helper functions for use in auth middleware
exports.isTokenBlacklisted = isTokenBlacklisted;
exports.blacklistToken = blacklistToken;

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'address', 'city',
      'latitude', 'longitude', 'birth_date', 'about_me', 
      'has_mobility', 'profile_image', 'professional_info'
    ];
    
    const updates = {};
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updates[key] = `$${paramIndex}`;
        values.push(req.body[key]);
        paramIndex++;
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay campos válidos para actualizar'
      });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ${updates[key]}`).join(', ');
    values.push(userId);

    const result = await query(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: sanitizeUser(result.rows[0])
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Get current user with password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};