import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Shield, Scale, Lock, AlertTriangle, CheckCircle, Send, HelpCircle, Book, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

const ContactPage: NextPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would normally send to your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        userType: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contacto - Fixia</title>
        <meta name="description" content="Contáctanos para cualquier consulta sobre Fixia" />
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
                  <Mail className="mr-2 h-4 w-4" />
                  Contacto
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Contáctanos <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Ahora</span>
              </h1>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte. 
                Contáctanos y te responderemos lo antes posible.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <Card className="glass border-white/10 shadow-2xl mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <Mail className="mr-3 h-6 w-6 text-blue-400" />
                      Información de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="glass border-white/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg p-2 mr-4">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Email General</h3>
                          <p className="text-white/70">info@fixia.com.ar</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass border-white/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg p-2 mr-4">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Soporte Técnico</h3>
                          <p className="text-white/70">soporte@fixia.com.ar</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass border-white/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-2 mr-4">
                          <Scale className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Asuntos Legales</h3>
                          <p className="text-white/70">legal@fixia.com.ar</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass border-white/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-2 mr-4">
                          <Lock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Privacidad</h3>
                          <p className="text-white/70">privacy@fixia.com.ar</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass border-white/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="bg-gradient-to-r from-red-400 to-pink-500 rounded-lg p-2 mr-4">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Teléfono</h3>
                          <p className="text-white/70">+54 9 280 XXX-XXXX</p>
                          <p className="text-sm text-white/60">Lunes a Viernes, 9:00 - 18:00</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass border-white/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg p-2 mr-4">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Oficina</h3>
                          <p className="text-white/70">
                            Rawson, Chubut<br />
                            Argentina
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <HelpCircle className="mr-3 h-5 w-5 text-yellow-400" />
                      ¿Necesitas ayuda inmediata?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link 
                      href="/faq" 
                      className="block glass-light border-white/10 p-3 rounded-lg hover:glass-medium transition-all duration-300"
                    >
                      <div className="flex items-center text-white/80 hover:text-white">
                        <HelpCircle className="mr-3 h-4 w-4 text-blue-400" />
                        <span>Preguntas Frecuentes</span>
                      </div>
                    </Link>
                    <Link 
                      href="/help" 
                      className="block glass-light border-white/10 p-3 rounded-lg hover:glass-medium transition-all duration-300"
                    >
                      <div className="flex items-center text-white/80 hover:text-white">
                        <Book className="mr-3 h-4 w-4 text-green-400" />
                        <span>Centro de Ayuda</span>
                      </div>
                    </Link>
                    <Link 
                      href="/status" 
                      className="block glass-light border-white/10 p-3 rounded-lg hover:glass-medium transition-all duration-300"
                    >
                      <div className="flex items-center text-white/80 hover:text-white">
                        <Activity className="mr-3 h-4 w-4 text-green-400" />
                        <span>Estado del Servicio</span>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:col-span-2 max-w-2xl lg:max-w-none"
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center">
                      <Send className="mr-3 h-6 w-6 text-green-400" />
                      Envíanos un Mensaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    {submitStatus === 'success' && (
                      <div className="glass-medium border-green-500/20 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <CheckCircle className="text-green-400 h-5 w-5 mr-3" />
                          <p className="text-green-300">
                            ¡Mensaje enviado exitosamente! Te responderemos pronto.
                          </p>
                        </div>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="glass-medium border-red-500/20 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <AlertTriangle className="text-red-400 h-5 w-5 mr-3" />
                          <p className="text-red-300">
                            Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.
                          </p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                            Nombre Completo *
                          </label>
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50"
                            placeholder="Tu nombre completo"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                            Teléfono
                          </label>
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50"
                            placeholder="+54 9 280 XXX-XXXX"
                          />
                        </div>

                        <div>
                          <label htmlFor="userType" className="block text-sm font-medium text-white/80 mb-2">
                            Tipo de Usuario
                          </label>
                          <select
                            id="userType"
                            name="userType"
                            value={formData.userType}
                            onChange={handleInputChange}
                            className="glass border-white/20 bg-white/5 text-white w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          >
                            <option value="general">Consulta General</option>
                            <option value="customer">Cliente (Explorador)</option>
                            <option value="provider">Profesional (AS)</option>
                            <option value="business">Empresa</option>
                            <option value="media">Medios de Comunicación</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                          Asunto *
                        </label>
                        <Input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50"
                          placeholder="¿En qué podemos ayudarte?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                          Mensaje *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={6}
                          className="glass border-white/20 bg-white/5 text-white placeholder:text-white/50 resize-none"
                          placeholder="Describe tu consulta o mensaje..."
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="privacy"
                          required
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
                        />
                        <label htmlFor="privacy" className="ml-2 text-sm text-white/70">
                          Acepto la{' '}
                          <Link href="/legal/privacy" className="text-blue-400 hover:text-blue-300 underline">
                            Política de Privacidad
                          </Link>{' '}
                          y el tratamiento de mis datos personales
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="liquid-gradient w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Enviando...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Mensaje
                          </div>
                        )}
                      </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10">
                      <p className="text-sm text-white/60 text-center">
                        Tiempo de respuesta promedio: <strong className="text-white/80">24 horas</strong> en días hábiles
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12"
            >
              <Card className="glass border-red-500/20 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-3 mr-4">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-300 mb-2">Contacto de Emergencia</h3>
                      <p className="text-red-200 mb-2">
                        Si tienes una emergencia relacionada con la seguridad de la plataforma, 
                        fraude o situaciones que requieren atención inmediata:
                      </p>
                      <p className="text-red-100 font-semibold flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        emergencia@fixia.com.ar
                      </p>
                      <p className="text-sm text-red-300 mt-1">
                        Respuesta garantizada en menos de 4 horas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

export default ContactPage;