'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  detectDeviceCapabilities, 
  generateGlassConfig, 
  GlassPerformanceMonitor,
  DeviceCapabilities,
  GlassOptimizationConfig,
  getOptimizedGlassClasses
} from '@/utils/device-detection';

interface GlassOptimizationContextType {
  capabilities: DeviceCapabilities | null;
  config: GlassOptimizationConfig | null;
  currentFPS: number;
  isOptimized: boolean;
  getGlassClasses: (variant?: 'light' | 'medium' | 'strong') => string;
  forceOptimization: (enable: boolean) => void;
  performanceMonitor: GlassPerformanceMonitor | null;
}

const GlassOptimizationContext = createContext<GlassOptimizationContextType | undefined>(undefined);

interface GlassOptimizationProviderProps {
  children: ReactNode;
}

export function GlassOptimizationProvider({ children }: GlassOptimizationProviderProps) {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [config, setConfig] = useState<GlassOptimizationConfig | null>(null);
  const [currentFPS, setCurrentFPS] = useState(60);
  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceMonitor] = useState(() => new GlassPerformanceMonitor());
  const [forcedOptimization, setForcedOptimization] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial device detection
    const detectedCapabilities = detectDeviceCapabilities();
    const generatedConfig = generateGlassConfig(detectedCapabilities);
    
    setCapabilities(detectedCapabilities);
    setConfig(generatedConfig);
    setIsOptimized(detectedCapabilities.isLowEndDevice || !detectedCapabilities.supportsBackdropFilter);

    // Start performance monitoring
    performanceMonitor.startMonitoring((fps, shouldOptimize) => {
      setCurrentFPS(fps);
      
      // Auto-optimize if performance drops
      if (shouldOptimize && !isOptimized && forcedOptimization !== false) {
        console.log(`🔧 Auto-optimizing glass effects due to low FPS: ${fps}`);
        setIsOptimized(true);
        
        // Generate more aggressive optimization config
        const optimizedConfig = generateGlassConfig({
          ...detectedCapabilities,
          isLowEndDevice: true,
        });
        setConfig(optimizedConfig);
      }
    });

    // Listen for accessibility preference changes
    const handlePreferenceChange = () => {
      const newCapabilities = detectDeviceCapabilities();
      const newConfig = generateGlassConfig(newCapabilities);
      setCapabilities(newCapabilities);
      setConfig(newConfig);
    };

    // Media query listeners
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');

    motionQuery.addEventListener('change', handlePreferenceChange);
    contrastQuery.addEventListener('change', handlePreferenceChange);
    dataQuery.addEventListener('change', handlePreferenceChange);

    // Visibility change optimization
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Reduce effects when tab is hidden to save battery
        document.body.classList.add('glass-battery-optimized');
      } else {
        document.body.classList.remove('glass-battery-optimized');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      motionQuery.removeEventListener('change', handlePreferenceChange);
      contrastQuery.removeEventListener('change', handlePreferenceChange);
      dataQuery.removeEventListener('change', handlePreferenceChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Force optimization override
  useEffect(() => {
    if (forcedOptimization !== null && capabilities) {
      const newConfig = forcedOptimization 
        ? generateGlassConfig({ ...capabilities, isLowEndDevice: true })
        : generateGlassConfig(capabilities);
      
      setConfig(newConfig);
      setIsOptimized(forcedOptimization);
    }
  }, [forcedOptimization, capabilities]);

  const getGlassClasses = (variant: 'light' | 'medium' | 'strong' = 'light'): string => {
    if (!config) return 'glass'; // Fallback
    
    const baseClasses = getOptimizedGlassClasses(variant, config);
    const additionalClasses: string[] = [];
    
    // Add responsive classes based on current state
    if (isOptimized || currentFPS < 30) {
      additionalClasses.push('glass-battery-optimized');
    }
    
    if (capabilities?.isMobileDevice) {
      additionalClasses.push('glass-accelerated');
    }
    
    return [baseClasses, ...additionalClasses].join(' ');
  };

  const forceOptimization = (enable: boolean) => {
    setForcedOptimization(enable);
    console.log(`🎛️ Glass optimization ${enable ? 'enabled' : 'disabled'} manually`);
  };

  const contextValue: GlassOptimizationContextType = {
    capabilities,
    config,
    currentFPS,
    isOptimized,
    getGlassClasses,
    forceOptimization,
    performanceMonitor,
  };

  return (
    <GlassOptimizationContext.Provider value={contextValue}>
      {children}
    </GlassOptimizationContext.Provider>
  );
}

export function useGlassOptimization(): GlassOptimizationContextType {
  const context = useContext(GlassOptimizationContext);
  if (context === undefined) {
    throw new Error('useGlassOptimization must be used within a GlassOptimizationProvider');
  }
  return context;
}

/**
 * Hook for getting optimized glass classes in components
 */
export function useOptimizedGlass(variant: 'light' | 'medium' | 'strong' = 'light') {
  const { getGlassClasses, capabilities, config } = useGlassOptimization();
  
  const glassClasses = getGlassClasses(variant);
  
  return {
    glassClasses,
    isMobile: capabilities?.isMobileDevice || false,
    isLowEnd: capabilities?.isLowEndDevice || false,
    supportsGlass: capabilities?.supportsBackdropFilter || false,
    config,
  };
}

/**
 * Performance debugging component (dev only)
 */
export function GlassPerformanceDebugger() {
  const { currentFPS, isOptimized, capabilities, config } = useGlassOptimization();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 p-3 bg-black/80 text-white text-xs rounded-lg font-mono">
      <div>FPS: {currentFPS}</div>
      <div>Optimized: {isOptimized ? 'YES' : 'NO'}</div>
      <div>Device: {capabilities?.isMobileDevice ? 'Mobile' : 'Desktop'}</div>
      <div>Memory: {capabilities?.deviceMemory}GB</div>
      <div>Glass Support: {capabilities?.supportsBackdropFilter ? 'YES' : 'NO'}</div>
      <div>Blur: {config?.blurIntensity}</div>
    </div>
  );
}