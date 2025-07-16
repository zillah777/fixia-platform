import React from 'react';
import { cn } from '@/utils/helpers';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'brand' | 'trust' | 'professional';
  animate?: boolean;
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  variant = 'primary',
  animate = false,
}) => {
  const baseStyles = "bg-clip-text text-transparent bg-gradient-to-r font-bold";
  
  const variants = {
    primary: "from-primary-500 to-primary-700",
    secondary: "from-secondary-500 to-secondary-700",
    accent: "from-accent-500 to-accent-700",
    brand: "from-primary-600 to-primary-800",
    trust: "from-trust-500 to-trust-700",
    professional: "from-primary-600 via-primary-700 to-secondary-700"
  };

  const animateStyles = animate ? "animate-gradient-x bg-[length:200%_auto]" : "";

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        animateStyles,
        className
      )}
    >
      {children}
    </span>
  );
};

export default GradientText;