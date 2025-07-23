import React from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outline' | 'filled' | 'glass' | 'interactive';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  hover = false,
  clickable = false,
  loading = false,
  header,
  footer,
  badge,
  onClick,
}) => {
  const baseStyles = `
    relative
    transition-all duration-200 ease-out
    ${clickable || onClick ? 'cursor-pointer' : ''}
    ${loading ? 'overflow-hidden' : ''}
  `;

  const variants = {
    default: `
      bg-white
      border border-neutral-200
      shadow-card hover:shadow-card-hover
      dark:bg-neutral-800 dark:border-neutral-700
    `,
    elevated: `
      bg-white
      shadow-lg hover:shadow-xl
      dark:bg-neutral-800
    `,
    outline: `
      bg-transparent
      border-2 border-neutral-200 hover:border-neutral-300
      dark:border-neutral-700 dark:hover:border-neutral-600
    `,
    filled: `
      bg-neutral-50 hover:bg-neutral-100
      border border-neutral-200
      dark:bg-neutral-900 dark:hover:bg-neutral-800
      dark:border-neutral-700
    `,
    glass: `
      bg-white/80 backdrop-blur-md
      border border-white/20
      shadow-lg hover:shadow-xl
      dark:bg-neutral-800/80 dark:border-neutral-700/50
    `,
    interactive: `
      bg-white
      border border-neutral-200
      shadow-card hover:shadow-card-hover
      hover:border-primary-300
      active:scale-[0.99]
      dark:bg-neutral-800 dark:border-neutral-700
      dark:hover:border-primary-600
    `,
  };

  const paddings = {
    none: "",
    xs: "p-3",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10"
  };

  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    '2xl': "rounded-2xl"
  };

  const hoverStyles = hover ? "hover:scale-[1.02] hover:-translate-y-1" : "";

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/50 dark:bg-neutral-800/50 flex items-center justify-center rounded-inherit z-10">
      <div className="flex items-center space-x-2">
        <svg 
          className="animate-spin h-5 w-5 text-primary-500" 
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
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Cargando...</span>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        roundedStyles[rounded],
        hoverStyles,
        className
      )}
      onClick={onClick}
    >
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}

      {/* Badge */}
      {badge && (
        <div className="absolute -top-2 -right-2 z-20">
          {badge}
        </div>
      )}

      {/* Header */}
      {header && (
        <div className={cn(
          "border-b border-neutral-200 dark:border-neutral-700",
          padding === 'none' ? 'px-6 py-4' : 'pb-4 mb-4'
        )}>
          {header}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        header || footer ? (padding === 'none' ? 'px-6 py-4' : paddings[padding]) : paddings[padding]
      )}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={cn(
          "border-t border-neutral-200 dark:border-neutral-700",
          padding === 'none' ? 'px-6 py-4' : 'pt-4 mt-4'
        )}>
          {footer}
        </div>
      )}

      {/* Ripple effect for interactive cards */}
      {(clickable || onClick) && (
        <div className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-primary-500/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </div>
      )}
    </div>
  );
};

export default Card;