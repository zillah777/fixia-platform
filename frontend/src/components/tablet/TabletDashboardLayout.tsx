'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  GripVertical, 
  Maximize2, 
  Minimize2, 
  X,
  RotateCcw,
  Settings,
  Grid3X3,
  Columns2,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTabletNavigation } from '@/contexts/TabletNavigationContext';
import { useAccessibilityPreferences } from '@/utils/accessibility';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  defaultSize: 'small' | 'medium' | 'large' | 'full';
  resizable?: boolean;
  closable?: boolean;
  minWidth?: number;
  minHeight?: number;
  gridSpan?: {
    sm: number;
    md: number;
    lg: number;
  };
}

interface TabletDashboardLayoutProps {
  widgets: DashboardWidget[];
  className?: string;
  showLayoutControls?: boolean;
  onWidgetResize?: (widgetId: string, size: { width: number; height: number }) => void;
  onWidgetClose?: (widgetId: string) => void;
  onLayoutChange?: (layout: 'single' | 'dual' | 'multi') => void;
}

interface DashboardWidgetWrapperProps {
  widget: DashboardWidget;
  layout: 'single' | 'dual' | 'multi';
  columnCount: 1 | 2 | 3;
  onResize?: (size: { width: number; height: number }) => void;
  onClose?: () => void;
  index: number;
}

const DashboardWidgetWrapper: React.FC<DashboardWidgetWrapperProps> = ({
  widget,
  layout,
  columnCount,
  onResize,
  onClose,
  index,
}) => {
  const { reducedMotion } = useAccessibilityPreferences();
  const { glassClasses } = useOptimizedGlass('light');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragConstraints = useRef(null);

  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((info: PanInfo) => {
    setIsDragging(false);
    // Handle drag reordering logic here if needed
  }, []);

  // Calculate grid span based on layout and widget properties
  const getGridSpan = () => {
    if (isExpanded) return columnCount;
    
    const span = widget.gridSpan || { sm: 1, md: 1, lg: 1 };
    switch (layout) {
      case 'single':
        return 1;
      case 'dual':
        return Math.min(span.md, 2);
      case 'multi':
        return Math.min(span.lg, 3);
      default:
        return 1;
    }
  };

  const gridSpan = getGridSpan();
  const WidgetComponent = widget.component;

  // Conditional props to avoid passing undefined values
  const motionProps = {
    ref: dragConstraints,
    className: cn(
      'relative group',
      layout === 'single' && 'col-span-1',
      layout === 'dual' && gridSpan === 2 && 'col-span-2',
      layout === 'multi' && `col-span-${gridSpan}`,
      isExpanded && 'z-10',
      isDragging && 'z-20'
    ),
    layout: true,
    layoutId: `widget-${widget.id}`,
    initial: reducedMotion ? {} : { 
      opacity: 0, 
      scale: 0.9,
      y: 20 
    },
    animate: reducedMotion ? {} : { 
      opacity: 1, 
      scale: 1,
      y: 0 
    },
    exit: reducedMotion ? {} : { 
      opacity: 0, 
      scale: 0.9,
      y: -20 
    },
    transition: { 
      duration: 0.3,
      delay: index * 0.05 
    },
    whileDrag: reducedMotion ? {} : { 
      scale: 1.02,
      rotate: 1,
      zIndex: 30 
    },
    ...(widget.resizable && layout !== 'single' && {
      drag: true,
      dragConstraints: dragConstraints,
      dragElastic: 0.1,
      onDragStart: handleDragStart,
      onDragEnd: (_: any, info: PanInfo) => handleDragEnd(info)
    })
  };

  return (
    <motion.div
      {...motionProps}
    >
      <Card 
        className={cn(
          'h-full min-h-[200px] tablet-touch-target',
          glassClasses,
          'border-white/20',
          isExpanded && 'fixed inset-4 z-50 min-h-[calc(100vh-2rem)]',
          isDragging && 'shadow-2xl',
          'transition-all duration-200'
        )}
      >
        {/* Widget Header */}
        <div className={cn(
          'flex items-center justify-between p-4 border-b border-white/10',
          'min-h-[60px]' // Ensure adequate touch target
        )}>
          <div className="flex items-center space-x-3">
            {widget.resizable && layout !== 'single' && (
              <div 
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded"
                aria-label="Arrastrar widget"
              >
                <GripVertical size={16} className="text-white/60" />
              </div>
            )}
            <h3 className="text-white font-medium text-sm">{widget.title}</h3>
          </div>

          <div className="flex items-center space-x-1">
            {/* Expand/Collapse button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={handleExpand}
                    aria-label={isExpanded ? 'Minimizar widget' : 'Expandir widget'}
                  >
                    {isExpanded ? (
                      <Minimize2 size={14} />
                    ) : (
                      <Maximize2 size={14} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isExpanded ? 'Minimizar' : 'Expandir'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Close button */}
            {widget.closable && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/10"
                      onClick={onClose}
                      aria-label="Cerrar widget"
                    >
                      <X size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Cerrar widget
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="p-4 flex-1 overflow-hidden">
          <WidgetComponent {...(widget.props || {})} />
        </div>

        {/* Resize handle for resizable widgets */}
        {widget.resizable && !isExpanded && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'linear-gradient(-45deg, transparent 30%, white 30%, white 40%, transparent 40%)'
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export const TabletDashboardLayout: React.FC<TabletDashboardLayoutProps> = ({
  widgets,
  className,
  showLayoutControls = true,
  onWidgetResize,
  onWidgetClose,
  onLayoutChange,
}) => {
  const { reducedMotion } = useAccessibilityPreferences();
  const { glassClasses } = useOptimizedGlass('light');
  
  const {
    dashboardLayout,
    columnCount,
    orientation,
    enableTransitions,
    setDashboardLayout,
    setColumnCount,
    resetLayout,
  } = useTabletNavigation();

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(
    widgets.map(w => w.id)
  );

  // Handle widget close
  const handleWidgetClose = useCallback((widgetId: string) => {
    setVisibleWidgets(prev => prev.filter(id => id !== widgetId));
    onWidgetClose?.(widgetId);
  }, [onWidgetClose]);

  // Handle layout change
  const handleLayoutChange = useCallback((layout: 'single' | 'dual' | 'multi') => {
    setDashboardLayout(layout);
    
    // Update column count based on layout
    const newColumnCount = layout === 'single' ? 1 : layout === 'dual' ? 2 : 3;
    setColumnCount(newColumnCount);
    
    onLayoutChange?.(layout);
  }, [setDashboardLayout, setColumnCount, onLayoutChange]);

  // Handle reset layout
  const handleResetLayout = useCallback(() => {
    setVisibleWidgets(widgets.map(w => w.id));
    resetLayout();
  }, [widgets, resetLayout]);

  // Get visible widgets
  const displayWidgets = widgets.filter(widget => 
    visibleWidgets.includes(widget.id)
  );

  // Generate grid columns class
  const getGridCols = () => {
    switch (columnCount) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 tablet-portrait:grid-cols-2';
      case 3:
        return 'grid-cols-1 tablet-portrait:grid-cols-2 tablet-landscape:grid-cols-3';
      default:
        return 'grid-cols-1';
    }
  };

  return (
    <div className={cn('w-full h-full', className)}>
      {/* Layout Controls */}
      {showLayoutControls && (
        <motion.div
          className={cn(
            'flex items-center justify-between mb-6 p-4 rounded-lg',
            glassClasses,
            'border border-white/10'
          )}
          initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-sm font-medium">
              Vista:
            </span>
            
            {/* Layout buttons */}
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0 rounded',
                        dashboardLayout === 'single' 
                          ? 'bg-primary/20 text-primary-300' 
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      )}
                      onClick={() => handleLayoutChange('single')}
                      aria-label="Vista de una columna"
                    >
                      <Square size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Una columna</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0 rounded',
                        dashboardLayout === 'dual' 
                          ? 'bg-primary/20 text-primary-300' 
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      )}
                      onClick={() => handleLayoutChange('dual')}
                      aria-label="Vista de dos columnas"
                      disabled={orientation === 'portrait'}
                    >
                      <Columns2 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {orientation === 'portrait' ? 'No disponible en vertical' : 'Dos columnas'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0 rounded',
                        dashboardLayout === 'multi' 
                          ? 'bg-primary/20 text-primary-300' 
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      )}
                      onClick={() => handleLayoutChange('multi')}
                      aria-label="Vista de tres columnas"
                      disabled={orientation === 'portrait'}
                    >
                      <Grid3X3 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {orientation === 'portrait' ? 'No disponible en vertical' : 'Tres columnas'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white/60 text-xs">
              {displayWidgets.length} widgets
            </span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={handleResetLayout}
                    aria-label="Restablecer diseño"
                  >
                    <RotateCcw size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restablecer diseño</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      )}

      {/* Dashboard Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          className={cn(
            'grid gap-4 auto-rows-min',
            getGridCols()
          )}
          layout={enableTransitions}
          transition={{ duration: enableTransitions ? 0.3 : 0 }}
        >
          {displayWidgets.map((widget, index) => (
            <DashboardWidgetWrapper
              key={widget.id}
              widget={widget}
              layout={dashboardLayout}
              columnCount={columnCount}
              index={index}
              onResize={(size) => onWidgetResize?.(widget.id, size)}
              onClose={() => handleWidgetClose(widget.id)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {displayWidgets.length === 0 && (
        <motion.div
          className={cn(
            'flex flex-col items-center justify-center py-12 text-center',
            glassClasses,
            'border border-white/10 rounded-lg'
          )}
          initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Settings size={48} className="text-white/40 mb-4" />
          <h3 className="text-white/80 font-medium text-lg mb-2">
            No hay widgets visibles
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-md">
            Todos los widgets han sido cerrados. Usa el botón de restablecer para mostrar todos los widgets nuevamente.
          </p>
          <Button
            onClick={handleResetLayout}
            className="bg-primary hover:bg-primary-600"
          >
            <RotateCcw size={16} className="mr-2" />
            Restablecer diseño
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default TabletDashboardLayout;