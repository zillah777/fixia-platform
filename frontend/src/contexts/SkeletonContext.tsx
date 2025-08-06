import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useOptimizedGlass } from './GlassOptimizationContext';

/**
 * Skeleton Context Provider
 * 
 * Global skeleton loading preferences and utilities for Fixia platform:
 * - Centralized skeleton configuration
 * - Animation preferences based on device capabilities
 * - Accessibility-aware skeleton settings
 * - Performance optimization for low-end devices
 * - Integration with existing glass optimization context
 */

interface SkeletonState {
  /** Global animation preference */
  defaultAnimation: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Default glass variant for skeletons */
  defaultVariant: 'light' | 'medium' | 'strong';
  /** Reduce animations for performance */
  reduceAnimations: boolean;
  /** Respect prefers-reduced-motion */
  respectReducedMotion: boolean;
  /** Use fallback for unsupported devices */
  useFallback: boolean;
  /** Enable staggered animations */
  enableStaggered: boolean;
  /** Skeleton loading timeout (ms) */
  loadingTimeout: number;
  /** Performance mode */
  performanceMode: 'auto' | 'optimized' | 'full';
}

interface SkeletonContextType {
  state: SkeletonState;
  updatePreferences: (updates: Partial<SkeletonState>) => void;
  getOptimizedProps: (overrides?: {
    animation?: SkeletonState['defaultAnimation'];
    variant?: SkeletonState['defaultVariant'];
  }) => {
    animation: SkeletonState['defaultAnimation'];
    variant: SkeletonState['defaultVariant'];
    noAnimation: boolean;
  };
  isReducedMotion: boolean;
  isLowPerformance: boolean;
}

type SkeletonAction = 
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<SkeletonState> }
  | { type: 'SET_PERFORMANCE_MODE'; payload: SkeletonState['performanceMode'] }
  | { type: 'TOGGLE_REDUCED_MOTION'; payload: boolean }
  | { type: 'AUTO_OPTIMIZE'; payload: { isLowEnd: boolean; prefersReducedMotion: boolean } };

const initialState: SkeletonState = {
  defaultAnimation: 'shimmer',
  defaultVariant: 'light',
  reduceAnimations: false,
  respectReducedMotion: true,
  useFallback: false,
  enableStaggered: true,
  loadingTimeout: 10000, // 10 seconds
  performanceMode: 'auto'
};

const SkeletonContext = createContext<SkeletonContextType | undefined>(undefined);

function skeletonReducer(state: SkeletonState, action: SkeletonAction): SkeletonState {
  switch (action.type) {
    case 'UPDATE_PREFERENCES':
      return { ...state, ...action.payload };
    
    case 'SET_PERFORMANCE_MODE':
      return { ...state, performanceMode: action.payload };
    
    case 'TOGGLE_REDUCED_MOTION':
      return { 
        ...state, 
        reduceAnimations: action.payload,
        defaultAnimation: action.payload ? 'none' : 'shimmer'
      };
    
    case 'AUTO_OPTIMIZE': {
      const { isLowEnd, prefersReducedMotion } = action.payload;
      return {
        ...state,
        defaultAnimation: prefersReducedMotion || isLowEnd ? 'none' : 'shimmer',
        reduceAnimations: prefersReducedMotion || isLowEnd,
        enableStaggered: !isLowEnd,
        useFallback: isLowEnd,
        performanceMode: isLowEnd ? 'optimized' : 'auto'
      };
    }
    
    default:
      return state;
  }
}

interface SkeletonProviderProps {
  children: ReactNode;
  /** Initial preferences */
  initialPreferences?: Partial<SkeletonState>;
}

export const SkeletonProvider: React.FC<SkeletonProviderProps> = ({
  children,
  initialPreferences = {}
}) => {
  const [state, dispatch] = useReducer(skeletonReducer, {
    ...initialState,
    ...initialPreferences
  });

  // Device and preference detection
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);
  const [isLowPerformance, setIsLowPerformance] = React.useState(false);

  // Use existing glass optimization context for device detection
  const { isLowEndDevice } = useOptimizedGlass('light');

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (state.respectReducedMotion) {
        dispatch({ type: 'TOGGLE_REDUCED_MOTION', payload: e.matches });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.respectReducedMotion]);

  // Device performance detection
  useEffect(() => {
    const detectPerformance = () => {
      // Use existing device detection from glass context
      const lowEnd = isLowEndDevice;
      
      // Additional performance indicators
      const connectionSpeed = (navigator as any)?.connection?.effectiveType;
      const isSlowConnection = connectionSpeed === 'slow-2g' || connectionSpeed === '2g';
      
      // Memory constraints (if available)
      const deviceMemory = (navigator as any)?.deviceMemory;
      const isLowMemory = deviceMemory && deviceMemory < 4;

      const isLowPerf = lowEnd || isSlowConnection || isLowMemory || false;
      setIsLowPerformance(isLowPerf);

      // Auto-optimize based on device capabilities
      if (state.performanceMode === 'auto') {
        dispatch({
          type: 'AUTO_OPTIMIZE',
          payload: {
            isLowEnd: isLowPerf,
            prefersReducedMotion: isReducedMotion
          }
        });
      }
    };

    detectPerformance();
  }, [isLowEndDevice, isReducedMotion, state.performanceMode]);

  // Update preferences function
  const updatePreferences = React.useCallback((updates: Partial<SkeletonState>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  }, []);

  // Get optimized props based on current state and overrides
  const getOptimizedProps = React.useCallback((overrides: {
    animation?: SkeletonState['defaultAnimation'];
    variant?: SkeletonState['defaultVariant'];
  } = {}) => {
    const animation = overrides.animation || state.defaultAnimation;
    const variant = overrides.variant || state.defaultVariant;
    
    // Apply performance optimizations
    let optimizedAnimation = animation;
    if (state.reduceAnimations || isReducedMotion || isLowPerformance) {
      optimizedAnimation = 'none';
    }

    return {
      animation: optimizedAnimation,
      variant,
      noAnimation: optimizedAnimation === 'none'
    };
  }, [state, isReducedMotion, isLowPerformance]);

  const contextValue: SkeletonContextType = {
    state,
    updatePreferences,
    getOptimizedProps,
    isReducedMotion,
    isLowPerformance
  };

  return (
    <SkeletonContext.Provider value={contextValue}>
      {children}
    </SkeletonContext.Provider>
  );
};

// Hook to use skeleton context
export const useSkeleton = (): SkeletonContextType => {
  const context = useContext(SkeletonContext);
  if (context === undefined) {
    throw new Error('useSkeleton must be used within a SkeletonProvider');
  }
  return context;
};

// Hook for skeleton-specific glass optimization
export const useSkeletonGlass = (
  variant: 'light' | 'medium' | 'strong' = 'light'
) => {
  const skeleton = useSkeleton();
  const { glassClasses } = useOptimizedGlass(variant);
  
  // Apply skeleton-specific optimizations
  const optimizedClasses = React.useMemo(() => {
    if (skeleton.isLowPerformance || skeleton.state.useFallback) {
      // Use fallback styles for low-performance devices
      return 'bg-white/10 border border-white/10 rounded-md';
    }
    return glassClasses;
  }, [glassClasses, skeleton.isLowPerformance, skeleton.state.useFallback]);

  return {
    glassClasses: optimizedClasses,
    ...skeleton.getOptimizedProps({ variant })
  };
};

// Utility hook for skeleton loading states
export const useSkeletonLoading = (
  isLoading: boolean,
  options: {
    timeout?: number;
    onTimeout?: () => void;
  } = {}
) => {
  const skeleton = useSkeleton();
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  
  const timeout = options.timeout || skeleton.state.loadingTimeout;

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasTimedOut(true);
      options.onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout, options.onTimeout]);

  return {
    showSkeleton: isLoading && !hasTimedOut,
    hasTimedOut,
    skeletonProps: skeleton.getOptimizedProps()
  };
};

// Performance monitoring hook for skeletons
export const useSkeletonPerformance = () => {
  const skeleton = useSkeleton();
  const [renderTime, setRenderTime] = React.useState<number>(0);

  const measureRender = React.useCallback(() => {
    const start = performance.now();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      const end = performance.now();
      const time = end - start;
      setRenderTime(time);

      // Auto-optimize if render time is too high
      if (time > 16 && skeleton.state.performanceMode === 'auto') { // 16ms = 60fps
        skeleton.updatePreferences({
          defaultAnimation: 'none',
          reduceAnimations: true
        });
      }
    });
  }, [skeleton]);

  return {
    renderTime,
    measureRender,
    shouldOptimize: renderTime > 16
  };
};

export type { SkeletonState, SkeletonContextType };