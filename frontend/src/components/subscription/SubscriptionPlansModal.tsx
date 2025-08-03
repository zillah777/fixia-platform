/**
 * FIXIA SUBSCRIPTION PLANS MODAL - LIQUID GLASS DESIGN
 * ====================================================
 * 
 * Strategic conversion-focused subscription UI with Liquid Glass "Confianza Líquida" design
 * Philosophy: "Si la aplicación la entiende un analfabeto tecnológico, y un informático, será un éxito"
 * 
 * Features:
 * - Conversion psychology in pricing display
 * - Strategic limitations highlighting
 * - First 200 professionals promotion
 * - Real-time urgency indicators
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Crown, 
  Zap, 
  Star, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Sparkles,
  Timer
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_currency: string;
  features: Array<{
    name: string;
    included: boolean;
    limitation?: boolean;
    upgrade_feature?: boolean;
    highlight?: boolean;
    premium?: boolean;
  }>;
  limits: {
    maxActiveServices: number;
    maxPortfolioImages: number;
    enhancedVisibility: boolean;
    advancedAnalytics: boolean;
    topSearchPlacement: boolean;
    vipSupport: boolean;
  };
  is_recommended: boolean;
  conversion_messaging: {
    pain_points?: string[];
    benefits?: string[];
    call_to_action: string;
    urgency?: string;
    value_prop?: string;
  };
  roi_calculator: {
    monthly_cost?: number;
    break_even_clients?: number;
    projected_extra_clients?: string;
    roi_percentage?: string;
    annual_savings?: string;
  };
}

interface PromotionData {
  is_available: boolean;
  remaining_slots: number;
  free_months: number;
  urgency_message: string;
}

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  onUpgrade: (planName: string, promotionalCode?: string) => Promise<void>;
}

export default function SubscriptionPlansModal({
  isOpen,
  onClose,
  currentPlan = 'basico',
  onUpgrade
}: SubscriptionPlansModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [promotion, setPromotion] = useState<PromotionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showROI, setShowROI] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionData();
    }
  }, [isOpen]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription plans
      const plansResponse = await fetch('/api/subscriptions/plans');
      const plansData = await plansResponse.json();
      
      // Fetch first 200 promotion status
      const promoResponse = await fetch('/api/subscriptions/promotions/check-first-200');
      const promoData = await promoResponse.json();
      
      if (plansData.success) {
        setPlans(plansData.data);
      }
      
      if (promoData.success && promoData.data.is_available) {
        setPromotion(promoData.data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    try {
      setUpgrading(planName);
      
      // Use promotional code for first 200 if available
      const promotionalCode = promotion?.is_available ? 'PRIMEROS_200' : undefined;
      
      await onUpgrade(planName, promotionalCode);
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setUpgrading(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'plus':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'profesional':
        return <Zap className="w-6 h-6 text-blue-400" />;
      default:
        return <Users className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'GRATIS';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (plan.name === currentPlan) return 'Plan Actual';
    if (upgrading === plan.name) return 'Procesando...';
    if (plan.name === 'basico') return 'Cambiar a Básico';
    return plan.conversion_messaging.call_to_action;
  };

  const getButtonVariant = (plan: SubscriptionPlan) => {
    if (plan.name === currentPlan) return 'current';
    if (plan.is_recommended) return 'recommended';
    if (plan.name === 'plus') return 'premium';
    return 'default';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      >
        {/* Glass Background */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-6 bg-white/10 backdrop-blur-xl border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Planes de Suscripción
                </h2>
                <p className="text-white/70 mt-1">
                  Elige el plan perfecto para hacer crecer tu negocio
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Promotion Banner */}
            {promotion && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-400/20 rounded-full">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      🔥 ¡Oferta Especial para los Primeros 200 Profesionales!
                    </p>
                    <p className="text-white/80 text-sm">
                      {promotion.free_months} meses gratis del Plan Profesional
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-sm">
                      {promotion.urgency_message}
                    </p>
                    <div className="flex items-center text-white/60 text-xs mt-1">
                      <Timer className="w-3 h-3 mr-1" />
                      Oferta limitada
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Plans Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-6 rounded-2xl border backdrop-blur-sm ${
                      plan.is_recommended
                        ? 'bg-blue-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20'
                        : plan.name === 'plus'
                        ? 'bg-yellow-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                        : 'bg-white/10 border-white/20'
                    }`}
                  >
                    {/* Recommended Badge */}
                    {plan.is_recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                          Recomendado
                        </div>
                      </div>
                    )}

                    {/* Plus Badge */}
                    {plan.name === 'plus' && (
                      <div className="absolute -top-3 right-4">
                        <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold rounded-full">
                          PREMIUM
                        </div>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-3">
                        {getPlanIcon(plan.name)}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {plan.display_name}
                      </h3>
                      <div className="mb-4">
                        {plan.price_monthly === 0 && promotion?.is_available && plan.name === 'profesional' ? (
                          <div>
                            <p className="text-3xl font-bold text-green-400">
                              GRATIS
                            </p>
                            <p className="text-white/60 text-sm line-through">
                              {formatPrice(4000)}/mes
                            </p>
                            <p className="text-green-400 text-sm font-semibold">
                              2 meses gratis, luego {formatPrice(4000)}/mes
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-3xl font-bold text-white">
                              {formatPrice(plan.price_monthly)}
                            </p>
                            {plan.price_monthly > 0 && (
                              <p className="text-white/60 text-sm">por mes</p>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-white/80 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      {plan.features.slice(0, 6).map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          {feature.included ? (
                            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              feature.highlight || feature.premium 
                                ? 'text-green-400' 
                                : 'text-green-500'
                            }`} />
                          ) : (
                            <X className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
                          )}
                          <span className={`text-sm ${
                            feature.included 
                              ? (feature.limitation ? 'text-yellow-300' : 'text-white') 
                              : 'text-white/50'
                          } ${
                            feature.highlight ? 'font-semibold' : ''
                          } ${
                            feature.premium ? 'text-yellow-300 font-semibold' : ''
                          }`}>
                            {feature.name}
                            {feature.limitation && (
                              <AlertTriangle className="w-3 h-3 inline ml-1 text-yellow-400" />
                            )}
                          </span>
                        </div>
                      ))}

                      {/* Show more features link */}
                      {plan.features.length > 6 && (
                        <button
                          className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                          onClick={() => setShowROI(showROI === plan.name ? null : plan.name)}
                        >
                          Ver todas las características ({plan.features.length})
                        </button>
                      )}
                    </div>

                    {/* ROI Calculator */}
                    {showROI === plan.name && plan.roi_calculator.monthly_cost && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20"
                      >
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Calculadora ROI
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Inversión mensual:</span>
                            <span className="text-white font-semibold">
                              {formatPrice(plan.roi_calculator.monthly_cost)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Clientes extra esperados:</span>
                            <span className="text-green-400 font-semibold">
                              {plan.roi_calculator.projected_extra_clients}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">ROI proyectado:</span>
                            <span className="text-green-400 font-bold">
                              {plan.roi_calculator.roi_percentage}
                            </span>
                          </div>
                          {plan.roi_calculator.annual_savings && (
                            <div className="pt-2 border-t border-white/20">
                              <p className="text-yellow-300 text-xs font-semibold">
                                {plan.roi_calculator.annual_savings}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Conversion Messaging */}
                    {plan.conversion_messaging.pain_points && (
                      <div className="mb-4 p-3 bg-red-500/20 rounded-xl border border-red-400/30">
                        <h4 className="text-red-300 font-semibold text-sm mb-2">
                          ¿Te suena familiar?
                        </h4>
                        {plan.conversion_messaging.pain_points.map((point, idx) => (
                          <p key={idx} className="text-red-200 text-xs">
                            • {point}
                          </p>
                        ))}
                      </div>
                    )}

                    {plan.conversion_messaging.benefits && (
                      <div className="mb-4 p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                        <h4 className="text-green-300 font-semibold text-sm mb-2">
                          Con este plan obtienes:
                        </h4>
                        {plan.conversion_messaging.benefits.map((benefit, idx) => (
                          <p key={idx} className="text-green-200 text-xs">
                            • {benefit}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={plan.name === currentPlan || upgrading === plan.name}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        getButtonVariant(plan) === 'current'
                          ? 'bg-gray-500/30 text-white cursor-not-allowed'
                          : getButtonVariant(plan) === 'recommended'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : getButtonVariant(plan) === 'premium'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-lg shadow-yellow-500/30'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {getButtonText(plan)}
                    </button>

                    {/* Value Proposition */}
                    {plan.conversion_messaging.value_prop && (
                      <p className="text-center text-white/60 text-xs mt-2">
                        {plan.conversion_messaging.value_prop}
                      </p>
                    )}

                    {/* Urgency Message */}
                    {plan.conversion_messaging.urgency && plan.name === 'profesional' && promotion?.is_available && (
                      <div className="mt-3 text-center">
                        <p className="text-yellow-300 text-xs font-semibold animate-pulse">
                          {plan.conversion_messaging.urgency}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/20 text-center">
            <p className="text-white/70 text-sm mb-2">
              💡 <strong>Filosofía Fixia:</strong> "Si la aplicación la entiende un analfabeto tecnológico, y un informático, será un éxito"
            </p>
            <p className="text-white/50 text-xs">
              Todos los planes incluyen facturación segura con MercadoPago • Cancelación en cualquier momento
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}