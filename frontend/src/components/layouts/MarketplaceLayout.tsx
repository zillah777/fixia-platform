import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { cn } from '@/utils/helpers';

interface MarketplaceLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({
  children,
  title = 'Fixia - Marketplace de Servicios',
  description = 'Conectamos a los mejores profesionales con clientes que buscan calidad excepcional.',
  showHeader = true,
  showFooter = true,
  showSidebar = false,
  className = '',
  maxWidth = '7xl',
}) => {
  const { user, logout } = useAuth();
  const { actualTheme } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const navigationItems = user
    ? user.user_type === 'provider'
      ? [
          { name: 'Dashboard', href: '/as/dashboard', icon: HomeIcon },
          { name: 'Servicios', href: '/as/servicios', icon: Cog6ToothIcon },
          { name: 'Chats', href: '/as/chats', icon: ChatBubbleLeftRightIcon },
          { name: 'Perfil', href: '/as/perfil', icon: UserCircleIcon },
        ]
      : [
          { name: 'Dashboard', href: '/explorador/dashboard', icon: HomeIcon },
          { name: 'Buscar', href: '/explorador/buscar-servicio', icon: Cog6ToothIcon },
          { name: 'Chats', href: '/explorador/chats', icon: ChatBubbleLeftRightIcon },
          { name: 'Perfil', href: '/explorador/perfil', icon: UserCircleIcon },
        ]
    : [];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content={actualTheme === 'dark' ? '#171717' : '#ffffff'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-surface-50 dark:bg-neutral-950 transition-colors duration-200">
        {/* Header */}
        {showHeader && (
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
            <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth])}>
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href={user ? (user.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard') : '/'}>
                  <Logo size="md" variant="primary" animated />
                </Link>

                {/* Desktop Navigation */}
                {user && (
                  <nav className="hidden md:flex items-center space-x-6">
                    {navigationItems.map((item) => {
                      const isActive = router.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                              : 'text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  {/* Theme Toggle */}
                  <ThemeToggle size="sm" />

                  {/* Notifications (only for logged in users) */}
                  {user && (
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
                      <BellIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full" />
                    </button>
                  )}

                  {/* Auth Actions */}
                  {user ? (
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        leftIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                        className="hidden md:flex"
                      >
                        Salir
                      </Button>
                      
                      {/* Mobile menu button */}
                      <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {sidebarOpen ? (
                          <XMarkIcon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                        ) : (
                          <Bars3Icon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="hidden md:flex items-center space-x-3">
                      <Link href="/auth/login">
                        <Button variant="ghost" size="sm">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/auth/registro">
                        <Button variant="primary" size="sm">
                          Registrarse
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {user && sidebarOpen && (
              <div className="md:hidden bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
                <div className="px-4 py-6 space-y-4">
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const isActive = router.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                            isActive
                              ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                              : 'text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                  
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      leftIcon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
                      fullWidth
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <main className={cn('flex-1', className)}>
          <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth])}>
            {children}
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-neutral-900 dark:bg-neutral-950 text-white">
            <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 py-12', maxWidthClasses[maxWidth])}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="space-y-4">
                  <Logo size="lg" variant="white" />
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    El marketplace que conecta a los mejores profesionales con clientes que buscan calidad excepcional.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h4 className="font-semibold mb-4">Para Clientes</h4>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li><Link href="/explorador/buscar-servicio" className="hover:text-white transition-colors">Buscar Servicios</Link></li>
                    <li><Link href="/explorador/navegar-profesionales" className="hover:text-white transition-colors">Explorar Profesionales</Link></li>
                    <li><Link href="/auth/registro?type=customer" className="hover:text-white transition-colors">Registro Cliente</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Para Profesionales</h4>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li><Link href="/auth/registro?type=provider" className="hover:text-white transition-colors">Unirse como AS</Link></li>
                    <li><Link href="/as/servicios" className="hover:text-white transition-colors">Gestión de Servicios</Link></li>
                    <li><Link href="/as/dashboard" className="hover:text-white transition-colors">Dashboard AS</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Soporte</h4>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li><Link href="/company/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                    <li><Link href="/legal/terms" className="hover:text-white transition-colors">Términos</Link></li>
                    <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-neutral-400 text-sm">
                  © 2024 Fixia. Todos los derechos reservados.
                </p>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <span className="text-neutral-500 text-sm">Hecho con ❤️ en Argentina</span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
};

export default MarketplaceLayout;