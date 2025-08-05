/**
 * useContextualError - Enhanced Error Recovery Hook
 * Provides intelligent error handling with context-aware recovery strategies
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FixiaError, 
  ErrorCategory, 
  UserContext, 
  PlatformArea, 
  ErrorSeverity,
  RecoveryStrategy,
  ERROR_CONFIGS,
  ERROR_MESSAGES
} from '@/types/errors';

interface ErrorState {
  error: FixiaError | null;
  isRecovering: boolean;
  retryCount: number;
  hasRecovered: boolean;
}

interface UseContextualErrorOptions {
  userContext?: UserContext;
  platformArea?: PlatformArea;
  enableAutoRecovery?: boolean;
  maxRetries?: number;
  onError?: (error: FixiaError) => void;
  onRecovery?: (successful: boolean) => void;
  onEscalation?: (error: FixiaError) => void;
}

interface ErrorRecoveryMethods {
  reportError: (error: Error | FixiaError, context?: Partial<FixiaError>) => void;
  clearError: () => void;
  retry: (customHandler?: () => Promise<void>) => Promise<boolean>;
  escalate: () => void;
  switchToOfflineMode: () => void;
  createContextualError: (error: Error, context?: Partial<FixiaError>) => FixiaError;
}

export const useContextualError = (
  options: UseContextualErrorOptions = {}
): [ErrorState, ErrorRecoveryMethods] => {
  const router = useRouter();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRecovering: false,
    retryCount: 0,
    hasRecovered: false,
  });

  const consecutiveErrorsRef = useRef(0);
  const lastErrorTimeRef = useRef<Date | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect user context from router
  const detectUserContext = useCallback((): UserContext => {
    if (options.userContext) return options.userContext;
    
    const pathname = router.pathname;
    if (pathname.startsWith('/as/')) return 'as';
    if (pathname.startsWith('/explorador/')) return 'explorador';
    if (pathname.startsWith('/auth/')) return 'guest';
    return 'guest';
  }, [router.pathname, options.userContext]);

  // Detect platform area from router
  const detectPlatformArea = useCallback((): PlatformArea => {
    if (options.platformArea) return options.platformArea;
    
    const pathname = router.pathname;
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/servicios')) return 'services';
    if (pathname.includes('/portafolio')) return 'portfolio';
    if (pathname.includes('/chat')) return 'chat';
    if (pathname.includes('/pago')) return 'payments';
    if (pathname.includes('/perfil')) return 'profile';
    if (pathname.includes('/auth')) return 'authentication';
    if (pathname.includes('/buscar')) return 'search';
    if (pathname.includes('/calificaciones')) return 'reviews';
    if (pathname.includes('/configuracion')) return 'configuration';
    if (pathname.includes('/verificacion')) return 'verification';
    
    return 'dashboard';
  }, [router.pathname, options.platformArea]);

  // Create contextual error from basic Error
  const createContextualError = useCallback((
    error: Error, 
    context: Partial<FixiaError> = {}
  ): FixiaError => {
    const userContext = detectUserContext();
    const platformArea = detectPlatformArea();
    const category = categorizeError(error);
    
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: errorId,
      category,
      severity: determineSeverity(error, category),
      code: generateErrorCode(error, category),
      message: error.message,
      userMessage: generateUserMessage(error, category, userContext, platformArea),
      
      // Context
      userContext,
      platformArea,
      timestamp: new Date().toISOString(),
      
      // Error specifics
      originalError: error,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      
      // Recovery information
      recoveryStrategy: determineRecoveryStrategies(error, category, userContext, platformArea),
      retryCount: errorState.retryCount,
      maxRetries: options.maxRetries || 3,
      canAutoRecover: canAutoRecover(error, category),
      
      // Support integration
      escalationLevel: determineEscalationLevel(error, category),
      
      // Analytics
      errorGroup: generateErrorGroup(error, platformArea),
      fingerprint: generateFingerprint(error),
      metadata: collectMetadata(),
      
      // Override with provided context
      ...context,
    };
  }, [detectUserContext, detectPlatformArea, errorState.retryCount, options.maxRetries]);

  // Categorize error based on error properties
  const categorizeError = useCallback((error: Error): ErrorCategory => {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || name.includes('networkerror')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('token') || message.includes('session')) {
      return 'authentication';
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return 'authorization';
    }
    if (message.includes('validation') || message.includes('required')) {
      return 'validation';
    }
    if (message.includes('payment') || message.includes('mercadopago')) {
      return 'payment';
    }
    if (message.includes('upload') || message.includes('file')) {
      return 'file_upload';
    }
    if (message.includes('chat') || message.includes('message')) {
      return 'chat';
    }
    if (message.includes('booking') || message.includes('reservation')) {
      return 'booking';
    }
    
    return name.includes('referenceerror') || name.includes('typeerror') ? 'client' : 'server';
  }, []);

  // Determine error severity
  const determineSeverity = useCallback ((error: Error, category: ErrorCategory): ErrorSeverity => {
    if (category === 'payment' || category === 'authentication') return 'critical';
    if (category === 'booking' || category === 'file_upload') return 'high';
    if (category === 'chat' || category === 'validation') return 'medium';
    return 'low';
  }, []);

  // Generate user-friendly message
  const generateUserMessage = useCallback((
    error: Error, 
    category: ErrorCategory, 
    userContext: UserContext,
    platformArea: PlatformArea
  ): string => {
    // Get base message from templates
    const categoryMessages = ERROR_MESSAGES[category];
    let baseMessage = 'Ocurrió un error inesperado. Intenta de nuevo o contáctanos si persiste.';
    
    if (categoryMessages) {
      const messageKeys = Object.keys(categoryMessages);
      const errorMessage = error.message.toLowerCase();
      
      // Find matching message based on error content
      const matchingKey = messageKeys.find(key => errorMessage.includes(key));
      if (matchingKey) {
        baseMessage = categoryMessages[matchingKey as keyof typeof categoryMessages];
      } else {
        baseMessage = Object.values(categoryMessages)[0] as string;
      }
    }
    
    // Add context-specific messaging
    if (userContext === 'as') {
      if (category === 'file_upload' && platformArea === 'portfolio') {
        return 'Error subiendo la imagen al portafolio. Verifica que sea JPG o PNG y menor a 5MB.';
      }
      if (category === 'booking') {
        return 'Error procesando la solicitud del cliente. Revisa tu conexión e intenta de nuevo.';
      }
    } else if (userContext === 'explorador') {
      if (category === 'booking') {
        return 'Error enviando tu solicitud. El profesional puede estar ocupado, intenta más tarde.';
      }
      if (category === 'payment') {
        return 'Hubo un problema procesando el pago. Tu dinero está seguro, intenta de nuevo.';
      }
    }
    
    return baseMessage;
  }, []);

  // Determine recovery strategies
  const determineRecoveryStrategies = useCallback((
    error: Error, 
    category: ErrorCategory, 
    userContext: UserContext,
    platformArea: PlatformArea
  ): RecoveryStrategy[] => {
    const configKey = `${userContext}_${platformArea}`;
    const config = ERROR_CONFIGS[configKey];
    
    if (config?.fallbackStrategies) {
      return config.fallbackStrategies;
    }
    
    // Default strategies by category
    const strategies: Record<ErrorCategory, RecoveryStrategy[]> = {
      network: ['retry', 'reload', 'offline_mode'],
      authentication: ['redirect', 'manual'],
      authorization: ['contact_support', 'redirect'],
      validation: ['manual', 'auto_fix'],
      payment: ['retry', 'manual', 'contact_support'],
      file_upload: ['retry', 'manual'],
      chat: ['retry', 'reload'],
      booking: ['retry', 'manual', 'fallback'],
      server: ['retry', 'reload', 'contact_support'],
      client: ['reload', 'retry'],
      unknown: ['retry', 'reload', 'contact_support'],
    };
    
    return strategies[category] || ['retry', 'contact_support'];
  }, []);

  // Check if error can auto-recover
  const canAutoRecover = useCallback((error: Error, category: ErrorCategory): boolean => {
    const autoRecoverableCategories: ErrorCategory[] = ['network', 'server', 'chat'];
    return autoRecoverableCategories.includes(category);
  }, []);

  // Determine escalation level
  const determineEscalationLevel = useCallback((error: Error, category: ErrorCategory): number => {
    if (category === 'payment' || category === 'authentication') return 3;
    if (category === 'booking' || category === 'authorization') return 2;
    if (category === 'validation' || category === 'file_upload') return 1;
    return 0;
  }, []);

  // Generate error code
  const generateErrorCode = useCallback((error: Error, category: ErrorCategory): string => {
    const timestamp = Date.now().toString(36);
    const categoryCode = category.toUpperCase().substr(0, 3);
    const errorHash = error.message.length.toString(36);
    return `FIX_${categoryCode}_${errorHash}_${timestamp}`;
  }, []);

  // Generate error group for analytics
  const generateErrorGroup = useCallback((error: Error, platformArea: PlatformArea): string => {
    return `${error.name}_${platformArea}`;
  }, []);

  // Generate error fingerprint
  const generateFingerprint = useCallback((error: Error): string => {
    const content = `${error.name}_${error.message}_${detectPlatformArea()}`;
    return btoa(content).substr(0, 16);
  }, [detectPlatformArea]);

  // Collect metadata
  const collectMetadata = useCallback((): Record<string, any> => {
    const metadata: Record<string, any> = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      retryCount: errorState.retryCount,
      consecutiveErrors: consecutiveErrorsRef.current,
    };

    if (typeof window !== 'undefined') {
      metadata.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      
      metadata.connection = {
        online: navigator.onLine,
        effectiveType: (navigator as any)?.connection?.effectiveType || 'unknown',
      };
    }

    return metadata;
  }, [errorState.retryCount]);

  // Report error
  const reportError = useCallback((
    error: Error | FixiaError, 
    context: Partial<FixiaError> = {}
  ) => {
    const contextualError = error instanceof Error ? createContextualError(error, context) : error;
    
    // Update error state
    setErrorState(prev => ({
      ...prev,
      error: contextualError,
      hasRecovered: false,
    }));

    // Track consecutive errors
    const now = new Date();
    if (lastErrorTimeRef.current && (now.getTime() - lastErrorTimeRef.current.getTime()) < 30000) {
      consecutiveErrorsRef.current += 1;
    } else {
      consecutiveErrorsRef.current = 1;
    }
    lastErrorTimeRef.current = now;

    // Report to monitoring systems
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(contextualError.originalError || contextualError, {
        tags: {
          errorCategory: contextualError.category,
          userContext: contextualError.userContext,
          platformArea: contextualError.platformArea,
        },
        extra: { contextualError },
      });
    }

    // Trigger callback
    if (options.onError) {
      options.onError(contextualError);
    }

    // Auto-escalate if needed
    if (shouldAutoEscalate(contextualError)) {
      setTimeout(() => escalate(), 1000);
    }

    // Auto-retry if enabled
    if (options.enableAutoRecovery && contextualError.canAutoRecover && 
        contextualError.retryCount < (contextualError.maxRetries || 3)) {
      scheduleAutoRetry();
    }
  }, [createContextualError, options.onError, options.enableAutoRecovery]);

  // Check if should auto-escalate
  const shouldAutoEscalate = useCallback((error: FixiaError): boolean => {
    return error.severity === 'critical' || 
           consecutiveErrorsRef.current >= 3 || 
           error.category === 'payment';
  }, []);

  // Schedule auto-retry
  const scheduleAutoRetry = useCallback(() => {
    const delay = Math.min(1000 * Math.pow(2, errorState.retryCount), 10000);
    
    retryTimeoutRef.current = setTimeout(() => {
      retry();
    }, delay);
  }, [errorState.retryCount]);

  // Clear error
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRecovering: false,
      retryCount: 0,
      hasRecovered: true,
    });
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Retry operation
  const retry = useCallback(async (customHandler?: () => Promise<void>): Promise<boolean> => {
    if (!errorState.error || errorState.isRecovering) return false;

    setErrorState(prev => ({
      ...prev,
      isRecovering: true,
      retryCount: prev.retryCount + 1,
    }));

    try {
      if (customHandler) {
        await customHandler();
      } else {
        // Default retry logic - reload page
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }

      // If we get here, retry was successful
      setErrorState(prev => ({
        ...prev,
        error: null,
        isRecovering: false,
        hasRecovered: true,
      }));

      if (options.onRecovery) {
        options.onRecovery(true);
      }

      return true;
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
      setErrorState(prev => ({
        ...prev,
        isRecovering: false,
      }));

      if (options.onRecovery) {
        options.onRecovery(false);
      }

      return false;
    }
  }, [errorState.error, errorState.isRecovering, options.onRecovery]);

  // Escalate to support
  const escalate = useCallback(() => {
    if (!errorState.error) return;

    if (options.onEscalation) {
      options.onEscalation(errorState.error);
    } else {
      // Default escalation - open WhatsApp
      const message = encodeURIComponent(
        `🆘 Error en Fixia - ID: ${errorState.error.id}\n\n` +
        `${errorState.error.userMessage}\n\n` +
        `¿Pueden ayudarme?`
      );
      window.open(`https://wa.me/5492965123456?text=${message}`, '_blank');
    }
  }, [errorState.error, options.onEscalation]);

  // Switch to offline mode
  const switchToOfflineMode = useCallback(() => {
    // Implement offline mode logic
    console.log('Switching to offline mode');
    
    // Cache current state
    if (typeof window !== 'undefined') {
      localStorage.setItem('fixia_offline_mode', 'true');
      localStorage.setItem('fixia_offline_timestamp', new Date().toISOString());
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const errorRecoveryMethods: ErrorRecoveryMethods = {
    reportError,
    clearError,
    retry,
    escalate,
    switchToOfflineMode,
    createContextualError,
  };

  return [errorState, errorRecoveryMethods];
};

// Hook for specific error scenarios
export const useNetworkError = (options: UseContextualErrorOptions = {}) => {
  return useContextualError({
    ...options,
    enableAutoRecovery: true,
    maxRetries: 5,
  });
};

export const usePaymentError = (options: UseContextualErrorOptions = {}) => {
  return useContextualError({
    ...options,
    platformArea: 'payments',
    enableAutoRecovery: false,
    maxRetries: 2,
  });
};

export const useAuthError = (options: UseContextualErrorOptions = {}) => {
  return useContextualError({
    ...options,
    platformArea: 'authentication',
    enableAutoRecovery: false,
    maxRetries: 1,
  });
};

export const useFileUploadError = (options: UseContextualErrorOptions = {}) => {
  return useContextualError({
    ...options,
    platformArea: 'portfolio',
    enableAutoRecovery: true,
    maxRetries: 3,
  });
};