import React from 'react';
import { cn } from '@/utils/helpers';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'rainbow' | 'sunset' | 'ocean';
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
    rainbow: "from-pink-500 via-purple-500 to-indigo-500",
    sunset: "from-orange-500 via-pink-500 to-purple-600",
    ocean: "from-blue-500 via-teal-500 to-green-500"
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