import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Lightbulb,
  AlertTriangle,
  Clock,
  Flame,
  Sparkles,
  Zap
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';

const CambiarAASPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [switching, setSwitching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }

    // If user is already an AS, redirect to AS dashboard
    if (user?.user_type === 'provider') {
      router.push('/as/dashboard');
      return;
    }
  }, [user, loading]);

  const handleSwitchToAS = async () => {
    try {
      setSwitching(true);
      
      const response = await explorerService.switchToProvider();
      
      if (response.success) {
        // Show success message and redirect
        alert('¡Felicitaciones! Tu cuenta se ha convertido exitosamente a AS. Ahora puedes ofrecer tus servicios profesionales en Fixia.');
        
        // Redirect to AS dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/as/dashboard';
        }, 1000);
      } else {
        alert('Error al cambiar a AS: ' + response.message);
      }
    } catch (error: any) {
      alert('Error al cambiar a AS: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setSwitching(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
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
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>
            <p className="text-white/80 text-lg">Cargando...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Convertirse en AS - Fixia</title>
        <meta name="description" content="Conviértete en un profesional AS y ofrece tus servicios en Fixia" />
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
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-6 mb-8"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center">
              <Link href="/explorador/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mr-6 p-3 rounded-xl text-white/80 hover:text-white transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <ArrowLeft className="h-6 w-6" />
                </motion.button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <Sparkles className="h-8 w-8 mr-3" />
                  Convertirse en Profesional AS
                </h1>
                <p className="text-white/70 text-lg">
                  Ofrece tus servicios y genera ingresos en Fixia
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl text-white p-8 mb-8 overflow-hidden border-0"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(168, 85, 247, 0.8) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 32px 64px rgba(59, 130, 246, 0.2)'
            }}
          >
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Users className="h-10 w-10 text-white" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold mb-4"
              >
                ¡Únete a los Mejores Profesionales de Chubut!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/90 mb-8"
              >
                Conviértete en un AS (Agente de Servicios) y conecta con clientes que necesitan tus habilidades
              </motion.p>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-6 text-sm"
              >
                <div className="flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Clientes verificados</span>
                </div>
                <div className="flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>Pagos seguros</span>
                </div>
                <div className="flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Star className="h-5 w-5 mr-2" />
                  <span>Sistema de calificaciones</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-6 border-0 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)'
                }}
              >
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Genera Ingresos Extra
              </h3>
              <p className="text-white/70 text-sm">
                Monetiza tus habilidades y conocimientos. Fija tus propios precios y horarios de trabajo.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-6 border-0 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                }}
              >
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Clientes en Tu Zona
              </h3>
              <p className="text-white/70 text-sm">
                Conecta con Exploradores de tu localidad que buscan exactamente tus servicios.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl p-6 border-0 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                }}
              >
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Plataforma Segura
              </h3>
              <p className="text-white/70 text-sm">
                Sistema de verificación, calificaciones mutuas y protección para ambas partes.
              </p>
            </motion.div>
          </div>

          {/* How it Works */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-8 mb-8 border-0"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              ¿Cómo Funciona Como AS?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                  }}
                >
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Completa tu Perfil</h4>
                <p className="text-sm text-white/70">
                  Agrega tu experiencia, servicios y verifica tu identidad
                </p>
              </div>

              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)'
                  }}
                >
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Recibe Solicitudes</h4>
                <p className="text-sm text-white/70">
                  Los Exploradores te encontrarán y te enviarán solicitudes
                </p>
              </div>

              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)'
                  }}
                >
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Negocia y Trabaja</h4>
                <p className="text-sm text-white/70">
                  Chatea, acuerda detalles y realiza el trabajo
                </p>
              </div>

              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                  }}
                >
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Cobra y Califícate</h4>
                <p className="text-sm text-white/70">
                  Recibe el pago y construye tu reputación
                </p>
              </div>
            </div>
          </motion.div>

          {/* Promotional Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl text-white p-6 mb-8 border-0"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.8) 0%, rgba(239, 68, 68, 0.8) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 32px 64px rgba(249, 115, 22, 0.3)'
            }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Flame className="h-8 w-8 mr-4" />
                <div>
                  <h3 className="text-xl font-bold">¡Oferta de Lanzamiento!</h3>
                  <p className="text-orange-100">
                    Los primeros 200 AS profesionales obtienen 2 meses gratis de suscripción premium
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">GRATIS</div>
                <div className="text-sm text-orange-100">2 meses</div>
              </div>
            </div>
          </motion.div>

          {/* Important Notes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl p-6 mb-8 border-0"
            style={{
              background: 'rgba(251, 191, 36, 0.15)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              boxShadow: '0 20px 40px rgba(251, 191, 36, 0.1)'
            }}
          >
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-300 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-100 mb-2">
                  Importante: Mantén Ambos Roles
                </h3>
                <div className="text-yellow-200/90 space-y-2 text-sm">
                  <p>• <strong>Podrás seguir siendo Explorador:</strong> Tu rol de cliente se mantiene activo</p>
                  <p>• <strong>Cambio de interfaz:</strong> Al convertirte en AS, accederás al panel de profesionales</p>
                  <p>• <strong>Puedes volver:</strong> Siempre podrás cambiar entre tus roles de Explorador y AS</p>
                  <p>• <strong>Mismo usuario:</strong> Mantiene tu historial, calificaciones y datos de cuenta</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-xl p-8 text-center border-0"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Lightbulb className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-2xl font-bold text-white mb-4"
              >
                ¿Listo para Empezar tu Carrera como AS?
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-white/80 mb-6"
              >
                Al hacer clic en "Convertirse en AS" se activará tu perfil profesional y podrás empezar a recibir solicitudes de servicios inmediatamente.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/explorador/dashboard">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    Volver al Panel Explorador
                  </motion.button>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmModal(true)}
                  className="px-8 py-3 text-white rounded-xl transition-all duration-300 font-medium flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Convertirse en AS
                  <ArrowRight className="h-5 w-5 ml-2" />
                </motion.button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="flex items-center justify-center mt-4 text-sm text-white/60"
              >
                <Clock className="h-4 w-4 mr-1" />
                <span>El cambio es instantáneo y reversible</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 p-4"
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)'
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !switching) {
                  setShowConfirmModal(false);
                }
              }}
            >
              <div className="flex items-center justify-center min-h-full">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="max-w-md w-full p-6 rounded-2xl border-0"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <Users className="h-10 w-10 text-white" />
                    </motion.div>
                    
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold text-white mb-4"
                    >
                      ¿Confirmar Conversión a AS?
                    </motion.h3>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 mb-6"
                    >
                      Tu cuenta se convertirá en un perfil profesional AS. Podrás ofrecer servicios y seguir siendo Explorador cuando quieras.
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-lg p-4 mb-6 border-0"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <div className="flex items-center text-sm text-green-300">
                        <Flame className="h-4 w-4 mr-2" />
                        <span className="font-medium">¡Incluye 2 meses gratis de suscripción premium!</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex space-x-4"
                    >
                      <motion.button
                        whileHover={{ scale: switching ? 1 : 1.02, y: switching ? 0 : -1 }}
                        whileTap={{ scale: switching ? 1 : 0.98 }}
                        onClick={() => setShowConfirmModal(false)}
                        disabled={switching}
                        className="flex-1 py-3 px-4 rounded-xl text-white/90 hover:text-white transition-all duration-300 font-medium disabled:opacity-50"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        Cancelar
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: switching ? 1 : 1.02, y: switching ? 0 : -1 }}
                        whileTap={{ scale: switching ? 1 : 0.98 }}
                        onClick={handleSwitchToAS}
                        disabled={switching}
                        className="flex-1 py-3 px-4 rounded-xl text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                          boxShadow: switching ? '0 10px 20px rgba(59, 130, 246, 0.2)' : '0 20px 40px rgba(59, 130, 246, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        {switching ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Sí, Convertir a AS'
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// Deshabilitar SSG para evitar errores de AuthProvider
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default CambiarAASPage;