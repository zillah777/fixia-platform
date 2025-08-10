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
export { ScrollArea } from './scroll-area';
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
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
  TooltipWithVariants,
  SimpleTooltip,
  type TooltipVariantProps
} from './tooltip';
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

// Unified Design System Exports
// All components use the consolidated Liquid Glass Design System

// Export accessibility components
export {
  ARIA_LABELS,
  ScreenReaderOnly,
  SkipToContent,
  AccessibleLoadingIndicator,
  AccessibleAlert,
  AccessibleFormField,
  useFocusManagement,
  validateColorContrast,
  announceToScreenReader,
  checkWCAGCompliance,
} from '@/utils/accessibility';

// Export unified glass system hooks  
export {
  useGlassSystem,
  useButtonGlassSystem,
  useCardGlassSystem,
  useInputGlassSystem,
  useNavigationGlassSystem,
  GLASS_TOKENS,
  COMPONENT_GLASS,
  USER_TYPE_GLASS,
} from '@/hooks/useGlassSystem';

// Export unified navigation system
export {
  useUnifiedNavigation,
  useMobileNavigation,
  useDropdownNavigation,
  useBreadcrumbNavigation,
} from '@/hooks/useUnifiedNavigation';

// Clean UI exports - no more duplicate adaptive components
// All components are now unified with the glass design system