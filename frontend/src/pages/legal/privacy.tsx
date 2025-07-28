import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Users, FileText, AlertTriangle, CheckCircle, CreditCard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const PrivacyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Política de Privacidad - Fixia</title>
        <meta name="description" content="Política de privacidad y protección de datos de Fixia" />
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
                <Badge className="glass-medium border-white/20 text-blue-400 mb-6 px-6 py-3 text-sm font-semibold">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacidad Digital
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Política de <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Privacidad</span>
              </h1>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Tu privacidad es fundamental. Conoce cómo protegemos, utilizamos y gestionamos tu información personal en nuestra plataforma.
              </p>
            </motion.div>

            {/* Content Cards */}
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Información General */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <Info className="mr-3 h-5 w-5 text-blue-400" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-4">
                    <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}</p>
                    <p>
                      En Fixia.com.ar respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
                      Esta política explica cómo recopilamos, utilizamos, almacenamos y protegemos tu información 
                      en cumplimiento con la Ley 25.326 de Protección de Datos Personales de Argentina y el 
                      Reglamento General de Protección de Datos (GDPR).
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
                <p>
                  En Fixia.com.ar respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
                  Esta política explica cómo recopilamos, utilizamos, almacenamos y protegemos tu información 
                  en cumplimiento con la Ley 25.326 de Protección de Datos Personales de Argentina y el 
                  Reglamento General de Protección de Datos (GDPR).
                </p>
              </section>

              {/* Responsable del Tratamiento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <FileText className="mr-3 h-5 w-5 text-green-400" />
                      1. Responsable del Tratamiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-4">
                    <div className="glass-medium border-blue-500/20 p-4 rounded-lg">
                      <p className="font-semibold text-blue-300 mb-3">
                        <strong>Fixia.com.ar</strong>
                      </p>
                      <ul className="space-y-2 text-blue-200">
                        <li>• Email: privacy@fixia.com.ar</li>
                        <li>• Dirección: [Dirección en Chubut, Argentina]</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Datos que Recopilamos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <Users className="mr-3 h-5 w-5 text-purple-400" />
                      2. Datos que Recopilamos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-6">
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-blue-400" />
                        2.1. Datos de Registro
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Nombre y apellido</p>
                        <p>• Fecha de nacimiento</p>
                        <p>• Localidad y dirección</p>
                        <p>• Teléfono y correo electrónico</p>
                        <p>• Documento Nacional de Identidad (DNI) y número de trámite</p>
                        <p>• Fotografía de perfil</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Users className="mr-2 h-5 w-5 text-green-400" />
                        2.2. Datos Profesionales (Solo AS)
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Profesión y especialización</p>
                        <p>• Número de matrícula profesional</p>
                        <p>• Años de experiencia</p>
                        <p>• Portafolio de trabajos</p>
                        <p>• Referencias personales</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-yellow-400" />
                        2.3. Datos de Verificación
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Fotografías del DNI (frente y dorso)</p>
                        <p>• Selfie sosteniendo el DNI</p>
                        <p>• Documentos de habilitación profesional</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Eye className="mr-2 h-5 w-5 text-cyan-400" />
                        2.4. Datos de Uso
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Historial de búsquedas</p>
                        <p>• Servicios contratados o prestados</p>
                        <p>• Mensajes y comunicaciones</p>
                        <p>• Calificaciones y reseñas</p>
                        <p>• Geolocalización (con tu consentimiento)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>


              {/* Seguridad Digital */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <Lock className="mr-3 h-5 w-5 text-green-400" />
                      3. Seguridad Digital y Protección
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-6">
                    <div className="glass-medium border-green-500/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-300 mb-2">Medidas de Seguridad Implementadas</h3>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-blue-400" />
                        3.1. Seguridad Técnica
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• <strong>Encriptación:</strong> Todos los datos se transmiten usando HTTPS/TLS</p>
                        <p>• <strong>Cifrado de base de datos:</strong> Información sensible encriptada en reposo</p>
                        <p>• <strong>Autenticación:</strong> Sistema de tokens JWT seguros</p>
                        <p>• <strong>Firewall:</strong> Protección contra accesos no autorizados</p>
                        <p>• <strong>Monitoreo:</strong> Supervisión 24/7 de actividades sospechosas</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-purple-400" />
                        3.2. Seguridad Organizacional
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Acceso limitado por roles y necesidad</p>
                        <p>• Auditorías regulares de seguridad</p>
                        <p>• Capacitación en protección de datos</p>
                        <p>• Protocolos de respuesta a incidentes</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-cyan-400" />
                        3.3. Almacenamiento Seguro
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Servidores en centros de datos certificados</p>
                        <p>• Respaldos automáticos encriptados</p>
                        <p>• Redundancia geográfica</p>
                        <p>• Eliminación segura de datos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* MercadoPago Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <CreditCard className="mr-3 h-5 w-5 text-green-400" />
                      4. Seguridad de Pagos con MercadoPago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-6">
                    <div className="glass-medium border-blue-500/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-300 mb-2">Protección en Transacciones</h3>
                      <p className="text-blue-200">
                        Fixia.com.ar utiliza MercadoPago como procesador de pagos, garantizando 
                        los más altos estándares de seguridad financiera.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                        4.1. Características de Seguridad
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• <strong>PCI DSS Compliance:</strong> Cumplimiento con estándares internacionales</p>
                        <p>• <strong>Tokenización:</strong> Los datos de tarjetas no se almacenan en nuestros servidores</p>
                        <p>• <strong>3D Secure:</strong> Autenticación adicional para mayor seguridad</p>
                        <p>• <strong>Monitoreo anti-fraude:</strong> Detección automática de transacciones sospechosas</p>
                        <p>• <strong>Certificación SSL:</strong> Comunicación segura en todos los pagos</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                        4.2. Información que NO Almacenamos
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Números de tarjetas de crédito/débito completos</p>
                        <p>• Códigos de seguridad (CVV)</p>
                        <p>• Datos bancarios completos</p>
                        <p>• PINs o contraseñas bancarias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA de Aceptación */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-center pt-8"
              >
                <div className="glass border-white/10 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    ¿Tienes preguntas sobre tu privacidad?
                  </h3>
                  <p className="text-white/70 mb-6">
                    Contáctanos para resolver cualquier duda sobre el manejo de tu información personal.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="mailto:privacy@fixia.com.ar">
                      <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                        Contactar Privacidad
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" className="glass border-white/20 text-white hover:bg-white/10">
                        Volver al Inicio
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60">
                      Esta política de privacidad es efectiva desde la fecha indicada arriba.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
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

export default PrivacyPage;