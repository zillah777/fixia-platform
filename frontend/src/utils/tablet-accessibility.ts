/**
 * Tablet-specific accessibility utilities
 * Ensures proper touch targets, keyboard navigation, and screen reader support
 */

import { DeviceCapabilities } from './device-detection';

export interface TabletAccessibilityConfig {
  touchTargetSize: number;
  touchTargetSpacing: number;
  enableHapticFeedback: boolean;
  enhancedFocus: boolean;
  largeTextSupport: boolean;
  reduceMotionCompliance: boolean;
  voiceOverOptimized: boolean;
  talkBackOptimized: boolean;
}

/**
 * Generate accessibility configuration for tablet devices
 */
export function getTabletAccessibilityConfig(capabilities: DeviceCapabilities): TabletAccessibilityConfig {
  const baseConfig: TabletAccessibilityConfig = {
    touchTargetSize: 48,
    touchTargetSpacing: 8,
    enableHapticFeedback: false,
    enhancedFocus: false,
    largeTextSupport: false,
    reduceMotionCompliance: capabilities.preferReducedMotion,
    voiceOverOptimized: capabilities.isIOSDevice,
    talkBackOptimized: capabilities.isAndroidDevice,
  };

  // iPad-specific optimizations
  if (capabilities.isIPadDevice) {
    return {
      ...baseConfig,
      touchTargetSize: 44, // iOS HIG standard
      touchTargetSpacing: 8,
      enableHapticFeedback: true,
      enhancedFocus: true,
      voiceOverOptimized: true,
    };
  }

  // Android tablet optimizations
  if (capabilities.isAndroidDevice && capabilities.isTabletDevice) {
    return {
      ...baseConfig,
      touchTargetSize: 48, // Material Design standard
      touchTargetSpacing: 8,
      talkBackOptimized: true,
      enhancedFocus: true,
    };
  }

  // Large tablet optimizations
  if (capabilities.screenSize === 'large') {
    return {
      ...baseConfig,
      touchTargetSize: 56, // Larger for better tablet interaction
      touchTargetSpacing: 12,
      largeTextSupport: true,
    };
  }

  return baseConfig;
}

/**
 * Calculate optimal touch target dimensions based on content and device
 */
export function calculateTouchTarget(
  contentType: 'text' | 'icon' | 'combo',
  importance: 'primary' | 'secondary' | 'tertiary',
  config: TabletAccessibilityConfig
): { width: number; height: number; padding: number } {
  const baseSize = config.touchTargetSize;
  const spacing = config.touchTargetSpacing;

  switch (importance) {
    case 'primary':
      return {
        width: baseSize + 8,
        height: baseSize + 8,
        padding: spacing + 4,
      };
    case 'secondary':
      return {
        width: baseSize,
        height: baseSize,
        padding: spacing,
      };
    case 'tertiary':
      return {
        width: Math.max(40, baseSize - 8),
        height: Math.max(40, baseSize - 8),
        padding: Math.max(4, spacing - 2),
      };
    default:
      return {
        width: baseSize,
        height: baseSize,
        padding: spacing,
      };
  }
}

/**
 * Generate accessible focus styles for tablet navigation
 */
export function getTabletFocusStyles(config: TabletAccessibilityConfig) {
  const focusRing = config.enhancedFocus 
    ? '3px solid rgba(102, 126, 234, 0.6)'
    : '2px solid rgba(102, 126, 234, 0.4)';
  
  return {
    outline: 'none',
    boxShadow: `0 0 0 ${focusRing}`,
    borderRadius: '6px',
    transition: config.reduceMotionCompliance ? 'none' : 'box-shadow 0.15s ease-in-out',
  };
}

/**
 * Tablet-specific keyboard navigation patterns
 */
export const TABLET_KEY_PATTERNS = {
  SIDEBAR_NAVIGATION: {
    ArrowDown: 'next-item',
    ArrowUp: 'previous-item',
    Enter: 'activate',
    Space: 'activate',
    Home: 'first-item',
    End: 'last-item',
    Escape: 'close-sidebar',
  },
  DASHBOARD_WIDGETS: {
    Tab: 'next-widget',
    'Shift+Tab': 'previous-widget',
    ArrowRight: 'next-column',
    ArrowLeft: 'previous-column',
    ArrowDown: 'next-row',
    ArrowUp: 'previous-row',
    Enter: 'focus-widget',
    Escape: 'exit-widget',
  },
  CHAT_INTERFACE: {
    ArrowUp: 'previous-message',
    ArrowDown: 'next-message',
    'Cmd+K': 'quick-search',
    'Ctrl+K': 'quick-search',
    Enter: 'send-message',
    Escape: 'close-chat',
    Tab: 'next-conversation',
    'Shift+Tab': 'previous-conversation',
  },
} as const;

/**
 * Handle tablet keyboard navigation
 */
export function handleTabletKeyboard(
  event: KeyboardEvent,
  context: keyof typeof TABLET_KEY_PATTERNS,
  onAction: (action: string) => void
): boolean {
  const patterns = TABLET_KEY_PATTERNS[context];
  const key = event.shiftKey ? `Shift+${event.key}` : 
              event.ctrlKey ? `Ctrl+${event.key}` :
              event.metaKey ? `Cmd+${event.key}` : event.key;
  
  const action = patterns[key as keyof typeof patterns];
  
  if (action) {
    event.preventDefault();
    onAction(action);
    return true;
  }
  
  return false;
}

/**
 * Generate screen reader announcements for tablet navigation changes
 */
export function createTabletAnnouncement(
  type: 'navigation' | 'layout' | 'interaction' | 'status',
  context: string,
  details?: Record<string, any>
): string {
  switch (type) {
    case 'navigation':
      switch (context) {
        case 'sidebar-opened':
          return 'Navegación lateral abierta. Use las flechas para navegar entre opciones.';
        case 'sidebar-closed':
          return 'Navegación lateral cerrada.';
        case 'orientation-change':
          const orientation = details?.orientation || 'desconocida';
          return `Orientación cambiada a ${orientation}. Diseño actualizado.`;
        default:
          return `Navegación: ${context}`;
      }
      
    case 'layout':
      switch (context) {
        case 'columns-changed':
          const columns = details?.columns || 1;
          return `Diseño cambiado a ${columns} ${columns === 1 ? 'columna' : 'columnas'}.`;
        case 'widget-expanded':
          return `Widget ${details?.title || ''} expandido.`;
        case 'widget-collapsed':
          return `Widget ${details?.title || ''} contraído.`;
        case 'split-screen-enabled':
          return 'Pantalla dividida activada.';
        case 'split-screen-disabled':
          return 'Pantalla dividida desactivada.';
        default:
          return `Diseño: ${context}`;
      }
      
    case 'interaction':
      switch (context) {
        case 'drag-started':
          return 'Inicio de arrastre. Use las flechas para mover o Escape para cancelar.';
        case 'drag-ended':
          return 'Arrastre completado.';
        case 'resize-started':
          return 'Inicio de redimensionado. Use las flechas para ajustar el tamaño.';
        case 'resize-ended':
          return 'Redimensionado completado.';
        default:
          return `Interacción: ${context}`;
      }
      
    case 'status':
      switch (context) {
        case 'messages-updated':
          const count = details?.count || 0;
          return `${count} ${count === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}.`;
        case 'connection-status':
          const status = details?.online ? 'conectado' : 'desconectado';
          return `Estado de conexión: ${status}.`;
        default:
          return `Estado: ${context}`;
      }
      
    default:
      return context;
  }
}

/**
 * Tablet haptic feedback patterns
 */
export const TABLET_HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
  navigation: [5],
  selection: [15],
  resize: [8, 8, 8],
} as const;

/**
 * Trigger haptic feedback for tablet interactions
 */
export function triggerTabletHaptic(
  pattern: keyof typeof TABLET_HAPTIC_PATTERNS,
  config: TabletAccessibilityConfig
): void {
  if (!config.enableHapticFeedback || !navigator.vibrate) return;
  
  const vibrationPattern = TABLET_HAPTIC_PATTERNS[pattern];
  navigator.vibrate(vibrationPattern);
}

/**
 * Validate touch target accessibility compliance
 */
export function validateTouchTargetAccessibility(
  element: HTMLElement,
  config: TabletAccessibilityConfig
): { compliant: boolean; issues: string[] } {
  const rect = element.getBoundingClientRect();
  const issues: string[] = [];
  
  const minSize = config.touchTargetSize;
  const minSpacing = config.touchTargetSpacing;
  
  // Check minimum size
  if (rect.width < minSize) {
    issues.push(`Ancho insuficiente: ${rect.width}px < ${minSize}px mínimo`);
  }
  
  if (rect.height < minSize) {
    issues.push(`Alto insuficiente: ${rect.height}px < ${minSize}px mínimo`);
  }
  
  // Check spacing (simplified - would need sibling analysis in real implementation)
  const style = window.getComputedStyle(element);
  const margin = parseInt(style.marginTop) + parseInt(style.marginBottom) +
                 parseInt(style.marginLeft) + parseInt(style.marginRight);
  
  if (margin < minSpacing) {
    issues.push(`Espaciado insuficiente: ${margin}px < ${minSpacing}px mínimo`);
  }
  
  // Check color contrast (simplified)
  const color = style.color;
  const backgroundColor = style.backgroundColor;
  if (color === backgroundColor) {
    issues.push('Contraste de color insuficiente');
  }
  
  // Check focus indicators
  if (!element.matches(':focus-visible')) {
    const focusStyle = style.outline;
    if (!focusStyle || focusStyle === 'none') {
      issues.push('Indicador de foco faltante');
    }
  }
  
  return {
    compliant: issues.length === 0,
    issues,
  };
}

/**
 * React hook for tablet accessibility features
 */
export function useTabletAccessibility(capabilities: DeviceCapabilities) {
  const config = getTabletAccessibilityConfig(capabilities);
  
  const announceChange = (
    type: Parameters<typeof createTabletAnnouncement>[0],
    context: string,
    details?: Record<string, any>
  ) => {
    const message = createTabletAnnouncement(type, context, details);
    
    // Create announcement element if it doesn't exist
    let announcer = document.getElementById('tablet-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'tablet-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }
    
    // Clear and announce
    announcer.textContent = '';
    setTimeout(() => {
      announcer!.textContent = message;
    }, 100);
  };
  
  const handleHaptic = (pattern: keyof typeof TABLET_HAPTIC_PATTERNS) => {
    triggerTabletHaptic(pattern, config);
  };
  
  const validateElement = (element: HTMLElement) => {
    return validateTouchTargetAccessibility(element, config);
  };
  
  return {
    config,
    announceChange,
    handleHaptic,
    validateElement,
    focusStyles: getTabletFocusStyles(config),
  };
}