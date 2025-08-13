/**
 * Unified Glass Design System Hook - "Confianza Líquida"
 * Single source of truth for all glass morphism effects and design tokens
 */

import { useMemo } from 'react';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';

// Design Tokens - Central system constants
export const GLASS_TOKENS = {
  variants: {
    minimal: 'bg-white/5 backdrop-blur-[1px]',
    light: 'bg-white/8 backdrop-blur-[4px] border-white/20',
    medium: 'bg-white/12 backdrop-blur-[6px] border-white/30 shadow-lg',
    strong: 'bg-white/15 backdrop-blur-[8px] border-white/40 shadow-xl',
    intense: 'bg-white/18 backdrop-blur-[10px] border-white/50 shadow-2xl'
  },
  gradients: {
    liquid: 'bg-gradient-to-br from-primary via-primary/80 to-secondary',
    aurora: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    ocean: 'bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-400',
    sunset: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'
  },
  interactions: {
    hover: 'hover:bg-white/20 hover:border-white/40 hover:shadow-lg',
    focus: 'focus:bg-white/25 focus:border-white/50 focus:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    active: 'active:scale-[0.98] active:bg-white/30',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10'
  },
  animations: {
    transition: 'transition-all duration-300 ease-out',
    bounce: 'transition-transform duration-200 hover:scale-[1.02]',
    glow: 'animate-pulse-slow shadow-primary/20',
    shimmer: 'bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-shimmer'
  },
  accessibility: {
    highContrast: 'contrast-more:bg-white/30 contrast-more:border-white/60',
    reducedMotion: 'motion-reduce:transition-none motion-reduce:hover:transform-none',
    screenReader: 'sr-only',
    focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
  }
} as const;

// Component-specific glass variants
export const COMPONENT_GLASS = {
  navigation: {
    top: `${GLASS_TOKENS.variants.medium} backdrop-saturate-180 ${GLASS_TOKENS.interactions.hover}`,
    bottom: `${GLASS_TOKENS.variants.strong} safe-area-pb`,
    sidebar: `${GLASS_TOKENS.variants.light} border-r`
  },
  card: {
    default: `${GLASS_TOKENS.variants.light} rounded-lg ${GLASS_TOKENS.interactions.hover}`,
    interactive: `${GLASS_TOKENS.variants.light} rounded-lg cursor-pointer ${GLASS_TOKENS.animations.bounce}`,
    elevated: `${GLASS_TOKENS.variants.medium} rounded-xl shadow-lg`
  },
  button: {
    primary: `${GLASS_TOKENS.gradients.liquid} text-white ${GLASS_TOKENS.interactions.active}`,
    secondary: `${GLASS_TOKENS.variants.medium} ${GLASS_TOKENS.interactions.hover}`,
    ghost: `${GLASS_TOKENS.variants.light} ${GLASS_TOKENS.interactions.hover}`,
    outline: `border-2 border-white/30 bg-transparent ${GLASS_TOKENS.interactions.hover}`
  },
  input: {
    default: `${GLASS_TOKENS.variants.light} border ${GLASS_TOKENS.interactions.focus}`,
    error: `${GLASS_TOKENS.variants.light} border-red-500/50 ${GLASS_TOKENS.interactions.focus}`,
    success: `${GLASS_TOKENS.variants.light} border-green-500/50 ${GLASS_TOKENS.interactions.focus}`
  },
  modal: {
    backdrop: 'bg-black/30 backdrop-blur-[2px]',
    content: `${GLASS_TOKENS.variants.light} rounded-xl shadow-2xl`,
    overlay: 'fixed inset-0 z-50'
  }
} as const;

// User type specific styling
export const USER_TYPE_GLASS = {
  provider: {
    accent: 'accent-blue-500',
    gradient: GLASS_TOKENS.gradients.ocean,
    highlight: 'bg-blue-500/10 border-blue-500/30'
  },
  customer: {
    accent: 'accent-purple-500', 
    gradient: GLASS_TOKENS.gradients.aurora,
    highlight: 'bg-purple-500/10 border-purple-500/30'
  }
} as const;

export interface GlassSystemConfig {
  // Core tokens
  tokens: typeof GLASS_TOKENS;
  components: typeof COMPONENT_GLASS;
  userTypes: typeof USER_TYPE_GLASS;
  
  // Device context
  isMobile: boolean;
  isLowEnd: boolean;
  supportsGlass: boolean;
  
  // Utility functions
  getGlass: (variant: keyof typeof GLASS_TOKENS.variants, withInteractions?: boolean) => string;
  getComponentGlass: (component: keyof typeof COMPONENT_GLASS, variant?: string) => string;
  getUserGlass: (userType: 'provider' | 'customer', element?: 'accent' | 'gradient' | 'highlight') => string;
  getCombinedGlass: (base: string, interactions: boolean, animations: boolean) => string;
}

/**
 * Main hook for accessing the unified glass design system
 */
export function useGlassSystem(): GlassSystemConfig {
  const { 
    glassClasses: optimizedLight, 
    isMobile, 
    isLowEnd, 
    supportsGlass 
  } = useOptimizedGlass('light');

  const config = useMemo((): GlassSystemConfig => {
    // Utility to get glass variant with device optimization
    const getGlass = (
      variant: keyof typeof GLASS_TOKENS.variants, 
      withInteractions = true
    ): string => {
      if (!supportsGlass) {
        return 'bg-white border border-gray-200 shadow-sm';
      }

      let glassClass = GLASS_TOKENS.variants[variant];
      
      // Add device optimizations
      if (isLowEnd) {
        glassClass = GLASS_TOKENS.variants.minimal; // Fallback to minimal glass
      }
      
      if (isMobile) {
        glassClass += ' glass-accelerated';
      }

      if (withInteractions && !isLowEnd) {
        glassClass += ` ${GLASS_TOKENS.animations.transition}`;
      }

      // Always include accessibility
      glassClass += ` ${GLASS_TOKENS.accessibility.highContrast} ${GLASS_TOKENS.accessibility.reducedMotion}`;

      return glassClass;
    };

    // Utility to get component-specific glass
    const getComponentGlass = (
      component: keyof typeof COMPONENT_GLASS,
      variant = 'default'
    ): string => {
      const componentGlass = COMPONENT_GLASS[component];
      if (typeof componentGlass === 'object' && variant in componentGlass) {
        return (componentGlass as Record<string, string>)[variant] || '';
      }
      return typeof componentGlass === 'string' ? componentGlass : '';
    };

    // Utility to get user-type specific styling
    const getUserGlass = (
      userType: 'provider' | 'customer',
      element: 'accent' | 'gradient' | 'highlight' = 'accent'
    ): string => {
      return USER_TYPE_GLASS[userType][element];
    };

    // Utility to combine glass with interactions and animations
    const getCombinedGlass = (
      base: string,
      interactions = true,
      animations = true
    ): string => {
      let combined = base;
      
      if (interactions && !isLowEnd) {
        combined += ` ${GLASS_TOKENS.interactions.hover} ${GLASS_TOKENS.interactions.focus}`;
      }
      
      if (animations && !isLowEnd) {
        combined += ` ${GLASS_TOKENS.animations.transition}`;
      }

      // Always include accessibility
      combined += ` ${GLASS_TOKENS.accessibility.focusVisible} ${GLASS_TOKENS.accessibility.reducedMotion}`;
      
      return combined;
    };

    return {
      tokens: GLASS_TOKENS,
      components: COMPONENT_GLASS,
      userTypes: USER_TYPE_GLASS,
      isMobile,
      isLowEnd,
      supportsGlass,
      getGlass,
      getComponentGlass,
      getUserGlass,
      getCombinedGlass
    };
  }, [optimizedLight, isMobile, isLowEnd, supportsGlass]);

  return config;
}

// Specialized hooks for common use cases
export function useButtonGlassSystem(variant: 'primary' | 'secondary' | 'ghost' | 'outline' = 'secondary') {
  const { getComponentGlass, getCombinedGlass } = useGlassSystem();
  
  return useMemo(() => {
    const baseGlass = getComponentGlass('button', variant);
    return getCombinedGlass(baseGlass, true, true);
  }, [variant, getComponentGlass, getCombinedGlass]);
}

export function useCardGlassSystem(variant: 'default' | 'interactive' | 'elevated' = 'default') {
  const { getComponentGlass, getCombinedGlass } = useGlassSystem();
  
  return useMemo(() => {
    const baseGlass = getComponentGlass('card', variant);
    return getCombinedGlass(baseGlass, variant !== 'default', variant === 'interactive');
  }, [variant, getComponentGlass, getCombinedGlass]);
}

export function useInputGlassSystem(state: 'default' | 'error' | 'success' = 'default') {
  const { getComponentGlass, getCombinedGlass } = useGlassSystem();
  
  return useMemo(() => {
    const baseGlass = getComponentGlass('input', state);
    return getCombinedGlass(baseGlass, true, false);
  }, [state, getComponentGlass, getCombinedGlass]);
}

export function useNavigationGlassSystem(position: 'top' | 'bottom' | 'sidebar' = 'top') {
  const { getComponentGlass, getCombinedGlass } = useGlassSystem();
  
  return useMemo(() => {
    const baseGlass = getComponentGlass('navigation', position);
    return getCombinedGlass(baseGlass, true, false);
  }, [position, getComponentGlass, getCombinedGlass]);
}

export default useGlassSystem;