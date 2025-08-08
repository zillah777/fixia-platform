/**
 * Tablet Navigation Components
 * 
 * Comprehensive tablet navigation system optimized for Fixia marketplace
 * Supports both portrait and landscape orientations with adaptive layouts
 */

// Core tablet navigation components
export { TabletSideNavigation } from './TabletSideNavigation';
export { TabletAdaptiveHeader } from './TabletAdaptiveHeader';
export { TabletDashboardLayout } from './TabletDashboardLayout';
export { TabletChatInterface } from './TabletChatInterface';

// Context and hooks
export { 
  TabletNavigationProvider, 
  useTabletNavigation, 
  useIsTabletNavigation 
} from '@/contexts/TabletNavigationContext';

// Device detection utilities
export {
  useTabletCapabilities,
  shouldUseTabletNavigation,
  getTabletNavigationLayout,
  getTouchTargetSize
} from '@/utils/device-detection';

// Type definitions
export type { DeviceCapabilities } from '@/utils/device-detection';

/**
 * Usage Examples:
 * 
 * 1. Basic tablet layout with all components:
 * ```tsx
 * import { TabletNavigationProvider } from '@/components/tablet';
 * 
 * function App() {
 *   return (
 *     <TabletNavigationProvider>
 *       <MarketplaceLayout enableTabletOptimizations={true}>
 *         <YourContent />
 *       </MarketplaceLayout>
 *     </TabletNavigationProvider>
 *   );
 * }
 * ```
 * 
 * 2. Custom tablet dashboard:
 * ```tsx
 * import { TabletDashboardLayout, useTabletNavigation } from '@/components/tablet';
 * 
 * function Dashboard() {
 *   const { columnCount, orientation } = useTabletNavigation();
 *   
 *   return (
 *     <TabletDashboardLayout
 *       widgets={dashboardWidgets}
 *       showLayoutControls={true}
 *     />
 *   );
 * }
 * ```
 * 
 * 3. Split-screen chat interface:
 * ```tsx
 * import { TabletChatInterface, useTabletNavigation } from '@/components/tablet';
 * 
 * function Messages() {
 *   const { splitScreenMode, toggleSplitScreen } = useTabletNavigation();
 *   
 *   return (
 *     <TabletChatInterface
 *       conversations={conversations}
 *       currentUserId={user.id}
 *       onSendMessage={handleSendMessage}
 *     />
 *   );
 * }
 * ```
 * 
 * 4. Check if tablet navigation is active:
 * ```tsx
 * import { useIsTabletNavigation } from '@/components/tablet';
 * 
 * function Component() {
 *   const isTablet = useIsTabletNavigation();
 *   
 *   if (isTablet) {
 *     return <TabletOptimizedView />;
 *   }
 *   
 *   return <MobileView />;
 * }
 * ```
 */