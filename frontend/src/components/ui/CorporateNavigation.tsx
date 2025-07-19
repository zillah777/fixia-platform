import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BriefcaseIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon, 
  MapPinIcon, 
  BuildingOfficeIcon, 
  ArrowRightOnRectangleIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import { CorporateButton } from './index';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  current?: boolean;
  badge?: number;
  description?: string;
}

interface CorporateNavigationProps {
  userType?: 'customer' | 'professional' | 'admin';
  user?: any;
  onLogout?: () => void;
  className?: string;
}

const CorporateNavigation: React.FC<CorporateNavigationProps> = ({
  userType = 'customer',
  user,
  onLogout,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const getNavigationItems = (): NavigationItem[] => {
    const basePath = userType === 'customer' ? '/explorador' : '/as';
    
    if (userType === 'customer') {
      return [
        { 
          name: 'Dashboard', 
          href: `${basePath}/dashboard`, 
          icon: HomeIcon, 
          current: router.pathname === `${basePath}/dashboard`,
          description: 'Panel principal'
        },
        { 
          name: 'Buscar Servicios', 
          href: `${basePath}/buscar-servicio`, 
          icon: MagnifyingGlassIcon, 
          current: router.pathname === `${basePath}/buscar-servicio`,
          description: 'Encontrar AS profesionales'
        },
        { 
          name: 'Mis Solicitudes', 
          href: `${basePath}/mis-solicitudes`, 
          icon: BriefcaseIcon, 
          current: router.pathname === `${basePath}/mis-solicitudes`,
          description: 'Gestionar proyectos'
        },
        { 
          name: 'Mensajes', 
          href: `${basePath}/chats`, 
          icon: ChatBubbleLeftRightIcon, 
          current: router.pathname.startsWith(`${basePath}/chat`),
          badge: 3,
          description: 'Comunicación directa'
        },
        { 
          name: 'Calificaciones', 
          href: `${basePath}/calificaciones`, 
          icon: StarIcon, 
          current: router.pathname === `${basePath}/calificaciones`,
          description: 'Evaluar servicios'
        },
        { 
          name: 'Profesionales', 
          href: `${basePath}/navegar-profesionales`, 
          icon: MapPinIcon, 
          current: router.pathname === `${basePath}/navegar-profesionales`,
          description: 'Explorar AS cercanos'
        },
      ];
    } else {
      return [
        { 
          name: 'Dashboard', 
          href: `${basePath}/dashboard`, 
          icon: HomeIcon, 
          current: router.pathname === `${basePath}/dashboard`,
          description: 'Panel AS'
        },
        { 
          name: 'Mis Servicios', 
          href: `${basePath}/servicios`, 
          icon: BriefcaseIcon, 
          current: router.pathname === `${basePath}/servicios`,
          description: 'Gestionar ofertas'
        },
        { 
          name: 'Solicitudes', 
          href: `${basePath}/solicitudes`, 
          icon: MagnifyingGlassIcon, 
          current: router.pathname === `${basePath}/solicitudes`,
          description: 'Nuevas oportunidades'
        },
        { 
          name: 'Mensajes', 
          href: `${basePath}/chats`, 
          icon: ChatBubbleLeftRightIcon, 
          current: router.pathname.startsWith(`${basePath}/chat`),
          badge: 5,
          description: 'Chat con clientes'
        },
        { 
          name: 'Mi Perfil', 
          href: `${basePath}/perfil`, 
          icon: UserIcon, 
          current: router.pathname === `${basePath}/perfil`,
          description: 'Perfil profesional'
        },
        { 
          name: 'Calificaciones', 
          href: `${basePath}/calificaciones`, 
          icon: StarIcon, 
          current: router.pathname === `${basePath}/calificaciones`,
          description: 'Reputación AS'
        },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className={className}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="sidebar-mobile:block sidebar-desktop:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-secondary-200/50 text-secondary-600 hover:text-primary-600 transition-all"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sidebar-desktop:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 xs:w-80 bg-white/95 backdrop-blur-3xl shadow-2xl border-r border-secondary-200/30 transform transition-transform duration-500 ease-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } sidebar-desktop:translate-x-0 sidebar-desktop:static sidebar-desktop:inset-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-secondary-200/50 bg-gradient-to-r from-primary-50 to-trust-50">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Logo size="md" showText={true} />
            </div>
          </Link>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-desktop:hidden p-2 rounded-xl text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-all"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 bg-gradient-to-r from-primary-50/50 to-trust-50/50 border-b border-secondary-200/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-secondary-900">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <ShieldCheckIcon className="h-3 w-3 text-success-600" />
                  <span className="text-xs text-secondary-600 font-semibold">
                    {userType === 'customer' ? 'Explorador Certificado' : 'AS Profesional'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <div
                  className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                    item.current
                      ? 'bg-gradient-to-r from-primary-500 to-trust-500 text-white shadow-lg'
                      : 'text-secondary-700 hover:bg-primary-50 hover:text-primary-700 hover:shadow-sm'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <span>{item.name}</span>
                    {item.description && (
                      <p className={`text-xs mt-0.5 ${item.current ? 'text-white/80' : 'text-secondary-500'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.badge && (
                    <span className="ml-auto bg-error-100 text-error-800 text-xs px-2 py-1 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-secondary-200/50 space-y-4">
          {userType === 'customer' && (
            <Link href="/explorador/cambiar-a-as">
              <div className="bg-gradient-to-r from-accent-500 to-success-500 rounded-xl p-4 text-white cursor-pointer hover:from-accent-600 hover:to-success-600 transition-all shadow-lg">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <div>
                    <h4 className="font-bold text-sm">¿Querés ofrecer servicios?</h4>
                    <p className="text-xs text-white/90 mt-1">Convertite en AS certificado</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {onLogout && (
            <CorporateButton
              onClick={onLogout}
              variant="ghost"
              size="md"
              className="w-full justify-start text-error-600 hover:text-error-700 hover:bg-error-50"
              leftIcon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
            >
              Cerrar Sesión
            </CorporateButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateNavigation;