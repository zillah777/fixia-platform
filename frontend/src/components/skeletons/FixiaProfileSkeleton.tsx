import React from 'react';
import { motion } from 'framer-motion';
import { CardSkeleton, TextSkeleton, CircleSkeleton, Skeleton } from '../ui/skeleton';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { cn } from '@/lib/utils';

/**
 * Profile Skeleton Component
 * 
 * Optimized for both AS professionals and Exploradores with:
 * - Complete profile header with avatar and basic info
 * - Skills, experience, and portfolio sections
 * - Reviews and ratings section
 * - Contact and action buttons
 * - Responsive layout for mobile and desktop
 */

interface FixiaProfileSkeletonProps {
  /** Profile type - affects layout and sections shown */
  profileType?: 'provider' | 'explorer';
  /** Glass effect intensity */
  variant?: 'light' | 'medium' | 'strong';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
  /** Show portfolio section (for providers) */
  showPortfolio?: boolean;
  /** Show services section (for providers) */
  showServices?: boolean;
  /** Show reviews section */
  showReviews?: boolean;
  /** Layout variant */
  layout?: 'full' | 'compact' | 'card';
}

const FixiaProfileSkeleton: React.FC<FixiaProfileSkeletonProps> = ({
  profileType = 'provider',
  variant = 'light',
  animation = 'shimmer',
  className,
  showPortfolio = true,
  showServices = true,
  showReviews = true,
  layout = 'full'
}) => {
  const { glassClasses } = useOptimizedGlass(variant);

  // Profile Header Section
  const ProfileHeaderSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 p-6',
        glassClasses
      )}
      role="status"
      aria-label="Cargando información del perfil"
    >
      {/* Cover photo area */}
      {layout === 'full' && (
        <div className="relative mb-6">
          <Skeleton
            height="120px"
            radius="md"
            animation={animation}
            loadingText="Cargando foto de portada"
          />
          
          {/* Avatar positioned over cover */}
          <div className="absolute -bottom-8 left-6">
            <CircleSkeleton
              size="xl"
              animation={animation}
              className="border-4 border-background"
            />
          </div>
        </div>
      )}

      {/* Profile content */}
      <div className={cn(
        'flex flex-col sm:flex-row sm:items-start sm:space-x-6',
        layout === 'full' && 'mt-8'
      )}>
        {/* Avatar for non-full layouts */}
        {layout !== 'full' && (
          <div className="flex-shrink-0 mb-4 sm:mb-0">
            <CircleSkeleton
              size={layout === 'compact' ? 'md' : 'lg'}
              animation={animation}
            />
          </div>
        )}

        {/* Profile info */}
        <div className="flex-1 space-y-4">
          {/* Name and title */}
          <div className="space-y-2">
            <TextSkeleton
              width="200px"
              lineHeight="lg"
              animation={animation}
              loadingText="Cargando nombre del usuario"
            />
            <TextSkeleton
              width="150px"
              lineHeight="md"
              animation={animation}
              loadingText="Cargando título profesional"
            />
            {profileType === 'provider' && (
              <div className="flex items-center space-x-2">
                <Skeleton
                  width="80px"
                  height="20px"
                  radius="full"
                  animation={animation}
                  loadingText="Cargando categoría"
                />
                <Skeleton
                  width="60px"
                  height="20px"
                  radius="full"
                  animation={animation}
                  loadingText="Cargando verificación"
                />
              </div>
            )}
          </div>

          {/* Location and basic info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton width="16px" height="16px" radius="sm" animation={animation} />
              <TextSkeleton
                width="120px"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando ubicación"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton width="16px" height="16px" radius="sm" animation={animation} />
              <TextSkeleton
                width="100px"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando tiempo de experiencia"
              />
            </div>
          </div>

          {/* Rating and stats for providers */}
          {profileType === 'provider' && (
            <div className="flex items-center space-x-6">
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton
                      key={i}
                      width="16px"
                      height="16px"
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
                <TextSkeleton
                  width="60px"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando número de reseñas"
                />
              </div>

              {/* Stats */}
              <div className="flex space-x-4">
                <div className="text-center">
                  <TextSkeleton
                    width="30px"
                    lineHeight="md"
                    animation={animation}
                    loadingText="Cargando número de servicios"
                  />
                  <TextSkeleton
                    width="50px"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando etiqueta de servicios"
                  />
                </div>
                <div className="text-center">
                  <TextSkeleton
                    width="30px"
                    lineHeight="md"
                    animation={animation}
                    loadingText="Cargando número de clientes"
                  />
                  <TextSkeleton
                    width="50px"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando etiqueta de clientes"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {layout === 'full' && (
            <div className="flex space-x-3 pt-4">
              <Skeleton
                width="120px"
                height="40px"
                radius="md"
                animation={animation}
                loadingText="Cargando botón principal"
              />
              <Skeleton
                width="100px"
                height="40px"
                radius="md"
                animation={animation}
                loadingText="Cargando botón secundario"
              />
              <Skeleton
                width="80px"
                height="40px"
                radius="md"
                animation={animation}
                loadingText="Cargando botón de favoritos"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // About Section
  const AboutSectionSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 p-6',
        glassClasses
      )}
      role="status"
      aria-label="Cargando información adicional"
    >
      <div className="space-y-4">
        <TextSkeleton
          width="120px"
          lineHeight="lg"
          animation={animation}
          loadingText="Cargando título de sección"
        />
        <TextSkeleton
          lines={4}
          lineHeight="md"
          lastLineWidth="70%"
          animation={animation}
          loadingText="Cargando descripción"
        />

        {/* Skills section for providers */}
        {profileType === 'provider' && (
          <div className="space-y-3">
            <TextSkeleton
              width="100px"
              lineHeight="md"
              animation={animation}
              loadingText="Cargando título de habilidades"
            />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton
                  key={i}
                  width={`${60 + (i * 10)}px`}
                  height="28px"
                  radius="full"
                  animation={animation}
                  loadingText={`Cargando habilidad ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Portfolio Section
  const PortfolioSectionSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 p-6',
        glassClasses
      )}
      role="status"
      aria-label="Cargando portafolio"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <TextSkeleton
            width="100px"
            lineHeight="lg"
            animation={animation}
            loadingText="Cargando título de portafolio"
          />
          <TextSkeleton
            width="80px"
            lineHeight="sm"
            animation={animation}
            loadingText="Cargando contador"
          />
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton
                className="aspect-square"
                radius="md"
                animation={animation}
                loadingText={`Cargando imagen de portafolio ${i + 1}`}
              />
              <TextSkeleton
                lines={2}
                lineHeight="sm"
                animation={animation}
                loadingText={`Cargando descripción ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Reviews Section
  const ReviewsSectionSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 p-6',
        glassClasses
      )}
      role="status"
      aria-label="Cargando reseñas"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <TextSkeleton
            width="100px"
            lineHeight="lg"
            animation={animation}
            loadingText="Cargando título de reseñas"
          />
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton
                  key={i}
                  width="16px"
                  height="16px"
                  radius="sm"
                  animation={animation}
                />
              ))}
            </div>
            <TextSkeleton
              width="60px"
              lineHeight="sm"
              animation={animation}
              loadingText="Cargando promedio"
            />
          </div>
        </div>

        {/* Individual reviews */}
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-3">
                <CircleSkeleton size="sm" animation={animation} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <TextSkeleton
                      width="120px"
                      lineHeight="sm"
                      animation={animation}
                      loadingText={`Cargando nombre del reviewer ${i + 1}`}
                    />
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Skeleton
                          key={j}
                          width="12px"
                          height="12px"
                          radius="sm"
                          animation={animation}
                        />
                      ))}
                    </div>
                  </div>
                  <TextSkeleton
                    lines={2}
                    lineHeight="sm"
                    lastLineWidth="80%"
                    animation={animation}
                    loadingText={`Cargando comentario ${i + 1}`}
                  />
                  <TextSkeleton
                    width="80px"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando fecha"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (layout === 'card') {
    return (
      <CardSkeleton
        variant={variant}
        hasHeader={true}
        hasFooter={true}
        animation={animation}
        className={className}
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <CircleSkeleton size="md" animation={animation} />
            <div className="flex-1 space-y-1">
              <TextSkeleton animation={animation} />
              <TextSkeleton width="70%" lineHeight="sm" animation={animation} />
            </div>
          </div>
          {profileType === 'provider' && (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} width="12px" height="12px" radius="sm" animation={animation} />
                ))}
              </div>
              <TextSkeleton width="40px" lineHeight="sm" animation={animation} />
            </div>
          )}
        </div>
      </CardSkeleton>
    );
  }

  return (
    <div className={cn('space-y-6', className)} role="status" aria-label="Cargando perfil completo">
      {/* Profile Header */}
      <ProfileHeaderSkeleton />

      {/* About Section */}
      <AboutSectionSkeleton />

      {/* Portfolio Section (for providers) */}
      {profileType === 'provider' && showPortfolio && (
        <PortfolioSectionSkeleton />
      )}

      {/* Reviews Section */}
      {showReviews && (
        <ReviewsSectionSkeleton />
      )}
    </div>
  );
};

/**
 * Profile List Item Skeleton - For search results or lists
 */
interface FixiaProfileListSkeletonProps {
  count?: number;
  showRating?: boolean;
  showLocation?: boolean;
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  className?: string;
}

const FixiaProfileListSkeleton: React.FC<FixiaProfileListSkeletonProps> = ({
  count = 5,
  showRating = true,
  showLocation = true,
  animation = 'shimmer',
  className
}) => {
  const { glassClasses } = useOptimizedGlass('light');

  return (
    <div className={cn('space-y-4', className)} role="status" aria-label="Cargando lista de perfiles">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            'flex items-center space-x-4 p-4 rounded-lg border border-white/10',
            glassClasses
          )}
        >
          <CircleSkeleton size="md" animation={animation} />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <TextSkeleton width="60%" animation={animation} />
              {showRating && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Skeleton key={i} width="10px" height="10px" radius="sm" animation={animation} />
                    ))}
                  </div>
                  <TextSkeleton width="30px" lineHeight="sm" animation={animation} />
                </div>
              )}
            </div>
            
            <TextSkeleton width="40%" lineHeight="sm" animation={animation} />
            
            {showLocation && (
              <div className="flex items-center space-x-2">
                <Skeleton width="12px" height="12px" radius="sm" animation={animation} />
                <TextSkeleton width="30%" lineHeight="sm" animation={animation} />
              </div>
            )}
            
            <div className="flex space-x-2">
              <Skeleton width="60px" height="20px" radius="full" animation={animation} />
              <Skeleton width="80px" height="20px" radius="full" animation={animation} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export { FixiaProfileSkeleton, FixiaProfileListSkeleton };