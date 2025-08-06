/**
 * Adaptive Glass Hook - Smart glass effects for mobile optimization
 * Provides intelligent glass morphism effects based on device capabilities
 */

import { useMemo } from 'react';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';

export interface AdaptiveGlassConfig {
  // Glass effect variants
  light: string;
  medium: string; 
  strong: string;
  
  // Specialized effects
  navigation: string;
  card: string;
  modal: string;
  badge: string;
  button: string;
  
  // Device information
  isMobile: boolean;
  isLowEnd: boolean;
  supportsGlass: boolean;
  
  // Utility functions
  getResponsiveGlass: (
    desktop: 'light' | 'medium' | 'strong',
    mobile?: 'light' | 'medium' | 'strong' | 'minimal'
  ) => string;
  
  getConditionalGlass: (
    condition: boolean,
    trueVariant: 'light' | 'medium' | 'strong',
    falseVariant?: 'light' | 'medium' | 'strong' | 'none'
  ) => string;
}

/**
 * Hook that provides adaptive glass classes optimized for device capabilities
 */
export function useAdaptiveGlass(): AdaptiveGlassConfig {
  const { 
    glassClasses: lightGlass, 
    isMobile, 
    isLowEnd, 
    supportsGlass 
  } = useOptimizedGlass('light');
  
  const { glassClasses: mediumGlass } = useOptimizedGlass('medium');
  const { glassClasses: strongGlass } = useOptimizedGlass('strong');

  const adaptiveConfig = useMemo((): AdaptiveGlassConfig => {
    // Specialized glass effects for common UI elements
    const navigation = isMobile 
      ? `${mediumGlass} glass-accelerated`
      : `${mediumGlass} glass-enhanced`;
    
    const card = isLowEnd 
      ? `${lightGlass} glass-battery-optimized`
      : `${lightGlass} hover:${mediumGlass}`;
    
    const modal = supportsGlass 
      ? `${strongGlass} glass-enhanced`
      : 'glass-fallback';
    
    const badge = isMobile 
      ? `${lightGlass} glass-accelerated`
      : lightGlass;
    
    const button = isLowEnd 
      ? `${lightGlass} glass-battery-optimized`
      : `${mediumGlass} hover:${strongGlass}`;

    // Responsive glass function
    const getResponsiveGlass = (
      desktop: 'light' | 'medium' | 'strong',
      mobile: 'light' | 'medium' | 'strong' | 'minimal' = desktop
    ): string => {
      if (!isMobile) {
        switch (desktop) {
          case 'light': return lightGlass;
          case 'medium': return mediumGlass;
          case 'strong': return strongGlass;
          default: return lightGlass;
        }
      }
      
      // Mobile-specific optimization
      if (mobile === 'minimal' || isLowEnd) {
        return `glass-minimal glass-accelerated glass-battery-optimized`;
      }
      
      switch (mobile) {
        case 'light': return `${lightGlass} glass-accelerated`;
        case 'medium': return `${mediumGlass} glass-accelerated`;
        case 'strong': return `${strongGlass} glass-accelerated`;
        default: return `${lightGlass} glass-accelerated`;
      }
    };

    // Conditional glass function
    const getConditionalGlass = (
      condition: boolean,
      trueVariant: 'light' | 'medium' | 'strong',
      falseVariant: 'light' | 'medium' | 'strong' | 'none' = 'none'
    ): string => {
      if (!condition) {
        if (falseVariant === 'none') return '';
        switch (falseVariant) {
          case 'light': return lightGlass;
          case 'medium': return mediumGlass;
          case 'strong': return strongGlass;
          default: return '';
        }
      }

      switch (trueVariant) {
        case 'light': return lightGlass;
        case 'medium': return mediumGlass;
        case 'strong': return strongGlass;
        default: return lightGlass;
      }
    };

    return {
      light: lightGlass,
      medium: mediumGlass,
      strong: strongGlass,
      navigation,
      card,
      modal,
      badge,
      button,
      isMobile,
      isLowEnd,
      supportsGlass,
      getResponsiveGlass,
      getConditionalGlass,
    };
  }, [lightGlass, mediumGlass, strongGlass, isMobile, isLowEnd, supportsGlass]);

  return adaptiveConfig;
}

/**
 * Hook for specific UI component patterns
 */
export function useCardGlass(options?: {
  hover?: boolean;
  interactive?: boolean;
}) {
  const { card, getConditionalGlass, isLowEnd } = useAdaptiveGlass();
  
  const baseClasses = card;
  const hoverClasses = options?.hover && !isLowEnd 
    ? 'hover:glass-medium transition-all duration-300' 
    : '';
  
  const interactiveClasses = options?.interactive 
    ? 'cursor-pointer transform hover:scale-[1.02] transition-transform duration-200'
    : '';

  return {
    cardClasses: `${baseClasses} ${hoverClasses} ${interactiveClasses}`.trim(),
    isOptimized: isLowEnd,
  };
}

/**
 * Hook for navigation glass effects
 */
export function useNavigationGlass(variant: 'bottom' | 'top' | 'sidebar' = 'bottom') {
  const { navigation, getResponsiveGlass, isMobile } = useAdaptiveGlass();
  
  const variantClasses = useMemo(() => {
    switch (variant) {
      case 'bottom':
        return isMobile 
          ? `${navigation} safe-area-pb` 
          : navigation;
      case 'top':
        return `${navigation} backdrop-saturate-180`;
      case 'sidebar':
        return getResponsiveGlass('medium', 'light');
      default:
        return navigation;
    }
  }, [variant, navigation, getResponsiveGlass, isMobile]);

  return {
    navClasses: variantClasses,
    isMobileOptimized: isMobile,
  };
}

/**
 * Hook for modal and overlay glass effects
 */
export function useModalGlass(type: 'modal' | 'dropdown' | 'popover' = 'modal') {
  const { modal, getResponsiveGlass, supportsGlass } = useAdaptiveGlass();
  
  const typeClasses = useMemo(() => {
    if (!supportsGlass) return 'glass-fallback';
    
    switch (type) {
      case 'modal':
        return `${modal} shadow-2xl`;
      case 'dropdown':
        return getResponsiveGlass('medium', 'light');
      case 'popover':
        return getResponsiveGlass('light', 'minimal');
      default:
        return modal;
    }
  }, [type, modal, getResponsiveGlass, supportsGlass]);

  return {
    modalClasses: typeClasses,
    hasFallback: !supportsGlass,
  };
}

/**
 * Hook for button glass effects with interaction states
 */
export function useButtonGlass(variant: 'primary' | 'secondary' | 'ghost' = 'secondary') {
  const { button, light, medium, isLowEnd } = useAdaptiveGlass();
  
  const buttonClasses = useMemo(() => {
    const baseTransition = isLowEnd ? '' : 'transition-all duration-200';
    
    switch (variant) {
      case 'primary':
        return `liquid-gradient text-primary-foreground ${baseTransition}`;
      case 'secondary':
        return `${button} ${baseTransition}`;
      case 'ghost':
        return `${light} hover:${medium} ${baseTransition}`;
      default:
        return `${button} ${baseTransition}`;
    }
  }, [variant, button, light, medium, isLowEnd]);

  return {
    buttonClasses,
    isOptimized: isLowEnd,
  };
}

export default useAdaptiveGlass;