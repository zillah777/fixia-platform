/**
 * TYPE VALIDATION MIDDLEWARE
 * Validates and transforms data types between frontend and backend
 * Ensures consistency with centralized type definitions
 */

const { 
  USER_TYPES,
  MESSAGE_TYPES, 
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SUBSCRIPTION_PLANS,
  VERIFICATION_STATUS,
  NOTIFICATION_TYPES,
  VALIDATION_RULES,
  transformUserToDatabase,
  transformUserToFrontend,
  transformBookingToDatabase,
  transformBookingToFrontend,
  transformServiceToDatabase,
  transformServiceToFrontend
} = require('../types/index');

/**
 * Validation error class
 */
class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Validate field against rules
 */
function validateField(fieldName, value, rules) {
  if (!rules) return null;
  
  // Required field check
  if (rules.required && (value === undefined || value === null || value === '')) {
    throw new ValidationError(`${fieldName} is required`, fieldName, value);
  }
  
  // Skip validation if field is not required and empty
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return null;
  }
  
  // Type validation
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new ValidationError(`${fieldName} must be a string`, fieldName, value);
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          throw new ValidationError(`${fieldName} must be a number`, fieldName, value);
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new ValidationError(`${fieldName} must be a valid email`, fieldName, value);
        }
        break;
      case 'date':
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          throw new ValidationError(`${fieldName} must be in YYYY-MM-DD format`, fieldName, value);
        }
        break;
      case 'time':
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(value)) {
          throw new ValidationError(`${fieldName} must be in HH:MM format`, fieldName, value);
        }
        break;
    }
  }
  
  // String length validation
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      throw new ValidationError(`${fieldName} must be at least ${rules.minLength} characters`, fieldName, value);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      throw new ValidationError(`${fieldName} must be at most ${rules.maxLength} characters`, fieldName, value);
    }
  }
  
  // Number range validation
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      throw new ValidationError(`${fieldName} must be at least ${rules.min}`, fieldName, value);
    }
    if (rules.max !== undefined && value > rules.max) {
      throw new ValidationError(`${fieldName} must be at most ${rules.max}`, fieldName, value);
    }
  }
  
  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${rules.enum.join(', ')}`, fieldName, value);
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    throw new ValidationError(`${fieldName} format is invalid`, fieldName, value);
  }
  
  return null;
}

/**
 * Validate object against schema
 */
function validateObject(data, schema) {
  const errors = [];
  
  for (const [fieldName, rules] of Object.entries(schema)) {
    try {
      validateField(fieldName, data[fieldName], rules);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({
          field: error.field,
          message: error.message,
          value: error.value
        });
      } else {
        errors.push({
          field: fieldName,
          message: 'Validation error occurred',
          value: data[fieldName]
        });
      }
    }
  }
  
  return errors;
}

/**
 * Middleware to validate and transform user data
 */
const validateUserData = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      // Check if this is a registration request (has user_type or name fields)
      // Login requests only have email + password, so they should skip user validation
      const isRegistrationData = req.body.user_type || req.body.first_name || req.body.last_name;
      
      if (isRegistrationData) {
        const errors = validateObject(req.body, VALIDATION_RULES.user);
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        // Transform user type to database format if present
        if (req.body.user_type) {
          req.body = transformUserToDatabase(req.body);
        }
      }
      // Login requests (email + password only) skip this validation
    }
    
    next();
  } catch (error) {
    console.error('User validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid user data format'
    });
  }
};

/**
 * Middleware to validate and transform service data
 */
const validateServiceData = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      // Validate service data
      if (req.body.title || req.body.description || req.body.price) {
        const errors = validateObject(req.body, VALIDATION_RULES.service);
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        // Transform service data for database
        req.body = transformServiceToDatabase(req.body);
      }
    }
    
    next();
  } catch (error) {
    console.error('Service validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid service data format'
    });
  }
};

/**
 * Middleware to validate and transform booking data
 */
const validateBookingData = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      // Validate booking data
      if (req.body.provider_id || req.body.service_id || req.body.booking_date) {
        const errors = validateObject(req.body, VALIDATION_RULES.booking);
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        // Transform booking data for database
        req.body = transformBookingToDatabase(req.body);
      }
    }
    
    next();
  } catch (error) {
    console.error('Booking validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid booking data format'
    });
  }
};

/**
 * Middleware to validate and transform message data
 */
const validateMessageData = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      // Validate message data
      if (req.body.chat_id || req.body.content) {
        const errors = validateObject(req.body, VALIDATION_RULES.message);
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
        
        // Validate message type
        if (req.body.message_type && !Object.values(MESSAGE_TYPES).includes(req.body.message_type)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid message type',
            details: [`message_type must be one of: ${Object.values(MESSAGE_TYPES).join(', ')}`]
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Message validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid message data format'
    });
  }
};

/**
 * Middleware to validate and transform review data
 */
const validateReviewData = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      // Validate review data
      if (req.body.booking_id || req.body.rating) {
        const errors = validateObject(req.body, VALIDATION_RULES.review);
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Review validation error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid review data format'
    });
  }
};

/**
 * Middleware to transform response data to frontend format
 */
const transformResponseData = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to transform data
  res.json = function(data) {
    try {
      if (data && typeof data === 'object') {
        // Transform single user
        if (data.data && data.data.user_type) {
          data.data = transformUserToFrontend(data.data);
        }
        
        // Transform user in nested structure
        if (data.data && data.data.user && data.data.user.user_type) {
          data.data.user = transformUserToFrontend(data.data.user);
        }
        
        // Transform array of users
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.map(item => {
            if (item.user_type) {
              return transformUserToFrontend(item);
            }
            return item;
          });
        }
        
        // Transform bookings
        if (data.data && (data.data.client_id || data.data.booking_date)) {
          data.data = transformBookingToFrontend(data.data);
        }
        
        // Transform services
        if (data.data && data.data.user_id && data.data.title) {
          data.data = transformServiceToFrontend(data.data);
        }
      }
    } catch (error) {
      console.error('Response transformation error:', error);
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Validate user type values
 */
const validateUserType = (userType) => {
  const validFrontendTypes = Object.values(USER_TYPES.FRONTEND);
  const validDatabaseTypes = Object.values(USER_TYPES.DATABASE);
  
  return validFrontendTypes.includes(userType) || validDatabaseTypes.includes(userType);
};

/**
 * Validate booking status values
 */
const validateBookingStatus = (status) => {
  return Object.values(BOOKING_STATUS).includes(status);
};

/**
 * Validate payment status values
 */
const validatePaymentStatus = (status) => {
  return Object.values(PAYMENT_STATUS).includes(status);
};

/**
 * Validate message type values
 */
const validateMessageType = (messageType) => {
  return Object.values(MESSAGE_TYPES).includes(messageType);
};

module.exports = {
  validateUserData,
  validateServiceData,
  validateBookingData,
  validateMessageData,
  validateReviewData,
  transformResponseData,
  validateUserType,
  validateBookingStatus,
  validatePaymentStatus,
  validateMessageType,
  validateField,
  validateObject,
  ValidationError
};