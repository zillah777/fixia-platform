/**
 * Error Recovery System - Comprehensive Export Index
 * Provides easy access to all error recovery components, hooks, and types
 */

import React from 'react';
import { FixiaErrorBoundary } from './FixiaErrorBoundary';
import type { 
  FixiaError, 
  NetworkError, 
  AuthenticationError, 
  PaymentError, 
  FileUploadError,
  UserContext,
  PlatformArea
} from '../../types/errors';

// Core Error Boundary and Recovery Components
export { FixiaErrorBoundary } from './FixiaErrorBoundary';
export { FixiaErrorRecovery } from './FixiaErrorRecovery';

// Specialized Error Handlers
export { FixiaNetworkError } from './FixiaNetworkError';
export { FixiaAuthError } from './FixiaAuthError';
export { FixiaPaymentError } from './FixiaPaymentError';

// Support Integration
export { FixiaSupportIntegration } from './FixiaSupportIntegration';

// Context Provider and Hooks
export { ErrorRecoveryProvider, useErrorRecovery } from '../../contexts/ErrorRecoveryContext';

// Types
export type {
  FixiaError,
  ErrorCategory,
  ErrorSeverity,
  UserContext,
  PlatformArea,
  RecoveryStrategy,
  NetworkError,
  AuthenticationError,
  PaymentError,
  FileUploadError,
  ChatError,
  BookingError,
  ValidationError,
  RecoveryAction,
  SupportEscalation,
  ErrorRecoveryConfig,
} from '../../types/errors';

// Common Error Scenarios (from existing SimpleErrorHandler)
export { SimpleError, CommonErrors, useSimpleErrorHandler } from '../SimpleErrorHandler';

// Utility functions for common error scenarios
export const ErrorRecoveryUtils = {
  /**
   * Create a network error from a fetch failure
   */
  createNetworkError: (error: Error, lastSuccessfulRequest?: string): NetworkError => ({
    id: `net_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'NetworkError',
    category: 'network',
    severity: 'medium',
    code: `FIX_NET_${Date.now().toString(36)}`,
    message: error.message,
    userMessage: 'No hay conexión a internet. Revisa tu WiFi o datos móviles e intenta de nuevo.',
    
    userContext: 'guest',
    platformArea: 'dashboard',
    timestamp: new Date().toISOString(),
    
    originalError: error,
    recoveryStrategy: ['retry', 'reload', 'offline_mode'],
    canAutoRecover: true,
    escalationLevel: 1,
    
    connectionType: typeof navigator !== 'undefined' && (navigator as any).connection ? 
      (navigator as any).connection.type : 'unknown',
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    ...(lastSuccessfulRequest !== undefined && { lastSuccessfulRequest }),
    estimatedRecoveryTime: 5000,
  }),

  /**
   * Create an authentication error for session expiration
   */
  createSessionExpiredError: (redirectUrl?: string): AuthenticationError => ({
    id: `auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'AuthenticationError',
    category: 'authentication',
    severity: 'critical',
    code: `FIX_AUTH_${Date.now().toString(36)}`,
    message: 'Session expired',
    userMessage: 'Tu sesión ha expirado por seguridad. Inicia sesión de nuevo para continuar.',
    
    userContext: 'guest',
    platformArea: 'authentication',
    timestamp: new Date().toISOString(),
    
    recoveryStrategy: ['redirect', 'manual'],
    canAutoRecover: false,
    escalationLevel: 2,
    
    authType: 'session',
    sessionExpired: true,
    canAutoRenew: true,
    requiresUserAction: true,
    redirectUrl: redirectUrl || '/auth/login',
  }),

  /**
   * Create a payment error with MercadoPago context
   */
  createPaymentError: (
    error: Error, 
    amount: number, 
    paymentMethod: string = 'mercadopago',
    mercadopagoErrorCode?: string
  ): PaymentError => ({
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'PaymentError',
    category: 'payment',
    severity: 'critical',
    code: `FIX_PAY_${Date.now().toString(36)}`,
    message: error.message,
    userMessage: 'Hubo un problema procesando el pago. Tu dinero está seguro, intenta de nuevo.',
    
    userContext: 'explorador',
    platformArea: 'payments',
    timestamp: new Date().toISOString(),
    
    originalError: error,
    recoveryStrategy: ['retry', 'manual', 'contact_support'],
    canAutoRecover: false,
    escalationLevel: 3,
    
    paymentMethod: paymentMethod as any,
    amount,
    currency: 'ARS',
    alternativeMethods: ['credit_card', 'bank_transfer', 'mercadopago_wallet'],
    canRetryPayment: true,
    ...(mercadopagoErrorCode !== undefined && { mercadopagoErrorCode }),
  }),

  /**
   * Create a file upload error with detailed context
   */
  createFileUploadError: (
    error: Error,
    fileName: string,
    fileSize: number,
    fileType: string,
    uploadType: 'profile_photo' | 'portfolio_image' | 'document' | 'chat_attachment' = 'portfolio_image'
  ): FileUploadError => ({
    id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'FileUploadError',
    category: 'file_upload',
    severity: 'medium',
    code: `FIX_UPLOAD_${Date.now().toString(36)}`,
    message: error.message,
    userMessage: 'Error subiendo el archivo. Verifica que sea del formato correcto e intenta de nuevo.',
    
    userContext: 'as',
    platformArea: 'portfolio',
    timestamp: new Date().toISOString(),
    
    originalError: error,
    recoveryStrategy: ['retry', 'manual'],
    canAutoRecover: true,
    escalationLevel: 1,
    
    fileName,
    fileSize,
    fileType,
    uploadType,
    failureReason: fileSize > 5000000 ? 'size_limit' : 
                  !['image/jpeg', 'image/png', 'application/pdf'].includes(fileType) ? 'type_not_allowed' : 'network',
    maxFileSize: 5000000,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  }),

  /**
   * Check if error should trigger automatic escalation
   */
  shouldAutoEscalate: (error: FixiaError, consecutiveErrors: number = 0): boolean => {
    return error.severity === 'critical' || 
           consecutiveErrors >= 3 || 
           error.category === 'payment' ||
           (error.category === 'authentication' && error.severity === 'high');
  },

  /**
   * Get user-friendly error message based on context
   */
  getContextualMessage: (error: FixiaError): string => {
    const baseMessage = error.userMessage;
    
    if (error.userContext === 'as') {
      if (error.category === 'booking') {
        return 'Error procesando la solicitud del cliente. Revisa tu conexión e intenta de nuevo.';
      } else if (error.category === 'file_upload') {
        return 'Error subiendo la imagen al portafolio. Verifica que sea JPG o PNG y menor a 5MB.';
      }
    } else if (error.userContext === 'explorador') {
      if (error.category === 'booking') {
        return 'Error enviando tu solicitud. El profesional puede estar ocupado, intenta más tarde.';
      }
    }
    
    return baseMessage;
  },

  /**
   * Generate WhatsApp support message with error context
   */
  generateSupportMessage: (error: FixiaError): string => {
    return `🆘 *Error en Fixia*\n\n` +
           `Hola! Tengo un problema y necesito ayuda.\n\n` +
           `📋 *Detalles del Error:*\n` +
           `• Tipo: ${error.category}\n` +
           `• Área: ${error.platformArea}\n` +
           `• Usuario: ${error.userContext}\n` +
           `• ID: ${error.id}\n\n` +
           `📱 *Descripción:*\n${error.userMessage}\n\n` +
           `¿Pueden ayudarme? Gracias!`;
  },
};

// HOF for wrapping components with error boundaries
export const withErrorRecovery = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    userContext?: UserContext;
    platformArea?: PlatformArea;
    enableAutoRecovery?: boolean;
    fallbackComponent?: React.ComponentType<{ error: FixiaError; retry: () => void }>;
  }
) => {
  const WrappedComponent = (props: P) => (
    <FixiaErrorBoundary
      {...(options?.userContext !== undefined && { userContext: options.userContext })}
      {...(options?.platformArea !== undefined && { platformArea: options.platformArea })}
      {...(options?.enableAutoRecovery !== undefined && { enableAutoRecovery: options.enableAutoRecovery })}
      {...(options?.fallbackComponent !== undefined && { fallbackComponent: options.fallbackComponent })}
    >
      <Component {...props} />
    </FixiaErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorRecovery(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Configuration presets for different platform areas
export const ErrorRecoveryPresets = {
  AS_DASHBOARD: {
    userContext: 'as' as UserContext,
    platformArea: 'dashboard' as PlatformArea,
    enableAutoRecovery: true,
    maxRetries: 3,
  },
  
  EXPLORADOR_MARKETPLACE: {
    userContext: 'explorador' as UserContext,
    platformArea: 'marketplace' as PlatformArea,
    enableAutoRecovery: true,
    maxRetries: 5,
  },
  
  PAYMENT_FLOW: {
    userContext: 'explorador' as UserContext,
    platformArea: 'payments' as PlatformArea,
    enableAutoRecovery: false,
    maxRetries: 2,
  },
  
  CHAT_SYSTEM: {
    platformArea: 'chat' as PlatformArea,
    enableAutoRecovery: true,
    maxRetries: 10,
  },
  
  FILE_UPLOAD: {
    platformArea: 'portfolio' as PlatformArea,
    enableAutoRecovery: true,
    maxRetries: 5,
  },
};