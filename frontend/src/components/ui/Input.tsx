import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  fullWidth = false,
  showPasswordToggle = false,
  className,
  type = 'text',
  disabled = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseStyles = `
    block
    font-body
    transition-all duration-200 ease-out
    placeholder:text-neutral-400
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50
    dark:disabled:bg-neutral-800
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    default: `
      border border-neutral-300
      bg-white hover:bg-neutral-50
      text-neutral-900
      focus:border-primary-500 focus:ring-primary-500/20
      dark:bg-neutral-800 dark:border-neutral-600
      dark:text-neutral-100 dark:hover:bg-neutral-700
      dark:focus:border-primary-400
    `,
    filled: `
      border-0
      bg-neutral-100 hover:bg-neutral-200
      text-neutral-900
      focus:bg-white focus:ring-primary-500/20 focus:shadow-lg
      dark:bg-neutral-700 dark:hover:bg-neutral-600
      dark:text-neutral-100 dark:focus:bg-neutral-800
    `,
    outline: `
      border-2 border-neutral-200
      bg-transparent hover:border-neutral-300
      text-neutral-900
      focus:border-primary-500 focus:ring-primary-500/20
      dark:border-neutral-600 dark:hover:border-neutral-500
      dark:text-neutral-100 dark:focus:border-primary-400
    `,
  };

  const errorVariants = {
    default: `
      border-error-500 focus:border-error-500 focus:ring-error-500/20
      dark:border-error-400 dark:focus:border-error-400
    `,
    filled: `
      bg-error-50 hover:bg-error-50 focus:bg-error-50 focus:ring-error-500/20
      dark:bg-error-900/20 dark:hover:bg-error-900/30 dark:focus:bg-error-900/40
    `,
    outline: `
      border-error-500 hover:border-error-600 focus:border-error-500 focus:ring-error-500/20
      dark:border-error-400 dark:hover:border-error-300 dark:focus:border-error-400
    `,
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-4 py-2.5 text-base rounded-lg",
    lg: "px-5 py-3 text-lg rounded-xl",
    xl: "px-6 py-4 text-xl rounded-2xl"
  };

  const PasswordToggleIcon = () => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none dark:text-neutral-500 dark:hover:text-neutral-300"
      tabIndex={-1}
    >
      {showPassword ? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className={cn("space-y-1", fullWidth && "w-full")}>
      {/* Label */}
      {label && (
        <label className={cn(
          "block text-sm font-medium",
          error ? "text-error-600 dark:text-error-400" : "text-neutral-700 dark:text-neutral-300",
          disabled && "opacity-50"
        )}>
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            baseStyles,
            error ? errorVariants[variant] : variants[variant],
            sizes[inputSize],
            leftIcon && "pl-10",
            (rightIcon || (type === 'password' && showPasswordToggle)) && "pr-10",
            className
          )}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {type === 'password' && showPasswordToggle ? (
          <PasswordToggleIcon />
        ) : rightIcon ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            {rightIcon}
          </div>
        ) : null}

        {/* Focus ring effect */}
        {isFocused && (
          <div className={cn(
            "absolute inset-0 rounded-inherit pointer-events-none",
            error ? "ring-2 ring-error-500/20" : "ring-2 ring-primary-500/20"
          )} />
        )}
      </div>

      {/* Helper Text / Error */}
      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error ? "text-error-600 dark:text-error-400" : "text-neutral-500 dark:text-neutral-400"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;