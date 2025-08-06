'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  Battery, 
  Cpu, 
  Eye, 
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useGlassOptimization, GlassPerformanceDebugger } from '@/contexts/GlassOptimizationContext';
import { useAdaptiveGlass, useCardGlass, useButtonGlass } from '@/hooks/useAdaptiveGlass';
import { AdaptiveCard, AdaptiveCardContent, AdaptiveCardHeader, AdaptiveCardTitle } from '@/components/ui/adaptive-card';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { Badge } from '@/components/ui/badge';

export function GlassOptimizationDemo() {
  const { 
    capabilities, 
    config, 
    currentFPS, 
    isOptimized, 
    forceOptimization 
  } = useGlassOptimization();
  
  const { 
    light, 
    medium, 
    strong, 
    getResponsiveGlass, 
    getConditionalGlass,
    isMobile,
    isLowEnd,
    supportsGlass
  } = useAdaptiveGlass();

  if (!capabilities || !config) return null;

  const deviceInfo = [
    {
      icon: isMobile ? Smartphone : Monitor,
      label: 'Device Type',
      value: isMobile ? 'Mobile' : 'Desktop',
      status: 'info'
    },
    {
      icon: Cpu,
      label: 'Memory',
      value: `${capabilities.deviceMemory}GB`,
      status: capabilities.deviceMemory >= 4 ? 'success' : 'warning'
    },
    {
      icon: Battery,
      label: 'Performance',
      value: isLowEnd ? 'Optimized' : 'Full Effects',
      status: isLowEnd ? 'warning' : 'success'
    },
    {
      icon: Eye,
      label: 'Glass Support',
      value: supportsGlass ? 'Supported' : 'Fallback',
      status: supportsGlass ? 'success' : 'warning'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold">Glass Optimization Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating adaptive glass morphism effects optimized for your device
        </p>
      </motion.div>

      {/* Device Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deviceInfo.map((info, index) => {
          const IconComponent = info.icon;
          return (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <AdaptiveCard className="text-center">
                <AdaptiveCardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <IconComponent 
                      className={`h-8 w-8 ${
                        info.status === 'success' ? 'text-green-400' :
                        info.status === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} 
                    />
                    <div>
                      <p className="text-sm font-medium">{info.label}</p>
                      <p className="text-xs text-muted-foreground">{info.value}</p>
                    </div>
                    <Badge 
                      variant={info.status === 'success' ? 'default' : 'secondary'}
                      className={getConditionalGlass(info.status === 'success', 'light', 'none')}
                    >
                      {info.status === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                       info.status === 'warning' ? <AlertTriangle className="h-3 w-3 mr-1" /> : null}
                      {info.status === 'success' ? 'Optimal' : 
                       info.status === 'warning' ? 'Adapted' : 'Standard'}
                    </Badge>
                  </div>
                </AdaptiveCardContent>
              </AdaptiveCard>
            </motion.div>
          );
        })}
      </div>

      {/* Glass Effect Samples */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Glass Effect Samples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Light Glass */}
          <div className={`p-6 rounded-lg border ${light}`}>
            <h3 className="font-semibold mb-2">Light Glass</h3>
            <p className="text-sm text-muted-foreground">
              Subtle glass effect with minimal blur
            </p>
            <div className="mt-4 text-xs font-mono text-muted-foreground">
              Blur: {config.blurIntensity === 'minimal' ? '8px' : '16-20px'}
            </div>
          </div>

          {/* Medium Glass */}
          <div className={`p-6 rounded-lg border ${medium}`}>
            <h3 className="font-semibold mb-2">Medium Glass</h3>
            <p className="text-sm text-muted-foreground">
              Balanced glass effect for cards and navigation
            </p>
            <div className="mt-4 text-xs font-mono text-muted-foreground">
              Blur: {config.blurIntensity === 'minimal' ? '12px' : '20-24px'}
            </div>
          </div>

          {/* Strong Glass */}
          <div className={`p-6 rounded-lg border ${strong}`}>
            <h3 className="font-semibold mb-2">Strong Glass</h3>
            <p className="text-sm text-muted-foreground">
              Intense glass effect for modals and overlays
            </p>
            <div className="mt-4 text-xs font-mono text-muted-foreground">
              Blur: {config.blurIntensity === 'minimal' ? '16px' : '28-32px'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Responsive Glass Demo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Responsive Adaptation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-lg border ${getResponsiveGlass('strong', 'light')}`}>
            <h3 className="font-semibold mb-2">Desktop: Strong → Mobile: Light</h3>
            <p className="text-sm text-muted-foreground">
              Automatically reduces intensity on mobile devices
            </p>
          </div>
          
          <div className={`p-6 rounded-lg border ${getResponsiveGlass('medium', 'minimal')}`}>
            <h3 className="font-semibold mb-2">Desktop: Medium → Mobile: Minimal</h3>
            <p className="text-sm text-muted-foreground">
              Minimal effects for low-end mobile devices
            </p>
          </div>
        </div>
      </motion.div>

      {/* Performance Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Performance Controls</h2>
        <AdaptiveCard>
          <AdaptiveCardHeader>
            <AdaptiveCardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Optimization Settings</span>
            </AdaptiveCardTitle>
          </AdaptiveCardHeader>
          <AdaptiveCardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current FPS</p>
                <p className="text-sm text-muted-foreground">
                  {currentFPS} fps {currentFPS < 30 && '(Auto-optimizing)'}
                </p>
              </div>
              <Badge variant={currentFPS >= 30 ? 'default' : 'destructive'}>
                {currentFPS >= 30 ? 'Smooth' : 'Optimizing'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Force Optimization</p>
                <p className="text-sm text-muted-foreground">
                  Override automatic detection
                </p>
              </div>
              <div className="space-x-2">
                <AdaptiveButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => forceOptimization(true)}
                  disabled={isOptimized}
                >
                  Enable
                </AdaptiveButton>
                <AdaptiveButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => forceOptimization(false)}
                  disabled={!isOptimized}
                >
                  Disable
                </AdaptiveButton>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h4 className="font-medium mb-2">Current Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Blur Intensity: <span className="font-mono">{config.blurIntensity}</span></div>
                <div>Animation: <span className="font-mono">{config.animationComplexity}</span></div>
                <div>Hardware Accel: <span className="font-mono">{config.useHardwareAcceleration ? 'On' : 'Off'}</span></div>
                <div>Battery Mode: <span className="font-mono">{config.optimizeForBattery ? 'On' : 'Off'}</span></div>
              </div>
            </div>
          </AdaptiveCardContent>
        </AdaptiveCard>
      </motion.div>

      {/* Performance Debugger (Development Only) */}
      <GlassPerformanceDebugger />
    </div>
  );
}

export default GlassOptimizationDemo;