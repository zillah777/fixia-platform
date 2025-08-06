'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Settings,
  Menu,
  X,
  User,
  Star,
  ChevronDown,
  MessageSquare,
  Calendar,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Briefcase,
  Eye,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTabletNavigation } from '@/contexts/TabletNavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibilityPreferences } from '@/utils/accessibility';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TabletAdaptiveHeaderProps {
  className?: string;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showQuickActions?: boolean;
  quickActions?: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    badge?: number;
  }>;
}

interface QuickActionButtonProps {
  action: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    badge?: number;
  };
  touchTargetSize: number;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, touchTargetSize }) => {
  const { reducedMotion } = useAccessibilityPreferences();
  const IconComponent = action.icon;

  return (
    <motion.div
      whileTap={reducedMotion ? {} : { scale: 0.95 }}
      whileHover={reducedMotion ? {} : { scale: 1.05 }}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'relative tablet-touch-target',
          'text-white/80 hover:text-white hover:bg-white/10',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        )}
        style={{ minHeight: `${touchTargetSize}px`, minWidth: `${touchTargetSize}px` }}
        onClick={action.onClick}
        aria-label={action.label}
      >
        <IconComponent size={20} />
        {action.badge && action.badge > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center"
          >
            {action.badge > 99 ? '99+' : action.badge}
          </Badge>
        )}
      </Button>
    </motion.div>
  );
};

export const TabletAdaptiveHeader: React.FC<TabletAdaptiveHeaderProps> = ({
  className,
  title,
  subtitle,
  showSearch = true,
  showQuickActions = true,
  quickActions = [],
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { reducedMotion } = useAccessibilityPreferences();
  const { glassClasses } = useOptimizedGlass('strong');
  
  const {
    layout,
    sidebarOpen,
    adaptiveHeaderExpanded,
    orientation,
    touchTargetSize,
    enableTransitions,
    animationDuration,
    navigationItems,
    toggleSidebar,
    toggleAdaptiveHeader,
    setAdaptiveHeaderExpanded,
  } = useTabletNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Default quick actions based on user type
  const defaultQuickActions = user?.user_type === 'provider' ? [
    {
      id: 'messages',
      label: 'Mensajes',
      icon: MessageSquare,
      onClick: () => router.push('/as/chats'),
      badge: 2,
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      onClick: () => router.push('/as/calendario'),
    },
    {
      id: 'opportunities',
      label: 'Oportunidades',
      icon: Eye,
      onClick: () => router.push('/as/oportunidades'),
      badge: 3,
    },
    {
      id: 'analytics',
      label: 'Estadísticas',
      icon: BarChart3,
      onClick: () => router.push('/as/estadisticas'),
    },
  ] : [
    {
      id: 'messages',
      label: 'Mensajes',
      icon: MessageSquare,
      onClick: () => router.push('/explorador/chats'),
      badge: 1,
    },
    {
      id: 'calendar',
      label: 'Mis Servicios',
      icon: Calendar,
      onClick: () => router.push('/explorador/mis-solicitudes'),
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: Search,
      onClick: () => router.push('/explorador/buscar-servicio'),
    },
  ];

  const actionsToShow = quickActions.length > 0 ? quickActions : defaultQuickActions;

  // Get page title from current route
  const getPageTitle = useCallback(() => {
    if (title) return title;
    
    const path = router.pathname;
    const titleMap: Record<string, string> = {
      '/as/dashboard': 'Panel de Control',
      '/as/servicios': 'Mis Servicios',
      '/as/oportunidades': 'Oportunidades',
      '/as/chats': 'Mensajes',
      '/as/perfil': 'Mi Perfil',
      '/explorador/dashboard': 'Mi Panel',
      '/explorador/buscar-servicio': 'Buscar Servicios',
      '/explorador/mis-solicitudes': 'Mis Solicitudes',
      '/explorador/chats': 'Mensajes',
      '/explorador/perfil': 'Mi Perfil',
    };
    
    return titleMap[path] || 'Fixia';
  }, [title, router.pathname]);

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explorador/buscar-servicio?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  // Handle user menu actions
  const handleProfileClick = () => {
    const profilePath = user?.user_type === 'provider' ? '/as/perfil' : '/explorador/perfil';
    router.push(profilePath);
  };

  const handleSettingsClick = () => {
    const settingsPath = user?.user_type === 'provider' ? '/as/configuracion' : '/explorador/configuracion';
    router.push(settingsPath);
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked');
  };

  // Get header navigation items for portrait mode
  const headerNavItems = navigationItems.filter(item => item.showInHeader).slice(0, 4);

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-30 w-full',
        glassClasses,
        'border-b border-white/10',
        enableTransitions && 'transition-all duration-300',
        className
      )}
      initial={reducedMotion ? {} : { y: -20, opacity: 0 }}
      animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main header bar */}
      <div className="flex items-center justify-between px-4 py-3 tablet:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Menu button for collapsed sidebar */}
          {(layout === 'adaptive' || !sidebarOpen) && (
            <Button
              variant="ghost"
              size="sm"
              className="tablet-touch-target text-white/80 hover:text-white hover:bg-white/10"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </Button>
          )}

          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Star size={18} className="text-white" />
            </div>
            
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">
                {getPageTitle()}
              </h1>
              {subtitle && (
                <p className="text-white/60 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Center section - Search (landscape) or nav items (portrait) */}
        <div className="flex-1 mx-6">
          {orientation === 'landscape' && showSearch ? (
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar servicios..."
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-lg',
                    'bg-white/10 border border-white/20',
                    'text-white placeholder-white/60',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'tablet-touch-target'
                  )}
                />
              </div>
            </form>
          ) : orientation === 'portrait' && headerNavItems.length > 0 ? (
            <div className="flex justify-center">
              <div className="flex items-center space-x-1">
                {headerNavItems.map((item) => {
                  const IconComponent = item.icon as React.ComponentType<any>;
                  const isActive = router.pathname.startsWith(item.path);
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'tablet-touch-target px-3',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isActive 
                          ? 'text-primary-300 bg-primary/20' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )}
                      onClick={() => router.push(item.path)}
                    >
                      <div className="relative">
                        <IconComponent size={18} />
                        {item.badge && item.badge > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-3 w-3 text-xs p-0"
                          />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Quick actions */}
          {showQuickActions && orientation === 'landscape' && (
            <div className="flex items-center space-x-1 mr-2">
              {actionsToShow.slice(0, 3).map((action) => (
                <QuickActionButton
                  key={action.id}
                  action={action}
                  touchTargetSize={touchTargetSize}
                />
              ))}
            </div>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative tablet-touch-target text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center"
            >
              3
            </Badge>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="tablet-touch-target p-1 hover:bg-white/10"
                aria-label="Menú de usuario"
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} alt="Avatar" />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {orientation === 'landscape' && (
                    <ChevronDown size={16} className="text-white/60" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 glass-tablet border-white/20"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-white">{user?.full_name}</p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem 
                onClick={handleProfileClick}
                className="text-white hover:bg-white/10"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSettingsClick}
                className="text-white hover:bg-white/10"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/10"
              >
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Expand button for portrait mode */}
          {orientation === 'portrait' && (
            <Button
              variant="ghost"
              size="sm"
              className="tablet-touch-target text-white/80 hover:text-white hover:bg-white/10"
              onClick={toggleAdaptiveHeader}
              aria-label={adaptiveHeaderExpanded ? 'Contraer header' : 'Expandir header'}
            >
              <motion.div
                animate={reducedMotion ? {} : { 
                  rotate: adaptiveHeaderExpanded ? 180 : 0 
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} />
              </motion.div>
            </Button>
          )}
        </div>
      </div>

      {/* Expanded section for portrait mode */}
      <AnimatePresence>
        {orientation === 'portrait' && adaptiveHeaderExpanded && (
          <motion.div
            className="border-t border-white/10 px-4 py-3"
            initial={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: enableTransitions ? 0.2 : 0 }}
          >
            {/* Search bar */}
            {showSearch && (
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar servicios..."
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-lg',
                      'bg-white/10 border border-white/20',
                      'text-white placeholder-white/60',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                      'tablet-touch-target'
                    )}
                  />
                </div>
              </form>
            )}

            {/* Quick actions grid */}
            {showQuickActions && (
              <div className="grid grid-cols-4 gap-3">
                {actionsToShow.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    className={cn(
                      'flex flex-col items-center space-y-1 p-3 h-auto',
                      'text-white/80 hover:text-white hover:bg-white/10',
                      'tablet-touch-target'
                    )}
                    onClick={action.onClick}
                  >
                    <div className="relative">
                      <action.icon size={20} />
                      {action.badge && action.badge > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0"
                        >
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default TabletAdaptiveHeader;