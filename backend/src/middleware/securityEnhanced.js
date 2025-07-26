/**
 * Enhanced Security Middleware - Advanced security protection
 * @fileoverview Additional security layers beyond basic helmet configuration
 */
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const { logger } = require('../utils/smartLogger');

// Security Constants
const SECURITY_CONFIG = {
  // Rate limiting configurations for different endpoints  
  rateLimits: {
    strict: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
    auth: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 login attempts per 15 minutes
    api: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 API calls per 15 minutes
    uploads: { windowMs: 60 * 60 * 1000, max: 20 } // 20 uploads per hour
  },
  
  // Input size limits
  maxInputSizes: {
    name: 100,
    email: 255,
    password: 128,
    description: 2000,
    message: 1000,
    address: 500
  },
  
  // Blocked patterns (potential attack vectors)
  blockedPatterns: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript URLs
    /on\w+\s*=/gi, // Event handlers
    /expression\s*\(/gi, // CSS expressions
    /vbscript:/gi, // VBScript URLs
    /data:text\/html/gi, // Data URLs with HTML
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi // SQL keywords
  ]
};

/**
 * Advanced input sanitization
 */
const advancedSanitization = (req, res, next) => {
  const sanitizeValue = (value, maxLength = 1000) => {
    if (typeof value !== 'string') return value;
    
    // Check for blocked patterns
    for (const pattern of SECURITY_CONFIG.blockedPatterns) {
      if (pattern.test(value)) {
        logger.warn('🚨 Blocked potentially malicious input', {
          pattern: pattern.source,
          input: value.substring(0, 100),
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
        throw new Error('Invalid input detected');
      }
    }
    
    // Sanitize and limit length
    return validator.escape(value.trim()).substring(0, maxLength);
  };
  
  const sanitizeObject = (obj, depth = 0) => {
    if (depth > 5) return obj; // Prevent deep recursion
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item, depth + 1));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeValue(value, SECURITY_CONFIG.maxInputSizes[key] || 1000);
        } else {
          sanitized[key] = sanitizeObject(value, depth + 1);
        }
      }
      return sanitized;
    }
    
    return obj;
  };
  
  try {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    logger.error('Input sanitization failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.originalUrl
    });
    
    res.status(400).json({
      success: false,
      error: 'Invalid input provided'
    });
  }
};

/**
 * IP-based security monitoring
 */
const ipSecurityMonitor = (() => {
  const suspiciousIPs = new Map();
  const blockedIPs = new Set();
  
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Check if IP is blocked
    if (blockedIPs.has(clientIP)) {
      logger.warn('🚫 Blocked IP attempted access', { ip: clientIP });
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Track suspicious activity
    const now = Date.now();
    if (!suspiciousIPs.has(clientIP)) {
      suspiciousIPs.set(clientIP, { attempts: 0, lastAttempt: now, blocked: false });
    }
    
    const ipData = suspiciousIPs.get(clientIP);
    
    // Reset counter if enough time has passed
    if (now - ipData.lastAttempt > 15 * 60 * 1000) { // 15 minutes
      ipData.attempts = 0;
    }
    
    ipData.lastAttempt = now;
    
    // Monitor for rate limit violations
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 429) { // Rate limit exceeded
        ipData.attempts += 1;
        
        if (ipData.attempts >= 5) { // Block after 5 rate limit violations
          blockedIPs.add(clientIP);
          logger.error('🔒 IP blocked due to repeated violations', {
            ip: clientIP,
            attempts: ipData.attempts
          });
        } else {
          logger.warn('⚠️ Suspicious activity detected', {
            ip: clientIP,
            attempts: ipData.attempts
          });
        }
      }
      
      originalSend.call(this, body);
    };
    
    next();
  };
})();

/**
 * Request fingerprinting for anomaly detection
 */
const requestFingerprinting = (req, res, next) => {
  const fingerprint = {
    userAgent: req.headers['user-agent'],
    acceptLanguage: req.headers['accept-language'],
    acceptEncoding: req.headers['accept-encoding'],
    connection: req.headers.connection,
    ip: req.ip
  };
  
  // Store fingerprint for potential analysis
  req.fingerprint = fingerprint;
  
  // Log unusual patterns in development
  if (process.env.NODE_ENV === 'development') {
    const isBot = !fingerprint.userAgent || 
                  /bot|crawler|spider|scraper/i.test(fingerprint.userAgent);
    
    if (isBot) {
      logger.debug('🤖 Bot detected', { fingerprint });
    }
  }
  
  next();
};

/**
 * File upload security
 */
const fileUploadSecurity = (allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next(); // No file upload, continue
    }
    
    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!file) continue;
      
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        logger.warn('🚫 Rejected file upload - invalid type', {
          mimetype: file.mimetype,
          filename: file.originalname,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          error: 'Tipo de archivo no permitido'
        });
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        logger.warn('🚫 Rejected file upload - too large', {
          size: file.size,
          filename: file.originalname,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          error: 'Archivo demasiado grande'
        });
      }
      
      // Sanitize filename
      file.originalname = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
    
    next();
  };
};

/**
 * Enhanced rate limiting with different tiers
 */
const createRateLimit = (config, message = 'Demasiadas solicitudes') => {
  return rateLimit({
    ...config,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('🚨 Rate limit exceeded', {
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.headers['user-agent']
      });
      
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.round(config.windowMs / 1000)
      });
    }
  });
};

// Export configured rate limiters
const rateLimiters = {
  strict: createRateLimit(
    SECURITY_CONFIG.rateLimits.strict,
    'Demasiados intentos. Intenta de nuevo en 15 minutos.'
  ),
  auth: createRateLimit(
    SECURITY_CONFIG.rateLimits.auth,
    'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
  ),
  api: createRateLimit(
    SECURITY_CONFIG.rateLimits.api,
    'Límite de solicitudes de API excedido. Intenta de nuevo más tarde.'
  ),
  uploads: createRateLimit(
    SECURITY_CONFIG.rateLimits.uploads,
    'Límite de cargas de archivos excedido. Intenta de nuevo en una hora.'
  )
};

module.exports = {
  advancedSanitization,
  ipSecurityMonitor,
  requestFingerprinting,
  fileUploadSecurity,
  rateLimiters,
  SECURITY_CONFIG
};