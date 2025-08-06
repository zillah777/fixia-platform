'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Calendar, 
  MessageCircle, 
  User, 
  Briefcase, 
  Eye,
  Settings,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibilityPreferences } from '@/utils/accessibility';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { Badge } from '@/components/ui/badge';

// Navigation item interface
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
  ariaLabel: string;
}

// Navigation items for different user types
const getNavigationItems = (userType: 'client' | 'provider' | 'admin' | null): NavItem[] => {
  if (userType === 'provider') {
    return [
      {
        id: 'dashboard',
        label: 'Inicio',
        icon: Home,
        path: '/as/dashboard',
        ariaLabel: 'Ir al panel de control principal'
      },
      {
        id: 'services',
        label: 'Servicios',
        icon: Briefcase,
        path: '/as/servicios',
        ariaLabel: 'Gestionar mis servicios'
      },
      {
        id: 'opportunities',
        label: 'Oportunidades',
        icon: Eye,
        path: '/as/oportunidades',
        badge: 3, // Example badge count
        ariaLabel: 'Ver nuevas oportunidades de trabajo'
      },
      {
        id: 'messages',
        label: 'Mensajes',
        icon: MessageCircle,
        path: '/as/chats',
        badge: 2, // Example badge count
        ariaLabel: 'Ver conversaciones con clientes'
      },
      {
        id: 'profile',
        label: 'Perfil',
        icon: User,
        path: '/as/perfil',
        ariaLabel: 'Ver y editar mi perfil profesional'
      }
    ];
  } else if (userType === 'client') {
    return [
      {
        id: 'dashboard',
        label: 'Inicio',
        icon: Home,
        path: '/explorador/dashboard',
        ariaLabel: 'Ir al panel de control principal'
      },
      {
        id: 'search',
        label: 'Buscar',
        icon: Search,
        path: '/explorador/buscar-servicio',
        ariaLabel: 'Buscar servicios profesionales'
      },
      {
        id: 'requests',
        label: 'Mis Servicios',
        icon: Calendar,
        path: '/explorador/mis-solicitudes',
        ariaLabel: 'Ver mis solicitudes de servicio'
      },
      {
        id: 'messages',
        label: 'Mensajes',
        icon: MessageCircle,
        path: '/explorador/chats',
        badge: 1, // Example badge count
        ariaLabel: 'Ver conversaciones con profesionales'
      },
      {
        id: 'profile',
        label: 'Perfil',
        icon: User,
        path: '/explorador/perfil',
        ariaLabel: 'Ver y editar mi perfil'
      }
    ];
  }
  
  // Default navigation for unauthenticated users
  return [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      path: '/',
      ariaLabel: 'Ir a la página principal'
    },
    {
      id: 'search',
      label: 'Explorar',
      icon: Search,
      path: '/explorador/marketplace',
      ariaLabel: 'Explorar servicios disponibles'
    },
    {
      id: 'about',
      label: 'Cómo Funciona',
      icon: Star,
      path: '/como-funciona',
      ariaLabel: 'Conocer cómo funciona Fixia'
    },
    {
      id: 'login',
      label: 'Ingresar',
      icon: User,
      path: '/auth/login',
      ariaLabel: 'Iniciar sesión o registrarse'
    }
  ];
};

// Individual navigation item component
interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: (path: string) => void;
  reducedMotion: boolean;
}

const NavigationItem: React.FC<NavItemProps> = ({ 
  item, 
  isActive, 
  onClick, 
  reducedMotion 
}) => {
  const IconComponent = item.icon;
  
  const handleClick = useCallback(() => {
    onClick(item.path);
  }, [onClick, item.path]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.button
      key={item.id}
      className={cn(
        'relative flex flex-col items-center justify-center flex-1 py-2 px-1 min-h-[60px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'ios-button-animation ios-nav-item',
        'rounded-lg',
        isActive 
          ? 'text-primary-600' 
          : 'text-gray-500 hover:text-primary-500'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={item.ariaLabel}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      whileTap={reducedMotion ? {} : { 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      whileHover={reducedMotion ? {} : { 
        scale: 1.02,
        transition: { duration: 0.15 }
      }}
    >
      {/* Active indicator background */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-lg"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Icon container with badge */}
      <div className="relative mb-1">
        <motion.div
          animate={reducedMotion ? {} : {
            y: isActive ? -1 : 0,
            transition: { duration: 0.2, ease: 'easeOut' }
          }}
        >
          <IconComponent 
            size={22} 
            className={cn(
              'transition-all duration-200',
              isActive ? 'text-primary-600' : 'text-current'
            )}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </motion.div>
        
        {/* Notification badge */}
        {item.badge && item.badge > 0 && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ delay: reducedMotion ? 0 : 0.1 }}
          >
            <Badge 
              variant="destructive" 
              className="h-5 w-5 text-xs flex items-center justify-center p-0 min-w-[20px]"
              aria-label={`${item.badge} notificaciones nuevas`}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Label */}
      <motion.span 
        className={cn(
          'text-xs font-medium transition-all duration-200 text-center leading-tight',
          isActive ? 'text-primary-600' : 'text-current'
        )}
        animate={reducedMotion ? {} : {
          fontSize: isActive ? '0.75rem' : '0.7rem',
          fontWeight: isActive ? 600 : 500,
          transition: { duration: 0.2 }
        }}
      >
        {item.label}
      </motion.span>

      {/* Active indicator dot */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.1 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Main iOS Bottom Navigation Component
export const IOSBottomNavigation: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { reducedMotion } = useAccessibilityPreferences();
  const { glassClasses, isMobile } = useOptimizedGlass('medium');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get navigation items based on user type
  const navItems = getNavigationItems(user?.user_type || null);

  // Get current active item
  const currentPath = router.asPath;
  const activeItemId = navItems.find(item => {
    if (item.path === '/' && currentPath === '/') return true;
    if (item.path !== '/' && currentPath.startsWith(item.path)) return true;
    return false;
  })?.id || navItems[0]?.id;

  // Handle navigation
  const handleNavigation = useCallback((path: string) => {
    // Add haptic feedback simulation
    if (!reducedMotion && navigator.vibrate) {
      navigator.vibrate(10); // Very short vibration
    }
    
    router.push(path);
  }, [router, reducedMotion]);

  // Auto-hide on scroll (optional)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide if scrolling down significantly
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY]);

  // Hide on larger screens (desktop)
  const shouldShow = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!shouldShow) return null;

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      
      {/* Bottom Navigation */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 md:hidden',
              'ios-bottom-nav safe-area-pb',
              glassClasses,
              isMobile && 'glass-accelerated'
            )}
            role="tablist"
            aria-label="Navegación principal"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 100 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 100 }}
            transition={{ 
              duration: reducedMotion ? 0.2 : 0.3, 
              ease: 'easeOut' 
            }}
          >
            {/* Navigation container */}
            <div className="flex items-center justify-around px-2 pt-2 pb-safe">
              {navItems.map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  isActive={activeItemId === item.id}
                  onClick={handleNavigation}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>

            {/* Home indicator (iOS style) */}
            <div className="flex justify-center pb-1">
              <div className="ios-home-indicator" />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

    </>
  );
};

export default IOSBottomNavigation;