'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { 
  useTabletCapabilities, 
  DeviceCapabilities, 
  getTabletNavigationLayout 
} from '@/utils/device-detection';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibilityPreferences } from '@/utils/accessibility';

interface TabletNavigationState {
  // Navigation layout and behavior
  layout: 'side' | 'top' | 'bottom' | 'adaptive';
  sidebarOpen: boolean;
  sidebarLocked: boolean;
  adaptiveHeaderExpanded: boolean;
  
  // Multi-panel support
  showSecondaryPanel: boolean;
  secondaryPanelSize: number; // percentage of screen width
  
  // Chat and messaging
  chatPanelOpen: boolean;
  chatPanelSize: number;
  splitScreenMode: boolean;
  
  // Search and filters
  searchPanelOpen: boolean;
  filtersPanelOpen: boolean;
  
  // Dashboard layouts
  dashboardLayout: 'single' | 'dual' | 'multi';
  columnCount: 1 | 2 | 3;
  
  // Animation preferences
  enableTransitions: boolean;
  animationDuration: number;
}

interface TabletNavigationActions {
  // Sidebar controls
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarLock: () => void;
  
  // Header controls
  toggleAdaptiveHeader: () => void;
  setAdaptiveHeaderExpanded: (expanded: boolean) => void;
  
  // Panel controls
  toggleSecondaryPanel: () => void;
  setSecondaryPanelSize: (size: number) => void;
  
  // Chat controls
  toggleChatPanel: () => void;
  setChatPanelSize: (size: number) => void;
  toggleSplitScreen: () => void;
  
  // Search controls
  toggleSearchPanel: () => void;
  toggleFiltersPanel: () => void;
  
  // Dashboard controls
  setDashboardLayout: (layout: 'single' | 'dual' | 'multi') => void;
  setColumnCount: (count: 1 | 2 | 3) => void;
  
  // Layout management
  resetLayout: () => void;
  optimizeForOrientation: () => void;
}

interface TabletNavigationContextType extends TabletNavigationState, TabletNavigationActions {
  // Device info
  capabilities: DeviceCapabilities | null;
  isTablet: boolean;
  orientation: 'portrait' | 'landscape';
  touchTargetSize: number;
  
  // Navigation items
  navigationItems: any[];
  activeItemId: string | null;
  
  // Performance
  performanceMode: 'high' | 'balanced' | 'battery';
}

const TabletNavigationContext = createContext<TabletNavigationContextType | undefined>(undefined);

interface TabletNavigationProviderProps {
  children: ReactNode;
}

export function TabletNavigationProvider({ children }: TabletNavigationProviderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { reducedMotion } = useAccessibilityPreferences();
  const { 
    capabilities, 
    navigationLayout, 
    isTablet, 
    orientation, 
    touchTargetSize,
    shouldUseTabletNav 
  } = useTabletCapabilities();

  // Navigation state
  const [state, setState] = useState<TabletNavigationState>({
    layout: 'adaptive',
    sidebarOpen: false,
    sidebarLocked: false,
    adaptiveHeaderExpanded: false,
    showSecondaryPanel: false,
    secondaryPanelSize: 30,
    chatPanelOpen: false,
    chatPanelSize: 35,
    splitScreenMode: false,
    searchPanelOpen: false,
    filtersPanelOpen: false,
    dashboardLayout: 'single',
    columnCount: 1,
    enableTransitions: true,
    animationDuration: 250,
  });

  // Performance mode based on device capabilities
  const [performanceMode, setPerformanceMode] = useState<'high' | 'balanced' | 'battery'>('balanced');

  // Navigation items based on user type and tablet context
  const [navigationItems, setNavigationItems] = useState<any[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Initialize layout based on device capabilities
  useEffect(() => {
    if (capabilities && shouldUseTabletNav) {
      const optimalLayout = getTabletNavigationLayout(capabilities);
      const columns = orientation === 'landscape' ? 
        (capabilities.screenSize === 'large' ? 3 : 2) : 1;
      
      const dashLayout: 'single' | 'dual' | 'multi' = 
        columns === 1 ? 'single' : columns === 2 ? 'dual' : 'multi';

      setState(prev => ({
        ...prev,
        layout: optimalLayout,
        columnCount: columns,
        dashboardLayout: dashLayout,
        sidebarLocked: orientation === 'landscape' && capabilities.screenSize === 'large',
        sidebarOpen: orientation === 'landscape' && capabilities.screenSize === 'large',
        enableTransitions: !reducedMotion,
        animationDuration: reducedMotion ? 0 : 250,
      }));

      // Set performance mode based on device
      if (capabilities.isLowEndDevice || capabilities.connectionSpeed === 'slow') {
        setPerformanceMode('battery');
      } else if (capabilities.deviceMemory >= 6 && capabilities.supportsBackdropFilter) {
        setPerformanceMode('high');
      } else {
        setPerformanceMode('balanced');
      }
    }
  }, [capabilities, shouldUseTabletNav, orientation, reducedMotion]);

  // Update navigation items based on user type and tablet context
  useEffect(() => {
    if (!user || !isTablet) return;

    const tabletNavItems = user.user_type === 'provider' ? [
      {
        id: 'dashboard',
        label: 'Panel de Control',
        icon: 'Home',
        path: '/as/dashboard',
        showInSidebar: true,
        showInHeader: false,
      },
      {
        id: 'services',
        label: 'Gestión de Servicios',
        icon: 'Briefcase',
        path: '/as/servicios',
        showInSidebar: true,
        showInHeader: true,
      },
      {
        id: 'opportunities',
        label: 'Oportunidades',
        icon: 'Eye',
        path: '/as/oportunidades',
        badge: 3,
        showInSidebar: true,
        showInHeader: true,
      },
      {
        id: 'calendar',
        label: 'Calendario',
        icon: 'Calendar',
        path: '/as/calendario',
        showInSidebar: true,
        showInHeader: false,
      },
      {
        id: 'messages',
        label: 'Mensajes',
        icon: 'MessageCircle',
        path: '/as/chats',
        badge: 2,
        showInSidebar: true,
        showInHeader: true,
      },
      {
        id: 'analytics',
        label: 'Estadísticas',
        icon: 'BarChart3',
        path: '/as/estadisticas',
        showInSidebar: true,
        showInHeader: false,
      },
      {
        id: 'profile',
        label: 'Perfil Profesional',
        icon: 'User',
        path: '/as/perfil',
        showInSidebar: true,
        showInHeader: false,
      },
    ] : [
      {
        id: 'dashboard',
        label: 'Mi Panel',
        icon: 'Home',
        path: '/explorador/dashboard',
        showInSidebar: true,
        showInHeader: false,
      },
      {
        id: 'search',
        label: 'Buscar Servicios',
        icon: 'Search',
        path: '/explorador/buscar-servicio',
        showInSidebar: true,
        showInHeader: true,
      },
      {
        id: 'requests',
        label: 'Mis Solicitudes',
        icon: 'Calendar',
        path: '/explorador/mis-solicitudes',
        showInSidebar: true,
        showInHeader: true,
      },
      {
        id: 'favorites',
        label: 'Favoritos',
        icon: 'Heart',
        path: '/explorador/favoritos',
        showInSidebar: true,
        showInHeader: false,
      },
      {
        id: 'messages',
        label: 'Conversaciones',
        icon: 'MessageCircle',
        path: '/explorador/chats',
        badge: 1,
        showInSidebar: true,
        showInHeader: true,
      },
      {
        id: 'history',
        label: 'Historial',
        icon: 'Clock',
        path: '/explorador/historial',
        showInSidebar: true,
        showInHeader: false,
      },
      {
        id: 'profile',
        label: 'Mi Perfil',
        icon: 'User',
        path: '/explorador/perfil',
        showInSidebar: true,
        showInHeader: false,
      },
    ];

    setNavigationItems(tabletNavItems);
    
    // Set active item based on current route
    const currentPath = router.asPath;
    const activeItem = tabletNavItems.find(item => {
      if (item.path === '/' && currentPath === '/') return true;
      if (item.path !== '/' && currentPath.startsWith(item.path)) return true;
      return false;
    });
    
    setActiveItemId(activeItem?.id || null);
  }, [user, isTablet, router.asPath]);

  // Action implementations
  const actions: TabletNavigationActions = {
    // Sidebar controls
    toggleSidebar: () => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen })),
    setSidebarOpen: (open: boolean) => setState(prev => ({ ...prev, sidebarOpen: open })),
    toggleSidebarLock: () => setState(prev => ({ ...prev, sidebarLocked: !prev.sidebarLocked })),
    
    // Header controls
    toggleAdaptiveHeader: () => setState(prev => ({ ...prev, adaptiveHeaderExpanded: !prev.adaptiveHeaderExpanded })),
    setAdaptiveHeaderExpanded: (expanded: boolean) => setState(prev => ({ ...prev, adaptiveHeaderExpanded: expanded })),
    
    // Panel controls
    toggleSecondaryPanel: () => setState(prev => ({ ...prev, showSecondaryPanel: !prev.showSecondaryPanel })),
    setSecondaryPanelSize: (size: number) => setState(prev => ({ ...prev, secondaryPanelSize: Math.max(20, Math.min(50, size)) })),
    
    // Chat controls
    toggleChatPanel: () => setState(prev => ({ ...prev, chatPanelOpen: !prev.chatPanelOpen })),
    setChatPanelSize: (size: number) => setState(prev => ({ ...prev, chatPanelSize: Math.max(25, Math.min(60, size)) })),
    toggleSplitScreen: () => setState(prev => ({ ...prev, splitScreenMode: !prev.splitScreenMode })),
    
    // Search controls
    toggleSearchPanel: () => setState(prev => ({ ...prev, searchPanelOpen: !prev.searchPanelOpen })),
    toggleFiltersPanel: () => setState(prev => ({ ...prev, filtersPanelOpen: !prev.filtersPanelOpen })),
    
    // Dashboard controls
    setDashboardLayout: (layout: 'single' | 'dual' | 'multi') => setState(prev => ({ ...prev, dashboardLayout: layout })),
    setColumnCount: (count: 1 | 2 | 3) => setState(prev => ({ ...prev, columnCount: count })),
    
    // Layout management
    resetLayout: () => {
      if (capabilities) {
        const optimalLayout = getTabletNavigationLayout(capabilities);
        const columns = orientation === 'landscape' ? 
          (capabilities.screenSize === 'large' ? 3 : 2) : 1;
        
        setState(prev => ({
          ...prev,
          layout: optimalLayout,
          columnCount: columns,
          sidebarOpen: orientation === 'landscape' && capabilities.screenSize === 'large',
          sidebarLocked: orientation === 'landscape' && capabilities.screenSize === 'large',
          showSecondaryPanel: false,
          chatPanelOpen: false,
          splitScreenMode: false,
          searchPanelOpen: false,
          filtersPanelOpen: false,
        }));
      }
    },
    
    optimizeForOrientation: () => {
      if (!capabilities) return;
      
      if (orientation === 'landscape') {
        setState(prev => ({
          ...prev,
          columnCount: capabilities.screenSize === 'large' ? 3 : 2,
          dashboardLayout: capabilities.screenSize === 'large' ? 'multi' : 'dual',
          sidebarOpen: true,
          splitScreenMode: capabilities.screenSize === 'large',
        }));
      } else {
        setState(prev => ({
          ...prev,
          columnCount: 1,
          dashboardLayout: 'single',
          sidebarOpen: false,
          splitScreenMode: false,
        }));
      }
    },
  };

  // Auto-optimize layout on orientation change
  useEffect(() => {
    if (capabilities && shouldUseTabletNav) {
      actions.optimizeForOrientation();
    }
  }, [orientation, capabilities?.screenSize]);

  const contextValue: TabletNavigationContextType = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Device info
    capabilities,
    isTablet,
    orientation,
    touchTargetSize,
    
    // Navigation
    navigationItems,
    activeItemId,
    
    // Performance
    performanceMode,
  };

  // Only provide tablet context if we're actually on a tablet
  if (!shouldUseTabletNav) {
    return <>{children}</>;
  }

  return (
    <TabletNavigationContext.Provider value={contextValue}>
      {children}
    </TabletNavigationContext.Provider>
  );
}

export function useTabletNavigation(): TabletNavigationContextType {
  const context = useContext(TabletNavigationContext);
  if (context === undefined) {
    // Return safe defaults if not in tablet context
    return {
      layout: 'bottom',
      sidebarOpen: false,
      sidebarLocked: false,
      adaptiveHeaderExpanded: false,
      showSecondaryPanel: false,
      secondaryPanelSize: 30,
      chatPanelOpen: false,
      chatPanelSize: 35,
      splitScreenMode: false,
      searchPanelOpen: false,
      filtersPanelOpen: false,
      dashboardLayout: 'single',
      columnCount: 1,
      enableTransitions: true,
      animationDuration: 250,
      toggleSidebar: () => {},
      setSidebarOpen: () => {},
      toggleSidebarLock: () => {},
      toggleAdaptiveHeader: () => {},
      setAdaptiveHeaderExpanded: () => {},
      toggleSecondaryPanel: () => {},
      setSecondaryPanelSize: () => {},
      toggleChatPanel: () => {},
      setChatPanelSize: () => {},
      toggleSplitScreen: () => {},
      toggleSearchPanel: () => {},
      toggleFiltersPanel: () => {},
      setDashboardLayout: () => {},
      setColumnCount: () => {},
      resetLayout: () => {},
      optimizeForOrientation: () => {},
      capabilities: null,
      isTablet: false,
      orientation: 'portrait',
      touchTargetSize: 44,
      navigationItems: [],
      activeItemId: null,
      performanceMode: 'balanced',
    };
  }
  return context;
}

/**
 * Hook for checking if tablet navigation should be used
 */
export function useIsTabletNavigation(): boolean {
  const context = useContext(TabletNavigationContext);
  return context !== undefined;
}

export default TabletNavigationProvider;