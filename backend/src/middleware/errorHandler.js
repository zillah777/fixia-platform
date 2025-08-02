const logger = require('../utils/logger');

/**
 * Enterprise Error Handler - Comprehensive error management
 * 
 * Provides:
 * - Structured error responses
 * - Error categorization and logging
 * - Security-safe error messages
 * - Performance monitoring integration
 * - Alert system for critical errors
 */

// Error types and their handling
const ERROR_TYPES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication', 
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  DATABASE: 'database',
  EXTERNAL_SERVICE: 'external_service',
  FILE_UPLOAD: 'file_upload',
  BUSINESS_LOGIC: 'business_logic',
  SYSTEM: 'system'
};

// Security-safe error messages for production
const SAFE_ERROR_MESSAGES = {
  [ERROR_TYPES.VALIDATION]: 'Los datos proporcionados no son válidos',
  [ERROR_TYPES.AUTHENTICATION]: 'Credenciales inválidas',
  [ERROR_TYPES.AUTHORIZATION]: 'No tienes permisos para realizar esta acción',
  [ERROR_TYPES.NOT_FOUND]: 'El recurso solicitado no existe',
  [ERROR_TYPES.RATE_LIMIT]: 'Demasiadas solicitudes. Intenta de nuevo más tarde',
  [ERROR_TYPES.DATABASE]: 'Error interno del servidor',
  [ERROR_TYPES.EXTERNAL_SERVICE]: 'Servicio temporalmente no disponible',
  [ERROR_TYPES.FILE_UPLOAD]: 'Error al procesar el archivo',
  [ERROR_TYPES.BUSINESS_LOGIC]: 'No se puede completar la operación',
  [ERROR_TYPES.SYSTEM]: 'Error interno del servidor'
};

// HTTP status codes for error types
const ERROR_STATUS_CODES = {
  [ERROR_TYPES.VALIDATION]: 400,
  [ERROR_TYPES.AUTHENTICATION]: 401,
  [ERROR_TYPES.AUTHORIZATION]: 403,
  [ERROR_TYPES.NOT_FOUND]: 404,
  [ERROR_TYPES.RATE_LIMIT]: 429,
  [ERROR_TYPES.DATABASE]: 500,
  [ERROR_TYPES.EXTERNAL_SERVICE]: 503,
  [ERROR_TYPES.FILE_UPLOAD]: 400,
  [ERROR_TYPES.BUSINESS_LOGIC]: 422,
  [ERROR_TYPES.SYSTEM]: 500
};

/**
 * Custom error class with enhanced context
 */
class EnhancedError extends Error {
  constructor(message, type = ERROR_TYPES.SYSTEM, statusCode = 500, context = {}) {
    super(message);
    this.name = 'EnhancedError';
    this.type = type;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Marks as operational error vs programming error
  }
}

/**
 * Create specific error types
 */
const createValidationError = (message, field = null) => {
  return new EnhancedError(message, ERROR_TYPES.VALIDATION, 400, { field });
};

const createAuthenticationError = (message = 'Authentication failed') => {
  return new EnhancedError(message, ERROR_TYPES.AUTHENTICATION, 401);
};

const createAuthorizationError = (message = 'Access denied') => {
  return new EnhancedError(message, ERROR_TYPES.AUTHORIZATION, 403);
};

const createNotFoundError = (resource = 'Resource') => {
  return new EnhancedError(`${resource} not found`, ERROR_TYPES.NOT_FOUND, 404, { resource });
};

const createRateLimitError = (retryAfter = 60) => {
  return new EnhancedError('Rate limit exceeded', ERROR_TYPES.RATE_LIMIT, 429, { retryAfter });
};

const createDatabaseError = (originalError, query = null) => {
  return new EnhancedError('Database operation failed', ERROR_TYPES.DATABASE, 500, { 
    originalError: originalError.message,
    query: query ? query.substring(0, 100) : null
  });
};

const createFileUploadError = (message, filename = null) => {
  return new EnhancedError(message, ERROR_TYPES.FILE_UPLOAD, 400, { filename });
};

const createBusinessLogicError = (message, code = null) => {
  return new EnhancedError(message, ERROR_TYPES.BUSINESS_LOGIC, 422, { code });
};

/**
 * Categorize unknown errors
 * @param {Error} error - The error to categorize
 * @returns {string} Error type
 */
const categorizeError = (error) => {
  if (error instanceof EnhancedError) {
    return error.type;
  }
  
  // Database errors
  if (error.code && (error.code.startsWith('22') || error.code.startsWith('23'))) {
    return ERROR_TYPES.DATABASE;
  }
  
  // Connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return ERROR_TYPES.EXTERNAL_SERVICE;
  }
  
  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT') {
    return ERROR_TYPES.FILE_UPLOAD;
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return ERROR_TYPES.AUTHENTICATION;
  }
  
  // Validation errors (from libraries like Joi, express-validator)
  if (error.name === 'ValidationError' || error.isJoi) {
    return ERROR_TYPES.VALIDATION;
  }
  
  // Default to system error
  return ERROR_TYPES.SYSTEM;
};

/**
 * Determine if error should be logged as critical
 * @param {Error} error - The error to check
 * @returns {boolean} Whether error is critical
 */
const isCriticalError = (error) => {
  const criticalTypes = [
    ERROR_TYPES.DATABASE,
    ERROR_TYPES.SYSTEM,
    ERROR_TYPES.EXTERNAL_SERVICE
  ];
  
  const errorType = categorizeError(error);
  return criticalTypes.includes(errorType) || error.statusCode >= 500;
};

/**
 * Get safe error message for client
 * @param {Error} error - The error object
 * @param {boolean} isDevelopment - Whether in development mode
 * @returns {string} Safe error message
 */
const getSafeErrorMessage = (error, isDevelopment = false) => {
  if (isDevelopment) {
    return error.message;
  }
  
  const errorType = categorizeError(error);
  return SAFE_ERROR_MESSAGES[errorType] || SAFE_ERROR_MESSAGES[ERROR_TYPES.SYSTEM];
};

/**
 * Main error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  // Skip if response already sent
  if (res.headersSent) {
    return next(error);
  }
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorType = categorizeError(error);
  const statusCode = error.statusCode || ERROR_STATUS_CODES[errorType] || 500;
  const safeMessage = getSafeErrorMessage(error, isDevelopment);
  
  // Generate error ID for tracking
  const errorId = generateErrorId();
  
  // Prepare error context
  const errorContext = {
    error_id: errorId,
    type: errorType,
    status_code: statusCode,
    user_id: req.user?.id || null,
    user_type: req.user?.user_type || null,
    endpoint: `${req.method} ${req.path}`,
    ip: req.ip,
    user_agent: req.headers['user-agent'],
    request_id: req.id || null,
    timestamp: new Date().toISOString(),
    ...(error.context || {})
  };
  
  // Log error with appropriate level
  const logLevel = isCriticalError(error) ? 'error' : 'warn';
  logger[logLevel]('Request error occurred', {
    category: 'error',
    error_message: error.message,
    error_stack: isDevelopment ? error.stack : undefined,
    ...errorContext
  });
  
  // Send error response
  const errorResponse = {
    success: false,
    error: safeMessage,
    error_id: errorId,
    timestamp: new Date().toISOString()
  };
  
  // Add development info
  if (isDevelopment) {
    errorResponse.debug = {
      type: errorType,
      original_message: error.message,
      stack: error.stack,
      context: error.context
    };
  }
  
  // Add retry information for rate limits
  if (errorType === ERROR_TYPES.RATE_LIMIT && error.context?.retryAfter) {
    res.set('Retry-After', error.context.retryAfter);
    errorResponse.retry_after = error.context.retryAfter;
  }
  
  // Add field information for validation errors
  if (errorType === ERROR_TYPES.VALIDATION && error.context?.field) {
    errorResponse.field = error.context.field;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = createNotFoundError('Endpoint');
  error.context = {
    method: req.method,
    path: req.path,
    available_endpoints: [
      '/api/auth/*',
      '/api/portfolio/*',
      '/api/marketplace/*',
      '/api/favorites/*',
      '/api/analytics/*',
      '/api/featured/*'
    ]
  };
  next(error);
};

/**
 * Generate unique error ID for tracking
 * @returns {string} Error ID
 */
const generateErrorId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `err_${timestamp}_${random}`;
};

/**
 * Express error handling middleware for specific error types
 */
const handleSpecificErrors = (error, req, res, next) => {
  // Multer file upload errors
  if (error instanceof require('multer').MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(createFileUploadError('Archivo demasiado grande. Máximo 10MB permitido.'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(createFileUploadError('Demasiados archivos. Máximo 10 archivos permitidos.'));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(createFileUploadError('Campo de archivo inesperado.'));
    }
    return next(createFileUploadError('Error al subir archivo.'));
  }
  
  // Database constraint errors
  if (error.code === '23505') { // Unique constraint violation
    return next(createBusinessLogicError('Este elemento ya existe.', 'DUPLICATE_ENTRY'));
  }
  
  if (error.code === '23503') { // Foreign key constraint violation
    return next(createBusinessLogicError('Referencia inválida a recurso relacionado.', 'INVALID_REFERENCE'));
  }
  
  if (error.code === '23514') { // Check constraint violation
    return next(createValidationError('Los datos no cumplen con las reglas de validación.'));
  }
  
  // JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return next(createValidationError('Formato JSON inválido.'));
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return next(createAuthenticationError('Token de acceso inválido.'));
  }
  
  if (error.name === 'TokenExpiredError') {
    return next(createAuthenticationError('Token de acceso expirado.'));
  }
  
  // Continue to general error handler
  next(error);
};

/**
 * Error monitoring and alerting
 */
const monitorErrors = (error, errorContext) => {
  // Critical error alerting (would integrate with external services)
  if (isCriticalError(error)) {
    // In a real implementation, this would send alerts to:
    // - Slack/Discord webhooks
    // - Email notifications
    // - PagerDuty/OpsGenie
    // - Sentry error tracking
    
    logger.error('CRITICAL ERROR ALERT', {
      category: 'critical',
      alert: true,
      error_id: errorContext.error_id,
      error_type: errorContext.type,
      endpoint: errorContext.endpoint,
      user_id: errorContext.user_id,
      error_message: error.message
    });
  }
};

module.exports = {
  errorHandler,
  handleSpecificErrors,
  notFoundHandler,
  asyncHandler,
  
  // Error creators
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createRateLimitError,
  createDatabaseError,
  createFileUploadError,
  createBusinessLogicError,
  
  // Error utilities
  EnhancedError,
  ERROR_TYPES,
  categorizeError,
  isCriticalError,
  getSafeErrorMessage
};