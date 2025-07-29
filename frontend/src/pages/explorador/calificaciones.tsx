import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeft,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  Send,
  Flame,
  UserCircle,
  Award,
  Heart,
  MessageSquare,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { ExplorerReviewObligation, ExplorerReviewForm } from '@/types/explorer';

const CalificacionesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [obligations, setObligations] = useState<ExplorerReviewObligation[]>([]);
  const [loadingObligations, setLoadingObligations] = useState(true);
  const [submittingReview, setSubmittingReview] = useState<number | null>(null);
  const [activeReview, setActiveReview] = useState<number | null>(null);
  const [blockingStatus, setBlockingStatus] = useState<any>(null);
  
  const [reviewForm, setReviewForm] = useState<ExplorerReviewForm>({
    connection_id: 0,
    rating: 0,
    comment: '',
    service_quality_rating: 0,
    punctuality_rating: 0,
    communication_rating: 0,
    value_for_money_rating: 0,
    would_hire_again: true,
    recommend_to_others: true,
    review_photos: []
  });

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      loadObligations();
    }
  }, [user, loading]);

  const loadObligations = async () => {
    try {
      setLoadingObligations(true);
      
      const [obligationsRes, blockingRes] = await Promise.all([
        explorerService.getPendingReviewObligations(),
        explorerService.getBlockingStatus()
      ]);
      
      if (obligationsRes.success) {
        setObligations(obligationsRes.data.obligations);
      }
      
      if (blockingRes.success) {
        setBlockingStatus(blockingRes.data);
      }
      
    } catch (error) {
      console.error('Error loading obligations:', error);
    } finally {
      setLoadingObligations(false);
    }
  };

  const startReview = (obligation: ExplorerReviewObligation) => {
    setActiveReview(obligation.id);
    setReviewForm({
      connection_id: obligation.connection_id,
      rating: 0,
      comment: '',
      service_quality_rating: 0,
      punctuality_rating: 0,
      communication_rating: 0,
      value_for_money_rating: 0,
      would_hire_again: true,
      recommend_to_others: true,
      review_photos: []
    });
  };

  const submitReview = async () => {
    if (!activeReview) return;
    
    try {
      setSubmittingReview(activeReview);
      
      const response = await explorerService.submitReview(reviewForm);
      
      if (response.success) {
        // Remove the completed obligation from the list
        setObligations(prev => prev.filter(o => o.id !== activeReview));
        setActiveReview(null);
        
        // Reload blocking status
        const blockingRes = await explorerService.getBlockingStatus();
        if (blockingRes.success) {
          setBlockingStatus(blockingRes.data);
        }
        
        // Show success message
        alert('¡Calificación enviada exitosamente!');
        
        // If no more obligations, redirect to dashboard
        if (obligations.length <= 1) {
          setTimeout(() => {
            router.push('/explorador/dashboard');
          }, 1000);
        }
      } else {
        alert('Error al enviar calificación: ' + response.message);
      }
    } catch (error: any) {
      alert('Error al enviar calificación: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setSubmittingReview(null);
    }
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void, size = 'h-6 w-6') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            disabled={!onRate}
            whileHover={onRate ? { scale: 1.2 } : {}}
            whileTap={onRate ? { scale: 0.9 } : {}}
            className={`${size} ${onRate ? 'cursor-pointer' : ''} transition-all duration-200`}
          >
            <Star
              className={`${size} transition-all duration-200 ${
                star <= rating 
                  ? 'text-yellow-400 fill-current drop-shadow-lg' 
                  : onRate 
                  ? 'text-white/30 hover:text-yellow-300' 
                  : 'text-white/30'
              }`}
            />
          </motion.button>
        ))}
      </div>
    );
  };

  const getDaysRemainingColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return 'text-red-600';
    if (daysRemaining <= 1) return 'text-orange-600';
    if (daysRemaining <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading || loadingObligations) {
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
        
        {/* Loading content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-white/60 mx-auto mb-6"></div>
            <p className="text-white/80 text-lg">Cargando calificaciones pendientes...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Calificaciones Obligatorias - Fixia Explorador</title>
        <meta name="description" content="Califica a los AS para continuar usando Fixia" />
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
          className="relative z-10"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/explorador/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="mr-4 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  Calificaciones Obligatorias
                </h1>
                <p className="text-white/70 mt-1">
                  Califica a los AS para continuar buscando los mejores profesionales
                </p>
              </div>
              
              {blockingStatus?.is_blocked && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  🚫 Cuenta bloqueada
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Blocking Alert */}
          {blockingStatus?.is_blocked && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 32px 64px rgba(239, 68, 68, 0.2)'
              }}
            >
              <div className="flex items-start">
                <div 
                  className="p-2 rounded-lg mr-3 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">
                    🚨 CALIFICA A LOS AS PARA CONTINUAR BUSCANDO A LOS MEJORES
                  </h3>
                  <p className="text-white/80 mb-3">
                    {blockingStatus.message}
                  </p>
                  <div className="text-sm text-red-300">
                    <strong>Calificaciones pendientes:</strong> {obligations.length}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {obligations.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '48px',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                }}
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Todo al día!
              </h2>
              <p className="text-white/70 mb-6">
                No tienes calificaciones pendientes. Puedes continuar usando Fixia normalmente.
              </p>
              <Link href="/explorador/dashboard">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{ borderRadius: '12px' }}
                >
                  Volver al Panel
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {obligations.map((obligation, index) => (
                  <motion.div
                    key={obligation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -5 }}
                    className="group"
                  >
                    <Card 
                      className="overflow-hidden border-0 transition-all duration-300"
                      style={{
                        background: obligation.is_blocking_new_services 
                          ? 'rgba(239, 68, 68, 0.1)' 
                          : 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(24px)',
                        border: obligation.is_blocking_new_services 
                          ? '1px solid rgba(239, 68, 68, 0.3)' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        boxShadow: obligation.is_blocking_new_services 
                          ? '0 32px 64px rgba(239, 68, 68, 0.2)' 
                          : '0 32px 64px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20 transition-all duration-300 group-hover:scale-110"
                              style={{
                                background: obligation.as_profile_image 
                                  ? 'none' 
                                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))'
                              }}
                            >
                              {obligation.as_profile_image ? (
                                <img 
                                  src={obligation.as_profile_image} 
                                  alt={`${obligation.as_name} ${obligation.as_last_name}`}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-medium text-xl">
                                  {obligation.as_name?.[0]}{obligation.as_last_name?.[0]}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                                  {obligation.as_name} {obligation.as_last_name}
                                </h3>
                                {obligation.verification_status === 'verified' && (
                                  <div 
                                    className="p-1 rounded-full"
                                    style={{
                                      background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-white/80 mb-2 font-medium">{obligation.service_title}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-white/60">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Completado: {new Date(obligation.service_completed_at).toLocaleDateString()}
                                </span>
                                {obligation.final_agreed_price && (
                                  <span className="flex items-center">
                                    <Award className="h-4 w-4 mr-1" />
                                    {formatPrice(obligation.final_agreed_price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div 
                              className="text-lg font-bold mb-1 px-3 py-1 rounded-lg"
                              style={{
                                background: obligation.days_remaining !== undefined && obligation.days_remaining < 0 
                                  ? 'rgba(239, 68, 68, 0.2)' 
                                  : obligation.days_remaining === 0
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : (obligation.days_remaining || 0) <= 3
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(34, 197, 94, 0.2)',
                                color: obligation.days_remaining !== undefined && obligation.days_remaining < 0 
                                  ? '#EF4444' 
                                  : obligation.days_remaining === 0
                                  ? '#F59E0B'
                                  : (obligation.days_remaining || 0) <= 3
                                  ? '#F59E0B'
                                  : '#22C55E'
                              }}
                            >
                              {obligation.days_remaining !== undefined && obligation.days_remaining < 0 
                                ? `${Math.abs(obligation.days_remaining)} días vencida`
                                : obligation.days_remaining === 0
                                ? 'Vence hoy'
                                : `${obligation.days_remaining} días restantes`
                              }
                            </div>
                            <div className="text-sm text-white/60">
                              <Timer className="h-4 w-4 inline mr-1" />
                              {new Date(obligation.review_due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {activeReview === obligation.id ? (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-white/20 pt-6"
                          >
                            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                              <Star className="h-5 w-5 mr-2 text-yellow-400" />
                              Califica tu experiencia con {obligation.as_name}
                            </h4>

                            <div className="space-y-6">
                              {/* Overall Rating */}
                              <div 
                                className="p-4 rounded-lg"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                              >
                                <label className="block text-sm font-medium text-white/90 mb-3">
                                  Calificación general *
                                </label>
                                <div className="flex items-center space-x-4">
                                  {renderStars(reviewForm.rating, (rating) => 
                                    setReviewForm(prev => ({ ...prev, rating }))
                                  )}
                                  <span className="text-sm text-white/70 font-medium">
                                    {reviewForm.rating === 0 ? 'Selecciona una calificación' : 
                                     reviewForm.rating === 1 ? 'Muy malo' :
                                     reviewForm.rating === 2 ? 'Malo' :
                                     reviewForm.rating === 3 ? 'Regular' :
                                     reviewForm.rating === 4 ? 'Bueno' : 'Excelente'}
                                  </span>
                                </div>
                              </div>

                              {/* Detailed Ratings */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div 
                                  className="p-4 rounded-lg"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                >
                                  <label className="block text-sm font-medium text-white/90 mb-2">
                                    Calidad del servicio
                                  </label>
                                  {renderStars(reviewForm.service_quality_rating || 0, (rating) => 
                                    setReviewForm(prev => ({ ...prev, service_quality_rating: rating })), 'h-5 w-5'
                                  )}
                                </div>

                                <div 
                                  className="p-4 rounded-lg"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                >
                                  <label className="block text-sm font-medium text-white/90 mb-2">
                                    Puntualidad
                                  </label>
                                  {renderStars(reviewForm.punctuality_rating || 0, (rating) => 
                                    setReviewForm(prev => ({ ...prev, punctuality_rating: rating })), 'h-5 w-5'
                                  )}
                                </div>

                                <div 
                                  className="p-4 rounded-lg"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                >
                                  <label className="block text-sm font-medium text-white/90 mb-2">
                                    Comunicación
                                  </label>
                                  {renderStars(reviewForm.communication_rating || 0, (rating) => 
                                    setReviewForm(prev => ({ ...prev, communication_rating: rating })), 'h-5 w-5'
                                  )}
                                </div>

                                <div 
                                  className="p-4 rounded-lg"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                >
                                  <label className="block text-sm font-medium text-white/90 mb-2">
                                    Relación calidad-precio
                                  </label>
                                  {renderStars(reviewForm.value_for_money_rating || 0, (rating) => 
                                    setReviewForm(prev => ({ ...prev, value_for_money_rating: rating })), 'h-5 w-5'
                                  )}
                                </div>
                              </div>

                              {/* Comment */}
                              <div>
                                <label className="block text-sm font-medium text-white/90 mb-2">
                                  Comentario *
                                </label>
                                <textarea
                                  value={reviewForm.comment}
                                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                  placeholder="Describe tu experiencia con este AS..."
                                  rows={4}
                                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-lg px-3 py-2 focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                                  style={{
                                    backdropFilter: 'blur(8px)'
                                  }}
                                  required
                                />
                              </div>

                              {/* Recommendations */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div 
                                  className="flex items-center p-4 rounded-lg"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    id={`hire-again-${obligation.id}`}
                                    checked={reviewForm.would_hire_again}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, would_hire_again: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 bg-white/10 rounded"
                                  />
                                  <label htmlFor={`hire-again-${obligation.id}`} className="ml-3 block text-sm text-white/90 flex items-center">
                                    <Heart className="h-4 w-4 mr-1" />
                                    Lo volvería a contratar
                                  </label>
                                </div>

                                <div 
                                  className="flex items-center p-4 rounded-lg"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    id={`recommend-${obligation.id}`}
                                    checked={reviewForm.recommend_to_others}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, recommend_to_others: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 bg-white/10 rounded"
                                  />
                                  <label htmlFor={`recommend-${obligation.id}`} className="ml-3 block text-sm text-white/90 flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Lo recomendaría a otros
                                  </label>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/20">
                                <Button
                                  onClick={() => setActiveReview(null)}
                                  variant="outline"
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                                  disabled={submittingReview === obligation.id}
                                  style={{ borderRadius: '12px' }}
                                >
                                  Cancelar
                                </Button>
                                
                                <Button
                                  onClick={submitReview}
                                  disabled={!reviewForm.rating || !reviewForm.comment.trim() || submittingReview === obligation.id}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center shadow-lg hover:shadow-xl"
                                  style={{ borderRadius: '12px' }}
                                >
                                  {submittingReview === obligation.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-white mr-2"></div>
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-2" />
                                      Enviar Calificación
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="border-t border-white/20 pt-4 flex items-center justify-between">
                            <div className="text-sm text-white/70">
                              {obligation.is_blocking_new_services ? (
                                <span className="text-red-400 font-medium flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Esta calificación está bloqueando tu cuenta
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Tienes tiempo hasta el {new Date(obligation.review_due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => startReview(obligation)}
                              className={`font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                                obligation.is_blocking_new_services || (obligation.days_remaining !== undefined && obligation.days_remaining < 0)
                                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                              }`}
                              style={{ borderRadius: '12px' }}
                            >
                              {obligation.is_blocking_new_services ? (
                                <>
                                  <Flame className="h-4 w-4 mr-2" />
                                  🚨 Calificar Ahora
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Calificar AS
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
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

export default CalificacionesPage;