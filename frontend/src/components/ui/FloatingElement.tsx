import React from 'react';
import { cn } from '@/utils/helpers';

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  amplitude?: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className,
  delay = 0,
  duration = 3,
  amplitude = 10,
}) => {
  const style = {
    animation: `float ${duration}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    '--amplitude': `${amplitude}px`,
  } as React.CSSProperties;

  return (
    <div
      className={cn("animate-float", className)}
      style={style}
    >
      {children}
    </div>
  );
};

export default FloatingElement;