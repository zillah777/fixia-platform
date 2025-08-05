/**
 * FixiaErrorBoundary - Intelligent Error Boundary with Context Awareness
 * Captures errors with full context and provides intelligent recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Bug,
  Wifi,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FixiaError, UserContext, PlatformArea, ErrorCategory } from '@/types/errors';
import { FixiaErrorRecovery } from './FixiaErrorRecovery';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  contextualError: FixiaError | null;
  retryCount: number;
  isRecovering: boolean;
}

interface FixiaErrorBoundaryProps {
  children: ReactNode;
  
  // Context information
  userContext?: UserContext;
  platformArea?: PlatformArea;
  userId?: number;
  
  // Boundary configuration
  fallbackComponent?: React.ComponentType<{ error: FixiaError; retry: () => void }>;
  enableAutoRecovery?: boolean;
  maxAutoRetries?: number;
  
  // Recovery callbacks
  onError?: (error: FixiaError) => void;
  onRecovery?: (successful: boolean) => void;
  onEscalation?: (error: FixiaError) => void;
  
  // UI configuration
  showTechnicalDetails?: boolean;
  compactMode?: boolean;
  
  // Analytics
  enableErrorTracking?: boolean;
  errorGroup?: string;
}

export class FixiaErrorBoundary extends Component<FixiaErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private errorId: string = '';

  constructor(props: FixiaErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      contextualError: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create contextual error object
    const contextualError = this.createContextualError(error, errorInfo);
    
    this.setState({
      errorInfo,
      contextualError,
    });

    // Report error to analytics and monitoring
    this.reportError(contextualError);
    
    // Trigger error callback
    if (this.props.onError) {
      this.props.onError(contextualError);
    }

    // Auto-recovery attempt if enabled
    if (this.props.enableAutoRecovery && this.shouldAttemptAutoRecovery(contextualError)) {
      this.scheduleAutoRecovery();
    }
  }

  private createContextualError(error: Error, errorInfo: ErrorInfo): FixiaError {
    const userContext = this.detectUserContext();
    const platformArea = this.props.platformArea || this.detectPlatformArea();
    const category = this.categorizeError(error);
    
    return {
      id: this.errorId,
      category,
      severity: this.determineSeverity(error, category),
      code: this.generateErrorCode(error, category),
      message: error.message,
      userMessage: this.generateUserMessage(error, category, userContext),
      technicalDetails: this.generateTechnicalDetails(error, errorInfo),
      
      // Context
      userContext,
      platformArea,
      userId: this.props.userId,
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      
      // Error specifics
      originalError: error,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      
      // Recovery information
      recoveryStrategy: this.determineRecoveryStrategies(error, category),
      retryCount: this.state.retryCount,
      maxRetries: this.props.maxAutoRetries || 3,
      canAutoRecover: this.canAutoRecover(error, category),
      
      // Support integration
      escalationLevel: this.determineEscalationLevel(error, category),
      
      // Analytics
      errorGroup: this.props.errorGroup || this.generateErrorGroup(error),
      fingerprint: this.generateFingerprint(error),
      metadata: this.collectMetadata(),
    };
  }

  private detectUserContext(): UserContext {
    if (this.props.userContext) return this.props.userContext;
    
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/as/')) return 'as';
      if (pathname.startsWith('/explorador/')) return 'explorador';
      if (pathname.startsWith('/auth/')) return 'guest';
    }
    
    return 'guest';
  }

  private detectPlatformArea(): PlatformArea {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      
      if (pathname.includes('/dashboard')) return 'dashboard';
      if (pathname.includes('/servicios') || pathname.includes('/services')) return 'services';
      if (pathname.includes('/portafolio') || pathname.includes('/portfolio')) return 'portfolio';
      if (pathname.includes('/chat')) return 'chat';
      if (pathname.includes('/pago') || pathname.includes('/payment')) return 'payments';
      if (pathname.includes('/perfil') || pathname.includes('/profile')) return 'profile';
      if (pathname.includes('/auth') || pathname.includes('/login')) return 'authentication';
      if (pathname.includes('/buscar') || pathname.includes('/search')) return 'search';
      if (pathname.includes('/marketplace')) return 'marketplace';
      if (pathname.includes('/calificaciones') || pathname.includes('/reviews')) return 'reviews';
      if (pathname.includes('/configuracion') || pathname.includes('/config')) return 'configuration';
      if (pathname.includes('/verificacion') || pathname.includes('/verification')) return 'verification';
    }
    
    return 'dashboard';
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('connection') || name.includes('networkerror')) {
      return 'network';
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('token') || 
        message.includes('session') || message.includes('login')) {
      return 'authentication';
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('forbidden') || 
        message.includes('unauthorized')) {
      return 'authorization';
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('required') || 
        message.includes('invalid')) {
      return 'validation';
    }
    
    // Payment errors
    if (message.includes('payment') || message.includes('mercadopago') || 
        message.includes('transaction')) {
      return 'payment';
    }
    
    // File upload errors
    if (message.includes('upload') || message.includes('file') || 
        message.includes('image')) {
      return 'file_upload';
    }
    
    // Chat errors
    if (message.includes('chat') || message.includes('message') || 
        message.includes('websocket')) {
      return 'chat';
    }
    
    // Booking errors
    if (message.includes('booking') || message.includes('reservation') || 
        message.includes('solicitud')) {
      return 'booking';
    }
    
    // Check for client vs server errors
    if (name.includes('referenceerror') || name.includes('typeerror') || 
        name.includes('syntaxerror')) {
      return 'client';
    }
    
    return 'server';
  }

  private determineSeverity(error: Error, category: ErrorCategory): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors that break core functionality
    if (category === 'payment' || category === 'authentication') {
      return 'critical';
    }
    
    // High severity for important features
    if (category === 'booking' || category === 'file_upload') {
      return 'high';
    }
    
    // Medium for UX impacting but non-blocking
    if (category === 'chat' || category === 'validation') {
      return 'medium';
    }
    
    // Low for recoverable issues
    return 'low';
  }

  private generateUserMessage(error: Error, category: ErrorCategory, userContext: UserContext): string {
    const contextMessages = {
      network: 'No hay conexión a internet. Revisa tu WiFi o datos móviles e intenta de nuevo.',
      authentication: 'Hubo un problema con tu sesión. Necesitas iniciar sesión de nuevo.',
      authorization: 'No tienes permisos para hacer esta acción. Si es un error, contáctanos.',
      validation: 'Algunos datos no están correctos. Revisa los campos marcados e intenta de nuevo.',
      payment: 'Hubo un problema procesando el pago. Tu dinero está seguro, intenta de nuevo.',
      file_upload: 'Error subiendo el archivo. Verifica que sea del formato correcto e intenta de nuevo.',
      chat: 'Problema enviando el mensaje. Verifica tu conexión e intenta de nuevo.',
      booking: 'Error procesando tu solicitud. Puede que el horario ya no esté disponible.',
      server: 'Algo salió mal en nuestros servidores. Ya estamos trabajando para solucionarlo.',
      client: 'Hubo un problema técnico. Recarga la página e intenta de nuevo.',
      unknown: 'Ocurrió un error inesperado. Intenta de nuevo o contáctanos si persiste.',
    };

    let baseMessage = contextMessages[category];
    
    // Add context-specific messaging
    if (userContext === 'as') {
      if (category === 'file_upload') {
        baseMessage = 'Error subiendo la imagen al portafolio. Verifica que sea JPG o PNG y menor a 5MB.';
      } else if (category === 'booking') {
        baseMessage = 'Error procesando la solicitud del cliente. Revisa tu conexión e intenta de nuevo.';
      }
    } else if (userContext === 'explorador') {
      if (category === 'booking') {
        baseMessage = 'Error enviando tu solicitud. El profesional puede estar ocupado, intenta más tarde.';
      }
    }
    
    return baseMessage;
  }

  private determineRecoveryStrategies(error: Error, category: ErrorCategory): string[] {
    const strategies: Record<ErrorCategory, string[]> = {
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
  }

  private canAutoRecover(error: Error, category: ErrorCategory): boolean {
    const autoRecoverableCategories: ErrorCategory[] = [
      'network', 'server', 'chat'
    ];
    
    return autoRecoverableCategories.includes(category);
  }

  private shouldAttemptAutoRecovery(error: FixiaError): boolean {
    return error.canAutoRecover && 
           error.retryCount < (error.maxRetries || 3) &&
           error.severity !== 'critical';
  }

  private scheduleAutoRecovery(): void {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff
    
    this.retryTimeout = setTimeout(() => {
      this.handleRetry(true);
    }, delay);
  }

  private handleRetry = (isAutomatic = false): void => {
    this.setState({ isRecovering: true });

    // Clear the error state to re-render children
    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        contextualError: null,
        retryCount: prevState.retryCount + 1,
        isRecovering: false,
      }));

      // Trigger recovery callback
      if (this.props.onRecovery) {
        this.props.onRecovery(true);
      }
    }, 300);
  };

  private handleGoHome = (): void => {
    const userContext = this.detectUserContext();
    const homeUrl = userContext === 'as' ? '/as/dashboard' : 
                   userContext === 'explorador' ? '/explorador/dashboard' : '/';
    
    if (typeof window !== 'undefined') {
      window.location.href = homeUrl;
    }
  };

  private handleGoBack = (): void => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleContactSupport = (): void => {
    const { contextualError } = this.state;
    
    if (this.props.onEscalation && contextualError) {
      this.props.onEscalation(contextualError);
    }
    
    // Open WhatsApp with error context
    const message = encodeURIComponent(
      `Hola! Tengo un problema en Fixia.\n\n` +
      `Error: ${contextualError?.userMessage}\n` +
      `Área: ${contextualError?.platformArea}\n` +
      `ID: ${contextualError?.id}\n\n` +
      `¿Pueden ayudarme?`
    );
    
    window.open(`https://wa.me/5492965123456?text=${message}`, '_blank');
  };

  // Utility methods for error reporting and analytics
  private generateErrorCode(error: Error, category: ErrorCategory): string {
    const timestamp = Date.now().toString(36);
    const categoryCode = category.toUpperCase().substr(0, 3);
    const errorHash = error.message.length.toString(36);
    
    return `FIX_${categoryCode}_${errorHash}_${timestamp}`;
  }

  private generateTechnicalDetails(error: Error, errorInfo: ErrorInfo): string {
    return `Error: ${error.name}: ${error.message}\n\n` +
           `Stack: ${error.stack}\n\n` +
           `Component Stack: ${errorInfo.componentStack}`;
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('fixia_session_id') || 'unknown';
    }
    return 'unknown';
  }

  private determineEscalationLevel(error: Error, category: ErrorCategory): number {
    if (category === 'payment' || category === 'authentication') return 3; // Immediate phone support
    if (category === 'booking' || category === 'authorization') return 2; // Chat support
    if (category === 'validation' || category === 'file_upload') return 1; // Self-service
    return 0; // Auto-recovery
  }

  private generateErrorGroup(error: Error): string {
    return `${error.name}_${this.props.platformArea || 'unknown'}`;
  }

  private generateFingerprint(error: Error): string {
    const content = `${error.name}_${error.message}_${this.props.platformArea}`;
    return btoa(content).substr(0, 16);
  }

  private collectMetadata(): Record<string, any> {
    const metadata: Record<string, any> = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      retryCount: this.state.retryCount,
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
  }

  private reportError(error: FixiaError): void {
    if (!this.props.enableErrorTracking) return;

    // Report to Sentry (if available)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error.originalError, {
        tags: {
          errorCategory: error.category,
          userContext: error.userContext,
          platformArea: error.platformArea,
        },
        extra: {
          contextualError: error,
        },
      });
    }

    // Custom analytics reporting
    console.error('Fixia Error Boundary:', error);
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError && this.state.contextualError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return <FallbackComponent error={this.state.contextualError} retry={this.handleRetry} />;
      }

      // Use FixiaErrorRecovery component for full recovery UI
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="error-boundary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"
          >
            <FixiaErrorRecovery
              error={this.state.contextualError}
              onRetry={this.handleRetry}
              onGoHome={this.handleGoHome}
              onGoBack={this.handleGoBack}
              onReload={this.handleReload}
              onContactSupport={this.handleContactSupport}
              isRecovering={this.state.isRecovering}
              showTechnicalDetails={this.props.showTechnicalDetails}
              compactMode={this.props.compactMode}
            />
          </motion.div>
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}

// HOC for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<FixiaErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <FixiaErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </FixiaErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}