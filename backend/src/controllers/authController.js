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
    // Log request metadata for debugging
    logger.info('📨 Registration request metadata', {
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      user_type = 'customer', // Frontend default
      phone,
      locality
    } = req.body;

    // Log the incoming request for debugging
    logger.info('🔄 Registration request received', {
      email: email,
      userType: user_type,
      hasFirstName: !!first_name,
      hasLastName: !!last_name,
      hasPassword: !!password,
      hasPhone: !!phone,
      hasLocality: !!locality,
      requestBody: { ...req.body, password: 'HIDDEN' }
    });

    // Enhanced validation with detailed logging
    const missingFields = [];
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!user_type) missingFields.push('user_type');

    if (missingFields.length > 0) {
      logger.error('❌ Registration failed: Missing required fields', {
        missingFields: missingFields,
        email: email,
        providedFields: Object.keys(req.body)
      });
      return res.validation({
        missing_fields: missingFields,
        required_fields: ['first_name', 'last_name', 'email', 'password', 'user_type']
      }, `Faltan campos requeridos: ${missingFields.join(', ')}`);
    }

    // Additional data validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.error('❌ Registration failed: Invalid email format', {
        email: email,
        emailPattern: emailRegex.toString()
      });
      return res.validation({
        error_type: 'invalid_email_format',
        provided_email: email
      }, 'Formato de email inválido');
    }

    if (password.length < 6) {
      logger.error('❌ Registration failed: Password too short', {
        email: email,
        passwordLength: password.length,
        minLength: 6
      });
      return res.validation({
        error_type: 'password_too_short',
        provided_length: password.length,
        minimum_length: 6
      }, 'La contraseña debe tener al menos 6 caracteres');
    }

    // Validate user_type - accept both frontend and backend values
    // Frontend: customer, provider, admin
    // Backend: client, provider, admin (after middleware transformation)
    const allowedUserTypes = ['customer', 'provider', 'admin', 'client'];
    if (!allowedUserTypes.includes(user_type)) {
      logger.error('❌ Registration failed: Invalid user_type', {
        providedUserType: user_type,
        allowedUserTypes: allowedUserTypes,
        email: email
      });
      return res.validation({
        provided_user_type: user_type,
        allowed_user_types: ['customer', 'provider', 'admin'] // Show frontend values only
      }, `Tipo de usuario no válido. Debe ser uno de: customer, provider, admin`);
    }

    // Check if email already exists
    logger.info('🔍 Checking email uniqueness', { email: email });
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      logger.error('❌ Registration failed: Email already exists', {
        email: email,
        existingUserId: existingUser.rows[0].id
      });
      return res.error('Ya existe una cuenta con este email', 409, {
        error_type: 'email_already_exists'
      });
    }

    logger.info('✅ Email uniqueness check passed', { email: email });

    // user_type is already transformed by middleware (customer -> client)
    const dbUserType = user_type;  // Already transformed by userTypeTransformMiddleware
    
    // Validate database user_type matches constraints (safety check)
    const validDbUserTypes = ['client', 'provider', 'admin'];
    logger.info('✅ Using middleware-transformed user type', {
      dbType: dbUserType,
      isValid: validDbUserTypes.includes(dbUserType)
    });
    
    if (!validDbUserTypes.includes(dbUserType)) {
      logger.error('❌ Invalid database user_type from middleware', {
        dbType: dbUserType,
        validDbTypes: validDbUserTypes,
        email: email
      });
      return res.error('Error interno: tipo de usuario no válido', 500, {
        database_user_type: dbUserType,
        valid_database_types: validDbUserTypes,
        error_type: 'user_type_invalid'
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
      hasLocality: !!locality,
      insertValues: {
        first_name: insertValues[0],
        last_name: insertValues[1],
        email: insertValues[2],
        password_hash: '***HIDDEN***',
        user_type: insertValues[4],
        phone: insertValues[5],
        locality: insertValues[6],
        verification_status: insertValues[7],
        email_verified: insertValues[8],
        is_active: insertValues[9]
      }
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
          logger.info(`✅ Verification email sent to ${user.email}`);
        } else {
          logger.error('⚠️ Failed to send verification email:', emailResult.error);
        }
      } catch (emailError) {
        logger.error('⚠️ Error sending verification email:', emailError);
      }

      return res.success({
        user: sanitizeUser(user),
        emailVerificationRequired: true,
        requiresVerification: true
      }, 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.', 201);
    } else {
      // Development mode - auto-login
      return res.success({
        user: sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        emailVerificationRequired: false
      }, 'Usuario registrado exitosamente.', 201);
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

    // Handle specific PostgreSQL errors using responseFormatter
    if (error.code === '23505') { // Unique constraint violation
      return res.error('Ya existe una cuenta con este email', 409);
    }
    
    if (error.code === '23514') { // Check constraint violation
      return res.error('Datos de usuario no válidos. Verifica el tipo de usuario.', 400);
    }
    
    if (error.code === '23502') { // NOT NULL constraint violation
      return res.error('Faltan campos requeridos para el registro', 400);
    }
    
    if (error.code === '42P01') { // Table does not exist
      logger.error('🚨 CRITICAL: Users table does not exist', { error: error.message });
      return res.error('Error de configuración de la base de datos', 500);
    }

    // Generic database connection errors
    if (error.message.includes('connect') || error.message.includes('connection')) {
      return res.error('Servicio temporalmente no disponible. Intenta nuevamente.', 503);
    }

    // Default error response using responseFormatter
    return res.dbError(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.validation({ missing_fields: ['email', 'password'] }, 'Email y contraseña son requeridos');
    }

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.unauthorized('Credenciales inválidas');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.unauthorized('Credenciales inválidas');
    }

    // Check if email is verified (production security)
    if (!user.email_verified && process.env.NODE_ENV === 'production') {
      return res.error('Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.', 403, {
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

    return res.success({
      user: userWithStats,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }, 'Inicio de sesión exitoso');

  } catch (error) {
    logger.error('Login error:', error);
    return res.dbError(error, 'Error en el inicio de sesión');
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
      return res.notFound('Usuario no encontrado');
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

    return res.success(userWithStats, 'Usuario obtenido exitosamente');

  } catch (error) {
    logger.error('Get current user error:', error);
    return res.dbError(error, 'Error al obtener el usuario actual');
  }
};




// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Enterprise-grade input validation and sanitization
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'address', 'city',
      'latitude', 'longitude', 'birth_date', 'about_me', 'bio',
      'has_mobility', 'profile_image', 'professional_info', 'locality'
    ];
    
    const updates = {};
    const values = [];
    let paramIndex = 1;

    // Enhanced security validation for each field
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        let value = req.body[key];
        
        // Input sanitization and validation
        if (typeof value === 'string') {
          value = value.trim();
          
          // Prevent XSS attacks
          value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          value = value.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
          
          // Length validation
          if (['first_name', 'last_name'].includes(key) && (value.length < 2 || value.length > 100)) {
            return res.validation({ field: key, error: 'invalid_length' }, `${key} debe tener entre 2 y 100 caracteres`);
          }
          
          if (key === 'bio' && value.length > 1000) {
            return res.validation({ field: key, error: 'too_long' }, 'La biografía no puede exceder 1000 caracteres');
          }
          
          if (key === 'phone' && value.length > 20) {
            return res.validation({ field: key, error: 'invalid_phone' }, 'Número de teléfono inválido');
          }
        }
        
        updates[key] = `$${paramIndex}`;
        values.push(value);
        paramIndex++;
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.validation({ allowed_fields: allowedFields }, 'No hay campos válidos para actualizar');
    }

    // Log profile update for security monitoring
    logger.info('👤 Profile update initiated', {
      userId: userId,
      updatedFields: Object.keys(updates),
      userEmail: req.user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const setClause = Object.keys(updates).map(key => `${key} = ${updates[key]}`).join(', ');
    values.push(userId);

    const result = await query(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.notFound('Usuario no encontrado');
    }

    const updatedUser = sanitizeUser(result.rows[0]);
    
    // Log successful update
    logger.info('✅ Profile update completed successfully', {
      userId: userId,
      updatedFields: Object.keys(updates),
      userEmail: req.user.email
    });

    return res.success(updatedUser, 'Perfil actualizado exitosamente');

  } catch (error) {
    logger.error('❌ Update profile error:', {
      error: error.message,
      userId: req.user?.id,
      userEmail: req.user?.email,
      stack: error.stack
    });
    return res.dbError(error, 'Error al actualizar el perfil');
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.validation({ missing_fields: ['currentPassword', 'newPassword'] }, 'Contraseña actual y nueva contraseña son requeridas');
    }

    if (!validatePassword(newPassword)) {
      return res.validation({ error_type: 'password_too_short' }, 'La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Get current user with password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.notFound('Usuario no encontrado');
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.error('La contraseña actual es incorrecta', 400, { error_type: 'invalid_current_password' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    return res.success(null, 'Contraseña cambiada exitosamente');

  } catch (error) {
    logger.error('Change password error:', error);
    return res.dbError(error, 'Error al cambiar la contraseña');
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
    
    // Blacklist the old refresh token for security (Redis-based)
    const { blacklistToken } = require('../middleware/auth');
    await blacklistToken(oldRefreshToken);
    
    // Log token refresh for security monitoring
    logger.info('🔄 Token refresh successful', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.success({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }, 'Tokens renovados exitosamente');
    
  } catch (error) {
    logger.error('🚨 Token refresh error', {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.error('Error interno del servidor', 500);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const token = req.token; // Set by auth middleware
    const refreshToken = req.body.refreshToken || req.header('X-Refresh-Token');
    
    // Blacklist both tokens (Redis-based)
    const { blacklistToken } = require('../middleware/auth');
    if (token) {
      await blacklistToken(token);
    }
    if (refreshToken) {
      await blacklistToken(refreshToken);
    }
    
    // Log logout for security monitoring
    logger.info('👋 User logout successful', {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.success(null, 'Sesión cerrada exitosamente');
    
  } catch (error) {
    logger.error('🚨 Logout error', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });
    
    return res.error('Error interno del servidor', 500);
  }
};