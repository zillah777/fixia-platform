const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request start
  logger.debug(`Incoming ${req.method} ${req.originalUrl}`, {
    request: {
      method: req.method,
      originalUrl: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentType: req.get('Content-Type')
    },
    user: req.user
  });

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    // Log request completion
    logger.request(req, res, duration);
    
    // Call original end
    originalEnd.apply(this, args);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  // Log the error with context
  logger.error('Request error occurred', err, {
    request: {
      method: req.method,
      originalUrl: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body ? JSON.stringify(req.body) : null
    },
    user: req.user,
    extra: {
      stack: err.stack,
      statusCode: err.statusCode || 500
    },
    tags: {
      error_type: err.name || 'UnknownError',
      endpoint: req.originalUrl
    }
  });

  next(err);
};

// Authentication logging middleware
const authLogger = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const success = data.success === true;
      const user = data.user || req.user;
      
      logger.auth(action, user, req, success);
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Business event logging middleware
const businessLogger = (event) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (data.success === true) {
        logger.business(event, {
          requestData: req.body,
          responseData: data
        }, req.user);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Security event logging middleware
const securityLogger = (event, getDetails = () => ({})) => {
  return (req, res, next) => {
    const details = getDetails(req);
    
    logger.security(event, details, req, req.user);
    
    next();
  };
};

// Rate limit logging middleware
const rateLimitLogger = (req, res, next) => {
  // Check if rate limit was hit
  if (res.getHeader('X-RateLimit-Remaining') === '0') {
    logger.security('rate_limit_exceeded', {
      limit: res.getHeader('X-RateLimit-Limit'),
      remaining: res.getHeader('X-RateLimit-Remaining'),
      reset: res.getHeader('X-RateLimit-Reset')
    }, req, req.user);
  }
  
  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  authLogger,
  businessLogger,
  securityLogger,
  rateLimitLogger
};