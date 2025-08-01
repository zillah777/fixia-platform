import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const ASCambiarAExplorador: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSwitch = async () => {
    try {
      setSwitching(true);
      setError('');

      const response = await fetch('/api/role-switching/switch-to-explorer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update user context or reload
        window.location.href = '/explorador/dashboard';
      } else {
        setError(data.error || 'Error al cambiar de rol');
      }
    } catch (error) {
      console.error('Error switching role:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
        }}
      >
        <motion.div 
          className="text-center"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.1)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-6"></div>
          <p className="text-white/90 text-lg font-medium">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Cambiar a Explorador - Fixia</title>
        <meta name="description" content="Cambia tu cuenta de AS Profesional a Explorador" />
      </Head>

      <div 
        className="min-h-screen relative"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
        }}
      >
        {/* Floating orbs background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-40 h-40 bg-blue-400/10 rounded-full"
            style={{ backdropFilter: 'blur(60px)' }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 right-20 w-32 h-32 bg-purple-400/10 rounded-full"
            style={{ backdropFilter: 'blur(60px)' }}
            animate={{
              y: [0, 25, 0],
              x: [0, -15, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        {/* Header */}
        <motion.div 
          className="relative z-10"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0 0 24px 24px'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/as/dashboard">
                <motion.button 
                  className="mr-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="h-6 w-6" />
                </motion.button>
              </Link>
              <div>
                <motion.div className="flex items-center mb-2">
                  <User className="h-8 w-8 text-blue-400 mr-3" />
                  <h1 className="text-3xl font-bold text-white">
                    Cambiar a Explorador
                  </h1>
                </motion.div>
                <motion.p 
                  className="text-white/80 text-lg"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Cambia tu cuenta de AS Profesional a Explorador de servicios
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Main Card */}
          <motion.div 
            className="p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <User className="h-12 w-12 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                ¿Quieres cambiar a modo Explorador?
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Al cambiar a Explorador podrás buscar y contratar servicios profesionales. 
                Podrás volver a ser AS cuando quieras.
              </p>
            </div>

            {/* Features comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Current (AS) */}
              <motion.div 
                className="p-6"
                style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '16px'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-400" />
                  Actual: AS Profesional
                </h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-purple-400" />
                    Ofrecer servicios profesionales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-purple-400" />
                    Recibir solicitudes de clientes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-purple-400" />
                    Gestionar tu negocio
                  </li>
                </ul>
              </motion.div>

              {/* Future (Explorer) */}
              <motion.div 
                className="p-6"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '16px'
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-400" />
                  Cambiar a: Explorador
                </h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                    Buscar servicios profesionales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                    Contratar AS certificados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                    Gestionar tus solicitudes
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Important Notice */}
            <motion.div 
              className="p-6 mb-8"
              style={{
                background: 'rgba(249, 115, 22, 0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                borderRadius: '16px'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-orange-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-2">Información importante</h4>
                  <ul className="text-white/80 space-y-1 text-sm">
                    <li>• Mantienes todos tus datos personales y profesionales</li>
                    <li>• Puedes volver a ser AS cuando quieras</li>
                    <li>• Tu historial y reputación se conservan</li>
                    <li>• El cambio es inmediato y reversible</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                className="p-4 mb-6"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-red-200 text-center">{error}</p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/as/dashboard">
                <motion.button 
                  className="px-8 py-4 text-white rounded-xl font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  disabled={switching}
                >
                  Cancelar
                </motion.button>
              </Link>

              <motion.button
                onClick={handleRoleSwitch}
                disabled={switching}
                className="px-8 py-4 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                style={{
                  background: switching ? 'rgba(107, 114, 128, 0.4)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: switching ? 'none' : '0 16px 32px rgba(59, 130, 246, 0.3)'
                }}
                whileHover={!switching ? { scale: 1.02 } : {}}
                whileTap={!switching ? { scale: 0.98 } : {}}
              >
                {switching ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Cambiando rol...
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 mr-2" />
                    Confirmar cambio a Explorador
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
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

export default ASCambiarAExplorador;