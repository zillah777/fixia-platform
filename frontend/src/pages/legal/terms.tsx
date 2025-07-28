import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Scale, AlertTriangle, Info, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const TermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Términos y Condiciones | Fixia</title>
        <meta name="description" content="Términos y condiciones de uso de la plataforma Fixia - Marketplace de servicios profesionales" />
        <meta name="keywords" content="términos, condiciones, legal, fixia, servicios" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background - Mismo estilo que homepage */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
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
                  <Scale className="mr-2 h-4 w-4" />
                  Términos Legales
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Términos y <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Condiciones</span>
              </h1>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Conoce los términos que rigen el uso de nuestra plataforma y los derechos de todos los usuarios.
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
                      Estos términos y condiciones regulan el uso de la plataforma Fixia.com.ar, 
                      un marketplace que conecta profesionales de servicios con usuarios que necesitan soluciones.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Naturaleza del Servicio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <FileText className="mr-3 h-5 w-5 text-green-400" />
                      1. Definiciones y Naturaleza del Servicio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-4">
                    <div className="glass-medium border-blue-500/20 p-4 rounded-lg">
                      <p className="font-semibold text-blue-300 mb-3">
                        FIXIA.COM.AR es una plataforma digital de intermediación que funciona como:
                      </p>
                      <ul className="space-y-2 text-blue-200">
                        <li>• Las páginas amarillas del futuro</li>
                        <li>• Los clasificados de la nueva era digital</li>
                        <li>• Un buscador y automatizador de búsqueda</li>
                        <li>• Un sistema de matchmaking entre oferentes y demandantes</li>
                        <li>• Un puente o nexo facilitador (NO responsable)</li>
                      </ul>
                    </div>
                    
                    <p>
                      Fixia.com.ar es comparable a "Uber de servicios" donde conectamos profesionales (AS - Ases) 
                      con exploradores (clientes) que buscan servicios, actuando únicamente como intermediario 
                      tecnológico sin participación directa en la prestación de servicios.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Exención de Responsabilidades */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <AlertTriangle className="mr-3 h-5 w-5 text-red-400" />
                      2. Exención de Responsabilidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-4">
                    <div className="glass-medium border-red-500/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-300 mb-2">IMPORTANTE: Limitaciones de Responsabilidad</h3>
                      <p className="text-red-200">
                        FIXIA.COM.AR NO SE HACE RESPONSABLE de ningún aspecto relacionado con los servicios 
                        prestados entre usuarios, incluyendo pero no limitándose a:
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="glass border-white/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">2.1. Responsabilidad Civil</h4>
                        <p className="text-sm">
                          No asumimos responsabilidad civil por daños, perjuicios, lesiones personales, 
                          daños materiales o cualquier tipo de pérdida.
                        </p>
                      </div>
                      
                      <div className="glass border-white/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">2.2. Calidad del Trabajo</h4>
                        <p className="text-sm">
                          La calidad, eficiencia y resultados del trabajo son responsabilidad 
                          exclusiva del profesional contratado.
                        </p>
                      </div>
                      
                      <div className="glass border-white/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">2.3. Pagos y Transacciones</h4>
                        <p className="text-sm">
                          Los acuerdos financieros son directamente entre usuario y profesional. 
                          No mediamos en disputas económicas.
                        </p>
                      </div>
                      
                      <div className="glass border-white/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">2.4. Verificación de Identidad</h4>
                        <p className="text-sm">
                          Aunque implementamos verificaciones básicas, cada usuario es responsable 
                          de validar la identidad y credenciales de quien contrata.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Derechos y Obligaciones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <Users className="mr-3 h-5 w-5 text-purple-400" />
                      3. Derechos y Obligaciones de los Usuarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-6">
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Users className="mr-2 h-5 w-5 text-blue-400" />
                        Para Clientes (Exploradores)
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Proporcionar información veraz sobre los servicios requeridos</p>
                        <p>• Tratar con respeto a los profesionales</p>
                        <p>• Cumplir con los acuerdos establecidos</p>
                        <p>• Reportar cualquier comportamiento inadecuado</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Briefcase className="mr-2 h-5 w-5 text-green-400" />
                        Para Profesionales (AS)
                      </h3>
                      <div className="glass border-white/10 p-4 rounded-lg space-y-2">
                        <p>• Mantener información de perfil actualizada y veraz</p>
                        <p>• Completar la verificación de identidad requerida</p>
                        <p>• Proporcionar servicios de calidad profesional</p>
                        <p>• Cumplir con todas las regulaciones locales aplicables</p>
                        <p>• Mantener seguros e implementar medidas de seguridad apropiadas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Políticas de Uso */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <Shield className="mr-3 h-5 w-5 text-yellow-400" />
                      4. Políticas de Uso y Prohibiciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-4">
                    <div className="glass-medium border-yellow-500/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-300 mb-3">Está Estrictamente Prohibido:</h4>
                      <ul className="space-y-2 text-yellow-200">
                        <li>• Usar la plataforma para actividades ilegales</li>
                        <li>• Publicar contenido ofensivo, discriminatorio o falso</li>
                        <li>• Intentar vulnerar la seguridad de la plataforma</li>
                        <li>• Usar información de otros usuarios con fines no autorizados</li>
                        <li>• Crear múltiples cuentas o perfiles falsos</li>
                      </ul>
                    </div>
                    
                    <p>
                      El incumplimiento de estas políticas puede resultar en la suspensión temporal 
                      o permanente de la cuenta del usuario.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Modificaciones y Contacto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <FileText className="mr-3 h-5 w-5 text-cyan-400" />
                      5. Modificaciones y Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-4">
                    <p>
                      Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                      Los cambios serán notificados a los usuarios registrados y publicados en esta página.
                    </p>
                    
                    <div className="glass border-white/10 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Contacto Legal</h4>
                      <p>Para consultas sobre estos términos:</p>
                      <p>• Email: legal@fixia.com.ar</p>
                      <p>• Teléfono: +54 9 280 XXX-XXXX</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA de Aceptación */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center pt-8"
              >
                <div className="glass border-white/10 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    ¿Aceptas estos términos?
                  </h3>
                  <p className="text-white/70 mb-6">
                    Al usar Fixia, confirmas que has leído y aceptas estos términos y condiciones.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/registro">
                      <Button className="liquid-gradient hover:opacity-90 transition-all duration-300">
                        Crear Cuenta en Fixia
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default TermsPage;