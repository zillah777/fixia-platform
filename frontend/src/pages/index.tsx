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
    <>
      <MetaTags
        title="Fx Fixia - La Evolución Digital de los Servicios Profesionales"
        description="Donde la innovación encuentra la experiencia. Conectamos talento excepcional con proyectos que trascienden lo ordinario. La próxima generación de servicios profesionales está aquí."
        keywords="servicios profesionales, plomería, electricidad, limpieza, reparaciones, marketplace, fixia, chubut, argentina"
        ogType="website"
        structuredData={structuredData}
      />

      <div className="min-h-screen">
        {/* Modern Clean Header */}
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
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
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/auth/registro">
                  <button className="px-6 py-2 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium">
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

        {/* Hero Section - Clean & Modern */}
        <section className="min-h-screen bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-16">
              <div className="max-w-6xl mx-auto text-center">
                <div className="space-y-12">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <SparklesIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">La Nueva Era de los Servicios Profesionales</span>
                  </div>

                  {/* Hero Title */}
                  <div className="space-y-6">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                      Fx Fixia
                      <br />
                      <span className="text-gray-600">
                        Conectando Ases y Exploradores
                      </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                      La plataforma que conecta a los mejores profesionales con personas que necesitan servicios de calidad excepcional.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-gray-500">
                      <BoltIcon className="h-5 w-5" />
                      <span className="text-lg font-medium">Sin comisiones, sin intermediarios</span>
                      <BoltIcon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Search Section */}
                  <div className="max-w-3xl mx-auto space-y-8">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                      <form onSubmit={handleSearch} className="space-y-6">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="¿Qué servicio necesitas hoy?"
                            className="w-full pl-12 pr-4 py-6 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder-gray-500 text-gray-900"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!searchQuery.trim()}
                          className="w-full bg-gray-900 text-white px-8 py-6 text-lg font-medium rounded-2xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                        >
                          <RocketLaunchIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                          Buscar Ahora
                        </button>
                      </form>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                      <Link href="/auth/registro?type=customer">
                        <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg min-w-[200px] hover:bg-gray-800 transition-all duration-300 shadow-sm flex items-center justify-center">
                          <UserGroupIcon className="h-6 w-6 mr-2" />
                          Soy Explorador
                        </button>
                      </Link>
                      <Link href="/auth/registro?type=provider">
                        <button className="bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg min-w-[200px] hover:bg-gray-50 transition-all duration-300 shadow-sm flex items-center justify-center">
                          <BriefcaseIcon className="h-6 w-6 mr-2" />
                          Soy Especialista
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        {/* Trust Indicators - Clean & Modern */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Por qué elegir Fx Fixia
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tecnología avanzada y profesionales verificados para resultados excepcionales
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CpuChipIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Algoritmos Inteligentes</h3>
                <p className="text-gray-600">IA avanzada que conecta necesidades específicas con el talento perfecto</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confianza Verificada</h3>
                <p className="text-gray-600">Profesionales validados con certificaciones y reseñas auténticas</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrophyIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resultados Excepcionales</h3>
                <p className="text-gray-600">98% de satisfacción garantizada en cada conexión</p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories - Clean & Modern */}
        <section id="servicios" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Servicios que Transforman
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cada especialista es cuidadosamente seleccionado. Cada proyecto, una oportunidad de crear algo extraordinario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategoriesData.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Link key={category.id} href={`/explorador/buscar-servicio?category=${category.id}`}>
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 group cursor-pointer hover:shadow-md transition-all duration-300">
                      <div className="mb-6 transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center">
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 mb-6">{category.description}</p>
                      )}
                      <div className="flex items-center text-gray-900 font-medium group-hover:translate-x-2 transition-transform">
                        <span>Explorar especialistas</span>
                        <ArrowRightIcon className="h-5 w-5 ml-2" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works - Clean & Modern */}
        <section id="como-funciona" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tres Pasos Hacia la Excelencia
              </h2>
              <p className="text-xl text-gray-600">
                Una metodología diseñada para garantizar que cada conexión sea perfecta, cada resultado extraordinario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <EyeIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Descubrimiento Inteligente
                </h3>
                <p className="text-gray-600">
                  Nuestra tecnología comprende tu visión y localiza especialistas que no solo ejecutan, sino que elevan tu proyecto.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <HandRaisedIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Conexión Estratégica
                </h3>
                <p className="text-gray-600">
                  Más que una coincidencia: una alianza estratégica entre tu necesidad y el talento excepcional que la materializa.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Garantía de Excelencia
                </h3>
                <p className="text-gray-600">
                  Un ecosistema de confianza que asegura resultados superiores y relaciones duraderas.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/auth/registro">
                <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300">
                  Experimentar la Diferencia
                </button>
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