import React from 'react';
import { cn } from '@/utils/helpers';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles' | 'waves' | 'geometric';
  className?: string;
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'gradient',
  className,
  children,
}) => {
  const renderVariant = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-accent-500/20 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-secondary-500/10 via-accent-500/10 to-primary-500/10 animate-gradient-xy" style={{ animationDelay: '2s' }}></div>
          </div>
        );
      
      case 'particles':
        return (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary-400 rounded-full animate-bounce-slow opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'waves':
        return (
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(14, 165, 233, 0.1)" />
                  <stop offset="100%" stopColor="rgba(217, 70, 239, 0.1)" />
                </linearGradient>
              </defs>
              <path
                d="M0,100 Q100,50 200,100 T400,100 V400 H0 Z"
                fill="url(#wave-gradient)"
                className="animate-pulse"
              />
            </svg>
          </div>
        );
      
      case 'geometric':
        return (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-primary-200 rounded-full animate-spin-slow opacity-20"
                style={{
                  width: `${100 + i * 50}px`,
                  height: `${100 + i * 50}px`,
                  left: `${20 + i * 15}%`,
                  top: `${20 + i * 15}%`,
                  animationDuration: `${10 + i * 5}s`,
                  animationDelay: `${i * 2}s`
                }}
              />
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {renderVariant()}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};

export default AnimatedBackground;