import React from 'react';

// Re-export all UI components for easy importing
export { Button } from './button';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
export { Input } from './input';
export { Badge } from './badge';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Checkbox } from './checkbox';
export { Label } from './label';
export { Progress } from './progress';
export { Separator } from './separator';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './table';
export { IOSBottomNavigation } from './ios-bottom-navigation';

// Skeleton components
export {
  Skeleton,
  TextSkeleton,
  CircleSkeleton,
  CardSkeleton,
  type SkeletonProps,
  type TextSkeletonProps,
  type CircleSkeletonProps,
  type CardSkeletonProps
} from './skeleton';

// Optimized Image components
export {
  FixiaImage,
  type FixiaImageProps
} from './fixia-image';

export {
  FixiaAvatar,
  type FixiaAvatarProps
} from './fixia-avatar';

export {
  FixiaServiceImage,
  type FixiaServiceImageProps
} from './fixia-service-image';

export {
  FixiaCategoryIcon,
  type FixiaCategoryIconProps
} from './fixia-category-icon';

export {
  FixiaOptimizedLogo,
  FixiaNavLogo,
  FixiaFooterLogo,
  FixiaFaviconLogo,
  type FixiaLogoProps
} from './fixia-logo';

// Legacy component aliases for backward compatibility
export { Button as CorporateButton } from './button';
export { Card as CorporateCard } from './card';
export { Input as CorporateInput } from './input';

// Corporate layout component (basic implementation)
export const CorporateLayout: React.FC<{ children: React.ReactNode; variant?: string; maxWidth?: string }> = ({ 
  children, 
  variant = 'default', 
  maxWidth = 'full' 
}) => 
  React.createElement('div', 
    { className: 'min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden' },
    React.createElement('div', { className: 'absolute inset-0' },
      React.createElement('div', { className: 'absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float' }),
      React.createElement('div', { className: 'absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float', style: { animationDelay: '2s' } })
    ),
    React.createElement('main', { className: 'relative z-10' }, children)
  );

export const CorporateHeader: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement('header', { className: 'glass border-b border-white/10 p-6' }, children);

export const CorporateFooter: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement('footer', { className: 'glass border-t border-white/10 p-6 mt-auto' }, children);

export const CorporateNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement('nav', { className: 'glass border-b border-white/10 p-4' }, children);