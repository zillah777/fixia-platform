import { useState } from "react";
import { NextPage } from 'next';
import Head from 'next/head';
import Link from "next/link";
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Search, Star, Shield, Zap, Users, ArrowRight, Play, Check, ChevronDown, MessageSquare, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FixiaAvatar } from "@/components/ui/fixia-avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { PromotionBanner } from '@/components/PromotionBanner';

const featuredProfessionals = [
  {
    id: "prof_1",
    name: "Roberto Sánchez",
    specialty: "Plomería y Gasista",
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    price: "Desde $8,000/trabajo",
    badge: "Verificado",
    skills: ["Instalaciones", "Reparaciones", "Emergencias"],
    completedProjects: 127
  },
  {
    id: "prof_2", 
    name: "Carmen López",
    specialty: "Limpieza del Hogar",
    rating: 5.0,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face",
    price: "Desde $5,000/día",
    badge: "Top Rated",
    skills: ["Casa completa", "Oficinas", "Post-obra"],
    completedProjects: 203
  },
  {
    id: "prof_3",
    name: "Jorge Martín",
    specialty: "Electricista Matriculado",
    rating: 4.8,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    price: "Desde $6,500/trabajo",
    badge: "Profesional",
    skills: ["Instalaciones", "Tableros", "Emergencias 24h"],
    completedProjects: 78
  }
];


const serviceCategories = [
  {
    id: "plomeria-gasista",
    name: "Plomería y Gasista",
    badge: "Popular",
    icon: "🔧",
    description: "Instalaciones, reparaciones y emergencias",
    services: "350+ profesionales"
  },
  {
    id: "electricista", 
    name: "Electricista",
    icon: "⚡",
    description: "Instalaciones eléctricas y reparaciones",
    services: "280+ profesionales"
  },
  {
    id: "limpieza-hogar",
    name: "Limpieza del Hogar", 
    icon: "🧹",
    description: "Limpieza doméstica y de oficinas",
    services: "420+ profesionales"
  },
  {
    id: "albanil",
    name: "Albañilería",
    icon: "🧱", 
    description: "Construcción y reparaciones menores",
    services: "180+ profesionales"
  },
  {
    id: "mecanico",
    name: "Mecánico",
    icon: "🔩",
    description: "Reparación y mantenimiento automotriz", 
    services: "95+ profesionales"
  },
  {
    id: "ninera",
    name: "Niñera/Cuidado",
    icon: "👶",
    description: "Cuidado de niños y personas mayores",
    services: "120+ profesionales"
  }
];

const HomePage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  return (
    <>
      <Head>
        <title>Fixia - Conecta con Profesionales Certificados en Chubut</title>
        <meta name="description" content="Plataforma líder en Chubut para conectar profesionales de servicios con clientes. Encuentra plomeros, electricistas, carpinteros y más." />
        <meta name="keywords" content="servicios profesionales, Chubut, plomeros, electricistas, carpinteros, AS certificados" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-background">
          {/* Orbe superior izquierdo - Original */}
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          
          {/* Orbe inferior derecho - Original */}
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          
          {/* Orbe cerca del título "Conecta con los mejores profesionales" */}
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
          
          {/* Orbe medio izquierdo */}
          <div className="absolute top-3/4 -left-24 w-56 h-56 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-3xl opacity-18 animate-float" style={{ animationDelay: '1s' }}></div>
          
          {/* Orbe superior centro-derecho */}
          <div className="absolute top-16 right-16 w-40 h-40 bg-gradient-to-r from-violet-400 to-purple-600 rounded-full blur-3xl opacity-12 animate-float" style={{ animationDelay: '3s' }}></div>
          
          {/* Orbe inferior centro */}
          <div className="absolute bottom-10 left-1/3 w-52 h-52 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-3xl opacity-16 animate-float" style={{ animationDelay: '5s' }}></div>
        </div>

        {/* Navigation Header */}
        <Header />

        {/* Hero Section */}
        <HeroSection />

        {/* Promotion Banner */}
        <section className="py-16 relative">
          <div className="container mx-auto px-6">
            <PromotionBanner variant="hero" />
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Professionals */}
        <FeaturedProfessionals />

        {/* How It Works */}
        <HowItWorksSection />


        {/* CTA Section */}
        <CTASection />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

function Header() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <header className="relative z-50 glass-medium border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-tight text-white">Fixia</span>
              <span className="text-xs text-white/60 -mt-1">Conecta. Confía. Resuelve.</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/explorador/buscar-servicio" className="text-foreground/80 hover:text-foreground transition-colors">
              Buscar Servicios
            </Link>
            <Link href="/auth/registro?type=provider" className="text-foreground/80 hover:text-foreground transition-colors">
              Ofrecer Servicios
            </Link>
            <Link href="/como-funciona" className="text-foreground/80 hover:text-foreground transition-colors">
              Cómo Funciona
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href={user?.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard'}>
                <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                  Mi Panel
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button className="glass hover:glass-medium text-white border-white/20 transition-all duration-300">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/registro">
                  <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                    Únete Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explorador/buscar-servicio?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8">
            <div className="glass-medium border-white/20 text-blue-400 mb-6 inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold">
              ✓ La plataforma de servicios más confiable
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Conecta con los mejores
            <br />
            profesionales
          </h1>

          <p className="text-xl lg:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Tu tiempo vale. Fixia lo cuida. Encuentra profesionales altamente calificados
            para resolver tus necesidades con transparencia líquida y resultados
            garantizados.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
            <div className="glass-strong border border-white/20 rounded-2xl p-2 backdrop-blur-xl">
              <div className="flex items-center">
                <div className="flex-1 flex items-center px-4">
                  <Search className="h-6 w-6 text-white/60 mr-3" />
                  <Input
                    type="text"
                    placeholder="¿Qué servicio necesitas? Ej: plomero, electricista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent text-white placeholder:text-white/60 text-lg focus:ring-0 focus:outline-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg m-1 px-8 py-3"
                >
                  Buscar Ahora
                </Button>
              </div>
            </div>
          </form>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 mb-12 text-white/60 text-sm">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-400 mr-2" />
              Más de 1,200 profesionales
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-400 mr-2" />
              Pagos seguros
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-400 mr-2" />
              Soporte 24/7
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    {
      value: "1,200+",
      label: "Profesionales",
      color: "text-blue-400"
    },
    {
      value: "4.8★",
      label: "Calificación",
      color: "text-blue-400"
    },
    {
      value: "24/7",
      label: "Soporte",
      color: "text-blue-400"
    },
    {
      value: "2,500+",
      label: "Trabajos",
      color: "text-blue-400"
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="animate-fade-in">
              <div className={`text-4xl lg:text-5xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-white/70 text-lg font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const router = useRouter();
  
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/explorador/buscar-servicio?category=${categoryId}`);
  };

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Explora Categorías de Servicios
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Encuentra exactamente lo que necesitas en nuestras categorías especializadas. Cada
            profesional está verificado y altamente calificado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category) => (
            <Card 
              key={category.id} 
              className="glass-medium border-white/20 hover:glass-strong transition-all duration-300 cursor-pointer group animate-fade-in"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{category.icon}</div>
                  {category.badge && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {category.badge}
                    </span>
                  )}
                  <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white/60 transition-colors" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{category.name}</h3>
                <p className="text-white/60 text-sm mb-4 leading-relaxed">{category.description}</p>
                <div className="text-white/80 text-sm font-medium">
                  {category.services}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Busca y Conecta",
      description: "Encuentra profesionales verificados usando nuestros filtros inteligentes. Ve perfiles completos con portafolios y reseñas reales."
    },
    {
      number: "02",
      icon: MessageSquare,
      title: "Comunícate y Cotiza", 
      description: "Chatea directamente con profesionales, recibe cotizaciones personalizadas y programa videollamadas de consulta gratuitas."
    },
    {
      number: "03",
      icon: Shield,
      title: "Paga de Forma Segura",
      description: "Realiza pagos seguros con protección de depósito. El profesional recibe el pago solo cuando estés completamente satisfecho."
    },
    {
      number: "04",
      icon: Star,
      title: "Recibe y Evalúa",
      description: "Sigue el progreso en tiempo real, recibe entregas de calidad y evalúa el servicio para ayudar a otros usuarios."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Cómo Funciona Fixia?
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Transparencia líquida en cada paso. Nuestro proceso es simple, seguro y diseñado para
            garantizar resultados excepcionales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="glass-medium border-white/20 p-6 animate-fade-in">
              <CardContent className="p-0">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
                  <div className="text-white font-bold text-lg">{step.number}</div>
                </div>
                <step.icon className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <Card className="glass-strong border-white/20 p-12 text-center animate-fade-in max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="mb-6">
              <div className="glass-medium border-white/20 text-blue-400 mb-6 inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold">
                🚀 Únete a nuestra comunidad
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Únete a miles de profesionales y clientes que confían en Fixia para conectar, colaborar y crear proyectos excepcionales.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
              <Link href="/auth/registro">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 text-lg rounded-2xl transition-all duration-300 shadow-lg">
                  Buscar Profesionales
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/registro?type=provider">
                <Button size="lg" className="glass-medium border-white/20 text-white hover:glass-strong transition-all duration-300 px-10 py-4 text-lg rounded-2xl">
                  Ofrecer Servicios
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-white/60 text-sm">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-green-400 mr-2" />
                100% Seguro
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                Comunidad Verificada
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-400 mr-2" />
                Soporte 24/7
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="h-12 w-12 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">Fixia</span>
                <span className="text-sm text-white/60 -mt-1">Conecta. Confía. Resuelve.</span>
              </div>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed max-w-md">
              Marketplace de microservicios diseñado para conectar profesionales 
              altamente calificados con usuarios que necesitan soluciones efectivas.
            </p>
            <div className="text-white/60 text-sm">
              © 2025 Fixia. Todos los derechos reservados.
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Plataforma</h3>
            <div className="space-y-3">
              <Link href="/explorador/buscar-servicio" className="block text-white/80 hover:text-white transition-colors">
                Buscar Servicios
              </Link>
              <Link href="/como-funciona" className="block text-white/80 hover:text-white transition-colors">
                Cómo Funciona
              </Link>
              <Link href="/auth/registro?type=provider" className="block text-white/80 hover:text-white transition-colors">
                Únete como AS
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <div className="space-y-3">
              <Link href="/company/about" className="block text-white/80 hover:text-white transition-colors">
                Acerca de Nosotros
              </Link>
              <Link href="/company/contact" className="block text-white/80 hover:text-white transition-colors">
                Contacto
              </Link>
              <Link href="/company/security" className="block text-white/80 hover:text-white transition-colors">
                Seguridad
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <div className="space-y-3">
              <Link href="/legal/terms" className="block text-white/80 hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/legal/privacy" className="block text-white/80 hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/legal/updated-terms" className="block text-white/80 hover:text-white transition-colors">
                Términos Actualizados
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/60">
            Hecho con ❤️ para la comunidad de Chubut
          </p>
        </div>
      </div>
    </footer>
  );
}

function FeaturedProfessionals() {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-black/20 relative z-10">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Profesionales Destacados
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Profesionales reales, resultados concretos. Descubre a los mejores talentos 
            verificados y altamente calificados en nuestra plataforma.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProfessionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group">
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <FixiaAvatar
                      src={professional.image}
                      alt={professional.name}
                      fallbackText={professional.name}
                      size="xl"
                      variant="professional"
                      priority={false}
                      className="h-20 w-20 ring-4 ring-primary/20 ring-offset-4 ring-offset-background"
                    />
                    <Badge className="absolute -top-2 -right-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {professional.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg text-white">{professional.name}</CardTitle>
                  <CardDescription className="text-blue-400 font-medium">
                    {professional.specialty}
                  </CardDescription>
                  
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-white">{professional.rating}</span>
                    </div>
                    <span className="text-white/60 text-sm">
                      ({professional.reviews} reseñas)
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {professional.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="glass border-white/20 text-xs text-white/80">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span className="flex items-center space-x-1">
                      <Check className="h-4 w-4 text-green-400" />
                      <span>{professional.completedProjects} proyectos</span>
                    </span>
                    <span className="font-medium text-blue-400">{professional.price}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 liquid-gradient hover:opacity-90">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                    <Button size="sm" variant="outline" className="glass border-white/20 text-white hover:bg-white/10">
                      Ver Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/explorador/buscar-servicio">
            <Button variant="outline" className="glass border-white/20 hover:glass-medium group text-white">
              Ver Todos los Profesionales
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default HomePage;