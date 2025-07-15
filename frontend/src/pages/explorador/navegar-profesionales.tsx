import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid 
} from '@heroicons/react/24/solid';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { categoriesService } from '@/services/categories';
import { ExplorerBrowseParams } from '@/types/explorer';

// Localidades de Chubut
const CHUBUT_LOCALITIES = [
  'Rawson', 'Trelew', 'Puerto Madryn', 'Comodoro Rivadavia', 'Esquel',
  'Gaiman', 'Dolavon', 'Rada Tilly', 'Trevelin', 'Puerto Pirámides',
  'Sarmiento', 'Río Mayo', 'Alto Río Senguer', 'Gobernador Costa',
  'Las Plumas', 'Gastre', 'Paso de Indios', 'Tecka', 'Gualjaina',
  'El Maitén', 'El Hoyo', 'Epuyén', 'Cholila', 'Lago Puelo',
  'José de San Martín', 'Facundo', 'Playa Unión', 'Playa Magagna'
];

const NavegarProfesionalesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [filters, setFilters] = useState<ExplorerBrowseParams>({
    category_id: undefined,
    locality: '',
    min_rating: 0,
    subscription_type: '',
    sort_by: 'rating',
    limit: 12,
    offset: 0
  });

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      loadInitialData();
    }
  }, [user, loading]);

  useEffect(() => {
    if (categories.length > 0) {
      loadProfessionals(true);
    }
  }, [filters, categories]);

  const loadInitialData = async () => {
    try {
      const categoriesRes = await categoriesService.getAllCategories();
      setCategories(categoriesRes);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProfessionals = async (reset = false) => {
    try {
      setLoadingProfessionals(true);
      
      const searchFilters = {
        ...filters,
        offset: reset ? 0 : filters.offset
      };

      const response = await explorerService.browseAS(searchFilters);
      
      if (response.success) {
        if (reset) {
          setProfessionals(response.data.profiles);
        } else {
          setProfessionals(prev => [...prev, ...response.data.profiles]);
        }
        setHasMore(response.data.has_more);
        
        if (!reset) {
          setFilters(prev => ({ ...prev, offset: (prev.offset || 0) + (prev.limit || 12) }));
        }
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoadingProfessionals(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ExplorerBrowseParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      category_id: undefined,
      locality: '',
      min_rating: 0,
      subscription_type: '',
      sort_by: 'rating',
      limit: 12,
      offset: 0
    });
    setSearchText('');
  };

  const getSubscriptionBadge = (type: string) => {
    const badges = {
      free: { text: 'Gratuito', color: 'bg-gray-100 text-gray-800' },
      basic: { text: 'Básico', color: 'bg-blue-100 text-blue-800' },
      premium: { text: 'Premium', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[type as keyof typeof badges] || badges.free;
  };

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { text: 'Verificado', color: 'text-green-600', icon: CheckBadgeIcon },
      pending: { text: 'Pendiente', color: 'text-yellow-600', icon: UserIcon },
      rejected: { text: 'No verificado', color: 'text-gray-600', icon: UserIcon }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Explorar Profesionales - Fixia</title>
        <meta name="description" content="Descubre los mejores profesionales de servicios en Chubut" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/explorador/dashboard">
                  <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Explorar Profesionales
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Descubre los mejores AS de Chubut
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filtros</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filtrar Profesionales</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange({ category_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locality Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localidad
                  </label>
                  <select
                    value={filters.locality || ''}
                    onChange={(e) => handleFilterChange({ locality: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las localidades</option>
                    {CHUBUT_LOCALITIES.map((locality) => (
                      <option key={locality} value={locality}>
                        {locality}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación mínima
                  </label>
                  <select
                    value={filters.min_rating || 0}
                    onChange={(e) => handleFilterChange({ min_rating: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Cualquier calificación</option>
                    <option value={3}>3+ estrellas</option>
                    <option value={4}>4+ estrellas</option>
                    <option value={5}>5 estrellas</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sort_by || 'rating'}
                    onChange={(e) => handleFilterChange({ sort_by: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="rating">Mejor calificados</option>
                    <option value="price">Menor precio</option>
                    <option value="newest">Más recientes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Limpiar filtros
                </button>
                
                <div className="text-sm text-gray-600">
                  {professionals.length} profesionales encontrados
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {professionals.map((professional) => (
              <div key={professional.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {professional.profile_image ? (
                        <img 
                          src={professional.profile_image} 
                          alt={`${professional.first_name} ${professional.last_name}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-lg">
                          {professional.first_name[0]}{professional.last_name[0]}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {professional.first_name} {professional.last_name}
                        </h3>
                        {professional.verification_status === 'verified' && (
                          <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 mb-2">
                        {professional.avg_rating ? (
                          <>
                            {renderStars(Math.round(professional.avg_rating))}
                            <span className="text-sm text-gray-600 ml-1">
                              {professional.avg_rating.toFixed(1)} ({professional.total_reviews})
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Sin calificaciones</span>
                        )}
                      </div>

                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionBadge(professional.subscription_type).color}`}>
                        {getSubscriptionBadge(professional.subscription_type).text}
                      </span>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-3">
                    {professional.years_experience && (
                      <div className="text-sm text-gray-600">
                        <strong>{professional.years_experience}</strong> años de experiencia
                      </div>
                    )}

                    {professional.work_localities && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span className="truncate">{professional.work_localities}</span>
                      </div>
                    )}

                    {professional.base_price && (
                      <div className="flex items-center text-sm text-green-600">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        <span>Desde ${professional.base_price.toLocaleString()}</span>
                      </div>
                    )}

                    {professional.about_me && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {professional.about_me}
                      </p>
                    )}

                    {professional.portfolio_count > 0 && (
                      <div className="text-sm text-blue-600">
                        📁 {professional.portfolio_count} trabajos en portafolio
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t">
                    <Link href={`/explorador/profesional/${professional.id}`}>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Ver Perfil Completo
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading More */}
          {loadingProfessionals && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando profesionales...</p>
            </div>
          )}

          {/* Load More Button */}
          {!loadingProfessionals && hasMore && professionals.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => loadProfessionals(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cargar más profesionales
              </button>
            </div>
          )}

          {/* No Results */}
          {!loadingProfessionals && professionals.length === 0 && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron profesionales
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavegarProfesionalesPage;