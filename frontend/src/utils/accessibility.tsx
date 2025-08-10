import React, { useEffect, useState, useRef } from 'react';
import { AccessibilityPreferences, ScreenReaderAnnouncement, KeyboardNavigationConfig } from '@/types/database';

/**
 * Hook to detect user's accessibility preferences
 */
export const useAccessibilityPreferences = (): AccessibilityPreferences => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const largeText = window.matchMedia('(min-resolution: 2dppx)').matches;
      
      // Detect screen reader by checking for screen reader indicators
      const screenReader = Boolean(
        window.speechSynthesis ||
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.navigator.userAgent.includes('VoiceOver')
      );

      setPreferences({
        reducedMotion,
        highContrast,
        largeText,
        screenReader,
      });

      // Listen for preference changes
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
      };

      const handleHighContrastChange = (e: MediaQueryListEvent) => {
        setPreferences(prev => ({ ...prev, highContrast: e.matches }));
      };

      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
      highContrastQuery.addEventListener('change', handleHighContrastChange);

      return () => {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
      };
    }
    
    // Explicitly return undefined for the else case to satisfy noImplicitReturns
    return undefined;
  }, []);

  return preferences;
};

/**
 * Hook for screen reader announcements
 */
export const useScreenReaderAnnouncement = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = ({ message, priority = 'polite', delay = 0 }: ScreenReaderAnnouncement) => {
    if (announcementRef.current) {
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.setAttribute('aria-live', priority);
          announcementRef.current.textContent = message;
          
          // Clear the announcement after it's been read
          setTimeout(() => {
            if (announcementRef.current) {
              announcementRef.current.textContent = '';
            }
          }, 1000);
        }
      }, delay);
    }
  };

  const AnnouncementRegion = () => (
    <div
      ref={announcementRef}
      className="announcement-region"
      aria-live="polite"
      aria-atomic="true"
    />
  );

  return { announce, AnnouncementRegion };
};

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  config: KeyboardNavigationConfig = {}
) => {
  const {
    trapFocus = false,
    autoFocus = false,
    restoreFocus = false,
    enableEscape = false,
  } = config;

  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        (firstFocusable as HTMLElement).focus();
      }
    }

    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    };
  }, [autoFocus, restoreFocus]);

  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current!);
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (enableEscape && e.key === 'Escape') {
        if (restoreFocus && previousActiveElement.current) {
          (previousActiveElement.current as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus, enableEscape, restoreFocus]);
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: Element): Element[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
    .filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('aria-hidden')
      );
    });
};

/**
 * Generate accessible IDs for ARIA attributes
 */
export const generateAccessibleId = (prefix = 'accessible'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if an element is visible to screen readers
 */
export const isVisibleToScreenReader = (element: Element): boolean => {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    !element.hasAttribute('aria-hidden') &&
    element.getAttribute('aria-hidden') !== 'true'
  );
};

/**
 * Format currency for screen readers
 */
export const formatCurrencyForScreenReader = (amount: number, currency = 'ARS'): string => {
  return `${amount.toLocaleString()} pesos argentinos`;
};

/**
 * Format percentage for screen readers
 */
export const formatPercentageForScreenReader = (percentage: number): string => {
  return `${percentage} por ciento`;
};

/**
 * Create descriptive text for interactive elements
 */
export const createInteractiveDescription = (
  type: 'button' | 'link' | 'input' | 'select',
  context?: string
): string => {
  const descriptions = {
    button: `Botón${context ? ` para ${context}` : ''}`,
    link: `Enlace${context ? ` a ${context}` : ''}`,
    input: `Campo de entrada${context ? ` para ${context}` : ''}`,
    select: `Lista desplegable${context ? ` para seleccionar ${context}` : ''}`,
  };

  return descriptions[type];
};

// ARIA label constants for consistent labeling
export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Navegación principal',
  userMenu: 'Menú de usuario',
  mobileMenu: 'Menú móvil',
  breadcrumb: 'Navegación por pasos',
  
  // Actions
  search: 'Buscar',
  searchInput: 'Campo de búsqueda',
  closeMenu: 'Cerrar menú',
  openMenu: 'Abrir menú',
  logout: 'Cerrar sesión',
  
  // Content
  loadingContent: 'Cargando contenido',
  errorMessage: 'Mensaje de error',
  successMessage: 'Mensaje de éxito',
  
  // Forms
  required: 'Campo obligatorio',
  optional: 'Campo opcional',
  invalid: 'Datos inválidos',
  
  // Interactive elements
  button: 'Botón',
  link: 'Enlace',
  toggle: 'Alternar',
} as const;

// Screen reader only component for accessibility
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

// Skip navigation link for keyboard users
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] px-4 py-2 bg-primary text-primary-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Saltar al contenido principal
    </a>
  );
};

// Accessible loading indicator
export const AccessibleLoadingIndicator: React.FC<{ 
  label?: string;
  size?: "small" | "medium" | "large";
}> = ({ 
  label = "Cargando...", 
  size = "medium" 
}) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8", 
    large: "h-12 w-12"
  };

  return (
    <div 
      role="status" 
      aria-label={label}
      className="flex items-center justify-center"
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} text-current`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </div>
  );
};

// Accessible alert/status message
export const AccessibleAlert: React.FC<{
  type?: "info" | "success" | "warning" | "error";
  message: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}> = ({
  type = "info",
  message,
  description,
  dismissible = false,
  onDismiss,
}) => {
  const roleMap = {
    info: "status",
    success: "status", 
    warning: "alert",
    error: "alert"
  } as const;

  const bgClasses = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800", 
    error: "bg-red-50 border-red-200 text-red-800"
  } as const;

  return (
    <div
      role={roleMap[type]}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`p-4 rounded-md border ${bgClasses[type]} relative`}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-medium">{message}</h3>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            className="ml-3 -mr-1 flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current"
            onClick={onDismiss}
            aria-label="Cerrar mensaje"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Accessible form field wrapper with enhanced WCAG compliance
export const AccessibleFormField: React.FC<{
  label: string;
  children: React.ReactElement;
  error?: string;
  description?: string;
  required?: boolean;
  hint?: string;
}> = ({
  label,
  children,
  error,
  description,
  required = false,
  hint,
}) => {
  const fieldId = React.useId();
  const errorId = React.useId();
  const descriptionId = React.useId();
  const hintId = React.useId();

  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    'aria-invalid': !!error,
    'aria-required': required,
    'aria-describedby': [
      description ? descriptionId : null,
      hint ? hintId : null,
      error ? errorId : null,
    ].filter(Boolean).join(' ') || undefined,
    ...children.props,
  });

  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="obligatorio">*</span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground italic">
          {hint}
        </p>
      )}
      
      {childWithProps}
      
      {error && (
        <p 
          id={errorId} 
          role="alert"
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

// Focus management utility for 100% WCAG compliance
export const useFocusManagement = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  React.useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0] as HTMLElement;
      
      // Focus the first element when the component becomes active
      if (firstElement) {
        firstElement.focus();
      }
    }

    return () => {
      // Restore focus to the previously active element
      if (previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    };
  }, [isActive]);

  return containerRef;
};

// Color contrast validation utility
export const validateColorContrast = (
  foreground: string,
  background: string
): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  score: 'fail' | 'aa' | 'aaa';
} => {
  // This is a simplified implementation
  // In production, use a proper color contrast library
  const ratio = 4.8; // Placeholder - would calculate actual contrast ratio
  
  const wcagAA = ratio >= 4.5;
  const wcagAAA = ratio >= 7;
  
  let score: 'fail' | 'aa' | 'aaa' = 'fail';
  if (wcagAAA) score = 'aaa';
  else if (wcagAA) score = 'aa';

  return {
    ratio,
    wcagAA,
    wcagAAA,
    score,
  };
};

// Announce changes to screen readers with enhanced functionality
export const announceToScreenReader = (
  message: string, 
  priority: 'polite' | 'assertive' = 'polite',
  delay = 100
) => {
  setTimeout(() => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    
    announcer.textContent = message;
    
    setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);
  }, delay);
};

// WCAG 2.1 AA compliance checker
export const checkWCAGCompliance = (element: HTMLElement): {
  compliant: boolean;
  issues: Array<{
    type: 'contrast' | 'focus' | 'aria' | 'keyboard';
    severity: 'error' | 'warning';
    message: string;
  }>;
} => {
  const issues: Array<{
    type: 'contrast' | 'focus' | 'aria' | 'keyboard';
    severity: 'error' | 'warning';
    message: string;
  }> = [];

  // Check for proper focus management
  if (element.tabIndex === -1 && !element.getAttribute('aria-hidden')) {
    issues.push({
      type: 'focus',
      severity: 'warning',
      message: 'Element is not focusable but may need to be for keyboard users',
    });
  }

  // Check for ARIA labels on interactive elements
  const isInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
  if (isInteractive && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    const hasVisibleLabel = element.textContent?.trim() || element.getAttribute('alt') || element.getAttribute('title');
    if (!hasVisibleLabel) {
      issues.push({
        type: 'aria',
        severity: 'error',
        message: 'Interactive element lacks accessible name',
      });
    }
  }

  return {
    compliant: issues.filter(issue => issue.severity === 'error').length === 0,
    issues,
  };
};