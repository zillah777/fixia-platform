'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback } from './avatar';
import { FixiaImage } from './fixia-image';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface FixiaAvatarProps {
  src?: string | undefined;
  alt?: string;
  fallbackText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'glass' | 'professional' | 'client';
  className?: string;
  priority?: boolean;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  quality?: number;
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-24 w-24',
};

const variantClasses = {
  default: '',
  glass: 'ring-2 ring-white/20 glass-light',
  professional: 'ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/20',
  client: 'ring-2 ring-purple-400/30 shadow-lg shadow-purple-500/20',
};

/**
 * FixiaAvatar - Optimized avatar component for Fixia platform users
 * 
 * Features:
 * - Next.js Image optimization for profile pictures
 * - Liquid Glass design system integration
 * - Professional and client variants
 * - Online status indicator
 * - Smart fallback with user initials
 * - Mobile-optimized loading
 * - Accessibility compliance
 */
export const FixiaAvatar: React.FC<FixiaAvatarProps> = ({
  src,
  alt = 'Avatar del usuario',
  fallbackText,
  size = 'md',
  variant = 'default',
  className,
  priority = false,
  showOnlineIndicator = false,
  isOnline = false,
  quality = 90,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Extract initials from fallbackText or alt
  const getInitials = (text: string = '') => {
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(fallbackText || alt);

  return (
    <div className="relative inline-block">
      <Avatar 
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          'transition-all duration-300 hover:scale-105',
          className
        )}
      >
        {src && !imageError ? (
          <FixiaImage
            src={src}
            alt={alt}
            fill
            priority={priority}
            quality={quality}
            aspectRatio="square"
            objectFit="cover"
            loadingType="none"
            fallbackSrc=""
            sizes="(max-width: 768px) 64px, 96px"
            className="rounded-full"
            onLoadingComplete={() => {
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={() => {
              console.warn('Avatar image failed to load:', src);
              setImageError(true);
            }}
          />
        ) : (
          <AvatarFallback 
            className={cn(
              'text-white font-medium border-0',
              variant === 'default' && 'bg-gradient-to-br from-white/20 to-white/10',
              variant === 'glass' && 'glass-light text-white/90',
              variant === 'professional' && 'bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-400/30',
              variant === 'client' && 'bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-400/30'
            )}
          >
            {initials || <User className="h-1/2 w-1/2" />}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Online Status Indicator */}
      {showOnlineIndicator && (
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white/20',
          'transition-all duration-300',
          isOnline ? 'bg-green-500' : 'bg-gray-400',
          size === 'xs' && 'h-2 w-2',
          size === 'sm' && 'h-2.5 w-2.5',
          size === 'md' && 'h-3 w-3',
          size === 'lg' && 'h-3.5 w-3.5',
          size === 'xl' && 'h-4 w-4',
          size === '2xl' && 'h-5 w-5'
        )}>
          {isOnline && (
            <div className="absolute inset-0.5 rounded-full bg-green-400 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
};

export default FixiaAvatar;