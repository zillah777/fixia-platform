import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gradient';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'primary',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const getLogoClasses = () => {
    const baseClasses = `${sizeClasses[size]} rounded-xl flex items-center justify-center shadow-lg`;
    
    switch (variant) {
      case 'gradient':
        return `${baseClasses} liquid-gradient`;
      case 'white':
        return `${baseClasses} bg-white text-primary-600`;
      default:
        return `${baseClasses} bg-primary-600 text-white`;
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'white':
        return `${textSizeClasses[size]} font-bold text-white ml-3`;
      case 'gradient':
        return `${textSizeClasses[size]} font-bold text-white ml-3`;
      default:
        return `${textSizeClasses[size]} font-bold text-primary-600 ml-3`;
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={getLogoClasses()}>
        <span className="font-bold text-lg">F</span>
      </div>
      {showText && (
        <span className={getTextClasses()}>
          Fixia
        </span>
      )}
    </div>
  );
};

export default Logo;