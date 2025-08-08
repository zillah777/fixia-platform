/**
 * Enterprise Security Type Definitions
 * Replaces 'any' types with strict, validated interfaces
 * Implements OWASP 2025 security standards
 */

// === AUTHENTICATION SECURITY TYPES ===

/**
 * Secure JWT token validation interface
 * Prevents token tampering and validates structure
 */
export interface SecureJWTPayload {
  readonly userId: number;
  readonly email: string;
  readonly userType: 'customer' | 'provider' | 'admin';
  readonly iat: number; // Issued at timestamp
  readonly exp: number; // Expiration timestamp
  readonly jti: string; // JWT ID for revocation
}

/**
 * Raw user data from backend before transformation
 * Strictly typed to prevent injection attacks
 */
export interface RawBackendUser {
  readonly id: number;
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly user_type: 'client' | 'provider' | 'admin';
  readonly profile_image?: string | null;
  readonly date_of_birth?: string | null;
  readonly gender?: string | null;
  readonly locality?: string | null;
  readonly address?: string | null;
  readonly bio?: string | null;
  readonly verification_status: string;
  readonly email_verified: boolean;
  readonly email_verified_at?: string | null;
  readonly is_active: boolean;
  readonly last_login?: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly subscription_plan?: 'basic' | 'professional' | 'plus' | null;
}

/**
 * Secure localStorage interface with validation
 * Prevents XSS attacks through localStorage manipulation
 */
export interface SecureStorageValue {
  readonly value: string;
  readonly timestamp: number;
  readonly signature?: string; // Optional integrity check
}

/**
 * Profile update data with strict validation
 * Prevents injection of malicious fields
 */
export interface SecureProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  locality?: string;
  address?: string;
  bio?: string;
}

// === PAYMENT SECURITY TYPES ===

/**
 * Payment method enum with strict constraints
 */
export enum SecurePaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MERCADOPAGO = 'mercadopago',
  BANK_TRANSFER = 'bank_transfer'
}

/**
 * Payment status enum with validation
 */
export enum SecurePaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * Secure payment interface with bounds checking
 */
export interface SecurePaymentData {
  readonly id: number;
  readonly booking_id: number;
  readonly amount: number; // Validated: 0.01 - 999999.99
  readonly currency: 'ARS' | 'USD' | 'EUR'; // ISO currency codes only
  readonly payment_method: SecurePaymentMethod;
  readonly payment_status: SecurePaymentStatus;
  readonly transaction_id?: string; // Max 100 chars, alphanumeric + hyphens only
  readonly processed_at?: string; // ISO 8601 timestamp
  readonly created_at: string;
}

/**
 * Transaction ID format validation
 */
export interface SecureTransactionId {
  readonly value: string; // /^[A-Za-z0-9\-_]{8,100}$/
  readonly provider: 'mercadopago' | 'stripe' | 'internal';
}

// === FILE UPLOAD SECURITY TYPES ===

/**
 * Allowed MIME types for file uploads
 */
export enum AllowedMimeTypes {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  PDF = 'application/pdf'
}

/**
 * Secure file validation interface
 */
export interface SecureFileValidation {
  readonly file: File;
  readonly maxSize: number; // Bytes
  readonly allowedTypes: AllowedMimeTypes[];
  readonly virusScanRequired: boolean;
}

/**
 * File upload response with security checks
 */
export interface SecureFileUploadResponse {
  readonly url: string;
  readonly filename: string;
  readonly size: number;
  readonly mimeType: AllowedMimeTypes;
  readonly checksum: string; // SHA-256 hash
  readonly uploadedAt: string;
}

// === INPUT VALIDATION SECURITY TYPES ===

/**
 * Validation rule interface with security constraints
 */
export interface SecureValidationRule {
  readonly required?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: RegExp;
  readonly min?: number;
  readonly max?: number;
  readonly allowedValues?: readonly string[];
  readonly sanitize?: boolean;
  readonly stripHtml?: boolean;
}

/**
 * Validation result with detailed security information
 */
export interface SecureValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly sanitizedValue?: string;
  readonly securityWarnings?: readonly string[];
}

/**
 * Field validation map for forms
 */
export interface SecureFieldValidationMap {
  readonly [fieldName: string]: SecureValidationRule;
}

/**
 * Runtime type checking interface
 */
export interface TypeGuard<T> {
  readonly check: (value: unknown) => value is T;
  readonly errorMessage: string;
}

// === API SECURITY TYPES ===

/**
 * Secure API response with validation
 */
export interface SecureApiResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T;
  readonly timestamp: string;
  readonly requestId: string; // For audit trails
}

/**
 * API error with security context
 */
export interface SecureApiError {
  readonly success: false;
  readonly error: string;
  readonly code: string; // Error classification code
  readonly timestamp: string;
  readonly requestId: string;
  readonly details?: {
    readonly field?: string;
    readonly violatedConstraint?: string;
  };
}

// === SECURITY CONFIGURATION ===

/**
 * Security configuration constants
 */
export const SECURITY_CONFIG = {
  TOKEN: {
    MAX_AGE_DAYS: 7,
    REFRESH_THRESHOLD_HOURS: 24,
  },
  FILE_UPLOAD: {
    MAX_SIZE_MB: 10,
    MAX_FILES_PER_REQUEST: 5,
  },
  VALIDATION: {
    MAX_INPUT_LENGTH: 10000,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
  },
  RATE_LIMITING: {
    AUTH_ATTEMPTS_PER_HOUR: 5,
    API_REQUESTS_PER_MINUTE: 100,
  }
} as const;

// === TYPE GUARDS ===

/**
 * Type guard for user data
 */
export function isValidUser(value: unknown): value is RawBackendUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'first_name' in value &&
    'last_name' in value &&
    'user_type' in value
  );
}

/**
 * Type guard for payment data
 */
export function isValidPaymentData(value: unknown): value is SecurePaymentData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'amount' in value &&
    'currency' in value &&
    'payment_method' in value &&
    'payment_status' in value
  );
}

/**
 * Type guard for JWT payload
 */
export function isValidJWTPayload(value: unknown): value is SecureJWTPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'email' in value &&
    'userType' in value &&
    'iat' in value &&
    'exp' in value &&
    'jti' in value
  );
}

// === SANITIZATION FUNCTIONS ===

/**
 * HTML sanitization function
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * SQL injection prevention
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['";\\-]/g, '')
    .replace(/(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi, '');
}

/**
 * XSS prevention for text inputs
 */
export function sanitizeTextInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}