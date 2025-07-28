import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, CheckCircle, CreditCard, Eye, Users, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const SecurityPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Seguridad y Protección - Fixia</title>
        <meta name="description" content="Conoce las medidas de seguridad digital, protección de datos y pagos seguros en Fixia" />
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
              className="text-center mb-12"
            >
              <div className="mb-6">
                <Badge className="glass-medium border-white/20 text-green-400 mb-6 px-6 py-3 text-sm font-semibold">
                  <Shield className="mr-2 h-4 w-4" />
                  Seguridad Digital
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Seguridad y <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Protección</span>
              </h1>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Tu seguridad es nuestra prioridad. Conoce todas las medidas que implementamos para proteger tu información y garantizar transacciones seguras.
              </p>
            </motion.div>

            {/* Security Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-8 mb-12"
            >
              <Card className="glass border-white/10 shadow-2xl text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 liquid-gradient rounded-full">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Encriptación Total</h3>
                  <p className="text-white/70">Todos los datos se transmiten con encriptación SSL/TLS de grado militar</p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 shadow-2xl text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Verificación de Identidad</h3>
                  <p className="text-white/70">Sistema robusto de verificación con DNI y selfie para mayor confianza</p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 shadow-2xl text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Pagos Seguros</h3>
                  <p className="text-white/70">Integración con MercadoPago para transacciones 100% seguras</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Digital Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardHeader>
                  <CardTitle className="text-3xl text-white flex items-center">
                    <Shield className="mr-3 h-8 w-8 text-blue-400" />
                    Seguridad Digital
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                        <Lock className="mr-2 h-6 w-6 text-blue-400" />
                        Protección de Datos
                      </h3>
                      <div className="space-y-4">
                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-green-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Encriptación AES-256</h4>
                              <p className="text-white/70 text-sm">Todos los datos sensibles se almacenan con encriptación de grado militar</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-green-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">HTTPS/TLS 1.3</h4>
                              <p className="text-white/70 text-sm">Comunicación segura en toda la plataforma con el protocolo más avanzado</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-green-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Tokens JWT Seguros</h4>
                              <p className="text-white/70 text-sm">Autenticación basada en tokens con expiración automática</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-green-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Respaldos Automáticos</h4>
                              <p className="text-white/70 text-sm">Copias de seguridad diarias con redundancia geográfica</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                        <Shield className="mr-2 h-6 w-6 text-purple-400" />
                        Protección Perimetral
                      </h3>
                      <div className="space-y-4">
                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-purple-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <Shield className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Firewall Avanzado</h4>
                              <p className="text-white/70 text-sm">Protección contra ataques DDoS y accesos no autorizados</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-purple-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <Eye className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Monitoreo 24/7</h4>
                              <p className="text-white/70 text-sm">Supervisión continua de la infraestructura y detección de amenazas</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-purple-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <AlertTriangle className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Rate Limiting</h4>
                              <p className="text-white/70 text-sm">Protección contra ataques de fuerza bruta y spam</p>
                            </div>
                          </div>
                        </div>

                        <div className="glass border-white/10 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="bg-purple-500/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                              <FileText className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">Auditorías de Seguridad</h4>
                              <p className="text-white/70 text-sm">Evaluaciones regulares por expertos en ciberseguridad</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MercadoPago Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h2 className="text-3xl font-bold mb-6 text-white flex items-center">
                        <CreditCard className="mr-3 h-8 w-8 text-green-400" />
                        Seguridad de Pagos con MercadoPago
                      </h2>
                      <p className="text-white/70 mb-6">
                        Utilizamos MercadoPago, una de las plataformas de pago más seguras de América Latina, 
                        para garantizar que todas tus transacciones sean 100% seguras.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center glass-light border-white/10 p-3 rounded-lg">
                          <CheckCircle className="text-yellow-400 mr-3 h-5 w-5" />
                          <span className="text-white">Certificación PCI DSS Level 1</span>
                        </div>
                        <div className="flex items-center glass-light border-white/10 p-3 rounded-lg">
                          <Lock className="text-yellow-400 mr-3 h-5 w-5" />
                          <span className="text-white">Encriptación SSL de 256 bits</span>
                        </div>
                        <div className="flex items-center glass-light border-white/10 p-3 rounded-lg">
                          <Shield className="text-yellow-400 mr-3 h-5 w-5" />
                          <span className="text-white">Protección anti-fraude avanzada</span>
                        </div>
                        <div className="flex items-center glass-light border-white/10 p-3 rounded-lg">
                          <FileText className="text-yellow-400 mr-3 h-5 w-5" />
                          <span className="text-white">Cumplimiento con normativas internacionales</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-medium border-white/20 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 text-white">Lo que NO almacenamos:</h3>
                      <ul className="space-y-2 text-white/70">
                        <li className="flex items-center">
                          <AlertTriangle className="text-red-400 mr-2 h-4 w-4" />
                          Números de tarjeta completos
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="text-red-400 mr-2 h-4 w-4" />
                          Códigos CVV/CVC
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="text-red-400 mr-2 h-4 w-4" />
                          Datos bancarios sensibles
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="text-red-400 mr-2 h-4 w-4" />
                          PINs o contraseñas bancarias
                        </li>
                      </ul>
                      <p className="text-sm text-white/60 mt-4">
                        Toda la información sensible de pagos se procesa directamente 
                        en los servidores seguros de MercadoPago.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Identity Verification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="glass border-white/10 shadow-2xl mb-12">
                <CardHeader>
                  <CardTitle className="text-3xl text-white flex items-center">
                    <Users className="mr-3 h-8 w-8 text-orange-400" />
                    Sistema de Verificación de Identidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center glass border-white/10 p-6 rounded-lg">
                      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <FileText className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Verificación de DNI</h3>
                      <p className="text-white/70">
                        Los profesionales deben subir fotos del DNI (frente y dorso) 
                        para verificar su identidad real.
                      </p>
                    </div>

                    <div className="text-center glass border-white/10 p-6 rounded-lg">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Selfie con DNI</h3>
                      <p className="text-white/70">
                        Selfie sosteniendo el DNI para confirmar que la persona 
                        corresponde al documento presentado.
                      </p>
                    </div>

                    <div className="text-center glass border-white/10 p-6 rounded-lg">
                      <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Revisión Manual</h3>
                      <p className="text-white/70">
                        Nuestro equipo revisa manualmente cada solicitud 
                        de verificación para garantizar autenticidad.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 glass-medium border-green-500/20 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-300 mb-4 flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Beneficios de la Verificación
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-green-200">
                      <div className="space-y-2">
                        <p className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                          Mayor confianza de los clientes
                        </p>
                        <p className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                          Badge de verificación visible
                        </p>
                        <p className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                          Mayor ranking en búsquedas
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                          Acceso a funciones premium
                        </p>
                        <p className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                          Protección contra perfiles falsos
                        </p>
                        <p className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                          Respaldo legal en disputas
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center pt-8"
            >
              <div className="glass border-white/10 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  ¿Listo para unirte a Fixia de forma segura?
                </h3>
                <p className="text-white/70 mb-6">
                  Explora nuestra plataforma con la tranquilidad de saber que tu información está completamente protegida.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/registro">
                    <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                      Crear Cuenta Segura
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="glass border-white/20 text-white hover:bg-white/10">
                      Volver al Inicio
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
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <div className="space-y-3">
              <Link href="/legal/terms" className="block text-white/80 hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/legal/privacy" className="block text-white/80 hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/company/security" className="block text-white/80 hover:text-white transition-colors">
                Seguridad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SecurityPage;