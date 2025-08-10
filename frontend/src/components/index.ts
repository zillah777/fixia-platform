/**
 * Unified Component Exports
 * Centralized export of all consolidated frontend components
 * Eliminates navigation fragmentation and component duplication
 */

// Re-export all UI components
export * from './ui';

// Legacy component exports (for backward compatibility)
export { FixiaNavigation } from './FixiaNavigation';
export { FixiaHeroPanel } from './FixiaHeroPanel';
export { ExplorerHeroPanel } from './ExplorerHeroPanel';
export { FixiaSummaryCards } from './FixiaSummaryCards';
export { ExplorerSummaryCards } from './ExplorerSummaryCards';
export { ExplorerRequestsTable } from './ExplorerRequestsTable';
export { FixiaServicesTable } from './FixiaServicesTable';

// Unified components that replace multiple legacy components
export { UnifiedNavigation } from './navigation/UnifiedNavigation';
export { UnifiedHeroPanel } from './UnifiedHeroPanel';
export { UnifiedSummaryCards } from './UnifiedSummaryCards';
export { UnifiedChatInterface } from './UnifiedChatInterface';

// Layout components
export { default as MarketplaceLayout } from './layouts/MarketplaceLayout';

// Specialized components
export { default as Logo } from './Logo';
export { OnboardingHelper, SimpleTooltip } from './OnboardingHelper';
export { ProgressIndicator } from './ProgressIndicator';
export { PromotionBanner } from './PromotionBanner';
export { SimpleBookingFlow } from './SimpleBookingFlow';
export { useSimpleErrorHandler } from './SimpleErrorHandler';

// Auth components
export { default as ProtectedRoute } from './auth/ProtectedRoute';

// Error recovery components
export * from './error-recovery';

// Email components
export { default as EmailTemplate } from './email/EmailTemplate';
export { PromotionWelcomeEmail } from './email-templates/PromotionWelcomeEmail';

// SEO components
export { default as MetaTags } from './seo/MetaTags';

// Skeleton components (already exported via ui/index.ts)
export * from './skeletons';

// Subscription components
export { default as SubscriptionPlansModal } from './subscription/SubscriptionPlansModal';

// Tablet components
export * from './tablet';

/**
 * Component Migration Guide
 * 
 * OLD -> NEW (Unified Components)
 * ================================
 * 
 * FixiaNavigation + TabletNavigation + IOSBottomNavigation + various headers
 * -> UnifiedNavigation (single component handles all navigation patterns)
 * 
 * FixiaHeroPanel + ExplorerHeroPanel
 * -> UnifiedHeroPanel (role-based configuration)
 * 
 * FixiaSummaryCards + ExplorerSummaryCards
 * -> UnifiedSummaryCards (role-based configuration)
 * 
 * AS chat/[chatId].tsx + Explorer chat/[chatId].tsx
 * -> UnifiedChatInterface (role-aware unified interface)
 * 
 * Multiple layout components
 * -> MarketplaceLayout with unified navigation integration
 * 
 * Usage Examples:
 * 
 * // Old fragmented navigation
 * <FixiaNavigation />
 * <TabletSideNavigation />
 * <IOSBottomNavigation />
 * 
 * // New unified navigation
 * <UnifiedNavigation 
 *   variant="desktop" 
 *   enableUserTypeSwitching={true}
 * />
 * 
 * // Old duplicate hero panels
 * {userType === 'provider' ? <FixiaHeroPanel /> : <ExplorerHeroPanel />}
 * 
 * // New unified hero panel
 * <UnifiedHeroPanel userType={userType} />
 * 
 * // Old duplicate summary cards
 * {userType === 'provider' ? <FixiaSummaryCards /> : <ExplorerSummaryCards />}
 * 
 * // New unified summary cards  
 * <UnifiedSummaryCards userType={userType} />
 * 
 * // Old separate chat pages
 * // /as/chat/[chatId].tsx and /explorador/chat/[chatId].tsx
 * 
 * // New unified chat component
 * <UnifiedChatInterface 
 *   chatId={chatId} 
 *   userType={userType}
 *   enableServiceCompletion={userType === 'provider'}
 *   enableRating={userType === 'customer'}
 * />
 */