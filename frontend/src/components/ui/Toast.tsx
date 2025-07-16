import React, { useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/helpers';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-accent-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-error-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-primary-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-primary-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-accent-50 border-accent-200 text-accent-800';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-800';
      default:
        return 'bg-primary-50 border-primary-200 text-primary-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 min-w-[300px] max-w-md',
        getStyles()
      )}
      role="alert"
      aria-live="polite"
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar notificación"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;