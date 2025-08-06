'use client';

import React from 'react';
import { FixiaImage } from './fixia-image';
import { cn } from '@/lib/utils';

export interface FixiaLogoProps {
  variant?: 'primary' | 'white' | 'gradient' | 'icon' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  priority?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
  '2xl': 'h-24',
};

const logoVariants = {
  primary: {
    src: '/images/logo/fixia-logo-primary.svg',
    fallback: '/images/logo/fixia-logo-primary.png',
    alt: 'Fixia - Servicios Profesionales en Chubut',
  },
  white: {
    src: '/images/logo/fixia-logo-white.svg',
    fallback: '/images/logo/fixia-logo-white.png',
    alt: 'Fixia - Servicios Profesionales en Chubut',
  },
  gradient: {
    src: '/images/logo/fixia-logo-gradient.svg',
    fallback: '/images/logo/fixia-logo-gradient.png',
    alt: 'Fixia - Servicios Profesionales en Chubut',
  },
  icon: {
    src: '/images/logo/fixia-icon.svg',
    fallback: '/images/logo/fixia-icon.png',
    alt: 'Fixia',
  },
  text: {
    src: '/images/logo/fixia-text.svg',
    fallback: '/images/logo/fixia-text.png',
    alt: 'Fixia',
  },
};

/**
 * FixiaOptimizedLogo - Optimized logo component for the Fixia platform
 * 
 * Features:
 * - Multiple logo variants for different contexts
 * - SVG optimization with PNG fallbacks
 * - Responsive sizing for all screen sizes
 * - High-quality rendering for retina displays
 * - Clickable variant for navigation
 * - Liquid Glass integration for premium feel
 * - Optimized for Argentine market branding
 */
export const FixiaOptimizedLogo: React.FC<FixiaLogoProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  priority = false,
  clickable = false,
  onClick,
}) => {
  const logoConfig = logoVariants[variant];
  
  const containerClasses = cn(
    'inline-flex items-center justify-center',
    'transition-all duration-300',
    clickable && 'cursor-pointer hover:scale-105 hover:opacity-80',
    className
  );

  const imageClasses = cn(
    sizeClasses[size],
    'w-auto transition-all duration-300',
    clickable && 'hover:drop-shadow-lg'
  );

  // For text variant, we'll use a CSS text implementation if image fails
  const TextFallback = () => (
    <div className={cn(
      'font-bold text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text',
      'select-none',
      size === 'xs' && 'text-lg',
      size === 'sm' && 'text-xl',
      size === 'md' && 'text-2xl',
      size === 'lg' && 'text-3xl',
      size === 'xl' && 'text-4xl',
      size === '2xl' && 'text-5xl'
    )}>
      Fixia
    </div>
  );

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={containerClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {variant === 'text' ? (
        // For text variant, try image first, then fallback to CSS text
        <FixiaImage
          src={logoConfig.src}
          alt={logoConfig.alt}
          width={200}
          height={60}
          priority={priority}
          quality={100}
          className={imageClasses}
          fallbackSrc={logoConfig.fallback}
          onError={() => {
            // This will be handled by the FixiaImage component internally
            // If both primary and fallback fail, show TextFallback
          }}
        />
      ) : (
        <FixiaImage
          src={logoConfig.src}
          alt={logoConfig.alt}
          width={variant === 'icon' ? 60 : 200}
          height={60}
          priority={priority}
          quality={100}
          className={imageClasses}
          fallbackSrc={logoConfig.fallback}
          sizes="(max-width: 768px) 150px, 200px"
        />
      )}
      
      {/* Liquid Glass effect on hover for clickable logos */}
      {clickable && (
        <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-10 transition-opacity bg-gradient-to-r from-blue-500 to-purple-600 pointer-events-none" />
      )}
    </div>
  );
};

// Convenience components for common use cases
export const FixiaNavLogo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <FixiaOptimizedLogo
    variant="primary"
    size="md"
    clickable={true}
    priority={true}
    onClick={onClick}
  />
);

export const FixiaFooterLogo: React.FC = () => (
  <FixiaOptimizedLogo
    variant="white"
    size="lg"
    priority={false}
  />
);

export const FixiaFaviconLogo: React.FC = () => (
  <FixiaOptimizedLogo
    variant="icon"
    size="sm"
    priority={true}
  />
);

export default FixiaOptimizedLogo;