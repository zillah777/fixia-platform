import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  HeartIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

interface CorporateFooterProps {
  variant?: 'default' | 'minimal' | 'extended';
  className?: string;
}

const CorporateFooter: React.FC<CorporateFooterProps> = ({
  variant = 'default',
  className = ''
}) => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Buscar Servicios', href: '/explorador/buscar-servicio', icon: MapPinIcon },
    { name: 'Convertirse en AS', href: '/explorador/cambiar-a-as', icon: BuildingOfficeIcon },
    { name: 'Sobre Nosotros', href: '/company/about', icon: UserGroupIcon },
    { name: 'Contacto', href: '/company/contact', icon: EnvelopeIcon },
  ];

  const legalLinks = [
    { name: 'Términos de Servicio', href: '/legal/terms' },
    { name: 'Política de Privacidad', href: '/legal/privacy' },
    { name: 'Términos Actualizados', href: '/legal/updated-terms' },
    { name: 'Seguridad', href: '/company/security' },
  ];

  const contactInfo = [
    { 
      label: 'Chubut, Argentina', 
      icon: MapPinIcon,
      href: '#',
      description: 'Servicio en toda la provincia'
    },
    { 
      label: 'contacto@fixia.com.ar', 
      icon: EnvelopeIcon,
      href: 'mailto:contacto@fixia.com.ar',
      description: 'Soporte 24/7'
    },
    { 
      label: 'fixia.com.ar', 
      icon: GlobeAltIcon,
      href: 'https://fixia.com.ar',
      description: 'Plataforma oficial'
    },
  ];

  if (variant === 'minimal') {
    return (
      <footer className={`bg-white/80 backdrop-blur-xl border-t border-secondary-200/50 ${className}`}>
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Logo size="sm" showText={false} />
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-secondary-800">Sistema Profesional Certificado</p>
                <p className="text-xs text-secondary-600">© {currentYear} Fixia. Todos los derechos reservados.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-success-600" />
              <span className="text-xs text-secondary-600 font-semibold">Verificación garantizada</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-gradient-to-br from-secondary-900 via-primary-900 to-secondary-900 text-white ${className}`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Logo size="lg" variant="white" showText={true} />
            </div>
            <p className="text-secondary-300 text-sm leading-relaxed mb-6 max-w-md">
              La plataforma líder de servicios profesionales en Chubut. Conectamos exploradores con AS certificados 
              para proyectos de calidad garantizada.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-success-400" />
                <span className="text-sm font-semibold text-success-300">AS Verificados</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5 text-primary-400" />
                <span className="text-sm font-semibold text-primary-300">Calidad Premium</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Accesos Rápidos</h3>
            <nav className="space-y-3">
              {quickLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <div className="flex items-center space-x-3 text-secondary-300 hover:text-white transition-colors group">
                    <link.icon className="h-4 w-4 group-hover:text-primary-400 transition-colors" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contacto</h3>
            <div className="space-y-4">
              {contactInfo.map((contact) => (
                <div key={contact.label} className="flex items-start space-x-3">
                  <contact.icon className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <Link href={contact.href} className="text-sm font-medium text-white hover:text-primary-300 transition-colors">
                      {contact.label}
                    </Link>
                    <p className="text-xs text-secondary-400 mt-1">{contact.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-800/50 bg-secondary-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-sm text-secondary-400">
                © {currentYear} Fixia. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-1 text-secondary-500">
                <span className="text-xs">Hecho con</span>
                <HeartIcon className="h-3 w-3 text-error-400" />
                <span className="text-xs">en Chubut</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              {legalLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <span className="text-secondary-400 hover:text-white transition-colors">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CorporateFooter;