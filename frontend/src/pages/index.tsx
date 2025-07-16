import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MetaTags from '@/components/seo/MetaTags';
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
  PlayCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

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
    location: 'Zona Centro'
  },
  {
    id: 2,
    name: 'Ana Martínez',
    profession: 'Electricista',
    rating: 4.8,
    reviews: 89,
    image: undefined,
    services: ['Electricidad', 'Instalaciones'],
    location: 'Zona Norte'
  },
  {
    id: 3,
    name: 'Roberto Silva',
    profession: 'Técnico Reparaciones',
    rating: 4.7,
    reviews: 156,
    image: undefined,
    services: ['Reparaciones', 'Mantenimiento'],
    location: 'Zona Sur'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Fixia",
    "description": "Marketplace de servicios profesionales en Chubut, Argentina",
    "url": "https://fixia.com.ar",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fixia.com.ar/explorador/buscar-servicio?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <MetaTags
        title="Fx Fixia - La Evolución Digital de los Servicios Profesionales"
        description="Donde la innovación encuentra la experiencia. Conectamos talento excepcional con proyectos que trascienden lo ordinario. La próxima generación de servicios profesionales está aquí."
        keywords="servicios profesionales, plomería, electricidad, limpieza, reparaciones, marketplace, fixia, chubut, argentina"
        ogType="website"
        structuredData={structuredData}
      />

      <div className="min-h-screen">
        {/* Minimal Header - AssetClass Inspired */}
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Logo size="md" variant="primary" />
              
              <nav className="hidden md:flex items-center gap-8">
                <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Cómo funciona
                </a>
                <a href="#servicios" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Servicios
                </a>
                <a href="#profesionales" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Especialistas
                </a>
                <a href="#contacto" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contacto
                </a>
              </nav>

              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/login">
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/auth/registro">
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Registrarse
                  </button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden nav-hamburger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-primary-600" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-primary-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`nav-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <div className="nav-mobile-content">
              <Logo size="xl" variant="white" className="mb-8" />
              <nav className="flex flex-col">
                <a href="#como-funciona" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Cómo funciona
                </a>
                <a href="#servicios" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Servicios
                </a>
                <a href="#profesionales" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Profesionales
                </a>
                <a href="#contacto" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Contacto
                </a>
              </nav>
              <div className="mt-8 flex flex-col gap-4">
                <Link href="/auth/login">
                  <button className="btn btn-ghost text-white border-white hover:bg-white hover:text-primary-600">
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

        {/* Hero Section - AssetClass Inspired */}
        <section className="min-h-screen bg-white flex items-center justify-center px-4 pt-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900">
                  Conectando
                  <span className="block font-semibold">Ases y Exploradores</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                  La plataforma que conecta a los mejores en sus oficios y habilidades con personas que necesitan servicios de calidad.
                </p>
                <p className="text-lg text-gray-900 font-medium">
                  Sin comisiones, sin intermediarios.
                </p>
              </div>

              {/* Minimal Search Bar */}
              <div className="max-w-2xl mx-auto space-y-4">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar servicios..."
                      className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Buscar
                    </button>
                  </div>
                </form>

                {/* Clean CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/auth/registro?type=customer">
                    <button className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium">
                      Soy Explorador
                    </button>
                  </Link>
                  <Link href="/auth/registro?type=provider">
                    <button className="px-8 py-3 border border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                      Soy Especialista
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators - Minimal */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <CheckCircleIcon className="h-8 w-8 text-gray-900 mx-auto" />
                <h3 className="font-medium text-gray-900">Algoritmos Inteligentes</h3>
                <p className="text-gray-600 text-sm">Conexiones precisas y automáticas</p>
              </div>
              <div className="space-y-2">
                <ShieldCheckIcon className="h-8 w-8 text-gray-900 mx-auto" />
                <h3 className="font-medium text-gray-900">Confianza Verificada</h3>
                <p className="text-gray-600 text-sm">Profesionales validados y evaluados</p>
              </div>
              <div className="space-y-2">
                <StarIcon className="h-8 w-8 text-gray-900 mx-auto" />
                <h3 className="font-medium text-gray-900">Conexiones Perfectas</h3>
                <p className="text-gray-600 text-sm">Matchmaking basado en compatibilidad</p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories - Minimal */}
        <section id="servicios" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                Excelencia en cada categoría
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cada especialista es cuidadosamente seleccionado. Cada proyecto, una oportunidad de crear algo extraordinario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCategoriesData.map((category, index) => (
                <Link key={category.id} href={`/explorador/buscar-servicio?category=${category.id}`}>
                  <div className="group p-8 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-200 cursor-pointer">
                    <div className="text-4xl mb-6">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{category.description}</p>
                    <div className="flex items-center text-gray-900 font-medium group-hover:translate-x-1 transition-transform">
                      <span>Explorar especialistas</span>
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
          <div className="container relative">
            <div className="content-medium text-center mb-16 slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Tres Pasos Hacia la Excelencia
              </h2>
              <p className="text-xl text-secondary">
                Una metodología diseñada para garantizar que cada conexión sea perfecta, cada resultado extraordinario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center scale-in-on-scroll stagger-1 hover-lift cursor-pointer hover-tilt">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow animate-pulse hover-bounce hover-magnetic">
                  <MagnifyingGlassIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4 hover-bounce">
                  Descubrimiento Inteligente
                </h3>
                <p className="text-secondary">
                  Nuestra tecnología comprende tu visión y localiza especialistas que no solo ejecutan, sino que elevan tu proyecto.
                </p>
              </div>

              <div className="text-center scale-in-on-scroll stagger-2 hover-lift cursor-pointer hover-tilt">
                <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow animate-pulse hover-bounce hover-magnetic">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4 hover-bounce">
                  Conexión Estratégica
                </h3>
                <p className="text-secondary">
                  Más que una coincidencia: una alianza estratégica entre tu necesidad y el talento excepcional que la materializa.
                </p>
              </div>

              <div className="text-center scale-in-on-scroll stagger-3 hover-lift cursor-pointer hover-tilt">
                <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow animate-pulse hover-bounce hover-magnetic">
                  <CheckCircleIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4 hover-bounce">
                  Garantía de Excelencia
                </h3>
                <p className="text-secondary">
                  Un ecosistema de confianza que asegura resultados superiores y relaciones duraderas.
                </p>
              </div>
            </div>

            <div className="text-center mt-12 fade-in-on-scroll">
              <Link href="/auth/registro">
                <button className="btn btn-primary btn-xl btn-magnetic hover-lift animate-glow">
                  Experimentar la Diferencia
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Professionals */}
        <section id="profesionales" className="section-padding bg-white">
          <div className="container">
            <div className="content-medium text-center mb-16 slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Especialistas de Elite
              </h2>
              <p className="text-xl text-secondary">
                Profesionales excepcionales que han sido rigurosamente evaluados y que consistentemente superan expectativas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProfessionals.map((professional, index) => (
                <div key={professional.id} className={`card hover-lift hover-magnetic ripple cursor-pointer scale-in-on-scroll stagger-${index + 1} hover-tilt`}>
                  <div className="card-header">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mr-4 shadow-lg hover:shadow-xl transition-shadow hover-bounce">
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
                <button className="btn btn-outline btn-lg btn-magnetic hover-lift">
                  Ver Todos los AS
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-gradient-to-br from-secondary-50 to-primary-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
          <div className="container relative">
            <div className="content-medium text-center mb-16 slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Historias de Transformación
              </h2>
              <p className="text-xl text-secondary">
                Cada testimonio es una prueba de que cuando la innovación encuentra la experiencia, surgen resultados extraordinarios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className={`card glass hover-lift hover-magnetic ripple cursor-pointer scale-in-on-scroll stagger-${index + 1} hover-tilt animate-glow`}>
                  <div className="card-header">
                    <div className="flex items-center justify-center hover-bounce">
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
        <section className="section-padding bg-gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="scale-in-on-scroll stagger-1 hover-lift cursor-pointer hover-magnetic">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse hover-bounce">500+</div>
                <div className="text-primary-200 font-medium">Especialistas de Elite</div>
              </div>
              <div className="scale-in-on-scroll stagger-2 hover-lift cursor-pointer hover-magnetic">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse hover-bounce">2,000+</div>
                <div className="text-primary-200 font-medium">Proyectos Transformados</div>
              </div>
              <div className="scale-in-on-scroll stagger-3 hover-lift cursor-pointer hover-magnetic">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse hover-bounce">4.8</div>
                <div className="text-primary-200 font-medium">Calificación Promedio</div>
              </div>
              <div className="scale-in-on-scroll stagger-4 hover-lift cursor-pointer hover-magnetic">
                <div className="text-5xl font-bold text-white mb-3 animate-pulse hover-bounce">98%</div>
                <div className="text-primary-200 font-medium">Resultados Excepcionales</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-white">
          <div className="content-medium text-center">
            <div className="slide-up-on-scroll">
              <h2 className="text-4xl font-bold text-primary mb-6">
                Tu Proyecto Excepcional Te Espera
              </h2>
              <p className="text-xl text-secondary mb-8">
                Únete a la comunidad de visionarios que han elegido la excelencia como estándar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/registro?type=customer">
                  <button className="btn btn-primary btn-lg btn-magnetic hover-lift animate-glow">
                    Soy Explorador
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <button className="btn btn-outline btn-lg btn-magnetic hover-lift">
                    Soy Especialista
                    <BriefcaseIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contacto" className="bg-dark text-white section-padding relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-secondary-900/20"></div>
          <div className="container relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="fade-in-on-scroll">
                <Logo size="lg" variant="white" className="mb-4" />
                <p className="text-neutral-300 mb-4 leading-relaxed">
                  La evolución digital de los servicios profesionales. Donde cada conexión es el inicio de algo extraordinario.
                </p>
                <div className="flex space-x-4">
                  <span className="text-neutral-400 font-medium">Síguenos:</span>
                  {/* Social icons could go here */}
                </div>
              </div>

              <div className="fade-in-on-scroll stagger-1">
                <h4 className="font-semibold mb-4 text-lg">Para Exploradores</h4>
                <ul className="space-y-3 text-neutral-300">
                  <li>
                    <Link href="/explorador/buscar-servicio" className="hover:text-primary-400 transition-colors hover-lift hover-magnetic">
                      Descubrimiento Inteligente
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/navegar-profesionales" className="hover:text-primary-400 transition-colors hover-lift hover-magnetic">
                      Explorar Talento
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/registro?type=customer" className="hover:text-primary-400 transition-colors hover-lift hover-magnetic">
                      Registro Explorador
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="fade-in-on-scroll stagger-2">
                <h4 className="font-semibold mb-4 text-lg">Para Especialistas</h4>
                <ul className="space-y-3 text-neutral-300">
                  <li>
                    <Link href="/auth/registro?type=provider" className="hover:text-primary-400 transition-colors hover-lift hover-magnetic">
                      Unirse como Especialista
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/cambiar-a-as" className="hover:text-primary-400 transition-colors hover-lift hover-magnetic">
                      Convertirse en AS
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="fade-in-on-scroll stagger-3">
                <h4 className="font-semibold mb-4 text-lg">Contacto</h4>
                <div className="space-y-3 text-neutral-300">
                  <div className="flex items-center hover:text-primary-400 transition-colors cursor-pointer hover-lift hover-magnetic">
                    <EnvelopeIcon className="h-5 w-5 mr-3 hover-bounce" />
                    <span>info@fixia.com.ar</span>
                  </div>
                  <div className="flex items-center hover:text-primary-400 transition-colors cursor-pointer hover-lift hover-magnetic">
                    <PhoneIcon className="h-5 w-5 mr-3 hover-bounce" />
                    <span>+54 11 1234-5678</span>
                  </div>
                  <div className="flex items-center hover:text-primary-400 transition-colors cursor-pointer hover-lift hover-magnetic">
                    <MapPinIcon className="h-5 w-5 mr-3 hover-bounce" />
                    <span>Argentina</span>
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
                    <span className="text-neutral-400 hover:text-primary-400 transition-colors hover-lift hover-magnetic">
                      Términos
                    </span>
                  </Link>
                  <Link href="/legal/privacy">
                    <span className="text-neutral-400 hover:text-primary-400 transition-colors hover-lift hover-magnetic">
                      Privacidad
                    </span>
                  </Link>
                  <Link href="/company/contact">
                    <span className="text-neutral-400 hover:text-primary-400 transition-colors hover-lift hover-magnetic">
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