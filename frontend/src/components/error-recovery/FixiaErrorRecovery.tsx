/**
 * FixiaErrorRecovery - Context-Aware Error Recovery Component
 * Provides intelligent recovery suggestions and actions based on error context
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Wifi,
  WifiOff,
  Shield,
  CreditCard,
  Upload,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  CheckCircle,
  Clock,
  Settings,
  User,
  Search,
  Calendar,
  Camera,
  Loader2,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FixiaError, RecoveryStrategy, UserContext } from '@/types/errors';
import { FixiaSupportIntegration } from './FixiaSupportIntegration';

interface FixiaErrorRecoveryProps {
  error: FixiaError;
  
  // Recovery actions
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  onReload?: () => void;
  onContactSupport?: () => void;
  
  // State
  isRecovering?: boolean;
  
  // Configuration
  showTechnicalDetails?: boolean;
  compactMode?: boolean;
  
  // Custom recovery actions
  customActions?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    handler: () => void | Promise<void>;
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  }>;
}

export const FixiaErrorRecovery: React.FC<FixiaErrorRecoveryProps> = ({
  error,
  onRetry,
  onGoHome,
  onGoBack,
  onReload,
  onContactSupport,
  isRecovering = false,
  showTechnicalDetails = false,
  compactMode = false,
  customActions = [],
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(0);
  const [copiedErrorId, setCopiedErrorId] = useState(false);

  // Auto-retry logic for network errors
  useEffect(() => {
    if (error.category === 'network' && error.canAutoRecover && retryAttempts < 3) {
      const delay = Math.min(1000 * Math.pow(2, retryAttempts), 8000);
      setAutoRetryCountdown(Math.ceil(delay / 1000));
      
      const countdown = setInterval(() => {
        setAutoRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdown);
    }
  }, [error, retryAttempts]);

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1);
    onRetry?.();
  };

  const copyErrorId = async () => {
    try {
      await navigator.clipboard.writeText(error.id);
      setCopiedErrorId(true);
      setTimeout(() => setCopiedErrorId(false), 2000);
    } catch (err) {
      console.error('Failed to copy error ID:', err);
    }
  };

  // Get error icon based on category
  const getErrorIcon = () => {
    const iconProps = { className: "h-12 w-12", strokeWidth: 1.5 };
    
    switch (error.category) {
      case 'network':
        return navigator.onLine ? <Wifi {...iconProps} /> : <WifiOff {...iconProps} />;
      case 'authentication':
        return <Shield {...iconProps} />;
      case 'payment':
        return <CreditCard {...iconProps} />;
      case 'file_upload':
        return <Upload {...iconProps} />;
      case 'chat':
        return <MessageCircle {...iconProps} />;
      case 'booking':
        return <Calendar {...iconProps} />;
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  // Get color scheme based on error severity
  const getColorScheme = () => {
    switch (error.severity) {
      case 'critical':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          button: 'bg-red-500 hover:bg-red-600',
        };
      case 'high':
        return {
          border: 'border-orange-500/30',
          bg: 'bg-orange-500/20',
          text: 'text-orange-400',
          button: 'bg-orange-500 hover:bg-orange-600',
        };
      case 'medium':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          button: 'bg-yellow-500 hover:bg-yellow-600',
        };
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          button: 'bg-blue-500 hover:bg-blue-600',
        };
    }
  };

  // Generate context-specific recovery actions
  const getRecoveryActions = () => {
    const actions: Array<{
      id: string;
      label: string;
      icon: React.ReactNode;
      handler: () => void;
      variant: 'primary' | 'secondary' | 'outline' | 'destructive';
      description?: string;
    }> = [];

    // Primary action based on error type
    if (error.recoveryStrategy.includes('retry') && onRetry) {
      actions.push({
        id: 'retry',
        label: autoRetryCountdown > 0 ? `Reintentando en ${autoRetryCountdown}s` : 'Intentar de nuevo',
        icon: isRecovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />,
        handler: handleRetry,
        variant: 'primary',
        description: 'Volver a intentar la acción que falló',
      });
    }

    // Reload page for client errors
    if (error.recoveryStrategy.includes('reload') && onReload) {
      actions.push({
        id: 'reload',
        label: 'Recargar página',
        icon: <RefreshCw className="h-4 w-4" />,
        handler: onReload,
        variant: 'secondary',
        description: 'Recargar completamente la página',
      });
    }

    // Navigation actions
    if (error.recoveryStrategy.includes('redirect')) {
      if (onGoBack) {
        actions.push({
          id: 'go_back',
          label: 'Volver atrás',
          icon: <ArrowLeft className="h-4 w-4" />,
          handler: onGoBack,
          variant: 'outline',
          description: 'Regresar a la página anterior',
        });
      }
      
      if (onGoHome) {
        actions.push({
          id: 'go_home',
          label: error.userContext === 'as' ? 'Ir al Panel AS' : 'Ir al Dashboard',
          icon: <Home className="h-4 w-4" />,
          handler: onGoHome,
          variant: 'outline',
          description: 'Ir a la página principal',
        });
      }
    }

    // Support contact
    if (error.recoveryStrategy.includes('contact_support')) {
      actions.push({
        id: 'contact_support',
        label: 'Contactar soporte',
        icon: <HelpCircle className="h-4 w-4" />,
        handler: () => setSupportVisible(true),
        variant: 'outline',
        description: 'Obtener ayuda de nuestro equipo',
      });
    }

    return actions;
  };

  // Generate context-specific suggestions
  const getContextSuggestions = () => {
    const suggestions: string[] = [];
    
    if (error.category === 'network') {
      suggestions.push('Verifica tu conexión WiFi o datos móviles');
      suggestions.push('Intenta cambiar de red si es posible');
      if (error.userContext === 'as') {
        suggestions.push('Para profesionales AS: Una buena conexión es crucial para recibir solicitudes');
      }
    }
    
    if (error.category === 'authentication') {
      suggestions.push('Verifica que tu email y contraseña sean correctos');
      suggestions.push('Si olvidaste tu contraseña, puedes restablecerla');
      if (error.userContext === 'as') {
        suggestions.push('Como profesional AS, mantén tu sesión activa para no perder oportunidades');
      }
    }
    
    if (error.category === 'file_upload') {
      suggestions.push('Verifica que el archivo sea menor a 5MB');
      suggestions.push('Formatos permitidos: JPG, PNG, PDF');
      if (error.platformArea === 'portfolio') {
        suggestions.push('Fotos de alta calidad mejoran tu perfil profesional');
      }
    }
    
    if (error.category === 'booking') {
      if (error.userContext === 'explorador') {
        suggestions.push('El horario puede haberse tomado mientras escribías');
        suggestions.push('Prueba con otros horarios disponibles');
        suggestions.push('Contacta directamente al profesional por chat');
      } else {
        suggestions.push('Verifica tu disponibilidad en el calendario');
        suggestions.push('Responde rápido a las solicitudes para no perderlas');
      }
    }
    
    if (error.category === 'payment') {
      suggestions.push('Verifica los datos de tu tarjeta');
      suggestions.push('Asegúrate de tener fondos suficientes');
      suggestions.push('Prueba con MercadoPago o transferencia bancaria');
    }

    return suggestions;
  };

  const colors = getColorScheme();
  const recoveryActions = getRecoveryActions();
  const contextSuggestions = getContextSuggestions();

  if (compactMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-medium rounded-lg p-4 border ${colors.border} ${colors.bg}`}
      >
        <div className="flex items-center space-x-3">
          <div className={colors.text}>
            {getErrorIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">{error.userMessage}</h3>
            <div className="flex space-x-2 mt-2">
              {recoveryActions.slice(0, 2).map((action) => (
                <Button
                  key={action.id}
                  onClick={action.handler}
                  size="sm"
                  variant={action.variant}
                  disabled={isRecovering || autoRetryCountdown > 0}
                  className="text-xs"
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`glass-medium rounded-2xl p-8 border ${colors.border} ${colors.bg}`}
      >
        {/* Error Icon and Title */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className={`${colors.text} mx-auto mb-4`}
          >
            {getErrorIcon()}
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {error.severity === 'critical' ? '¡Ups! Algo importante falló' : 
             error.severity === 'high' ? 'Tenemos un problema' :
             error.severity === 'medium' ? 'Algo no funcionó bien' :
             'Error temporal'}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-white/80 text-lg leading-relaxed max-w-lg mx-auto"
          >
            {error.userMessage}
          </motion.p>
        </div>

        {/* Context Suggestions */}
        {contextSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <h3 className="text-white font-medium mb-3 flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Sugerencias:
            </h3>
            <ul className="space-y-2">
              {contextSuggestions.map((suggestion, index) => (
                <li key={index} className="text-white/70 text-sm flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Recovery Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="space-y-3 mb-6"
        >
          {recoveryActions.map((action, index) => (
            <Button
              key={action.id}
              onClick={action.handler}
              variant={action.variant}
              disabled={isRecovering || autoRetryCountdown > 0}
              className={`w-full h-12 text-base font-medium transition-all duration-200 ${
                action.variant === 'primary' ? colors.button : ''
              }`}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
              {action.description && (
                <span className="ml-auto text-xs opacity-70">{action.description}</span>
              )}
            </Button>
          ))}

          {/* Custom Actions */}
          {customActions.map((action, index) => (
            <Button
              key={action.id}
              onClick={action.handler}
              variant={action.variant || 'outline'}
              className="w-full h-12 text-base font-medium"
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </motion.div>

        {/* Error Details Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="border-t border-white/10 pt-4"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-white/60 hover:text-white/80 transition-colors"
          >
            <span className="text-sm">Detalles técnicos</span>
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                {/* Error ID */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-white/80 text-sm font-medium">ID del Error</p>
                    <p className="text-white/60 text-xs font-mono">{error.id}</p>
                  </div>
                  <Button
                    onClick={copyErrorId}
                    size="sm"
                    variant="outline"
                    className="ml-2"
                  >
                    {copiedErrorId ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Error Category and Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/80 text-sm font-medium">Categoría</p>
                    <p className="text-white/60 text-xs">{error.category}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/80 text-sm font-medium">Código</p>
                    <p className="text-white/60 text-xs font-mono">{error.code}</p>
                  </div>
                </div>

                {/* Technical Details */}
                {showTechnicalDetails && error.technicalDetails && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/80 text-sm font-medium mb-2">Detalles Técnicos</p>
                    <pre className="text-white/60 text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.technicalDetails}
                    </pre>
                  </div>
                )}

                {/* Platform Context */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/80 text-sm font-medium">Usuario</p>
                    <p className="text-white/60 text-xs">{error.userContext}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/80 text-sm font-medium">Área</p>
                    <p className="text-white/60 text-xs">{error.platformArea}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/80 text-sm font-medium">Gravedad</p>
                    <p className="text-white/60 text-xs">{error.severity}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Support Integration Modal */}
      <AnimatePresence>
        {supportVisible && (
          <FixiaSupportIntegration
            error={error}
            onClose={() => setSupportVisible(false)}
            onContactInitiated={() => {
              setSupportVisible(false);
              onContactSupport?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};