'use client';

import React from 'react';
import { FixiaImage } from './fixia-image';
import { cn } from '@/lib/utils';
import { 
  Wrench, 
  Zap, 
  Droplets, 
  Paintbrush, 
  Home, 
  Car, 
  Laptop, 
  Shield,
  Settings,
  Hammer
} from 'lucide-react';

export interface FixiaCategoryIconProps {
  category?: string;
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'image' | 'hybrid';
  className?: string;
  showLabel?: boolean;
  label?: string;
  priority?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

// Mapping of service categories to icons and colors
const categoryConfig = {
  plomeria: {
    icon: Droplets,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    label: 'Plomería',
  },
  electricidad: {
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Electricidad',
  },
  construccion: {
    icon: Home,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    label: 'Construcción',
  },
  pintura: {
    icon: Paintbrush,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    label: 'Pintura',
  },
  mecanica: {
    icon: Car,
    color: 'from-gray-500 to-slate-600',
    bgColor: 'bg-gray-500/10',
    label: 'Mecánica',
  },
  tecnologia: {
    icon: Laptop,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    label: 'Tecnología',
  },
  seguridad: {
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Seguridad',
  },
  mantenimiento: {
    icon: Settings,
    color: 'from-slate-500 to-gray-600',
    bgColor: 'bg-slate-500/10',
    label: 'Mantenimiento',
  },
  default: {
    icon: Hammer,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-500/10',
    label: 'Otros Servicios',
  },
};

/**
 * FixiaCategoryIcon - Optimized category icon component for service categories
 * 
 * Features:
 * - Service category icon mapping with Liquid Glass styling
 * - Hybrid mode with both images and fallback icons
 * - Gradient backgrounds matching category themes
 * - Mobile-optimized sizing for Argentine market
 * - Accessibility compliance with proper labels
 * - Next.js Image optimization for custom category images
 */
export const FixiaCategoryIcon: React.FC<FixiaCategoryIconProps> = ({
  category = 'default',
  src,
  alt,
  size = 'md',
  variant = 'hybrid',
  className,
  showLabel = false,
  label,
  priority = false,
}) => {
  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.default;
  const IconComponent = config.icon;
  const displayLabel = label || config.label;

  const containerClasses = cn(
    'relative inline-flex items-center justify-center',
    'rounded-xl transition-all duration-300',
    'glass-light hover:glass-medium',
    sizeClasses[size],
    config.bgColor,
    'group cursor-pointer',
    className
  );

  const iconClasses = cn(
    'transition-all duration-300 group-hover:scale-110',
    `text-transparent bg-gradient-to-br ${config.color} bg-clip-text`,
    size === 'xs' && 'h-3 w-3',
    size === 'sm' && 'h-4 w-4',
    size === 'md' && 'h-6 w-6',
    size === 'lg' && 'h-8 w-8',
    size === 'xl' && 'h-12 w-12'
  );

  const renderContent = () => {
    if (variant === 'icon' || !src) {
      return <IconComponent className={iconClasses} />;
    }

    if (variant === 'image' && src) {
      return (
        <FixiaImage
          src={src}
          alt={alt || displayLabel}
          fill
          priority={priority}
          aspectRatio="square"
          objectFit="cover"
          quality={90}
          className="rounded-xl"
          fallbackSrc="/images/default-category.png"
        />
      );
    }

    // Hybrid mode - try image first, fallback to icon
    return (
      <FixiaImage
        src={src!}
        alt={alt || displayLabel}
        fill
        priority={priority}
        aspectRatio="square"
        objectFit="cover"
        quality={90}
        className="rounded-xl"
        fallbackSrc="/images/default-category.png"
        onError={() => {
          // On error, the component will handle showing the fallback
        }}
      >
        {/* Fallback icon overlay in case image fails */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity">
          <IconComponent className={iconClasses} />
        </div>
      </FixiaImage>
    );
  };

  if (showLabel) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={containerClasses}>
          {renderContent()}
          
          {/* Hover effect gradient overlay */}
          <div className={cn(
            'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity',
            `bg-gradient-to-br ${config.color}`
          )} />
        </div>
        
        {showLabel && (
          <span className={cn(
            'text-xs font-medium text-white/80 text-center',
            'group-hover:text-white transition-colors'
          )}>
            {displayLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {renderContent()}
      
      {/* Hover effect gradient overlay */}
      <div className={cn(
        'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity',
        `bg-gradient-to-br ${config.color}`
      )} />
      
      {/* Tooltip on hover */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {displayLabel}
        </div>
      </div>
    </div>
  );
};

export default FixiaCategoryIcon;