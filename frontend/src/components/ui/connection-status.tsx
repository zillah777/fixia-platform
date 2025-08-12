'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizedWebSocket } from '@/contexts/OptimizedWebSocketContext';
import { Badge } from './badge';
import { Button } from './button';

interface ConnectionStatusProps {
  className?: string;
  variant?: 'minimal' | 'detailed' | 'floating';
  showStats?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function ConnectionStatus({ 
  className, 
  variant = 'minimal', 
  showStats = false,
  autoHide = false,
  autoHideDelay = 3000 
}: ConnectionStatusProps) {
  const { 
    isConnected, 
    connectionQuality, 
    reconnectAttempts, 
    lastActivity,
    reconnect,
    getLatency,
    getConnectionStats
  } = useOptimizedWebSocket();
  
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(!autoHide);
  
  // Auto-hide logic for good connections
  useEffect(() => {
    if (autoHide && isConnected && connectionQuality === 'excellent') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    } else if (!autoHide || !isConnected || connectionQuality !== 'excellent') {
      setIsVisible(true);
    }
    
    // Always return a cleanup function to satisfy TypeScript
    return () => {};
  }, [autoHide, isConnected, connectionQuality, autoHideDelay]);

  const getStatusConfig = () => {
    if (!isConnected) {
      return {
        color: 'destructive',
        icon: WifiOff,
        text: reconnectAttempts > 0 ? `Reconnectando... (${reconnectAttempts})` : 'Desconectado',
        bgClass: 'bg-red-500/10 border-red-500/20',
        textClass: 'text-red-400',
        iconClass: 'text-red-400'
      };
    }
    
    switch (connectionQuality) {
      case 'excellent':
        return {
          color: 'success',
          icon: CheckCircle,
          text: `Excelente (${getLatency()}ms)`,
          bgClass: 'bg-green-500/10 border-green-500/20',
          textClass: 'text-green-400',
          iconClass: 'text-green-400'
        };
      case 'good':
        return {
          color: 'warning',
          icon: Activity,
          text: `Bueno (${getLatency()}ms)`,
          bgClass: 'bg-yellow-500/10 border-yellow-500/20',
          textClass: 'text-yellow-400',
          iconClass: 'text-yellow-400'
        };
      case 'poor':
        return {
          color: 'warning',
          icon: AlertTriangle,
          text: `Lento (${getLatency()}ms)`,
          bgClass: 'bg-orange-500/10 border-orange-500/20',
          textClass: 'text-orange-400',
          iconClass: 'text-orange-400'
        };
      case 'disconnected':
      default:
        return {
          color: 'secondary' as const,
          icon: Wifi,
          text: 'Conectando...',
          bgClass: 'bg-gray-500/10 border-gray-500/20',
          textClass: 'text-gray-400',
          iconClass: 'text-gray-400'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const stats = showStats ? getConnectionStats() : null;

  if (!isVisible) return null;

  // Minimal variant - just a status indicator
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn(
          'flex items-center space-x-2 px-3 py-1.5 rounded-full border backdrop-blur-md',
          statusConfig.bgClass,
          className
        )}
      >
        <StatusIcon className={cn('h-3 w-3', statusConfig.iconClass)} />
        <span className={cn('text-xs font-medium', statusConfig.textClass)}>
          {statusConfig.text}
        </span>
      </motion.div>
    );
  }

  // Floating variant - bottom right corner
  if (variant === 'floating') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: 50 }}
          className={cn(
            'fixed bottom-4 right-4 z-50 glass-strong rounded-xl border border-white/10 p-4 shadow-lg',
            className
          )}
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              statusConfig.bgClass
            )}>
              <StatusIcon className={cn('h-4 w-4', statusConfig.iconClass)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                Conexión {isConnected ? statusConfig.text : 'Perdida'}
              </p>
              
              {lastActivity && (
                <p className="text-xs text-white/60 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Última actividad: {new Date(lastActivity).toLocaleTimeString()}
                  </span>
                </p>
              )}
              
              {!isConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={reconnect}
                  className="mt-2 h-7 text-xs"
                >
                  Reconectar
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Detailed variant - full status with stats
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-light rounded-xl border border-white/10 p-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg',
            statusConfig.bgClass
          )}>
            <StatusIcon className={cn('h-5 w-5', statusConfig.iconClass)} />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-white">
                Estado de Conexión
              </h3>
              <Badge variant={statusConfig.color as any} className="text-xs">
                {statusConfig.text}
              </Badge>
            </div>
            
            {lastActivity && (
              <p className="text-xs text-white/60 mt-1">
                Última actividad: {new Date(lastActivity).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isConnected && (
            <Button
              size="sm"
              variant="outline"
              onClick={reconnect}
              className="h-8 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Reconectar
            </Button>
          )}
          
          {showStats && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="h-8 text-xs"
            >
              {showDetails ? 'Ocultar' : 'Detalles'}
            </Button>
          )}
        </div>
      </div>

      {/* Connection Statistics */}
      <AnimatePresence>
        {showDetails && stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Tiempo conectado:</span>
                  <span className="text-white font-mono">
                    {Math.floor(stats.uptime / 60000)}m {Math.floor((stats.uptime % 60000) / 1000)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Mensajes:</span>
                  <span className="text-white font-mono">{stats.messagesCount}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Latencia promedio:</span>
                  <span className="text-white font-mono">{stats.averageLatency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Reconexiones:</span>
                  <span className="text-white font-mono">{stats.reconnectCount}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}