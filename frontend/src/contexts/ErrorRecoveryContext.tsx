/**
 * Error Recovery Context - Global Error Management
 * Provides centralized error handling and recovery capabilities
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { FixiaError, ErrorCategory, UserContext, PlatformArea } from '@/types/errors';

// State interface
interface ErrorRecoveryState {
  errors: FixiaError[];
  isGlobalErrorUIVisible: boolean;
  currentError: FixiaError | null;
  errorHistory: FixiaError[];
  retryCount: number;
  consecutiveErrors: number;
  lastErrorTime: Date | null;
  isOnline: boolean;
  frustrationLevel: number; // 0-10 scale
  connectionStatus: 'online' | 'slow' | 'unstable' | 'offline' | 'connected' | 'disconnected' | 'reconnecting';
  errorRate: number;
  offlineMode: boolean;
}

// Actions
type ErrorRecoveryAction =
  | { type: 'ADD_ERROR'; payload: FixiaError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_CURRENT_ERROR'; payload: FixiaError | null }
  | { type: 'INCREMENT_RETRY'; payload: string }
  | { type: 'INCREMENT_FRUSTRATION' }
  | { type: 'RESET_FRUSTRATION' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SHOW_GLOBAL_ERROR_UI'; payload: boolean };

// Context interface
interface ErrorRecoveryContextType {
  state: ErrorRecoveryState;
  addError: (error: FixiaError) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  reportGlobalError: (error: Error, context?: Partial<FixiaError>) => void;
  getErrorRate: () => number;
  getFrustrationLevel: () => number;
  getUserFrustrationLevel: () => number; // Add missing method
  getRecommendedActions: (error: FixiaError) => string[]; // Add missing method
  shouldEscalateToSupport: () => boolean;
  escalate: (error: FixiaError) => void; // Add missing method
}

// Initial state
const initialState: ErrorRecoveryState = {
  errors: [],
  isGlobalErrorUIVisible: false,
  currentError: null,
  errorHistory: [],
  retryCount: 0,
  consecutiveErrors: 0,
  lastErrorTime: null,
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  frustrationLevel: 0,
  connectionStatus: 'online',
  errorRate: 0,
  offlineMode: false,
};

// Reducer
function errorRecoveryReducer(state: ErrorRecoveryState, action: ErrorRecoveryAction): ErrorRecoveryState {
  switch (action.type) {
    case 'ADD_ERROR':
      const newError = action.payload;
      return {
        ...state,
        errors: [...state.errors, newError],
        errorHistory: [...state.errorHistory, newError].slice(-50), // Keep last 50 errors
        currentError: newError,
        consecutiveErrors: state.consecutiveErrors + 1,
        lastErrorTime: new Date(),
        frustrationLevel: Math.min(state.frustrationLevel + 1, 10),
      };

    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
        currentError: state.currentError?.id === action.payload ? null : state.currentError,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
        currentError: null,
        consecutiveErrors: 0,
        frustrationLevel: Math.max(state.frustrationLevel - 2, 0),
      };

    case 'SET_CURRENT_ERROR':
      return {
        ...state,
        currentError: action.payload,
      };

    case 'INCREMENT_RETRY':
      return {
        ...state,
        retryCount: state.retryCount + 1,
        frustrationLevel: Math.min(state.frustrationLevel + 0.5, 10),
      };

    case 'INCREMENT_FRUSTRATION':
      return {
        ...state,
        frustrationLevel: Math.min(state.frustrationLevel + 1, 10),
      };

    case 'RESET_FRUSTRATION':
      return {
        ...state,
        frustrationLevel: 0,
      };

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };

    case 'SHOW_GLOBAL_ERROR_UI':
      return {
        ...state,
        isGlobalErrorUIVisible: action.payload,
      };

    default:
      return state;
  }
}

// Context
const ErrorRecoveryContext = createContext<ErrorRecoveryContextType | undefined>(undefined);

// Provider props
interface ErrorRecoveryProviderProps {
  children: ReactNode;
  enableGlobalErrorUI?: boolean;
  enableOfflineSupport?: boolean;
  enableAnalytics?: boolean;
}

// Provider component
export function ErrorRecoveryProvider({
  children,
  enableGlobalErrorUI = true,
  enableOfflineSupport = true,
  enableAnalytics = true,
}: ErrorRecoveryProviderProps) {
  const [state, dispatch] = useReducer(errorRecoveryReducer, initialState);

  // Add error handler
  const addError = useCallback((error: FixiaError) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
    
    // Analytics integration
    if (enableAnalytics && typeof window !== 'undefined') {
      // Send to analytics service (e.g., Sentry, Google Analytics)
      console.log('Error Analytics:', {
        errorId: error.id,
        category: error.category,
        severity: error.severity,
        userContext: error.userContext,
        platformArea: error.platformArea,
      });
    }
  }, [enableAnalytics]);

  // Remove error handler
  const removeError = useCallback((errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  }, []);

  // Clear errors handler
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // Global error reporter
  const reportGlobalError = useCallback((error: Error, context?: Partial<FixiaError>) => {
    const fixiaError: FixiaError = {
      id: `global_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      category: (context?.category as ErrorCategory) || 'system',
      severity: context?.severity || 'medium',
      code: `FIX_GLOBAL_${Date.now().toString(36)}`,
      message: error.message,
      userMessage: context?.userMessage || 'Ocurrió un error inesperado. Nuestro equipo ha sido notificado.',
      userContext: context?.userContext || 'guest',
      platformArea: context?.platformArea || 'system',
      timestamp: new Date().toISOString(),
      originalError: error,
      recoveryStrategy: context?.recoveryStrategy || ['reload', 'contact_support'],
      canAutoRecover: context?.canAutoRecover ?? false,
      escalationLevel: context?.escalationLevel || 2,
    };

    addError(fixiaError);
  }, [addError]);

  // Calculate error rate (errors per minute)
  const getErrorRate = useCallback(() => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentErrors = state.errorHistory.filter(
      error => new Date(error.timestamp) > oneMinuteAgo
    );
    return recentErrors.length;
  }, [state.errorHistory]);

  // Get frustration level
  const getFrustrationLevel = useCallback(() => {
    return state.frustrationLevel;
  }, [state.frustrationLevel]);

  // Check if should escalate to support
  const shouldEscalateToSupport = useCallback(() => {
    return (
      state.frustrationLevel >= 7 ||
      state.consecutiveErrors >= 5 ||
      getErrorRate() >= 3 ||
      state.errors.some(error => error.severity === 'critical')
    );
  }, [state.frustrationLevel, state.consecutiveErrors, state.errors, getErrorRate]);

  // Online/offline detection
  React.useEffect(() => {
    if (!enableOfflineSupport || typeof window === 'undefined') return;

    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineSupport]);

  // Global error handler
  React.useEffect(() => {
    if (!enableGlobalErrorUI || typeof window === 'undefined') return;

    const handleGlobalError = (event: ErrorEvent) => {
      reportGlobalError(new Error(event.message), {
        platformArea: 'system',
        severity: 'high',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportGlobalError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        {
          platformArea: 'system',
          severity: 'medium',
        }
      );
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enableGlobalErrorUI, reportGlobalError]);

  // Get user frustration level (alias for getFrustrationLevel)
  const getUserFrustrationLevel = useCallback(() => {
    return state.frustrationLevel * 10; // Convert 0-10 scale to percentage
  }, [state.frustrationLevel]);

  // Get recommended actions
  const getRecommendedActions = useCallback((error: FixiaError): string[] => {
    const actions: string[] = [];
    if (error.recoveryStrategy.includes('retry')) {
      actions.push('Intentar nuevamente la operación');
    }
    if (error.recoveryStrategy.includes('reload')) {
      actions.push('Recargar la página');
    }
    if (error.recoveryStrategy.includes('redirect')) {
      actions.push('Navegar a una página segura');
    }
    if (error.recoveryStrategy.includes('contact_support')) {
      actions.push('Contactar al equipo de soporte');
    }
    if (error.recoveryStrategy.includes('offline_mode')) {
      actions.push('Usar modo sin conexión');
    }
    return actions;
  }, []);

  // Escalate method
  const escalate = useCallback((error: FixiaError) => {
    // Generate support message
    const supportMessage = `🆘 *Error en Fixia*\n\n` +
                          `Hola! Tengo un problema y necesito ayuda.\n\n` +
                          `📋 *Detalles del Error:*\n` +
                          `• Tipo: ${error.category}\n` +
                          `• Área: ${error.platformArea}\n` +
                          `• Usuario: ${error.userContext}\n` +
                          `• ID: ${error.id}\n\n` +
                          `📱 *Descripción:*\n${error.userMessage}\n\n` +
                          `¿Pueden ayudarme? Gracias!`;
    
    const whatsappUrl = `https://wa.me/5492965123456?text=${encodeURIComponent(supportMessage)}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  }, []);

  const contextValue: ErrorRecoveryContextType = {
    state,
    addError,
    removeError,
    clearErrors,
    reportGlobalError,
    getErrorRate,
    getFrustrationLevel,
    getUserFrustrationLevel,
    getRecommendedActions,
    shouldEscalateToSupport,
    escalate,
  };

  return (
    <ErrorRecoveryContext.Provider value={contextValue}>
      {children}
    </ErrorRecoveryContext.Provider>
  );
}

// Hook
export function useErrorRecovery() {
  const context = useContext(ErrorRecoveryContext);
  if (context === undefined) {
    throw new Error('useErrorRecovery must be used within an ErrorRecoveryProvider');
  }
  return context;
}