'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Search, Menu, X, User, MessageCircle, Plus, Home } from 'lucide-react';

// 🎨 FIXIA NAVIGATION COMPONENT - "Fluid Discovery"
// Sistema de navegación completo con desktop y mobile

interface FixiaNavigationProps {
  logo?: React.ReactNode;
  tagline?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  user?: {
    name: string;
    avatar?: string;
    isLoggedIn: boolean;
  };
  className?: string;
}

interface FixiaNavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

interface FixiaBottomNavProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
    badge?: number;
    primary?: boolean;
  }>;
  className?: string;
}

const FixiaNavigation = React.forwardRef<HTMLElement, FixiaNavigationProps>(
  ({ 
    logo, 
    tagline = "Conecta. Confía. Resuelve.", 
    searchPlaceholder = "¿Qué servicio necesitas?",
    onSearch,
    user,
    className 
  }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch(searchQuery);
      }
    };

    return (
      <nav ref={ref} className={cn('fixia-nav', className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Brand Section */}
            <div className="fixia-nav-brand">
              {logo ? (
                logo
              ) : (
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-light-400 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">F</span>
                  </div>
                  <div className="hidden sm:block">
                    <div className="fixia-text-gradient-primary font-display font-bold text-xl">
                      FIXIA
                    </div>
                    <div className="fixia-caption text-fixia-text-muted -mt-1">
                      {tagline}
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Search Section - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="fixia-search-box w-full">
                <Search className="fixia-search-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="fixia-search-input"
                />
              </form>
            </div>

            {/* Actions Section - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/services/create"
                className="fixia-nav-link"
              >
                Ofrecer Servicio
              </Link>
              <Link
                href="/search"
                className="fixia-btn fixia-btn-primary fixia-btn-sm"
              >
                Buscar Profesional
              </Link>
              
              {user?.isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-fixia-text-primary">
                    {user.name}
                  </span>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="fixia-nav-link"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="fixia-search-box">
              <Search className="fixia-search-icon w-5 h-5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="fixia-search-input"
              />
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-fixia-border bg-white">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href="/services/create"
                className="block fixia-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Ofrecer Servicio
              </Link>
              <Link
                href="/search"
                className="block fixia-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Buscar Profesional
              </Link>
              {!user?.isLoggedIn && (
                <Link
                  href="/auth/login"
                  className="block fixia-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }
);

const FixiaNavLink = React.forwardRef<HTMLAnchorElement, FixiaNavLinkProps>(
  ({ href, active = false, children, onClick, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'fixia-nav-link',
          active && 'fixia-nav-link-active'
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

const FixiaBottomNavigation = React.forwardRef<HTMLElement, FixiaBottomNavProps>(
  ({ items, className }, ref) => {
    return (
      <nav ref={ref} className={cn('fixia-bottom-nav', className)}>
        <div className="flex items-center justify-around h-16">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'fixia-bottom-nav-item',
                item.active && 'fixia-bottom-nav-item-active',
                item.primary && 'text-secondary-500'
              )}
            >
              <div className="relative">
                {item.primary ? (
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-1 shadow-lg">
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-1">
                      {item.icon}
                    </div>
                    {item.badge && item.badge > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <span className={cn(
                'text-xs',
                item.primary && 'text-secondary-500 font-medium'
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }
);

// Default bottom navigation items
export const defaultBottomNavItems = [
  {
    icon: <Home className="w-5 h-5" />,
    label: 'Inicio',
    href: '/',
    active: true
  },
  {
    icon: <Search className="w-5 h-5" />,
    label: 'Buscar',
    href: '/search'
  },
  {
    icon: <Plus className="w-5 h-5" />,
    label: 'Publicar',
    href: '/services/create',
    primary: true
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    label: 'Mensajes',
    href: '/messages',
    badge: 3
  },
  {
    icon: <User className="w-5 h-5" />,
    label: 'Perfil',
    href: '/profile'
  }
];

FixiaNavigation.displayName = 'FixiaNavigation';
FixiaNavLink.displayName = 'FixiaNavLink';
FixiaBottomNavigation.displayName = 'FixiaBottomNavigation';

export { FixiaNavigation, FixiaNavLink, FixiaBottomNavigation };
export type { FixiaNavigationProps, FixiaNavLinkProps, FixiaBottomNavProps };