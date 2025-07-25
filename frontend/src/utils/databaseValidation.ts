// Database-aligned validation utilities
// These validators match the exact constraints from PostgreSQL

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a field against database constraints
 */
export function validateField(
  fieldName: string, 
  value: any, 
  rules: any
): ValidationError | null {
  
  // Check required
  if (rules.required && (value === undefined || value === null || value === '')) {
    return {
      field: fieldName,
      message: `${fieldName} es requerido`,
      code: 'REQUIRED'
    };
  }

  // If value is empty and not required, it's valid
  if (!value && !rules.required) {
    return null;
  }

  // Check string length constraints
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return {
        field: fieldName,
        message: `${fieldName} debe tener al menos ${rules.minLength} caracteres`,
        code: 'MIN_LENGTH'
      };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        field: fieldName,
        message: `${fieldName} no puede exceder ${rules.maxLength} caracteres`,
        code: 'MAX_LENGTH'
      };
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        field: fieldName,
        message: getPatternErrorMessage(fieldName, rules.pattern),
        code: 'INVALID_FORMAT'
      };
    }
  }

  // Check numeric constraints
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return {
        field: fieldName,
        message: `${fieldName} debe ser mayor o igual a ${rules.min}`,
        code: 'MIN_VALUE'
      };
    }

    if (rules.max !== undefined && value > rules.max) {
      return {
        field: fieldName,
        message: `${fieldName} debe ser menor o igual a ${rules.max}`,
        code: 'MAX_VALUE'
      };
    }
  }

  // Custom validation
  if (rules.custom && typeof rules.custom === 'function') {
    const customError = rules.custom(value);
    if (customError) {
      return {
        field: fieldName,
        message: customError,
        code: 'CUSTOM_VALIDATION'
      };
    }
  }

  return null;
}

/**
 * Validates an entire object against database rules
 */
export function validateObject(
  data: Record<string, any>, 
  ruleset: Record<string, any>
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [fieldName, rules] of Object.entries(ruleset)) {
    const value = data[fieldName];
    const error = validateField(fieldName, value, rules);
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates user registration data
 */
export function validateUserRegistration(userData: any): ValidationResult {
  const userRules = {
    first_name: { required: true, maxLength: 50 },
    last_name: { required: true, maxLength: 50 },
    email: { required: true, maxLength: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, minLength: 6 }
  };
  return validateObject(userData, userRules);
}

/**
 * Validates service creation data
 */
export function validateServiceCreation(serviceData: any): ValidationResult {
  const serviceRules = {
    title: { required: true, maxLength: 200 },
    description: { required: true, maxLength: 2000 },
    price: { required: true, min: 0 },
    category_id: { required: true }
  };
  return validateObject(serviceData, serviceRules);
}

/**
 * Validates booking creation data
 */
export function validateBookingCreation(bookingData: any): ValidationResult {
  const bookingRules = {
    service_id: { required: true },
    message: { maxLength: 1000 }
  };
  return validateObject(bookingData, bookingRules);
}

/**
 * Validates review creation data
 */
export function validateReviewCreation(reviewData: any): ValidationResult {
  const reviewRules = {
    rating: { required: true, min: 1, max: 5 },
    comment: { maxLength: 1000 }
  };
  return validateObject(reviewData, reviewRules);
}

/**
 * Get user-friendly error messages for common patterns
 */
function getPatternErrorMessage(fieldName: string, pattern: RegExp): string {
  const patternString = pattern.toString();
  
  if (patternString.includes('@')) {
    return `${fieldName} debe ser una dirección de email válida`;
  }
  
  if (patternString.includes('\\d{4}-\\d{2}-\\d{2}')) {
    return `${fieldName} debe tener formato YYYY-MM-DD`;
  }
  
  if (patternString.includes('\\d{2}:\\d{2}')) {
    return `${fieldName} debe tener formato HH:MM`;
  }
  
  if (patternString.includes('\\+?[1-9]\\d{1,14}')) {
    return `${fieldName} debe ser un número de teléfono válido`;
  }
  
  return `${fieldName} tiene un formato inválido`;
}

/**
 * Validates that user_type matches allowed database values
 */
export function validateUserType(userType: string): boolean {
  return ['customer', 'provider', 'admin'].includes(userType);
}

/**
 * Validates that currency matches database constraint
 */
export function validateCurrency(currency: string): boolean {
  return ['ARS', 'USD', 'EUR'].includes(currency);
}

/**
 * Validates that subscription plan matches database constraint
 */
export function validateSubscriptionPlan(plan: string): boolean {
  return ['free', 'basic', 'premium'].includes(plan);
}

/**
 * Validates rating value (1-5 range as per database constraint)
 */
export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Sanitizes string input for database storage
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Formats date for database storage (YYYY-MM-DD)
 */
export function formatDateForDatabase(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Formats time for database storage (HH:MM)
 */
export function formatTimeForDatabase(time: Date | string): string {
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  
  const d = new Date(time);
  return d.toTimeString().substring(0, 5);
}

/**
 * Creates a comprehensive validation error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Se encontraron ${errors.length} errores:\n` + 
         errors.map(e => `• ${e.message}`).join('\n');
}