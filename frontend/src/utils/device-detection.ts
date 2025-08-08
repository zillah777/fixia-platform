/**
 * Device Detection and Glass Effects Optimization Utilities
 * Optimizes glass morphism effects based on device capabilities
 */

export interface DeviceCapabilities {
  supportsBackdropFilter: boolean;
  isLowEndDevice: boolean;
  isMobileDevice: boolean;
  isTabletDevice: boolean;
  isIOSDevice: boolean;
  isAndroidDevice: boolean;
  isIPadDevice: boolean;
  preferReducedMotion: boolean;
  preferHighContrast: boolean;
  deviceMemory: number;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
  screenSize: 'small' | 'medium' | 'large';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
}

export interface GlassOptimizationConfig {
  enableFullEffects: boolean;
  blurIntensity: 'minimal' | 'reduced' | 'standard' | 'enhanced';
  animationComplexity: 'none' | 'minimal' | 'standard' | 'full';
  useHardwareAcceleration: boolean;
  fallbackToSolid: boolean;
  optimizeForBattery: boolean;
}

/**
 * Detects device capabilities for glass effect optimization
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  // Server-side safe defaults
  if (typeof window === 'undefined') {
    return {
      supportsBackdropFilter: false,
      isLowEndDevice: false,
      isMobileDevice: false,
      isTabletDevice: false,
      isIOSDevice: false,
      isAndroidDevice: false,
      isIPadDevice: false,
      preferReducedMotion: false,
      preferHighContrast: false,
      deviceMemory: 4,
      connectionSpeed: 'unknown',
      screenSize: 'medium',
      deviceType: 'desktop' as const,
      orientation: 'landscape' as const,
      pixelRatio: 1,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isIPad = /ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Enhanced tablet detection
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const maxDimension = Math.max(screenWidth, screenHeight);
  const minDimension = Math.min(screenWidth, screenHeight);
  
  // Tablet detection based on screen size and user agent
  const isTabletBySize = (
    (minDimension >= 768 && maxDimension <= 1366) || // Standard tablet range
    (minDimension >= 600 && maxDimension >= 900 && maxDimension <= 1400) // Alternative tablet range
  );
  
  const isTabletByUA = /tablet|ipad|android(?!.*mobile)|kindle|silk/i.test(userAgent);
  const isTablet = isTabletBySize || isTabletByUA || isIPad;
  
  // Mobile detection (excluding tablets)
  const isMobileByUA = /mobile|iphone|ipod|android.*mobile|blackberry|opera.*mini|windows.*phone/i.test(userAgent);
  const isMobileBySize = !isTablet && maxDimension < 768;
  const isMobile = (isMobileByUA || isMobileBySize) && !isTablet;

  // Check backdrop-filter support
  const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') ||
                                  CSS.supports('-webkit-backdrop-filter', 'blur(1px)');

  // Device memory detection (Chrome only)
  const deviceMemory = (navigator as any).deviceMemory || 4;

  // Network connection detection
  const connection = (navigator as any).connection;
  let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'unknown';
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    connectionSpeed = ['slow-2g', '2g', '3g'].includes(effectiveType) ? 'slow' : 'fast';
  }

  // Screen size detection (updated to account for tablets)
  let screenSize: 'small' | 'medium' | 'large' = 'medium';
  
  if (isMobile || screenWidth < 768) {
    screenSize = 'small';
  } else if (screenWidth > 1280 || (!isTablet && screenWidth > 1024)) {
    screenSize = 'large';
  }
  
  // Device type determination
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) {
    deviceType = 'mobile';
  } else if (isTablet) {
    deviceType = 'tablet';
  }
  
  // Orientation detection
  const orientation: 'portrait' | 'landscape' = screenWidth < screenHeight ? 'portrait' : 'landscape';

  // Accessibility preferences
  const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preferHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  // Low-end device detection (updated for tablets)
  const isLowEndDevice = deviceMemory <= 2 || 
                         connectionSpeed === 'slow' || 
                         (isMobile && deviceMemory <= 4) ||
                         (isTablet && deviceMemory <= 3);

  return {
    supportsBackdropFilter,
    isLowEndDevice,
    isMobileDevice: isMobile,
    isTabletDevice: isTablet,
    isIOSDevice: isIOS,
    isAndroidDevice: isAndroid,
    isIPadDevice: isIPad,
    preferReducedMotion,
    preferHighContrast,
    deviceMemory,
    connectionSpeed,
    screenSize,
    deviceType,
    orientation,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

/**
 * Generates optimized glass configuration based on device capabilities
 */
export function generateGlassConfig(capabilities: DeviceCapabilities): GlassOptimizationConfig {
  // High contrast mode - disable glass effects
  if (capabilities.preferHighContrast) {
    return {
      enableFullEffects: false,
      blurIntensity: 'minimal',
      animationComplexity: 'none',
      useHardwareAcceleration: false,
      fallbackToSolid: true,
      optimizeForBattery: true,
    };
  }

  // Low-end device optimization
  if (capabilities.isLowEndDevice) {
    return {
      enableFullEffects: false,
      blurIntensity: 'minimal',
      animationComplexity: capabilities.preferReducedMotion ? 'none' : 'minimal',
      useHardwareAcceleration: true,
      fallbackToSolid: !capabilities.supportsBackdropFilter,
      optimizeForBattery: true,
    };
  }

  // Tablet device optimization
  if (capabilities.isTabletDevice) {
    return {
      enableFullEffects: capabilities.supportsBackdropFilter,
      blurIntensity: capabilities.deviceMemory >= 6 ? 'enhanced' : 'standard',
      animationComplexity: capabilities.preferReducedMotion ? 'none' : 'full',
      useHardwareAcceleration: true,
      fallbackToSolid: !capabilities.supportsBackdropFilter,
      optimizeForBattery: capabilities.connectionSpeed === 'slow' || capabilities.deviceMemory <= 4,
    };
  }

  // Mobile device optimization
  if (capabilities.isMobileDevice) {
    return {
      enableFullEffects: capabilities.supportsBackdropFilter,
      blurIntensity: capabilities.deviceMemory >= 6 ? 'standard' : 'reduced',
      animationComplexity: capabilities.preferReducedMotion ? 'none' : 'standard',
      useHardwareAcceleration: true,
      fallbackToSolid: !capabilities.supportsBackdropFilter,
      optimizeForBattery: capabilities.connectionSpeed === 'slow',
    };
  }

  // Desktop/high-end device - full effects
  return {
    enableFullEffects: true,
    blurIntensity: 'enhanced',
    animationComplexity: capabilities.preferReducedMotion ? 'minimal' : 'full',
    useHardwareAcceleration: true,
    fallbackToSolid: !capabilities.supportsBackdropFilter,
    optimizeForBattery: false,
  };
}

/**
 * Performance monitoring for glass effects
 */
export class GlassPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private performanceThreshold = 30; // Minimum acceptable FPS

  startMonitoring(callback?: (fps: number, shouldOptimize: boolean) => void) {
    const monitor = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        const shouldOptimize = this.fps < this.performanceThreshold;
        callback?.(this.fps, shouldOptimize);
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  getCurrentFPS(): number {
    return this.fps;
  }

  shouldOptimize(): boolean {
    return this.fps < this.performanceThreshold;
  }
}

/**
 * React hook for device-aware glass optimization
 */
export function useGlassOptimization() {
  const [capabilities, setCapabilities] = React.useState<DeviceCapabilities | null>(null);
  const [config, setConfig] = React.useState<GlassOptimizationConfig | null>(null);
  
  React.useEffect(() => {
    const detected = detectDeviceCapabilities();
    const generated = generateGlassConfig(detected);
    
    setCapabilities(detected);
    setConfig(generated);
    
    // Listen for preference changes
    const handlePreferenceChange = () => {
      const newCapabilities = detectDeviceCapabilities();
      const newConfig = generateGlassConfig(newCapabilities);
      setCapabilities(newCapabilities);
      setConfig(newConfig);
    };
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    motionQuery.addEventListener('change', handlePreferenceChange);
    contrastQuery.addEventListener('change', handlePreferenceChange);
    
    return () => {
      motionQuery.removeEventListener('change', handlePreferenceChange);
      contrastQuery.removeEventListener('change', handlePreferenceChange);
    };
  }, []);
  
  return { capabilities, config };
}

/**
 * CSS class generator for optimized glass effects
 */
export function getOptimizedGlassClasses(
  variant: 'light' | 'medium' | 'strong' = 'light',
  config?: GlassOptimizationConfig
): string {
  if (!config) return 'glass'; // Fallback to default
  
  const classes: string[] = [];
  
  // Base glass effect
  if (config.fallbackToSolid) {
    classes.push('glass-fallback');
  } else {
    switch (config.blurIntensity) {
      case 'minimal':
        classes.push('glass-minimal');
        break;
      case 'reduced':
        classes.push(variant === 'strong' ? 'glass-medium' : 'glass');
        break;
      case 'standard':
        classes.push(`glass-${variant}`);
        break;
      case 'enhanced':
        classes.push(`glass-${variant}`, 'glass-enhanced');
        break;
    }
  }
  
  // Hardware acceleration
  if (config.useHardwareAcceleration) {
    classes.push('glass-accelerated');
  }
  
  // Battery optimization
  if (config.optimizeForBattery) {
    classes.push('glass-battery-optimized');
  }
  
  return classes.join(' ');
}

/**
 * Tablet-specific utility functions
 */

/**
 * Detects if device should use tablet navigation patterns
 */
export function shouldUseTabletNavigation(capabilities?: DeviceCapabilities): boolean {
  if (!capabilities) return false;
  return capabilities.isTabletDevice && capabilities.screenSize !== 'small';
}

/**
 * Determines tablet navigation layout based on orientation and screen size
 */
export function getTabletNavigationLayout(capabilities?: DeviceCapabilities): 'side' | 'top' | 'bottom' | 'adaptive' {
  if (!capabilities || !capabilities.isTabletDevice) return 'bottom';
  
  const { orientation, screenSize } = capabilities;
  
  // Large tablets in landscape use side navigation
  if (orientation === 'landscape' && screenSize === 'large') {
    return 'side';
  }
  
  // Portrait tablets use adaptive header + bottom
  if (orientation === 'portrait') {
    return 'adaptive';
  }
  
  // Medium tablets in landscape use top navigation
  if (orientation === 'landscape' && screenSize === 'medium') {
    return 'top';
  }
  
  return 'adaptive';
}

/**
 * Gets optimal touch target size for device type
 */
export function getTouchTargetSize(deviceType: 'mobile' | 'tablet' | 'desktop'): number {
  switch (deviceType) {
    case 'mobile':
      return 44; // iOS HIG recommendation
    case 'tablet':
      return 48; // Larger for tablet interaction
    case 'desktop':
      return 40; // Standard desktop size
    default:
      return 44;
  }
}

/**
 * React hook for tablet-specific device capabilities
 */
export function useTabletCapabilities() {
  const [capabilities, setCapabilities] = React.useState<DeviceCapabilities | null>(null);
  const [navigationLayout, setNavigationLayout] = React.useState<'side' | 'top' | 'bottom' | 'adaptive'>('bottom');

  React.useEffect(() => {
    const detected = detectDeviceCapabilities();
    const layout = getTabletNavigationLayout(detected);
    
    setCapabilities(detected);
    setNavigationLayout(layout);

    // Listen for orientation changes
    const handleOrientationChange = () => {
      const newCapabilities = detectDeviceCapabilities();
      const newLayout = getTabletNavigationLayout(newCapabilities);
      setCapabilities(newCapabilities);
      setNavigationLayout(newLayout);
    };

    // Use both orientationchange and resize for better compatibility
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return {
    capabilities,
    navigationLayout,
    isTablet: capabilities?.isTabletDevice || false,
    orientation: capabilities?.orientation || 'portrait',
    touchTargetSize: getTouchTargetSize(capabilities?.deviceType || 'desktop'),
    shouldUseTabletNav: shouldUseTabletNavigation(capabilities || undefined),
  };
}

// Export React for the hook
import React from 'react';