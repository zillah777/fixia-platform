import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { useAuth } from '@/contexts/AuthContext';

const serviceCategoriesData = [
  { id: 'plomeria', name: 'Plomería', icon: '🔧', description: 'Reparaciones e instalaciones' },
  { id: 'electricidad', name: 'Electricidad', icon: '⚡', description: 'Instalaciones eléctricas' },
  { id: 'limpieza', name: 'Limpieza', icon: '🧹', description: 'Limpieza de hogar y oficinas' },
  { id: 'reparaciones', name: 'Reparaciones', icon: '🔨', description: 'Reparaciones del hogar' },
  { id: 'belleza', name: 'Belleza', icon: '💄', description: 'Servicios de belleza' },
  { id: 'otros', name: 'Otros', icon: '🛠️', description: 'Más servicios disponibles' }
];

const featuredProfessionals = [
  {
    id: 1,
    name: 'Carlos Rodríguez',
    profession: 'Plomero Certificado',
    rating: 4.9,
    reviews: 127,
    image: undefined,
    services: ['Plomería', 'Instalaciones'],
    location: 'Rawson, Chubut'
  },
  {
    id: 2,
    name: 'Ana Martínez',
    profession: 'Electricista',
    rating: 4.8,
    reviews: 89,
    image: undefined,
    services: ['Electricidad', 'Instalaciones'],
    location: 'Trelew, Chubut'
  },
  {
    id: 3,
    name: 'Roberto Silva',
    profession: 'Técnico Reparaciones',
    rating: 4.7,
    reviews: 156,
    image: undefined,
    services: ['Reparaciones', 'Mantenimiento'],
    location: 'Puerto Madryn, Chubut'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'María González',
    rating: 5,
    comment: 'Excelente servicio, muy profesional y resolvió mi problema de plomería rápidamente.',
    service: 'Reparación de Plomería',
    date: '2024-01-15'
  },
  {
    id: 2,
    name: 'Juan López',
    rating: 5,
    comment: 'Encontré al electricista perfecto para mi hogar. Trabajo de calidad y precio justo.',
    service: 'Instalación Eléctrica',
    date: '2024-01-12'
  },
  {
    id: 3,
    name: 'Laura Fernández',
    rating: 4,
    comment: 'Muy buena experiencia usando Fixia. La plataforma es fácil de usar.',
    service: 'Limpieza de Hogar',
    date: '2024-01-10'
  }
];

const LandingPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && user) {
      // Redirect logged-in users to their dashboard
      if (user.user_type === 'provider') {
        router.push('/as/dashboard');
      } else {
        router.push('/explorador/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explorador/buscar-servicio?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Fixia - Marketplace de Servicios en Chubut</title>
        <meta name="description" content="Conecta con profesionales verificados en Chubut. Plomería, electricidad, limpieza y más. Servicios confiables a un clic de distancia." />
        <meta name="keywords" content="servicios, Chubut, plomería, electricidad, limpieza, profesionales, Rawson, Trelew, Puerto Madryn" />
        <meta property="og:title" content="Fixia - Marketplace de Servicios en Chubut" />
        <meta property="og:description" content="Conecta con profesionales verificados en Chubut" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Fixia</h1>
                <span className="ml-2 text-sm text-gray-500">Chubut</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Cómo funciona
                </a>
                <a href="#servicios" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Servicios
                </a>
                <a href="#profesionales" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Profesionales
                </a>
                <a href="#contacto" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contacto
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <button className="text-gray-600 hover:text-gray-900 transition-colors">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/auth/registro">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Registrarse
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Servicios Profesionales
                <span className="block text-blue-600">en Chubut</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Conecta con profesionales verificados para todos tus proyectos del hogar. 
                Desde plomería hasta electricidad, encuentra el experto que necesitas.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <form onSubmit={handleSearch} className="flex">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="¿Qué servicio necesitas? Ej: plomería, electricidad..."
                      className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-4 rounded-r-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Buscar
                  </button>
                </form>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/registro?type=customer">
                  <button className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Buscar Servicios
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <button className="flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium text-lg">
                    <BriefcaseIcon className="h-5 w-5 mr-2" />
                    Ofrecer Servicios
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Profesionales Verificados</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span>Pagos Seguros</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Calificaciones Reales</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section id="servicios" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Servicios Populares
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Encuentra profesionales especializados en las categorías más demandadas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategoriesData.map((category) => (
                <Link key={category.id} href={`/explorador/buscar-servicio?category=${category.id}`}>
                  <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Ver profesionales</span>
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Cómo Funciona Fixia?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tres simples pasos para conectar con el profesional perfecto
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Busca el Servicio
                </h3>
                <p className="text-gray-600">
                  Describe qué necesitas y encuentra profesionales en tu zona con las mejores calificaciones.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Conecta y Negocia
                </h3>
                <p className="text-gray-600">
                  Chatea directamente con el profesional, acuerda detalles, precio y fecha del servicio.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Recibe el Servicio
                </h3>
                <p className="text-gray-600">
                  El profesional realiza el trabajo, pagas de forma segura y calificas la experiencia.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/auth/registro">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg">
                  Comenzar Ahora
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Professionals */}
        <section id="profesionales" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Profesionales Destacados
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Conoce algunos de nuestros profesionales mejor calificados en Chubut
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProfessionals.map((professional) => (
                <div key={professional.id} className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <UserGroupIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                      <p className="text-gray-600 text-sm">{professional.profession}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    {renderStars(Math.round(professional.rating))}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {professional.rating}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({professional.reviews} reseñas)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {professional.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{professional.location}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/explorador/navegar-profesionales">
                <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors font-medium">
                  Ver Todos los Profesionales
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Lo Que Dicen Nuestros Usuarios
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Testimonios reales de clientes satisfechos en toda la provincia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-blue-200">Profesionales</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">2,000+</div>
                <div className="text-blue-200">Servicios Completados</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">4.8</div>
                <div className="text-blue-200">Calificación Promedio</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">15</div>
                <div className="text-blue-200">Ciudades Cubiertas</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Listo para Comenzar?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Únete a miles de usuarios que ya confían en Fixia para sus proyectos del hogar
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/registro?type=customer">
                <button className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg">
                  Necesito un Servicio
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              </Link>
              <Link href="/auth/registro?type=provider">
                <button className="flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium text-lg">
                  Soy un Profesional
                  <BriefcaseIcon className="h-5 w-5 ml-2" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contacto" className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Fixia</h3>
                <p className="text-gray-300 mb-4">
                  Conectando profesionales con clientes en toda la provincia de Chubut.
                </p>
                <div className="flex space-x-4">
                  <span className="text-gray-400">Síguenos:</span>
                  {/* Social icons could go here */}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Para Clientes</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/explorador/buscar-servicio">Buscar Servicios</Link></li>
                  <li><Link href="/explorador/navegar-profesionales">Ver Profesionales</Link></li>
                  <li><Link href="/auth/registro?type=customer">Registro Cliente</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Para Profesionales</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/auth/registro?type=provider">Registro Profesional</Link></li>
                  <li><Link href="/explorador/cambiar-a-as">Convertirse en AS</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Contacto</h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span>info@fixia.com.ar</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    <span>+54 280 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>Rawson, Chubut</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400">
                  © 2024 Fixia. Todos los derechos reservados.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <Link href="/legal/terms">
                    <span className="text-gray-400 hover:text-white transition-colors">
                      Términos
                    </span>
                  </Link>
                  <Link href="/legal/privacy">
                    <span className="text-gray-400 hover:text-white transition-colors">
                      Privacidad
                    </span>
                  </Link>
                  <Link href="/company/contact">
                    <span className="text-gray-400 hover:text-white transition-colors">
                      Contacto
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;