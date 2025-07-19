import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'md',
  center = true
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'xs': return 'max-w-xs';
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '3xl': return 'max-w-3xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-xl';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'px-3 sm:px-4 md:px-6';
      case 'md': return 'px-4 sm:px-6 md:px-8 lg:px-10';
      case 'lg': return 'px-6 sm:px-8 md:px-12 lg:px-16';
      case 'xl': return 'px-8 sm:px-12 md:px-16 lg:px-20';
      default: return 'px-4 sm:px-6 md:px-8 lg:px-10';
    }
  };

  const centerClass = center ? 'mx-auto' : '';

  return (
    <div className={`${getMaxWidthClass()} ${getPaddingClass()} ${centerClass} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;