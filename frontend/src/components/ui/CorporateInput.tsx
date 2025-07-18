import React from 'react';

interface CorporateInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'glass';
}

const CorporateInput: React.FC<CorporateInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  leftIcon,
  rightIcon,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    const baseClasses = 'w-full rounded-xl transition-all duration-200 focus:outline-none focus:ring-2';
    
    switch (variant) {
      case 'minimal':
        return `${baseClasses} bg-secondary-50 border border-secondary-200 focus:border-primary-500 focus:ring-primary-200`;
      case 'glass':
        return `${baseClasses} bg-white/80 backdrop-blur-sm border border-white/30 focus:border-primary-500 focus:ring-primary-200`;
      default:
        return `${baseClasses} bg-white border border-secondary-300 focus:border-primary-500 focus:ring-primary-200 shadow-sm`;
    }
  };

  const errorClasses = error 
    ? 'border-error-500 focus:border-error-500 focus:ring-error-200' 
    : '';

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed bg-secondary-100' 
    : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-secondary-900">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary-500">{leftIcon}</span>
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            ${getVariantClasses()}
            ${getSizeClasses()}
            ${errorClasses}
            ${disabledClasses}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-secondary-500">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default CorporateInput;