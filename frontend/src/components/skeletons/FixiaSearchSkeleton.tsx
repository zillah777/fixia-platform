import React from 'react';
import { motion } from 'framer-motion';
import { TextSkeleton, CircleSkeleton, Skeleton } from '../ui/skeleton';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { cn } from '@/lib/utils';

/**
 * Search Skeleton Components
 * 
 * Comprehensive search loading states including:
 * - Search bar and filters
 * - Search results in various layouts
 * - Category filters and facets
 * - Sort and pagination controls
 * - Mobile-optimized responsive design
 */

interface FixiaSearchSkeletonProps {
  /** Search layout type */
  layout?: 'full' | 'results-only' | 'filters-only' | 'compact';
  /** Glass effect intensity */
  variant?: 'light' | 'medium' | 'strong';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
  /** Number of result items */
  resultCount?: number;
  /** Show filter sidebar */
  showFilters?: boolean;
  /** Show sort controls */
  showSort?: boolean;
  /** Results layout */
  resultsLayout?: 'grid' | 'list';
}

const FixiaSearchSkeleton: React.FC<FixiaSearchSkeletonProps> = ({
  layout = 'full',
  variant = 'light',
  animation = 'shimmer',
  className,
  resultCount = 6,
  showFilters = true,
  showSort = true,
  resultsLayout = 'grid'
}) => {
  const { glassClasses } = useOptimizedGlass(variant);

  // Search Header with Search Bar
  const SearchHeaderSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 p-6 mb-6',
        glassClasses
      )}
      role="status"
      aria-label="Cargando barra de búsqueda"
    >
      {/* Search title */}
      <div className="mb-4">
        <TextSkeleton
          width="200px"
          lineHeight="lg"
          animation={animation}
          loadingText="Cargando título de búsqueda"
        />
        <TextSkeleton
          width="300px"
          lineHeight="sm"
          animation={animation}
          loadingText="Cargando descripción"
        />
      </div>

      {/* Search input */}
      <div className="flex space-x-3 mb-4">
        <div className="flex-1">
          <Skeleton
            height="48px"
            radius="lg"
            animation={animation}
            loadingText="Cargando campo de búsqueda"
          />
        </div>
        <Skeleton
          width="120px"
          height="48px"
          radius="md"
          animation={animation}
          loadingText="Cargando botón de búsqueda"
        />
      </div>

      {/* Quick filter tags */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            width={`${80 + (i * 10)}px`}
            height="32px"
            radius="full"
            animation={animation}
            loadingText={`Cargando filtro rápido ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );

  // Filter Sidebar
  const FilterSidebarSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6"
      role="status"
      aria-label="Cargando filtros de búsqueda"
    >
      {/* Filter sections */}
      {Array.from({ length: 4 }, (_, sectionIndex) => (
        <div
          key={sectionIndex}
          className={cn(
            'relative overflow-hidden rounded-lg border border-white/10 p-4',
            glassClasses
          )}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <TextSkeleton
              width="100px"
              lineHeight="md"
              animation={animation}
              loadingText={`Cargando título de filtro ${sectionIndex + 1}`}
            />
            <Skeleton
              width="16px"
              height="16px"
              radius="sm"
              animation={animation}
              loadingText="Cargando icono de expandir"
            />
          </div>

          {/* Filter options */}
          <div className="space-y-2">
            {Array.from({ length: sectionIndex === 0 ? 6 : 4 }, (_, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <Skeleton
                  width="16px"
                  height="16px"
                  radius="sm"
                  animation={animation}
                  loadingText="Cargando checkbox"
                />
                <TextSkeleton
                  width={`${60 + (optionIndex * 15)}%`}
                  lineHeight="sm"
                  animation={animation}
                  loadingText={`Cargando opción ${optionIndex + 1}`}
                />
                <TextSkeleton
                  width="20px"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando contador"
                />
              </div>
            ))}
          </div>

          {/* Show more button for first section */}
          {sectionIndex === 0 && (
            <div className="mt-3 pt-2 border-t border-white/10">
              <TextSkeleton
                width="80px"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando botón ver más"
              />
            </div>
          )}
        </div>
      ))}

      {/* Clear filters button */}
      <Skeleton
        height="36px"
        radius="md"
        animation={animation}
        loadingText="Cargando botón limpiar filtros"
      />
    </motion.div>
  );

  // Results Header with Sort and Count
  const ResultsHeaderSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="flex items-center justify-between mb-6"
      role="status"
      aria-label="Cargando cabecera de resultados"
    >
      {/* Results count */}
      <div className="flex items-center space-x-3">
        <TextSkeleton
          width="150px"
          lineHeight="md"
          animation={animation}
          loadingText="Cargando contador de resultados"
        />
        <Skeleton
          width="80px"
          height="28px"
          radius="full"
          animation={animation}
          loadingText="Cargando filtro activo"
        />
      </div>

      {/* Sort and view controls */}
      <div className="flex items-center space-x-3">
        {/* Sort dropdown */}
        {showSort && (
          <div className="flex items-center space-x-2">
            <TextSkeleton
              width="60px"
              lineHeight="sm"
              animation={animation}
              loadingText="Cargando etiqueta ordenar"
            />
            <Skeleton
              width="120px"
              height="36px"
              radius="md"
              animation={animation}
              loadingText="Cargando selector de ordenamiento"
            />
          </div>
        )}

        {/* View toggle */}
        <div className="flex border border-white/10 rounded-md overflow-hidden">
          <Skeleton
            width="36px"
            height="36px"
            radius="sm"
            animation={animation}
            loadingText="Cargando vista de grilla"
          />
          <Skeleton
            width="36px"
            height="36px"
            radius="sm"
            animation={animation}
            loadingText="Cargando vista de lista"
          />
        </div>
      </div>
    </motion.div>
  );

  // Search Results Grid
  const SearchResultsGridSkeleton: React.FC = () => (
    <div className={cn(
      'grid gap-4 sm:gap-6',
      resultsLayout === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1'
    )}>
      {Array.from({ length: resultCount }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
          className={cn(
            'relative overflow-hidden rounded-lg border border-white/10 p-4',
            'hover:border-white/20 transition-all duration-300',
            glassClasses,
            resultsLayout === 'list' && 'sm:flex sm:space-x-4'
          )}
          role="status"
          aria-label={`Cargando resultado ${index + 1}`}
        >
          {/* Result image */}
          <div className={cn(
            'relative mb-3',
            resultsLayout === 'list' && 'sm:mb-0 sm:flex-shrink-0 sm:w-32'
          )}>
            <Skeleton
              className={cn(
                'w-full aspect-video rounded-md',
                resultsLayout === 'list' && 'sm:aspect-square sm:w-32 sm:h-32'
              )}
              animation={animation}
              loadingText="Cargando imagen del resultado"
            />
            
            {/* Badge overlay */}
            <div className="absolute top-2 right-2">
              <Skeleton
                width="60px"
                height="20px"
                radius="full"
                animation={animation}
                loadingText="Cargando etiqueta"
              />
            </div>
          </div>

          {/* Result content */}
          <div className={cn(
            'flex-1 space-y-3',
            resultsLayout === 'list' && 'sm:space-y-2'
          )}>
            {/* Category and title */}
            <div className="space-y-2">
              <Skeleton
                width="80px"
                height="16px"
                radius="full"
                animation={animation}
                loadingText="Cargando categoría"
              />
              <TextSkeleton
                lines={resultsLayout === 'list' ? 1 : 2}
                lineHeight="md"
                lastLineWidth="80%"
                animation={animation}
                loadingText="Cargando título"
              />
            </div>

            {/* Provider info */}
            <div className="flex items-center space-x-2">
              <CircleSkeleton size="sm" animation={animation} />
              <div className="flex-1 space-y-1">
                <TextSkeleton
                  width="60%"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando nombre del proveedor"
                />
                <TextSkeleton
                  width="40%"
                  lineHeight="sm"
                  animation={animation}
                  loadingText="Cargando ubicación"
                />
              </div>
            </div>

            {/* Rating and price */}
            <div className="flex items-center justify-between">
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
              
              <div className="text-right">
                <TextSkeleton
                  width="80px"
                  lineHeight="md"
                  animation={animation}
                  loadingText="Cargando precio"
                />
              </div>
            </div>

            {/* Action buttons for list view */}
            {resultsLayout === 'list' && (
              <div className="flex space-x-2">
                <Skeleton
                  width="100px"
                  height="32px"
                  radius="md"
                  animation={animation}
                  loadingText="Cargando botón principal"
                />
                <Skeleton
                  width="80px"
                  height="32px"
                  radius="md"
                  animation={animation}
                  loadingText="Cargando botón secundario"
                />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Pagination
  const PaginationSkeleton: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
      className="flex items-center justify-between mt-8"
      role="status"
      aria-label="Cargando paginación"
    >
      <TextSkeleton
        width="120px"
        lineHeight="sm"
        animation={animation}
        loadingText="Cargando información de página"
      />
      
      <div className="flex space-x-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton
            key={i}
            width="36px"
            height="36px"
            radius="md"
            animation={animation}
            loadingText={`Cargando página ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );

  // Main layout rendering
  if (layout === 'filters-only') {
    return (
      <div className={className}>
        <FilterSidebarSkeleton />
      </div>
    );
  }

  if (layout === 'results-only') {
    return (
      <div className={className}>
        {showSort && <ResultsHeaderSkeleton />}
        <SearchResultsGridSkeleton />
        <PaginationSkeleton />
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Compact search bar */}
        <div className={cn('p-4 rounded-lg border border-white/10', glassClasses)}>
          <div className="flex space-x-2">
            <Skeleton className="flex-1" height="40px" radius="lg" animation={animation} />
            <Skeleton width="80px" height="40px" radius="md" animation={animation} />
          </div>
        </div>
        
        {/* Compact results */}
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className={cn('flex items-center space-x-3 p-3 rounded-lg border border-white/10', glassClasses)}
            >
              <Skeleton width="60px" height="60px" radius="md" animation={animation} />
              <div className="flex-1 space-y-1">
                <TextSkeleton animation={animation} />
                <TextSkeleton width="60%" lineHeight="sm" animation={animation} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full layout
  return (
    <div className={cn('space-y-6', className)}>
      {/* Search header */}
      <SearchHeaderSkeleton />

      {/* Main content */}
      <div className="flex gap-6">
        {/* Filters sidebar */}
        {showFilters && (
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <FilterSidebarSkeleton />
          </div>
        )}

        {/* Results area */}
        <div className="flex-1">
          {showSort && <ResultsHeaderSkeleton />}
          <SearchResultsGridSkeleton />
          <PaginationSkeleton />
        </div>
      </div>
    </div>
  );
};

export { FixiaSearchSkeleton };