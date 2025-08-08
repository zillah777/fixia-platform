// Database-aligned validation utilities with enterprise security
// These validators match the exact constraints from PostgreSQL with XSS/injection prevention
import { 
  SecureValidationRule, 
  SecureValidationResult, 
  sanitizeHtml, 
  sanitizeSqlInput,
  sanitizeTextInput 
} from '@/types/security';

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
  readonly severity: 'error' | 'warning';
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly sanitizedData?: Record<string, unknown>;
}

/**
 * Validates a field against database constraints with security checks
 */
export function validateField(
  fieldName: string, 
  value: unknown, 
  rules: SecureValidationRule
): ValidationError | null {
  
  // Check required
  if (rules.required && (value === undefined || value === null || value === '')) {
    return {
      field: fieldName,
      message: `${sanitizeTextInput(fieldName)} es requerido`,
      code: 'REQUIRED',
      severity: 'error'
    };
  }

  // If value is empty and not required, it's valid
  if (!value && !rules.required) {
    return null;
  }

  // Check string length constraints with security validation
  if (typeof value === 'string') {
    // Security check: Detect potential injection attempts
    if (value.includes('<script') || value.includes('javascript:') || value.includes('on')) {
      return {
        field: fieldName,
        message: `${sanitizeTextInput(fieldName)} contiene caracteres no válidos`,
        code: 'SECURITY_VIOLATION',
        severity: 'error'
      };
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      return {
        field: fieldName,
        message: `${sanitizeTextInput(fieldName)} debe tener al menos ${rules.minLength} caracteres`,
        code: 'MIN_LENGTH',
        severity: 'error'
      };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        field: fieldName,
        message: `${sanitizeTextInput(fieldName)} no puede exceder ${rules.maxLength} caracteres`,
        code: 'MAX_LENGTH',
        severity: 'error'
      };
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        field: fieldName,
        message: getPatternErrorMessage(fieldName, rules.pattern),
        code: 'INVALID_FORMAT',
        severity: 'error'
      };
    }
  }

  // Check numeric constraints with bounds checking
  if (typeof value === 'number') {
    // Security check: Prevent extremely large numbers (potential DoS)
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      return {
        field: fieldName,
        message: `${sanitizeTextInput(fieldName)} está fuera del rango permitido`,
        code: 'VALUE_OUT_OF_BOUNDS',
        severity: 'error'
      };
    }
    
    if (rules.min !== undefined && value < rules.min) {
      return {
        field: fieldName,
        message: `${sanitizeTextInput(fieldName)} debe ser mayor o igual a ${rules.min}`,
        code: 'MIN_VALUE',
        severity: 'error'
      };
    }

    if (rules.max !== undefined && value > rules.max) {
      return {
        field: fieldName,
        message: `${sanitizeTextInput(fieldName)} debe ser menor o igual a ${rules.max}`,
        code: 'MAX_VALUE',
        severity: 'error'
      };
    }
  }

  // Allowed values check (enum validation)
  if (rules.allowedValues && Array.isArray(rules.allowedValues)) {
    if (!rules.allowedValues.includes(value as string)) {
      return {
        field: fieldName,
        message: `${sanitizeTextInput(fieldName)} debe ser uno de los valores permitidos`,
        code: 'INVALID_ENUM_VALUE',
        severity: 'error'
      };
    }
  }

  return null;
}

/**
 * Validates an entire object against database rules with data sanitization
 */
export function validateObject(
  data: Record<string, unknown>, 
  ruleset: Record<string, SecureValidationRule>
): ValidationResult {
  const errors: ValidationError[] = [];
  const sanitizedData: Record<string, unknown> = {};

  // Validate each field
  for (const [fieldName, rules] of Object.entries(ruleset)) {
    const value = data[fieldName];
    const error = validateField(fieldName, value, rules);
    
    if (error) {
      errors.push(error);
    }
    
    // Sanitize the value regardless of validation result
    if (typeof value === 'string' && value.length > 0) {
      let sanitizedValue = value;
      
      if (rules.sanitize !== false) {
        sanitizedValue = sanitizeTextInput(value);
      }
      
      if (rules.stripHtml) {
        sanitizedValue = sanitizeHtml(sanitizedValue);
      }
      
      sanitizedData[fieldName] = sanitizedValue;
    } else {
      sanitizedData[fieldName] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
    sanitizedData: Object.freeze(sanitizedData)
  };
}

/**
 * Validates user registration data with security constraints
 */
export function validateUserRegistration(userData: Record<string, unknown>): ValidationResult {
  const userRules: Record<string, SecureValidationRule> = {
    first_name: { 
      required: true, 
      maxLength: 100, 
      minLength: 2,
      sanitize: true,
      stripHtml: true 
    },
    last_name: { 
      required: true, 
      maxLength: 100, 
      minLength: 2,
      sanitize: true,
      stripHtml: true 
    },
    email: { 
      required: true, 
      maxLength: 255, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      sanitize: true 
    },
    password: { 
      required: true, 
      minLength: 8, 
      maxLength: 128 
    },
    user_type: {
      required: true,
      allowedValues: ['customer', 'provider']
    }
  };
  return validateObject(userData, userRules);
}

/**
 * Validates service creation data with security constraints
 */
export function validateServiceCreation(serviceData: Record<string, unknown>): ValidationResult {
  const serviceRules: Record<string, SecureValidationRule> = {
    title: { 
      required: true, 
      maxLength: 200, 
      minLength: 5,
      sanitize: true,
      stripHtml: true 
    },
    description: { 
      required: true, 
      maxLength: 2000, 
      minLength: 20,
      sanitize: true,
      stripHtml: true 
    },
    price: { 
      required: false, 
      min: 0, 
      max: 999999.99 
    },
    category_id: { 
      required: false 
    },
    location: {
      maxLength: 200,
      sanitize: true,
      stripHtml: true
    }
  };
  return validateObject(serviceData, serviceRules);
}

/**
 * Validates booking creation data with security constraints
 */
export function validateBookingCreation(bookingData: Record<string, unknown>): ValidationResult {
  const bookingRules: Record<string, SecureValidationRule> = {
    service_id: { 
      required: true 
    },
    provider_id: {
      required: true
    },
    booking_date: {
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/
    },
    booking_time: {
      required: true,
      pattern: /^\d{2}:\d{2}$/
    },
    notes: { 
      maxLength: 1000,
      sanitize: true,
      stripHtml: true 
    }
  };
  return validateObject(bookingData, bookingRules);
}

/**
 * Validates review creation data with security constraints
 */
export function validateReviewCreation(reviewData: Record<string, unknown>): ValidationResult {
  const reviewRules: Record<string, SecureValidationRule> = {
    booking_id: {
      required: true
    },
    reviewed_id: {
      required: true
    },
    rating: { 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      maxLength: 1000,
      sanitize: true,
      stripHtml: true 
    }
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
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }
  const isoString = d.toISOString();
  const datePart = isoString.split('T')[0];
  if (!datePart) {
    throw new Error('Failed to format date');
  }
  return datePart;
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
    return errors[0]?.message || 'Error de validación desconocido';
  }
  
  return `Se encontraron ${errors.length} errores:\n` + 
         errors.map(e => `• ${e.message}`).join('\n');
}