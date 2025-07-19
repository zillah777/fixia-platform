import React from 'react';

interface CorporateLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'centered' | 'sidebar' | 'full';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  background?: 'default' | 'gradient' | 'glass' | 'solid';
  padding?: boolean;
}

const CorporateLayout: React.FC<CorporateLayoutProps> = ({
  children,
  className = '',
  variant = 'default',
  maxWidth = '7xl',
  background = 'default',
  padding = true
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'centered':
        return 'min-h-screen flex items-center justify-center';
      case 'sidebar':
        return 'min-h-screen flex';
      case 'full':
        return 'min-h-screen';
      default:
        return 'min-h-screen';
    }
  };

  const getMaxWidthClasses = () => {
    switch (maxWidth) {
      case 'xs': return 'max-w-xs';
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '3xl': return 'max-w-3xl';
      case '4xl': return 'max-w-4xl';
      case '5xl': return 'max-w-5xl';
      case '6xl': return 'max-w-6xl';
      case '7xl': return 'max-w-7xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-7xl';
    }
  };

  const getBackgroundClasses = () => {
    switch (background) {
      case 'gradient':
        return 'bg-gradient-to-br from-secondary-50 via-white to-primary-50';
      case 'glass':
        return 'bg-white/95 backdrop-blur-xl';
      case 'solid':
        return 'bg-white';
      default:
        return 'bg-gradient-to-br from-secondary-50 via-white to-primary-50';
    }
  };

  const getPaddingClasses = () => {
    return padding ? 'px-3 xs:px-4 sm:px-6 lg:px-8' : '';
  };

  const containerClasses = variant === 'centered' ? 
    `w-full ${getMaxWidthClasses()} ${getPaddingClasses()}` :
    `${getMaxWidthClasses()} mx-auto ${getPaddingClasses()}`;

  return (
    <div className={`${getVariantClasses()} ${getBackgroundClasses()} ${className}`}>
      {variant === 'full' ? (
        children
      ) : (
        <div className={containerClasses}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CorporateLayout;