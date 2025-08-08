/**
 * useContextualError - Enhanced Error Recovery Hook
 * Provides intelligent error handling with context awareness
 */

import { useState, useCallback, useRef } from 'react';
import { 
  FixiaError, 
  UserContext, 
  PlatformArea, 
  NetworkError, 
  AuthenticationError,
  PaymentError,
  FileUploadError,
  ErrorCategory 
} from '@/types/errors';
import { useErrorRecovery } from '@/contexts/ErrorRecoveryContext';

// Hook configuration
interface UseContextualErrorConfig {
  userContext?: UserContext;
  platformArea?: PlatformArea;
  enableAutoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: FixiaError) => void;
  onRecovery?: (successful: boolean) => void;
}

// Hook return type
interface ContextualErrorMethods {
  reportError: (error: Error | FixiaError, context?: Partial<FixiaError>) => void;
  clearErrors: () => void;
  clearError: () => void; // Add clearError method for compatibility
  retry: (errorId?: string) => Promise<boolean>;
  escalateToSupport: (error: FixiaError) => void;
  createContextualError?: (error: Error, context?: Partial<FixiaError>) => FixiaError; // Add missing method
  getUserFrustrationLevel?: () => number; // Add missing method
  getRecommendedActions?: (error: FixiaError) => string[]; // Add missing method
  escalate?: (error: FixiaError) => void; // Add missing method
}

interface ContextualErrorState {
  isLoading: boolean;
  hasError: boolean;
  currentError: FixiaError | null;
  error: FixiaError | null; // Add missing 'error' property for compatibility
  retryCount: number;
  canRetry: boolean;
  isRecovering: boolean;
}

// Main hook
export function useContextualError(config: UseContextualErrorConfig = {}) {
  const { addError, removeError, reportGlobalError } = useErrorRecovery();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [state, setState] = useState<ContextualErrorState>({
    isLoading: false,
    hasError: false,
    currentError: null,
    error: null, // Initialize missing 'error' property
    retryCount: 0,
    canRetry: false,
    isRecovering: false,
  });

  // Report error method
  const reportError = useCallback((error: Error | FixiaError, context?: Partial<FixiaError>) => {
    const isFixiaError = 'category' in error;
    
    // Handle originalError with proper conditional prop spreading for exactOptionalPropertyTypes
    const originalError = isFixiaError ? (error as FixiaError).originalError : error;
    
    const fixiaError: FixiaError = isFixiaError ? error as FixiaError : {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'FixiaError',
      category: (context?.category as ErrorCategory) || 'system',
      severity: context?.severity || 'medium',
      code: `FIX_CTX_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: context?.userMessage || 'Ocurrió un error. Intenta de nuevo o contacta soporte.',
      userContext: config.userContext || context?.userContext || 'guest',
      platformArea: config.platformArea || context?.platformArea || 'system',
      timestamp: new Date().toISOString(),
      recoveryStrategy: context?.recoveryStrategy || ['retry', 'contact_support'],
      canAutoRecover: context?.canAutoRecover ?? true,
      escalationLevel: context?.escalationLevel || 1,
      // Only include originalError if it exists (conditional prop spreading for exactOptionalPropertyTypes)
      ...(originalError && { originalError }),
    };

    setState(prev => ({
      ...prev,
      hasError: true,
      currentError: fixiaError,
      error: fixiaError, // Set both currentError and error for compatibility
      canRetry: fixiaError.canAutoRecover && prev.retryCount < (config.maxRetries || 3),
    }));

    addError(fixiaError);
    config.onError?.(fixiaError);

    // Auto retry if enabled
    if (config.enableAutoRetry && fixiaError.canAutoRecover && state.retryCount < (config.maxRetries || 3)) {
      const delay = config.retryDelay || Math.pow(2, state.retryCount) * 1000; // Exponential backoff
      retryTimeoutRef.current = setTimeout(() => {
        retry(fixiaError.id);
      }, delay);
    }
  }, [config, addError, state.retryCount]);

  // Clear errors method
  const clearErrors = useCallback(() => {
    if (state.currentError) {
      removeError(state.currentError.id);
    }
    
    setState({
      isLoading: false,
      hasError: false,
      currentError: null,
      error: null, // Clear both currentError and error
      retryCount: 0,
      canRetry: false,
      isRecovering: false,
    });

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [state.currentError, removeError]);

  // Retry method
  const retry = useCallback(async (errorId?: string): Promise<boolean> => {
    const targetError = errorId ? state.currentError : state.currentError;
    if (!targetError) return false;

    setState(prev => ({
      ...prev,
      isRecovering: true,
      retryCount: prev.retryCount + 1,
    }));

    try {
      // Simulate retry logic - in real implementation, this would re-attempt the failed operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      clearErrors();
      config.onRecovery?.(true);
      return true;
    } catch (retryError) {
      // Retry failed
      setState(prev => ({
        ...prev,
        isRecovering: false,
        canRetry: prev.retryCount < (config.maxRetries || 3),
      }));
      
      config.onRecovery?.(false);
      return false;
    }
  }, [state.currentError, clearErrors, config]);

  // Escalate to support method
  const escalateToSupport = useCallback((error: FixiaError) => {
    const supportMessage = generateSupportMessage(error);
    const whatsappUrl = `https://wa.me/5492974123456?text=${encodeURIComponent(supportMessage)}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  }, []);

  // Create contextual error method
  const createContextualError = useCallback((error: Error, context?: Partial<FixiaError>): FixiaError => {
    return {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'FixiaError',
      category: (context?.category as ErrorCategory) || 'system',
      severity: context?.severity || 'medium',
      code: `FIX_CTX_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: context?.userMessage || 'Ocurrió un error. Intenta de nuevo o contacta soporte.',
      userContext: config.userContext || context?.userContext || 'guest',
      platformArea: config.platformArea || context?.platformArea || 'system',
      timestamp: new Date().toISOString(),
      originalError: error,
      recoveryStrategy: context?.recoveryStrategy || ['retry', 'contact_support'],
      canAutoRecover: context?.canAutoRecover ?? true,
      escalationLevel: context?.escalationLevel || 1,
    };
  }, [config]);

  // Get user frustration level method
  const getUserFrustrationLevel = useCallback((): number => {
    return state.retryCount * 10; // Simple frustration calculation
  }, [state.retryCount]);

  // Get recommended actions method
  const getRecommendedActions = useCallback((error: FixiaError): string[] => {
    const actions: string[] = [];
    if (error.recoveryStrategy.includes('retry')) {
      actions.push('Intentar nuevamente la operación');
    }
    if (error.recoveryStrategy.includes('reload')) {
      actions.push('Recargar la página');
    }
    if (error.recoveryStrategy.includes('contact_support')) {
      actions.push('Contactar al equipo de soporte');
    }
    return actions;
  }, []);

  // Escalate method (alias for escalateToSupport)
  const escalate = useCallback((error: FixiaError) => {
    escalateToSupport(error);
  }, [escalateToSupport]);

  // Clear error method (alias for clearErrors)
  const clearError = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  const methods: ContextualErrorMethods = {
    reportError,
    clearErrors,
    clearError,
    retry,
    escalateToSupport,
    createContextualError,
    getUserFrustrationLevel,
    getRecommendedActions,
    escalate,
  };

  return [state, methods] as const;
}

// Specialized hooks for common scenarios

// Network error hook
export function useNetworkError(config: UseContextualErrorConfig = {}) {
  const [state, methods] = useContextualError({
    ...config,
    platformArea: 'system',
  });

  const reportNetworkError = useCallback((error: Error, lastSuccessfulRequest?: string) => {
    const networkError: NetworkError = {
      id: `net_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'NetworkError',
      category: 'network',
      severity: 'medium',
      code: `FIX_NET_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: 'Problema de conexión. Revisa tu internet e intenta de nuevo.',
      userContext: config.userContext || 'guest',
      platformArea: config.platformArea || 'system',
      timestamp: new Date().toISOString(),
      originalError: error,
      recoveryStrategy: ['retry', 'reload', 'offline_mode'],
      canAutoRecover: true,
      escalationLevel: 1,
      connectionType: typeof navigator !== 'undefined' && (navigator as any).connection ? 
        (navigator as any).connection.type : 'unknown',
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      estimatedRecoveryTime: 5000,
      // Only include lastSuccessfulRequest if it exists (conditional prop spreading for exactOptionalPropertyTypes)
      ...(lastSuccessfulRequest && { lastSuccessfulRequest }),
    };

    methods.reportError(networkError);
  }, [methods, config]);

  return [state, { ...methods, reportNetworkError }] as const;
}

// Authentication error hook
export function useAuthError(config: UseContextualErrorConfig = {}) {
  const [state, methods] = useContextualError({
    ...config,
    platformArea: 'authentication',
  });

  const reportAuthError = useCallback((
    error: Error, 
    authType: 'login' | 'session' | 'token' | 'verification' = 'session',
    redirectUrl?: string
  ) => {
    const authError: AuthenticationError = {
      id: `auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'AuthenticationError',
      category: 'authentication',
      severity: 'critical',
      code: `FIX_AUTH_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: authType === 'session' ? 
        'Tu sesión ha expirado. Inicia sesión de nuevo.' :
        'Error de autenticación. Verifica tus credenciales.',
      userContext: config.userContext || 'guest',
      platformArea: 'authentication',
      timestamp: new Date().toISOString(),
      originalError: error,
      recoveryStrategy: ['redirect', 'manual'],
      canAutoRecover: false,
      escalationLevel: 2,
      authType,
      sessionExpired: authType === 'session',
      canAutoRenew: authType === 'token',
      requiresUserAction: true,
      redirectUrl: redirectUrl || '/auth/login',
    };

    methods.reportError(authError);
  }, [methods, config]);

  return [state, { ...methods, reportAuthError }] as const;
}

// Payment error hook
export function usePaymentError(config: UseContextualErrorConfig = {}) {
  const [state, methods] = useContextualError({
    ...config,
    platformArea: 'payments',
  });

  const reportPaymentError = useCallback((
    error: Error,
    paymentMethod: 'mercadopago' | 'credit_card' | 'bank_transfer' | 'mercadopago_wallet' = 'mercadopago',
    amount: number = 0,
    currency: string = 'ARS'
  ) => {
    const paymentError: PaymentError = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'PaymentError',
      category: 'payment',
      severity: 'critical',
      code: `FIX_PAY_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: paymentMethod === 'credit_card' ?
        'Error procesando tarjeta de crédito. Verifica los datos e intenta de nuevo.' :
        paymentMethod === 'mercadopago' ?
        'Error en MercadoPago. Tu dinero está seguro, intenta de nuevo.' :
        'Error procesando el pago. Intenta con otro método.',
      userContext: config.userContext || 'explorador',
      platformArea: 'payments',
      timestamp: new Date().toISOString(),
      originalError: error,
      recoveryStrategy: ['retry', 'manual', 'contact_support'],
      canAutoRecover: false,
      escalationLevel: 3,
      paymentMethod,
      amount,
      currency,
      alternativeMethods: ['mercadopago', 'credit_card', 'bank_transfer'],
      canRetryPayment: true,
    };

    methods.reportError(paymentError);
  }, [methods, config]);

  return [state, { ...methods, reportPaymentError }] as const;
}

// File upload error hook
export function useFileUploadError(config: UseContextualErrorConfig = {}) {
  const [state, methods] = useContextualError({
    ...config,
    platformArea: 'portfolio',
  });

  const reportFileUploadError = useCallback((
    error: Error,
    fileName: string,
    fileSize: number,
    fileType: string,
    uploadType: 'profile_photo' | 'portfolio_image' | 'document' | 'chat_attachment' = 'portfolio_image'
  ) => {
    const uploadError: FileUploadError = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: 'FileUploadError',
      category: 'file_upload',
      severity: 'medium',
      code: `FIX_UPLOAD_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: fileSize > 5000000 ? 
        'El archivo es muy grande. Máximo 5MB.' :
        !['image/jpeg', 'image/png', 'application/pdf'].includes(fileType) ?
        'Formato no permitido. Solo JPG, PNG o PDF.' :
        'Error subiendo el archivo. Intenta de nuevo.',
      userContext: config.userContext || 'as',
      platformArea: config.platformArea || 'portfolio',
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
    };

    methods.reportError(uploadError);
  }, [methods, config]);

  return [state, { ...methods, reportFileUploadError }] as const;
}

// Helper function to generate support message
function generateSupportMessage(error: FixiaError): string {
  return `🆘 *Error en Fixia*\n\n` +
         `Hola! Tengo un problema y necesito ayuda.\n\n` +
         `📋 *Detalles del Error:*\n` +
         `• Tipo: ${error.category}\n` +
         `• Área: ${error.platformArea}\n` +
         `• Usuario: ${error.userContext}\n` +
         `• ID: ${error.id}\n\n` +
         `📱 *Descripción:*\n${error.userMessage}\n\n` +
         `¿Pueden ayudarme? Gracias!`;
}