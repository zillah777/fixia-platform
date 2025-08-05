/**
 * FixiaNetworkError - Intelligent Network Error Handler
 * Provides exponential backoff, offline detection, and network-specific recovery options
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalLow, 
  SignalMedium,
  RefreshCw, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Globe,
  Smartphone,
  Router,
  Zap,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NetworkError } from '@/types/errors';

interface NetworkErrorProps {
  error: NetworkError;
  onRetry: () => Promise<void>;
  onOfflineMode?: () => void;
  maxRetries?: number;
  enableAutoRetry?: boolean;
  showConnectionDetails?: boolean;
}

interface ConnectionInfo {
  online: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export const FixiaNetworkError: React.FC<NetworkErrorProps> = ({
  error,
  onRetry,
  onOfflineMode,
  maxRetries = 5,
  enableAutoRetry = true,
  showConnectionDetails = false,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(error.retryCount || 0);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(0);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [lastRetryTime, setLastRetryTime] = useState<Date | null>(null);
  const [estimatedRecoveryTime, setEstimatedRecoveryTime] = useState(0);
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor network connection
  useEffect(() => {
    const updateConnectionInfo = () => {
      const connection = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
      
      setConnectionInfo({
        online: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
      });
    };

    const handleOnline = () => {
      updateConnectionInfo();
      // Auto-retry when coming back online
      if (enableAutoRetry && retryCount < maxRetries) {
        setTimeout(() => handleRetry(), 1000);
      }
    };

    const handleOffline = () => {
      updateConnectionInfo();
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      setAutoRetryCountdown(0);
    };

    // Initial connection check
    updateConnectionInfo();

    // Listen for connection changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ((navigator as any)?.connection) {
      (navigator as any).connection.addEventListener('change', updateConnectionInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ((navigator as any)?.connection) {
        (navigator as any).connection.removeEventListener('change', updateConnectionInfo);
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (connectionCheckRef.current) {
        clearTimeout(connectionCheckRef.current);
      }
    };
  }, [retryCount, maxRetries, enableAutoRetry]);

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (enableAutoRetry && 
        connectionInfo?.online && 
        retryCount < maxRetries && 
        !isRetrying &&
        autoRetryCountdown === 0) {
      
      const delay = calculateRetryDelay(retryCount);
      setEstimatedRecoveryTime(delay);
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
  }, [connectionInfo?.online, retryCount, maxRetries, enableAutoRetry, isRetrying]);

  const calculateRetryDelay = (attempt: number): number => {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const backoffMultiplier = 2;
    const jitter = Math.random() * 0.3; // 30% jitter
    
    const delay = Math.min(
      baseDelay * Math.pow(backoffMultiplier, attempt),
      maxDelay
    );
    
    return Math.floor(delay * (1 + jitter));
  };

  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    setLastRetryTime(new Date());
    
    try {
      await onRetry();
      // If retry succeeds, the error component will be unmounted
    } catch (error) {
      console.error('Retry failed:', error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOfflineMode = () => {
    if (onOfflineMode) {
      onOfflineMode();
    } else {
      // Default offline behavior - cache current state
      console.log('Entering offline mode');
    }
  };

  const getConnectionIcon = () => {
    if (!connectionInfo?.online) {
      return <WifiOff className="h-8 w-8 text-red-400" />;
    }
    
    if (connectionInfo.effectiveType === '4g' || connectionInfo.downlink > 10) {
      return <Signal className="h-8 w-8 text-green-400" />;
    } else if (connectionInfo.effectiveType === '3g' || connectionInfo.downlink > 1) {
      return <SignalMedium className="h-8 w-8 text-yellow-400" />;
    } else {
      return <SignalLow className="h-8 w-8 text-orange-400" />;
    }
  };

  const getConnectionStatusText = () => {
    if (!connectionInfo?.online) {
      return 'Sin conexión a internet';
    }
    
    if (connectionInfo.effectiveType === '4g' || connectionInfo.downlink > 10) {
      return 'Conexión excelente';
    } else if (connectionInfo.effectiveType === '3g' || connectionInfo.downlink > 1) {
      return 'Conexión moderada';
    } else {
      return 'Conexión lenta';
    }
  };

  const getNetworkTips = () => {
    const tips: string[] = [];
    
    if (!connectionInfo?.online) {
      tips.push('Verifica que tu WiFi esté conectado');
      tips.push('Revisa si tienes datos móviles activados');
      tips.push('Intenta moverte a una zona con mejor señal');
    } else if (connectionInfo.effectiveType === '2g' || connectionInfo.downlink < 1) {
      tips.push('Tu conexión es lenta, ten paciencia');
      tips.push('Considera cambiar de WiFi a datos móviles o viceversa');
      tips.push('Acércate al router WiFi si es posible');
    } else if (connectionInfo.connectionType === 'cellular') {
      tips.push('Estás usando datos móviles');
      tips.push('Verifica que tengas suficiente saldo');
      tips.push('Considera conectarte a WiFi para ahorrar datos');
    }
    
    return tips;
  };

  const canRetry = retryCount < maxRetries && !isRetrying;
  const shouldShowOfflineMode = !connectionInfo?.online || connectionInfo.effectiveType === '2g';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-medium rounded-xl p-6 border border-orange-500/30 bg-orange-500/20 max-w-md mx-auto"
    >
      {/* Connection Status Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mb-4"
        >
          {getConnectionIcon()}
        </motion.div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          Problema de Conexión
        </h3>
        
        <p className="text-white/80 text-sm mb-1">
          {getConnectionStatusText()}
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
          <span>Estado:</span>
          <span className={`px-2 py-1 rounded-full ${
            connectionInfo?.online ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {connectionInfo?.online ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
      </div>

      {/* Connection Details */}
      {showConnectionDetails && connectionInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
        >
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Detalles de Conexión
          </h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/60">Tipo:</span>
              <div className="text-white flex items-center">
                {connectionInfo.connectionType === 'wifi' ? 
                  <Wifi className="h-4 w-4 mr-1" /> : 
                  <Smartphone className="h-4 w-4 mr-1" />
                }
                {connectionInfo.connectionType}
              </div>
            </div>
            
            <div>
              <span className="text-white/60">Velocidad:</span>
              <div className="text-white">{connectionInfo.effectiveType}</div>
            </div>
            
            {connectionInfo.downlink > 0 && (
              <div>
                <span className="text-white/60">Bajada:</span>
                <div className="text-white">{connectionInfo.downlink.toFixed(1)} Mbps</div>
              </div>
            )}
            
            {connectionInfo.rtt > 0 && (
              <div>
                <span className="text-white/60">Latencia:</span>
                <div className="text-white">{connectionInfo.rtt}ms</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Network Tips */}
      {getNetworkTips().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          <h4 className="text-blue-400 font-medium mb-2 text-sm">
            Sugerencias:
          </h4>
          <ul className="space-y-1">
            {getNetworkTips().map((tip, index) => (
              <li key={index} className="text-white/70 text-xs flex items-start">
                <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Auto-retry countdown */}
      {autoRetryCountdown > 0 && enableAutoRetry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-white/80">
            <Clock className="h-4 w-4" />
            <span>Reintentando automáticamente en {autoRetryCountdown}s</span>
          </div>
          
          <div className="mt-2 w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-orange-400 h-2 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: autoRetryCountdown, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

      {/* Retry Information */}
      {retryCount > 0 && (
        <div className="mb-4 text-center text-sm text-white/60">
          <p>Intento {retryCount} de {maxRetries}</p>
          {lastRetryTime && (
            <p className="text-xs">
              Último intento: {lastRetryTime.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Manual Retry */}
        <Button
          onClick={handleRetry}
          disabled={!canRetry || autoRetryCountdown > 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Reintentando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              {autoRetryCountdown > 0 ? `Reintentando en ${autoRetryCountdown}s` : 'Intentar ahora'}
            </>
          )}
        </Button>

        {/* Offline Mode */}
        {shouldShowOfflineMode && onOfflineMode && (
          <Button
            onClick={handleOfflineMode}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            <WifiOff className="h-4 w-4 mr-2" />
            Modo Sin Conexión
          </Button>
        )}

        {/* Network Diagnostics */}
        <Button
          onClick={() => window.open('https://fast.com', '_blank')}
          variant="outline"
          size="sm"
          className="w-full border-white/20 text-white hover:bg-white/10 text-sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          Probar Velocidad de Internet
        </Button>
      </div>

      {/* Connection History */}
      {retryCount >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <p className="text-center text-white/60 text-xs mb-2">
            Múltiples intentos fallidos
          </p>
          <div className="text-center space-y-1">
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Recargar Página
            </Button>
          </div>
        </motion.div>
      )}

      {/* Error Details Footer */}
      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-white/40 text-xs">
          Error ID: {error.id.substr(-8)}
        </p>
        {error.lastSuccessfulRequest && (
          <p className="text-white/40 text-xs">
            Última conexión exitosa: {new Date(error.lastSuccessfulRequest).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};