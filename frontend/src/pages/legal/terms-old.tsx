import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Scale, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Star,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
interface TermsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

// Icon wrapper to fix exactOptionalPropertyTypes issues
const IconWrapper = (Component: any) => {
  const WrappedIcon = ({ className }: { className?: string }) => 
    <Component className={className || undefined} />;
  
  WrappedIcon.displayName = `IconWrapper(${Component.displayName || Component.name || 'Component'})`;
  return WrappedIcon;
};

// Components
const LoadingState: React.FC = () => (
  <div className="min-h-screen relative overflow-hidden">
    <div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
      }}
    />
    <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
  </div>
);

const SectionCard: React.FC<{ 
  section: TermsSection; 
  index: number; 
  isHighlight?: boolean;
}> = ({ section, index, isHighlight = false }) => {
  const IconComponent = section.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      id={section.id}
    >
      <Card 
        className="overflow-hidden border-0 transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: isHighlight 
            ? 'rgba(59, 130, 246, 0.2)' 
            : 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(24px)',
          border: isHighlight 
            ? '1px solid rgba(59, 130, 246, 0.3)' 
            : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHighlight 
            ? '0 32px 64px rgba(59, 130, 246, 0.2)' 
            : '0 32px 64px rgba(0, 0, 0, 0.3)'
        }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-white text-xl">
            <div 
              className="mr-3 p-2 rounded-lg"
              style={{
                background: isHighlight 
                  ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' 
                  : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert prose-sm max-w-none">
          {section.content}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const HighlightBox: React.FC<{ 
  type: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  children: React.ReactNode;
}> = ({ type, title, children }) => {
  const styles = {
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      text: 'text-blue-300'
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: 'text-yellow-300'
    },
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: 'text-green-300'
    },
    danger: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: 'text-red-300'
    }
  };

  const style = styles[type];

  return (
    <div 
      className="p-4 rounded-lg mb-4"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        backdropFilter: 'blur(8px)'
      }}
    >
      {title && (
        <h4 className={`font-semibold mb-2 ${style.text}`}>
          {title}
        </h4>
      )}
      <div className="text-white/90">
        {children}
      </div>
    </div>
  );
};

// Main component
const TermsPage: NextPage = () => {
  const currentDate = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const termsSections: TermsSection[] = [
    {
      id: 'definiciones',
      title: 'Definiciones y Naturaleza del Servicio',
      icon: IconWrapper(FileText),
      content: (
        <div className="space-y-4">
          <HighlightBox type="info" title="FIXIA.COM.AR es una plataforma digital de intermediación que funciona como:">
            <ul className="list-disc ml-4 space-y-2">
              <li>Las páginas amarillas del futuro</li>
              <li>Los clasificados de la nueva era digital</li>
              <li>Un buscador y automatizador de búsqueda</li>
              <li>Un sistema de matchmaking entre oferentes y demandantes</li>
              <li>Un puente o nexo facilitador (NO responsable)</li>
            </ul>
          </HighlightBox>
          
          <p className="text-white/80 leading-relaxed">
            Fixia.com.ar es comparable a "Uber de servicios" donde conectamos profesionales (AS - Ases) 
            con exploradores (clientes) que buscan servicios, actuando únicamente como intermediario 
            tecnológico sin participación directa en la prestación de servicios.
          </p>
        </div>
      )
    },
    {
      id: 'responsabilidades',
      title: 'Exención de Responsabilidades',
      icon: IconWrapper(AlertTriangle),
      content: (
        <div className="space-y-6">
          <HighlightBox type="danger" title="IMPORTANTE: Limitaciones de Responsabilidad">
            <p>
              FIXIA.COM.AR NO SE HACE RESPONSABLE de ningún aspecto relacionado con los servicios 
              prestados entre usuarios, incluyendo pero no limitándose a:
            </p>
          </HighlightBox>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">2.1. Responsabilidad Civil</h3>
            <p className="text-white/80">
              Fixia.com.ar NO asume responsabilidad civil por daños, perjuicios, lesiones personales, 
              daños materiales o cualquier otro tipo de daño que pueda surgir de:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-white/70">
              <li>La prestación de servicios entre usuarios</li>
              <li>La calidad, puntualidad o resultado de los servicios</li>
              <li>Accidentes durante la prestación del servicio</li>
              <li>Daños a la propiedad del cliente o terceros</li>
              <li>Incumplimiento de acuerdos entre las partes</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">2.2. Responsabilidad Contractual</h3>
            <p className="text-white/80">
              Los contratos se establecen directamente entre el AS (profesional) y el Explorador (cliente). 
              Fixia.com.ar:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-white/70">
              <li>NO es parte de ningún contrato de servicios</li>
              <li>NO garantiza el cumplimiento de los acuerdos</li>
              <li>NO valida la capacidad técnica o legal de los profesionales</li>
              <li>NO interviene en disputas contractuales</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">2.3. Responsabilidad Penal</h3>
            <p className="text-white/80">
              Fixia.com.ar queda exento de cualquier responsabilidad penal derivada de:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-white/70">
              <li>Actividades ilegales realizadas por usuarios</li>
              <li>Delitos cometidos durante la prestación de servicios</li>
              <li>Falsificación de documentos o identidad</li>
              <li>Fraudes entre usuarios</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'comisiones',
      title: 'Ausencia de Comisiones',
      icon: IconWrapper(CheckCircle),
      content: (
        <HighlightBox type="success">
          <p>
            <strong>Fixia.com.ar NO cobra comisiones</strong> sobre las transacciones realizadas 
            entre usuarios. Todos los pagos y acuerdos económicos son directamente entre AS y Exploradores.
          </p>
        </HighlightBox>
      )
    },
    {
      id: 'obligaciones-as',
      title: 'Obligaciones de los Usuarios AS (Profesionales)',
      icon: IconWrapper(Users),
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">4.1. Registro y Verificación</h3>
            <ul className="list-disc ml-6 space-y-1 text-white/70">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Completar el proceso de verificación de identidad</li>
              <li>Mantener actualizados sus datos de contacto</li>
              <li>Decidir conscientemente la visibilidad de su número telefónico</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">4.2. Protección de Datos Personales</h3>
            <HighlightBox type="warning" title="ADVERTENCIA:">
              <p>
                Los AS deben ser cuidadosos con sus datos personales, 
                especialmente su número de teléfono. La plataforma permite configurar la visibilidad 
                de esta información.
              </p>
            </HighlightBox>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">4.3. Responsabilidades Profesionales</h3>
            <ul className="list-disc ml-6 space-y-1 text-white/70">
              <li>Poseer las habilitaciones legales requeridas para su actividad</li>
              <li>Contar con seguros apropiados para su actividad profesional</li>
              <li>Cumplir con la legislación laboral y fiscal vigente</li>
              <li>Mantener estándares de calidad y profesionalismo</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'badges',
      title: 'Sistema de Badges y Reputación',
      icon: IconWrapper(Star),
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Los badges son indicadores de reputación basados en:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-white/70">
            <li>Completitud del perfil</li>
            <li>Verificación de identidad</li>
            <li>Años en la plataforma</li>
            <li>Calificaciones de usuarios</li>
            <li>Responsabilidad y cumplimiento</li>
          </ul>
          <HighlightBox type="info">
            <p>
              Los badges son indicativos y no constituyen garantía de calidad o responsabilidad 
              por parte de Fixia.com.ar.
            </p>
          </HighlightBox>
        </div>
      )
    },
    {
      id: 'prohibiciones',
      title: 'Prohibiciones',
      icon: IconWrapper(XCircle),
      content: (
        <div className="space-y-4">
          <p className="text-white/80">Está estrictamente prohibido:</p>
          <ul className="list-disc ml-6 space-y-2 text-white/70">
            <li>Usar la plataforma para actividades ilegales</li>
            <li>Proporcionar información falsa o engañosa</li>
            <li>Acosar, intimidar o amenazar a otros usuarios</li>
            <li>Violar derechos de propiedad intelectual</li>
            <li>Intentar vulnerar la seguridad de la plataforma</li>
            <li>Realizar spam o actividades de marketing no autorizadas</li>
            <li>Interferir con el funcionamiento normal de la plataforma</li>
          </ul>
        </div>
      )
    },
    {
      id: 'modificaciones',
      title: 'Modificaciones y Vigencia',
      icon: IconWrapper(Scale),
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Fixia.com.ar se reserva el derecho de modificar estos términos y condiciones en cualquier momento. 
            Las modificaciones entrarán en vigencia inmediatamente después de su publicación en la plataforma.
          </p>
          <HighlightBox type="info">
            <p>
              Es responsabilidad del usuario revisar periódicamente estos términos para mantenerse 
              informado sobre cualquier cambio.
            </p>
          </HighlightBox>
          <p className="text-white/60 text-sm">
            Al continuar utilizando la plataforma después de la publicación de modificaciones, 
            el usuario acepta automáticamente los nuevos términos.
          </p>
        </div>
      )
    }
  ];

  return (
    <>
      <Head>
        <title>Términos y Condiciones - Fixia</title>
        <meta name="description" content="Términos y condiciones de uso de la plataforma Fixia - Conoce tus derechos y responsabilidades" />
        <meta name="keywords" content="términos, condiciones, legal, fixia, responsabilidades, usuarios" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Liquid Glass Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
          }}
        />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Content */}
        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 mb-8"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Volver al inicio
                    </Button>
                  </Link>
                  
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                      <Scale className="h-8 w-8 mr-3" />
                      Términos y Condiciones
                    </h1>
                    <p className="text-white/70">
                      Última actualización: {currentDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-6 pb-12">
            {/* Introduction */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card 
                className="overflow-hidden border-0"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
              >
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl text-white flex items-center justify-center">
                    <div 
                      className="mr-3 p-2 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
                      }}
                    >
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    Términos y Condiciones de Uso
                  </CardTitle>
                  <p className="text-white/60 mt-2">
                    Conoce tus derechos y responsabilidades al usar la plataforma FIXIA
                  </p>
                </CardHeader>
                
                <CardContent className="text-center">
                  <HighlightBox type="info" title="Información Importante">
                    <p>
                      Al utilizar los servicios de FIXIA.COM.AR, usted acepta estar sujeto a estos 
                      términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, 
                      no debe usar nuestros servicios.
                    </p>
                  </HighlightBox>
                </CardContent>
              </Card>
            </motion.div>

            {/* Table of Contents */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card 
                className="overflow-hidden border-0"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Índice de Contenidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {termsSections.map((section, index) => {
                      const IconComponent = section.icon;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="flex items-center p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <IconComponent className="h-4 w-4 mr-3" />
                          <span className="text-sm">{index + 1}. {section.title}</span>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {termsSections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  isHighlight={index === 1} // Highlight responsibility section
                />
              ))}
            </div>

            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <Card 
                className="overflow-hidden border-0"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white text-center">
                    ¿Tienes preguntas sobre estos términos?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/70 mb-6">
                    Si tienes alguna pregunta sobre estos términos y condiciones, 
                    no dudes en contactarnos.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      style={{ borderRadius: '12px' }}
                    >
                      <Link href="/contacto">
                        Contactar Soporte
                      </Link>
                    </Button>
                    <Button 
                      asChild
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      style={{ borderRadius: '12px' }}
                    >
                      <Link href="/">
                        Volver al Inicio
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;