const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Portfolio Security Middleware - Enterprise-grade security for portfolio operations
 * 
 * Provides:
 * - File upload security and validation
 * - Rate limiting for portfolio operations
 * - Input sanitization and validation
 * - Privacy controls enforcement
 * - Malware protection and file scanning
 */

// Rate limiting for portfolio uploads
const portfolioUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: {
    success: false,
    error: 'Demasiadas subidas de portafolio. Intenta de nuevo en 15 minutos.',
    retry_after: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for premium users
    return req.user?.is_premium === true;
  },
  keyGenerator: (req) => {
    return req.user?.id ? `portfolio_upload_${req.user.id}` : req.ip;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('Portfolio upload rate limit exceeded', {
      category: 'security',
      user_id: req.user?.id,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });
  }
});

// Rate limiting for portfolio views/likes
const portfolioInteractionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 interactions per minute
  message: {
    success: false,
    error: 'Demasiadas interacciones. Intenta de nuevo en un minuto.',
    retry_after: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `portfolio_interaction_${req.user.id}` : req.ip;
  }
});

// Rate limiting for marketplace browsing
const marketplaceBrowseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute for browsing
  message: {
    success: false,
    error: 'Demasiadas consultas al marketplace. Intenta de nuevo en un minuto.',
    retry_after: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for authenticated users with higher limits
    return req.user?.id;
  },
  keyGenerator: (req) => {
    return req.user?.id ? `marketplace_browse_${req.user.id}` : req.ip;
  }
});

// File validation middleware
const validateFileUpload = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron archivos'
      });
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 10;

    // Validate file count
    if (req.files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        error: `Máximo ${maxFiles} archivos permitidos por subida`
      });
    }

    // Validate each file
    for (const file of req.files) {
      // Check file size
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          error: `Archivo ${file.originalname} excede el tamaño máximo de 10MB`
        });
      }

      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `Tipo de archivo no válido: ${file.originalname}. Solo se permiten imágenes JPG, PNG y WebP.`
        });
      }

      // Check file extension
      const fileExt = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        return res.status(400).json({
          success: false,
          error: `Extensión de archivo no válida: ${file.originalname}`
        });
      }

      // Check for potential malicious content in filename
      const suspiciousPatterns = [
        /\.(php|js|html|exe|bat|cmd|scr|vbs)$/i,
        /\.\./,
        /[<>:"\\|?*]/,
        /\x00/
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(file.originalname)) {
          logger.warn('Suspicious file upload attempt', {
            category: 'security',
            user_id: req.user?.id,
            filename: file.originalname,
            ip: req.ip
          });

          return res.status(400).json({
            success: false,
            error: 'Nombre de archivo no válido'
          });
        }
      }

      // Validate file magic numbers (basic anti-spoofing)
      const fileSignatures = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF header
      };

      if (file.buffer) {
        const signature = fileSignatures[file.mimetype];
        if (signature) {
          const fileHeader = Array.from(file.buffer.slice(0, signature.length));
          const signatureMatches = signature.every((byte, index) => fileHeader[index] === byte);
          
          if (!signatureMatches) {
            return res.status(400).json({
              success: false,
              error: `Archivo ${file.originalname} parece estar corrupto o no es del tipo especificado`
            });
          }
        }
      }
    }

    next();
  } catch (error) {
    logger.error('File validation error', {
      category: 'security',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error en la validación de archivos'
    });
  }
};

// Input sanitization middleware
const sanitizePortfolioInput = (req, res, next) => {
  try {
    const fieldsToSanitize = [
      'title', 'description', 'alt_text', 'project_location', 
      'private_notes', 'category', 'search'
    ];

    for (const field of fieldsToSanitize) {
      if (req.body[field]) {
        // Remove potentially dangerous characters
        req.body[field] = req.body[field]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();

        // Limit length
        const maxLengths = {
          title: 200,
          description: 2000,
          alt_text: 200,
          project_location: 100,
          private_notes: 1000,
          category: 50,
          search: 100
        };

        if (maxLengths[field] && req.body[field].length > maxLengths[field]) {
          req.body[field] = req.body[field].substring(0, maxLengths[field]);
        }
      }
    }

    // Sanitize tags array
    if (req.body.tags) {
      try {
        let tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        
        if (Array.isArray(tags)) {
          tags = tags
            .filter(tag => typeof tag === 'string')
            .map(tag => tag.trim().substring(0, 50))
            .filter(tag => tag.length > 0)
            .slice(0, 20); // Max 20 tags
          
          req.body.tags = tags;
        } else {
          req.body.tags = [];
        }
      } catch (e) {
        req.body.tags = [];
      }
    }

    // Validate numeric fields
    const numericFields = ['project_value', 'priority', 'category_id', 'page', 'limit'];
    for (const field of numericFields) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        const num = parseFloat(req.body[field]);
        if (isNaN(num) || !isFinite(num)) {
          delete req.body[field];
        } else {
          req.body[field] = num;
        }
      }
    }

    // Validate boolean fields
    const booleanFields = [
      'is_featured', 'is_marketplace_visible', 'is_profile_visible',
      'has_portfolio', 'is_verified', 'is_premium', 'include_private'
    ];
    for (const field of booleanFields) {
      if (req.body[field] !== undefined) {
        req.body[field] = req.body[field] === 'true' || req.body[field] === true;
      }
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error', {
      category: 'security',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error en la validación de entrada'
    });
  }
};

// Privacy enforcement middleware
const enforcePrivacyControls = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    // Skip privacy checks for own content or admin users
    if (requestingUserId === parseInt(userId) || req.user?.user_type === 'admin') {
      return next();
    }

    // Get privacy settings
    const privacyQuery = `
      SELECT * FROM as_privacy_settings 
      WHERE user_id = $1
    `;
    const privacyResult = await query(privacyQuery, [userId]);
    const privacy = privacyResult.rows[0];

    if (!privacy) {
      // No privacy settings means public by default
      return next();
    }

    // Check portfolio visibility
    if (privacy.portfolio_visibility === 'private') {
      return res.status(403).json({
        success: false,
        error: 'Este portafolio es privado'
      });
    }

    if (privacy.portfolio_visibility === 'clients_only') {
      // Check if requesting user is a client
      if (!requestingUserId) {
        return res.status(401).json({
          success: false,
          error: 'Autenticación requerida para ver este portafolio'
        });
      }

      const clientCheckQuery = `
        SELECT 1 FROM bookings 
        WHERE professional_id = $1 AND client_id = $2 
        AND status IN ('completed', 'confirmed')
        LIMIT 1
      `;
      const clientCheck = await query(clientCheckQuery, [userId, requestingUserId]);
      
      if (clientCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Solo los clientes de este profesional pueden ver su portafolio'
        });
      }
    }

    // Check marketplace visibility
    if (req.baseUrl.includes('/marketplace') && !privacy.show_portfolio_in_marketplace) {
      return res.status(403).json({
        success: false,
        error: 'Este profesional no muestra su portafolio en el marketplace'
      });
    }

    // Check if contact is required before viewing
    if (privacy.require_contact_before_portfolio && !requestingUserId) {
      return res.status(401).json({
        success: false,
        error: 'Debes contactar al profesional antes de ver su portafolio'
      });
    }

    // Add privacy context to request
    req.privacySettings = privacy;
    next();

  } catch (error) {
    logger.error('Privacy enforcement error', {
      category: 'security',
      user_id: req.user?.id,
      target_user: req.params.userId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Error al verificar configuración de privacidad'
    });
  }
};

// Anti-spam and abuse detection middleware
const detectAbusePatterns = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const ip = req.ip;

    if (!userId) {
      return next(); // Skip for anonymous users
    }

    // Check for rapid-fire requests (potential bot behavior)
    const recentRequestsQuery = `
      SELECT COUNT(*) as request_count
      FROM audit_logs 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '1 minute'
      AND action IN ('portfolio_upload', 'portfolio_view', 'portfolio_like')
    `;

    const recentRequests = await query(recentRequestsQuery, [userId]);
    const requestCount = parseInt(recentRequests.rows[0]?.request_count || 0);

    if (requestCount > 50) { // More than 50 portfolio actions per minute
      logger.warn('Potential abuse detected - rapid requests', {
        category: 'security',
        user_id: userId,
        ip,
        request_count: requestCount,
        endpoint: req.originalUrl
      });

      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Por favor, reduce la velocidad.',
        retry_after: 60
      });
    }

    // Check for suspicious upload patterns
    if (req.files && req.files.length > 0) {
      const recentUploadsQuery = `
        SELECT COUNT(*) as upload_count
        FROM portfolio_images 
        WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '1 hour'
      `;

      const recentUploads = await query(recentUploadsQuery, [userId]);
      const uploadCount = parseInt(recentUploads.rows[0]?.upload_count || 0);

      if (uploadCount > 20) { // More than 20 uploads per hour
        logger.warn('Potential abuse detected - excessive uploads', {
          category: 'security',
          user_id: userId,
          ip,
          upload_count: uploadCount
        });

        return res.status(429).json({
          success: false,
          error: 'Demasiadas subidas en una hora. Intenta más tarde.',
          retry_after: 3600
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Abuse detection error', {
      category: 'security',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    // Don't block on detection errors, just log
    next();
  }
};

// Content moderation middleware
const contentModerationFilter = (req, res, next) => {
  try {
    const contentFields = ['title', 'description', 'alt_text', 'private_notes'];
    
    // List of prohibited content patterns
    const prohibitedPatterns = [
      /\b(?:fuck|shit|damn|hell|bitch|asshole|bastard|crap|piss)\b/gi, // Basic profanity
      /\b(?:viagra|cialis|casino|poker|lottery|winner|congratulations)\b/gi, // Spam keywords
      /\b(?:hack|crack|pirate|torrent|warez)\b/gi, // Illegal content
      /(?:https?:\/\/|www\.)[^\s]+/gi, // External links
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // Credit card patterns
      /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN patterns
    ];

    for (const field of contentFields) {
      if (req.body[field]) {
        for (const pattern of prohibitedPatterns) {
          if (pattern.test(req.body[field])) {
            logger.warn('Prohibited content detected', {
              category: 'moderation',
              user_id: req.user?.id,
              field,
              content_snippet: req.body[field].substring(0, 100),
              pattern: pattern.source
            });

            return res.status(400).json({
              success: false,
              error: `Contenido no permitido detectado en ${field}. Por favor, revisa tu texto.`
            });
          }
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Content moderation error', {
      category: 'security',
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    // Don't block on moderation errors, just log
    next();
  }
};

module.exports = {
  portfolioUploadLimiter,
  portfolioInteractionLimiter,
  marketplaceBrowseLimiter,
  validateFileUpload,
  sanitizePortfolioInput,
  enforcePrivacyControls,
  detectAbusePatterns,
  contentModerationFilter
};