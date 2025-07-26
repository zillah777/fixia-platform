/**
 * Smart Logger - Production-ready logging utility
 * @fileoverview Replaces console.log with smart, environment-aware logging
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m'
};

class SmartLogger {
  constructor() {
    this.level = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test';
  }

  getLogLevel() {
    const level = process.env.LOG_LEVEL || 'INFO';
    return LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = this.isDevelopment 
      ? `${LOG_COLORS[level]}[${level}]${LOG_COLORS.RESET}` 
      : `[${level}]`;
    
    let formatted = `${prefix} ${timestamp} - ${message}`;
    
    if (data && this.isDevelopment) {
      formatted += '\n' + JSON.stringify(data, null, 2);
    }
    
    return formatted;
  }

  shouldLog(level) {
    // Never log in test environment unless explicitly enabled
    if (this.isTest && !process.env.ENABLE_TEST_LOGS) {
      return false;
    }
    
    return LOG_LEVELS[level] <= this.level;
  }

  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message, data));
      
      // In production, could send to external service (Sentry, etc.)
      if (!this.isDevelopment && data?.error) {
        // Future: Send to error tracking service
      }
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  // Specialized loggers for common patterns
  apiRequest(method, url, user = null) {
    this.debug(`API ${method} ${url}`, { 
      user: user ? { id: user.id, email: user.email } : null 
    });
  }

  apiResponse(method, url, status, duration = null) {
    const level = status >= 400 ? 'WARN' : 'DEBUG';
    this[level](`API ${method} ${url} - ${status}`, { duration });
  }

  authAttempt(email, success, reason = null) {
    const message = `Auth attempt: ${email} - ${success ? 'SUCCESS' : 'FAILED'}`;
    const level = success ? 'INFO' : 'WARN';
    this[level](message, reason ? { reason } : null);
  }

  databaseQuery(query, duration, rows = null) {
    if (this.isDevelopment) {
      this.debug(`DB Query (${duration}ms)`, {
        query: query.substring(0, 100) + '...',
        rows: rows
      });
    }
  }

  performance(operation, duration, metadata = null) {
    const message = `Performance: ${operation} took ${duration}ms`;
    const level = duration > 1000 ? 'WARN' : 'DEBUG';
    this[level](message, metadata);
  }
}

// Create singleton instance
const logger = new SmartLogger();

// Legacy console replacement for gradual migration
const createLegacyLogger = (level) => {
  return (...args) => {
    if (args.length === 1 && typeof args[0] === 'string') {
      logger[level](args[0]);
    } else {
      logger[level](args[0], args.slice(1));
    }
  };
};

// Export both new logger and legacy replacements
module.exports = {
  logger,
  // Legacy console replacements
  log: createLegacyLogger('info'),
  info: createLegacyLogger('info'),
  warn: createLegacyLogger('warn'),
  error: createLegacyLogger('error'),
  debug: createLegacyLogger('debug')
};