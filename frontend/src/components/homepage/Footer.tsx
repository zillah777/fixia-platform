/**
 * Footer Component - Site footer with navigation and contact info
 * @fileoverview Clean, comprehensive footer with all important links
 */
import React from 'react';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon 
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="bg-neutral-900 text-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo size="lg" variant="white" className="mb-4" />
            <p className="text-neutral-300 mb-4 leading-relaxed">
              Fx Fixia - La nueva era de los servicios profesionales. Donde cada conexión es el inicio de algo extraordinario.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-white">Para Exploradores</h4>
            <ul className="space-y-3 text-neutral-300">
              <li>
                <Link 
                  href="/explorador/buscar-servicio" 
                  className="hover:text-white transition-colors"
                >
                  Buscar Servicios
                </Link>
              </li>
              <li>
                <Link 
                  href="/explorador/navegar-profesionales" 
                  className="hover:text-white transition-colors"
                >
                  Explorar Especialistas
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/registro?type=customer" 
                  className="hover:text-white transition-colors"
                >
                  Registro Explorador
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-white">Para Especialistas</h4>
            <ul className="space-y-3 text-neutral-300">
              <li>
                <Link 
                  href="/auth/registro?type=provider" 
                  className="hover:text-white transition-colors"
                >
                  Unirse como Especialista
                </Link>
              </li>
              <li>
                <Link 
                  href="/explorador/cambiar-a-as" 
                  className="hover:text-white transition-colors"
                >
                  Convertirse en AS
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-white">Contacto</h4>
            <div className="space-y-3 text-neutral-300">
              <div className="flex items-center hover:text-white transition-colors cursor-pointer">
                <EnvelopeIcon className="h-5 w-5 mr-3" />
                <span>info@fixia.com.ar</span>
              </div>
              <div className="flex items-center hover:text-white transition-colors cursor-pointer">
                <PhoneIcon className="h-5 w-5 mr-3" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex items-center hover:text-white transition-colors cursor-pointer">
                <MapPinIcon className="h-5 w-5 mr-3" />
                <span>Argentina</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400">
              © 2024 Fx Fixia. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/legal/terms">
                <span className="text-neutral-400 hover:text-white transition-colors">
                  Términos
                </span>
              </Link>
              <Link href="/legal/privacy">
                <span className="text-neutral-400 hover:text-white transition-colors">
                  Privacidad
                </span>
              </Link>
              <Link href="/company/contact">
                <span className="text-neutral-400 hover:text-white transition-colors">
                  Contacto
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;