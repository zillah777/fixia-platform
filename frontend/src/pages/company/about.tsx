import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Users, Zap, Heart, CheckCircle, Rocket, Search, Building, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Quiénes Somos - Fixia</title>
        <meta name="description" content="Conoce la historia y misión de Fixia, las páginas amarillas del futuro" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background - Mismo estilo que homepage */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/2 left-1/4 w-40 h-40 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/6 right-1/3 w-56 h-56 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '5s' }}></div>
        </div>

        {/* Header Navigation */}
        <Header />

        <div className="relative z-10 pt-32 pb-20">
          <div className="container mx-auto px-6">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Link
                href="/"
                className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </motion.div>

            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center mb-16"
            >
              <div className="mb-6">
                <Badge className="glass-medium border-white/20 text-blue-400 mb-6 px-6 py-3 text-sm font-semibold">
                  <Building className="mr-2 h-4 w-4" />
                  Acerca de Fixia
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Quiénes <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Somos</span>
              </h1>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Somos las páginas amarillas del futuro, los clasificados de la nueva era digital. 
                Conectamos profesionales con clientes de manera inteligente y moderna.
              </p>
            </motion.div>

            {/* Mission Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                        <Target className="mr-3 h-8 w-8 text-blue-400" />
                        Nuestra Misión
                      </h2>
                      <p className="text-lg text-white/80 mb-4">
                        Revolucionar la forma en que las personas encuentran y contratan servicios profesionales 
                        en Chubut, creando un ecosistema digital que beneficie tanto a profesionales como a clientes.
                      </p>
                      <p className="text-white/70">
                        Somos el puente que conecta talento con necesidad, facilitando encuentros que 
                        generan valor y confianza en nuestra comunidad.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="relative">
                        <div className="liquid-gradient rounded-full w-48 h-48 mx-auto flex items-center justify-center shadow-2xl">
                          <Rocket className="h-20 w-20 text-white" />
                        </div>
                        <div className="absolute -inset-4 liquid-gradient rounded-full blur opacity-20 animate-pulse-slow"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* What We Are Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid md:grid-cols-2 gap-8 mb-12"
            >
              <Card className="glass border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <Search className="mr-3 h-6 w-6 text-blue-400" />
                    ¿Qué es Fixia?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="glass border-white/10 p-3 rounded-lg flex items-center">
                    <Building className="text-blue-400 mr-3 h-5 w-5" />
                    <span className="text-white/80">Las páginas amarillas del futuro</span>
                  </div>
                  <div className="glass border-white/10 p-3 rounded-lg flex items-center">
                    <Search className="text-blue-400 mr-3 h-5 w-5" />
                    <span className="text-white/80">Un buscador inteligente de servicios</span>
                  </div>
                  <div className="glass border-white/10 p-3 rounded-lg flex items-center">
                    <Users className="text-blue-400 mr-3 h-5 w-5" />
                    <span className="text-white/80">Un sistema de matchmaking profesional</span>
                  </div>
                  <div className="glass border-white/10 p-3 rounded-lg flex items-center">
                    <Target className="text-blue-400 mr-3 h-5 w-5" />
                    <span className="text-white/80">Un puente entre oferentes y demandantes</span>
                  </div>
                  <div className="glass border-white/10 p-3 rounded-lg flex items-center">
                    <Zap className="text-blue-400 mr-3 h-5 w-5" />
                    <span className="text-white/80">El "Uber" de los servicios profesionales</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <Star className="mr-3 h-6 w-6 text-purple-400" />
                    Nuestro Enfoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="glass border-white/10 p-4 rounded-lg">
                    <p className="text-white/80">
                      <strong className="text-purple-300">Simplicidad:</strong> Encontrar un profesional debe ser tan fácil como pedir un taxi.
                    </p>
                  </div>
                  <div className="glass border-white/10 p-4 rounded-lg">
                    <p className="text-white/80">
                      <strong className="text-purple-300">Confianza:</strong> Verificamos identidades y fomentamos un sistema de reseñas transparente.
                    </p>
                  </div>
                  <div className="glass border-white/10 p-4 rounded-lg">
                    <p className="text-white/80">
                      <strong className="text-purple-300">Velocidad:</strong> Los clientes llegan a ti mil veces más rápido que en métodos tradicionales.
                    </p>
                  </div>
                  <div className="glass border-white/10 p-4 rounded-lg">
                    <p className="text-white/80">
                      <strong className="text-purple-300">Justicia:</strong> No cobramos comisiones. El dinero va directamente al profesional.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardHeader>
                  <CardTitle className="text-3xl text-white text-center flex items-center justify-center">
                    <Zap className="mr-3 h-8 w-8 text-yellow-400" />
                    ¿Cómo Funciona?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center glass border-white/10 p-6 rounded-lg">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Para Profesionales (AS)</h3>
                      <p className="text-white/70">
                        Registrate, verifica tu identidad, crea tu perfil profesional y recibe solicitudes 
                        de clientes automáticamente.
                      </p>
                    </div>
                    <div className="text-center glass border-white/10 p-6 rounded-lg">
                      <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Search className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Para Clientes (Exploradores)</h3>
                      <p className="text-white/70">
                        Busca el servicio que necesitas, compara profesionales verificados y contrata 
                        directamente con quien más te convenga.
                      </p>
                    </div>
                    <div className="text-center glass border-white/10 p-6 rounded-lg">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Conexión Instantánea</h3>
                      <p className="text-white/70">
                        Nuestro algoritmo inteligente conecta automáticamente la demanda con la oferta 
                        más adecuada en tiempo real.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Why Choose Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardHeader>
                  <CardTitle className="text-3xl text-white text-center flex items-center justify-center">
                    <Award className="mr-3 h-8 w-8 text-yellow-400" />
                    ¿Por Qué Elegir Fixia?
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass border-white/10 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                        <Users className="mr-2 h-5 w-5 text-green-400" />
                        Para Profesionales
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-green-400 mr-2 h-4 w-4" />
                          Sin comisiones sobre tus servicios
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-green-400 mr-2 h-4 w-4" />
                          Mayor visibilidad que Facebook o clasificados tradicionales
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-green-400 mr-2 h-4 w-4" />
                          Sistema de verificación que genera confianza
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-green-400 mr-2 h-4 w-4" />
                          Herramientas profesionales de gestión
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-green-400 mr-2 h-4 w-4" />
                          Ranking que premia la calidad
                        </li>
                      </ul>
                    </div>
                    <div className="glass border-white/10 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                        <Search className="mr-2 h-5 w-5 text-blue-400" />
                        Para Clientes
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-blue-400 mr-2 h-4 w-4" />
                          Profesionales verificados y calificados
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-blue-400 mr-2 h-4 w-4" />
                          Comparación transparente de servicios
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-blue-400 mr-2 h-4 w-4" />
                          Sistema de reseñas confiable
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-blue-400 mr-2 h-4 w-4" />
                          Búsqueda inteligente por ubicación
                        </li>
                        <li className="flex items-center text-white/80">
                          <CheckCircle className="text-blue-400 mr-2 h-4 w-4" />
                          Chat directo con profesionales
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Our Values */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardHeader>
                  <CardTitle className="text-3xl text-white text-center flex items-center justify-center">
                    <Heart className="mr-3 h-8 w-8 text-red-400" />
                    Nuestros Valores
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center glass border-white/10 p-4 rounded-lg">
                      <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 text-white">Confianza</h3>
                      <p className="text-sm text-white/70">Construimos relaciones basadas en transparencia y verificación</p>
                    </div>
                    <div className="text-center glass border-white/10 p-4 rounded-lg">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 text-white">Innovación</h3>
                      <p className="text-sm text-white/70">Utilizamos tecnología de vanguardia para conectar personas</p>
                    </div>
                    <div className="text-center glass border-white/10 p-4 rounded-lg">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 text-white">Precisión</h3>
                      <p className="text-sm text-white/70">Conectamos exactamente lo que necesitas con quien lo puede hacer</p>
                    </div>
                    <div className="text-center glass border-white/10 p-4 rounded-lg">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <Rocket className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2 text-white">Crecimiento</h3>
                      <p className="text-sm text-white/70">Apoyamos el crecimiento de profesionales y empresas locales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Section - Nuestro Compromiso */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardHeader>
                  <CardTitle className="text-3xl text-white text-center flex items-center justify-center">
                    <Heart className="mr-3 h-8 w-8 text-red-400" />
                    Nuestro Compromiso
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="max-w-4xl mx-auto text-center">
                    <p className="text-lg text-white/80 mb-6">
                      En Fixia creemos que cada profesional merece una oportunidad justa de mostrar su talento, 
                      y cada cliente merece acceso a servicios de calidad con total transparencia.
                    </p>
                    <p className="text-white/70 mb-6">
                      Somos un equipo apasionado por la tecnología y comprometido con el desarrollo económico 
                      local de Chubut. Trabajamos incansablemente para que nuestra plataforma sea la herramienta 
                      que impulse el crecimiento de profesionales y la satisfacción de clientes.
                    </p>
                    <div className="glass-medium border-white/20 p-6 rounded-lg inline-block">
                      <p className="text-sm text-white/60 italic mb-2">
                        "No somos solo una app, somos el futuro de cómo las personas se conectan para crear valor juntas"
                      </p>
                      <p className="text-sm font-semibold text-white mt-2">- Equipo Fixia</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center"
            >
              <div className="glass border-white/10 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">
                  ¿Listo para formar parte del futuro?
                </h2>
                <p className="text-white/70 mb-8">
                  Únete a miles de profesionales y clientes que ya confían en Fixia
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/registro?type=provider">
                    <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                      Registrarse como Profesional
                    </Button>
                  </Link>
                  <Link href="/explorador/buscar-servicio">
                    <Button variant="outline" className="glass border-white/20 text-white hover:bg-white/10">
                      Buscar Servicios
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

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
            <Link href="/como-funciona" className="text-foreground/80 hover:text-foreground transition-colors">
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AboutPage;