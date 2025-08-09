const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { validateEmail, validatePassword } = require('../utils/validation');
const EmailService = require('../services/emailService');
const { transformUserForFrontend, transformUserForDatabase } = require('../utils/userTypeTransformer');
const { 
  USER_TYPES, 
  createApiResponse,
  transformUserToFrontend,
  transformUserToDatabase
} = require('../types/index');
const { generateTokenPair, generateAccessToken } = require('../middleware/auth');
const { logger } = require('../utils/smartLogger');

// Helper function to sanitize user data
const sanitizeUser = (user) => {
  const { password_hash, ...sanitizedUser } = user;
  return transformUserForFrontend(sanitizedUser);
};

// Legacy token generation for backward compatibility
const generateToken = (payload) => {
  return generateAccessToken(payload);
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
      user_type = 'customer', // Frontend default
      phone,
      locality
    } = req.body;

    // Enhanced validation
    if (!first_name || !last_name || !email || !password || !user_type) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos requeridos deben ser proporcionados'
      });
    }

    // Validate user_type is acceptable frontend value
    const allowedUserTypes = ['customer', 'provider', 'admin'];
    if (!allowedUserTypes.includes(user_type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de usuario no válido'
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

    // Transform user_type for database (customer -> client)
    const dbUserType = transformUserForDatabase({ user_type }).user_type;
    
    // Validate database user_type matches constraints
    const validDbUserTypes = ['client', 'provider', 'admin'];
    if (!validDbUserTypes.includes(dbUserType)) {
      logger.error('❌ Invalid database user_type after transformation', {
        frontendType: user_type,
        dbType: dbUserType,
        email: email
      });
      return res.status(400).json({
        success: false,
        error: 'Error interno: tipo de usuario no válido'
      });
    }
    
    // Hash password
    const password_hash = await hashPassword(password);

    // Create user with validated fields - explicit column mapping
    const insertQuery = `
      INSERT INTO users (
        first_name, 
        last_name, 
        email, 
        password_hash, 
        user_type,
        phone,
        locality,
        verification_status,
        email_verified,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, first_name, last_name, email, user_type, phone, locality, 
                verification_status, email_verified, is_active, created_at
    `;
    
    const insertValues = [
      first_name, 
      last_name, 
      email, 
      password_hash, 
      dbUserType,
      phone || null,
      locality || null,
      'pending', // verification_status default
      false,     // email_verified default
      true       // is_active default
    ];

    logger.info('🔄 Attempting user registration', {
      email: email,
      userType: user_type,
      dbUserType: dbUserType,
      hasPhone: !!phone,
      hasLocality: !!locality
    });

    const result = await query(insertQuery, insertValues);

    const user = result.rows[0];
    
    // Use proper transformer for frontend compatibility
    user.user_type = transformUserForFrontend({ user_type: user.user_type }).user_type;

    // Generate token pair for enhanced security
    const tokens = generateTokenPair({ 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type 
    });
    
    // Log registration for security monitoring
    logger.info('🎉 User registration successful', {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      ip: req.ip,
      userAgent: req.headers['user-agent']
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
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          emailVerificationRequired: false
        }
      });
    }

  } catch (error) {
    logger.error('❌ Registration error occurred', {
      error: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      table: error.table,
      column: error.column,
      email: req.body?.email,
      user_type: req.body?.user_type,
      stack: error.stack
    });

    // Handle specific PostgreSQL errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'Ya existe una cuenta con este email'
      });
    }
    
    if (error.code === '23514') { // Check constraint violation
      return res.status(400).json({
        success: false,
        error: 'Datos de usuario no válidos. Verifica el tipo de usuario.'
      });
    }
    
    if (error.code === '23502') { // NOT NULL constraint violation
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos para el registro'
      });
    }
    
    if (error.code === '42P01') { // Table does not exist
      logger.error('🚨 CRITICAL: Users table does not exist', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Error de configuración de la base de datos'
      });
    }

    // Generic database connection errors
    if (error.message.includes('connect') || error.message.includes('connection')) {
      return res.status(503).json({
        success: false,
        error: 'Servicio temporalmente no disponible. Intenta nuevamente.'
      });
    }

    // Default error response
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

    // Generate secure token pair
    const tokens = generateTokenPair({ 
      id: user.id, 
      email: user.email, 
      user_type: user.user_type
    });
    
    // Log successful login for security monitoring
    logger.info('🔑 User login successful', {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      lastLogin: user.last_login
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
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
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

// POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    // The refreshTokenMiddleware has already validated the refresh token
    // and set req.user and req.refreshToken
    
    const user = req.user;
    const oldRefreshToken = req.refreshToken;
    
    // Generate new token pair
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      user_type: user.user_type
    });
    
    // Blacklist the old refresh token for security
    const { blacklistToken } = require('../middleware/auth');
    blacklistToken(oldRefreshToken);
    
    // Log token refresh for security monitoring
    logger.info('🔄 Token refresh successful', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      message: 'Tokens renovados exitosamente',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
    
  } catch (error) {
    logger.error('🚨 Token refresh error', {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const token = req.token; // Set by auth middleware
    const refreshToken = req.body.refreshToken || req.header('X-Refresh-Token');
    
    // Blacklist both tokens
    const { blacklistToken } = require('../middleware/auth');
    if (token) {
      blacklistToken(token);
    }
    if (refreshToken) {
      blacklistToken(refreshToken);
    }
    
    // Log logout for security monitoring
    logger.info('👋 User logout successful', {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
    
  } catch (error) {
    logger.error('🚨 Logout error', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};