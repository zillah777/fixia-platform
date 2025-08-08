/**
 * Fixia Skeleton Components Index
 * 
 * Comprehensive skeleton loading components for the Fixia marketplace platform.
 * All components are optimized for the Liquid Glass design system with:
 * - Glass morphism effects
 * - Mobile-first responsive design
 * - Accessibility compliance
 * - Performance optimization
 * - Reduced motion support
 */

// Base skeleton components
export {
  Skeleton,
  TextSkeleton,
  CircleSkeleton,
  CardSkeleton,
  type SkeletonProps,
  type TextSkeletonProps,
  type CircleSkeletonProps,
  type CardSkeletonProps
} from '../ui/skeleton';

// Platform-specific skeleton components
export {
  FixiaServiceCardSkeleton,
  FixiaServiceListSkeleton
} from './FixiaServiceCardSkeleton';

export {
  FixiaDashboardSkeleton,
  FixiaMiniDashboardSkeleton
} from './FixiaDashboardSkeleton';

export {
  FixiaProfileSkeleton,
  FixiaProfileListSkeleton
} from './FixiaProfileSkeleton';

export {
  FixiaChatSkeleton,
  FixiaChatMessageSkeleton
} from './FixiaChatSkeleton';

export {
  FixiaSearchSkeleton
} from './FixiaSearchSkeleton';

export {
  FixiaFormSkeleton,
  FixiaQuickFormSkeleton
} from './FixiaFormSkeleton';

// Context and hooks
export {
  SkeletonProvider,
  useSkeleton,
  useSkeletonGlass,
  useSkeletonLoading,
  useSkeletonPerformance,
  type SkeletonState,
  type SkeletonContextType
} from '../../contexts/SkeletonContext';

// Utility functions and constants
export const SKELETON_DEFAULTS = {
  animation: 'shimmer' as const,
  glassVariant: 'light' as const,
  loadingTimeout: 10000,
  staggerDelay: 0.1
};

export const SKELETON_ANIMATIONS = {
  pulse: 'pulse',
  shimmer: 'shimmer',
  wave: 'wave',
  none: 'none'
} as const;

export const SKELETON_VARIANTS = {
  light: 'light',
  medium: 'medium',
  strong: 'strong'
} as const;

// Pre-configured skeleton sets for common use cases
export const SkeletonSets = {
  // Marketplace browsing
  marketplaceBrowsing: {
    serviceCards: { component: 'FixiaServiceCardSkeleton', count: 6, variant: 'grid' },
    filters: { component: 'FixiaSearchSkeleton', layout: 'filters-only' },
    header: { component: 'FixiaSearchSkeleton', layout: 'compact' }
  },
  
  // User dashboard
  userDashboard: {
    summaryCards: { component: 'FixiaDashboardSkeleton', cardCount: 6 },
    miniStats: { component: 'FixiaMiniDashboardSkeleton', count: 4 }
  },
  
  // Profile pages
  profileViewing: {
    fullProfile: { component: 'FixiaProfileSkeleton', layout: 'full', profileType: 'provider' },
    profileCard: { component: 'FixiaProfileSkeleton', layout: 'card' },
    profileList: { component: 'FixiaProfileListSkeleton', count: 5 }
  },
  
  // Chat interface
  chatInterface: {
    chatList: { component: 'FixiaChatSkeleton', layout: 'list', count: 5 },
    conversation: { component: 'FixiaChatSkeleton', layout: 'conversation', count: 8 },
    fullscreen: { component: 'FixiaChatSkeleton', layout: 'fullscreen' }
  },
  
  // Forms and booking
  formsAndBooking: {
    bookingForm: { component: 'FixiaFormSkeleton', formType: 'booking', showProgress: true },
    quickForm: { component: 'FixiaQuickFormSkeleton', fieldCount: 3 },
    profileForm: { component: 'FixiaFormSkeleton', formType: 'profile' }
  }
} as const;

// Responsive skeleton configurations
export const ResponsiveSkeletonConfig = {
  mobile: {
    serviceCards: { variant: 'compact', count: 3 },
    dashboard: { cardCount: 4 },
    chat: { layout: 'conversation' }
  },
  tablet: {
    serviceCards: { variant: 'grid', count: 4 },
    dashboard: { cardCount: 6 },
    chat: { layout: 'fullscreen' }
  },
  desktop: {
    serviceCards: { variant: 'grid', count: 6 },
    dashboard: { cardCount: 6 },
    chat: { layout: 'fullscreen' }
  }
} as const;

// Performance presets
export const PerformancePresets = {
  highPerformance: {
    animation: 'shimmer' as const,
    glassVariant: 'medium' as const,
    enableStaggered: true,
    loadingTimeout: 15000
  },
  balanced: {
    animation: 'shimmer' as const,
    glassVariant: 'light' as const,
    enableStaggered: true,
    loadingTimeout: 10000
  },
  lowPerformance: {
    animation: 'none' as const,
    glassVariant: 'light' as const,
    enableStaggered: false,
    loadingTimeout: 5000
  },
  accessibility: {
    animation: 'none' as const,
    glassVariant: 'light' as const,
    enableStaggered: false,
    respectReducedMotion: true,
    loadingTimeout: 8000
  }
} as const;