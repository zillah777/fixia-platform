'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Home, 
  Search, 
  Calendar, 
  MessageCircle, 
  User, 
  Briefcase, 
  Eye,
  Settings,
  Star,
  BarChart3,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  X,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTabletNavigation } from '@/contexts/TabletNavigationContext';
import { useAccessibilityPreferences } from '@/utils/accessibility';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Icon mapping for dynamic rendering
const iconMap = {
  Home,
  Search,
  Calendar,
  MessageCircle,
  User,
  Briefcase,
  Eye,
  Settings,
  Star,
  BarChart3,
  Heart,
  Clock,
};

interface TabletSideNavigationProps {
  className?: string;
}

interface SideNavItemProps {
  item: {
    id: string;
    label: string;
    icon: string;
    path: string;
    badge?: number;
    showInSidebar: boolean;
  };
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (path: string) => void;
  touchTargetSize: number;
}

const SideNavItem: React.FC<SideNavItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick,
  touchTargetSize,
}) => {
  const { reducedMotion } = useAccessibilityPreferences();
  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || User;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onClick(item.path);
  }, [onClick, item.path]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.div
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={reducedMotion ? {} : { scale: 0.98 }}
    >
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start h-auto py-3 px-3',
          'tablet-touch-target tablet-fade-scale',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'transition-all duration-200',
          isActive 
            ? 'bg-primary/20 text-primary-300 shadow-lg' 
            : 'text-white/70 hover:text-white hover:bg-white/10',
          isCollapsed ? 'px-2' : 'px-4'
        )}
        style={{ minHeight: `${touchTargetSize}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${item.label}${item.badge ? ` (${item.badge} notificaciones)` : ''}`}
        role="menuitem"
      >
        {/* Icon container */}
        <div className="relative flex items-center justify-center min-w-[24px]">
          <motion.div
            animate={reducedMotion ? {} : {
              scale: isActive ? 1.1 : 1,
              transition: { duration: 0.2 }
            }}
          >
            <IconComponent 
              size={20} 
              className={cn(
                'transition-all duration-200',
                isActive ? 'text-primary-300' : 'text-current'
              )}
              strokeWidth={isActive ? 2.5 : 2}
            />
          </motion.div>
          
          {/* Badge */}
          {item.badge && item.badge > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 z-10"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge 
                variant="destructive" 
                className="h-4 w-4 text-xs flex items-center justify-center p-0 min-w-[16px]"
              >
                {item.badge > 99 ? '99+' : item.badge}
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Label */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span 
              className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Active indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg -z-10"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </Button>

      {/* Hover tooltip for collapsed state */}
      <AnimatePresence>
        {isCollapsed && isHovered && (
          <motion.div
            className="absolute left-full top-1/2 ml-2 z-50"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -10, scale: 0.9 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <div className="glass-tablet px-3 py-2 rounded-lg shadow-xl">
              <span className="text-white text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const TabletSideNavigation: React.FC<TabletSideNavigationProps> = ({
  className
}) => {
  const router = useRouter();
  const { reducedMotion } = useAccessibilityPreferences();
  const { glassClasses } = useOptimizedGlass('medium');
  
  const {
    sidebarOpen,
    sidebarLocked,
    navigationItems,
    activeItemId,
    touchTargetSize,
    enableTransitions,
    animationDuration,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarLock,
  } = useTabletNavigation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragConstraints = useRef(null);

  // Handle navigation
  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Handle collapse toggle
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Handle drag to close
  const handleDragEnd = useCallback((info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x < -100) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  // Close sidebar when clicking outside (if not locked)
  const handleBackdropClick = useCallback(() => {
    if (!sidebarLocked) {
      setSidebarOpen(false);
    }
  }, [sidebarLocked, setSidebarOpen]);

  // Filter items that should show in sidebar
  const sidebarItems = navigationItems.filter(item => item.showInSidebar);

  // Don't render if no items or sidebar is closed
  if (!sidebarOpen || sidebarItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {sidebarOpen && !sidebarLocked && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm tablet:hidden"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: enableTransitions ? animationDuration / 1000 : 0 }}
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        ref={dragConstraints}
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50',
          'tablet-landscape-only:relative tablet-landscape-only:z-auto',
          'flex flex-col',
          'glass-tablet-sidebar shadow-2xl',
          enableTransitions && 'transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-72',
          className
        )}
        initial={reducedMotion ? { x: 0 } : { x: '-100%' }}
        animate={reducedMotion ? { x: 0 } : { x: sidebarOpen ? 0 : '-100%' }}
        exit={reducedMotion ? { x: 0 } : { x: '-100%' }}
        transition={{
          duration: enableTransitions ? animationDuration / 1000 : 0,
          ease: 'easeInOut'
        }}
        drag={!sidebarLocked ? 'x' : false}
        dragConstraints={{ left: -300, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => handleDragEnd(info)}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between p-4 border-b border-white/10',
          isCollapsed && 'justify-center'
        )}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="flex items-center space-x-3"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <Star size={18} className="text-white" />
                </div>
                <span className="text-white font-semibold text-lg">Fixia</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? 'Expandir navegación' : 'Colapsar navegación'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>

            {!isCollapsed && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10"
                  onClick={toggleSidebarLock}
                  aria-label={sidebarLocked ? 'Desbloquear navegación' : 'Bloquear navegación'}
                >
                  {sidebarLocked ? <Lock size={16} /> : <Unlock size={16} />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10 tablet-landscape-only:hidden"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Cerrar navegación"
                >
                  <X size={16} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav 
          className="flex-1 overflow-y-auto py-4 px-2"
          role="menu"
          aria-label="Navegación principal"
        >
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SideNavItem
                key={item.id}
                item={item}
                isActive={activeItemId === item.id}
                isCollapsed={isCollapsed}
                onClick={handleNavigation}
                touchTargetSize={touchTargetSize}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t border-white/10',
          isCollapsed && 'px-2'
        )}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="text-center"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-white/50 text-xs">
                  Versión 2.0.0
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Confianza Líquida
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drag indicator for non-locked sidebars */}
        {!sidebarLocked && !isCollapsed && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-white/20 rounded-l-full tablet-landscape-only:hidden" />
        )}
      </motion.div>
    </>
  );
};

export default TabletSideNavigation;