const winston = require('../config/winston');
const { captureException, captureMessage } = require('../config/sentry');

// Log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Log categories for better organization
const LOG_CATEGORIES = {
  AUTH: 'auth',
  API: 'api',
  DATABASE: 'database',
  BUSINESS: 'business',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  AUDIT: 'audit',
  ERROR: 'error',
  HTTP: 'http'
};

// Custom logger with Winston and Sentry integration
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test';
    this.winston = winston;
  }

  // Format log message with structured data
  formatLogData(message, context = {}) {
    return {
      message,
      ...context,
      timestamp: new Date().toISOString()
    };
  }

  // Log error with Winston and Sentry integration
  error(message, error = null, context = {}) {
    const logData = this.formatLogData(message, {
      ...context,
      category: context.category || LOG_CATEGORIES.ERROR,
      level: LOG_LEVELS.ERROR,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null
    });
    
    // Log to Winston
    this.winston.error(logData);
    
    // Send to Sentry if not in test environment
    if (!this.isTest) {
      if (error instanceof Error) {
        captureException(error, context);
      } else {
        captureMessage(message, LOG_LEVELS.ERROR, context);
      }
    }
  }

  // Log warning
  warn(message, context = {}) {
    const logData = this.formatLogData(message, {
      ...context,
      category: context.category || LOG_CATEGORIES.ERROR,
      level: LOG_LEVELS.WARN
    });
    
    this.winston.warn(logData);
    
    if (!this.isTest) {
      captureMessage(message, LOG_LEVELS.WARN, context);
    }
  }

  // Log info
  info(message, context = {}) {
    const logData = this.formatLogData(message, {
      ...context,
      category: context.category || LOG_CATEGORIES.API,
      level: LOG_LEVELS.INFO
    });
    
    this.winston.info(logData);
    
    // Don't send info messages to Sentry in production to avoid noise
    if (this.isDevelopment && !this.isTest) {
      captureMessage(message, LOG_LEVELS.INFO, context);
    }
  }

  // Log debug (only in development)
  debug(message, context = {}) {
    if (this.isDevelopment || process.env.LOG_LEVEL === 'debug') {
      const logData = this.formatLogData(message, {
        ...context,
        category: context.category || LOG_CATEGORIES.API,
        level: LOG_LEVELS.DEBUG
      });
      
      this.winston.debug(logData);
    }
  }

  // Log authentication events
  auth(action, user, request = null, success = true) {
    const logData = this.formatLogData(
      `Auth ${action}: ${success ? 'Success' : 'Failed'}${user ? ` for user ${user.email}` : ''}`,
      {
        category: LOG_CATEGORIES.AUTH,
        level: success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN,
        action,
        success,
        user: user ? {
          id: user.id,
          email: user.email,
          user_type: user.user_type
        } : null,
        request: request ? {
          method: request.method,
          originalUrl: request.originalUrl,
          ip: request.ip,
          userAgent: request.get('User-Agent')
        } : null
      }
    );
    
    if (success) {
      this.winston.info(logData);
    } else {
      this.winston.warn(logData);
    }
  }

  // Log API requests
  request(req, res, duration) {
    const logData = this.formatLogData(
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
      {
        category: LOG_CATEGORIES.HTTP,
        level: res.statusCode >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        user: req.user ? {
          id: req.user.id,
          email: req.user.email,
          user_type: req.user.user_type
        } : null
      }
    );
    
    if (res.statusCode >= 400) {
      this.winston.warn(logData);
    } else {
      this.winston.info(logData);
    }
  }

  // Log business events
  business(event, data = {}, user = null) {
    const logData = this.formatLogData(`Business event: ${event}`, {
      category: LOG_CATEGORIES.BUSINESS,
      level: LOG_LEVELS.INFO,
      event,
      data,
      user: user ? {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      } : null
    });

    this.winston.info(logData);
  }

  // Log security events
  security(event, details = {}, request = null, user = null) {
    const logData = this.formatLogData(`Security event: ${event}`, {
      category: LOG_CATEGORIES.SECURITY,
      level: LOG_LEVELS.WARN,
      event,
      details,
      user: user ? {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      } : null,
      request: request ? {
        method: request.method,
        originalUrl: request.originalUrl,
        ip: request.ip,
        userAgent: request.get('User-Agent')
      } : null
    });

    this.winston.warn(logData);
  }

  // Log database events
  database(operation, table, success = true, duration = null, error = null) {
    const logData = this.formatLogData(
      `Database ${operation} on ${table}: ${success ? 'Success' : 'Failed'}${duration ? ` (${duration}ms)` : ''}`,
      {
        category: LOG_CATEGORIES.DATABASE,
        level: success ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR,
        operation,
        table,
        success,
        duration,
        error: error ? {
          name: error.name,
          message: error.message,
          code: error.code
        } : null
      }
    );
    
    if (success) {
      this.winston.debug(logData);
    } else {
      this.winston.error(logData);
    }
  }

  // Log performance metrics
  performance(metric, value, threshold = null, context = {}) {
    const logData = this.formatLogData(`Performance metric: ${metric} = ${value}`, {
      category: LOG_CATEGORIES.PERFORMANCE,
      level: LOG_LEVELS.INFO,
      metric,
      value,
      threshold,
      isSlowOperation: threshold && value > threshold,
      ...context
    });

    this.winston.info(logData);
  }

  // Log audit events for compliance
  audit(action, resource, user = null, request = null, result = 'success') {
    const logData = this.formatLogData(`Audit: ${action} on ${resource}`, {
      category: LOG_CATEGORIES.AUDIT,
      level: LOG_LEVELS.INFO,
      action,
      resource,
      result,
      user: user ? {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      } : null,
      request: request ? {
        method: request.method,
        originalUrl: request.originalUrl,
        ip: request.ip,
        userAgent: request.get('User-Agent')
      } : null
    });

    this.winston.info(logData);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;