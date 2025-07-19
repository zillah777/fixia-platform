import React from 'react';
import { cn } from '@/utils/helpers';

interface GlowingOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'error';
  className?: string;
  animate?: boolean;
}

const GlowingOrb: React.FC<GlowingOrbProps> = ({
  size = 'md',
  color = 'primary',
  className,
  animate = true,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'bg-forest-500 shadow-forest-500/50',
    secondary: 'bg-teal-500 shadow-teal-500/50',
    accent: 'bg-gold-500 shadow-gold-500/50',
    warning: 'bg-coral-500 shadow-coral-500/50',
    error: 'bg-terra-500 shadow-terra-500/50'
  };

  const animateStyles = animate ? 'animate-pulse-glow' : '';

  return (
    <div
      className={cn(
        'rounded-full blur-sm',
        sizes[size],
        colors[color],
        animateStyles,
        className
      )}
      style={{
        boxShadow: `0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor`
      }}
    />
  );
};

export default GlowingOrb;