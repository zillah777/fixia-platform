'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// 🎨 FIXIA BUTTON COMPONENT - "Trust Actions"
// Implementa el sistema de diseño Fixia con todas las variantes y efectos

interface FixiaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  effect?: 'lift' | 'scale' | 'glow' | 'none';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const FixiaButton = React.forwardRef<HTMLButtonElement, FixiaButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      effect = 'lift',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'fixia-btn';
    
    const variantClasses = {
      primary: 'fixia-btn-primary',
      secondary: 'fixia-btn-secondary', 
      outline: 'fixia-btn-outline',
      ghost: 'fixia-btn-ghost',
      accent: 'fixia-btn-accent'
    };
    
    const sizeClasses = {
      sm: 'fixia-btn-sm',
      md: '', // Default size
      lg: 'fixia-btn-lg',
      xl: 'fixia-btn-xl'
    };
    
    const effectClasses = {
      lift: 'fixia-btn-lift',
      scale: 'fixia-hover-scale',
      glow: 'fixia-hover-glow',
      none: ''
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          effectClasses[effect],
          fullWidth && 'w-full',
          loading && 'opacity-70 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        
        <span className="fixia-button-text">{children}</span>
        
        {rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

FixiaButton.displayName = 'FixiaButton';

export { FixiaButton };
export type { FixiaButtonProps };