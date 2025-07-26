'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';

// 🎨 FIXIA ANIMATIONS - Microinteractions & Loading States
// Componentes de animación para el sistema de diseño Fixia

// Loading Spinner Component
interface FixiaLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const FixiaLoadingSpinner = React.forwardRef<HTMLDivElement, FixiaLoadingSpinnerProps>(
  ({ size = 'md', variant = 'primary', className }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const variantClasses = {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      white: 'text-white'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          className
        )}
      >
        <Loader2 
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )} 
        />
      </div>
    );
  }
);

// Skeleton Loader Component
interface FixiaSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  animated?: boolean;
}

const FixiaSkeleton = React.forwardRef<HTMLDivElement, FixiaSkeletonProps>(
  ({ className, lines = 1, avatar = false, animated = true }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {avatar && (
          <div className={cn(
            'rounded-full bg-fixia-surface-border w-12 h-12',
            animated && 'animate-pulse'
          )} />
        )}
        
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-fixia-surface-border rounded',
              animated && 'animate-pulse',
              i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    );
  }
);

// Skeleton Card Component
const FixiaCardSkeleton = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <div ref={ref} className={cn('fixia-card', className)}>
        <div className="fixia-card-body">
          <FixiaSkeleton avatar lines={3} />
        </div>
      </div>
    );
  }
);

// Fade In Animation Component
interface FixiaFadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

const FixiaFadeIn: React.FC<FixiaFadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 300,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
    >
      {children}
    </div>
  );
};

// Stagger Animation Component
interface FixiaStaggerProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

const FixiaStagger: React.FC<FixiaStaggerProps> = ({ 
  children, 
  delay = 100,
  className 
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FixiaFadeIn 
          key={index} 
          delay={index * delay}
        >
          {child}
        </FixiaFadeIn>
      ))}
    </div>
  );
};

// Toast Notification Component
interface FixiaToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  visible?: boolean;
}

const FixiaToast = React.forwardRef<HTMLDivElement, FixiaToastProps>(
  ({ type, title, message, duration = 5000, onClose, visible = true }, ref) => {
    const [isVisible, setIsVisible] = useState(visible);

    useEffect(() => {
      if (visible && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [visible, duration, onClose]);

    const typeConfig = {
      success: {
        icon: <Check className="w-5 h-5" />,
        bgClass: 'bg-success-50 border-success-200',
        iconClass: 'text-success-500',
        titleClass: 'text-success-800',
        messageClass: 'text-success-600'
      },
      error: {
        icon: <X className="w-5 h-5" />,
        bgClass: 'bg-error-50 border-error-200',
        iconClass: 'text-error-500',
        titleClass: 'text-error-800',
        messageClass: 'text-error-600'
      },
      warning: {
        icon: <AlertCircle className="w-5 h-5" />,
        bgClass: 'bg-warning-50 border-warning-200',
        iconClass: 'text-warning-500',
        titleClass: 'text-warning-800',
        messageClass: 'text-warning-600'
      },
      info: {
        icon: <AlertCircle className="w-5 h-5" />,
        bgClass: 'bg-info-50 border-info-200',
        iconClass: 'text-info-500',
        titleClass: 'text-info-800',
        messageClass: 'text-info-600'
      }
    };

    const config = typeConfig[type];

    return (
      <div
        ref={ref}
        className={cn(
          'fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300',
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
        <div className={cn(
          'rounded-xl border p-4 shadow-lg backdrop-blur-sm',
          config.bgClass
        )}>
          <div className="flex items-start">
            <div className={cn('flex-shrink-0', config.iconClass)}>
              {config.icon}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={cn('text-sm font-medium', config.titleClass)}>
                {title}
              </h3>
              {message && (
                <p className={cn('mt-1 text-sm', config.messageClass)}>
                  {message}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
              }}
              className={cn(
                'ml-4 inline-flex flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.iconClass
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// Progress Bar Component
interface FixiaProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success';
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

const FixiaProgress = React.forwardRef<HTMLDivElement, FixiaProgressProps>(
  ({ 
    value, 
    max = 100, 
    size = 'md', 
    variant = 'primary',
    animated = true,
    showLabel = false,
    className 
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };

    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
      secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
      success: 'bg-gradient-to-r from-success-500 to-success-600'
    };

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {showLabel && (
          <div className="flex justify-between text-sm text-fixia-text-secondary mb-2">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn(
          'w-full bg-fixia-surface-border rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              variantClasses[variant],
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

// Floating Action Button Component
interface FixiaFABProps {
  icon: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  position?: 'bottom-right' | 'bottom-left';
  onClick?: () => void;
  className?: string;
}

const FixiaFAB = React.forwardRef<HTMLButtonElement, FixiaFABProps>(
  ({ 
    icon, 
    label, 
    size = 'md', 
    variant = 'primary',
    position = 'bottom-right',
    onClick,
    className 
  }, ref) => {
    const sizeClasses = {
      sm: 'w-12 h-12',
      md: 'w-14 h-14',
      lg: 'w-16 h-16'
    };

    const iconSizeClasses = {
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-7 h-7'
    };

    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white',
      secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white',
      accent: 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white'
    };

    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6'
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'z-50 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          positionClasses[position],
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        aria-label={label}
      >
        <div className="flex items-center justify-center">
          <span className={iconSizeClasses[size]}>
            {icon}
          </span>
        </div>
      </button>
    );
  }
);

// Pulse Dot Component (for online status, notifications, etc.)
interface FixiaPulseDotProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'success' | 'warning' | 'error' | 'primary';
  animated?: boolean;
  className?: string;
}

const FixiaPulseDot = React.forwardRef<HTMLDivElement, FixiaPulseDotProps>(
  ({ size = 'md', color = 'success', animated = true, className }, ref) => {
    const sizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    };

    const colorClasses = {
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      primary: 'bg-primary-500'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full relative',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
      >
        {animated && (
          <div className={cn(
            'absolute inset-0 rounded-full animate-ping',
            colorClasses[color],
            'opacity-75'
          )} />
        )}
      </div>
    );
  }
);

FixiaLoadingSpinner.displayName = 'FixiaLoadingSpinner';
FixiaSkeleton.displayName = 'FixiaSkeleton';
FixiaCardSkeleton.displayName = 'FixiaCardSkeleton';
FixiaToast.displayName = 'FixiaToast';
FixiaProgress.displayName = 'FixiaProgress';
FixiaFAB.displayName = 'FixiaFAB';
FixiaPulseDot.displayName = 'FixiaPulseDot';

export {
  FixiaLoadingSpinner,
  FixiaSkeleton,
  FixiaCardSkeleton,
  FixiaFadeIn,
  FixiaStagger,
  FixiaToast,
  FixiaProgress,
  FixiaFAB,
  FixiaPulseDot
};

export type {
  FixiaLoadingSpinnerProps,
  FixiaSkeletonProps,
  FixiaFadeInProps,
  FixiaStaggerProps,
  FixiaToastProps,
  FixiaProgressProps,
  FixiaFABProps,
  FixiaPulseDotProps
};