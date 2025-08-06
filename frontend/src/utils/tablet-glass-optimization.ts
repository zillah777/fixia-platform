/**
 * Tablet-specific glass effects optimization
 * Balances visual quality with performance and battery life
 */

import { DeviceCapabilities, GlassOptimizationConfig } from './device-detection';

export interface TabletGlassConfig extends GlassOptimizationConfig {
  tabletOptimizations: {
    reduceBlurInBattery: boolean;
    pauseEffectsOnScroll: boolean;
    adaptToOrientation: boolean;
    thermalThrottling: boolean;
    memoryAwareRendering: boolean;
    preferHardwareCompositing: boolean;
  };
}

/**
 * Generate tablet-specific glass configuration
 */
export function generateTabletGlassConfig(capabilities: DeviceCapabilities): TabletGlassConfig {
  const baseConfig = generateBaseGlassConfig(capabilities);
  
  // Tablet-specific optimizations
  const tabletOptimizations = {
    reduceBlurInBattery: true,
    pauseEffectsOnScroll: capabilities.deviceMemory <= 4,
    adaptToOrientation: true,
    thermalThrottling: capabilities.isLowEndDevice,
    memoryAwareRendering: capabilities.deviceMemory <= 6,
    preferHardwareCompositing: capabilities.supportsBackdropFilter,
  };

  return {
    ...baseConfig,
    tabletOptimizations,
  };
}

/**
 * Base glass configuration without tablet optimizations
 */
function generateBaseGlassConfig(capabilities: DeviceCapabilities): GlassOptimizationConfig {
  // High contrast mode - disable effects
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

  // Low-end tablet optimization
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

  // Tablet-optimized configuration
  if (capabilities.isTabletDevice) {
    return {
      enableFullEffects: capabilities.supportsBackdropFilter && capabilities.deviceMemory >= 4,
      blurIntensity: capabilities.deviceMemory >= 8 ? 'enhanced' : 
                     capabilities.deviceMemory >= 6 ? 'standard' : 'reduced',
      animationComplexity: capabilities.preferReducedMotion ? 'none' : 'full',
      useHardwareAcceleration: true,
      fallbackToSolid: !capabilities.supportsBackdropFilter,
      optimizeForBattery: capabilities.connectionSpeed === 'slow' || capabilities.deviceMemory <= 4,
    };
  }

  // Desktop fallback
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
 * CSS class generator for tablet-optimized glass effects
 */
export function getTabletOptimizedGlassClasses(
  variant: 'light' | 'medium' | 'strong' = 'light',
  config: TabletGlassConfig,
  context: 'sidebar' | 'header' | 'card' | 'modal' | 'overlay' = 'card'
): string {
  const classes: string[] = [];
  const { tabletOptimizations } = config;

  // Base glass effect selection
  if (config.fallbackToSolid) {
    classes.push('glass-fallback');
  } else {
    // Context-specific glass effects
    switch (context) {
      case 'sidebar':
        classes.push('glass-tablet-sidebar');
        break;
      case 'header':
        classes.push('glass-tablet-strong');
        break;
      case 'modal':
      case 'overlay':
        classes.push('glass-tablet');
        break;
      default:
        // Regular cards and content
        switch (config.blurIntensity) {
          case 'minimal':
            classes.push('glass-minimal');
            break;
          case 'reduced':
            classes.push('glass');
            break;
          case 'standard':
            classes.push(`glass-${variant}`);
            break;
          case 'enhanced':
            classes.push(`glass-${variant}`, 'glass-enhanced');
            break;
        }
    }
  }

  // Hardware acceleration
  if (config.useHardwareAcceleration && tabletOptimizations.preferHardwareCompositing) {
    classes.push('glass-accelerated');
  }

  // Battery optimizations
  if (config.optimizeForBattery || tabletOptimizations.reduceBlurInBattery) {
    classes.push('glass-battery-optimized');
  }

  // Tablet-specific optimizations
  if (tabletOptimizations.pauseEffectsOnScroll) {
    classes.push('glass-pause-on-scroll');
  }

  if (tabletOptimizations.thermalThrottling) {
    classes.push('glass-thermal-aware');
  }

  if (tabletOptimizations.memoryAwareRendering) {
    classes.push('glass-memory-optimized');
  }

  return classes.join(' ');
}

/**
 * Performance monitoring for tablet glass effects
 */
export class TabletGlassPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private batteryLevel = 1;
  private thermalState = 'normal';
  private memoryUsage = 0;
  private callbacks: Array<(metrics: TabletPerformanceMetrics) => void> = [];

  interface TabletPerformanceMetrics {
    fps: number;
    batteryLevel: number;
    thermalState: string;
    memoryUsage: number;
    shouldOptimize: boolean;
    recommendations: string[];
  }

  constructor() {
    this.initBatteryMonitoring();
    this.initMemoryMonitoring();
  }

  private async initBatteryMonitoring() {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.batteryLevel = battery.level;
        
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
        });
      } catch (error) {
        console.warn('Battery API not available');
      }
    }
  }

  private initMemoryMonitoring() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
  }

  startMonitoring() {
    const monitor = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // Update memory usage
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          this.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
        
        const metrics = this.getMetrics();
        this.callbacks.forEach(callback => callback(metrics));
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  getMetrics(): TabletPerformanceMetrics {
    const shouldOptimize = this.shouldOptimize();
    const recommendations = this.generateRecommendations();
    
    return {
      fps: this.fps,
      batteryLevel: this.batteryLevel,
      thermalState: this.thermalState,
      memoryUsage: this.memoryUsage,
      shouldOptimize,
      recommendations,
    };
  }

  private shouldOptimize(): boolean {
    return (
      this.fps < 45 ||
      this.batteryLevel < 0.2 ||
      this.memoryUsage > 0.8 ||
      this.thermalState === 'critical'
    );
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.fps < 30) {
      recommendations.push('Reducir intensidad de desenfoque');
      recommendations.push('Pausar animaciones durante el scroll');
    }
    
    if (this.batteryLevel < 0.2) {
      recommendations.push('Activar modo de ahorro de batería');
      recommendations.push('Reducir efectos de vidrio');
    }
    
    if (this.memoryUsage > 0.8) {
      recommendations.push('Reducir complejidad visual');
      recommendations.push('Activar renderizado consciente de memoria');
    }
    
    if (this.thermalState === 'critical') {
      recommendations.push('Desactivar efectos avanzados');
      recommendations.push('Activar limitación térmica');
    }
    
    return recommendations;
  }

  addCallback(callback: (metrics: TabletPerformanceMetrics) => void) {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (metrics: TabletPerformanceMetrics) => void) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}

/**
 * React hook for tablet glass optimization
 */
export function useTabletGlassOptimization(capabilities: DeviceCapabilities) {
  const [config, setConfig] = React.useState<TabletGlassConfig | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = React.useState<any>(null);
  const [monitor] = React.useState(() => new TabletGlassPerformanceMonitor());

  React.useEffect(() => {
    const initialConfig = generateTabletGlassConfig(capabilities);
    setConfig(initialConfig);

    // Start performance monitoring
    monitor.addCallback(setPerformanceMetrics);
    monitor.startMonitoring();

    return () => {
      monitor.removeCallback(setPerformanceMetrics);
    };
  }, [capabilities, monitor]);

  // Auto-adjust configuration based on performance
  React.useEffect(() => {
    if (!config || !performanceMetrics) return;

    if (performanceMetrics.shouldOptimize) {
      const optimizedConfig: TabletGlassConfig = {
        ...config,
        blurIntensity: 'minimal',
        animationComplexity: 'minimal',
        optimizeForBattery: true,
        tabletOptimizations: {
          ...config.tabletOptimizations,
          pauseEffectsOnScroll: true,
          thermalThrottling: true,
          memoryAwareRendering: true,
        },
      };
      
      setConfig(optimizedConfig);
    }
  }, [performanceMetrics, config]);

  const getGlassClasses = (
    variant: 'light' | 'medium' | 'strong' = 'light',
    context: 'sidebar' | 'header' | 'card' | 'modal' | 'overlay' = 'card'
  ) => {
    if (!config) return 'glass';
    return getTabletOptimizedGlassClasses(variant, config, context);
  };

  return {
    config,
    performanceMetrics,
    getGlassClasses,
    isOptimized: performanceMetrics?.shouldOptimize || false,
    recommendations: performanceMetrics?.recommendations || [],
  };
}

/**
 * CSS utilities for tablet glass effects
 */
export const TABLET_GLASS_CSS = `
  /* Tablet-specific glass optimizations */
  .glass-pause-on-scroll {
    transition: backdrop-filter 0.3s ease;
  }
  
  .glass-pause-on-scroll.scrolling {
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
  }
  
  .glass-thermal-aware {
    will-change: auto;
  }
  
  @media (max-resolution: 1.5dppx) {
    .glass-thermal-aware {
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
    }
  }
  
  .glass-memory-optimized {
    contain: layout style paint;
    isolation: isolate;
  }
  
  .glass-memory-optimized * {
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  
  /* Orientation-specific optimizations */
  @media (orientation: portrait) and (min-width: 768px) and (max-width: 1023px) {
    .glass-tablet {
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
    }
  }
  
  @media (orientation: landscape) and (min-width: 1024px) and (max-width: 1279px) {
    .glass-tablet-sidebar {
      backdrop-filter: saturate(180%) blur(24px) !important;
      -webkit-backdrop-filter: saturate(180%) blur(24px) !important;
    }
  }
  
  /* Battery-aware glass effects */
  @media (max-resolution: 1dppx) {
    .glass-battery-optimized {
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      background: rgba(255, 255, 255, 0.12) !important;
    }
  }
`;

// Export React for the hook
import React from 'react';