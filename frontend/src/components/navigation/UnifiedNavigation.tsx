/**
 * Unified Navigation Component - Enterprise Grade
 * Eliminates all navigation fragmentation across the platform
 * Consolidates 4 different navigation systems into one unified solution
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Briefcase,
  Images,
  Crown,
  Shield,
  MessageSquare,
  RefreshCw,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { FixiaAvatar } from "../ui/fixia-avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SimpleTooltip } from "../OnboardingHelper";

import { useAuth } from "@/contexts/AuthContext";
import { useUnifiedNavigation, useDropdownNavigation } from "@/hooks/useUnifiedNavigation";

// User type constants for consistency
type UserType = 'customer' | 'provider';
type NavigationVariant = 'desktop' | 'mobile' | 'tablet';

// Icon mapping for navigation items
const ICON_MAP = {
  Home,
  Search,
  Briefcase,
  Images,
  Crown,
  User,
  Shield,
  MessageSquare,
  Bell,
  LogOut,
};

interface UnifiedNavigationProps {
  /**
   * Navigation variant for responsive design
   */
  variant?: NavigationVariant;
  /**
   * Show search functionality
   */
  showSearch?: boolean;
  /**
   * Show notifications
   */
  showNotifications?: boolean;
  /**
   * Enable user type switching
   */
  enableUserTypeSwitching?: boolean;
  /**
   * Custom CSS classes
   */
  className?: string;
  /**
   * Custom logo component
   */
  logoComponent?: React.ReactNode;
}

export function UnifiedNavigation({ 
  variant = 'desktop', 
  showSearch = true, 
  showNotifications = true,
  enableUserTypeSwitching = true,
  className = '',
  logoComponent
}: UnifiedNavigationProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigation = useUnifiedNavigation();
  const dropdownNav = useDropdownNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserTypeSwitching, setIsUserTypeSwitching] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/auth/login');
  }, [logout, router]);

  const handleUserTypeSwitch = useCallback(async (newUserType: UserType) => {
    if (!enableUserTypeSwitching || isUserTypeSwitching) return;
    
    setIsUserTypeSwitching(true);
    try {
      const targetPath = newUserType === 'provider' 
        ? '/explorador/cambiar-a-as' 
        : '/as/cambiar-a-explorador';
      
      await router.push(targetPath);
    } catch (error) {
      console.error('Error switching user type:', error);
    } finally {
      setIsUserTypeSwitching(false);
    }
  }, [enableUserTypeSwitching, isUserTypeSwitching, router]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim() && navigation.userType === 'customer') {
      router.push(`/explorador/marketplace?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getInitials = () => {
    const firstName = user?.first_name || '';
    const lastName = user?.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';
  };

  // Render navigation item with proper icon
  const renderNavItem = (item: any, isMobile = false) => {
    const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];
    
    return (
      <Link key={item.key} href={item.path}>
        <SimpleTooltip content={item.description}>
          <Button 
            className={`${isMobile ? 'w-full justify-start' : ''} ${
              item.isActive ? 'glass-strong' : 'hover:glass-medium'
            } transition-all duration-300`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
            {item.label}
            {item.badge && (
              <Badge className="ml-auto bg-primary/20 text-primary text-xs border-0 animate-pulse">
                {item.badge}
              </Badge>
            )}
          </Button>
        </SimpleTooltip>
      </Link>
    );
  };


  // Early return for unauthenticated users
  if (!user || !navigation.userType) {
    return null;
  }

  const currentUserType = navigation.userType;
  const alternativeUserType = currentUserType === 'provider' ? 'customer' : 'provider';
  const alternativeLabel = alternativeUserType === 'provider' ? 'AS' : 'Explorador';

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 w-full ${navigation.navClasses} border-b border-white/10 ${className}`}
    >
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
        {/* Logo and Primary Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          {logoComponent || (
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href={navigation.paths.dashboard} className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <motion.div
                      className="text-white font-bold text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      F
                    </motion.div>
                  </div>
                  <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-semibold tracking-tight">Fixia</span>
                  <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
                </div>
              </Link>
            </motion.div>
          )}
          
          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Dashboard Link */}
            <Link href={navigation.paths.dashboard}>
              <SimpleTooltip content="Tu panel principal">
                <Button className={`${
                  navigation.isItemActive(navigation.paths.dashboard) ? 'glass-medium' : 'hover:glass-medium'
                } transition-all duration-300`}>
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </Button>
              </SimpleTooltip>
            </Link>

            {/* Primary Navigation Items */}
            {navigation.primaryItems
              .filter(item => item.key !== 'dashboard')
              .map(item => renderNavItem(item))
            }

            {/* Common Items */}
            {navigation.commonItems.map(item => renderNavItem(item))}
            
            {/* User Type Switch Button */}
            {enableUserTypeSwitching && (
              <SimpleTooltip content={`Cambiar a ${alternativeLabel}`}>
                <Button
                  onClick={() => handleUserTypeSwitch(alternativeUserType)}
                  disabled={isUserTypeSwitching}
                  className="hover:glass-medium transition-all duration-300 relative"
                >
                  {isUserTypeSwitching ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <User className="mr-2 h-4 w-4" />
                  )}
                  {alternativeLabel}
                  <Badge className="ml-2 bg-secondary/20 text-secondary text-xs border-0">
                    {currentUserType === 'provider' ? 'Cliente' : 'Profesional'}
                  </Badge>
                </Button>
              </SimpleTooltip>
            )}
          </nav>
        </div>

        {/* Search, Actions, and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={navigation.getSearchPlaceholder()}
                className="w-64 xl:w-80 pl-12 glass border-white/20 focus:border-primary/50 focus:ring-primary/30 transition-all duration-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    handleSearch(searchTerm);
                  }
                }}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {showNotifications && (
              <Button className="relative hover:glass-medium transition-all duration-300 h-9 w-9 sm:h-10 sm:w-10">
                <Bell className="h-4 w-4" />
                {/* Badge will only show when there are real notifications */}
              </Button>
            )}
          </div>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:glass-medium transition-all duration-300">
                <FixiaAvatar
                  {...(user?.profile_image && { src: `/api/image-proxy?url=${encodeURIComponent(user.profile_image)}` })}
                  alt="Usuario"
                  fallbackText={getInitials()}
                  size="md"
                  variant={navigation.userType === 'provider' ? 'professional' : 'client'}
                  priority={true}
                  className="h-9 w-9 sm:h-10 sm:w-10"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 glass border-white/20" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <FixiaAvatar
                      {...(user?.profile_image && { src: `/api/image-proxy?url=${encodeURIComponent(user.profile_image)}` })}
                      alt="Usuario"
                      fallbackText={getInitials()}
                      size="lg"
                      variant={navigation.userType === 'provider' ? 'professional' : 'client'}
                      priority={true}
                    />
                    <div>
                      <p className="font-medium">{dropdownNav.userInfo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {navigation.getUserTypeLabel()}
                      </p>
                      {navigation.userType === 'provider' && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="flex text-yellow-400">★★★★★</div>
                          <span className="text-xs text-muted-foreground">4.9</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              
              {/* Dropdown Navigation Items */}
              {dropdownNav.dropdownItems.map((item) => {
                const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];
                return (
                  <Link key={item.key} href={item.path}>
                    <DropdownMenuItem className="hover:glass-medium">
                      {IconComponent && <IconComponent className="mr-3 h-4 w-4" />}
                      {item.label}
                      {item.badge && (
                        <Badge className="ml-auto bg-primary/20 text-primary text-xs border-0">
                          {item.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  </Link>
                );
              })}
              
              {/* User Type Switch in Dropdown */}
              {enableUserTypeSwitching && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="hover:glass-medium"
                    onClick={() => handleUserTypeSwitch(alternativeUserType)}
                    disabled={isUserTypeSwitching}
                  >
                    {isUserTypeSwitching ? (
                      <RefreshCw className="mr-3 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-3 h-4 w-4" />
                    )}
                    Cambiar a {alternativeLabel}
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="hover:glass-medium text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden hover:glass-medium h-9 w-9 sm:h-10 sm:w-10"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/10"
          >
            <div className="container mx-auto px-4 sm:px-6 py-4">
              {/* Mobile Search */}
              {showSearch && (
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={navigation.getSearchPlaceholder()}
                    className="pl-12 glass border-white/20 focus:border-primary/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const searchTerm = (e.target as HTMLInputElement).value;
                        if (searchTerm.trim()) {
                          setIsMobileMenuOpen(false);
                          handleSearch(searchTerm);
                        }
                      }
                    }}
                  />
                </div>
              )}

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {/* Dashboard */}
                <Link href={navigation.paths.dashboard}>
                  <Button 
                    className="w-full justify-start glass-medium hover:glass-strong transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="mr-3 h-4 w-4" />
                    Inicio
                  </Button>
                </Link>

                {/* Primary Items */}
                {navigation.primaryItems
                  .filter(item => item.key !== 'dashboard')
                  .map(item => renderNavItem(item, true))
                }

                {/* Common Items */}
                {navigation.commonItems.map(item => renderNavItem(item, true))}
                
                {/* User Type Switch in Mobile */}
                {enableUserTypeSwitching && (
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleUserTypeSwitch(alternativeUserType);
                    }}
                    disabled={isUserTypeSwitching}
                    className="w-full justify-start hover:glass-medium transition-all duration-300"
                  >
                    {isUserTypeSwitching ? (
                      <RefreshCw className="mr-3 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-3 h-4 w-4" />
                    )}
                    Cambiar a {alternativeLabel}
                    <Badge className="ml-auto bg-secondary/20 text-secondary text-xs border-0">
                      {currentUserType === 'provider' ? 'Cliente' : 'Profesional'}
                    </Badge>
                  </Button>
                )}

                {/* Separator */}
                <div className="border-t border-white/10 my-4"></div>

                {/* Profile Section */}
                <Link href={navigation.paths.profile}>
                  <Button 
                    className="w-full justify-start hover:glass-medium transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Mi Perfil
                  </Button>
                </Link>

                <Link href={navigation.paths.settings}>
                  <Button 
                    className="w-full justify-start hover:glass-medium transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    Configuración
                  </Button>
                </Link>

                {/* Logout */}
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full justify-start hover:glass-medium text-destructive focus:text-destructive transition-all duration-300"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>

              {/* User Info Card */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-3 glass-light rounded-lg p-3">
                  <FixiaAvatar
                    {...(user?.profile_image && { src: `/api/image-proxy?url=${encodeURIComponent(user.profile_image)}` })}
                    alt="Usuario"
                    fallbackText={getInitials()}
                    size="md"
                    variant={navigation.userType === 'provider' ? 'professional' : 'client'}
                    priority={true}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{dropdownNav.userInfo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {navigation.getUserTypeLabel()}
                    </p>
                    {navigation.userType === 'provider' && (
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex text-yellow-400 text-xs">★★★★★</div>
                        <span className="text-xs text-muted-foreground">4.9</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default UnifiedNavigation;