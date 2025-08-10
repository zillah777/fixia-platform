const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const crypto = require('crypto');
const { logger } = require('../utils/smartLogger');

// Redis-based blacklist for revoked tokens (enterprise-grade security)
const { getRedisClient, CACHE_TTL } = require('../config/redis');

// Helper function to add token to blacklist with automatic TTL
const blacklistToken = async (token) => {
  try {
    const redis = getRedisClient();
    const key = `fixia:blacklist:token:${token}`;
    
    // Set with 7 days TTL (matches JWT expiration)
    await redis.setex(key, 7 * 24 * 60 * 60, 'blacklisted');
    console.log('✅ Token blacklisted successfully:', token.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Error blacklisting token:', error);
    // Fallback to in-memory if Redis fails
    _memoryBlacklist.add(token);
  }
};

// Helper function to check if token is blacklisted
const isTokenBlacklisted = async (token) => {
  try {
    const redis = getRedisClient();
    const key = `fixia:blacklist:token:${token}`;
    
    const result = await redis.exists(key);
    return result > 0;
  } catch (error) {
    console.error('❌ Error checking token blacklist:', error);
    // Fallback to in-memory if Redis fails
    return _memoryBlacklist.has(token);
  }
};

// In-memory fallback blacklist (only used if Redis fails)
const _memoryBlacklist = new Set();

// Security constants
const JWT_CONFIG = {
  access: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '15m', // Shorter access token lifetime
    issuer: process.env.JWT_ISSUER || 'fixia-api',
    audience: process.env.JWT_AUDIENCE || 'fixia-app'
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: process.env.JWT_ISSUER || 'fixia-api',
    audience: process.env.JWT_AUDIENCE || 'fixia-app'
  }
};

// Función para generar access token con JTI
const generateAccessToken = (payload) => {
  const jti = crypto.randomUUID();
  const tokenPayload = {
    ...payload,
    type: 'access',
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(tokenPayload, JWT_CONFIG.access.secret, {
    expiresIn: JWT_CONFIG.access.expiresIn,
    jwtid: jti,
    issuer: JWT_CONFIG.access.issuer,
    audience: JWT_CONFIG.access.audience
  });
};

// Función para generar refresh token
const generateRefreshToken = (payload) => {
  const jti = crypto.randomUUID();
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(tokenPayload, JWT_CONFIG.refresh.secret, {
    expiresIn: JWT_CONFIG.refresh.expiresIn,
    jwtid: jti,
    issuer: JWT_CONFIG.refresh.issuer,
    audience: JWT_CONFIG.refresh.audience
  });
};

// Función para generar par de tokens
const generateTokenPair = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

// Legacy function for backward compatibility
const generateToken = (payload) => {
  return generateAccessToken(payload);
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
    }

    // Verificar si el token está en blacklist (Redis check)
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Token revocado'
      });
    }

    // Enhanced JWT verification with additional security checks
    const decoded = jwt.verify(token, JWT_CONFIG.access.secret, {
      clockTolerance: 30, // Reduced tolerance for tighter security
      issuer: JWT_CONFIG.access.issuer,
      audience: JWT_CONFIG.access.audience
    });
    
    // Verify token type
    if (decoded.type && decoded.type !== 'access') {
      logger.warn('🚨 Invalid token type used for authentication', {
        tokenType: decoded.type,
        userId: decoded.id,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        error: 'Tipo de token inválido'
      });
    }

    // Validar claims requeridos con enhanced validation
    if (!decoded.id || !decoded.email || !decoded.user_type || !decoded.jti) {
      logger.warn('🚨 Invalid token claims detected', {
        hasId: !!decoded.id,
        hasEmail: !!decoded.email,
        hasUserType: !!decoded.user_type,
        hasJti: !!decoded.jti,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        error: 'Token inválido - claims faltantes'
      });
    }
    
    // Additional security: Check token age
    const tokenAge = Date.now() / 1000 - decoded.iat;
    const maxTokenAge = 24 * 60 * 60; // 24 hours maximum
    if (tokenAge > maxTokenAge) {
      logger.warn('🚨 Suspiciously old token detected', {
        tokenAge: tokenAge,
        userId: decoded.id,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        error: 'Token demasiado antiguo'
      });
    }
    
    const result = await query(
      'SELECT id, email, first_name, last_name, user_type, is_active, last_login FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada'
      });
    }

    // Verificar si el token fue emitido antes del último login (con tolerancia de 5 minutos)
    if (user.last_login && decoded.iat * 1000 < new Date(user.last_login).getTime() - 300000) {
      return res.status(401).json({
        success: false,
        error: 'Token obsoleto. Inicia sesión nuevamente.'
      });
    }

    req.user = user;
    req.token = token; // Guardar para potencial blacklist
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Inicia sesión nuevamente.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        error: 'Token no válido aún'
      });
    }

    logger.error('🚨 Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path
    });
    res.status(500).json({
      success: false,
      error: 'Error de autenticación'
    });
  }
};

const requireProvider = (req, res, next) => {
  if (req.user.user_type !== 'provider') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo profesionales pueden realizar esta acción.'
    });
  }
  next();
};

const requireCustomer = (req, res, next) => {
  // Check for both 'client' (database) and 'customer' (frontend) for compatibility
  if (req.user.user_type !== 'client' && req.user.user_type !== 'customer') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo clientes pueden realizar esta acción.'
    });
  }
  next();
};

// Middleware for refresh token validation
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.header('X-Refresh-Token');
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_CONFIG.refresh.secret, {
      clockTolerance: 30,
      issuer: JWT_CONFIG.refresh.issuer,
      audience: JWT_CONFIG.refresh.audience
    });
    
    // Verify token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Tipo de token inválido'
      });
    }
    
    // Check if refresh token is blacklisted (Redis check)
    const isBlacklisted = await isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token revocado'
      });
    }
    
    // Verify user still exists and is active
    const result = await query(
      'SELECT id, email, user_type, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no válido'
      });
    }
    
    req.user = result.rows[0];
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    logger.error('🚨 Refresh token middleware error', {
      error: error.message,
      ip: req.ip
    });
    
    return res.status(401).json({
      success: false,
      error: 'Refresh token inválido'
    });
  }
};

module.exports = {
  authMiddleware,
  refreshTokenMiddleware,
  requireProvider,
  requireCustomer,
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  blacklistToken,
  isTokenBlacklisted,
  JWT_CONFIG
};