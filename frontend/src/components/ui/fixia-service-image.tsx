'use client';

import React from 'react';
import { FixiaImage, FixiaImageProps } from './fixia-image';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { Heart, BookmarkPlus, Eye, Star } from 'lucide-react';
import { Button } from './button';

export interface FixiaServiceImageProps extends Omit<FixiaImageProps, 'aspectRatio'> {
  variant?: 'card' | 'gallery' | 'featured' | 'portfolio';
  showOverlay?: boolean;
  overlayContent?: React.ReactNode;
  isFeatured?: boolean;
  isFavorite?: boolean;
  rating?: number;
  portfolioCount?: number;
  onFavoriteClick?: () => void;
  onBookmarkClick?: () => void;
  onViewClick?: () => void;
  isAvailable?: boolean;
  availabilityText?: string;
}

/**
 * FixiaServiceImage - Specialized image component for services and portfolios
 * 
 * Features:
 * - Optimized for service showcase images
 * - Interactive overlay with favorite/bookmark actions
 * - Portfolio count indicators
 * - Availability status badges
 * - Rating display integration
 * - Hover effects with Liquid Glass aesthetics
 * - Professional service presentation
 */
export const FixiaServiceImage: React.FC<FixiaServiceImageProps> = ({
  variant = 'card',
  showOverlay = true,
  overlayContent,
  isFeatured = false,
  isFavorite = false,
  rating,
  portfolioCount,
  onFavoriteClick,
  onBookmarkClick,
  onViewClick,
  isAvailable = true,
  availabilityText = 'Disponible',
  className,
  containerClassName,
  children,
  ...imageProps
}) => {
  const variantStyles = {
    card: {
      aspectRatio: 'landscape' as const,
      containerClass: 'rounded-lg overflow-hidden',
      overlayClass: 'opacity-0 group-hover:opacity-100',
    },
    gallery: {
      aspectRatio: 'square' as const,
      containerClass: 'rounded-md overflow-hidden',
      overlayClass: 'opacity-0 hover:opacity-100',
    },
    featured: {
      aspectRatio: 'video' as const,
      containerClass: 'rounded-xl overflow-hidden',
      overlayClass: 'opacity-0 group-hover:opacity-100',
    },
    portfolio: {
      aspectRatio: 'square' as const,
      containerClass: 'rounded-lg overflow-hidden',
      overlayClass: 'opacity-0 hover:opacity-100',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className={cn('group relative', currentVariant.containerClass)}>
      <FixiaImage
        {...imageProps}
        aspectRatio={currentVariant.aspectRatio}
        className={cn(
          'transition-transform duration-300 group-hover:scale-105',
          className
        )}
        containerClassName={cn(
          'relative',
          containerClassName
        )}
        fallbackSrc="/images/placeholder-service.jpg"
        quality={variant === 'featured' ? 95 : 85}
      >
        {/* Gradient Overlay */}
        {showOverlay && (
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
            'transition-opacity duration-300',
            currentVariant.overlayClass
          )} />
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {/* Availability Badge */}
          <Badge 
            className={cn(
              'text-xs border-0',
              isAvailable 
                ? 'bg-green-500/80 text-white' 
                : 'bg-red-500/80 text-white'
            )}
          >
            {availabilityText}
          </Badge>

          {/* Featured Badge */}
          {isFeatured && (
            <Badge className="bg-yellow-500/80 text-white text-xs border-0">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Destacado
            </Badge>
          )}
        </div>

        {/* Top-right action buttons */}
        {showOverlay && (onFavoriteClick || onBookmarkClick) && (
          <div className={cn(
            'absolute top-3 right-3 flex space-x-1',
            'transition-opacity duration-300',
            currentVariant.overlayClass
          )}>
            {onFavoriteClick && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteClick();
                }}
                className={cn(
                  'w-8 h-8 rounded-full glass transition-all duration-300',
                  isFavorite 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-white/70 hover:text-white'
                )}
                title={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
              </Button>
            )}

            {onBookmarkClick && !isFavorite && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkClick();
                }}
                className="w-8 h-8 rounded-full glass text-white/70 hover:text-white transition-all duration-300"
                title="Agregar a lista de deseos"
              >
                <BookmarkPlus className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Bottom-left rating */}
        {rating && rating > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-black/50 text-white text-xs border-0">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </Badge>
          </div>
        )}

        {/* Bottom-right portfolio count */}
        {portfolioCount && portfolioCount > 1 && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/50 text-white text-xs border-0">
              +{portfolioCount - 1} fotos
            </Badge>
          </div>
        )}

        {/* View button overlay (for gallery/portfolio variants) */}
        {onViewClick && (variant === 'gallery' || variant === 'portfolio') && (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center',
            'transition-opacity duration-300',
            currentVariant.overlayClass
          )}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewClick();
              }}
              className="glass text-white hover:text-white/90"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </Button>
          </div>
        )}

        {/* Custom overlay content */}
        {overlayContent && (
          <div className={cn(
            'absolute inset-0',
            'transition-opacity duration-300',
            currentVariant.overlayClass
          )}>
            {overlayContent}
          </div>
        )}

        {/* Children content */}
        {children}
      </FixiaImage>
    </div>
  );
};

export default FixiaServiceImage;