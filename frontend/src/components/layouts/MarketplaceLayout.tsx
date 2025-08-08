import React from 'react';
import Head from 'next/head';
import { IOSBottomNavigation } from '@/components/ui/ios-bottom-navigation';
import { TabletNavigationProvider, useIsTabletNavigation } from '@/contexts/TabletNavigationContext';
import { TabletSideNavigation } from '@/components/tablet/TabletSideNavigation';
import { TabletAdaptiveHeader } from '@/components/tablet/TabletAdaptiveHeader';

interface MarketplaceLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBottomNav?: boolean;
  maxWidth?: string;
  // Tablet-specific props
  showTabletHeader?: boolean;
  showTabletSidebar?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  enableTabletOptimizations?: boolean;
}

// Internal component that handles tablet navigation
const TabletAwareLayoutContent: React.FC<Omit<MarketplaceLayoutProps, 'enableTabletOptimizations'>> = ({
  children,
  title,
  description,
  showHeader,
  showFooter,
  showBottomNav,
  maxWidth,
  showTabletHeader = true,
  showTabletSidebar = true,
  headerTitle,
  headerSubtitle,
}) => {
  const isTabletNavigation = useIsTabletNavigation();

  return (
    <>
      {title && (
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Head>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        </div>
        
        {/* Tablet Navigation Components */}
        {isTabletNavigation && (
          <>
            {/* Tablet Header */}
            {showTabletHeader && (
              <TabletAdaptiveHeader
                {...(headerTitle && { title: headerTitle })}
                {...(headerSubtitle && { subtitle: headerSubtitle })}
                className="relative z-20"
              />
            )}
            
            {/* Tablet Side Navigation */}
            {showTabletSidebar && (
              <TabletSideNavigation className="relative z-20" />
            )}
          </>
        )}
        
        {/* Main Content */}
        <main 
          className={`
            relative z-10 transition-all duration-300
            ${isTabletNavigation ? 'tablet-layout-content' : ''}
          `}
          style={{
            marginLeft: isTabletNavigation ? 'var(--tablet-sidebar-width, 0)' : '0',
            paddingTop: isTabletNavigation && showTabletHeader ? 'var(--tablet-header-height, 0)' : '0'
          }}
        >
          {children}
        </main>
        
        {/* iOS-style Bottom Navigation for mobile (hidden on tablets) */}
        {showBottomNav && !isTabletNavigation && <IOSBottomNavigation />}
      </div>
    </>
  );
};

const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({
  enableTabletOptimizations = true,
  ...props
}) => {
  // If tablet optimizations are disabled, use the original layout
  if (!enableTabletOptimizations) {
    const {
      children,
      title = 'Fixia - Plataforma de Servicios Profesionales',
      description = 'Conecta con profesionales verificados en Chubut, Argentina',
      showBottomNav = true,
    } = props;

    return (
      <>
        {title && (
          <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
          </Head>
        )}
        
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
          </div>
          
          <main className="relative z-10">
            {children}
          </main>
          
          {showBottomNav && <IOSBottomNavigation />}
        </div>
      </>
    );
  }

  // With tablet optimizations enabled, wrap in tablet navigation provider
  return (
    <TabletNavigationProvider>
      <TabletAwareLayoutContent {...props} />
      
      {/* Add CSS variables for layout calculations */}
      <style jsx global>{`
        :root {
          --tablet-sidebar-width: 0px;
          --tablet-header-height: 0px;
        }
        
        .tablet-layout-content {
          min-height: calc(100vh - var(--tablet-header-height, 0));
        }
        
        /* Tablet sidebar positioning */
        @media (min-width: 1024px) and (orientation: landscape) {
          :root {
            --tablet-sidebar-width: 288px;
            --tablet-header-height: 70px;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          :root {
            --tablet-sidebar-width: 0px;
            --tablet-header-height: 70px;
          }
        }
        
        /* Tablet-specific touch enhancements */
        @media (pointer: coarse) and (min-width: 768px) {
          .tablet-touch-target {
            min-height: 48px;
            min-width: 48px;
          }
          
          .tablet-touch-large {
            min-height: 56px;
            min-width: 56px;
          }
        }
        
        /* Tablet glass effect optimizations */
        @media (min-width: 768px) and (max-width: 1279px) {
          .glass-tablet {
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
          }
          
          .glass-tablet-sidebar {
            backdrop-filter: saturate(150%) blur(20px);
            -webkit-backdrop-filter: saturate(150%) blur(20px);
          }
          
          .glass-tablet-strong {
            backdrop-filter: blur(36px);
            -webkit-backdrop-filter: blur(36px);
          }
        }
      `}</style>
    </TabletNavigationProvider>
  );
};

export default MarketplaceLayout;