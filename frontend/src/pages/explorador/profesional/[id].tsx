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
  User,
  MessageCircle,
  Clock,
  Building,
  Image,
  Phone,
  Mail,
  Calendar,
  GraduationCap
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { ASProfileForExplorer, ExplorerASReview } from '@/types/explorer';
import { FixiaAvatar, FixiaServiceImage } from '@/components/ui';

const ProfesionalDetailPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [profile, setProfile] = useState<ASProfileForExplorer | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('perfil');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (id && user) {
      loadProfile();
    }
  }, [id, user, loading]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await explorerService.getASProfile(parseInt(id as string));
      
      if (response.success) {
        setProfile(response.data);
      } else {
        router.push('/explorador/navegar-profesionales');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      router.push('/explorador/navegar-profesionales');
    } finally {
      setLoadingProfile(false);
    }
  };

  const getSubscriptionBadge = (type: string) => {
    const badges = {
      free: { text: 'Gratuito', color: 'bg-gray-100 text-gray-800' },
      basic: { text: 'Básico', color: 'bg-blue-100 text-blue-800' },
      premium: { text: 'Premium', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[type as keyof typeof badges] || badges.free;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
    
    if (diffInMonths < 1) return 'Nuevo miembro';
    if (diffInMonths < 12) return `${diffInMonths} meses en Fixia`;
    const years = Math.floor(diffInMonths / 12);
    return `${years} año${years > 1 ? 's' : ''} en Fixia`;
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil del profesional...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profesional no encontrado</h2>
          <Link href="/explorador/navegar-profesionales">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Volver a explorar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{profile.basic_info.first_name} {profile.basic_info.last_name} - Profesional en Fixia</title>
        <meta name="description" content={`Perfil profesional de ${profile.basic_info.first_name} en Fixia - ${profile.basic_info.about_me}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/explorador/navegar-profesionales">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Perfil Profesional
                </h1>
                <p className="text-gray-600 mt-1">
                  Información detallada del AS
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border">
                {/* Profile Header */}
                <div className="p-8 border-b">
                  <div className="flex items-start space-x-6">
                    <FixiaAvatar
                      src={profile.basic_info.profile_image}
                      alt={`${profile.basic_info.first_name} ${profile.basic_info.last_name}`}
                      fallbackText={`${profile.basic_info.first_name} ${profile.basic_info.last_name}`}
                      size="2xl"
                      variant="professional"
                      priority={true}
                      className="w-24 h-24"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-3xl font-bold text-gray-900">
                          {profile.basic_info.first_name} {profile.basic_info.last_name}
                        </h2>
                        {profile.basic_info.verification_status === 'verified' && (
                          <ShieldCheck className="h-8 w-8 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        {profile.basic_info.avg_rating ? (
                          <>
                            {renderStars(Math.round(profile.basic_info.avg_rating))}
                            <span className="text-lg font-medium text-gray-700 ml-2">
                              {profile.basic_info.avg_rating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                              ({profile.basic_info.total_reviews} reseñas)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">Sin calificaciones aún</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionBadge(profile.basic_info.subscription_type).color}`}>
                          {getSubscriptionBadge(profile.basic_info.subscription_type).text}
                        </span>
                        
                        {profile.basic_info.years_experience && (
                          <div className="flex items-center text-gray-600">
                            <GraduationCap className="h-5 w-5 mr-1" />
                            <span className="text-sm">
                              {profile.basic_info.years_experience} años de experiencia
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-gray-600 text-sm">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {formatMemberSince(profile.basic_info.created_at)}
                      </div>
                    </div>
                  </div>

                  {profile.basic_info.about_me && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Sobre mí</h3>
                      <p className="text-gray-700 leading-relaxed">{profile.basic_info.about_me}</p>
                    </div>
                  )}
                </div>

                {/* Navigation Tabs */}
                <div className="border-b">
                  <nav className="flex space-x-8 px-8">
                    {[
                      { id: 'perfil', label: 'Perfil' },
                      { id: 'servicios', label: 'Servicios' },
                      { id: 'portafolio', label: 'Portafolio' },
                      { id: 'reseñas', label: 'Reseñas' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === 'perfil' && (
                    <div className="space-y-8">
                      {/* Categories */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías de Trabajo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profile.categories.map((category) => (
                            <div key={category.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">{category.category_icon}</span>
                              <span className="font-medium text-gray-900">{category.category_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Work Locations */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Zonas de Trabajo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profile.locations.map((location) => (
                            <div key={location.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <MapPin className="h-5 w-5 text-blue-600" />
                              <span className="text-gray-900">{location.locality}</span>
                              {location.service_radius > 0 && (
                                <span className="text-sm text-gray-600">
                                  ({location.service_radius}km radio)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'servicios' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios y Servicios</h3>
                      {profile.pricing.length > 0 ? (
                        <div className="space-y-4">
                          {profile.pricing.map((price) => (
                            <div key={price.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{price.category_name}</h4>
                                  <p className="text-sm text-gray-600 capitalize">{price.service_type}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">
                                    ${price.base_price.toLocaleString()} {price.currency}
                                  </div>
                                  <div className="text-sm text-gray-500">Precio base</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          El profesional no ha configurado precios públicos aún
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'portafolio' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Portafolio de Trabajos</h3>
                      {profile.portfolio.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {profile.portfolio.map((item) => (
                            <div key={item.id} className="border rounded-lg overflow-hidden">
                              {item.image_url && (
                                <FixiaServiceImage
                                  src={item.image_url}
                                  alt={item.title}
                                  variant="portfolio"
                                  isFeatured={item.is_featured}
                                  showOverlay={true}
                                  containerClassName="aspect-video"
                                  quality={90}
                                />
                              )}
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                                  {item.is_featured && (
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                      Destacado
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-label="Sin portafolio" />
                          <p className="text-gray-500">El profesional no ha agregado trabajos a su portafolio</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'reseñas' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Reseñas de Clientes ({profile.recent_reviews.length})
                      </h3>
                      {profile.recent_reviews.length > 0 ? (
                        <div className="space-y-6">
                          {profile.recent_reviews.map((review) => (
                            <div key={review.id} className="border rounded-lg p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-medium">
                                      {review.as_name?.[0] || 'A'}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {`${review.as_name || ''} ${review.as_last_name || ''}`.trim() || 'Profesional'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatDate(review.created_at)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                  <span className="ml-2 font-medium">{review.rating}/5</span>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4">{review.comment}</p>
                              
                              {review.service_title && (
                                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                                  Servicio: {review.service_title}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          El profesional no tiene reseñas aún
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contactar Profesional</h3>
                
                <div className="space-y-4">
                  <Link href="/explorador/buscar-servicio">
                    <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Crear Solicitud de Servicio
                    </button>
                  </Link>
                  
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contactar Directo
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Responde en promedio en 2 horas</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      <span>Trabajos completados: {profile.basic_info.total_reviews}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Calificación promedio</span>
                    <span className="font-semibold">
                      {profile.basic_info.avg_rating ? `${profile.basic_info.avg_rating.toFixed(1)}/5` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total de reseñas</span>
                    <span className="font-semibold">{profile.basic_info.total_reviews}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Categorías de trabajo</span>
                    <span className="font-semibold">{profile.categories.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Zonas de cobertura</span>
                    <span className="font-semibold">{profile.locations.length}</span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Estado de Verificación</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Identidad</span>
                    <div className="flex items-center">
                      {profile.basic_info.verification_status === 'verified' ? (
                        <>
                          <ShieldCheck className="h-5 w-5 text-green-600 mr-1" />
                          <span className="text-green-600 font-medium">Verificado</span>
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5 text-gray-400 mr-1" />
                          <span className="text-gray-500">Pendiente</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Miembro desde</span>
                    <span className="text-gray-900 font-medium">
                      {formatMemberSince(profile.basic_info.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contactar Profesional</h3>
            <p className="text-gray-600 mb-6">
              Para contactar directamente con {profile.basic_info.first_name}, primero debes crear una solicitud de servicio específica.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <Link href="/explorador/buscar-servicio" className="flex-1">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Crear Solicitud
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Deshabilitar SSG para evitar errores de AuthProvider
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default ProfesionalDetailPage;