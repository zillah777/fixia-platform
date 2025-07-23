import React from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'lg',
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium font-display
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    active:transform active:scale-[0.98]
    relative overflow-hidden
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-primary-500 hover:bg-primary-600 active:bg-primary-700
      text-white
      shadow-button hover:shadow-button-hover
      focus:ring-primary-500 focus:ring-offset-2
      dark:bg-primary-600 dark:hover:bg-primary-700
    `,
    secondary: `
      bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700
      text-white
      shadow-button hover:shadow-button-hover
      focus:ring-secondary-500 focus:ring-offset-2
      dark:bg-secondary-600 dark:hover:bg-secondary-700
    `,
    outline: `
      border-2 border-primary-500 hover:border-primary-600
      bg-transparent hover:bg-primary-50 active:bg-primary-100
      text-primary-500 hover:text-primary-600
      focus:ring-primary-500 focus:ring-offset-2
      dark:border-primary-400 dark:text-primary-400
      dark:hover:bg-primary-900/20 dark:active:bg-primary-900/30
    `,
    ghost: `
      bg-transparent hover:bg-neutral-100 active:bg-neutral-200
      text-neutral-700 hover:text-neutral-900
      focus:ring-neutral-500 focus:ring-offset-2
      dark:text-neutral-300 dark:hover:text-neutral-100
      dark:hover:bg-neutral-800 dark:active:bg-neutral-700
    `,
    text: `
      bg-transparent hover:bg-primary-50 active:bg-primary-100
      text-primary-500 hover:text-primary-600
      focus:ring-primary-500 focus:ring-offset-2
      dark:text-primary-400 dark:hover:text-primary-300
      dark:hover:bg-primary-900/20 dark:active:bg-primary-900/30
    `,
    success: `
      bg-success-500 hover:bg-success-600 active:bg-success-700
      text-white
      shadow-button hover:shadow-button-hover
      focus:ring-success-500 focus:ring-offset-2
      dark:bg-success-600 dark:hover:bg-success-700
    `,
    warning: `
      bg-warning-500 hover:bg-warning-600 active:bg-warning-700
      text-white
      shadow-button hover:shadow-button-hover
      focus:ring-warning-500 focus:ring-offset-2
      dark:bg-warning-600 dark:hover:bg-warning-700
    `,
    error: `
      bg-error-500 hover:bg-error-600 active:bg-error-700
      text-white
      shadow-button hover:shadow-button-hover
      focus:ring-error-500 focus:ring-offset-2
      dark:bg-error-600 dark:hover:bg-error-700
    `,
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  };

  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg", 
    xl: "rounded-xl",
    full: "rounded-full"
  };

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
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
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        roundedStyles[rounded],
        className
      )}
    >
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit">
        <span className="absolute inset-0 rounded-inherit bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
      </span>
      
      {/* Content */}
      <span className="relative flex items-center justify-center">
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
        {!loading && rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </span>
    </button>
  );
};

export default Button;