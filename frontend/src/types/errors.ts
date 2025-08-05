/**
 * Comprehensive Error Types for Fixia Platform
 * Context-aware error handling for AS (Professionals) and Exploradores (Clients)
 */

import { User } from './common';

// Core error classification
export type ErrorCategory = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'payment'
  | 'file_upload'
  | 'chat'
  | 'booking'
  | 'server'
  | 'client'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type UserContext = 'as' | 'explorador' | 'guest' | 'admin';

export type PlatformArea = 
  | 'dashboard'
  | 'services'
  | 'portfolio'
  | 'booking'
  | 'chat'
  | 'payments'
  | 'profile'
  | 'authentication'
  | 'search'
  | 'marketplace'
  | 'reviews'
  | 'configuration'
  | 'verification';

// Recovery strategy types
export type RecoveryStrategy = 
  | 'retry'
  | 'reload'
  | 'redirect'
  | 'fallback'
  | 'manual'
  | 'auto_fix'
  | 'contact_support'
  | 'offline_mode';

// Base error interface with context
export interface FixiaError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string; // Spanish message for users
  technicalDetails?: string;
  
  // Context information
  userContext: UserContext;
  platformArea: PlatformArea;
  userId?: number;
  sessionId?: string;
  timestamp: string;
  
  // Error specifics
  originalError?: Error;
  httpStatus?: number;
  apiEndpoint?: string;
  userAgent?: string;
  
  // Recovery information
  recoveryStrategy: RecoveryStrategy[];
  retryCount?: number;
  maxRetries?: number;
  canAutoRecover: boolean;
  
  // Support integration
  supportTicketId?: string;
  escalationLevel: number; // 0-3 (0=auto, 1=self-service, 2=chat, 3=phone)
  
  // Analytics
  errorGroup?: string;
  fingerprint?: string;
  metadata?: Record<string, any>;
}

// Specific error types for different scenarios

// Network and Connectivity Errors
export interface NetworkError extends FixiaError {
  category: 'network';
  connectionType?: 'wifi' | 'cellular' | 'unknown';
  isOffline: boolean;
  lastSuccessfulRequest?: string;
  estimatedRecoveryTime?: number; // seconds
}

// Authentication and Session Errors
export interface AuthenticationError extends FixiaError {
  category: 'authentication';
  authType: 'login' | 'session' | 'token' | 'verification';
  sessionExpired: boolean;
  canAutoRenew: boolean;
  requiresUserAction: boolean;
  redirectUrl?: string;
}

// Authorization and Permissions
export interface AuthorizationError extends FixiaError {
  category: 'authorization';
  requiredPermission: string;
  userPermissions?: string[];
  resourceId?: string;
  resourceType?: string;
  canRequestAccess: boolean;
}

// Form Validation Errors
export interface ValidationError extends FixiaError {
  category: 'validation';
  fieldErrors: Array<{
    field: string;
    value: any;
    rule: string;
    message: string;
  }>;
  formId?: string;
  canAutoCorrect: boolean;
  suggestedValues?: Record<string, any>;
}

// Payment Processing Errors
export interface PaymentError extends FixiaError {
  category: 'payment';
  paymentMethod: 'mercadopago' | 'credit_card' | 'bank_transfer' | 'wallet';
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  currency: 'ARS';
  declineReason?: string;
  alternativeMethods: string[];
  canRetryPayment: boolean;
  mercadopagoErrorCode?: string;
}

// File Upload Errors
export interface FileUploadError extends FixiaError {
  category: 'file_upload';
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadType: 'profile_photo' | 'portfolio_image' | 'document' | 'chat_attachment';
  failureReason: 'size_limit' | 'type_not_allowed' | 'corrupted' | 'network' | 'server';
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadProgress?: number;
}

// Chat and Communication Errors
export interface ChatError extends FixiaError {
  category: 'chat';
  chatRoomId?: number;
  messageId?: string;
  chatType: 'real_time' | 'message_history' | 'file_share' | 'typing_indicator';
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  canResendMessage: boolean;
  messageContent?: string;
}

// Booking and Service Errors
export interface BookingError extends FixiaError {
  category: 'booking';
  bookingId?: number;
  serviceId?: number;
  requestId?: number;
  bookingStage: 'creation' | 'confirmation' | 'payment' | 'scheduling' | 'completion';
  conflictReason?: 'time_conflict' | 'service_unavailable' | 'payment_failed' | 'provider_cancelled';
  suggestedAlternatives?: Array<{
    type: 'time' | 'service' | 'provider';
    value: any;
    message: string;
  }>;
}

// Context-specific error details for different user types
export interface ASContextError {
  userType: 'as';
  serviceCount?: number;
  portfolioItems?: number;
  activeBookings?: number;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  subscriptionLevel?: 'free' | 'premium';
  
  // AS-specific recovery suggestions
  relatedServices?: Array<{
    id: number;
    title: string;
    status: string;
  }>;
  
  portfolioBackup?: boolean;
  canSwitchToExplorador?: boolean;
}

export interface ExploradorContextError {
  userType: 'explorador';
  activeRequests?: number;
  favoriteProviders?: number;
  bookingHistory?: number;
  
  // Explorador-specific recovery suggestions
  savedSearches?: Array<{
    query: string;
    category: string;
    location: string;
  }>;
  
  recommendedProviders?: Array<{
    id: number;
    name: string;
    category: string;
    rating: number;
  }>;
  
  canSwitchToAS?: boolean;
}

// Error analytics and tracking
export interface ErrorAnalytics {
  errorId: string;
  sessionDuration: number;
  userActions: Array<{
    action: string;
    timestamp: string;
    success: boolean;
  }>;
  
  // Platform metrics
  platformHealth: {
    apiResponseTime: number;
    errorRate: number;
    activeUsers: number;
  };
  
  // Regional context (Chubut-specific)
  location?: {
    city: string;
    province: 'Chubut';
    timezone: 'America/Argentina/Buenos_Aires';
  };
  
  // Device and browser context
  device: {
    type: 'desktop' | 'tablet' | 'mobile';
    os: string;
    browser: string;
    screenSize: string;
    touchEnabled: boolean;
  };
}

// Recovery action definitions
export interface RecoveryAction {
  id: string;
  type: RecoveryStrategy;
  label: string;
  description: string;
  icon: string;
  
  // Action configuration
  isAutomatic: boolean;
  requiresConfirmation: boolean;
  estimatedDuration?: number; // seconds
  
  // Execution details
  handler: () => Promise<boolean>;
  fallbackAction?: RecoveryAction;
  
  // UI configuration
  buttonVariant: 'primary' | 'secondary' | 'outline' | 'destructive';
  showProgress: boolean;
  
  // Analytics
  successRate?: number;
  averageResolutionTime?: number;
}

// Support escalation configuration
export interface SupportEscalation {
  level: number;
  trigger: 'manual' | 'auto_retry_failed' | 'severity_high' | 'user_frustrated';
  
  channels: Array<{
    type: 'whatsapp' | 'phone' | 'email' | 'chat' | 'faq';
    priority: number;
    availability: {
      hours: string;
      timezone: string;
      languages: string[];
    };
    
    contact: {
      whatsapp?: string;
      phone?: string;
      email?: string;
      chatUrl?: string;
      faqSection?: string;
    };
  }>;
  
  autoTicketCreation: boolean;
  includeErrorContext: boolean;
  expectedResponseTime: string;
}

// Error recovery configuration for different contexts
export interface ErrorRecoveryConfig {
  userContext: UserContext;
  platformArea: PlatformArea;
  
  // Retry configuration
  retryPolicy: {
    maxRetries: number;
    baseDelay: number; // milliseconds
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
  };
  
  // Fallback options
  fallbackStrategies: RecoveryStrategy[];
  gracefulDegradation: boolean;
  offlineFallback: boolean;
  
  // User experience
  showTechnicalDetails: boolean;
  allowUserReporting: boolean;
  provideAlternatives: boolean;
  
  // Integration
  sentryReporting: boolean;
  analyticsTracking: boolean;
  supportIntegration: SupportEscalation;
}

// Predefined error configurations for common scenarios
export const ERROR_CONFIGS: Record<string, Partial<ErrorRecoveryConfig>> = {
  // AS Professional contexts
  'as_service_creation': {
    userContext: 'as',
    platformArea: 'services',
    retryPolicy: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000,
      backoffMultiplier: 2,
      jitter: true,
    },
    fallbackStrategies: ['retry', 'fallback', 'contact_support'],
    gracefulDegradation: true,
  },
  
  'as_portfolio_upload': {
    userContext: 'as',
    platformArea: 'portfolio',
    retryPolicy: {
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 16000,
      backoffMultiplier: 2,
      jitter: true,
    },
    fallbackStrategies: ['retry', 'manual', 'contact_support'],
    gracefulDegradation: false,
  },
  
  // Explorador contexts
  'explorador_search': {
    userContext: 'explorador',
    platformArea: 'search',
    retryPolicy: {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 2000,
      backoffMultiplier: 2,
      jitter: false,
    },
    fallbackStrategies: ['retry', 'fallback', 'offline_mode'],
    gracefulDegradation: true,
  },
  
  'explorador_booking': {
    userContext: 'explorador',
    platformArea: 'booking',
    retryPolicy: {
      maxRetries: 3,
      baseDelay: 1500,
      maxDelay: 12000,
      backoffMultiplier: 2.5,
      jitter: true,
    },
    fallbackStrategies: ['retry', 'manual', 'contact_support'],
    gracefulDegradation: false,
  },
  
  // Payment contexts
  'payment_processing': {
    userContext: 'explorador',
    platformArea: 'payments',
    retryPolicy: {
      maxRetries: 2,
      baseDelay: 3000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: false,
    },
    fallbackStrategies: ['manual', 'contact_support'],
    gracefulDegradation: false,
  },
  
  // Chat contexts
  'chat_messaging': {
    userContext: 'as',
    platformArea: 'chat',
    retryPolicy: {
      maxRetries: 5,
      baseDelay: 500,
      maxDelay: 4000,
      backoffMultiplier: 1.5,
      jitter: true,
    },
    fallbackStrategies: ['retry', 'offline_mode', 'reload'],
    gracefulDegradation: true,
  },
};

// Error message templates in Spanish
export const ERROR_MESSAGES = {
  network: {
    offline: 'No hay conexión a internet. Revisa tu WiFi o datos móviles.',
    slow: 'La conexión está lenta. Esto puede tardar un poco más.',
    timeout: 'La operación tardó demasiado. Verifica tu conexión e intenta de nuevo.',
    server_unreachable: 'No podemos conectar con nuestros servidores. Intenta en unos minutos.',
  },
  
  authentication: {
    session_expired: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
    invalid_credentials: 'Email o contraseña incorrectos. Verifica los datos e intenta de nuevo.',
    account_locked: 'Tu cuenta está temporalmente bloqueada. Contacta soporte si necesitas ayuda.',
    verification_required: 'Necesitas verificar tu email antes de continuar.',
  },
  
  payment: {
    card_declined: 'Tu tarjeta fue rechazada. Verifica los datos o prueba con otra tarjeta.',
    insufficient_funds: 'No tienes fondos suficientes. Revisa el saldo de tu cuenta.',
    mercadopago_error: 'Hubo un problema con MercadoPago. Intenta de nuevo o usa otro método.',
    processing_error: 'Error procesando el pago. Tu dinero está seguro, intenta de nuevo.',
  },
  
  file_upload: {
    size_too_large: 'El archivo es muy grande. El límite es de {maxSize}.',
    invalid_format: 'Formato no permitido. Usa {allowedFormats}.',
    upload_failed: 'Error subiendo el archivo. Verifica tu conexión e intenta de nuevo.',
    corrupted_file: 'El archivo está dañado. Prueba con otro archivo.',
  },
  
  booking: {
    time_conflict: 'El horario ya no está disponible. Elige otro horario.',
    service_unavailable: 'Este servicio no está disponible ahora. Prueba más tarde.',
    payment_required: 'Necesitas completar el pago para confirmar la reserva.',
    provider_unavailable: 'El profesional no está disponible. Te sugerimos otros.',
  },
  
  validation: {
    required_field: 'Este campo es obligatorio.',
    invalid_email: 'El email no es válido. Verifica el formato.',
    password_weak: 'La contraseña debe tener al menos 8 caracteres.',
    phone_invalid: 'El número de teléfono no es válido.',
  },
};