import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'dark' | 'gradient';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  showText = true
}) => {
  const sizes = {
    xs: { width: 24, height: 24, fontSize: '0.875rem', gap: '0.5rem' },
    sm: { width: 28, height: 28, fontSize: '1rem', gap: '0.625rem' },
    md: { width: 32, height: 32, fontSize: '1.125rem', gap: '0.75rem' },
    lg: { width: 40, height: 40, fontSize: '1.375rem', gap: '0.875rem' },
    xl: { width: 48, height: 48, fontSize: '1.625rem', gap: '1rem' }
  };

  const { width, height, fontSize, gap } = sizes[size];

  // Definir colores según el fondo
  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          logoFill: '#ffffff',
          textColor: 'text-white',
          subtextColor: 'text-white/80'
        };
      case 'dark':
        return {
          logoFill: '#1e293b',
          textColor: 'text-neutral-900',
          subtextColor: 'text-neutral-600'
        };
      case 'gradient':
        return {
          logoFill: 'url(#corporateGradient)',
          textColor: 'text-neutral-900',
          subtextColor: 'text-neutral-600'
        };
      default: // primary
        return {
          logoFill: '#2563eb',
          textColor: 'text-neutral-900',
          subtextColor: 'text-neutral-600'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="corporateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        
        {/* Professional Square Container */}
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="6"
          fill={colors.logoFill}
          className="drop-shadow-sm"
        />
        
        {/* Letter F - Clean and Professional */}
        <path
          d="M9 9 L9 23 L11 23 L11 17 L18 17 L18 15 L11 15 L11 11 L19 11 L19 9 Z"
          fill="white"
          className="font-bold"
        />
        
        {/* Letter x - Minimalist */}
        <path
          d="M20 15 L22.5 12.5 L24 14 L21.5 16.5 L24 19 L22.5 20.5 L20 18 L17.5 20.5 L16 19 L18.5 16.5 L16 14 L17.5 12.5 Z"
          fill="white"
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span 
            className={`font-bold tracking-tight ${colors.textColor}`}
            style={{ fontSize }}
          >
            <span className={`font-light ${colors.subtextColor} mr-1`}>Fx</span>Fixia
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;