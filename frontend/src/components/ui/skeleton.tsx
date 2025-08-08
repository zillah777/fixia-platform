import React from 'react';
import { motion } from 'framer-motion';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { cn } from '@/lib/utils';

/**
 * Base Skeleton Component with Liquid Glass Design System
 * 
 * Features:
 * - Glass morphism effects optimized for mobile
 * - Accessibility-compliant with screen reader announcements
 * - Performance-optimized animations with reduced motion support
 * - Adaptive shimmer effects based on content type
 * - Brand-consistent colors matching Fixia's design system
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glass intensity level */
  variant?: 'light' | 'medium' | 'strong';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Height of the skeleton */
  height?: string | number;
  /** Width of the skeleton */
  width?: string | number;
  /** Border radius */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Loading state description for accessibility */
  loadingText?: string;
  /** Disable all animations (respects prefers-reduced-motion) */
  noAnimation?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({
  className,
  variant = 'light',
  animation = 'shimmer',
  height,
  width,
  radius = 'md',
  loadingText = 'Cargando contenido',
  noAnimation = false,
  style,
  ...props
}, ref) => {
  const { glassClasses } = useOptimizedGlass(variant);
  
  // Animation variants for different skeleton types
  const animationVariants = {
    pulse: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    shimmer: {
      background: [
        'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
        'linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 150%, rgba(255,255,255,0.1) 200%)'
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    },
    wave: {
      scaleX: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    none: {}
  };

  // Radius mapping
  const radiusClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Combine styles and filter out undefined values for exactOptionalPropertyTypes compatibility
  const combinedStyle: Record<string, string | number> = {};
  
  // Add height if defined
  if (height !== undefined) {
    combinedStyle['height'] = typeof height === 'number' ? `${height}px` : height;
  }
  
  // Add width if defined
  if (width !== undefined) {
    combinedStyle['width'] = typeof width === 'number' ? `${width}px` : width;
  }
  
  // Add external styles, filtering out undefined values
  if (style) {
    Object.entries(style).forEach(([key, value]) => {
      if (value !== undefined) {
        combinedStyle[key] = value as string | number;
      }
    });
  }

  // Filter out undefined values from props for exactOptionalPropertyTypes compatibility
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined)
  );

  return (
    <motion.div
      ref={ref}
      className={cn(
        // Base skeleton styles
        'relative overflow-hidden bg-white/10',
        // Glass effects
        glassClasses,
        // Border radius
        radiusClasses[radius],
        // Responsive improvements
        'will-change-transform transform-gpu',
        // Accessibility
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
      style={combinedStyle}
      initial={false}
      animate={!noAnimation && animation !== 'none' ? animationVariants[animation] : {}}
      role="status"
      aria-label={loadingText}
      aria-live="polite"
      {...filteredProps}
    >
      {/* Shimmer overlay for enhanced effect */}
      {animation === 'shimmer' && !noAnimation && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
      
      {/* Screen reader content */}
      <span className="sr-only">{loadingText}</span>
    </motion.div>
  );
});

Skeleton.displayName = 'Skeleton';

/**
 * Text Skeleton - Optimized for text content
 */
interface TextSkeletonProps extends Omit<SkeletonProps, 'height'> {
  /** Number of lines */
  lines?: number;
  /** Line height */
  lineHeight?: 'sm' | 'md' | 'lg';
  /** Last line width (for realistic text appearance) */
  lastLineWidth?: string;
}

const TextSkeleton = React.forwardRef<HTMLDivElement, TextSkeletonProps>(({
  lines = 1,
  lineHeight = 'md',
  lastLineWidth = '75%',
  className,
  ...props
}, ref) => {
  const lineHeights = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5'
  };

  if (lines === 1) {
    return (
      <Skeleton
        ref={ref}
        className={cn(lineHeights[lineHeight], 'w-full', className)}
        {...props}
      />
    );
  }

  return (
    <div ref={ref} className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn(
            lineHeights[lineHeight],
            index === lines - 1 ? `w-[${lastLineWidth}]` : 'w-full'
          )}
          {...props}
        />
      ))}
    </div>
  );
});

TextSkeleton.displayName = 'TextSkeleton';

/**
 * Circle Skeleton - For avatars and profile images
 */
interface CircleSkeletonProps extends Omit<SkeletonProps, 'radius'> {
  /** Size of the circle */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CircleSkeleton = React.forwardRef<HTMLDivElement, CircleSkeletonProps>(({
  size = 'md',
  className,
  ...props
}, ref) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <Skeleton
      ref={ref}
      className={cn(sizes[size], 'flex-shrink-0', className)}
      radius="full"
      {...props}
    />
  );
});

CircleSkeleton.displayName = 'CircleSkeleton';

/**
 * Card Skeleton - For card-based layouts
 */
interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glass variant */
  variant?: 'light' | 'medium' | 'strong';
  /** Card padding */
  padding?: 'sm' | 'md' | 'lg';
  /** Include header section */
  hasHeader?: boolean;
  /** Include footer section */
  hasFooter?: boolean;
  /** Animation type */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(({
  className,
  variant = 'light',
  padding = 'md',
  hasHeader = true,
  hasFooter = false,
  animation = 'shimmer',
  children,
  ...props
}, ref) => {
  const { glassClasses } = useOptimizedGlass(variant);
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10',
        glassClasses,
        paddingClasses[padding],
        className
      )}
      role="status"
      aria-label="Cargando tarjeta de contenido"
      {...props}
    >
      {hasHeader && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-3">
            <CircleSkeleton size="sm" animation={animation} />
            <div className="space-y-1 flex-1">
              <TextSkeleton lineHeight="sm" animation={animation} />
              <TextSkeleton width="60%" lineHeight="sm" animation={animation} />
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {children || (
          <>
            <TextSkeleton lines={2} animation={animation} />
            <div className="flex space-x-2">
              <Skeleton width="80px" height="24px" radius="full" animation={animation} />
              <Skeleton width="60px" height="24px" radius="full" animation={animation} />
            </div>
          </>
        )}
      </div>
      
      {hasFooter && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center">
            <TextSkeleton width="40%" animation={animation} />
            <Skeleton width="80px" height="32px" radius="md" animation={animation} />
          </div>
        </div>
      )}
    </div>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

export {
  Skeleton,
  TextSkeleton,
  CircleSkeleton,
  CardSkeleton,
  type SkeletonProps,
  type TextSkeletonProps,
  type CircleSkeletonProps,
  type CardSkeletonProps
};