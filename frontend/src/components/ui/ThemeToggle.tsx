import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/helpers';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button' | 'switch';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  variant = 'icon',
}) => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Icons
  const SunIcon = () => (
    <svg
      className={iconSizes[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      className={iconSizes[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  const SystemIcon = () => (
    <svg
      className={iconSizes[size]}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon />;
      case 'dark':
        return <MoonIcon />;
      case 'system':
        return <SystemIcon />;
      default:
        return <SunIcon />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Cambiar a modo oscuro';
      case 'dark':
        return 'Cambiar a modo sistema';
      case 'system':
        return 'Cambiar a modo claro';
      default:
        return 'Cambiar tema';
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "inline-flex items-center justify-center rounded-lg",
          "transition-all duration-200 ease-out",
          "hover:bg-neutral-100 active:bg-neutral-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          "dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
          "text-neutral-700 dark:text-neutral-300",
          sizes[size],
          className
        )}
        title={getLabel()}
        aria-label={getLabel()}
      >
        <div className="relative">
          {getIcon()}
          {/* Theme indicator */}
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-neutral-800",
              actualTheme === 'dark' ? 'bg-blue-500' : 'bg-amber-500'
            )}
          />
        </div>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
          "transition-all duration-200 ease-out",
          "hover:bg-neutral-100 active:bg-neutral-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          "dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
          "text-neutral-700 dark:text-neutral-300",
          "text-sm font-medium",
          className
        )}
      >
        {getIcon()}
        <span className="capitalize">{theme}</span>
      </button>
    );
  }

  // Switch variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Tema
      </span>
      <button
        onClick={toggleTheme}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full",
          "transition-colors duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          actualTheme === 'dark' 
            ? 'bg-primary-600' 
            : 'bg-neutral-200 dark:bg-neutral-700'
        )}
        role="switch"
        aria-checked={actualTheme === 'dark'}
        aria-label={getLabel()}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-out",
            "flex items-center justify-center",
            actualTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          )}
        >
          <div className="h-2 w-2">
            {actualTheme === 'dark' ? (
              <MoonIcon />
            ) : (
              <SunIcon />
            )}
          </div>
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;