'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

// 🎨 FIXIA THEME TOGGLE - Dark Mode Switch
// Toggle suave entre light y dark mode con animaciones

interface FixiaThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'switch' | 'floating';
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  className?: string;
}

const FixiaThemeToggle = React.forwardRef<HTMLButtonElement, FixiaThemeToggleProps>(
  ({ 
    size = 'md', 
    variant = 'button', 
    position = 'top-right',
    className 
  }, ref) => {
    const [isDark, setIsDark] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
      const stored = localStorage.getItem('fixia-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
      
      setIsDark(shouldBeDark);
      updateTheme(shouldBeDark);
    }, []);

    const updateTheme = (dark: boolean) => {
      const root = document.documentElement;
      
      if (dark) {
        root.classList.add('dark');
        localStorage.setItem('fixia-theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('fixia-theme', 'light');
      }
    };

    const toggleTheme = () => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      updateTheme(newTheme);
    };

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const positionClasses = {
      'top-right': 'fixed top-4 right-4 z-50',
      'bottom-right': 'fixed bottom-4 right-4 z-50',
      'bottom-left': 'fixed bottom-4 left-4 z-50',
      'top-left': 'fixed top-4 left-4 z-50'
    };

    if (variant === 'switch') {
      return (
        <button
          ref={ref}
          onClick={toggleTheme}
          className={cn(
            'relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isDark ? 'bg-primary-500' : 'bg-fixia-surface-border',
            className
          )}
          role="switch"
          aria-checked={isDark}
          aria-label="Toggle dark mode"
        >
          <span
            className={cn(
              'inline-block w-4 h-4 transform rounded-full bg-white transition-transform shadow-lg',
              isDark ? 'translate-x-6' : 'translate-x-1'
            )}
          >
            <span className="flex items-center justify-center w-full h-full">
              {isDark ? (
                <Moon className="w-2.5 h-2.5 text-primary-500" />
              ) : (
                <Sun className="w-2.5 h-2.5 text-accent-500" />
              )}
            </span>
          </span>
        </button>
      );
    }

    if (variant === 'floating') {
      return (
        <button
          ref={ref}
          onClick={toggleTheme}
          className={cn(
            positionClasses[position],
            sizeClasses[size],
            'rounded-full shadow-lg backdrop-blur-md border transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isDark 
              ? 'bg-fixia-dark-surface/80 border-fixia-dark-border text-fixia-dark-text hover:bg-fixia-dark-surface' 
              : 'bg-white/80 border-fixia-border text-fixia-text-primary hover:bg-white',
            className
          )}
          aria-label="Toggle dark mode"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Sun 
              className={cn(
                iconSizeClasses[size], 
                'absolute transition-all duration-300',
                isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
              )} 
            />
            <Moon 
              className={cn(
                iconSizeClasses[size], 
                'absolute transition-all duration-300',
                isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
              )} 
            />
          </div>
        </button>
      );
    }

    // Default button variant
    return (
      <button
        ref={ref}
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          sizeClasses[size],
          isDark 
            ? 'bg-fixia-dark-surface border border-fixia-dark-border text-fixia-dark-text hover:bg-fixia-dark-bg' 
            : 'bg-fixia-surface-white border border-fixia-border text-fixia-text-primary hover:bg-fixia-surface-surface',
          className
        )}
        aria-label="Toggle dark mode"
      >
        <div className="relative">
          <Sun 
            className={cn(
              iconSizeClasses[size], 
              'absolute transition-all duration-300',
              isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            )} 
          />
          <Moon 
            className={cn(
              iconSizeClasses[size], 
              'absolute transition-all duration-300',
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            )} 
          />
        </div>
      </button>
    );
  }
);

// Theme Provider Context
const FixiaThemeContext = React.createContext<{
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
} | null>(null);

interface FixiaThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

const FixiaThemeProvider: React.FC<FixiaThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'system' 
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('fixia-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let shouldBeDark = false;
    
    if (stored) {
      shouldBeDark = stored === 'dark';
    } else if (defaultTheme === 'system') {
      shouldBeDark = prefersDark;
    } else {
      shouldBeDark = defaultTheme === 'dark';
    }
    
    setIsDark(shouldBeDark);
    updateTheme(shouldBeDark);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('fixia-theme')) {
        setIsDark(e.matches);
        updateTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [defaultTheme]);

  const updateTheme = (dark: boolean) => {
    const root = document.documentElement;
    
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    updateTheme(newTheme);
    localStorage.setItem('fixia-theme', newTheme ? 'dark' : 'light');
  };

  const setTheme = (theme: 'light' | 'dark') => {
    const newTheme = theme === 'dark';
    setIsDark(newTheme);
    updateTheme(newTheme);
    localStorage.setItem('fixia-theme', theme);
  };

  return (
    <FixiaThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </FixiaThemeContext.Provider>
  );
};

// Hook to use theme context
const useFixiaTheme = () => {
  const context = React.useContext(FixiaThemeContext);
  if (!context) {
    throw new Error('useFixiaTheme must be used within a FixiaThemeProvider');
  }
  return context;
};

FixiaThemeToggle.displayName = 'FixiaThemeToggle';

export { FixiaThemeToggle, FixiaThemeProvider, useFixiaTheme };
export type { FixiaThemeToggleProps, FixiaThemeProviderProps };