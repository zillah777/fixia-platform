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

  // Colores corporativos profesionales 2025
  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          primaryFill: '#ffffff',
          secondaryFill: '#f8fafc',
          textColor: 'text-white',
          subtextColor: 'text-white/90'
        };
      case 'dark':
        return {
          primaryFill: '#1f2937',
          secondaryFill: '#374151',
          textColor: 'text-gray-900',
          subtextColor: 'text-gray-600'
        };
      case 'gradient':
        return {
          primaryFill: 'url(#corporateGradient)',
          secondaryFill: 'url(#professionalGradient)',
          textColor: 'text-gray-900',
          subtextColor: 'text-gray-600'
        };
      default: // primary
        return {
          primaryFill: '#334155', // Professional navy
          secondaryFill: '#3b82f6', // Professional blue
          textColor: 'text-gray-900',
          subtextColor: 'text-gray-600'
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
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="professionalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="corporateShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#334155" floodOpacity="0.15"/>
          </filter>
        </defs>
        
        {/* Modern Corporate Container with Subtle Depth */}
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="8"
          fill={colors.primaryFill}
          filter="url(#corporateShadow)"
          className="transition-all duration-300"
        />
        
        {/* Inner Accent Border */}
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="7"
          fill="none"
          stroke={colors.secondaryFill}
          strokeWidth="0.5"
          opacity="0.3"
        />
        
        {/* Modern F - Geometric & Professional */}
        <g fill="white">
          <rect x="8" y="8" width="2.5" height="16" rx="0.5" />
          <rect x="8" y="8" width="12" height="2.5" rx="0.5" />
          <rect x="8" y="14.75" width="9" height="2.5" rx="0.5" />
        </g>
        
        {/* Modern X - Clean Intersection Symbol */}
        <g fill="white" opacity="0.95">
          <rect x="21" y="12" width="8" height="2" rx="1" transform="rotate(45 25 13)" />
          <rect x="21" y="18" width="8" height="2" rx="1" transform="rotate(-45 25 19)" />
        </g>
        
        {/* Subtle Corporate Accent Dot */}
        <circle cx="26" cy="9" r="1.5" fill={colors.secondaryFill} opacity="0.8" />
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`font-bold tracking-tight ${colors.textColor}`}
            style={{ fontSize, fontFamily: '"Inter", system-ui, sans-serif' }}
          >
            FIXIA
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span 
              className={`${colors.subtextColor} tracking-wider uppercase`}
              style={{ fontSize: `${parseFloat(fontSize) * 0.4}rem`, fontWeight: 500 }}
            >
              Servicios Profesionales
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Logo;