import React from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated' | 'interactive';
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
  glow = false,
  onClick,
}) => {
  const baseStyles = "rounded-xl transition-all duration-300 ease-in-out";
  
  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    gradient: "bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white shadow-lg",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
    elevated: "bg-white shadow-lg border-0",
    interactive: "bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-primary-300 cursor-pointer"
  };

  const hoverStyles = hover ? "hover:transform hover:scale-105 hover:shadow-xl" : "";
  const glowStyles = glow ? "animate-pulse-glow" : "";
  const clickableStyles = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        hoverStyles,
        glowStyles,
        clickableStyles,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;