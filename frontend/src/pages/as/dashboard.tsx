import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { useASDashboardData } from '@/hooks/useDashboardData';
import { FixiaNavigation } from '@/components/FixiaNavigation';
import { FixiaHeroPanel } from '@/components/FixiaHeroPanel';
import { FixiaSummaryCards } from '@/components/FixiaSummaryCards';
import { FixiaServicesTable } from '@/components/FixiaServicesTable';

const ASDashboard: NextPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { stats, loading: statsLoading, error, refetch } = useASDashboardData();
  
  useEffect(() => {
    if (!authLoading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="h-16 w-16 liquid-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <div className="absolute -inset-2 liquid-gradient rounded-2xl blur opacity-30 animate-pulse"></div>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tu panel AS...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="glass rounded-xl p-8 border-white/10">
            <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Error al cargar datos</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button 
              onClick={refetch}
              className="btn btn-primary liquid-gradient hover:opacity-90 transition-all duration-300"
            >
              Reintentar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Panel AS - {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Usuario'} - Fixia</title>
        <meta name="description" content="Panel de control para profesionales en la plataforma Fixia" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Background */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/4 -left-32 w-64 h-64 liquid-gradient rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Navigation */}
        <FixiaNavigation />
        
        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-12 relative">
          {/* Hero Panel */}
          <FixiaHeroPanel />
          
          {/* Summary Cards */}
          <FixiaSummaryCards />
          
          {/* Services Table */}
          <FixiaServicesTable />
          
          {/* Footer with Fixia branding */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
            className="text-center py-8 border-t border-white/10"
          >
            <div className="glass-medium rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="h-8 w-8 liquid-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <div>
                  <div className="font-semibold">Fixia</div>
                  <div className="text-xs text-muted-foreground">Conecta. Confía. Resuelve.</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu tiempo vale. Fixia lo cuida. Marketplace de microservicios diseñado para conectar 
                profesionales altamente calificados con usuarios que necesitan soluciones efectivas.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <span>© 2025 Fixia</span>
                <span>•</span>
                <span>Profesionales reales, resultados concretos</span>
                <span>•</span>
                <span>Transparencia líquida</span>
              </div>
            </div>
          </motion.footer>
        </main>
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

export default ASDashboard;