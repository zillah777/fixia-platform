/**
 * Comprehensive Error Types for Fixia Platform
 * Covers all error scenarios with context awareness
 */

// Base error types
export type ErrorCategory = 
  | 'network'
  | 'authentication' 
  | 'authorization'
  | 'validation'
  | 'payment'
  | 'file_upload'
  | 'chat'
  | 'booking'
  | 'subscription'
  | 'system'
  | 'server'
  | 'client'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type UserContext = 'guest' | 'explorador' | 'as' | 'admin';

export type PlatformArea = 
  | 'authentication'
  | 'dashboard'
  | 'marketplace'
  | 'chat'
  | 'payments'
  | 'portfolio'
  | 'booking'
  | 'profile'
  | 'search'
  | 'notifications'
  | 'system'
  | 'services'
  | 'reviews'
  | 'configuration'
  | 'verification';

export type RecoveryStrategy = 
  | 'retry'
  | 'reload' 
  | 'redirect'
  | 'manual'
  | 'contact_support'
  | 'offline_mode';

// Base error interface
export interface FixiaError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  
  userContext: UserContext;
  platformArea: PlatformArea;
  timestamp: string;
  
  originalError?: Error;
  recoveryStrategy: RecoveryStrategy[];
  canAutoRecover: boolean;
  escalationLevel: number;
  
  // Optional properties for specific error types
  retryCount?: number;
  maxRetries?: number;
  technicalDetails?: string;
}

// Specialized error types
export interface NetworkError extends FixiaError {
  category: 'network';
  connectionType: string;
  isOffline: boolean;
  lastSuccessfulRequest?: string;
  estimatedRecoveryTime: number;
}

export interface AuthenticationError extends FixiaError {
  category: 'authentication';
  authType: 'login' | 'session' | 'token' | 'verification';
  sessionExpired: boolean;
  canAutoRenew: boolean;
  requiresUserAction: boolean;
  redirectUrl?: string;
}

export interface PaymentError extends FixiaError {
  category: 'payment';
  paymentMethod: 'mercadopago' | 'credit_card' | 'bank_transfer' | 'mercadopago_wallet';
  amount: number;
  currency: string;
  alternativeMethods: string[];
  canRetryPayment: boolean;
  mercadopagoErrorCode?: string;
  transactionId?: string;
  paymentId?: string;
  declineReason?: string;
}

export interface FileUploadError extends FixiaError {
  category: 'file_upload';
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadType: 'profile_photo' | 'portfolio_image' | 'document' | 'chat_attachment';
  failureReason: 'size_limit' | 'type_not_allowed' | 'network' | 'server_error';
  maxFileSize: number;
  allowedTypes: string[];
}

export interface ChatError extends FixiaError {
  category: 'chat';
  chatRoomId: string;
  messageType: 'text' | 'attachment' | 'system';
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastMessageSent?: string;
}

export interface BookingError extends FixiaError {
  category: 'booking';
  bookingId?: string;
  serviceId: string;
  providerId: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  failureReason: 'availability' | 'payment' | 'validation' | 'system';
}

export interface ValidationError extends FixiaError {
  category: 'validation';
  field: string;
  validationRule: string;
  currentValue: any;
  expectedFormat: string;
  suggestions: string[];
}

// Recovery actions
export interface RecoveryAction {
  type: RecoveryStrategy;
  label: string;
  description: string;
  isAutomatic: boolean;
  estimatedTime?: number;
  requiresInternet?: boolean;
}

// Support escalation
export interface SupportEscalation {
  level: number;
  method: 'whatsapp' | 'email' | 'chat' | 'phone';
  contact: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// Error recovery configuration
export interface ErrorRecoveryConfig {
  userContext?: UserContext;
  platformArea?: PlatformArea;
  enableAutoRecovery?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableAnalytics?: boolean;
  enableSupportIntegration?: boolean;
}