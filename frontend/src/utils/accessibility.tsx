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