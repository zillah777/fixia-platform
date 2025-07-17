const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const crypto = require('crypto');

// Import blacklist functions from auth controller
const { isTokenBlacklisted, blacklistToken } = require('../controllers/authController');

// Función para generar token con JTI
const generateToken = (payload) => {
  const jti = crypto.randomUUID();
  return jwt.sign(
    { ...payload, jti },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d',
      jwtid: jti,
      issuer: process.env.JWT_ISSUER || 'fixia-api',
      audience: process.env.JWT_AUDIENCE || 'fixia-app'
    }
  );
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

    // Verificar si el token está en blacklist
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token revocado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 60 // 1 minuto de tolerancia para clock skew
    });

    // Validar claims requeridos
    if (!decoded.id || !decoded.email || !decoded.user_type) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido - claims faltantes'
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

    console.error('Auth middleware error:', error);
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
  if (req.user.user_type !== 'customer') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo clientes pueden realizar esta acción.'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireProvider,
  requireCustomer,
  generateToken,
  blacklistToken,
  isTokenBlacklisted
};