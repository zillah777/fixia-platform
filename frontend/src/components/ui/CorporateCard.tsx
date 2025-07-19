import React from 'react';

interface CorporateCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'minimal';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

const CorporateCard: React.FC<CorporateCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  padding = 'lg',
  onClick
}) => {
  const getBaseClasses = () => {
    const baseClasses = 'rounded-2xl transition-all duration-300';
    
    switch (variant) {
      case 'elevated':
        return `${baseClasses} bg-white shadow-xl border border-secondary-100 hover:shadow-2xl hover:border-primary-200`;
      case 'glass':
        return `${baseClasses} bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/90`;
      case 'minimal':
        return `${baseClasses} bg-secondary-50 border border-secondary-200 hover:bg-white hover:shadow-md`;
      default:
        return `${baseClasses} bg-white shadow-md border border-secondary-100 hover:shadow-lg hover:border-secondary-200`;
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm': return 'p-3 xs:p-4 sm:p-4 md:p-5';
      case 'md': return 'p-4 xs:p-5 sm:p-6 md:p-6';
      case 'lg': return 'p-5 xs:p-6 sm:p-6 md:p-7 lg:p-8';
      case 'xl': return 'p-6 xs:p-7 sm:p-8 md:p-9 lg:p-10 xl:p-12';
      default: return 'p-5 xs:p-6 sm:p-6 md:p-7 lg:p-8';
    }
  };

  const hoverClasses = hover ? 'hover:scale-[1.02] cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${getBaseClasses()} ${getPaddingClasses()} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default CorporateCard;