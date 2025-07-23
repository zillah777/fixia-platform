import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'primary' | 'white' | 'dark' | 'gradient' | 'minimal';
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '',
  showText = true,
  animated = false
}) => {
  const sizes = {
    xs: { width: 24, height: 24, fontSize: '0.875rem', gap: '0.375rem' },
    sm: { width: 28, height: 28, fontSize: '1rem', gap: '0.5rem' },
    md: { width: 36, height: 36, fontSize: '1.25rem', gap: '0.75rem' },
    lg: { width: 44, height: 44, fontSize: '1.5rem', gap: '0.875rem' },
    xl: { width: 52, height: 52, fontSize: '1.875rem', gap: '1rem' },
    '2xl': { width: 64, height: 64, fontSize: '2.25rem', gap: '1.25rem' }
  };

  const { width, height, fontSize, gap } = sizes[size];

  // Colores del nuevo design system Marketplace 2.0
  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          primaryColor: '#ffffff',
          secondaryColor: '#f97316', // Secondary orange
          textColor: 'text-white',
          subtextColor: 'text-white/80'
        };
      case 'dark':
        return {
          primaryColor: '#171717', // Neutral 900
          secondaryColor: '#f97316', // Secondary orange
          textColor: 'text-neutral-900 dark:text-white',
          subtextColor: 'text-neutral-600 dark:text-neutral-400'
        };
      case 'gradient':
        return {
          primaryColor: 'url(#fixiaGradient)',
          secondaryColor: 'url(#fixiaAccent)',
          textColor: 'text-neutral-900 dark:text-white',
          subtextColor: 'text-neutral-600 dark:text-neutral-400'
        };
      case 'minimal':
        return {
          primaryColor: 'transparent',
          secondaryColor: '#3b82f6', // Primary blue
          textColor: 'text-neutral-900 dark:text-white',
          subtextColor: 'text-neutral-600 dark:text-neutral-400'
        };
      default: // primary
        return {
          primaryColor: '#3b82f6', // Primary blue
          secondaryColor: '#f97316', // Secondary orange
          textColor: 'text-neutral-900 dark:text-white',
          subtextColor: 'text-neutral-600 dark:text-neutral-400'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      <div className={`relative ${animated ? 'group' : ''}`}>
        <svg
          width={width}
          height={height}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`flex-shrink-0 transition-all duration-300 ${animated ? 'group-hover:scale-110' : ''}`}
        >
          <defs>
            {/* Gradientes modernos para Fixia */}
            <linearGradient id="fixiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="fixiaAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="fixiaText" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            
            {/* Filtros para efectos */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#3b82f6" floodOpacity="0.2"/>
            </filter>
          </defs>
          
          {/* Logo Container - Diseño único para Fixia */}
          {variant !== 'minimal' && (
            <g>
              {/* Círculo base con gradiente */}
              <circle
                cx="24"
                cy="24"
                r="22"
                fill={colors.primaryColor}
                filter="url(#shadow)"
                className={`transition-all duration-500 ${animated ? 'group-hover:r-23' : ''}`}
              />
              
              {/* Anillo interior decorativo */}
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.2"
              />
            </g>
          )}
          
          {/* Símbolo "F" moderno y geométrico */}
          <g fill={variant === 'minimal' ? colors.secondaryColor : 'white'}>
            {/* Barra vertical principal */}
            <rect x="15" y="14" width="3" height="20" rx="1.5" 
                  className={animated ? 'group-hover:animate-pulse' : ''} />
            
            {/* Barra horizontal superior */}
            <rect x="15" y="14" width="14" height="3" rx="1.5" 
                  className={animated ? 'group-hover:animate-pulse' : ''} />
            
            {/* Barra horizontal media */}
            <rect x="15" y="22" width="10" height="3" rx="1.5" 
                  className={animated ? 'group-hover:animate-pulse' : ''} />
          </g>
          
          {/* Elemento distintivo: punto de conexión */}
          <g>
            <circle 
              cx="32" 
              cy="18" 
              r="2.5" 
              fill={colors.secondaryColor}
              className={animated ? 'group-hover:animate-bounce' : ''}
            />
            
            {/* Líneas de conexión - representan la red de servicios */}
            <g stroke={variant === 'minimal' ? colors.primaryColor : 'white'} 
               strokeWidth="1" 
               opacity="0.6"
               className={animated ? 'group-hover:opacity-100' : ''}>
              <line x1="29.5" y1="18" x2="25" y2="15" strokeLinecap="round" />
              <line x1="29.5" y1="18" x2="25" y2="21" strokeLinecap="round" />
            </g>
          </g>
          
          {/* Efecto de brillo sutil */}
          {animated && (
            <circle
              cx="20"
              cy="20"
              r="3"
              fill="white"
              opacity="0"
              className="group-hover:opacity-30 transition-opacity duration-500"
            />
          )}
        </svg>
        
        {/* Indicator dot para versiones interactivas */}
        {animated && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`font-bold font-display tracking-tight ${colors.textColor} transition-colors duration-200`}
            style={{ fontSize }}
          >
            Fixia
          </span>
          {(size === 'lg' || size === 'xl' || size === '2xl') && (
            <span 
              className={`${colors.subtextColor} tracking-wide font-medium transition-colors duration-200`}
              style={{ fontSize: `${parseFloat(fontSize) * 0.45}rem` }}
            >
              Marketplace de Servicios
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;