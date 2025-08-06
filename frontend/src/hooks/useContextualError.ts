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
  retry: (errorId?: string) => Promise<boolean>;
  escalateToSupport: (error: FixiaError) => void;
}

interface ContextualErrorState {
  isLoading: boolean;
  hasError: boolean;
  currentError: FixiaError | null;
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
    retryCount: 0,
    canRetry: false,
    isRecovering: false,
  });

  // Report error method
  const reportError = useCallback((error: Error | FixiaError, context?: Partial<FixiaError>) => {
    const isFixiaError = 'category' in error;
    
    const fixiaError: FixiaError = isFixiaError ? error as FixiaError : {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      category: (context?.category as ErrorCategory) || 'system',
      severity: context?.severity || 'medium',
      code: `FIX_CTX_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: context?.userMessage || 'Ocurrió un error. Intenta de nuevo o contacta soporte.',
      userContext: config.userContext || context?.userContext || 'guest',
      platformArea: config.platformArea || context?.platformArea || 'system',
      timestamp: new Date().toISOString(),
      originalError: isFixiaError ? (error as FixiaError).originalError : error,
      recoveryStrategy: context?.recoveryStrategy || ['retry', 'contact_support'],
      canAutoRecover: context?.canAutoRecover ?? true,
      escalationLevel: context?.escalationLevel || 1,
    };

    setState(prev => ({
      ...prev,
      hasError: true,
      currentError: fixiaError,
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

  const methods: ContextualErrorMethods = {
    reportError,
    clearErrors,
    retry,
    escalateToSupport,
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
      lastSuccessfulRequest,
      estimatedRecoveryTime: 5000,
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