'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

export interface FixiaImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'video' | 'wide';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loadingType?: 'skeleton' | 'blur' | 'none';
  fallbackSrc?: string;
  onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
  onError?: () => void;
  children?: React.ReactNode;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
};

/**
 * FixiaImage - Enhanced Next.js Image wrapper optimized for the Fixia platform
 * 
 * Features:
 * - Automatic WebP optimization with fallbacks
 * - Responsive image sizing for Argentine mobile-first approach
 * - Liquid Glass design system integration
 * - Smart loading states with skeleton placeholders
 * - Error handling with fallback images
 * - Mobile optimization for slower connections
 * - Accessibility compliance
 */
export const FixiaImage: React.FC<FixiaImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality = 85,
  className,
  containerClassName,
  aspectRatio,
  objectFit = 'cover',
  loadingType = 'skeleton',
  fallbackSrc = '/images/placeholder.jpg',
  onLoadingComplete,
  onError,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoadingComplete = (result: { naturalWidth: number; naturalHeight: number }) => {
    setIsLoading(false);
    onLoadingComplete?.(result);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (currentSrc !== fallbackSrc && fallbackSrc !== '/images/placeholder.jpg') {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  // Generate responsive sizes for Argentine mobile-first approach
  const defaultSizes = fill 
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : sizes;

  // Container classes with Liquid Glass integration
  const containerClasses = cn(
    'relative overflow-hidden',
    aspectRatio && aspectRatioClasses[aspectRatio],
    'bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm',
    containerClassName
  );

  // Image classes with optimizations
  const imageClasses = cn(
    'transition-all duration-300',
    fill ? 'object-cover' : undefined,
    className
  );

  return (
    <div className={containerClasses}>
      {/* Loading Skeleton */}
      {isLoading && loadingType === 'skeleton' && (
        <div className="absolute inset-0 z-10">
          <Skeleton 
            className="w-full h-full rounded-lg glass-light"
            loadingText="Cargando imagen..."
          />
        </div>
      )}

      {/* Error State - Only show for non-avatar images */}
      {hasError && currentSrc === fallbackSrc && !className?.includes('rounded-full') && (
        <div className="absolute inset-0 z-10 flex items-center justify-center glass-light rounded-lg">
          <div className="text-center text-white/70">
            <div className="w-12 h-12 mx-auto mb-2 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p className="text-xs">Imagen no disponible</p>
          </div>
        </div>
      )}

      {/* Next.js Optimized Image */}
      <Image
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={defaultSizes}
        priority={priority}
        quality={quality}
        className={cn(
          imageClasses,
          objectFit && !fill && `object-${objectFit}`,
          isLoading && loadingType === 'blur' && 'blur-sm',
          !isLoading && 'blur-0'
        )}
        style={fill ? { objectFit } : undefined}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        placeholder={loadingType === 'blur' ? 'blur' : 'empty'}
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />

      {/* Overlay Content */}
      {children && (
        <div className="absolute inset-0 z-20">
          {children}
        </div>
      )}
    </div>
  );
};

export default FixiaImage;