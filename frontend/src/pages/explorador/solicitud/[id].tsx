import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeft,
  Star,
  MapPin,
  DollarSign,
  ShieldCheck,
  MessageCircle,
  Clock,
  Users,
  Flame,
  Calendar,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { ExplorerServiceRequest, ASServiceInterest } from '@/types/explorer';

const SolicitudDetailPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [request, setRequest] = useState<ExplorerServiceRequest | null>(null);
  const [interests, setInterests] = useState<ASServiceInterest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [acceptingAS, setAcceptingAS] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (id && user) {
      loadRequestData();
    }
  }, [id, user, loading]);

  const loadRequestData = async () => {
    try {
      setLoadingData(true);
      
      // Get request details from the list first
      const requestsRes = await explorerService.getMyServiceRequests('active');
      const currentRequest = requestsRes.data.find(r => r.id === parseInt(id as string));
      
      if (!currentRequest) {
        router.push('/explorador/dashboard');
        return;
      }
      
      setRequest(currentRequest);
      
      // Get AS interests for this request
      const interestsRes = await explorerService.getServiceRequestInterests(parseInt(id as string));
      if (interestsRes.success) {
        setInterests(interestsRes.data);
      }
      
    } catch (error) {
      console.error('Error loading request data:', error);
      router.push('/explorador/dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAcceptAS = async (interestId: number, proposedPrice?: number) => {
    try {
      setAcceptingAS(interestId);
      
      const response = await explorerService.acceptASInterest(interestId, proposedPrice);
      
      if (response.success) {
        // Redirect to chat
        router.push(`/explorador/chat/${response.data.chat_room_id}`);
      } else {
        alert('Error al aceptar la propuesta: ' + response.message);
      }
    } catch (error: any) {
      alert('Error al aceptar la propuesta: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setAcceptingAS(null);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: { text: 'Baja', color: 'bg-gray-100 text-gray-800', icon: '⏰' },
      medium: { text: 'Media', color: 'bg-blue-100 text-blue-800', icon: '📅' },
      high: { text: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '⚡' },
      emergency: { text: 'Emergencia', color: 'bg-red-100 text-red-800', icon: '🚨' }
    };
    return badges[urgency as keyof typeof badges] || badges.medium;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const days = Math.floor(diffInHours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitud no encontrada</h2>
          <Link href="/explorador/dashboard">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Volver al panel
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{request.title} - Fixia</title>
        <meta name="description" content={`Solicitud de servicio: ${request.description}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/explorador/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Mi Solicitud de Servicio
                </h1>
                <p className="text-gray-600 mt-1">
                  {interests.length} AS interesados
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {request.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {request.locality}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatTimeAgo(request.created_at)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Expira: {new Date(request.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyBadge(request.urgency).color}`}>
                    {getUrgencyBadge(request.urgency).icon} {getUrgencyBadge(request.urgency).text}
                  </span>
                </div>

                <div className="prose max-w-none mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción del trabajo</h3>
                  <p className="text-gray-700">{request.description}</p>
                </div>

                {(request.budget_min || request.budget_max) && (
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">
                      Presupuesto: 
                      {request.budget_min && request.budget_max 
                        ? ` ${formatPrice(request.budget_min)} - ${formatPrice(request.budget_max)}`
                        : request.budget_min 
                        ? ` Desde ${formatPrice(request.budget_min)}`
                        : ` Hasta ${formatPrice(request.budget_max!)}`
                      }
                    </span>
                  </div>
                )}

                {request.preferred_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">
                      Fecha preferida: {new Date(request.preferred_date).toLocaleDateString()}
                      {request.preferred_time && ` a las ${request.preferred_time}`}
                    </span>
                  </div>
                )}
              </div>

              {/* AS Interests */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Profesionales Interesados ({interests.length})
                  </h3>
                  {interests.length > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      ¡{interests.length} AS dijeron "LO TENGO"!
                    </div>
                  )}
                </div>

                {interests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Aún no hay AS interesados
                    </h4>
                    <p className="text-gray-500 mb-4">
                      Los profesionales de tu zona serán notificados automáticamente
                    </p>
                    <div className="text-sm text-gray-400">
                      Tu solicitud expira el {new Date(request.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {interests.map((interest) => (
                      <div key={interest.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {interest.profile_image ? (
                                <img 
                                  src={interest.profile_image} 
                                  alt={`${interest.first_name} ${interest.last_name}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-600 font-medium">
                                  {interest.first_name[0]}{interest.last_name[0]}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {interest.first_name} {interest.last_name}
                                </h4>
                                {interest.verification_status === 'verified' && (
                                  <ShieldCheck className="h-5 w-5 text-green-600" />
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  interest.subscription_type === 'premium' 
                                    ? 'bg-purple-100 text-purple-800'
                                    : interest.subscription_type === 'basic'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {interest.subscription_type === 'premium' ? 'Premium' : 
                                   interest.subscription_type === 'basic' ? 'Básico' : 'Gratuito'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1 mb-2">
                                {interest.avg_rating ? (
                                  <>
                                    {renderStars(Math.round(interest.avg_rating))}
                                    <span className="text-sm text-gray-600 ml-1">
                                      {interest.avg_rating.toFixed(1)} ({interest.total_reviews})
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-500">Sin calificaciones</span>
                                )}
                              </div>

                              <div className="text-sm text-gray-600">
                                Respondió {formatTimeAgo(interest.created_at)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {interest.proposed_price && (
                              <div className="text-xl font-bold text-green-600 mb-1">
                                {formatPrice(interest.proposed_price)}
                              </div>
                            )}
                            {interest.estimated_completion_time && (
                              <div className="text-sm text-gray-600">
                                ⏱️ {interest.estimated_completion_time}
                              </div>
                            )}
                          </div>
                        </div>

                        {interest.message && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                              <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                              <div>
                                <div className="font-medium text-blue-800 mb-1">Mensaje del AS:</div>
                                <p className="text-blue-700">{interest.message}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {(interest.availability_date || interest.availability_time) && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            {interest.availability_date && (
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Disponible: {new Date(interest.availability_date).toLocaleDateString()}
                              </span>
                            )}
                            {interest.availability_time && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {interest.availability_time}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <Link href={`/explorador/profesional/${interest.as_id}`}>
                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                              Ver Perfil Completo
                            </button>
                          </Link>
                          
                          <button
                            onClick={() => handleAcceptAS(interest.id, interest.proposed_price)}
                            disabled={acceptingAS === interest.id}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                          >
                            {acceptingAS === interest.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Aceptando...
                              </>
                            ) : (
                              <>
                                <ThumbsUp className="h-5 w-5 mr-2" />
                                Aceptar y Chatear
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Request Status */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Estado de la Solicitud</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado</span>
                    <span className="font-semibold text-green-600 capitalize">{request.status}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AS interesados</span>
                    <span className="font-semibold">{interests.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vistas</span>
                    <span className="font-semibold">{request.views_count}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expira</span>
                    <span className="font-semibold text-orange-600">
                      {new Date(request.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-800 mb-4">💡 Consejos</h3>
                
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Revisa el perfil completo de cada AS antes de decidir</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Considera las calificaciones y experiencia</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Al aceptar un AS, se abrirá un chat privado</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Acuerden los detalles antes de confirmar el trabajo</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="space-y-3">
                  <Link href="/explorador/dashboard">
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      Volver al Panel
                    </button>
                  </Link>
                  
                  <Link href="/explorador/buscar-servicio">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Crear Nueva Solicitud
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
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

export default SolicitudDetailPage;