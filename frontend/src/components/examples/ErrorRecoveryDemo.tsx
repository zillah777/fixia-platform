/**
 * Error Recovery System Demo
 * Comprehensive demonstration of all error recovery features
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Shield, 
  CreditCard, 
  Upload, 
  MessageCircle, 
  RefreshCw,
  Zap,
  Phone,
  Settings,
  Bug,
  TestTube,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Error Recovery System Imports
import { useContextualError, useNetworkError, usePaymentError, useAuthError, useFileUploadError } from '@/hooks/useContextualError';
import { useErrorRecovery } from '@/contexts/ErrorRecoveryContext';
import { FixiaErrorRecovery } from '@/components/error-recovery/FixiaErrorRecovery';
import { FixiaNetworkError } from '@/components/error-recovery/FixiaNetworkError';
import { FixiaAuthError } from '@/components/error-recovery/FixiaAuthError';
import { FixiaPaymentError } from '@/components/error-recovery/FixiaPaymentError';
import { FixiaSupportIntegration } from '@/components/error-recovery/FixiaSupportIntegration';

interface ErrorScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ReactNode;
  userContext: 'as' | 'explorador' | 'guest';
  platformArea: string;
  simulatedError: () => Error;
  customContext?: any;
}

export const ErrorRecoveryDemo: React.FC = () => {
  const { state: errorRecoveryState, reportGlobalError, getErrorRate, getUserFrustrationLevel, getRecommendedActions } = useErrorRecovery();
  
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [demoMode, setDemoMode] = useState<'manual' | 'automated'>('manual');

  // Different error recovery hooks for testing
  const [networkError, networkMethods] = useNetworkError({
    onError: (error) => console.log('Network error captured:', error),
    onRecovery: (success) => console.log('Network recovery:', success)
  });

  const [paymentError, paymentMethods] = usePaymentError({
    onError: (error) => console.log('Payment error captured:', error),
    onRecovery: (success) => console.log('Payment recovery:', success)
  });

  const [authError, authMethods] = useAuthError({
    onError: (error) => console.log('Auth error captured:', error),
    onRecovery: (success) => console.log('Auth recovery:', success)
  });

  const [fileUploadError, fileUploadMethods] = useFileUploadError({
    onError: (error) => console.log('File upload error captured:', error),
    onRecovery: (success) => console.log('File upload recovery:', success)
  });

  const [generalError, generalMethods] = useContextualError({
    userContext: 'as',
    platformArea: 'dashboard',
    enableAutoRecovery: true,
    onError: (error) => console.log('General error captured:', error),
    onRecovery: (success) => console.log('General recovery:', success)
  });

  // Error scenarios for testing
  const errorScenarios: ErrorScenario[] = [
    {
      id: 'network_offline',
      title: 'Conexión Perdida',
      description: 'Simula pérdida completa de conexión a internet',
      category: 'network',
      severity: 'high',
      icon: <WifiOff className="h-5 w-5" />,
      userContext: 'as',
      platformArea: 'portfolio',
      simulatedError: () => new Error('NetworkError: No internet connection'),
    },
    {
      id: 'network_slow',
      title: 'Conexión Lenta',
      description: 'Simula timeout por conexión muy lenta',
      category: 'network',
      severity: 'medium',
      icon: <Wifi className="h-5 w-5" />,
      userContext: 'explorador',
      platformArea: 'search',
      simulatedError: () => new Error('NetworkError: Request timeout - slow connection'),
    },
    {
      id: 'auth_session_expired',
      title: 'Sesión Expirada',
      description: 'Simula expiración de sesión de usuario',
      category: 'authentication',
      severity: 'critical',
      icon: <Shield className="h-5 w-5" />,
      userContext: 'as',
      platformArea: 'dashboard',
      simulatedError: () => new Error('AuthError: Session expired'),
      customContext: {
        authType: 'session',
        sessionExpired: true,
        canAutoRenew: true,
        requiresUserAction: true,
        redirectUrl: '/auth/login'
      }
    },
    {
      id: 'payment_card_declined',
      title: 'Tarjeta Rechazada',
      description: 'Simula rechazo de tarjeta de crédito',
      category: 'payment',
      severity: 'critical',
      icon: <CreditCard className="h-5 w-5" />,
      userContext: 'explorador',
      platformArea: 'payments',
      simulatedError: () => new Error('PaymentError: Card declined'),
      customContext: {
        paymentMethod: 'credit_card',
        amount: 5000,
        currency: 'ARS',
        alternativeMethods: ['mercadopago', 'bank_transfer'],
        canRetryPayment: true,
        mercadopagoErrorCode: 'cc_rejected_card_disabled'
      }
    },
    {
      id: 'payment_mercadopago_error',
      title: 'Error MercadoPago',
      description: 'Simula error específico de MercadoPago',
      category: 'payment',
      severity: 'high',
      icon: <CreditCard className="h-5 w-5" />,
      userContext: 'explorador',
      platformArea: 'payments',
      simulatedError: () => new Error('MercadoPago API Error: Service temporarily unavailable'),
      customContext: {
        paymentMethod: 'mercadopago',
        amount: 3500,
        currency: 'ARS',
        mercadopagoErrorCode: 'internal_error'
      }
    },
    {
      id: 'file_upload_size',
      title: 'Archivo Muy Grande',
      description: 'Simula error de archivo que excede el límite de tamaño',
      category: 'file_upload',
      severity: 'medium',
      icon: <Upload className="h-5 w-5" />,
      userContext: 'as',
      platformArea: 'portfolio',
      simulatedError: () => new Error('FileError: File size exceeds limit'),
      customContext: {
        fileName: 'portfolio-image.jpg',
        fileSize: 8 * 1024 * 1024, // 8MB
        fileType: 'image/jpeg',
        uploadType: 'portfolio_image',
        failureReason: 'size_limit',
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      }
    },
    {
      id: 'file_upload_format',
      title: 'Formato No Permitido',
      description: 'Simula error de formato de archivo no válido',
      category: 'file_upload',
      severity: 'low',
      icon: <Upload className="h-5 w-5" />,
      userContext: 'as',
      platformArea: 'portfolio',
      simulatedError: () => new Error('FileError: File type not allowed'),
      customContext: {
        fileName: 'document.pdf',
        fileSize: 2 * 1024 * 1024,
        fileType: 'application/pdf',
        uploadType: 'portfolio_image',
        failureReason: 'type_not_allowed',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      }
    },
    {
      id: 'chat_connection_lost',
      title: 'Chat Desconectado',
      description: 'Simula pérdida de conexión en chat en tiempo real',
      category: 'chat',
      severity: 'medium',
      icon: <MessageCircle className="h-5 w-5" />,
      userContext: 'explorador',
      platformArea: 'chat',
      simulatedError: () => new Error('ChatError: WebSocket connection lost'),
      customContext: {
        chatRoomId: 123,
        messageId: 'msg_456',
        chatType: 'real_time',
        connectionStatus: 'disconnected',
        canResendMessage: true
      }
    },
    {
      id: 'booking_conflict',
      title: 'Conflicto de Horario',
      description: 'Simula conflicto al reservar un horario ya ocupado',
      category: 'booking',
      severity: 'high',
      icon: <Settings className="h-5 w-5" />,
      userContext: 'explorador',
      platformArea: 'booking',
      simulatedError: () => new Error('BookingError: Time slot no longer available'),
      customContext: {
        bookingId: 789,
        serviceId: 101,
        bookingStage: 'confirmation',
        conflictReason: 'time_conflict',
        suggestedAlternatives: [
          { type: 'time', value: '2024-02-15T10:00:00Z', message: 'Disponible mañana a las 10:00' },
          { type: 'time', value: '2024-02-15T14:00:00Z', message: 'Disponible mañana a las 14:00' }
        ]
      }
    },
    {
      id: 'server_500',
      title: 'Error del Servidor',
      description: 'Simula error interno del servidor (500)',
      category: 'server',
      severity: 'high',
      icon: <AlertTriangle className="h-5 w-5" />,
      userContext: 'as',
      platformArea: 'services',
      simulatedError: () => new Error('ServerError: Internal server error (500)'),
    },
    {
      id: 'validation_form',
      title: 'Validación de Formulario',
      description: 'Simula errores de validación en formulario',
      category: 'validation',
      severity: 'low',
      icon: <Bug className="h-5 w-5" />,
      userContext: 'as',
      platformArea: 'profile',
      simulatedError: () => new Error('ValidationError: Required fields missing'),
      customContext: {
        fieldErrors: [
          { field: 'email', value: 'invalid-email', rule: 'email', message: 'El email no es válido' },
          { field: 'phone', value: '', rule: 'required', message: 'El teléfono es obligatorio' }
        ],
        formId: 'profile-form',
        canAutoCorrect: false
      }
    }
  ];

  // Simulate error scenario
  const simulateError = (scenario: ErrorScenario) => {
    setActiveScenario(scenario.id);
    
    const error = scenario.simulatedError();
    const contextualError = generalMethods.createContextualError(error, {
      category: scenario.category as any,
      severity: scenario.severity,
      userContext: scenario.userContext,
      platformArea: scenario.platformArea as any,
      userMessage: getContextualMessage(scenario.category, scenario.userContext),
      ...scenario.customContext
    });

    // Route to appropriate error handler
    switch (scenario.category) {
      case 'network':
        networkMethods.reportError(contextualError);
        break;
      case 'payment':
        paymentMethods.reportError(contextualError);
        break;
      case 'authentication':
        authMethods.reportError(contextualError);
        break;
      case 'file_upload':
        fileUploadMethods.reportError(contextualError);
        break;
      default:
        generalMethods.reportError(contextualError);
    }

    // Update test results
    setTestResults(prev => ({
      ...prev,
      [scenario.id]: {
        timestamp: new Date().toISOString(),
        error: contextualError,
        status: 'triggered'
      }
    }));
  };

  // Clear all errors
  const clearAllErrors = () => {
    networkMethods.clearError();
    paymentMethods.clearError();
    authMethods.clearError();
    fileUploadMethods.clearError();
    generalMethods.clearError();
    setActiveScenario(null);
  };

  // Get contextual message for error category
  const getContextualMessage = (category: string, userContext: string): string => {
    const messages: Record<string, Record<string, string>> = {
      network: {
        as: 'Problemas de conexión afectando tu panel AS. Verifica tu internet.',
        explorador: 'Sin conexión a internet. Revisa tu WiFi o datos móviles.',
        guest: 'No hay conexión a internet. Verifica tu conexión.'
      },
      payment: {
        as: 'Error procesando pago de comisión. Contacta soporte.',
        explorador: 'Problema procesando el pago. Tu dinero está seguro, intenta de nuevo.',
        guest: 'Error en el pago. Verifica los datos e intenta nuevamente.'
      },
      authentication: {
        as: 'Tu sesión AS expiró. Inicia sesión para continuar gestionando servicios.',
        explorador: 'Sesión expirada. Inicia sesión para continuar buscando servicios.',
        guest: 'Necesitas iniciar sesión para continuar.'
      }
    };

    return messages[category]?.[userContext] || 'Ocurrió un error inesperado.';
  };

  // Run automated test suite
  const runAutomatedTests = async () => {
    setDemoMode('automated');
    
    for (const scenario of errorScenarios) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      simulateError(scenario);
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearAllErrors();
    }
    
    setDemoMode('manual');
  };

  // Get current active error
  const getCurrentError = () => {
    if (networkError.error) return networkError.error;
    if (paymentError.error) return paymentError.error;
    if (authError.error) return authError.error;
    if (fileUploadError.error) return fileUploadError.error;
    if (generalError.error) return generalError.error;
    return null;
  };

  const currentError = getCurrentError();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-4">
            Sistema de Recuperación de Errores - Demo
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Demostración interactiva del sistema de manejo de errores contextual de Fixia con estrategias de recuperación inteligente.
          </p>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estado de Conexión</p>
                  <p className={`text-lg font-bold ${
                    errorRecoveryState.connectionStatus === 'online' ? 'text-green-400' :
                    errorRecoveryState.connectionStatus === 'slow' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {errorRecoveryState.connectionStatus === 'online' ? 'En línea' :
                     errorRecoveryState.connectionStatus === 'slow' ? 'Lenta' :
                     errorRecoveryState.connectionStatus === 'unstable' ? 'Inestable' :
                     'Sin conexión'}
                  </p>
                </div>
                <Wifi className={`h-8 w-8 ${
                  errorRecoveryState.connectionStatus === 'online' ? 'text-green-400' :
                  errorRecoveryState.connectionStatus === 'slow' ? 'text-yellow-400' :
                  'text-red-400'
                }`} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa de Errores</p>
                  <p className="text-lg font-bold text-orange-400">
                    {(getErrorRate() * 100).toFixed(1)}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nivel de Frustración</p>
                  <p className="text-lg font-bold text-red-400">
                    {getUserFrustrationLevel()}%
                  </p>
                </div>
                <Zap className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Errores Recientes</p>
                  <p className="text-lg font-bold text-blue-400">
                    {errorRecoveryState.errorHistory.length}
                  </p>
                </div>
                <Bug className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="glass border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="mr-2 h-5 w-5" />
              Panel de Control de Pruebas
            </CardTitle>
            <CardDescription>
              Controla las simulaciones de error y prueba diferentes escenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={runAutomatedTests}
                disabled={demoMode === 'automated'}
                className="liquid-gradient hover:opacity-90"
              >
                {demoMode === 'automated' ? (
                  <>
                    <StopCircle className="mr-2 h-4 w-4" />
                    Ejecutando Tests...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Ejecutar Tests Automáticos
                  </>
                )}
              </Button>

              <Button
                onClick={clearAllErrors}
                variant="outline"
                className="glass border-white/20"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Limpiar Errores
              </Button>

              <Button
                onClick={() => setShowSupportModal(true)}
                variant="outline"
                className="glass border-white/20"
              >
                <Phone className="mr-2 h-4 w-4" />
                Probar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {errorScenarios.map((scenario) => (
            <Card 
              key={scenario.id} 
              className={`glass border-white/10 hover:glass-medium transition-all duration-300 cursor-pointer ${
                activeScenario === scenario.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => simulateError(scenario)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      scenario.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      scenario.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      scenario.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {scenario.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{scenario.title}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {scenario.userContext} - {scenario.platformArea}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={`${
                    scenario.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    scenario.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    scenario.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  } border-0`}>
                    {scenario.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {scenario.description}
                </p>
                {testResults[scenario.id] && (
                  <div className="mt-2 text-xs text-green-400">
                    ✓ Probado: {new Date(testResults[scenario.id].timestamp).toLocaleTimeString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Error Display */}
        {currentError && (
          <Card className="glass border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-red-400">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Error Activo - {currentError.category}
              </CardTitle>
              <CardDescription>
                ID: {currentError.id} | Severidad: {currentError.severity}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Mensaje de Usuario:</Label>
                  <p className="text-white bg-white/5 p-3 rounded-lg mt-1">
                    {currentError.userMessage}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Estrategias de Recuperación:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentError.recoveryStrategy.map((strategy, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Acciones Recomendadas:</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                    {getRecommendedActions(currentError).map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label className="text-sm font-medium">Contexto Técnico:</Label>
                  <Textarea
                    value={JSON.stringify({
                      userContext: currentError.userContext,
                      platformArea: currentError.platformArea,
                      timestamp: currentError.timestamp,
                      metadata: currentError.metadata
                    }, null, 2)}
                    readOnly
                    className="glass border-white/20 text-xs font-mono mt-1"
                    rows={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error History */}
        {errorRecoveryState.errorHistory.length > 0 && (
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Historial de Errores</CardTitle>
              <CardDescription>
                Últimos errores registrados en esta sesión de demo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errorRecoveryState.errorHistory.slice(-10).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass-light rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        entry.resolved ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{entry.error.category} - {entry.error.severity}</p>
                        <p className="text-xs text-muted-foreground">{entry.error.userMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                      {entry.resolutionMethod && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {entry.resolutionMethod}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Modal */}
        {showSupportModal && currentError && (
          <FixiaSupportIntegration
            error={currentError}
            onClose={() => setShowSupportModal(false)}
            onContactInitiated={() => {
              setShowSupportModal(false);
              console.log('Support contact initiated');
            }}
          />
        )}
      </div>
    </div>
  );
};