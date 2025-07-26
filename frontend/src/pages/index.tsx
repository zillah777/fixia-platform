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
  XMarkIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BoltIcon,
  FireIcon,
  CpuChipIcon,
  EyeIcon,
  HandRaisedIcon,
  TrophyIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  FaceSmileIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Input from '@/components/ui/Input';

const serviceCategoriesData = [
  { 
    id: 'plomeria', 
    name: 'Plomería', 
    icon: WrenchScrewdriverIcon, 
    description: 'Reparaciones e instalaciones profesionales',
    bgColor: 'bg-primary-500',
    hoverColor: 'hover:bg-primary-600'
  },
  { 
    id: 'electricidad', 
    name: 'Electricidad', 
    icon: BoltIcon, 
    description: 'Instalaciones eléctricas certificadas',
    bgColor: 'bg-secondary-500',
    hoverColor: 'hover:bg-secondary-600'
  },
  { 
    id: 'limpieza', 
    name: 'Limpieza', 
    icon: SparklesIcon, 
    description: 'Servicios de limpieza especializados',
    bgColor: 'bg-success-500',
    hoverColor: 'hover:bg-success-600'
  },
  { 
    id: 'reparaciones', 
    name: 'Reparaciones', 
    icon: CogIcon, 
    description: 'Reparaciones y mantenimiento integral',
    bgColor: 'bg-info-500',
    hoverColor: 'hover:bg-info-600'
  },
  { 
    id: 'belleza', 
    name: 'Belleza', 
    icon: FaceSmileIcon, 
    description: 'Servicios de belleza y bienestar',
    bgColor: 'bg-warning-500',
    hoverColor: 'hover:bg-warning-600'
  },
  { 
    id: 'otros', 
    name: 'Otros', 
    icon: PuzzlePieceIcon, 
    description: 'Servicios especializados diversos',
    bgColor: 'bg-neutral-600',
    hoverColor: 'hover:bg-neutral-700'
  }
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
    "name": "Fx Fixia",
    "description": "Marketplace de servicios profesionales en Argentina",
    "url": "https://fixia.com.ar",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fixia.com.ar/explorador/buscar-servicio?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <ThemeProvider>
      <MetaTags
        title="Fx Fixia - Marketplace de Servicios Profesionales"
        description="Conectamos a los mejores profesionales con clientes que buscan servicios de calidad excepcional. Plomería, electricidad, limpieza y más."
        keywords="servicios profesionales, plomería, electricidad, limpieza, reparaciones, marketplace, fixia, chubut, argentina"
        ogType="website"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-surface-50 dark:bg-neutral-950 transition-colors duration-200">
        {/* Marketplace Header - Modern & Clean */}
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 z-50 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Logo size="md" variant="primary" />
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a 
                  href="#como-funciona" 
                  className="text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Cómo funciona
                </a>
                <a 
                  href="#servicios" 
                  className="text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Servicios
                </a>
                <a 
                  href="#profesionales" 
                  className="text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('profesionales')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Especialistas
                </a>
                <a 
                  href="#contacto" 
                  className="text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Contacto
                </a>
              </nav>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle size="sm" />
                
                {/* Auth Buttons */}
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
                  <a 
                    href="#como-funciona" 
                    className="block text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 font-medium py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Cómo funciona
                  </a>
                  <a 
                    href="#servicios" 
                    className="block text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 font-medium py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Servicios
                  </a>
                  <a 
                    href="#profesionales" 
                    className="block text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 font-medium py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      document.getElementById('profesionales')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Especialistas
                  </a>
                  <a 
                    href="#contacto" 
                    className="block text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 font-medium py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Contacto
                  </a>
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

        {/* Hero Section - Premium Marketplace Design */}
        <section className="relative min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20 overflow-hidden">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-500/15 to-primary-600/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-secondary-500/15 to-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-accent-500/8 to-primary-500/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 111, 131, 0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
            
            {/* Central gradient overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary-500/5 via-transparent to-secondary-500/5 rounded-full" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16">
            <div className="max-w-6xl mx-auto text-center">
              <div className="space-y-12 animate-fade-in">
                
                {/* Enhanced Status Badge */}
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border border-primary-200/50 dark:border-neutral-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <div className="w-3 h-3 bg-gradient-to-r from-success-500 to-success-400 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-3 h-3 bg-success-500/20 rounded-full animate-ping" />
                  </div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500">
                    🚀 Marketplace de Elite - Servicios Profesionales
                  </span>
                </div>

                {/* Hero Logo & Title */}
                <div className="space-y-8">
                  <div className="flex justify-center animate-scale-in">
                    <Logo size="2xl" variant="primary" animated showText={false} />
                  </div>
                  
                  <div className="space-y-8">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display leading-[0.9] tracking-tight">
                      <span className="relative">
                        <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent animate-gradient bg-300% bg-[length:300%_100%]">
                          Fixia
                        </span>
                        {/* Subtle glow effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-primary-500/20 to-secondary-600/20 blur-xl -z-10" aria-hidden="true">
                          Fixia
                        </span>
                      </span>
                      <br />
                      <span className="text-neutral-700 dark:text-neutral-300 text-2xl md:text-3xl lg:text-4xl font-semibold tracking-wide">
                        Conecta • Confía • Resuelve
                      </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto leading-relaxed font-medium">
                      El marketplace inteligente que conecta a 
                      <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-bold">profesionales de elite</span>
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"></span>
                      </span>
                      {' '}con clientes que buscan 
                      <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent font-bold">resultados extraordinarios</span>
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent-600 to-secondary-600 rounded-full"></span>
                      </span>
                      .
                    </p>
                  </div>

                  {/* Enhanced Trust Indicators */}
                  <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-full border border-success-200/50 dark:border-success-700/50">
                      <div className="relative">
                        <ShieldCheckIcon className="h-5 w-5 text-success-500" />
                        <div className="absolute inset-0 h-5 w-5 bg-success-500/20 rounded-full animate-ping" />
                      </div>
                      <span className="text-sm font-semibold text-success-700 dark:text-success-400">100% Verificado</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-full border border-warning-200/50 dark:border-warning-700/50">
                      <BoltIcon className="h-5 w-5 text-warning-500 animate-pulse" />
                      <span className="text-sm font-semibold text-warning-700 dark:text-warning-400">0% Comisiones</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-full border border-secondary-200/50 dark:border-secondary-700/50">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid key={i} className="h-4 w-4 text-warning-400" />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">4.9★ Rating</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search Card */}
                <div className="max-w-4xl mx-auto">
                  <Card variant="glass" padding="xl" className="backdrop-blur-xl border-primary-200/30 dark:border-primary-700/30 shadow-2xl">
                    <form onSubmit={handleSearch} className="space-y-8">
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950/50 dark:to-secondary-950/50 rounded-full">
                          <SparklesIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Búsqueda Inteligente</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold font-display text-neutral-900 dark:text-white">
                          ¿Qué servicio 
                          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">extraordinario</span>
                          {' '}necesitas?
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                          Conecta con profesionales de elite verificados en segundos
                        </p>
                      </div>
                      
                      <div className="relative">
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Ej: Plomero certificado, electricista industrial, limpieza profunda..."
                          variant="filled"
                          inputSize="xl"
                          leftIcon={<MagnifyingGlassIcon className="h-6 w-6 text-primary-500" />}
                          fullWidth
                          className="pr-32"
                        />
                        {/* Quick suggestions */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={!searchQuery.trim()}
                            leftIcon={<RocketLaunchIcon className="h-4 w-4" />}
                            className="shadow-lg"
                          >
                            Buscar
                          </Button>
                        </div>
                      </div>
                      
                      {/* Popular searches */}
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2">Popular:</span>
                        {['Plomería', 'Electricidad', 'Limpieza', 'Reparaciones'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-3 py-1 text-xs font-medium bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full transition-colors duration-200 border border-primary-200/50 dark:border-primary-700/50"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </form>
                  </Card>
                </div>

                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-12">
                  <Link href="/auth/registro?type=customer">
                    <Button
                      variant="primary"
                      size="xl"
                      leftIcon={<UserGroupIcon className="h-7 w-7" />}
                      rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                      className="min-w-[280px] shadow-2xl hover:shadow-primary-500/25 transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600"
                    >
                      🚀 Soy Explorador
                    </Button>
                  </Link>
                  <Link href="/auth/registro?type=provider">
                    <Button
                      variant="outline"
                      size="xl"
                      leftIcon={<BriefcaseIcon className="h-7 w-7" />}
                      rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                      className="min-w-[280px] border-2 border-primary-500 hover:border-primary-600 shadow-xl hover:shadow-primary-500/20 transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-white to-primary-50 hover:from-primary-50 hover:to-primary-100 dark:from-neutral-900 dark:to-neutral-800"
                    >
                      🏆 Soy Especialista
                    </Button>
                  </Link>
                </div>
                
                {/* Trust metrics preview */}
                <div className="mt-16 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Únete a miles que ya confían en Fixia</p>
                  <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-neutral-600 dark:text-neutral-400">500+ Especialistas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-neutral-600 dark:text-neutral-400">2000+ Proyectos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                      <span className="text-neutral-600 dark:text-neutral-400">4.9⭐ Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators - Marketplace 2.0 */}
        <section className="py-20 bg-white dark:bg-neutral-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950/50 rounded-full mb-6">
                <SparklesIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  ¿Por qué Fixia?
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold font-display text-neutral-900 dark:text-white mb-6">
                Marketplace de 
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Confianza</span>
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                Tecnología avanzada y profesionales verificados para resultados excepcionales
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Algoritmos Inteligentes */}
              <Card variant="default" padding="xl" hover className="text-center group">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CpuChipIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-transparent mx-auto rounded-full opacity-60" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Matching Inteligente
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Algoritmos avanzados que conectan tus necesidades específicas con el profesional perfecto
                </p>
              </Card>

              {/* Confianza Verificada */}
              <Card variant="default" padding="xl" hover className="text-center group">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-success-500 to-transparent mx-auto rounded-full opacity-60" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  100% Verificado
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Todos los profesionales pasan por un riguroso proceso de verificación y validación
                </p>
              </Card>

              {/* Resultados Excepcionales */}
              <Card variant="default" padding="xl" hover className="text-center group">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrophyIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-secondary-500 to-transparent mx-auto rounded-full opacity-60" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Calidad Garantizada
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  98% de satisfacción del cliente con garantía de calidad en cada servicio
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Categories - Ultra-Modern Design */}
        <section id="servicios" className="py-24 bg-gradient-to-br from-surface-50 via-white to-primary-50/30 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 fixia-grid-pattern opacity-30" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950/50 dark:to-secondary-950/50 rounded-2xl mb-8">
                <CpuChipIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Servicios de Elite</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black font-display text-neutral-900 dark:text-white mb-8 leading-tight">
                <span className="fixia-text-gradient-primary">Servicios</span>
                <br />
                <span className="text-neutral-700 dark:text-neutral-300">que Transforman</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto leading-relaxed font-medium">
                Cada especialista es 
                <span className="bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent font-bold">cuidadosamente seleccionado</span>. 
                Cada proyecto, una oportunidad de crear algo 
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-bold">extraordinario</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategoriesData.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Link key={category.id} href={`/explorador/buscar-servicio?category=${category.id}`}>
                    <div className="group relative">
                      {/* Gradient border effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                      
                      <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-3xl p-8 group cursor-pointer hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] group-hover:-translate-y-2">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-100 dark:to-neutral-200 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow duration-500">
                              <IconComponent className="h-12 w-12 text-white dark:text-neutral-900" />
                            </div>
                            {/* Icon glow effect */}
                            <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-2xl md:text-3xl font-bold font-display text-neutral-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                            {category.name}
                          </h3>
                          
                          {category.description && (
                            <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed font-medium">
                              {category.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                              <span>Explorar especialistas</span>
                              <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:rotate-45 transition-transform duration-300" />
                            </div>
                            
                            {/* Service count badge */}
                            <div className="px-3 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                              50+
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover shimmer effect */}
                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works - Ultra-Modern Process */}
        <section id="como-funciona" className="py-24 bg-white dark:bg-neutral-950 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl animate-hero-float" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-accent-500/5 to-primary-500/5 rounded-full blur-3xl animate-hero-float" style={{ animationDelay: '3s' }} />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-950/50 dark:to-primary-950/50 rounded-2xl mb-8">
                <RocketLaunchIcon className="h-5 w-5 text-success-600 dark:text-success-400" />
                <span className="text-sm font-semibold text-success-700 dark:text-success-300">Metodología Probada</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black font-display text-neutral-900 dark:text-white mb-8 leading-tight">
                <span className="text-neutral-900 dark:text-white">Tres Pasos Hacia la</span>
                <br />
                <span className="fixia-text-gradient-secondary">Excelencia</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto leading-relaxed font-medium">
                Una metodología 
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-bold">científicamente diseñada</span>
                {' '}para garantizar que cada conexión sea perfecta, cada resultado 
                <span className="bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent font-bold">extraordinario</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    01
                  </div>
                  
                  {/* Icon container with enhanced styling */}
                  <div className="relative mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-primary-500/25 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                      <EyeIcon className="h-12 w-12 text-white" />
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-primary-500/30 to-primary-600/30 rounded-3xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    
                    {/* Connection line to next step */}
                    <div className="hidden md:block absolute top-12 left-full w-24 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold font-display text-neutral-900 dark:text-white mb-6 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  Descubrimiento Inteligente
                </h3>
                
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium text-lg">
                  Nuestra 
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">IA avanzada</span>
                  {' '}comprende tu visión y localiza especialistas que no solo ejecutan, sino que 
                  <span className="text-accent-600 dark:text-accent-400 font-semibold">elevan tu proyecto</span>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    02
                  </div>
                  
                  {/* Icon container */}
                  <div className="relative mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-secondary-500/25 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                      <HandRaisedIcon className="h-12 w-12 text-white" />
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-secondary-500/30 to-secondary-600/30 rounded-3xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    
                    {/* Connection line to next step */}
                    <div className="hidden md:block absolute top-12 left-full w-24 h-0.5 bg-gradient-to-r from-secondary-500/50 to-transparent" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold font-display text-neutral-900 dark:text-white mb-6 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors duration-300">
                  Conexión Estratégica
                </h3>
                
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium text-lg">
                  Más que una coincidencia: una 
                  <span className="text-secondary-600 dark:text-secondary-400 font-semibold">alianza estratégica</span>
                  {' '}entre tu necesidad y el 
                  <span className="text-accent-600 dark:text-accent-400 font-semibold">talento excepcional</span>
                  {' '}que la materializa.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    03
                  </div>
                  
                  {/* Icon container */}
                  <div className="relative mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-success-500 to-success-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-success-500/25 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                      <CheckCircleIcon className="h-12 w-12 text-white" />
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-success-500/30 to-success-600/30 rounded-3xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold font-display text-neutral-900 dark:text-white mb-6 group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors duration-300">
                  Garantía de Excelencia
                </h3>
                
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium text-lg">
                  Un 
                  <span className="text-success-600 dark:text-success-400 font-semibold">ecosistema de confianza</span>
                  {' '}que asegura 
                  <span className="text-accent-600 dark:text-accent-400 font-semibold">resultados superiores</span>
                  {' '}y relaciones duraderas.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link href="/auth/registro">
                <Button
                  variant="primary"
                  size="xl"
                  leftIcon={<SparklesIcon className="h-6 w-6" />}
                  rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-2xl hover:shadow-primary-500/25 transform hover:scale-105 transition-all duration-500 px-12 py-4"
                >
                  ✨ Experimentar la Diferencia
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Professionals - Clean & Modern */}
        <section id="profesionales" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Especialistas de Elite
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Profesionales excepcionales que han sido rigurosamente evaluados y que consistentemente superan expectativas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProfessionals.map((professional, index) => (
                <div key={professional.id} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mr-4">
                      <UserGroupIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{professional.name}</h3>
                      <p className="text-gray-600">{professional.profession}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      {renderStars(Math.round(professional.rating))}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {professional.rating}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({professional.reviews} reseñas)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {professional.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{professional.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/explorador/navegar-profesionales">
                <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center mx-auto">
                  Ver Todos los Especialistas
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials - Clean & Modern */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Historias de Transformación
              </h2>
              <p className="text-xl text-gray-600">
                Cada testimonio es una prueba de que cuando la innovación encuentra la experiencia, surgen resultados extraordinarios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
                  <div className="text-center mb-6">
                    {renderStars(testimonial.rating)}
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-900 font-medium text-center italic">
                      "{testimonial.comment}"
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - Clean & Modern */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Resultados que Hablan
              </h2>
              <p className="text-xl text-gray-600">Números que demuestran nuestra excelencia</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="text-5xl font-bold text-gray-900 mb-3">
                  500+
                </div>
                <div className="text-gray-600 font-medium">Especialistas de Elite</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="text-5xl font-bold text-gray-900 mb-3">
                  2,000+
                </div>
                <div className="text-gray-600 font-medium">Proyectos Transformados</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="text-5xl font-bold text-gray-900 mb-3">
                  4.8
                </div>
                <div className="text-gray-600 font-medium">Calificación Promedio</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="text-5xl font-bold text-gray-900 mb-3">
                  98%
                </div>
                <div className="text-gray-600 font-medium">Resultados Excepcionales</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Clean & Modern */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl">
                <FireIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">¡Únete a la Revolución!</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tu Proyecto Excepcional Te Espera
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Únete a la comunidad de visionarios que han elegido la excelencia como estándar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/registro?type=customer">
                  <button className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold text-xl min-w-[250px] hover:bg-gray-800 transition-all duration-300 flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 mr-2" />
                    Soy Explorador
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <button className="bg-white border border-gray-200 text-gray-900 px-10 py-5 rounded-2xl font-bold text-xl min-w-[250px] hover:bg-gray-50 transition-all duration-300 flex items-center justify-center">
                    <BriefcaseIcon className="h-6 w-6 mr-2" />
                    Soy Especialista
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Clean & Modern */}
        <footer id="contacto" className="bg-gray-900 text-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <Logo size="lg" variant="white" className="mb-4" />
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Fx Fixia - La nueva era de los servicios profesionales. Donde cada conexión es el inicio de algo extraordinario.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg text-white">Para Exploradores</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link href="/explorador/buscar-servicio" className="hover:text-white transition-colors">
                      Buscar Servicios
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/navegar-profesionales" className="hover:text-white transition-colors">
                      Explorar Especialistas
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/registro?type=customer" className="hover:text-white transition-colors">
                      Registro Explorador
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg text-white">Para Especialistas</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link href="/auth/registro?type=provider" className="hover:text-white transition-colors">
                      Unirse como Especialista
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/cambiar-a-as" className="hover:text-white transition-colors">
                      Convertirse en AS
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg text-white">Contacto</h4>
                <div className="space-y-3 text-gray-300">
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

            <div className="border-t border-gray-700 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400">
                  © 2024 Fx Fixia. Todos los derechos reservados.
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
    </ThemeProvider>
  );
};

// Deshabilitar SSG para evitar errores de AuthProvider
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default LandingPage;