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

      <div className="min-h-screen">
        {/* Modern Header */}
        <header className="nav">
          <div className="container">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <h1 className="text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
                  Fixia
                </h1>
                <span className="ml-3 text-sm text-secondary-600 font-medium">Chubut</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <a href="#como-funciona" className="nav-link">
                  Cómo funciona
                </a>
                <a href="#servicios" className="nav-link">
                  Servicios
                </a>
                <a href="#profesionales" className="nav-link">
                  Profesionales
                </a>
                <a href="#contacto" className="nav-link">
                  Contacto
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <button className="btn btn-ghost">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/auth/registro">
                  <button className="btn btn-primary">
                    Registrarse
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="text-center fade-in-on-scroll">
              <h1 className="hero-title animate-fade-in">
                Servicios Profesionales en Chubut
              </h1>
              <p className="hero-subtitle animate-slide-up stagger-1">
                Conecta con profesionales verificados para todos tus proyectos del hogar. 
                Desde plomería hasta electricidad, encuentra el experto que necesitas.
              </p>

              {/* Modern Search Bar */}
              <div className="max-w-2xl mx-auto mb-8 animate-scale-in stagger-2">
                <form onSubmit={handleSearch} className="input-group">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="¿Qué servicio necesitas? Ej: plomería, electricidad..."
                      className="form-input pl-12 pr-4 py-4 text-lg border-0 glass"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-8"
                  >
                    Buscar
                  </button>
                </form>
              </div>

              {/* CTA Buttons */}
              <div className="hero-cta animate-slide-up stagger-3">
                <Link href="/auth/registro?type=customer">
                  <button className="btn btn-primary btn-lg hover-lift">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Buscar Servicios
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <button className="btn btn-secondary btn-lg hover-lift">
                    <BriefcaseIcon className="h-5 w-5 mr-2" />
                    Ofrecer Servicios
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-16 flex flex-wrap justify-center items-center gap-8 animate-fade-in stagger-4">
                <div className="flex items-center text-text-inverse opacity-90 hover:opacity-100 transition-opacity">
                  <CheckCircleIcon className="h-6 w-6 text-success-400 mr-3" />
                  <span className="font-medium">Profesionales Verificados</span>
                </div>
                <div className="flex items-center text-text-inverse opacity-90 hover:opacity-100 transition-opacity">
                  <ShieldCheckIcon className="h-6 w-6 text-primary-400 mr-3" />
                  <span className="font-medium">Pagos Seguros</span>
                </div>
                <div className="flex items-center text-text-inverse opacity-90 hover:opacity-100 transition-opacity">
                  <StarIcon className="h-6 w-6 text-warning-400 mr-3" />
                  <span className="font-medium">Calificaciones Reales</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section id="servicios" className="py-24 bg-white relative">
          <div className="container">
            <div className="text-center mb-16 slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Servicios Populares
              </h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Encuentra profesionales especializados en las categorías más demandadas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategoriesData.map((category, index) => (
                <Link key={category.id} href={`/explorador/buscar-servicio?category=${category.id}`}>
                  <div className={`card hover-lift cursor-pointer scale-in-on-scroll stagger-${index + 1}`}>
                    <div className="feature-icon text-4xl mb-4 mx-auto animate-float">
                      {category.icon}
                    </div>
                    <h3 className="card-title text-center">
                      {category.name}
                    </h3>
                    <p className="text-secondary text-center mb-4">{category.description}</p>
                    <div className="flex items-center justify-center text-primary-600 font-medium hover:text-primary-700 transition-colors">
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
        <section id="como-funciona" className="py-24 bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
          <div className="container relative">
            <div className="text-center mb-16 slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                ¿Cómo Funciona Fixia?
              </h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Tres simples pasos para conectar con el profesional perfecto
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center scale-in-on-scroll stagger-1">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow animate-pulse">
                  <MagnifyingGlassIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Busca el Servicio
                </h3>
                <p className="text-secondary">
                  Describe qué necesitas y encuentra profesionales en tu zona con las mejores calificaciones.
                </p>
              </div>

              <div className="text-center scale-in-on-scroll stagger-2">
                <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow animate-pulse">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Conecta y Negocia
                </h3>
                <p className="text-secondary">
                  Chatea directamente con el profesional, acuerda detalles, precio y fecha del servicio.
                </p>
              </div>

              <div className="text-center scale-in-on-scroll stagger-3">
                <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow animate-pulse">
                  <CheckCircleIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Recibe el Servicio
                </h3>
                <p className="text-secondary">
                  El profesional realiza el trabajo, pagas de forma segura y calificas la experiencia.
                </p>
              </div>
            </div>

            <div className="text-center mt-12 fade-in-on-scroll">
              <Link href="/auth/registro">
                <button className="btn btn-primary btn-xl hover-lift animate-glow">
                  Comenzar Ahora
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Professionals */}
        <section id="profesionales" className="py-24 bg-white">
          <div className="container">
            <div className="text-center mb-16 slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Profesionales Destacados
              </h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Conoce algunos de nuestros profesionales mejor calificados en Chubut
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProfessionals.map((professional, index) => (
                <div key={professional.id} className={`card hover-lift scale-in-on-scroll stagger-${index + 1}`}>
                  <div className="card-header">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <UserGroupIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="card-title">{professional.name}</h3>
                        <p className="card-subtitle">{professional.profession}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="flex items-center mb-4">
                      {renderStars(Math.round(professional.rating))}
                      <span className="ml-2 text-sm font-medium text-primary">
                        {professional.rating}
                      </span>
                      <span className="ml-1 text-sm text-tertiary">
                        ({professional.reviews} reseñas)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {professional.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-800 text-xs rounded-full font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center text-sm text-tertiary">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{professional.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 fade-in-on-scroll">
              <Link href="/explorador/navegar-profesionales">
                <button className="btn btn-outline btn-lg hover-lift">
                  Ver Todos los Profesionales
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gradient-to-br from-secondary-50 to-primary-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
          <div className="container relative">
            <div className="text-center mb-16 slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Lo Que Dicen Nuestros Usuarios
              </h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Testimonios reales de clientes satisfechos en toda la provincia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className={`card glass hover-lift scale-in-on-scroll stagger-${index + 1}`}>
                  <div className="card-header">
                    <div className="flex items-center justify-center">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="text-primary font-medium mb-4 italic text-center">
                      "{testimonial.comment}"
                    </p>
                  </div>
                  <div className="card-footer">
                    <div className="text-center w-full">
                      <p className="font-semibold text-primary">{testimonial.name}</p>
                      <p className="text-sm text-tertiary">{testimonial.service}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="scale-in-on-scroll stagger-1">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse">500+</div>
                <div className="text-primary-200 font-medium">Profesionales</div>
              </div>
              <div className="scale-in-on-scroll stagger-2">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse">2,000+</div>
                <div className="text-primary-200 font-medium">Servicios Completados</div>
              </div>
              <div className="scale-in-on-scroll stagger-3">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse">4.8</div>
                <div className="text-primary-200 font-medium">Calificación Promedio</div>
              </div>
              <div className="scale-in-on-scroll stagger-4">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse">15</div>
                <div className="text-primary-200 font-medium">Ciudades Cubiertas</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container-md text-center">
            <div className="slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                ¿Listo para Comenzar?
              </h2>
              <p className="text-xl text-secondary mb-8">
                Únete a miles de usuarios que ya confían en Fixia para sus proyectos del hogar
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/registro?type=customer">
                  <button className="btn btn-primary btn-lg hover-lift animate-glow">
                    Necesito un Servicio
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <button className="btn btn-outline btn-lg hover-lift">
                    Soy un Profesional
                    <BriefcaseIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contacto" className="bg-dark text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-secondary-900/20"></div>
          <div className="container relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="fade-in-on-scroll">
                <h3 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                  Fixia
                </h3>
                <p className="text-neutral-300 mb-4 leading-relaxed">
                  Conectando profesionales con clientes en toda la provincia de Chubut.
                </p>
                <div className="flex space-x-4">
                  <span className="text-neutral-400 font-medium">Síguenos:</span>
                  {/* Social icons could go here */}
                </div>
              </div>

              <div className="fade-in-on-scroll stagger-1">
                <h4 className="font-semibold mb-4 text-lg">Para Clientes</h4>
                <ul className="space-y-3 text-neutral-300">
                  <li>
                    <Link href="/explorador/buscar-servicio" className="hover:text-primary-400 transition-colors">
                      Buscar Servicios
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/navegar-profesionales" className="hover:text-primary-400 transition-colors">
                      Ver Profesionales
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/registro?type=customer" className="hover:text-primary-400 transition-colors">
                      Registro Cliente
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="fade-in-on-scroll stagger-2">
                <h4 className="font-semibold mb-4 text-lg">Para Profesionales</h4>
                <ul className="space-y-3 text-neutral-300">
                  <li>
                    <Link href="/auth/registro?type=provider" className="hover:text-primary-400 transition-colors">
                      Registro Profesional
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/cambiar-a-as" className="hover:text-primary-400 transition-colors">
                      Convertirse en AS
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="fade-in-on-scroll stagger-3">
                <h4 className="font-semibold mb-4 text-lg">Contacto</h4>
                <div className="space-y-3 text-neutral-300">
                  <div className="flex items-center hover:text-primary-400 transition-colors">
                    <EnvelopeIcon className="h-5 w-5 mr-3" />
                    <span>info@fixia.com.ar</span>
                  </div>
                  <div className="flex items-center hover:text-primary-400 transition-colors">
                    <PhoneIcon className="h-5 w-5 mr-3" />
                    <span>+54 280 123-4567</span>
                  </div>
                  <div className="flex items-center hover:text-primary-400 transition-colors">
                    <MapPinIcon className="h-5 w-5 mr-3" />
                    <span>Rawson, Chubut</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-800 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-neutral-400">
                  © 2024 Fixia. Todos los derechos reservados.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <Link href="/legal/terms">
                    <span className="text-neutral-400 hover:text-primary-400 transition-colors">
                      Términos
                    </span>
                  </Link>
                  <Link href="/legal/privacy">
                    <span className="text-neutral-400 hover:text-primary-400 transition-colors">
                      Privacidad
                    </span>
                  </Link>
                  <Link href="/company/contact">
                    <span className="text-neutral-400 hover:text-primary-400 transition-colors">
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

// Deshabilitar SSG para evitar errores de AuthProvider
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default LandingPage;