'use client';

import React from 'react';
import { 
  FixiaNavigation, 
  FixiaBottomNavigation, 
  defaultBottomNavItems 
} from '../ui/FixiaNavigation';
import { FixiaButton } from '../ui/FixiaButton';
import { 
  FixiaCard, 
  FixiaCardHeader, 
  FixiaCardBody, 
  FixiaCardFooter,
  FixiaCardTitle,
  FixiaCardSubtitle 
} from '../ui/FixiaCard';
import { 
  FixiaBadge, 
  FixiaRatingBadge, 
  FixiaVerificationBadge, 
  FixiaTrustIndicators 
} from '../ui/FixiaBadge';
import { 
  ArrowRight, 
  Code, 
  Palette, 
  Hammer, 
  Scale,
  MapPin,
  MessageCircle,
  Heart,
  Star,
  Shield,
  Award
} from 'lucide-react';

// 🎨 FIXIA DESIGN SHOWCASE - Demuestra todo el sistema de diseño
// Este componente sirve como galería y ejemplo de uso de todos los componentes

const FixiaDesignShowcase = () => {
  const mockUser = {
    name: 'María González',
    avatar: '/avatars/maria.jpg',
    isLoggedIn: true
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  return (
    <div className="min-h-screen bg-fixia-surface-surface">
      {/* Navigation */}
      <FixiaNavigation 
        user={mockUser}
        onSearch={handleSearch}
      />

      {/* Hero Section */}
      <section className="fixia-hero">
        <div className="fixia-hero-content">
          <h1 className="fixia-hero-title">
            Tu próximo proyecto excepcional te espera
          </h1>
          <p className="fixia-hero-subtitle">
            Conecta con los mejores profesionales de Chubut. Desde desarrollo web hasta construcción, 
            encuentra el experto perfecto para tu proyecto con garantía de calidad.
          </p>
          <div className="fixia-hero-cta">
            <FixiaButton 
              variant="primary" 
              size="lg" 
              effect="lift"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Buscar Profesional
            </FixiaButton>
            <FixiaButton 
              variant="outline" 
              size="lg"
            >
              Ofrecer Servicio
            </FixiaButton>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 fixia-float">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-light-400 rounded-2xl opacity-20"></div>
        </div>
        <div className="absolute bottom-20 right-10 fixia-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-xl opacity-30"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="fixia-h2 mb-4">Explora por Categorías</h2>
            <p className="fixia-body-large text-fixia-text-secondary">
              Encuentra el servicio perfecto para tu proyecto
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Code className="w-8 h-8" />, title: 'Desarrollo', count: '150+ profesionales' },
              { icon: <Palette className="w-8 h-8" />, title: 'Diseño', count: '89+ profesionales' },
              { icon: <Hammer className="w-8 h-8" />, title: 'Construcción', count: '200+ profesionales' },
              { icon: <Scale className="w-8 h-8" />, title: 'Legal', count: '45+ profesionales' }
            ].map((category, index) => (
              <FixiaCard 
                key={index} 
                className="text-center cursor-pointer group"
                hover={true}
              >
                <FixiaCardBody className="py-8">
                  <div className="text-primary-500 mb-4 flex justify-center group-hover:fixia-pulse-glow">
                    {category.icon}
                  </div>
                  <FixiaCardTitle className="mb-2">{category.title}</FixiaCardTitle>
                  <FixiaCardSubtitle>{category.count}</FixiaCardSubtitle>
                </FixiaCardBody>
              </FixiaCard>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className="py-20 bg-fixia-surface-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="fixia-h2 mb-4">Profesionales Destacados</h2>
            <p className="fixia-body-large text-fixia-text-secondary">
              Conoce a nuestros mejores especialistas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Ana García',
                specialty: 'Senior UX Designer',
                location: 'Buenos Aires',
                rating: 4.9,
                reviews: 127,
                projects: 89,
                verified: true,
                premium: true,
                topRated: true,
                avatar: '/avatars/ana.jpg',
                portfolio: [
                  { type: 'image', title: 'App Rediseño', url: '/portfolio/1.jpg' },
                  { type: 'image', title: 'E-commerce UI', url: '/portfolio/2.jpg' },
                  { type: 'video', title: 'Motion Graphics', url: '/portfolio/3.mp4' }
                ]
              },
              {
                name: 'Carlos Rodriguez',
                specialty: 'Full Stack Developer',
                location: 'Córdoba',
                rating: 4.8,
                reviews: 95,
                projects: 156,
                verified: true,
                premium: false,
                topRated: true,
                avatar: '/avatars/carlos.jpg'
              },
              {
                name: 'Laura Martínez',
                specialty: 'Arquitecta',
                location: 'Rosario',
                rating: 5.0,
                reviews: 68,
                projects: 43,
                verified: true,
                premium: true,
                topRated: false,
                avatar: '/avatars/laura.jpg'
              }
            ].map((provider, index) => (
              <FixiaCard 
                key={index} 
                variant="provider" 
                className="group"
              >
                <FixiaCardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-primary-light-100 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-500">
                            {provider.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        {provider.verified && (
                          <div className="absolute -bottom-1 -right-1">
                            <FixiaVerificationBadge type="verified" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="fixia-h6">{provider.name}</h3>
                          {provider.premium && (
                            <FixiaVerificationBadge type="premium" />
                          )}
                        </div>
                        <p className="fixia-body-small text-primary-500 font-medium mb-2">
                          {provider.specialty}
                        </p>
                        <div className="flex items-center text-fixia-text-muted">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="fixia-body-small">{provider.location}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-primary-50 transition-colors">
                      <Heart className="w-5 h-5 text-fixia-text-muted hover:text-error-500" />
                    </button>
                  </div>
                </FixiaCardHeader>

                <FixiaCardBody>
                  <FixiaTrustIndicators
                    verified={provider.verified}
                    premium={provider.premium}
                    topRated={provider.topRated}
                    projectsCount={provider.projects}
                    rating={provider.rating}
                    reviews={provider.reviews}
                    className="mb-4"
                  />

                  {provider.portfolio && (
                    <div className="mb-4">
                      <h4 className="fixia-caption mb-3">Portfolio Reciente</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {provider.portfolio.map((item, i) => (
                          <div 
                            key={i}
                            className="aspect-square bg-fixia-surface-surface rounded-lg flex items-center justify-center cursor-pointer hover:fixia-hover-scale transition-transform"
                          >
                            <span className="fixia-body-small text-center p-2">
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FixiaCardBody>

                <FixiaCardFooter className="flex gap-3">
                  <FixiaButton variant="outline" size="sm" className="flex-1">
                    Ver Perfil
                  </FixiaButton>
                  <FixiaButton 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                  >
                    Contactar
                  </FixiaButton>
                </FixiaCardFooter>
              </FixiaCard>
            ))}
          </div>
        </div>
      </section>

      {/* Design System Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="fixia-h2 mb-4">Sistema de Diseño Fixia</h2>
            <p className="fixia-body-large text-fixia-text-secondary">
              Componentes y estilos del diseño "Confianza Líquida"
            </p>
          </div>

          {/* Typography */}
          <div className="mb-16">
            <h3 className="fixia-h3 mb-8">Tipografía</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="fixia-h4 mb-4">Títulos - Work Sans</h4>
                <div className="space-y-4">
                  <h1 className="fixia-h1">Heading H1</h1>
                  <h2 className="fixia-h2">Heading H2</h2>
                  <h3 className="fixia-h3">Heading H3</h3>
                  <h4 className="fixia-h4">Heading H4</h4>
                </div>
              </div>
              <div>
                <h4 className="fixia-h4 mb-4">Texto - Inter</h4>
                <div className="space-y-4">
                  <p className="fixia-body-large">Body Large - Lorem ipsum dolor sit amet consectetur.</p>
                  <p className="fixia-body">Body Regular - Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>
                  <p className="fixia-body-small">Body Small - Lorem ipsum dolor sit amet consectetur.</p>
                  <p className="fixia-caption">Caption - Lorem ipsum</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mb-16">
            <h3 className="fixia-h3 mb-8">Botones</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="fixia-h4 mb-4">Variantes</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <FixiaButton variant="primary">Primary</FixiaButton>
                    <FixiaButton variant="secondary">Secondary</FixiaButton>
                    <FixiaButton variant="outline">Outline</FixiaButton>
                    <FixiaButton variant="ghost">Ghost</FixiaButton>
                    <FixiaButton variant="accent">Accent</FixiaButton>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="fixia-h4 mb-4">Tamaños y Efectos</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <FixiaButton size="sm">Small</FixiaButton>
                    <FixiaButton size="md">Medium</FixiaButton>
                    <FixiaButton size="lg">Large</FixiaButton>
                  </div>
                  <div className="flex items-center gap-4">
                    <FixiaButton effect="lift">Lift Effect</FixiaButton>
                    <FixiaButton effect="scale">Scale Effect</FixiaButton>
                    <FixiaButton effect="glow">Glow Effect</FixiaButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-16">
            <h3 className="fixia-h3 mb-8">Badges y Indicadores</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="fixia-h4 mb-4">Estados</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <FixiaBadge variant="primary">Primary</FixiaBadge>
                    <FixiaBadge variant="secondary">Secondary</FixiaBadge>
                    <FixiaBadge variant="success">Success</FixiaBadge>
                    <FixiaBadge variant="warning">Warning</FixiaBadge>
                    <FixiaBadge variant="error">Error</FixiaBadge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="fixia-h4 mb-4">Verificaciones</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <FixiaVerificationBadge type="verified" />
                    <FixiaVerificationBadge type="premium" />
                    <FixiaVerificationBadge type="pro" />
                    <FixiaVerificationBadge type="top-rated" />
                  </div>
                  <FixiaRatingBadge rating={4.8} reviews={156} />
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-16">
            <h3 className="fixia-h3 mb-8">Cards</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <FixiaCard variant="default">
                <FixiaCardBody>
                  <FixiaCardTitle>Card Default</FixiaCardTitle>
                  <FixiaCardSubtitle>Ejemplo de card básico con hover effect</FixiaCardSubtitle>
                </FixiaCardBody>
              </FixiaCard>
              
              <FixiaCard variant="glass">
                <FixiaCardBody>
                  <FixiaCardTitle>Glass Card</FixiaCardTitle>
                  <FixiaCardSubtitle>Card con efecto glassmorphism</FixiaCardSubtitle>
                </FixiaCardBody>
              </FixiaCard>
              
              <FixiaCard variant="elevated">
                <FixiaCardBody>
                  <FixiaCardTitle>Elevated Card</FixiaCardTitle>
                  <FixiaCardSubtitle>Card con sombra elevada</FixiaCardSubtitle>
                </FixiaCardBody>
              </FixiaCard>
            </div>
          </div>

          {/* Color Palette */}
          <div className="mb-16">
            <h3 className="fixia-h3 mb-8">Paleta de Colores</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <h4 className="fixia-h5 mb-4">Primary</h4>
                <div className="space-y-2">
                  <div className="w-full h-12 bg-primary-500 rounded-lg flex items-center justify-center text-white font-medium">
                    #226F83
                  </div>
                  <div className="w-full h-12 bg-primary-light-400 rounded-lg flex items-center justify-center text-white font-medium">
                    #5B9BAA
                  </div>
                </div>
              </div>
              <div>
                <h4 className="fixia-h5 mb-4">Secondary</h4>
                <div className="space-y-2">
                  <div className="w-full h-12 bg-secondary-500 rounded-lg flex items-center justify-center text-white font-medium">
                    #FC8940
                  </div>
                </div>
              </div>
              <div>
                <h4 className="fixia-h5 mb-4">Accent</h4>
                <div className="space-y-2">
                  <div className="w-full h-12 bg-accent-500 rounded-lg flex items-center justify-center text-white font-medium">
                    #FEC113
                  </div>
                </div>
              </div>
              <div>
                <h4 className="fixia-h5 mb-4">States</h4>
                <div className="space-y-2">
                  <div className="w-full h-8 bg-success-500 rounded-lg flex items-center justify-center text-white text-sm">
                    Success
                  </div>
                  <div className="w-full h-8 bg-warning-500 rounded-lg flex items-center justify-center text-white text-sm">
                    Warning
                  </div>
                  <div className="w-full h-8 bg-error-500 rounded-lg flex items-center justify-center text-white text-sm">
                    Error
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <div className="fixia-mobile-only">
        <FixiaBottomNavigation items={defaultBottomNavItems} />
      </div>
    </div>
  );
};

export default FixiaDesignShowcase;