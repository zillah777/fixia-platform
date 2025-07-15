import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'primary' | 'white' | 'dark' | 'gradient';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}) => {
  const sizes = {
    sm: { width: 32, height: 32, fontSize: '1.2rem' },
    md: { width: 40, height: 40, fontSize: '1.5rem' },
    lg: { width: 48, height: 48, fontSize: '1.8rem' },
    xl: { width: 56, height: 56, fontSize: '2.1rem' },
    '2xl': { width: 64, height: 64, fontSize: '2.4rem' }
  };

  const colors = {
    primary: '#2563eb',
    white: '#ffffff',
    dark: '#1e293b',
    gradient: 'url(#logoGradient)'
  };

  const { width, height, fontSize } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Circle */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill={colors[variant]}
          filter="url(#glow)"
          className="animate-pulse"
        />
        
        {/* Inner Circle */}
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
        
        {/* Letter F */}
        <path
          d="M20 20 L20 44 L22.5 44 L22.5 33 L32 33 L32 30.5 L22.5 30.5 L22.5 22.5 L34 22.5 L34 20 Z"
          fill="white"
          className="drop-shadow-sm"
        />
        
        {/* Letter x */}
        <path
          d="M38 32 L42 28 L44 30 L40.5 33.5 L44 37 L42 39 L38 35 L34 39 L32 37 L35.5 33.5 L32 30 L34 28 Z"
          fill="white"
          className="drop-shadow-sm"
        />
        
        {/* Decorative Elements */}
        <circle cx="48" cy="16" r="2" fill="rgba(255, 255, 255, 0.6)" className="animate-float" />
        <circle cx="16" cy="48" r="1.5" fill="rgba(255, 255, 255, 0.4)" className="animate-float" />
      </svg>
      
      <div className="flex flex-col">
        <span 
          className={`font-black tracking-tight leading-none ${
            variant === 'gradient' 
              ? 'bg-gradient-primary bg-clip-text text-transparent' 
              : variant === 'white' 
                ? 'text-white' 
                : variant === 'dark'
                  ? 'text-neutral-900'
                  : 'text-primary-600'
          }`}
          style={{ fontSize }}
        >
          fixia
        </span>
        <span 
          className={`text-xs font-medium tracking-wider uppercase ${
            variant === 'white' 
              ? 'text-white/70' 
              : variant === 'dark'
                ? 'text-neutral-600'
                : 'text-primary-400'
          }`}
        >
          platform
        </span>
      </div>
    </div>
  );
};

export default Logo;