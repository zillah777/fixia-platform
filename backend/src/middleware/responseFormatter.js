/**
 * Response Formatter Middleware
 * Estandariza el formato de todas las respuestas API
 * Enterprise-grade response formatting para Fixia.com.ar
 */

const { logger } = require('../utils/smartLogger');

// Definir códigos de estado HTTP estándar
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Estructura estándar de respuesta exitosa
const createSuccessResponse = (data, message = null, metadata = {}) => {
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    ...((message && { message }) || {}),
    ...(data !== undefined && { data }),
    ...metadata
  };

  // Si data es un objeto con properties especiales, los mantenemos en el nivel raíz para compatibilidad
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.pagination) {
      response.pagination = data.pagination;
      if (data.services || data.bookings || data.reviews) {
        response.data = data.services || data.bookings || data.reviews || data.data;
      }
    }
  }

  return response;
};

// Estructura estándar de respuesta de error
const createErrorResponse = (error, statusCode, details = null, metadata = {}) => {
  const response = {
    success: false,
    error: typeof error === 'string' ? error : error.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    statusCode,
    ...((details && { details }) || {}),
    ...metadata
  };

  // Log del error para debugging
  if (statusCode >= 500) {
    logger.error('Server Error Response', {
      error: response.error,
      statusCode,
      details,
      metadata
    });
  }

  return response;
};

// Mapear errores de base de datos a códigos HTTP apropiados
const mapDatabaseError = (error) => {
  const errorMappings = {
    '23505': { status: HTTP_STATUS.CONFLICT, message: 'El recurso ya existe' },
    '23503': { status: HTTP_STATUS.BAD_REQUEST, message: 'Referencia inválida' },
    '23514': { status: HTTP_STATUS.BAD_REQUEST, message: 'Datos no válidos' },
    '23502': { status: HTTP_STATUS.BAD_REQUEST, message: 'Faltan campos requeridos' },
    '42P01': { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Error de configuración de la base de datos' }
  };

  if (error.code && errorMappings[error.code]) {
    return errorMappings[error.code];
  }

  if (error.message && error.message.includes('connect')) {
    return { status: HTTP_STATUS.SERVICE_UNAVAILABLE, message: 'Servicio temporalmente no disponible' };
  }

  return { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Error interno del servidor' };
};

// Middleware principal para formatear respuestas
const responseFormatter = (req, res, next) => {
  // Método para respuestas exitosas
  res.success = (data, message, statusCode = HTTP_STATUS.OK, metadata = {}) => {
    const response = createSuccessResponse(data, message, metadata);
    return res.status(statusCode).json(response);
  };

  // Método para respuestas de error
  res.error = (error, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null, metadata = {}) => {
    const response = createErrorResponse(error, statusCode, details, metadata);
    return res.status(statusCode).json(response);
  };

  // Método para respuestas con paginación
  res.paginated = (data, pagination, message, statusCode = HTTP_STATUS.OK, metadata = {}) => {
    const response = createSuccessResponse(data, message, { 
      pagination,
      ...metadata 
    });
    return res.status(statusCode).json(response);
  };

  // Método para manejo de errores de base de datos
  res.dbError = (error, customMessage = null) => {
    const mappedError = mapDatabaseError(error);
    const errorMessage = customMessage || mappedError.message;
    
    return res.error(errorMessage, mappedError.status, {
      error_type: 'database_error',
      error_code: error.code || 'unknown'
    });
  };

  // Método para respuestas de validación
  res.validation = (errors, message = 'Errores de validación') => {
    return res.error(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, {
      validation_errors: errors,
      error_type: 'validation_error'
    });
  };

  // Método para respuestas de autorización
  res.unauthorized = (message = 'No autorizado') => {
    return res.error(message, HTTP_STATUS.UNAUTHORIZED, {
      error_type: 'authorization_error'
    });
  };

  // Método para respuestas de recurso no encontrado
  res.notFound = (message = 'Recurso no encontrado') => {
    return res.error(message, HTTP_STATUS.NOT_FOUND, {
      error_type: 'not_found_error'
    });
  };

  // Método para respuestas de rate limiting
  res.rateLimited = (message = 'Demasiadas solicitudes') => {
    return res.error(message, HTTP_STATUS.TOO_MANY_REQUESTS, {
      error_type: 'rate_limit_error'
    });
  };

  next();
};

// Middleware de manejo global de errores
const globalErrorHandler = (err, req, res, next) => {
  // Si ya se envió la respuesta, delegate al error handler por defecto
  if (res.headersSent) {
    return next(err);
  }

  // Log del error
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id
  });

  // Verificar si es error de base de datos
  if (err.code && err.code.match(/^[0-9]{5}$/)) {
    return res.dbError(err);
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.validation(err.errors || err.message);
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.unauthorized('Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return res.unauthorized('Token expirado');
  }

  // Error genérico
  return res.error(
    process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV !== 'production' ? {
      stack: err.stack,
      name: err.name
    } : null
  );
};

module.exports = {
  responseFormatter,
  globalErrorHandler,
  HTTP_STATUS,
  createSuccessResponse,
  createErrorResponse,
  mapDatabaseError
};