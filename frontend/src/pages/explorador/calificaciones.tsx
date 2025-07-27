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
  UserCircle
} from 'lucide-react';

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
          <button
            key={star}
            type="button"
            onClick={() => onRate?.(star)}
            disabled={!onRate}
            className={`${size} ${onRate ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          >
            <Star
              className={`${size} ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : onRate 
                  ? 'text-gray-300 hover:text-yellow-300' 
                  : 'text-gray-300'
              }`}
            />
          </button>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calificaciones pendientes...</p>
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/explorador/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Calificaciones Obligatorias
                </h1>
                <p className="text-gray-600 mt-1">
                  Califica a los AS para continuar buscando los mejores profesionales
                </p>
              </div>
              
              {blockingStatus?.is_blocked && (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium">
                  🚫 Cuenta bloqueada
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Blocking Alert */}
          {blockingStatus?.is_blocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    🚨 CALIFICA A LOS AS PARA CONTINUAR BUSCANDO A LOS MEJORES
                  </h3>
                  <p className="text-red-700 mb-3">
                    {blockingStatus.message}
                  </p>
                  <div className="text-sm text-red-600">
                    <strong>Calificaciones pendientes:</strong> {obligations.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {obligations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Todo al día!
              </h2>
              <p className="text-gray-600 mb-6">
                No tienes calificaciones pendientes. Puedes continuar usando Fixia normalmente.
              </p>
              <Link href="/explorador/dashboard">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Volver al Panel
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {obligations.map((obligation) => (
                <div key={obligation.id} className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {obligation.as_profile_image ? (
                            <img 
                              src={obligation.as_profile_image} 
                              alt={`${obligation.as_name} ${obligation.as_last_name}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-medium text-xl">
                              {obligation.as_name?.[0]}{obligation.as_last_name?.[0]}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {obligation.as_name} {obligation.as_last_name}
                            </h3>
                            {obligation.verification_status === 'verified' && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-2">{obligation.service_title}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>📅 Completado: {new Date(obligation.service_completed_at).toLocaleDateString()}</span>
                            {obligation.final_agreed_price && (
                              <span>💰 {formatPrice(obligation.final_agreed_price)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${getDaysRemainingColor(obligation.days_remaining || 0)}`}>
                          {obligation.days_remaining !== undefined && obligation.days_remaining < 0 
                            ? `${Math.abs(obligation.days_remaining)} días vencida`
                            : obligation.days_remaining === 0
                            ? 'Vence hoy'
                            : `${obligation.days_remaining} días restantes`
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          Vence: {new Date(obligation.review_due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {activeReview === obligation.id ? (
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-6">
                          Califica tu experiencia con {obligation.as_name}
                        </h4>

                        <div className="space-y-6">
                          {/* Overall Rating */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Calificación general *
                            </label>
                            <div className="flex items-center space-x-4">
                              {renderStars(reviewForm.rating, (rating) => 
                                setReviewForm(prev => ({ ...prev, rating }))
                              )}
                              <span className="text-sm text-gray-600">
                                {reviewForm.rating === 0 ? 'Selecciona una calificación' : 
                                 reviewForm.rating === 1 ? 'Muy malo' :
                                 reviewForm.rating === 2 ? 'Malo' :
                                 reviewForm.rating === 3 ? 'Regular' :
                                 reviewForm.rating === 4 ? 'Bueno' : 'Excelente'}
                              </span>
                            </div>
                          </div>

                          {/* Detailed Ratings */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Calidad del servicio
                              </label>
                              {renderStars(reviewForm.service_quality_rating || 0, (rating) => 
                                setReviewForm(prev => ({ ...prev, service_quality_rating: rating })), 'h-5 w-5'
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puntualidad
                              </label>
                              {renderStars(reviewForm.punctuality_rating || 0, (rating) => 
                                setReviewForm(prev => ({ ...prev, punctuality_rating: rating })), 'h-5 w-5'
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comunicación
                              </label>
                              {renderStars(reviewForm.communication_rating || 0, (rating) => 
                                setReviewForm(prev => ({ ...prev, communication_rating: rating })), 'h-5 w-5'
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relación calidad-precio
                              </label>
                              {renderStars(reviewForm.value_for_money_rating || 0, (rating) => 
                                setReviewForm(prev => ({ ...prev, value_for_money_rating: rating })), 'h-5 w-5'
                              )}
                            </div>
                          </div>

                          {/* Comment */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comentario *
                            </label>
                            <textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                              placeholder="Describe tu experiencia con este AS..."
                              rows={4}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>

                          {/* Recommendations */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`hire-again-${obligation.id}`}
                                checked={reviewForm.would_hire_again}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, would_hire_again: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`hire-again-${obligation.id}`} className="ml-2 block text-sm text-gray-900">
                                Lo volvería a contratar
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`recommend-${obligation.id}`}
                                checked={reviewForm.recommend_to_others}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, recommend_to_others: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`recommend-${obligation.id}`} className="ml-2 block text-sm text-gray-900">
                                Lo recomendaría a otros
                              </label>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                            <button
                              onClick={() => setActiveReview(null)}
                              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                              disabled={submittingReview === obligation.id}
                            >
                              Cancelar
                            </button>
                            
                            <button
                              onClick={submitReview}
                              disabled={!reviewForm.rating || !reviewForm.comment.trim() || submittingReview === obligation.id}
                              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                            >
                              {submittingReview === obligation.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar Calificación
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {obligation.is_blocking_new_services ? (
                            <span className="text-red-600 font-medium">
                              🚫 Esta calificación está bloqueando tu cuenta
                            </span>
                          ) : (
                            <span>
                              ⏰ Tienes tiempo hasta el {new Date(obligation.review_due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => startReview(obligation)}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            obligation.is_blocking_new_services || (obligation.days_remaining !== undefined && obligation.days_remaining < 0)
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {obligation.is_blocking_new_services ? '🚨 Calificar Ahora' : 'Calificar AS'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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