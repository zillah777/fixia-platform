/**
 * ErrorRecoveryContext - Global Error Recovery Provider
 * Provides centralized error recovery management across the entire application
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  FixiaError, 
  UserContext, 
  PlatformArea, 
  ErrorRecoveryConfig,
  ERROR_CONFIGS 
} from '@/types/errors';
import { FixiaErrorRecovery } from '@/components/error-recovery/FixiaErrorRecovery';
import { FixiaNetworkError } from '@/components/error-recovery/FixiaNetworkError';
import { FixiaAuthError } from '@/components/error-recovery/FixiaAuthError';
import { FixiaPaymentError } from '@/components/error-recovery/FixiaPaymentError';

interface ErrorRecoveryState {
  globalError: FixiaError | null;
  isGlobalRecovering: boolean;
  errorHistory: Array<{
    error: FixiaError;
    timestamp: Date;
    resolved: boolean;
    resolutionMethod?: string;
  }>;
  offlineMode: boolean;
  connectionStatus: 'online' | 'offline' | 'slow' | 'unstable';
  errorRate: number;
  userFrustrationLevel: number;
}

interface ErrorRecoveryContextValue {
  state: ErrorRecoveryState;
  
  // Global error management
  reportGlobalError: (error: FixiaError) => void;
  clearGlobalError: () => void;
  retryGlobalOperation: (customHandler?: () => Promise<void>) => Promise<boolean>;
  
  // Recovery strategies
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  escalateToSupport: (error: FixiaError) => void;
  
  // Analytics and monitoring
  getErrorRate: () => number;
  getUserFrustrationLevel: () => number;
  getRecommendedActions: (error: FixiaError) => string[];
  
  // Configuration
  updateRecoveryConfig: (userContext: UserContext, platformArea: PlatformArea, config: Partial<ErrorRecoveryConfig>) => void;
  getRecoveryConfig: (userContext: UserContext, platformArea: PlatformArea) => ErrorRecoveryConfig | null;
}

const ErrorRecoveryContext = createContext<ErrorRecoveryContextValue | null>(null);

interface ErrorRecoveryProviderProps {
  children: React.ReactNode;
  
  // Configuration
  enableGlobalErrorUI?: boolean;
  enableOfflineSupport?: boolean;
  enableAnalytics?: boolean;
  
  // Callbacks
  onGlobalError?: (error: FixiaError) => void;
  onRecoverySuccess?: (error: FixiaError, method: string) => void;
  onRecoveryFailure?: (error: FixiaError, attempts: number) => void;
  onSupportEscalation?: (error: FixiaError) => void;
}

export const ErrorRecoveryProvider: React.FC<ErrorRecoveryProviderProps> = ({
  children,
  enableGlobalErrorUI = true,
  enableOfflineSupport = true,
  enableAnalytics = true,
  onGlobalError,
  onRecoverySuccess,
  onRecoveryFailure,
  onSupportEscalation,
}) => {
  const [state, setState] = useState<ErrorRecoveryState>({
    globalError: null,
    isGlobalRecovering: false,
    errorHistory: [],
    offlineMode: false,
    connectionStatus: 'online',
    errorRate: 0,
    userFrustrationLevel: 0,
  });

  const recoveryConfigsRef = useRef<Map<string, ErrorRecoveryConfig>>(new Map());
  const errorCountRef = useRef(0);
  const successCountRef = useRef(0);
  const frustrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize recovery configurations
  useEffect(() => {
    Object.entries(ERROR_CONFIGS).forEach(([key, config]) => {
      recoveryConfigsRef.current.set(key, config as ErrorRecoveryConfig);
    });
  }, []);

  // Monitor connection status
  useEffect(() => {
    if (!enableOfflineSupport) return;

    const handleOnline = () => {
      setState(prev => ({ ...prev, connectionStatus: 'online' }));
      
      // Auto-disable offline mode when connection is restored
      if (state.offlineMode) {
        disableOfflineMode();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, connectionStatus: 'offline' }));
      
      // Auto-enable offline mode
      if (enableOfflineSupport) {
        enableOfflineMode();
      }
    };

    const updateConnectionSpeed = () => {
      const connection = (navigator as any)?.connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setState(prev => ({ ...prev, connectionStatus: 'slow' }));
        } else if (connection.rtt > 500 || connection.downlink < 1) {
          setState(prev => ({ ...prev, connectionStatus: 'unstable' }));
        } else {
          setState(prev => ({ ...prev, connectionStatus: 'online' }));
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ((navigator as any)?.connection) {
      (navigator as any).connection.addEventListener('change', updateConnectionSpeed);
      updateConnectionSpeed(); // Initial check
    }

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ((navigator as any)?.connection) {
        (navigator as any).connection.removeEventListener('change', updateConnectionSpeed);
      }
    };
  }, [enableOfflineSupport, state.offlineMode]);

  // Calculate error rate
  const calculateErrorRate = useCallback(() => {
    const total = errorCountRef.current + successCountRef.current;
    return total > 0 ? errorCountRef.current / total : 0;
  }, []);

  // Calculate user frustration level
  const calculateFrustrationLevel = useCallback(() => {
    const recentErrors = state.errorHistory.filter(
      entry => Date.now() - entry.timestamp.getTime() < 300000 // 5 minutes
    );
    
    const consecutiveErrors = recentErrors.filter(entry => !entry.resolved).length;
    const criticalErrors = recentErrors.filter(
      entry => entry.error.severity === 'critical'
    ).length;
    
    // Scale from 0-100
    let frustrationLevel = 0;
    frustrationLevel += consecutiveErrors * 15;
    frustrationLevel += criticalErrors * 25;
    frustrationLevel += Math.min(recentErrors.length * 5, 50);
    
    return Math.min(frustrationLevel, 100);
  }, [state.errorHistory]);

  // Update analytics
  useEffect(() => {
    if (!enableAnalytics) return;

    const errorRate = calculateErrorRate();
    const frustrationLevel = calculateFrustrationLevel();
    
    setState(prev => ({
      ...prev,
      errorRate,
      userFrustrationLevel: frustrationLevel,
    }));

    // Auto-escalate if frustration level is high
    if (frustrationLevel > 70 && state.globalError) {
      escalateToSupport(state.globalError);
    }
  }, [state.errorHistory, enableAnalytics, calculateErrorRate, calculateFrustrationLevel, state.globalError]);

  // Report global error
  const reportGlobalError = useCallback((error: FixiaError) => {
    errorCountRef.current += 1;
    
    setState(prev => ({
      ...prev,
      globalError: error,
      errorHistory: [
        ...prev.errorHistory.slice(-19), // Keep last 20 errors
        {
          error,
          timestamp: new Date(),
          resolved: false,
        },
      ],
    }));

    // Increase frustration level
    if (frustrationTimerRef.current) {
      clearTimeout(frustrationTimerRef.current);
    }
    
    frustrationTimerRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        userFrustrationLevel: Math.min(prev.userFrustrationLevel + 10, 100),
      }));
    }, 5000);

    // Report to analytics
    if (enableAnalytics && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error_reported', {
        error_category: error.category,
        error_severity: error.severity,
        user_context: error.userContext,
        platform_area: error.platformArea,
        error_id: error.id,
      });
    }

    // Trigger callback
    if (onGlobalError) {
      onGlobalError(error);
    }
  }, [enableAnalytics, onGlobalError]);

  // Clear global error
  const clearGlobalError = useCallback(() => {
    successCountRef.current += 1;
    
    setState(prev => {
      const updatedHistory = prev.errorHistory.map((entry, index) => 
        index === prev.errorHistory.length - 1 
          ? { ...entry, resolved: true, resolutionMethod: 'manual_clear' }
          : entry
      );
      
      return {
        ...prev,
        globalError: null,
        isGlobalRecovering: false,
        errorHistory: updatedHistory,
      };
    });

    // Reduce frustration level
    setState(prev => ({
      ...prev,
      userFrustrationLevel: Math.max(prev.userFrustrationLevel - 20, 0),
    }));
  }, []);

  // Retry global operation
  const retryGlobalOperation = useCallback(async (customHandler?: () => Promise<void>): Promise<boolean> => {
    if (!state.globalError || state.isGlobalRecovering) return false;

    setState(prev => ({ ...prev, isGlobalRecovering: true }));

    try {
      if (customHandler) {
        await customHandler();
      } else {
        // Default retry - reload page
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }

      // Success
      successCountRef.current += 1;
      
      setState(prev => {
        const updatedHistory = prev.errorHistory.map((entry, index) => 
          index === prev.errorHistory.length - 1 
            ? { ...entry, resolved: true, resolutionMethod: 'retry_success' }
            : entry
        );
        
        return {
          ...prev,
          globalError: null,
          isGlobalRecovering: false,
          errorHistory: updatedHistory,
          userFrustrationLevel: Math.max(prev.userFrustrationLevel - 30, 0),
        };
      });

      if (onRecoverySuccess && state.globalError) {
        onRecoverySuccess(state.globalError, 'retry');
      }

      return true;
    } catch (retryError) {
      errorCountRef.current += 1;
      
      setState(prev => ({
        ...prev,
        isGlobalRecovering: false,
        userFrustrationLevel: Math.min(prev.userFrustrationLevel + 15, 100),
      }));

      if (onRecoveryFailure && state.globalError) {
        onRecoveryFailure(state.globalError, (state.globalError.retryCount || 0) + 1);
      }

      return false;
    }
  }, [state.globalError, state.isGlobalRecovering, onRecoverySuccess, onRecoveryFailure]);

  // Enable offline mode
  const enableOfflineMode = useCallback(() => {
    setState(prev => ({ ...prev, offlineMode: true }));
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('fixia_offline_mode', 'true');
      localStorage.setItem('fixia_offline_timestamp', new Date().toISOString());
    }
  }, []);

  // Disable offline mode
  const disableOfflineMode = useCallback(() => {
    setState(prev => ({ ...prev, offlineMode: false }));
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fixia_offline_mode');
      localStorage.removeItem('fixia_offline_timestamp');
    }
  }, []);

  // Escalate to support
  const escalateToSupport = useCallback((error: FixiaError) => {
    // Mark error as escalated
    setState(prev => {
      const updatedHistory = prev.errorHistory.map(entry => 
        entry.error.id === error.id 
          ? { ...entry, resolutionMethod: 'escalated_to_support' }
          : entry
      );
      
      return {
        ...prev,
        errorHistory: updatedHistory,
      };
    });

    // Generate support message
    const supportMessage = encodeURIComponent(
      `🆘 *Error Escalado en Fixia*\n\n` +
      `ERROR CRÍTICO: ${error.category}\n` +
      `Nivel de frustración: ${state.userFrustrationLevel}%\n` +
      `Tasa de errores: ${(state.errorRate * 100).toFixed(1)}%\n` +
      `Errores recientes: ${state.errorHistory.filter(e => !e.resolved).length}\n\n` +
      `📋 *Detalles:*\n` +
      `• ID: ${error.id}\n` +
      `• Área: ${error.platformArea}\n` +
      `• Usuario: ${error.userContext}\n` +
      `• Gravedad: ${error.severity}\n\n` +
      `📱 *Descripción:*\n${error.userMessage}\n\n` +
      `⚡ *URGENTE* - Usuario necesita asistencia inmediata`
    );

    // Open WhatsApp with escalated message
    window.open(`https://wa.me/5492965123456?text=${supportMessage}`, '_blank');

    // Trigger callback
    if (onSupportEscalation) {
      onSupportEscalation(error);
    }
  }, [state.userFrustrationLevel, state.errorRate, state.errorHistory, onSupportEscalation]);

  // Get error rate
  const getErrorRate = useCallback(() => {
    return calculateErrorRate();
  }, [calculateErrorRate]);

  // Get user frustration level
  const getUserFrustrationLevel = useCallback(() => {
    return calculateFrustrationLevel();
  }, [calculateFrustrationLevel]);

  // Get recommended actions
  const getRecommendedActions = useCallback((error: FixiaError): string[] => {
    const actions: string[] = [];
    
    // Based on error category
    if (error.category === 'network' && state.connectionStatus === 'offline') {
      actions.push('Verificar conexión a internet');
      actions.push('Activar modo sin conexión');
    }
    
    if (error.category === 'payment') {
      actions.push('Verificar datos de la tarjeta');
      actions.push('Probar método de pago alternativo');
      actions.push('Contactar al banco');
    }
    
    // Based on frustration level
    if (state.userFrustrationLevel > 50) {
      actions.push('Contactar soporte para asistencia personal');
    }
    
    // Based on error rate
    if (state.errorRate > 0.3) {
      actions.push('Recargar la página completamente');
      actions.push('Limpiar caché del navegador');
    }
    
    // Context-specific recommendations
    if (error.userContext === 'as' && error.platformArea === 'portfolio') {
      actions.push('Verificar formato y tamaño de imagen');
      actions.push('Comprobar conexión estable para subidas');
    }
    
    return actions;
  }, [state.connectionStatus, state.userFrustrationLevel, state.errorRate]);

  // Update recovery config
  const updateRecoveryConfig = useCallback((
    userContext: UserContext, 
    platformArea: PlatformArea, 
    config: Partial<ErrorRecoveryConfig>
  ) => {
    const key = `${userContext}_${platformArea}`;
    const existingConfig = recoveryConfigsRef.current.get(key) || {} as ErrorRecoveryConfig;
    const updatedConfig = { ...existingConfig, ...config };
    recoveryConfigsRef.current.set(key, updatedConfig);
  }, []);

  // Get recovery config
  const getRecoveryConfig = useCallback((
    userContext: UserContext, 
    platformArea: PlatformArea
  ): ErrorRecoveryConfig | null => {
    const key = `${userContext}_${platformArea}`;
    return recoveryConfigsRef.current.get(key) || null;
  }, []);

  // Render error-specific components
  const renderErrorComponent = () => {
    if (!state.globalError || !enableGlobalErrorUI) return null;

    const commonProps = {
      onRetry: () => retryGlobalOperation(),
      onGoHome: () => {
        if (typeof window !== 'undefined') {
          const homeUrl = state.globalError?.userContext === 'as' ? '/as/dashboard' : 
                         state.globalError?.userContext === 'explorador' ? '/explorador/dashboard' : '/';
          window.location.href = homeUrl;
        }
      },
      onContactSupport: () => escalateToSupport(state.globalError!),
      isRecovering: state.isGlobalRecovering,
    };

    switch (state.globalError.category) {
      case 'network':
        return (
          <FixiaNetworkError
            error={state.globalError as any}
            onRetry={commonProps.onRetry}
            onOfflineMode={enableOfflineMode}
            enableAutoRetry={true}
            showConnectionDetails={true}
          />
        );
        
      case 'authentication':
        return (
          <FixiaAuthError
            error={state.globalError as any}
            onRetry={commonProps.onRetry}
            onCancel={clearGlobalError}
            enableQuickLogin={true}
            showRegistrationOption={true}
          />
        );
        
      case 'payment':
        return (
          <FixiaPaymentError
            error={state.globalError as any}
            onRetry={commonProps.onRetry}
            onContactSupport={commonProps.onContactSupport}
            showAlternativeMethods={true}
            enableRefund={true}
          />
        );
        
      default:
        return (
          <FixiaErrorRecovery
            error={state.globalError}
            {...commonProps}
            showTechnicalDetails={state.userFrustrationLevel > 70}
            compactMode={false}
          />
        );
    }
  };

  const contextValue: ErrorRecoveryContextValue = {
    state,
    reportGlobalError,
    clearGlobalError,
    retryGlobalOperation,
    enableOfflineMode,
    disableOfflineMode,
    escalateToSupport,
    getErrorRate,
    getUserFrustrationLevel,
    getRecommendedActions,
    updateRecoveryConfig,
    getRecoveryConfig,
  };

  return (
    <ErrorRecoveryContext.Provider value={contextValue}>
      {children}
      
      {/* Global Error UI */}
      <AnimatePresence>
        {state.globalError && enableGlobalErrorUI && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            {renderErrorComponent()}
          </div>
        )}
      </AnimatePresence>
      
      {/* Offline Mode Indicator */}
      {state.offlineMode && (
        <div className="fixed top-4 right-4 z-40 glass-medium border border-orange-500/30 bg-orange-500/20 rounded-lg px-4 py-2">
          <p className="text-orange-400 text-sm font-medium">
            Modo Sin Conexión
          </p>
        </div>
      )}
    </ErrorRecoveryContext.Provider>
  );
};

// Hook to use error recovery context
export const useErrorRecovery = (): ErrorRecoveryContextValue => {
  const context = useContext(ErrorRecoveryContext);
  if (!context) {
    throw new Error('useErrorRecovery must be used within an ErrorRecoveryProvider');
  }
  return context;
};

// HOC to wrap components with error recovery
export const withErrorRecovery = <P extends object>(
  Component: React.ComponentType<P>,
  config?: {
    userContext?: UserContext;
    platformArea?: PlatformArea;
    enableLocalRecovery?: boolean;
  }
) => {
  const WrappedComponent = (props: P) => {
    const { reportGlobalError } = useErrorRecovery();
    
    // Error boundary for the wrapped component
    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        const error = new Error(event.message);
        const contextualError = {
          id: `wrapped_${Date.now()}`,
          category: 'client' as const,
          severity: 'medium' as const,
          code: 'CLIENT_ERROR',
          message: event.message,
          userMessage: 'Ocurrió un error en la aplicación. Intenta recargar la página.',
          userContext: config?.userContext || 'guest' as const,
          platformArea: config?.platformArea || 'dashboard' as const,
          timestamp: new Date().toISOString(),
          originalError: error,
          recoveryStrategy: ['reload', 'retry'] as const,
          canAutoRecover: false,
          escalationLevel: 1,
        };
        
        reportGlobalError(contextualError);
      };
      
      window.addEventListener('error', handleError);
      
      return () => {
        window.removeEventListener('error', handleError);
      };
    }, [reportGlobalError]);
    
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withErrorRecovery(${Component.displayName || Component.name})`;
  return WrappedComponent;
};