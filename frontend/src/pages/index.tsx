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
  // 2025 Modern Icons
  CommandLineIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  FaceSmileIcon,
  GlobeAltIcon,
  HandRaisedIcon,
  HeartIcon,
  LightBulbIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  QrCodeIcon,
  TrophyIcon,
  WifiIcon,
  BeakerIcon,
  CameraIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  CreditCardIcon,
  DocumentTextIcon,
  GiftIcon,
  HomeIcon,
  KeyIcon,
  MegaphoneIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PresentationChartLineIcon,
  ScaleIcon,
  SunIcon,
  TagIcon,
  UserIcon,
  VideoCameraIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  FlagIcon,
  IdentificationIcon,
  LanguageIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  NewspaperIcon,
  PaperClipIcon,
  PrinterIcon,
  RectangleGroupIcon,
  ServerIcon,
  ShareIcon,
  SpeakerWaveIcon,
  TableCellsIcon,
  TruckIcon,
  ViewfinderCircleIcon,
  WindowIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import GradientText from '@/components/ui/GradientText';
import FloatingElement from '@/components/ui/FloatingElement';
import GlowingOrb from '@/components/ui/GlowingOrb';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

const serviceCategoriesData = [
  { 
    id: 'plomeria', 
    name: 'Plomería', 
    icon: WrenchScrewdriverIcon, 
    description: 'Reparaciones e instalaciones',
    gradient: 'from-primary-500 to-primary-600'  // Clean brand blue
  },
  { 
    id: 'electricidad', 
    name: 'Electricidad', 
    icon: BoltIcon, 
    description: 'Instalaciones eléctricas',
    gradient: 'from-neutral-600 to-neutral-700'  // Elegant neutral
  },
  { 
    id: 'limpieza', 
    name: 'Limpieza', 
    icon: SparklesIcon, 
    description: 'Limpieza de hogar y oficinas',
    gradient: 'from-success-500 to-success-600'  // Clean success green
  },
  { 
    id: 'reparaciones', 
    name: 'Reparaciones', 
    icon: CogIcon, 
    description: 'Reparaciones del hogar',
    gradient: 'from-primary-600 to-primary-700'  // Deep brand blue
  },
  { 
    id: 'belleza', 
    name: 'Belleza', 
    icon: FaceSmileIcon, 
    description: 'Servicios de belleza',
    gradient: 'from-neutral-500 to-neutral-600'  // Sophisticated neutral
  },
  { 
    id: 'otros', 
    name: 'Otros', 
    icon: PuzzlePieceIcon, 
    description: 'Más servicios disponibles',
    gradient: 'from-neutral-700 to-neutral-800'  // Deep professional
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
                <a 
                  href="#como-funciona" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:underline underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Cómo funciona
                </a>
                <a 
                  href="#servicios" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:underline underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Servicios
                </a>
                <a 
                  href="#profesionales" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:underline underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('profesionales')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Especialistas
                </a>
                <a 
                  href="#contacto" 
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:underline underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
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

        {/* Hero Section - Ultra Modern & Impactful */}
        <section className="min-h-screen relative overflow-hidden">
          <AnimatedBackground variant="gradient" className="min-h-screen">
            {/* Floating Elements */}
            <div className="absolute inset-0">
              <FloatingElement delay={0} className="absolute top-20 left-10">
                <GlowingOrb size="lg" color="primary" />
              </FloatingElement>
              <FloatingElement delay={1} className="absolute top-40 right-20">
                <GlowingOrb size="md" color="secondary" />
              </FloatingElement>
              <FloatingElement delay={2} className="absolute bottom-40 left-20">
                <GlowingOrb size="sm" color="accent" />
              </FloatingElement>
              <FloatingElement delay={0.5} className="absolute bottom-20 right-10">
                <GlowingOrb size="lg" color="primary" />
              </FloatingElement>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-16">
              <div className="max-w-6xl mx-auto text-center">
                <div className="space-y-12">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white">
                    <SparklesIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">La Revolución Digital de los Servicios</span>
                  </div>

                  {/* Hero Title */}
                  <div className="space-y-6">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-tight">
                      Conectando
                      <br />
                      <GradientText variant="brand" className="text-6xl md:text-7xl lg:text-8xl" animate>
                        Ases y Exploradores
                      </GradientText>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto font-light leading-relaxed">
                      La plataforma que conecta a los mejores en sus oficios y habilidades con personas que necesitan servicios de calidad.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-white/80">
                      <BoltIcon className="h-5 w-5" />
                      <span className="text-lg font-medium">Sin comisiones, sin intermediarios</span>
                      <BoltIcon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Search Section */}
                  <div className="max-w-3xl mx-auto space-y-8">
                    <Card variant="glass" className="p-8">
                      <form onSubmit={handleSearch} className="space-y-6">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-6 w-6 text-white/60" />
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="¿Qué servicio necesitas hoy?"
                            className="w-full pl-12 pr-4 py-6 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all placeholder-white/60 text-white"
                          />
                        </div>
                        <Button 
                          variant="gradient" 
                          size="lg" 
                          className="w-full group" 
                          type="submit"
                          disabled={!searchQuery.trim()}
                        >
                          <RocketLaunchIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                          Buscar Ahora
                        </Button>
                      </form>
                    </Card>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                      <Link href="/auth/registro?type=customer">
                        <Button variant="glow" size="xl" className="min-w-[200px]">
                          <UserGroupIcon className="h-6 w-6 mr-2" />
                          Soy Explorador
                        </Button>
                      </Link>
                      <Link href="/auth/registro?type=provider">
                        <Button variant="outline" size="xl" className="min-w-[200px] border-white text-white hover:bg-white hover:text-primary-600">
                          <BriefcaseIcon className="h-6 w-6 mr-2" />
                          Soy Especialista
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedBackground>
        </section>

        {/* Trust Indicators - Modern */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <GradientText variant="brand" className="text-4xl md:text-5xl mb-4">
                Por qué somos diferentes
              </GradientText>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tecnología de vanguardia al servicio de conexiones humanas auténticas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card variant="interactive" hover glow className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CpuChipIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Algoritmos Inteligentes</h3>
                <p className="text-neutral-600">IA avanzada que conecta necesidades específicas con el talento perfecto</p>
              </Card>
              <Card variant="interactive" hover glow className="p-8 text-center">
                <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Confianza Verificada</h3>
                <p className="text-neutral-600">Profesionales validados con certificaciones y reseñas auténticas</p>
              </Card>
              <Card variant="interactive" hover glow className="p-8 text-center">
                <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TrophyIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Resultados Excepcionales</h3>
                <p className="text-neutral-600">98% de satisfacción garantizada en cada conexión</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Categories - Ultra Modern */}
        <section id="servicios" className="py-20 bg-neutral-900 relative overflow-hidden">
          <AnimatedBackground variant="particles" className="absolute inset-0" />
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <GradientText variant="professional" className="text-5xl md:text-6xl mb-6">
                Servicios que Transforman
              </GradientText>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Cada especialista es cuidadosamente seleccionado. Cada proyecto, una oportunidad de crear algo extraordinario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategoriesData.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Link key={category.id} href={`/explorador/buscar-servicio?category=${category.id}`}>
                    <Card variant="glass" hover className="p-8 group cursor-pointer">
                      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {category.name}
                      </h3>
                      <p className="text-gray-300 mb-6">{category.description}</p>
                      <div className="flex items-center text-white font-medium group-hover:translate-x-2 transition-transform">
                        <span>Explorar especialistas</span>
                        <ArrowRightIcon className="h-5 w-5 ml-2" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="section-padding bg-neutral-50 relative overflow-hidden">
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
                  <EyeIcon className="h-8 w-8 text-white" />
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
                  <HandRaisedIcon className="h-8 w-8 text-white" />
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

        {/* Featured Professionals - Ultra Modern */}
        <section id="profesionales" className="py-20 bg-gradient-to-br from-gray-50 to-white relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <GradientText variant="brand" className="text-5xl md:text-6xl mb-6">
                Especialistas de Elite
              </GradientText>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Profesionales excepcionales que han sido rigurosamente evaluados y que consistentemente superan expectativas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProfessionals.map((professional, index) => (
                <Card key={professional.id} variant="elevated" hover glow className="p-8 group cursor-pointer">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow">
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
                      <span className="ml-2 text-sm font-medium text-primary-600">
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
                          className="px-3 py-1 bg-primary-100 text-primary-800 text-xs rounded-full font-medium"
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
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/explorador/navegar-profesionales">
                <Button variant="gradient" size="lg">
                  Ver Todos los Especialistas
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-white relative overflow-hidden">
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

        {/* Stats Section - Ultra Dynamic */}
        <section className="py-20 bg-neutral-900 relative overflow-hidden">
          <AnimatedBackground variant="geometric" className="absolute inset-0" />
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <GradientText variant="trust" className="text-4xl md:text-5xl mb-4">
                Resultados que Hablan
              </GradientText>
              <p className="text-xl text-white/80">Números que demuestran nuestra excelencia</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card variant="glass" className="p-8 text-center group hover:scale-105 transition-transform">
                <div className="text-5xl font-bold text-white mb-3 group-hover:animate-bounce">
                  <GradientText variant="brand">500+</GradientText>
                </div>
                <div className="text-white/80 font-medium">Especialistas de Elite</div>
              </Card>
              <Card variant="glass" className="p-8 text-center group hover:scale-105 transition-transform">
                <div className="text-5xl font-bold text-white mb-3 group-hover:animate-bounce">
                  <GradientText variant="brand">2,000+</GradientText>
                </div>
                <div className="text-white/80 font-medium">Proyectos Transformados</div>
              </Card>
              <Card variant="glass" className="p-8 text-center group hover:scale-105 transition-transform">
                <div className="text-5xl font-bold text-white mb-3 group-hover:animate-bounce">
                  <GradientText variant="brand">4.8</GradientText>
                </div>
                <div className="text-white/80 font-medium">Calificación Promedio</div>
              </Card>
              <Card variant="glass" className="p-8 text-center group hover:scale-105 transition-transform">
                <div className="text-5xl font-bold text-white mb-3 group-hover:animate-bounce">
                  <GradientText variant="brand">98%</GradientText>
                </div>
                <div className="text-white/80 font-medium">Resultados Excepcionales</div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section - Ultra Impactful */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
          <AnimatedBackground variant="waves" className="absolute inset-0" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full">
                <FireIcon className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-800">¡Únete a la Revolución!</span>
              </div>
              
              <GradientText variant="professional" className="text-5xl md:text-6xl mb-6">
                Tu Proyecto Excepcional Te Espera
              </GradientText>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Únete a la comunidad de visionarios que han elegido la excelencia como estándar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/registro?type=customer">
                  <Button variant="gradient" size="xl" className="min-w-[250px]">
                    <UserGroupIcon className="h-6 w-6 mr-2" />
                    Soy Explorador
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <Button variant="outline" size="xl" className="min-w-[250px]">
                    <BriefcaseIcon className="h-6 w-6 mr-2" />
                    Soy Especialista
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Ultra Modern */}
        <footer id="contacto" className="bg-neutral-900 text-white py-20 relative overflow-hidden">
          <AnimatedBackground variant="gradient" className="absolute inset-0" />
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <Logo size="lg" variant="white" className="mb-4" />
                <p className="text-gray-300 mb-4 leading-relaxed">
                  La evolución digital de los servicios profesionales. Donde cada conexión es el inicio de algo extraordinario.
                </p>
                <div className="flex space-x-4">
                  <GradientText variant="brand" className="font-medium">Síguenos:</GradientText>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg text-white">Para Exploradores</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link href="/explorador/buscar-servicio" className="hover:text-primary-400 transition-colors">
                      Descubrimiento Inteligente
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/navegar-profesionales" className="hover:text-primary-400 transition-colors">
                      Explorar Talento
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/registro?type=customer" className="hover:text-primary-400 transition-colors">
                      Registro Explorador
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg text-white">Para Especialistas</h4>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link href="/auth/registro?type=provider" className="hover:text-primary-400 transition-colors">
                      Unirse como Especialista
                    </Link>
                  </li>
                  <li>
                    <Link href="/explorador/cambiar-a-as" className="hover:text-primary-400 transition-colors">
                      Convertirse en AS
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg text-white">Contacto</h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center hover:text-primary-400 transition-colors cursor-pointer">
                    <EnvelopeIcon className="h-5 w-5 mr-3" />
                    <span>info@fixia.com.ar</span>
                  </div>
                  <div className="flex items-center hover:text-primary-400 transition-colors cursor-pointer">
                    <PhoneIcon className="h-5 w-5 mr-3" />
                    <span>+54 11 1234-5678</span>
                  </div>
                  <div className="flex items-center hover:text-primary-400 transition-colors cursor-pointer">
                    <MapPinIcon className="h-5 w-5 mr-3" />
                    <span>Argentina</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400">
                  © 2024 Fixia. Todos los derechos reservados.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <Link href="/legal/terms">
                    <span className="text-gray-400 hover:text-primary-400 transition-colors">
                      Términos
                    </span>
                  </Link>
                  <Link href="/legal/privacy">
                    <span className="text-gray-400 hover:text-primary-400 transition-colors">
                      Privacidad
                    </span>
                  </Link>
                  <Link href="/company/contact">
                    <span className="text-gray-400 hover:text-primary-400 transition-colors">
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