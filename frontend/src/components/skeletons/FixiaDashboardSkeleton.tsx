import React from 'react';
import { motion } from 'framer-motion';
import { CardSkeleton, TextSkeleton, CircleSkeleton, Skeleton } from '../ui/skeleton';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { cn } from '@/lib/utils';

/**
 * Dashboard Skeleton Component
 * 
 * Matches the FixiaSummaryCards layout with:
 * - 6 summary cards (services, rating, earnings, communication, profile, trust)
 * - Realistic dashboard metrics layout
 * - Staggered animations for smooth loading experience
 * - Mobile-responsive grid system
 */

interface FixiaDashboardSkeletonProps {
  /** Glass effect intensity */
  variant?: 'light' | 'medium' | 'strong';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
  /** Show header section */
  showHeader?: boolean;
  /** Number of summary cards */
  cardCount?: number;
}

const FixiaDashboardSkeleton: React.FC<FixiaDashboardSkeletonProps> = ({
  variant = 'light',
  animation = 'shimmer',
  className,
  showHeader = true,
  cardCount = 6
}) => {
  const { glassClasses } = useOptimizedGlass(variant);

  // Individual summary card skeleton
  const SummaryCardSkeleton: React.FC<{ index: number; cardType: string }> = ({ index, cardType }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: 0.9 + (index * 0.1),
          ease: 'easeOut'
        }}
        className="group"
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-lg border border-white/10 p-4',
            'hover:border-white/20 transition-all duration-300',
            glassClasses
          )}
          role="status"
          aria-label={`Cargando tarjeta de ${cardType}`}
        >
          {/* Card Header */}
          <div className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-2">
              {/* Icon placeholder */}
              <Skeleton
                width="16px"
                height="16px"
                radius="sm"
                animation={animation}
                loadingText="Cargando icono"
              />
              {/* Title */}
              <TextSkeleton
                width="120px"
                lineHeight="md"
                animation={animation}
                loadingText={`Cargando título de ${cardType}`}
              />
            </div>
            
            {/* Optional badge */}
            {(index === 1 || index === 2 || index === 4) && (
              <Skeleton
                width="80px"
                height="20px"
                radius="full"
                animation={animation}
                loadingText="Cargando estado"
              />
            )}
          </div>

          {/* Card Content */}
          <div className="space-y-3">
            {/* Main metric */}
            <div className="flex items-center space-x-2">
              <TextSkeleton
                width="120px"
                lineHeight="lg"
                animation={animation}
                loadingText="Cargando métrica principal"
              />
              
              {/* Special elements for specific cards */}
              {index === 1 && ( // Rating card - stars
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
              )}
              
              {index === 4 && ( // Profile card - percentage badge
                <Skeleton
                  width="60px"
                  height="20px"
                  radius="full"
                  animation={animation}
                />
              )}
            </div>

            {/* Detailed metrics */}
            <div className="space-y-2">
              {/* First metric row */}
              <div className="flex justify-between text-sm">
                <TextSkeleton
                  width="60%"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando descripción"
                />
                <TextSkeleton
                  width="30%"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando valor"
                />
              </div>
              
              {/* Second metric row */}
              <div className="flex justify-between text-sm">
                <TextSkeleton
                  width="70%"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando descripción"
                />
                <TextSkeleton
                  width="25%"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando valor"
                />
              </div>

              {/* Third metric row (for earnings card) */}
              {index === 2 && (
                <div className="flex justify-between text-sm">
                  <TextSkeleton
                    width="65%"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando descripción"
                  />
                  <TextSkeleton
                    width="35%"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando valor"
                  />
                </div>
              )}
            </div>

            {/* Progress bar */}
            <Skeleton
              height="8px"
              radius="full"
              animation={animation}
              loadingText="Cargando progreso"
            />

            {/* Bottom description */}
            <TextSkeleton
              lines={index === 2 ? 2 : 1} // Earnings card has more text
              lineHeight="sm"
              lastLineWidth="80%"
              animation={animation}
              loadingText="Cargando descripción adicional"
            />

            {/* Special bottom sections */}
            {index === 2 && ( // Earnings card - special promotion box
              <div className="mt-3 p-2 bg-blue-500/10 rounded-lg">
                <TextSkeleton
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando promoción"
                />
              </div>
            )}

            {index === 3 && ( // Communication card - button
              <Skeleton
                height="36px"
                radius="md"
                animation={animation}
                loadingText="Cargando botón de acción"
              />
            )}

            {index === 5 && ( // Trust center card - button
              <Skeleton
                height="32px"
                radius="md"
                animation={animation}
                loadingText="Cargando botón de acción"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const cardTypes = [
    'servicios activos',
    'reputación',
    'ingresos',
    'comunicación',
    'perfil',
    'confianza'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className={cn('space-y-6', className)}
      role="status"
      aria-label="Cargando resumen del dashboard"
      aria-live="polite"
    >
      {/* Header Section */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <TextSkeleton
              width="200px"
              lineHeight="lg"
              animation={animation}
              loadingText="Cargando título del dashboard"
            />
            <TextSkeleton
              width="300px"
              lineHeight="sm"
              animation={animation}
              loadingText="Cargando descripción del dashboard"
            />
          </div>
          <Skeleton
            width="120px"
            height="24px"
            radius="full"
            animation={animation}
            loadingText="Cargando período de tiempo"
          />
        </div>
      )}
      
      {/* Summary Cards Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cardCount }, (_, index) => (
          <SummaryCardSkeleton 
            key={index} 
            index={index} 
            cardType={cardTypes[index] || 'métrica'}
          />
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Mini Dashboard Stats Skeleton - For compact views
 */
interface FixiaMiniDashboardSkeletonProps {
  /** Number of mini stat cards */
  count?: number;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
}

const FixiaMiniDashboardSkeleton: React.FC<FixiaMiniDashboardSkeletonProps> = ({
  count = 4,
  orientation = 'horizontal',
  animation = 'shimmer',
  className
}) => {
  const { glassClasses } = useOptimizedGlass('light');

  const layoutClasses = {
    horizontal: 'flex space-x-4 overflow-x-auto pb-2',
    vertical: 'space-y-3'
  };

  return (
    <div 
      className={cn(layoutClasses[orientation], className)}
      role="status"
      aria-label="Cargando estadísticas resumidas"
    >
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            'flex-shrink-0 p-3 rounded-lg border border-white/10',
            glassClasses,
            orientation === 'horizontal' && 'w-32'
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton
                width="16px"
                height="16px"
                radius="sm"
                animation={animation}
              />
              <TextSkeleton
                width="20px"
                lineHeight="sm"
                animation={animation}
              />
            </div>
            <TextSkeleton
              width="60px"
              lineHeight="lg"
              animation={animation}
            />
            <TextSkeleton
              width="80%"
              lineHeight="sm"
              animation={animation}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export { FixiaDashboardSkeleton, FixiaMiniDashboardSkeleton };