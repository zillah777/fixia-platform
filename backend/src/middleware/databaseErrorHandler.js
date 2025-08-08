/**
 * Database Error Handler Middleware
 * Provides user-friendly error messages and graceful degradation
 * when database connectivity issues occur
 */

const logger = require('../utils/logger');
const { dbStatus } = require('../config/database');

/**
 * Database error codes and their user-friendly messages
 */
const ERROR_MESSAGES = {
  // Connection errors
  ECONNRESET: {
    user: 'Estamos experimentando problemas temporales de conectividad. Por favor, intenta nuevamente en unos momentos.',
    technical: 'Database connection was reset',
    retryable: true
  },
  ENOTFOUND: {
    user: 'No podemos conectar con nuestros servidores en este momento. Por favor, verifica tu conexión a internet.',
    technical: 'Database host not found',
    retryable: true
  },
  ETIMEDOUT: {
    user: 'La conexión está tardando más de lo esperado. Por favor, intenta nuevamente.',
    technical: 'Database connection timeout',
    retryable: true
  },
  ECONNREFUSED: {
    user: 'Nuestros servicios no están disponibles temporalmente. Estamos trabajando para solucionarlo.',
    technical: 'Database connection refused',
    retryable: true
  },
  
  // Authentication errors
  '28P01': {
    user: 'Error de configuración del sistema. Por favor, contacta al soporte técnico.',
    technical: 'Invalid authorization specification (wrong credentials)',
    retryable: false
  },
  
  // Database errors
  '42P01': {
    user: 'Hay un problema con la estructura de datos. Por favor, contacta al soporte técnico.',
    technical: 'Undefined table',
    retryable: false
  },
  '42703': {
    user: 'Error en la consulta de datos. Por favor, intenta nuevamente o contacta al soporte.',
    technical: 'Undefined column',
    retryable: false
  },
  '23505': {
    user: 'Esta información ya existe en el sistema. Por favor, verifica los datos ingresados.',
    technical: 'Unique constraint violation',
    retryable: false
  },
  '23503': {
    user: 'No se puede completar esta acción debido a dependencias en el sistema.',
    technical: 'Foreign key constraint violation',
    retryable: false
  },
  '23514': {
    user: 'Los datos ingresados no cumplen con los requisitos del sistema.',
    technical: 'Check constraint violation',
    retryable: false
  },
  
  // Generic timeout errors
  timeout: {
    user: 'La operación está tardando más de lo esperado. Por favor, intenta nuevamente.',
    technical: 'Query execution timeout',
    retryable: true
  },
  
  // Pool errors
  'Client acquisition timeout': {
    user: 'El sistema está experimentando alta demanda. Por favor, intenta nuevamente en unos momentos.',
    technical: 'Database pool exhausted',
    retryable: true
  }
};

/**
 * Get user-friendly error message based on error code/message
 */
const getUserFriendlyMessage = (error) => {
  const errorInfo = ERROR_MESSAGES[error.code] || 
                   ERROR_MESSAGES[error.message] ||
                   (error.message?.includes('timeout') ? ERROR_MESSAGES.timeout : null);
  
  if (errorInfo) {
    return {
      message: errorInfo.user,
      technical: errorInfo.technical,
      retryable: errorInfo.retryable
    };
  }
  
  // Default fallback message
  return {
    message: 'Estamos experimentando problemas técnicos temporales. Por favor, intenta nuevamente en unos momentos.',
    technical: error.message || 'Unknown database error',
    retryable: true
  };
};

/**
 * Middleware to handle database errors gracefully
 */
const handleDatabaseError = (error, req, res, next) => {
  // Check if this is a database-related error
  const isDatabaseError = (
    error.code?.startsWith('E') || // Network errors (ECONNRESET, etc.)
    error.code?.match(/^\d{5}$/) || // PostgreSQL error codes (5 digits)
    error.message?.includes('database') ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout') ||
    error.message?.includes('pool')
  );
  
  if (!isDatabaseError) {
    return next(error);
  }
  
  const userError = getUserFriendlyMessage(error);
  const currentDbStatus = dbStatus();
  
  // Log the error with context
  logger.error('Database error encountered', {
    error: error.message,
    code: error.code,
    stack: error.stack,
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    dbStatus: currentDbStatus,
    retryable: userError.retryable
  });
  
  // Determine appropriate HTTP status code
  let statusCode = 500;
  if (userError.retryable) {
    statusCode = 503; // Service Unavailable (temporary)
  } else if (error.code === '23505' || error.code === '23503' || error.code === '23514') {
    statusCode = 400; // Bad Request (constraint violations)
  }
  
  // Return user-friendly error response
  const response = {
    success: false,
    error: {
      message: userError.message,
      retryable: userError.retryable,
      timestamp: new Date().toISOString()
    }
  };
  
  // Add technical details in development
  if (process.env.NODE_ENV === 'development') {
    response.error.technical = userError.technical;
    response.error.code = error.code;
    response.error.dbStatus = currentDbStatus;
  }
  
  // Add retry suggestions for retryable errors
  if (userError.retryable) {
    response.error.retryAfter = 30; // seconds
    response.error.suggestion = 'Por favor, intenta nuevamente en unos momentos. Si el problema persiste, contacta al soporte técnico.';
  }
  
  res.status(statusCode).json(response);
};

/**
 * Middleware to check database health before processing requests
 */
const checkDatabaseHealth = async (req, res, next) => {
  const currentDbStatus = dbStatus();
  
  // Skip health check for health endpoints to avoid recursion
  if (req.path.includes('/health') || req.path.includes('/status')) {
    return next();
  }
  
  // If database is known to be down, return early
  if (!currentDbStatus.connected && currentDbStatus.lastError) {
    const userError = getUserFriendlyMessage(currentDbStatus.lastError);
    
    logger.warn('Request blocked due to database health issues', {
      endpoint: req.originalUrl,
      method: req.method,
      dbStatus: currentDbStatus
    });
    
    return res.status(503).json({
      success: false,
      error: {
        message: userError.message,
        retryable: true,
        retryAfter: 60,
        timestamp: new Date().toISOString(),
        suggestion: 'El sistema está experimentando problemas temporales. Por favor, intenta nuevamente en unos minutos.'
      }
    });
  }
  
  next();
};

/**
 * Express error handler specifically for async database operations
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Utility function to wrap database operations with user-friendly error handling
 */
const withDatabaseErrorHandling = async (operation, fallbackResponse = null) => {
  try {
    return await operation();
  } catch (error) {
    const userError = getUserFriendlyMessage(error);
    
    logger.error('Database operation failed', {
      error: error.message,
      code: error.code,
      technical: userError.technical,
      retryable: userError.retryable
    });
    
    if (fallbackResponse && userError.retryable) {
      logger.info('Returning fallback response due to retryable error');
      return fallbackResponse;
    }
    
    throw error;
  }
};

module.exports = {
  handleDatabaseError,
  checkDatabaseHealth,
  asyncErrorHandler,
  withDatabaseErrorHandling,
  getUserFriendlyMessage
};