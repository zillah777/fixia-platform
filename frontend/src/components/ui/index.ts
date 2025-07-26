// 🎨 FIXIA 2025 - SISTEMA DE DISEÑO COMPLETO
// "Conecta. Confía. Resuelve." - Filosofía: "Confianza Líquida"

// 🚀 FIXIA DESIGN SYSTEM - New Components
// Core Components
export {
  FixiaButton,
  type FixiaButtonProps
} from './FixiaButton';

export {
  FixiaCard,
  FixiaCardHeader,
  FixiaCardBody,
  FixiaCardFooter,
  FixiaCardTitle,
  FixiaCardSubtitle,
  type FixiaCardProps,
  type FixiaCardHeaderProps,
  type FixiaCardBodyProps,
  type FixiaCardFooterProps,
  type FixiaCardTitleProps,
  type FixiaCardSubtitleProps
} from './FixiaCard';

export {
  FixiaNavigation,
  FixiaNavLink,
  FixiaBottomNavigation,
  defaultBottomNavItems,
  type FixiaNavigationProps,
  type FixiaNavLinkProps,
  type FixiaBottomNavProps
} from './FixiaNavigation';

export {
  FixiaBadge,
  FixiaRatingBadge,
  FixiaVerificationBadge,
  FixiaTrustIndicators,
  type FixiaBadgeProps,
  type FixiaRatingBadgeProps,
  type FixiaVerificationBadgeProps,
  type FixiaTrustIndicatorsProps
} from './FixiaBadge';

// Theme & Dark Mode
export {
  FixiaThemeToggle,
  FixiaThemeProvider,
  useFixiaTheme,
  type FixiaThemeToggleProps,
  type FixiaThemeProviderProps
} from './FixiaThemeToggle';

// Animations & Interactions
export {
  FixiaLoadingSpinner,
  FixiaSkeleton,
  FixiaCardSkeleton,
  FixiaFadeIn,
  FixiaStagger,
  FixiaToast,
  FixiaProgress,
  FixiaFAB,
  FixiaPulseDot,
  type FixiaLoadingSpinnerProps,
  type FixiaSkeletonProps,
  type FixiaFadeInProps,
  type FixiaStaggerProps,
  type FixiaToastProps,
  type FixiaProgressProps,
  type FixiaFABProps,
  type FixiaPulseDotProps
} from './FixiaAnimations';

// Legacy Components (Being Updated)
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as ThemeToggle } from './ThemeToggle';

// Corporate Layout System (Legacy - Being Updated)
export { default as ResponsiveContainer } from './ResponsiveContainer';
export { default as CorporateGrid } from './CorporateGrid';
export { default as CorporateSpacing } from './CorporateSpacing';
export { default as CorporateLayout } from './CorporateLayout';
export { default as CorporateNavigation } from './CorporateNavigation';
export { default as CorporateFooter } from './CorporateFooter';

// Legacy Corporate Components (To be migrated to Marketplace 2.0)
export { default as CorporateHeader } from './CorporateHeader';
export { default as CorporateCard } from './CorporateCard';
export { default as CorporateButton } from './CorporateButton';
export { default as CorporateInput } from './CorporateInput';

// Utility Components (Being modernized)
export { default as GradientText } from './GradientText';
export { default as FloatingElement } from './FloatingElement';
export { default as GlowingOrb } from './GlowingOrb';
export { default as AnimatedBackground } from './AnimatedBackground';
export { default as LazyImage } from './LazyImage';
export { default as Toast } from './Toast';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Modal } from './Modal';

// 🎨 FIXIA DESIGN SYSTEM CONSTANTS
export const FIXIA_COLORS = {
  // Brand Colors
  primary: '#226F83',
  primaryLight: '#5B9BAA',
  primaryDark: '#1A5A6B',
  secondary: '#FC8940',
  accent: '#FEC113',
  
  // Text Colors
  textPrimary: '#2C2C2C',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  // Surface Colors
  border: '#E5E7EB',
  surface: '#F9FAFB',
  white: '#FFFFFF',
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Dark Mode
  darkBg: '#0F172A',
  darkSurface: '#1E293B',
  darkBorder: '#334155',
  darkText: '#F1F5F9',
  darkTextMuted: '#94A3B8',
  darkPrimary: '#38BDF8',
  darkAccent: '#FB923C'
} as const;

export const FIXIA_TYPOGRAPHY = {
  fontDisplay: ['Work Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
  fontBody: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  fontMono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace']
} as const;

export const FIXIA_BREAKPOINTS = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
  wide: '1440px'
} as const;

export const FIXIA_ANIMATIONS = {
  fast: '150ms ease-out',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
} as const;