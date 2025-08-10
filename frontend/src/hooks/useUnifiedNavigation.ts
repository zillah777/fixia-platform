/**
 * Unified Navigation Hook
 * Eliminates navigation fragmentation between user types
 */

import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { USER_TYPE_PATHS, NAVIGATION_ITEMS, USER_TYPE_NAV_LABELS } from '@/utils/constants';
import { useNavigationGlassSystem } from '@/hooks/useGlassSystem';

export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  description: string;
  badge?: string;
  isActive?: boolean;
}

export interface UnifiedNavigationConfig {
  // Current user context
  userType: 'customer' | 'provider' | null;
  displayName: string;
  
  // Navigation items
  primaryItems: NavigationItem[];
  commonItems: NavigationItem[];
  allItems: NavigationItem[];
  
  // User paths
  paths: {
    dashboard: string;
    profile: string;
    chats: string;
    settings: string;
    marketplace?: string;
    services?: string;
    portfolio?: string;
  };
  
  // Navigation states
  currentPath: string;
  activeItem: NavigationItem | null;
  
  // Glass styling
  navClasses: string;
  
  // Utility functions
  getItemIcon: (iconName: string) => any;
  isItemActive: (path: string) => boolean;
  navigateToItem: (item: NavigationItem) => void;
  getUserTypeLabel: () => string;
  getSearchPlaceholder: () => string;
}

/**
 * Main unified navigation hook
 */
export function useUnifiedNavigation(): UnifiedNavigationConfig {
  const { user } = useAuth();
  const router = useRouter();
  const navClasses = useNavigationGlassSystem('top');
  
  const userType = user?.user_type as 'customer' | 'provider' | null;
  
  const config = useMemo((): UnifiedNavigationConfig => {
    // Get navigation items for current user type
    const primaryItems = userType ? NAVIGATION_ITEMS[userType] || [] : [];
    const commonItems = NAVIGATION_ITEMS.common || [];
    
    // Get user paths
    const paths = userType ? USER_TYPE_PATHS[userType] : {
      dashboard: '/',
      profile: '/auth/login',
      chats: '/auth/login',
      settings: '/auth/login',
    };
    
    // Add active state to items
    const currentPath = router.pathname;
    const itemsWithActiveState = primaryItems.map(item => ({
      ...item,
      isActive: currentPath.startsWith(item.path)
    }));
    
    const commonItemsWithActiveState = commonItems.map(item => ({
      ...item,
      isActive: currentPath.startsWith(item.path)
    }));
    
    // Find currently active item
    const activeItem = [...itemsWithActiveState, ...commonItemsWithActiveState]
      .find(item => item.isActive) || null;
    
    // Get display name
    const displayName = userType ? USER_TYPE_NAV_LABELS[userType] : 'Usuario';
    
    // Icon mapping function (returns Lucide icon name)
    const getItemIcon = (iconName: string) => iconName;
    
    // Check if item is active
    const isItemActive = (path: string): boolean => {
      return currentPath.startsWith(path);
    };
    
    // Navigation function
    const navigateToItem = (item: NavigationItem) => {
      router.push(item.path);
    };
    
    // Get user type label for UI display
    const getUserTypeLabel = (): string => {
      return displayName;
    };
    
    // Get search placeholder based on user type
    const getSearchPlaceholder = (): string => {
      return userType === 'customer' 
        ? "Buscar en marketplace..." 
        : "Buscar profesionales o servicios...";
    };
    
    return {
      userType,
      displayName,
      primaryItems: itemsWithActiveState,
      commonItems: commonItemsWithActiveState,
      allItems: [...itemsWithActiveState, ...commonItemsWithActiveState],
      paths,
      currentPath,
      activeItem,
      navClasses,
      getItemIcon,
      isItemActive,
      navigateToItem,
      getUserTypeLabel,
      getSearchPlaceholder,
    };
  }, [user, userType, router.pathname, navClasses]);
  
  return config;
}

/**
 * Hook for mobile navigation specific functionality
 */
export function useMobileNavigation() {
  const navigation = useUnifiedNavigation();
  const mobileNavClasses = useNavigationGlassSystem('bottom');
  
  return {
    ...navigation,
    mobileNavClasses,
    // Mobile-specific navigation items (simplified)
    mobileItems: navigation.primaryItems.slice(0, 3), // Show max 3 items on mobile
  };
}

/**
 * Hook for dropdown menu navigation
 */
export function useDropdownNavigation() {
  const navigation = useUnifiedNavigation();
  const { user } = useAuth();
  
  const dropdownItems = useMemo(() => {
    if (!navigation.userType) return [];
    
    const userItems = [
      {
        key: 'profile',
        label: 'Mi Perfil',
        icon: 'User',
        path: navigation.paths.profile,
        description: 'Ver y editar perfil',
      },
      ...navigation.primaryItems.filter(item => item.key !== 'dashboard'),
      ...navigation.commonItems,
      {
        key: 'settings',
        label: 'Configuración',
        icon: 'Shield',
        path: navigation.paths.settings,
        description: 'Ajustes de cuenta',
      },
    ];
    
    return userItems;
  }, [navigation]);
  
  return {
    ...navigation,
    dropdownItems,
    userInfo: {
      name: user ? `${user.first_name} ${user.last_name}` : '',
      email: user?.email || '',
      avatar: user?.profile_image,
      type: navigation.getUserTypeLabel(),
    },
  };
}

/**
 * Hook for breadcrumb navigation
 */
export function useBreadcrumbNavigation() {
  const navigation = useUnifiedNavigation();
  const router = useRouter();
  
  const breadcrumbs = useMemo(() => {
    const pathSegments = router.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [];
    
    // Add dashboard as home
    if (navigation.userType) {
      breadcrumbItems.push({
        label: 'Inicio',
        path: navigation.paths.dashboard,
        isActive: false,
      });
    }
    
    // Add current active item if not dashboard
    if (navigation.activeItem && navigation.activeItem.key !== 'dashboard') {
      breadcrumbItems.push({
        label: navigation.activeItem.label,
        path: navigation.activeItem.path,
        isActive: true,
      });
    }
    
    return breadcrumbItems;
  }, [navigation, router.pathname]);
  
  return {
    ...navigation,
    breadcrumbs,
  };
}

export default useUnifiedNavigation;