import React from 'react';
import { cn } from '@/utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-primary-200 border-t-primary-600',
          sizes[size]
        )}
        role="status"
        aria-label="Cargando"
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;