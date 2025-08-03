import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';

interface ProgressIndicatorProps {
  title: string;
  description: string;
  current: number;
  max: number;
  type?: 'progress' | 'status' | 'goal';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  showNumber?: boolean;
  actionText?: string;
  onActionClick?: () => void;
}

export function ProgressIndicator({
  title,
  description,
  current,
  max,
  type = 'progress',
  color = 'blue',
  showNumber = true,
  actionText,
  onActionClick
}: ProgressIndicatorProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  const colors = {
    blue: {
      bg: 'bg-blue-500/20',
      bar: 'bg-blue-500',
      text: 'text-blue-400',
      icon: 'text-blue-400'
    },
    green: {
      bg: 'bg-green-500/20',
      bar: 'bg-green-500',
      text: 'text-green-400',
      icon: 'text-green-400'
    },
    orange: {
      bg: 'bg-orange-500/20',
      bar: 'bg-orange-500',
      text: 'text-orange-400',
      icon: 'text-orange-400'
    },
    red: {
      bg: 'bg-red-500/20',
      bar: 'bg-red-500',
      text: 'text-red-400',
      icon: 'text-red-400'
    },
    purple: {
      bg: 'bg-purple-500/20',
      bar: 'bg-purple-500',
      text: 'text-purple-400',
      icon: 'text-purple-400'
    }
  };

  const getIcon = () => {
    if (type === 'status') {
      if (percentage >= 100) return <CheckCircle className={`h-6 w-6 ${colors[color].icon}`} />;
      if (percentage >= 50) return <Clock className={`h-6 w-6 ${colors[color].icon}`} />;
      return <AlertCircle className={`h-6 w-6 ${colors[color].icon}`} />;
    }
    return <Circle className={`h-6 w-6 ${colors[color].icon}`} />;
  };

  const getStatusText = () => {
    if (type === 'status') {
      if (percentage >= 100) return 'Completado';
      if (percentage >= 75) return 'Casi listo';
      if (percentage >= 50) return 'En progreso';
      return 'Pendiente';
    }
    if (type === 'goal') {
      if (percentage >= 100) return '¡Meta alcanzada!';
      if (percentage >= 75) return 'Muy cerca';
      if (percentage >= 50) return 'Buen progreso';
      return 'Recién empezando';
    }
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-medium rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <h3 className="text-white font-medium text-lg">{title}</h3>
            <p className="text-white/70 text-sm">{description}</p>
          </div>
        </div>
        {showNumber && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${colors[color].text}`}>
              {current}
              {max > 0 && (
                <span className="text-white/50 text-lg">
                  /{max}
                </span>
              )}
            </div>
            {type !== 'progress' && (
              <div className="text-white/60 text-sm">
                {getStatusText()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {max > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>{getStatusText()}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className={`w-full h-3 ${colors[color].bg} rounded-full overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${colors[color].bar} rounded-full relative`}
            >
              {/* Animated shine effect */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3,
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-sm font-medium"
        >
          {actionText}
        </button>
      )}

      {/* Helpful Tips */}
      {type === 'goal' && percentage < 50 && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-100 text-sm">
            💡 <strong>Tip:</strong> Agregar más trabajos y fotos te ayuda a conseguir más clientes
          </p>
        </div>
      )}

      {type === 'status' && percentage < 100 && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-orange-100 text-sm">
            ⏰ <strong>Pendiente:</strong> Completar tu perfil te da más confianza con los clientes
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Simple metric card for basic numbers
interface SimpleMetricProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
}

export function SimpleMetric({
  title,
  value,
  description,
  icon,
  color = 'blue',
  trend
}: SimpleMetricProps) {
  const colors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    purple: 'text-purple-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-medium rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className={`p-2 rounded-lg bg-white/10 ${colors[color]}`}>
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-white/80 text-sm font-medium">{title}</h3>
            {description && (
              <p className="text-white/60 text-xs">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-bold ${colors[color]}`}>
          {value}
        </div>
        
        {trend && (
          <div className={`text-sm flex items-center space-x-1 ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-white/60">{trend.period}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}