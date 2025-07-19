import React from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  type = 'button',
  leftIcon,
  rightIcon,
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-forest-500 hover:bg-forest-600 text-white shadow-lg hover:shadow-xl focus:ring-forest-500 backdrop-blur-sm",
    secondary: "bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-xl focus:ring-teal-500 backdrop-blur-sm",
    outline: "border-2 border-forest-500 text-forest-500 hover:bg-forest-500 hover:text-white focus:ring-forest-500 backdrop-blur-sm",
    ghost: "text-forest-500 hover:bg-forest-50 focus:ring-forest-500 backdrop-blur-sm",
    gradient: "glass-cta text-white shadow-lg hover:shadow-xl transform hover:scale-105",
    glow: "bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-xl animate-pulse-glow focus:ring-teal-500 backdrop-blur-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;