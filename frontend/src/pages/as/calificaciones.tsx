import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeftIcon,
  StarIcon,
  UserIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { useAuth } from '@/contexts/AuthContext';
import { Review, ReviewStats } from '@/types';

const ASCalificaciones: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    // TODO: Fetch real reviews from API
    const mockReviews: Review[] = [
      {
        id: 1,
        customer_id: 101,
        provider_id: user?.id || 1,
        service_id: 1,
        booking_id: 1,
        rating: 5,
        comment: 'Excelente trabajo! Muy profesional y resolvió el problema rápidamente. Recomendado 100%.',
        created_at: '2024-01-17T14:30:00Z',
        updated_at: '2024-01-17T14:30:00Z',
        customer_first_name: 'María',
        customer_last_name: 'González',
        customer_photo: undefined,
        service_title: 'Reparación de Plomería Residencial'
      },
      {
        id: 2,
        customer_id: 102,
        provider_id: user?.id || 1,
        service_id: 2,
        booking_id: 2,
        rating: 5,
        comment: 'Llegó puntual, trabajo limpio y explicó todo lo que hizo. Muy satisfecho con el servicio.',
        created_at: '2024-01-15T16:45:00Z',
        updated_at: '2024-01-15T16:45:00Z',
        customer_first_name: 'Carlos',
        customer_last_name: 'Rodríguez',
        customer_photo: undefined,
        service_title: 'Instalación Eléctrica Completa'
      },
      {
        id: 3,
        customer_id: 103,
        provider_id: user?.id || 1,
        service_id: 1,
        booking_id: 3,
        rating: 4,
        comment: 'Buen trabajo, aunque tardó un poco más de lo esperado. El resultado final fue bueno.',
        created_at: '2024-01-12T10:20:00Z',
        updated_at: '2024-01-12T10:20:00Z',
        customer_first_name: 'Ana',
        customer_last_name: 'López',
        customer_photo: undefined,
        service_title: 'Reparación de Plomería Residencial'
      },
      {
        id: 4,
        customer_id: 104,
        provider_id: user?.id || 1,
        service_id: 3,
        booking_id: 4,
        rating: 5,
        comment: 'Impecable! Dejó todo muy limpio y ordenado. Definitivamente lo contrataré nuevamente.',
        created_at: '2024-01-10T09:15:00Z',
        updated_at: '2024-01-10T09:15:00Z',
        customer_first_name: 'Roberto',
        customer_last_name: 'Martínez',
        customer_photo: undefined,
        service_title: 'Limpieza Profunda de Hogar'
      },
      {
        id: 5,
        customer_id: 105,
        provider_id: user?.id || 1,
        service_id: 1,
        booking_id: 5,
        rating: 4,
        comment: 'Profesional y eficiente. Resolvió el problema sin complicaciones.',
        created_at: '2024-01-08T11:30:00Z',
        updated_at: '2024-01-08T11:30:00Z',
        customer_first_name: 'Laura',
        customer_last_name: 'Fernández',
        customer_photo: undefined,
        service_title: 'Reparación de Plomería Residencial'
      },
      {
        id: 6,
        customer_id: 106,
        provider_id: user?.id || 1,
        service_id: 2,
        booking_id: 6,
        rating: 5,
        comment: 'Excelente servicio, muy recomendable. Trabajo de calidad y precio justo.',
        created_at: '2024-01-05T15:00:00Z',
        updated_at: '2024-01-05T15:00:00Z',
        customer_first_name: 'Diego',
        customer_last_name: 'Silva',
        customer_photo: undefined,
        service_title: 'Instalación Eléctrica Completa'
      },
      {
        id: 7,
        customer_id: 107,
        provider_id: user?.id || 1,
        service_id: 1,
        booking_id: 7,
        rating: 4,
        comment: 'Buen profesional, cumplió con lo acordado. Recomendado.',
        created_at: '2024-01-03T13:45:00Z',
        updated_at: '2024-01-03T13:45:00Z',
        customer_first_name: 'Patricia',
        customer_last_name: 'Morales',
        customer_photo: undefined,
        service_title: 'Reparación de Plomería Residencial'
      },
      {
        id: 8,
        customer_id: 108,
        provider_id: user?.id || 1,
        service_id: 2,
        booking_id: 8,
        rating: 5,
        comment: 'Súper profesional y eficiente. Instalación perfecta, muy contento con el resultado.',
        created_at: '2024-01-01T08:30:00Z',
        updated_at: '2024-01-01T08:30:00Z',
        customer_first_name: 'Andrés',
        customer_last_name: 'Gutiérrez',
        customer_photo: undefined,
        service_title: 'Instalación Eléctrica Completa'
      }
    ];

    setReviews(mockReviews);

    // Calculate stats
    const totalReviews = mockReviews.length;
    const averageRating = totalReviews > 0 
      ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    mockReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    setStats({
      average_rating: averageRating,
      total_reviews: totalReviews,
      rating_distribution: distribution
    });
  }, [user, loading]);

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === filterRating);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
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

  const getRatingTrend = () => {
    if (reviews.length < 2) return null;
    
    const recentReviews = reviews.slice(0, Math.min(3, reviews.length));
    const olderReviews = reviews.slice(3);
    
    if (olderReviews.length === 0) return null;
    
    const recentAvg = recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length;
    const olderAvg = olderReviews.reduce((sum, r) => sum + r.rating, 0) / olderReviews.length;
    
    const diff = recentAvg - olderAvg;
    
    if (Math.abs(diff) < 0.1) return { type: 'stable', value: 0 };
    return { type: diff > 0 ? 'up' : 'down', value: Math.abs(diff) };
  };

  const trend = getRatingTrend();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mis Calificaciones - AS Panel - Fixia</title>
        <meta name="description" content="Gestiona las reseñas y calificaciones de tus servicios como AS en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/as/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Mis Calificaciones</h1>
                <p className="text-gray-600 mt-1">
                  Reseñas y valoraciones de tus clientes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Average Rating */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.average_rating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.average_rating), 'lg')}
                <p className="text-gray-600 mt-2">Calificación promedio</p>
                {trend && (
                  <div className={`flex items-center justify-center mt-2 text-sm ${
                    trend.type === 'up' ? 'text-green-600' :
                    trend.type === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.type === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
                    {trend.type === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                    {trend.type === 'stable' && <MinusIcon className="h-4 w-4 mr-1" />}
                    {trend.type === 'stable' ? 'Estable' : `${trend.value.toFixed(1)} vs anterior`}
                  </div>
                )}
              </div>
            </div>

            {/* Total Reviews */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.total_reviews}
                </div>
                <p className="text-gray-600">Total de reseñas</p>
                <div className="mt-2 text-sm text-gray-500">
                  Últimas 30 días: {reviews.filter(r => {
                    const reviewDate = new Date(r.created_at);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return reviewDate >= thirtyDaysAgo;
                  }).length}
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Distribución</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
                  const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="w-3 text-gray-600">{rating}</span>
                      <StarIconSolid className="h-4 w-4 text-yellow-400 mx-2" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las calificaciones</option>
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>
              <span className="text-sm text-gray-600">
                {filteredReviews.length} de {reviews.length} reseñas
              </span>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filterRating === 'all' ? 'No hay reseñas aún' : 'No hay reseñas con esta calificación'}
                </h3>
                <p className="text-gray-600">
                  {filterRating === 'all' 
                    ? 'Cuando completes servicios, tus clientes podrán dejarte reseñas aquí.'
                    : 'Intenta con un filtro diferente para ver más reseñas.'
                  }
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                        {review.customer_photo ? (
                          <img
                            src={review.customer_photo}
                            alt="Cliente"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.customer_first_name} {review.customer_last_name}
                        </h3>
                        <p className="text-sm text-blue-600">{review.service_title}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {renderStars(review.rating, 'md')}
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 italic">"{review.comment}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Tips for Better Reviews */}
          {reviews.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Consejos para mejores reseñas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <ul className="space-y-2">
                  <li>• Comunícate claramente antes, durante y después del servicio</li>
                  <li>• Llega puntual y con las herramientas necesarias</li>
                  <li>• Mantén el área de trabajo limpia y ordenada</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Explica lo que haces y por qué lo haces</li>
                  <li>• Respeta el tiempo acordado y el presupuesto</li>
                  <li>• Pide feedback al finalizar para mejorar continuamente</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ASCalificaciones;