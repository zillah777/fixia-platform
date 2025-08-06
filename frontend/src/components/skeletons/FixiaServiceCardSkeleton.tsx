import React from 'react';
import { motion } from 'framer-motion';
import { CardSkeleton, TextSkeleton, CircleSkeleton, Skeleton } from '../ui/skeleton';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { cn } from '@/lib/utils';

/**
 * Service Card Skeleton Component
 * 
 * Optimized for Fixia marketplace service listings with:
 * - Realistic service card layout matching actual components
 * - Staggered animations for multiple cards
 * - Mobile-optimized glass effects
 * - Accessibility compliance
 */

interface FixiaServiceCardSkeletonProps {
  /** Number of skeleton cards to display */
  count?: number;
  /** Layout variant */
  variant?: 'grid' | 'list' | 'compact';
  /** Glass effect intensity */
  glassVariant?: 'light' | 'medium' | 'strong';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
  /** Show price section */
  showPrice?: boolean;
  /** Show rating section */
  showRating?: boolean;
  /** Show availability badge */
  showAvailability?: boolean;
}

const FixiaServiceCardSkeleton: React.FC<FixiaServiceCardSkeletonProps> = ({
  count = 3,
  variant = 'grid',
  glassVariant = 'light',
  animation = 'shimmer',
  className,
  showPrice = true,
  showRating = true,
  showAvailability = true
}) => {
  const { glassClasses } = useOptimizedGlass(glassVariant);

  // Layout classes based on variant
  const layoutClasses = {
    grid: 'grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    list: 'space-y-4',
    compact: 'grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  // Individual service card skeleton
  const ServiceCardSkeletonItem: React.FC<{ index: number }> = ({ index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.1,
          ease: 'easeOut'
        }}
        className="group"
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-lg border border-white/10 p-4',
            'hover:border-white/20 transition-all duration-300',
            glassClasses,
            variant === 'list' && 'sm:flex sm:space-x-4 sm:space-y-0',
            variant === 'compact' && 'p-3'
          )}
          role="status"
          aria-label={`Cargando servicio ${index + 1}`}
        >
          {/* Service Image */}
          <div className={cn(
            'relative mb-3',
            variant === 'list' && 'sm:mb-0 sm:flex-shrink-0 sm:w-24 sm:h-24',
            variant === 'compact' && 'mb-2'
          )}>
            <Skeleton
              className={cn(
                'w-full aspect-video rounded-md',
                variant === 'list' && 'sm:aspect-square sm:w-24 sm:h-24',
                variant === 'compact' && 'aspect-square h-16'
              )}
              animation={animation}
              loadingText="Cargando imagen del servicio"
            />
            
            {/* Availability badge overlay */}
            {showAvailability && (
              <div className="absolute top-2 right-2">
                <Skeleton
                  width="60px"
                  height="20px"
                  radius="full"
                  animation={animation}
                  loadingText="Cargando disponibilidad"
                />
              </div>
            )}
          </div>

          {/* Service Content */}
          <div className={cn(
            'flex-1 space-y-3',
            variant === 'compact' && 'space-y-2'
          )}>
            {/* Service Header */}
            <div className="space-y-2">
              {/* Category */}
              <Skeleton
                width="80px"
                height="16px"
                radius="full"
                animation={animation}
                loadingText="Cargando categoría"
              />
              
              {/* Service Title */}
              <TextSkeleton
                lines={variant === 'compact' ? 1 : 2}
                lineHeight={variant === 'compact' ? 'sm' : 'md'}
                lastLineWidth="80%"
                animation={animation}
                loadingText="Cargando título del servicio"
              />
              
              {/* Provider Info */}
              <div className="flex items-center space-x-2">
                <CircleSkeleton
                  size={variant === 'compact' ? 'sm' : 'md'}
                  animation={animation}
                />
                <div className="flex-1 space-y-1">
                  <TextSkeleton
                    width="70%"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando nombre del profesional"
                  />
                  {variant !== 'compact' && (
                    <TextSkeleton
                      width="50%"
                      lineHeight="sm"
                      animation={animation}
                      loadingText="Cargando ubicación"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Service Description */}
            {variant !== 'compact' && (
              <div className="space-y-1">
                <TextSkeleton
                  lines={variant === 'list' ? 2 : 3}
                  lineHeight="sm"
                  lastLineWidth="60%"
                  animation={animation}
                  loadingText="Cargando descripción del servicio"
                />
              </div>
            )}

            {/* Rating and Price Section */}
            <div className={cn(
              'flex items-center justify-between pt-2',
              variant === 'compact' && 'pt-1'
            )}>
              {/* Rating */}
              {showRating && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Skeleton
                        key={i}
                        width="12px"
                        height="12px"
                        radius="sm"
                        animation={animation}
                      />
                    ))}
                  </div>
                  <TextSkeleton
                    width="40px"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando calificación"
                  />
                </div>
              )}

              {/* Price */}
              {showPrice && (
                <div className="text-right">
                  <TextSkeleton
                    width="80px"
                    lineHeight={variant === 'compact' ? 'sm' : 'md'}
                    animation={animation}
                    loadingText="Cargando precio"
                  />
                  {variant !== 'compact' && (
                    <TextSkeleton
                      width="60px"
                      lineHeight="sm"
                      animation={animation}
                      loadingText="Cargando unidad de precio"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {variant !== 'compact' && (
              <div className="flex space-x-2 pt-2">
                <Skeleton
                  className="flex-1"
                  height="36px"
                  radius="md"
                  animation={animation}
                  loadingText="Cargando botón principal"
                />
                <Skeleton
                  width="100px"
                  height="36px"
                  radius="md"
                  animation={animation}
                  loadingText="Cargando botón secundario"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={cn(layoutClasses[variant], className)}
      role="status"
      aria-label={`Cargando ${count} servicios`}
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, index) => (
        <ServiceCardSkeletonItem key={index} index={index} />
      ))}
    </div>
  );
};

/**
 * Compact Service List Skeleton - For search results
 */
interface FixiaServiceListSkeletonProps {
  count?: number;
  className?: string;
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
}

const FixiaServiceListSkeleton: React.FC<FixiaServiceListSkeletonProps> = ({
  count = 5,
  className,
  animation = 'shimmer'
}) => {
  const { glassClasses } = useOptimizedGlass('light');

  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Cargando lista de servicios">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={cn(
            'flex items-center space-x-3 p-3 rounded-lg border border-white/10',
            glassClasses
          )}
        >
          {/* Service thumbnail */}
          <Skeleton
            width="60px"
            height="60px"
            radius="md"
            animation={animation}
          />
          
          {/* Service info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <TextSkeleton width="60%" animation={animation} />
              <TextSkeleton width="80px" animation={animation} />
            </div>
            <div className="flex items-center space-x-2">
              <CircleSkeleton size="sm" animation={animation} />
              <TextSkeleton width="40%" lineHeight="sm" animation={animation} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} width="10px" height="10px" radius="sm" animation={animation} />
                ))}
              </div>
              <Skeleton width="60px" height="20px" radius="full" animation={animation} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export { FixiaServiceCardSkeleton, FixiaServiceListSkeleton };