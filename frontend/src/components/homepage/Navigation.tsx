/**
 * Navigation Component - Clean, responsive navigation
 * @fileoverview Header navigation with mobile menu support
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface NavigationProps {
  fixed?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ fixed = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: '#como-funciona', label: 'Cómo funciona' },
    { href: '#servicios', label: 'Servicios' },
    { href: '#profesionales', label: 'Especialistas' },
    { href: '#contacto', label: 'Contacto' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(href.substring(1));
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`${fixed ? 'fixed' : 'relative'} top-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 z-50 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" variant="primary" />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a 
                key={item.href}
                href={item.href}
                className="text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle size="sm" />
            
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <nav className="space-y-4">
              {navigationItems.map((item) => (
                <a 
                  key={item.href}
                  href={item.href}
                  className="block text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 font-medium py-2"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <Link href="/auth/login">
                <Button variant="ghost" fullWidth onClick={() => setMobileMenuOpen(false)}>
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/registro">
                <Button variant="primary" fullWidth onClick={() => setMobileMenuOpen(false)}>
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;