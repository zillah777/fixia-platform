import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Wifi, 
  RefreshCw, 
  Phone, 
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleErrorProps {
  type?: 'network' | 'permission' | 'validation' | 'server' | 'notFound' | 'success';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  showSupport?: boolean;
  className?: string;
}

const errorMessages = {
  network: {
    title: 'Sin conexión a internet',
    message: 'Parece que no tienes conexión. Revisa tu WiFi o datos móviles e intenta de nuevo.',
    icon: <Wifi className="h-12 w-12" />,
    actionText: 'Intentar de nuevo',
    color: 'orange'
  },
  permission: {
    title: 'No tienes permisos',
    message: 'No puedes hacer esta acción. Si crees que es un error, contactanos.',
    icon: <AlertCircle className="h-12 w-12" />,
    actionText: 'Contactar soporte',
    color: 'red'
  },
  validation: {
    title: 'Revisa los datos',
    message: 'Algunos datos no están bien. Revisa los campos marcados en rojo y corrige.',
    icon: <AlertCircle className="h-12 w-12" />,
    actionText: 'Revisar formulario',
    color: 'orange'
  },
  server: {
    title: 'Algo salió mal',
    message: 'Hubo un problema en nuestros servidores. Ya estamos trabajando para solucionarlo.',
    icon: <RefreshCw className="h-12 w-12" />,
    actionText: 'Intentar de nuevo',
    color: 'red'
  },
  notFound: {
    title: 'No encontrado',
    message: 'Lo que buscas no existe o fue eliminado. Verifica la dirección.',
    icon: <AlertCircle className="h-12 w-12" />,
    actionText: 'Volver al inicio',
    color: 'gray'
  },
  success: {
    title: '¡Perfecto!',
    message: 'Todo salió bien. Ya puedes continuar.',
    icon: <CheckCircle className="h-12 w-12" />,
    actionText: 'Continuar',
    color: 'green'
  }
};

export function SimpleError({
  type = 'server',
  title,
  message,
  actionText,
  onAction,
  showSupport = true,
  className = ''
}: SimpleErrorProps) {
  const errorConfig = errorMessages[type];
  
  const displayTitle = title || errorConfig.title;
  const displayMessage = message || errorConfig.message;
  const displayActionText = actionText || errorConfig.actionText;

  const colorClasses = {
    orange: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      button: 'bg-orange-500 hover:bg-orange-600'
    },
    red: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      button: 'bg-red-500 hover:bg-red-600'
    },
    green: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      button: 'bg-green-500 hover:bg-green-600'
    },
    gray: {
      bg: 'bg-gray-500/20',
      border: 'border-gray-500/30',
      text: 'text-gray-400',
      button: 'bg-gray-500 hover:bg-gray-600'
    }
  };

  const colors = colorClasses[errorConfig.color as keyof typeof colorClasses] || colorClasses.red;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-medium rounded-xl p-8 border ${colors.border} ${colors.bg} text-center ${className}`}
    >
      {/* Icon */}
      <div className={`${colors.text} mx-auto mb-6`}>
        {errorConfig.icon}
      </div>

      {/* Title and Message */}
      <h3 className="text-xl font-semibold text-white mb-3">
        {displayTitle}
      </h3>
      <p className="text-white/80 mb-6 leading-relaxed max-w-md mx-auto">
        {displayMessage}
      </p>

      {/* Action Button */}
      <div className="space-y-4">
        {onAction && (
          <Button
            onClick={onAction}
            className={`${colors.button} text-white px-6 py-3 font-medium transition-all duration-200`}
          >
            {displayActionText}
          </Button>
        )}

        {/* Support Options */}
        {showSupport && type !== 'success' && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/60 text-sm mb-3">
              ¿Sigues teniendo problemas?
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => window.open('https://wa.me/5492965123456', '_blank')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => window.open('tel:+5492965123456', '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Common error scenarios with preset configurations
export const CommonErrors = {
  // Network related
  NoInternet: (onRetry?: () => void) => (
    <SimpleError
      type="network"
      {...(onRetry && { onAction: onRetry })}
    />
  ),

  // Form validation
  FormValidation: (message?: string, onFix?: () => void) => (
    <SimpleError
      type="validation"
      message={message || "Revisa los campos marcados en rojo. Asegúrate de completar toda la información requerida."}
      {...(onFix && { onAction: onFix })}
      actionText="Revisar formulario"
    />
  ),

  // Server errors
  ServerError: (onRetry?: () => void) => (
    <SimpleError
      type="server"
      message="Hubo un problema con nuestros servidores. Por favor intenta de nuevo en unos minutos."
      {...(onRetry && { onAction: onRetry })}
    />
  ),

  // Permission errors
  NoPermission: (onContact?: () => void) => (
    <SimpleError
      type="permission"
      message="No tienes los permisos necesarios para esta acción. Si crees que es un error, contáctanos."
      {...(onContact && { onAction: onContact })}
      actionText="Contactar soporte"
    />
  ),

  // Not found
  NotFound: (onGoHome?: () => void) => (
    <SimpleError
      type="notFound"
      message="La página o contenido que buscas no existe o fue eliminado."
      {...(onGoHome && { onAction: onGoHome })}
      actionText="Ir al inicio"
    />
  ),

  // Success messages
  Success: (message?: string, onContinue?: () => void) => (
    <SimpleError
      type="success"
      message={message || "¡Excelente! La acción se completó correctamente."}
      {...(onContinue && { onAction: onContinue })}
      showSupport={false}
    />
  )
};

// Hook for handling common errors
export function useSimpleErrorHandler() {
  const handleError = (error: any): JSX.Element => {
    // Network errors
    if (!navigator.onLine || error.code === 'NETWORK_ERROR') {
      return CommonErrors.NoInternet();
    }

    // 404 errors
    if (error.status === 404) {
      return CommonErrors.NotFound();
    }

    // 403/401 errors
    if (error.status === 403 || error.status === 401) {
      return CommonErrors.NoPermission();
    }

    // Validation errors
    if (error.status === 422 || error.type === 'validation') {
      return CommonErrors.FormValidation(error.message);
    }

    // Default server error
    return CommonErrors.ServerError();
  };

  const handleSuccess = (message?: string, onContinue?: () => void): JSX.Element => {
    return CommonErrors.Success(message, onContinue);
  };

  return { handleError, handleSuccess };
}