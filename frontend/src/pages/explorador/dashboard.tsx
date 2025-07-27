import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { FixiaNavigation } from '@/components/FixiaNavigation';
import { ExplorerHeroPanel } from '@/components/ExplorerHeroPanel';
import { ExplorerSummaryCards } from '@/components/ExplorerSummaryCards';
import { ExplorerRequestsTable } from '@/components/ExplorerRequestsTable';

const ExplorerDashboard: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'customer')) {
      router.push('/auth/login');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
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
          <p className="text-muted-foreground">Cargando tu panel de explorador...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard Explorador - {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Usuario'} - Fixia</title>
        <meta name="description" content="Panel de control para exploradores en la plataforma Fixia" />
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
        <main className="container mx-auto px-6 py-8 space-y-12 relative">
          {/* Hero Panel */}
          <ExplorerHeroPanel />
          
          {/* Summary Cards */}
          <ExplorerSummaryCards />
          
          {/* Requests Table */}
          <ExplorerRequestsTable />
          
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
                Conecta con profesionales verificados y encuentra soluciones de calidad para todos tus proyectos.
                Plataforma diseñada para exploradores que buscan resultados excepcionales.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <span>© 2025 Fixia</span>
                <span>•</span>
                <span>Exploradores inteligentes, decisiones acertadas</span>
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

export default ExplorerDashboard;