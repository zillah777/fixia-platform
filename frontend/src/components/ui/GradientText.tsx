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
    primary: "from-forest-500 to-forest-700",
    secondary: "from-teal-500 to-teal-700", 
    accent: "from-gold-500 to-coral-500",
    brand: "from-forest-500 to-teal-500",
    trust: "from-teal-500 to-forest-500",
    professional: "from-forest-600 via-teal-600 to-gold-600"
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