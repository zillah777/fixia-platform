import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Star, Shield, Zap, Users, ArrowRight, Play, Check, ChevronDown, MessageSquare, Clock, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const featuredProfessionals = [
  {
    id: "prof_1",
    name: "Ana Martínez",
    specialty: "Desarrollo Web Full Stack",
    rating: 5.0,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=120&h=120&fit=crop&crop=face",
    price: "Desde $50/hora",
    badge: "Top Rated",
    skills: ["React", "Node.js", "TypeScript"],
    completedProjects: 187
  },
  {
    id: "prof_2", 
    name: "Carlos Ruiz",
    specialty: "Diseño UI/UX",
    rating: 4.9,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    price: "Desde $40/hora",
    badge: "Pro",
    skills: ["Figma", "Adobe XD", "Sketch"],
    completedProjects: 156
  },
  {
    id: "prof_3",
    name: "María González",
    specialty: "Marketing Digital",
    rating: 4.8,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
    price: "Desde $35/hora",
    badge: "Especialista",
    skills: ["SEO", "Google Ads", "Analytics"],
    completedProjects: 143
  }
];

const serviceCategories = [
  {
    icon: "💻",
    title: "Desarrollo Web",
    description: "Aplicaciones y sitios web profesionales",
    count: "2,340+ servicios",
    popular: true
  },
  {
    icon: "🎨",
    title: "Diseño Gráfico",
    description: "Identidad visual y diseño creativo",
    count: "1,890+ servicios"
  },
  {
    icon: "📱",
    title: "Apps Móviles",
    description: "Desarrollo iOS y Android nativo",
    count: "1,230+ servicios"
  },
  {
    icon: "📈",
    title: "Marketing Digital",
    description: "SEO, SEM y estrategias de crecimiento",
    count: "980+ servicios"
  },
  {
    icon: "✍️",
    title: "Redacción",
    description: "Contenido y copywriting profesional",
    count: "756+ servicios"
  },
  {
    icon: "🎥",
    title: "Video & Animación",
    description: "Producción audiovisual y motion graphics",
    count: "654+ servicios"
  }
];

function Navigation() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/10"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div className="absolute -inset-1 liquid-gradient rounded-xl blur opacity-20 animate-pulse-slow"></div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight">Fixia</span>
            <span className="text-xs text-muted-foreground -mt-1">Conecta. Confía. Resuelve.</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/services" className="text-foreground/80 hover:text-foreground transition-colors">
            Buscar Servicios
          </Link>
          <Link to="/register?type=professional" className="text-foreground/80 hover:text-foreground transition-colors">
            Ofrecer Servicios
          </Link>
          <Link to="/services" className="text-foreground/80 hover:text-foreground transition-colors">
            Cómo Funciona
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="hover:glass-medium transition-all duration-300">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/register">
            <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
              Únete Gratis
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Badge className="glass-medium border-white/20 text-primary mb-6">
              🚀 La plataforma de servicios más confiable
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Conecta con los mejores profesionales
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Tu tiempo vale. Fixia lo cuida. Encuentra profesionales altamente calificados para 
            resolver tus necesidades con transparencia líquida y resultados garantizados.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <div className="flex glass rounded-2xl p-2 border-white/20">
                <div className="flex-1 flex items-center">
                  <Search className="h-5 w-5 text-muted-foreground ml-4 mr-3" />
                  <Input
                    placeholder="¿Qué servicio necesitas? Ej: Desarrollar una app móvil..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                  />
                </div>
                <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg px-8">
                  Buscar
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Check className="h-4 w-4 text-success" />
                <span>Más de 50,000 profesionales</span>
              </span>
              <span className="flex items-center space-x-1">
                <Check className="h-4 w-4 text-success" />
                <span>Pagos seguros</span>
              </span>
              <span className="flex items-center space-x-1">
                <Check className="h-4 w-4 text-success" />
                <span>Soporte 24/7</span>
              </span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {[
              { number: "50K+", label: "Profesionales" },
              { number: "98%", label: "Satisfacción" },
              { number: "24/7", label: "Soporte" },
              { number: "100K+", label: "Proyectos" }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-20 h-20 liquid-gradient rounded-full blur-xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
    </section>
  );
}

function FeaturedProfessionals() {
  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-black/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Profesionales Destacados
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
                    <Avatar className="h-20 w-20 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
                      <AvatarImage src={professional.image} alt={professional.name} />
                      <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -top-2 -right-2 bg-success/20 text-success border-success/30 text-xs">
                      {professional.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg">{professional.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {professional.specialty}
                  </CardDescription>
                  
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-warning fill-current" />
                      <span className="font-medium">{professional.rating}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      ({professional.reviews} reseñas)
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {professional.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="glass border-white/20 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Check className="h-4 w-4 text-success" />
                      <span>{professional.completedProjects} proyectos</span>
                    </span>
                    <span className="font-medium text-primary">{professional.price}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 liquid-gradient hover:opacity-90">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                    <Button size="sm" variant="outline" className="glass border-white/20">
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
          <Link to="/services">
            <Button variant="outline" className="glass border-white/20 hover:glass-medium group">
              Ver Todos los Profesionales
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCategories() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Explora Categorías de Servicios
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra exactamente lo que necesitas en nuestras categorías especializadas.
            Cada profesional está verificado y altamente calificado.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 group cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        {category.popular && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Busca y Conecta",
      description: "Encuentra profesionales verificados usando nuestros filtros inteligentes. Ve perfiles completos con portafolios y reseñas reales.",
      icon: Search
    },
    {
      step: "02", 
      title: "Comunícate y Cotiza",
      description: "Chatea directamente con profesionales, recibe cotizaciones personalizadas y programa videollamadas de consulta gratuitas.",
      icon: MessageSquare
    },
    {
      step: "03",
      title: "Paga de Forma Segura",
      description: "Realiza pagos seguros con protección de depósito. El profesional recibe el pago solo cuando estés completamente satisfecho.",
      icon: Shield
    },
    {
      step: "04",
      title: "Recibe y Evalúa",
      description: "Sigue el progreso en tiempo real, recibe entregas de calidad y evalúa el servicio para ayudar a otros usuarios.",
      icon: Star
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black/20 to-transparent">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Cómo Funciona Fixia?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparencia líquida en cada paso. Nuestro proceso es simple, 
            seguro y diseñado para garantizar resultados excepcionales.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 text-center h-full">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 relative">
                    <div className="h-16 w-16 liquid-gradient rounded-2xl flex items-center justify-center shadow-lg">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center bg-background border border-white/20 text-xs font-bold">
                      {step.step}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Card className="glass border-white/10 p-12">
            <div className="space-y-6">
              <Badge className="glass-medium border-white/20 text-primary">
                🚀 Únete a nuestra comunidad
              </Badge>
              
              <h2 className="text-3xl lg:text-4xl font-bold">
                ¿Listo para dar el siguiente paso?
              </h2>
              
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Únete a miles de profesionales y clientes que confían en Fixia 
                para conectar, colaborar y crear proyectos excepcionales.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link to="/register?type=client">
                  <Button size="lg" className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg">
                    Buscar Profesionales
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to="/register?type=professional">
                  <Button size="lg" variant="outline" className="glass border-white/20 hover:glass-medium">
                    Ofrecer Servicios
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center space-x-8 pt-6 text-sm text-muted-foreground">
                <span className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>100% Seguro</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Comunidad Verificada</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span>Soporte 24/7</span>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-16 border-t border-white/10"
    >
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 liquid-gradient rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <div className="font-semibold text-lg">Fixia</div>
                <div className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</div>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Marketplace de microservicios diseñado para conectar profesionales 
              altamente calificados con usuarios que necesitan soluciones efectivas.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-primary transition-colors">Buscar Servicios</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Ofrecer Servicios</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Cómo Funciona</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Precios</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Centro de Ayuda</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contacto</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Términos</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Privacidad</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 Fixia. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Profesionales reales, resultados concretos</span>
            <span>•</span>
            <span>Transparencia líquida</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturedProfessionals />
        <ServiceCategories />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}