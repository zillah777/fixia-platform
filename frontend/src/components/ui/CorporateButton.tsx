import React from 'react';

interface CorporateButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CorporateButton: React.FC<CorporateButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  leftIcon,
  rightIcon
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl border border-primary-600 hover:border-primary-700';
      case 'secondary':
        return 'bg-secondary-100 hover:bg-secondary-200 text-secondary-900 border border-secondary-200 hover:border-secondary-300';
      case 'outline':
        return 'bg-transparent hover:bg-primary-50 text-primary-600 border-2 border-primary-600 hover:border-primary-700 hover:text-primary-700';
      case 'ghost':
        return 'bg-transparent hover:bg-secondary-100 text-secondary-700 hover:text-secondary-900 border border-transparent';
      case 'danger':
        return 'bg-error-600 hover:bg-error-700 text-white shadow-lg hover:shadow-xl border border-error-600 hover:border-error-700';
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl border border-primary-600 hover:border-primary-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium rounded-lg xs:rounded-xl';
      case 'md':
        return 'px-3 xs:px-4 sm:px-4 py-2 xs:py-2.5 text-sm font-semibold rounded-xl';
      case 'lg':
        return 'px-4 xs:px-5 sm:px-6 md:px-6 py-2.5 xs:py-3 text-sm xs:text-base font-semibold rounded-xl';
      case 'xl':
        return 'px-6 xs:px-7 sm:px-8 md:px-8 py-3 xs:py-4 text-base xs:text-lg font-semibold rounded-xl xs:rounded-2xl';
      default:
        return 'px-3 xs:px-4 sm:px-4 py-2 xs:py-2.5 text-sm font-semibold rounded-xl';
    }
  };

  const disabledClasses = disabled || loading 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabledClasses}
        ${className}
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      
      {children}
      
      {rightIcon && !loading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default CorporateButton;