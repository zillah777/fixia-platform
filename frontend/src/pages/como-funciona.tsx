import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  CheckCircle, 
  Star, 
  Users, 
  Briefcase, 
  Shield, 
  Clock, 
  ArrowRight,
  User,
  CreditCard,
  Award,
  Smartphone,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const ComoFunciona: NextPage = () => {
  const { isAuthenticated } = useAuth();

  const stepsCientes = [
    {
      number: 1,
      title: "Busca el Servicio",
      description: "Explora categorías o usa nuestra búsqueda inteligente para encontrar exactamente lo que necesitas.",
      icon: <Search className="h-8 w-8" />,
      color: "blue"
    },
    {
      number: 2,
      title: "Elige tu Profesional",
      description: "Compara perfiles, lee reseñas y selecciona al AS (Agente de Servicios) perfecto para tu proyecto.",
      icon: <Users className="h-8 w-8" />,
      color: "green"
    },
    {
      number: 3,
      title: "Conecta y Acuerda",
      description: "Chatea directamente, define detalles del trabajo y acuerda términos transparentes.",
      icon: <MessageSquare className="h-8 w-8" />,
      color: "purple"
    },
    {
      number: 4,
      title: "Evalúa la Experiencia",
      description: "Recibe tu servicio completado, califica al profesional y contribuye a la comunidad de confianza.",
      icon: <Star className="h-8 w-8" />,
      color: "emerald"
    }
  ];

  const stepsProfesionales = [
    {
      number: 1,
      title: "Crea tu Perfil AS",
      description: "Regístrate como Agente de Servicios, completa tu información y verifica tus credenciales.",
      icon: <User className="h-8 w-8" />,
      color: "blue"
    },
    {
      number: 2,
      title: "Destaca tus Servicios",
      description: "Publica tus especialidades, establece precios y muestra tu portafolio de trabajos.",
      icon: <Briefcase className="h-8 w-8" />,
      color: "green"
    },
    {
      number: 3,
      title: "Recibe Solicitudes",
      description: "Los clientes te encontrarán y contactarán para proyectos que coincidan con tu expertise.",
      icon: <Smartphone className="h-8 w-8" />,
      color: "purple"
    },
    {
      number: 4,
      title: "Construye Reputación",
      description: "Completa el trabajo, recibe reseñas positivas y construye tu reputación profesional verificada.",
      icon: <Award className="h-8 w-8" />,
      color: "emerald"
    }
  ];

  const beneficios = [
    {
      title: "Verificación Total",
      description: "Todos los AS pasan por un proceso de verificación riguroso para garantizar calidad y confianza.",
      icon: <Shield className="h-6 w-6" />,
      color: "blue"
    },
    {
      title: "Comunicación Directa",
      description: "Chat integrado que conecta profesionales y clientes para coordinar detalles y acuerdos transparentes.",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "green"
    },
    {
      title: "Soporte 24/7",
      description: "Nuestro equipo está disponible para ayudarte en cualquier momento durante el proceso.",
      icon: <Clock className="h-6 w-6" />,
      color: "purple"
    },
    {
      title: "Red de Confianza",
      description: "Sistema de reseñas bidireccional que construye una comunidad basada en confianza mutua y transparencia.",
      icon: <Star className="h-6 w-6" />,
      color: "yellow"
    }
  ];

  return (
    <>
      <Head>
        <title>Cómo Funciona | Fixia</title>
        <meta name="description" content="Descubre cómo funciona Fixia, la plataforma que conecta clientes con profesionales verificados de servicios en Chubut." />
        <meta name="keywords" content="como funciona fixia, proceso servicios, profesionales verificados, plataforma servicios" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background - Mismo estilo que homepage */}
        <div className="absolute inset-0 bg-background">
          {/* Orbe superior izquierdo */}
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          
          {/* Orbe inferior derecho */}
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          
          {/* Orbe medio centro */}
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
          
          {/* Orbe inferior centro */}
          <div className="absolute bottom-10 left-1/3 w-52 h-52 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-3xl opacity-16 animate-float" style={{ animationDelay: '5s' }}></div>
        </div>

        {/* Header Navigation */}
        <Header />

        {/* Hero Section */}
        <section className="pt-32 pb-20 relative z-10">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8">
                <div className="glass-medium border-white/20 text-blue-400 mb-6 inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold">
                  ✓ Proceso simple y transparente
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Cómo Funciona
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Fixia</span>
              </h1>

              <p className="text-xl lg:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                Conectamos clientes con profesionales verificados en un proceso simple, 
                seguro y transparente. Descubre cómo obtener el servicio perfecto.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Para Clientes Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Para <span className="text-blue-400">Clientes</span>
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Encuentra y contrata profesionales verificados en 4 pasos simples
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stepsCientes.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full">
                    <CardHeader className="text-center">
                      <div className={`mx-auto mb-4 p-4 rounded-2xl bg-${step.color}-500/20 text-${step.color}-400 w-fit`}>
                        {step.icon}
                      </div>
                      <div className="flex items-center justify-center mb-2">
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          Paso {step.number}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/70 text-center">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Para Profesionales Section */}
        <section className="py-20 bg-gradient-to-b from-transparent to-black/20 relative z-10">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Para <span className="text-green-400">Profesionales</span>
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Únete como Agente de Servicios (AS) y haz crecer tu negocio
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stepsProfesionales.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full">
                    <CardHeader className="text-center">
                      <div className={`mx-auto mb-4 p-4 rounded-2xl bg-${step.color}-500/20 text-${step.color}-400 w-fit`}>
                        {step.icon}
                      </div>
                      <div className="flex items-center justify-center mb-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Paso {step.number}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/70 text-center">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                ¿Por qué elegir <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Fixia</span>?
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                La plataforma más confiable para servicios profesionales en Chubut
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {beneficios.map((beneficio, index) => (
                <motion.div
                  key={beneficio.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass hover:glass-medium transition-all duration-300 border-white/10 h-full text-center">
                    <CardHeader>
                      <div className={`mx-auto mb-4 p-3 rounded-xl bg-${beneficio.color}-500/20 text-${beneficio.color}-400 w-fit`}>
                        {beneficio.icon}
                      </div>
                      <CardTitle className="text-lg text-white">{beneficio.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/70">
                        {beneficio.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
                ¿Listo para empezar?
              </h2>
              <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                Únete a miles de usuarios que ya confían en Fixia para sus necesidades de servicios
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/explorador/buscar-servicio">
                  <Button className="liquid-gradient hover:opacity-90 transition-all duration-300 shadow-lg text-lg px-8 py-6">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Servicios
                  </Button>
                </Link>
                
                <Link href="/auth/registro?type=provider">
                  <Button variant="outline" className="glass border-white/20 hover:glass-medium text-white text-lg px-8 py-6">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Únete como AS
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

// Header component - Reuse from main page
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
            <Link href="/como-funciona" className="text-foreground hover:text-foreground transition-colors font-medium">
              Cómo Funciona
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-white/80">Hola, {user?.first_name}</span>
                <Link href={user?.user_type === 'provider' ? '/as/dashboard' : '/explorador/dashboard'}>
                  <Button className="liquid-gradient">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="glass border-white/20 text-white hover:bg-white/10">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/registro">
                  <Button className="liquid-gradient">
                    Registrarse
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

// Footer component - Reuse from main page
function Footer() {
  return (
    <footer className="relative py-16 border-t border-white/10 z-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ComoFunciona;