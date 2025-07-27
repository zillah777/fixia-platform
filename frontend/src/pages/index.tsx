import { useState } from "react";
import { NextPage } from 'next';
import Head from 'next/head';
import Link from "next/link";
import { useRouter } from 'next/router';
import { Search, Star, Shield, Zap, Users, ArrowRight, Play, Check, ChevronDown, MessageSquare, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

const featuredProfessionals = [
  {
    id: "prof_1",
    name: "Carlos Rodríguez",
    specialty: "Plomería Especializada",
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    price: "Desde $3,000/trabajo",
    badge: "Top Rated",
    skills: ["Instalaciones", "Reparaciones", "Emergencias"],
    completedProjects: 187,
    location: "Comodoro Rivadavia"
  },
  {
    id: "prof_2", 
    name: "Ana Martínez",
    specialty: "Electricidad Residencial",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
    price: "Desde $2,500/trabajo",
    badge: "Pro",
    skills: ["Instalaciones", "Tableros", "Iluminación"],
    completedProjects: 156,
    location: "Puerto Madryn"
  },
  {
    id: "prof_3",
    name: "Roberto Silva",
    specialty: "Carpintería Premium",
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    price: "Desde $4,000/trabajo",
    badge: "Especialista",
    skills: ["Muebles", "Renovaciones", "Diseño"],
    completedProjects: 143,
    location: "Trelew"
  }
];

const serviceCategories = [
  {
    id: "plomeria",
    name: "Plomería",
    icon: "🔧",
    description: "Instalaciones y reparaciones",
    professionals: 45
  },
  {
    id: "electricidad", 
    name: "Electricidad",
    icon: "⚡",
    description: "Instalaciones eléctricas",
    professionals: 38
  },
  {
    id: "carpinteria",
    name: "Carpintería", 
    icon: "🪚",
    description: "Muebles y estructuras",
    professionals: 32
  },
  {
    id: "albañileria",
    name: "Albañilería",
    icon: "🧱", 
    description: "Construcción y reparación",
    professionals: 41
  },
  {
    id: "pintura",
    name: "Pintura",
    icon: "🎨",
    description: "Pintura y decoración", 
    professionals: 29
  },
  {
    id: "jardineria",
    name: "Jardinería",
    icon: "🌱",
    description: "Diseño y mantenimiento",
    professionals: 24
  },
  {
    id: "limpieza",
    name: "Limpieza",
    icon: "🧽",
    description: "Limpieza profesional",
    professionals: 52
  },
  {
    id: "electrodomesticos", 
    name: "Electrodomésticos",
    icon: "🔌",
    description: "Reparación y mantenimiento",
    professionals: 19
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

      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl" />
        </div>

        {/* Navigation Header */}
        <Header />

        {/* Hero Section */}
        <HeroSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Professionals */}
        <FeaturedProfessionals />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Testimonials */}
        <TestimonialsSection />

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
            <div className="w-10 h-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-white">Fixia</span>
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
            <div className="glass-medium border-white/20 text-primary mb-6 inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold">
              🚀 La plataforma de servicios más confiable de Chubut
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Conectamos <span className="liquid-gradient bg-clip-text text-transparent">Profesionales</span>
            <br />
            con Clientes en Chubut
          </h1>

          <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Encuentra los mejores AS certificados para tus proyectos o conecta con clientes que necesitan tus servicios. 
            Plataforma confiable y segura para toda la provincia.
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

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/auth/registro">
              <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8 py-4 text-lg">
                <Users className="mr-2 h-5 w-5" />
                Buscar Profesionales
              </Button>
            </Link>
            <Link href="/auth/registro?type=provider">
              <Button size="lg" className="glass-strong border-white/20 text-white hover:glass-medium transition-all duration-300 px-8 py-4 text-lg">
                <Star className="mr-2 h-5 w-5" />
                Ofrecer Servicios
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Profesionales Activos",
      description: "AS certificados en Chubut"
    },
    {
      icon: Check,
      value: "2,450+", 
      label: "Trabajos Completados",
      description: "Con garantía de calidad"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Calificación Promedio",
      description: "Según nuestros clientes"
    },
    {
      icon: Shield,
      value: "100%",
      label: "Verificados",
      description: "Todos los AS son verificados"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-medium border-white/20 text-center p-6 animate-fade-in">
              <CardContent className="p-0">
                <div className="w-16 h-16 liquid-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white font-semibold mb-1">{stat.label}</div>
                <div className="text-white/60 text-sm">{stat.description}</div>
              </CardContent>
            </Card>
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
            Servicios <span className="liquid-gradient bg-clip-text text-transparent">Disponibles</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Encuentra profesionales certificados en todas las categorías que necesitas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {serviceCategories.map((category) => (
            <Card 
              key={category.id} 
              className="glass-medium border-white/20 hover:glass-strong transition-all duration-300 cursor-pointer transform hover:scale-105 animate-fade-in"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-white font-semibold mb-2">{category.name}</h3>
                <p className="text-white/60 text-sm mb-3">{category.description}</p>
                <div className="text-primary text-sm font-semibold">
                  {category.professionals} profesionales
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProfessionals() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Profesionales <span className="liquid-gradient bg-clip-text text-transparent">Destacados</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Conoce a algunos de nuestros AS mejor calificados
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredProfessionals.map((professional) => (
            <Card key={professional.id} className="glass-medium border-white/20 hover:glass-strong transition-all duration-300 transform hover:scale-105 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={professional.image} 
                    alt={professional.name}
                    className="w-16 h-16 rounded-2xl object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{professional.name}</h3>
                    <p className="text-white/60">{professional.specialty}</p>
                    <p className="text-white/60 text-sm">{professional.location}</p>
                  </div>
                  <div className="glass-strong border-white/20 px-3 py-1 rounded-full text-primary text-sm font-semibold">
                    {professional.badge}
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-white ml-2 font-semibold">{professional.rating}</span>
                    <span className="text-white/60 ml-1">({professional.reviews} reseñas)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {professional.skills.map((skill) => (
                    <span key={skill} className="glass-strong border-white/20 px-3 py-1 rounded-full text-white/80 text-sm">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-sm">
                    {professional.completedProjects} trabajos completados
                  </div>
                  <div className="text-primary font-semibold">
                    {professional.price}
                  </div>
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
      icon: Search,
      title: "Busca el Servicio",
      description: "Describe lo que necesitas y explora profesionales en tu zona"
    },
    {
      icon: MessageSquare,
      title: "Conecta y Negocia", 
      description: "Chatea directamente con los AS y negocia precios y tiempos"
    },
    {
      icon: Check,
      title: "Recibe el Servicio",
      description: "Disfruta de un servicio profesional y califica tu experiencia"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Cómo <span className="liquid-gradient bg-clip-text text-transparent">Funciona?</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Conectarte con profesionales nunca fue tan fácil
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="glass-medium border-white/20 text-center p-8 animate-fade-in">
              <CardContent className="p-0">
                <div className="w-20 h-20 liquid-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-white/80 leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "María González",
      role: "Cliente",
      content: "Encontré un electricista excelente en menos de 2 horas. El trabajo quedó perfecto y a un precio justo.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Carlos Ruiz",
      role: "AS Profesional",
      content: "Como plomero, Fixia me ha permitido llegar a más clientes y generar más ingresos. Totalmente recomendado.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Ana López",
      role: "Cliente",
      content: "La calidad de los profesionales es excelente. Todos verificados y muy responsables.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Lo que Dicen <span className="liquid-gradient bg-clip-text text-transparent">Nuestros Usuarios</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="glass-medium border-white/20 p-6 animate-fade-in">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-white/90 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-xl object-cover mr-4"
                  />
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-white/60 text-sm">{testimonial.role}</div>
                  </div>
                </div>
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
        <Card className="glass-strong border-white/20 p-12 text-center animate-fade-in">
          <CardContent className="p-0 max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para <span className="liquid-gradient bg-clip-text text-transparent">Comenzar?</span>
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Únete a la plataforma de servicios más confiable de Chubut y conecta con profesionales verificados.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/auth/registro">
                <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-10 py-4 text-lg">
                  <Users className="mr-2 h-6 w-6" />
                  Buscar Profesionales
                </Button>
              </Link>
              <Link href="/auth/registro?type=provider">
                <Button size="lg" className="glass-medium border-white/20 text-white hover:glass-strong transition-all duration-300 px-10 py-4 text-lg">
                  <Star className="mr-2 h-6 w-6" />
                  Ofrecer Mis Servicios
                </Button>
              </Link>
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
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-3xl font-bold text-white">Fixia</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed max-w-md">
              La plataforma líder en Chubut para conectar profesionales de servicios con clientes. 
              Confiable, segura y verificada.
            </p>
            <div className="text-white/60 text-sm">
              © 2025 Fixia. Todos los derechos reservados.
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Para Clientes</h3>
            <div className="space-y-3">
              <Link href="/explorador/buscar-servicio" className="block text-white/80 hover:text-white transition-colors">
                Buscar Servicios
              </Link>
              <Link href="/como-funciona" className="block text-white/80 hover:text-white transition-colors">
                Cómo Funciona
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Para Profesionales</h3>
            <div className="space-y-3">
              <Link href="/auth/registro?type=provider" className="block text-white/80 hover:text-white transition-colors">
                Únete como AS
              </Link>
              <Link href="/recursos" className="block text-white/80 hover:text-white transition-colors">
                Recursos
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

export default HomePage;