const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos máximo
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación. Inténtalo de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
  keyGenerator: (req) => {
    // Rate limit por IP y email si está disponible
    return req.ip + (req.body?.email || '');
  }
});

// Rate limiting para API general
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para endpoints sensibles
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes a endpoint sensible.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para chat/mensajes
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 mensajes por minuto
  message: {
    success: false,
    error: 'Demasiados mensajes. Espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware de logging de seguridad
const securityLogger = (req, res, next) => {
  const securityEvents = {
    login: req.path.includes('/login'),
    register: req.path.includes('/register'),
    payment: req.path.includes('/payments'),
    profile: req.path.includes('/profile'),
    admin: req.path.includes('/admin')
  };

  if (Object.values(securityEvents).some(Boolean)) {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'unknown';
    const userId = req.user?.id || 'anonymous';
    
    console.log(`[SECURITY] ${timestamp} - ${req.method} ${req.path} - User: ${userId} - IP: ${req.ip} - UA: ${userAgent}`);
    
    // Log intentos de acceso a endpoints sensibles
    if (req.method === 'POST' && req.path.includes('/login')) {
      console.log(`[AUTH] Login attempt - Email: ${req.body?.email || 'unknown'} - IP: ${req.ip}`);
    }
  }

  next();
};

// Middleware para validar Content-Type
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type debe ser application/json'
      });
    }
  }
  next();
};

// Middleware para validar el tamaño del body
const validateBodySize = (req, res, next) => {
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
    return res.status(413).json({
      success: false,
      error: 'Payload demasiado grande'
    });
  }
  next();
};

// Middleware para agregar headers de seguridad
const securityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};

module.exports = {
  authLimiter,
  apiLimiter,
  sensitiveLimiter,
  chatLimiter,
  securityLogger,
  validateContentType,
  validateBodySize,
  securityHeaders
};