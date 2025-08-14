import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Users, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePromotion } from '@/contexts/PromotionContext';

interface PromotionBannerProps {
  className?: string;
  variant?: 'hero' | 'compact' | 'dashboard';
}

export function PromotionBanner({ className = "", variant = "hero" }: PromotionBannerProps) {
  const { promotionData, getTotalRemainingSpots, getProgressPercentage, isEligibleForPromotion } = usePromotion();
  
  const totalSpots = getTotalRemainingSpots();
  const progressPercentage = getProgressPercentage();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`w-full ${className}`}
      >
        <Card className="glass-medium border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-500/20 rounded-full">
                  <Gift className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    ¡Plan Profesional GRATIS por 2 meses!
                  </p>
                  <p className="text-xs text-white/60">
                    Solo quedan {totalSpots} lugares disponibles
                  </p>
                </div>
              </div>
              <Link href="/auth/registro">
                <Button size="sm" className="liquid-gradient hover:opacity-90 text-xs px-3 py-1 whitespace-nowrap">
                  Registrarse
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`w-full ${className}`}
      >
        <Card className="glass-strong border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-500/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  ¡Tu promoción está activa!
                </h3>
                <p className="text-sm text-white/80 mb-3">
                  Tienes 2 meses gratis del Plan Profesional valorado en $8,000 ARS
                </p>
                <div className="flex items-center space-x-4 text-xs text-white/60">
                  <span>Expira: 03 Oct 2025</span>
                  <span>•</span>
                  <span>Valor: $8,000 ARS</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Hero variant (default)
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full ${className}`}
    >
      <Card className="glass-strong border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/5 overflow-hidden relative">
        {/* Animated background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-amber-400/20 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-orange-400/20 to-transparent rounded-full blur-xl animate-float"></div>
        </div>

        <CardContent className="p-8 relative z-10">
          <div className="text-center">
            {/* Main promotional badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-6 py-2 text-sm font-semibold">
                <Gift className="w-4 h-4 mr-2" />
                Promoción de Lanzamiento
              </Badge>
            </motion.div>

            {/* Main headline */}
            <motion.h2 
              variants={itemVariants}
              className="text-3xl lg:text-4xl font-bold text-white mb-4"
            >
              🎉 Primeras 200 Cuentas
              <br />
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Plan Profesional GRATIS
              </span>
            </motion.h2>

            {/* Value proposition */}
            <motion.p 
              variants={itemVariants}
              className="text-xl text-white/80 mb-6 max-w-2xl mx-auto"
            >
              Obtén 2 meses completamente gratis del Plan Profesional
              <br />
              <span className="font-semibold text-amber-300">
                Valor: $8,000 ARS • Ahorro garantizado
              </span>
            </motion.p>

            {/* Progress and urgency */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {promotionData.remainingSpots.as_providers}
                  </div>
                  <div className="text-sm text-white/60">
                    Lugares AS restantes
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {promotionData.remainingSpots.exploradores}
                  </div>
                  <div className="text-sm text-white/60">
                    Lugares Explorador restantes
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                  <span>{promotionData.totalRegistered} registrados</span>
                  <span>{totalSpots} restantes</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <motion.div 
                    className="bg-gradient-to-r from-amber-400 to-orange-400 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Benefits list */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="glass-light p-4 rounded-xl border border-white/10">
                  <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">
                    Acceso Premium
                  </div>
                  <div className="text-xs text-white/60">
                    Todas las funciones desbloqueadas
                  </div>
                </div>
                <div className="glass-light p-4 rounded-xl border border-white/10">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">
                    Networking Premium
                  </div>
                  <div className="text-xs text-white/60">
                    Contactos ilimitados y prioritarios
                  </div>
                </div>
                <div className="glass-light p-4 rounded-xl border border-white/10">
                  <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">
                    Sin Compromisos
                  </div>
                  <div className="text-xs text-white/60">
                    Cancela cuando quieras
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link href="/auth/registro?type=provider&promo=200-primeras">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg rounded-2xl shadow-xl transition-all duration-300 whitespace-nowrap"
                >
                  Registrarme como AS
                </Button>
              </Link>
              
              <Link href="/auth/registro?type=customer&promo=200-primeras">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="glass-medium border-amber-500/30 text-amber-300 hover:glass-strong transition-all duration-300 px-8 py-3 text-lg rounded-2xl whitespace-nowrap"
                >
                  Registrarme como Explorador
                </Button>
              </Link>
            </motion.div>

            {/* Urgency message */}
            <motion.div variants={itemVariants} className="mt-6">
              <p className="text-sm text-amber-300 animate-pulse">
                ⚡ ¡Promoción limitada! Solo para las primeras 400 cuentas registradas
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PromotionBanner;