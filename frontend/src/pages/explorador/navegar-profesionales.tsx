import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { categoriesService } from '@/services/categories';
import { ExplorerBrowseParams } from '@/types/explorer';
import { CorporateLayout, CorporateCard, CorporateButton, CorporateInput, CorporateHeader } from '@/components/ui';
import Logo from '@/components/Logo';

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
        // Calculate profile completeness and sort by quality
        const enhancedProfiles = response.data.profiles.map((professional: any) => ({
          ...professional,
          profile_completeness: calculateProfileCompleteness(professional),
          quality_score: calculateQualityScore(professional)
        }));

        // Sort by quality score (best first)
        const sortedProfiles = enhancedProfiles.sort((a, b) => b.quality_score - a.quality_score);

        if (reset) {
          setProfessionals(sortedProfiles);
        } else {
          setProfessionals(prev => [...prev, ...sortedProfiles]);
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

  // Calculate profile completeness (0-100%)
  const calculateProfileCompleteness = (professional: any) => {
    let completeness = 0;
    const fields = [
      'profile_image', 'about_me', 'years_experience', 'work_localities',
      'base_price', 'portfolio_count', 'phone', 'email'
    ];
    
    fields.forEach(field => {
      if (professional[field]) {
        completeness += 12.5; // 100% / 8 fields
      }
    });
    
    return Math.round(completeness);
  };

  // Calculate quality score for ranking
  const calculateQualityScore = (professional: any) => {
    let score = 0;
    
    // Rating weight (40%)
    if (professional.avg_rating && professional.total_reviews > 0) {
      score += (professional.avg_rating / 5) * 40;
    }
    
    // Profile completeness weight (30%)
    const completeness = calculateProfileCompleteness(professional);
    score += (completeness / 100) * 30;
    
    // Verification status weight (20%)
    if (professional.verification_status === 'verified') {
      score += 20;
    } else if (professional.verification_status === 'pending') {
      score += 10;
    }
    
    // Experience weight (10%)
    if (professional.years_experience) {
      score += Math.min(professional.years_experience / 10, 1) * 10;
    }
    
    return score;
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
      <CorporateLayout variant="centered">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary-600 mx-auto mb-6"></div>
          <p className="text-secondary-600 font-semibold">Cargando profesionales...</p>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Explorar AS | FIXIA</title>
        <meta name="description" content="Descubre los mejores AS certificados de Chubut - Plataforma profesional de servicios" />
        <meta name="keywords" content="AS, ases, servicios, Chubut, FIXIA, explorar, buscar" />
      </Head>

      <CorporateLayout variant="default">
        <CorporateHeader
          title="Explorar AS"
          subtitle="Descubre los mejores AS certificados de Chubut"
          backUrl="/explorador/dashboard"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Expert-level Header with Perfect Spacing & Hierarchy */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-6">
              {/* Premium Visual Indicator */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-trust-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <EyeIcon className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-trust-500 to-secondary-500 rounded-2xl opacity-20 blur-xl -z-10"></div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-secondary-900 tracking-tight">
                  {professionals.length} AS 
                  <span className="text-primary-600 ml-2">disponibles</span>
                </h2>
                <p className="text-secondary-600 text-base font-medium leading-relaxed">
                  Encuentra el AS perfecto para tu proyecto
                </p>
                {/* Subtle breadcrumb */}
                <div className="flex items-center space-x-2 text-xs text-secondary-400 font-medium">
                  <span>Chubut</span>
                  <span>•</span>
                  <span>Servicios verificados</span>
                  <span>•</span>
                  <span>Ordenados por calidad</span>
                </div>
              </div>
            </div>

            {/* Premium Filter Toggle */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-sm text-secondary-600">
                <span>Filtros</span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${showFilters ? 'bg-primary-500' : 'bg-secondary-300'}`}></div>
              </div>
              <CorporateButton
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "primary" : "outline"}
                leftIcon={<span>📊</span>}
                className="relative group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10">
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </span>
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-trust-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </CorporateButton>
            </div>
          </div>

          {/* Expert-level Filters Panel with Perfect Visual Hierarchy */}
          {showFilters && (
            <div className="mb-12 transform transition-all duration-500 ease-out">
              <CorporateCard variant="glass" className="relative backdrop-blur-2xl bg-white/98 border border-white/60 shadow-2xl overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white/80 to-trust-50/30 -z-10"></div>
                
                {/* Premium Header with Perfect Spacing */}
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-secondary-200/50">
                  <div className="flex items-center space-x-5">
                    <div className="relative group">
                      <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 via-trust-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <AdjustmentsHorizontalIcon className="h-6 w-6 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 via-trust-500 to-primary-500 rounded-2xl opacity-20 blur-xl -z-10"></div>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-secondary-900 tracking-tight">
                        Filtros 
                        <span className="text-primary-600 ml-2">Avanzados</span>
                      </h2>
                      <p className="text-secondary-600 text-base font-medium leading-relaxed">
                        Personaliza tu búsqueda de AS profesionales
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-secondary-400 font-medium">
                        <span>Tiempo real</span>
                        <span>•</span>
                        <span>Filtros inteligentes</span>
                      </div>
                    </div>
                  </div>
                  
                  <CorporateButton
                    onClick={() => setShowFilters(false)}
                    variant="ghost"
                    size="sm"
                    className="text-secondary-600 hover:text-secondary-900 relative group"
                  >
                    <span className="transform group-hover:rotate-90 transition-transform duration-300">×</span>
                  </CorporateButton>
                </div>

              {/* Expert-level Filter Grid with Perfect Visual Balance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Category Filter - Premium Design */}
                <div className="group relative">
                  <label className="block text-sm font-bold text-secondary-800 mb-4 tracking-tight">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-trust-500 rounded-lg flex items-center justify-center shadow-lg">
                        <TagIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-base">Categoría</span>
                        <div className="text-xs text-secondary-500 font-medium">Especialización</div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.category_id || ''}
                      onChange={(e) => handleFilterChange({ category_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full border-2 border-secondary-200 rounded-2xl px-5 py-4 pr-12 focus:ring-4 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-secondary-900 shadow-lg hover:shadow-xl group-hover:border-primary-300 text-base"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                    {/* Premium dropdown arrow */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-trust-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locality Filter - Premium Design */}
                <div className="group relative">
                  <label className="block text-sm font-bold text-secondary-800 mb-4 tracking-tight">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-trust-500 to-accent-500 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white">📍</span>
                      </div>
                      <div>
                        <span className="text-base">Localidad</span>
                        <div className="text-xs text-secondary-500 font-medium">Ubicación</div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.locality || ''}
                      onChange={(e) => handleFilterChange({ locality: e.target.value })}
                      className="w-full border-2 border-secondary-200 rounded-2xl px-5 py-4 pr-12 focus:ring-4 focus:ring-trust-500/30 focus:border-trust-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-secondary-900 shadow-lg hover:shadow-xl group-hover:border-trust-300 text-base"
                    >
                      <option value="">Todas las localidades</option>
                      {CHUBUT_LOCALITIES.map((locality) => (
                        <option key={locality} value={locality}>
                          {locality}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-br from-trust-500 to-accent-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Filter - Premium Design */}
                <div className="group relative">
                  <label className="block text-sm font-bold text-secondary-800 mb-4 tracking-tight">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white">★</span>
                      </div>
                      <div>
                        <span className="text-base">Calificación</span>
                        <div className="text-xs text-secondary-500 font-medium">Mínima</div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.min_rating || 0}
                      onChange={(e) => handleFilterChange({ min_rating: parseInt(e.target.value) })}
                      className="w-full border-2 border-secondary-200 rounded-2xl px-5 py-4 pr-12 focus:ring-4 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-secondary-900 shadow-lg hover:shadow-xl group-hover:border-yellow-300 text-base"
                    >
                      <option value={0}>Cualquier calificación</option>
                      <option value={3}>⭐⭐⭐ 3+ estrellas</option>
                      <option value={4}>⭐⭐⭐⭐ 4+ estrellas</option>
                      <option value={5}>⭐⭐⭐⭐⭐ 5 estrellas</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sort By - Premium Design */}
                <div className="group relative">
                  <label className="block text-sm font-bold text-secondary-800 mb-4 tracking-tight">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-success-500 rounded-lg flex items-center justify-center shadow-lg">
                        <PresentationChartLineIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-base">Ordenar</span>
                        <div className="text-xs text-secondary-500 font-medium">Por</div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.sort_by || 'rating'}
                      onChange={(e) => handleFilterChange({ sort_by: e.target.value as any })}
                      className="w-full border-2 border-secondary-200 rounded-2xl px-5 py-4 pr-12 focus:ring-4 focus:ring-accent-500/30 focus:border-accent-500 transition-all duration-300 bg-white/90 backdrop-blur-sm font-semibold text-secondary-900 shadow-lg hover:shadow-xl group-hover:border-accent-300 text-base"
                    >
                      <option value="rating">🏆 Mejor calificados</option>
                      <option value="price">💰 Menor precio</option>
                      <option value="newest">🆕 Más recientes</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-br from-accent-500 to-success-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Filter Footer */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gradient-to-r from-transparent via-secondary-200 to-transparent">
                <div className="flex items-center space-x-4">
                  <CorporateButton
                    onClick={clearFilters}
                    variant="ghost"
                    size="md"
                    className="text-secondary-600 hover:text-secondary-900 group"
                    leftIcon={<span className="group-hover:rotate-90 transition-transform duration-300">×</span>}
                  >
                    Limpiar filtros
                  </CorporateButton>
                  
                  <div className="hidden md:flex items-center space-x-2 text-xs text-secondary-500">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <span>Filtros activos: {Object.values(filters).filter(v => v && v !== 0 && v !== 'rating').length}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white">✓</span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-secondary-900">
                        {professionals.length}
                      </div>
                      <div className="text-xs text-secondary-600 font-medium leading-tight">
                        AS encontrados
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center space-x-2 text-xs text-secondary-500">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Ordenados por calidad</span>
                  </div>
                </div>
              </div>
            </CorporateCard>
            </div>
          )}

          {/* Premium AS Grid - Expert Level Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {professionals.map((professional) => (
              <CorporateCard 
                key={professional.id} 
                variant="elevated" 
                hover 
                glow 
                className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
              >
                {/* Premium Background Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-trust-500 to-accent-500 transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-500" />
                
                <div className="relative z-10">
                  {/* Expert Profile Header */}
                  <div className="flex items-start space-x-5 mb-7">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-trust-500 to-accent-500 rounded-3xl flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-white/70 group-hover:ring-primary-500/30 transition-all duration-500">
                        {professional.profile_image ? (
                          <img 
                            src={professional.profile_image} 
                            alt={`${professional.first_name} ${professional.last_name}`}
                            className="w-20 h-20 rounded-3xl object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-white font-black text-xl tracking-tight">
                            {professional.first_name[0]}{professional.last_name[0]}
                          </span>
                        )}
                      </div>
                      
                      {/* Premium Verification Badge */}
                      {professional.verification_status === 'verified' && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-lg ring-3 ring-white group-hover:scale-110 transition-all duration-300">
                          <span className="text-white">✓</span>
                        </div>
                      )}
                      
                      {/* Enhanced Profile Completeness Ring */}
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl ring-2 ring-secondary-100 group-hover:ring-primary-200 transition-all duration-300">
                        <div className="relative w-7 h-7">
                          <svg className="w-7 h-7 transform -rotate-90" viewBox="0 0 24 24">
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="2.5"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="none"
                              stroke={professional.profile_completeness > 80 ? "#10b981" : professional.profile_completeness > 60 ? "#f59e0b" : "#ef4444"}
                              strokeWidth="2.5"
                              strokeDasharray={`${(professional.profile_completeness / 100) * 62.83} 62.83`}
                              className="transition-all duration-500 group-hover:stroke-[3]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-black text-secondary-800">
                              {professional.profile_completeness}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-secondary-900 truncate text-lg group-hover:text-primary-600 transition-colors duration-300 tracking-tight">
                            {professional.first_name} {professional.last_name}
                          </h3>
                          
                          {/* Premium Rating Display */}
                          <div className="flex items-center space-x-2 mt-2">
                            {professional.avg_rating ? (
                              <>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                      key={star}
                                      className={`h-4 w-4 transition-all duration-300 ${
                                        star <= Math.round(professional.avg_rating) 
                                          ? 'text-yellow-400 fill-current drop-shadow-sm' 
                                          : 'text-secondary-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 px-2 py-1 rounded-lg">
                                  <span className="text-sm text-yellow-800 font-bold">
                                    {professional.avg_rating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-yellow-700 font-medium ml-1">
                                    ({professional.total_reviews})
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="bg-secondary-100 px-3 py-1 rounded-lg">
                                <span className="text-sm text-secondary-600 font-medium">Nuevo AS</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black ${getSubscriptionBadge(professional.subscription_type).color} shadow-lg ring-2 ring-white/50 group-hover:scale-105 transition-all duration-300`}>
                          {getSubscriptionBadge(professional.subscription_type).text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Trust & Experience Grid */}
                  <div className="space-y-4">
                    {/* Expert Experience Display */}
                    {professional.years_experience && (
                      <div className="group/indicator flex items-center space-x-3 p-3 bg-gradient-to-r from-success-50/80 to-accent-50/80 rounded-2xl border border-success-200/50 hover:border-success-300 transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-success-500 via-success-600 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover/indicator:scale-110 transition-transform duration-300">
                          <TrophyIcon className="h-5 w-5 text-white drop-shadow-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-base font-black text-secondary-900 tracking-tight">
                              {professional.years_experience} años
                            </span>
                            <div className="w-1.5 h-1.5 bg-success-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-success-700 font-semibold uppercase tracking-wide">
                            Experiencia Verificada
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Premium Location Display */}
                    {professional.work_localities && (
                      <div className="group/indicator flex items-center space-x-3 p-3 bg-gradient-to-r from-trust-50/80 to-primary-50/80 rounded-2xl border border-trust-200/50 hover:border-trust-300 transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-trust-500 via-trust-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover/indicator:scale-110 transition-transform duration-300">
                          <span className="text-white drop-shadow-sm">📍</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-base font-black text-secondary-900 truncate tracking-tight">
                              {professional.work_localities}
                            </span>
                            <div className="w-1.5 h-1.5 bg-trust-500 rounded-full animate-pulse"></div>
                          </div>
                          <span className="text-xs text-trust-700 font-semibold uppercase tracking-wide">
                            Disponible en Tu Zona
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Premium Pricing Display */}
                    {professional.base_price && (
                      <div className="group/indicator flex items-center space-x-3 p-3 bg-gradient-to-r from-success-50/80 to-trust-50/80 rounded-2xl border border-success-200/50 hover:border-success-300 transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-success-500 via-success-600 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg group-hover/indicator:scale-110 transition-transform duration-300">
                          <CurrencyDollarIcon className="h-5 w-5 text-white drop-shadow-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-base font-black text-success-800 tracking-tight">
                              ${professional.base_price.toLocaleString()}
                            </span>
                            <span className="text-xs text-secondary-600 font-medium">desde</span>
                          </div>
                          <span className="text-xs text-success-700 font-semibold uppercase tracking-wide">
                            Precios Transparentes
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Premium Portfolio Display */}
                    {professional.portfolio_count > 0 && (
                      <div className="group/indicator flex items-center space-x-3 p-3 bg-gradient-to-r from-accent-50/80 to-trust-50/80 rounded-2xl border border-accent-200/50 hover:border-accent-300 transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 via-accent-600 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg group-hover/indicator:scale-110 transition-transform duration-300">
                          <CameraIcon className="h-5 w-5 text-white drop-shadow-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-base font-black text-secondary-900 tracking-tight">
                              {professional.portfolio_count} trabajos
                            </span>
                            <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-accent-700 font-semibold uppercase tracking-wide">
                            Portafolio Verificado
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Premium About Me Preview */}
                    {professional.about_me && (
                      <div className="relative group/about p-4 bg-gradient-to-br from-secondary-50/90 via-white to-primary-50/30 rounded-2xl border border-secondary-200/70 hover:border-primary-300/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 via-trust-500 to-accent-500 opacity-0 group-hover/about:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="text-white text-xs font-bold">"</span>
                          </div>
                          <p className="text-sm text-secondary-700 line-clamp-3 font-medium leading-relaxed italic group-hover/about:text-secondary-800 transition-colors duration-300">
                            {professional.about_me}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Premium Action Section */}
                  <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-secondary-200 to-transparent relative">
                    {/* Subtle border enhancement */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-primary-500 to-trust-500 rounded-full"></div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Link href={`/explorador/profesional/${professional.id}`}>
                        <CorporateButton
                          className="w-full group relative overflow-hidden"
                          size="md"
                          variant="outline"
                          rightIcon={<EyeIcon className="h-4 w-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />}
                        >
                          <span className="relative z-10 font-bold tracking-tight">Ver Perfil</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-trust-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </CorporateButton>
                      </Link>
                      
                      <Link href={`/explorador/chat/new?as_id=${professional.id}`}>
                        <CorporateButton
                          className="w-full group relative overflow-hidden"
                          size="md"
                          rightIcon={<ChatBubbleLeftRightIcon className="h-4 w-4 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300" />}
                        >
                          <span className="relative z-10 font-bold tracking-tight">Chatear</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-success-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </CorporateButton>
                      </Link>
                    </div>
                    
                    {/* Premium Trust Indicators Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="group/trust flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-success-50/80 to-success-100/60 rounded-2xl border border-success-200/50 hover:border-success-300 transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-lg group-hover/trust:scale-110 transition-transform duration-300">
                          <ShieldCheckIcon className="h-4 w-4 text-white drop-shadow-sm" />
                        </div>
                        <span className="text-xs font-bold text-success-700 uppercase tracking-wide text-center leading-tight">
                          Verificado
                        </span>
                      </div>
                      
                      <div className="group/trust flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-primary-50/80 to-primary-100/60 rounded-2xl border border-primary-200/50 hover:border-primary-300 transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover/trust:scale-110 transition-transform duration-300">
                          <ClockIcon className="h-4 w-4 text-white drop-shadow-sm" />
                        </div>
                        <span className="text-xs font-bold text-primary-700 uppercase tracking-wide text-center leading-tight">
                          Responde<br />2h
                        </span>
                      </div>
                      
                      <div className="group/trust flex flex-col items-center space-y-2 p-3 bg-gradient-to-br from-accent-50/80 to-accent-100/60 rounded-2xl border border-accent-200/50 hover:border-accent-300 transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg group-hover/trust:scale-110 transition-transform duration-300">
                          <HeartIcon className="h-4 w-4 text-white drop-shadow-sm" />
                        </div>
                        <span className="text-xs font-bold text-accent-700 uppercase tracking-wide text-center leading-tight">
                          Confiable
                        </span>
                      </div>
                    </div>
                    
                    {/* Subtle Quality Indicator */}
                    <div className="mt-4 flex items-center justify-center">
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-secondary-100/80 to-primary-100/80 px-4 py-2 rounded-full border border-secondary-200/50">
                        <div className="w-2 h-2 bg-gradient-to-r from-success-500 to-accent-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-secondary-700 uppercase tracking-wide">
                          AS de Calidad
                        </span>
                        <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-trust-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CorporateCard>
            ))}
          </div>

          {/* Premium Loading State */}
          {loadingProfessionals && (
            <div className="text-center py-20">
              <CorporateCard variant="elevated" className="max-w-md mx-auto" glow>
                <div className="flex flex-col items-center space-y-6">
                  {/* Advanced Loading Animation */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 via-trust-500 to-accent-500 animate-spin"></div>
                    <div className="absolute inset-2 w-12 h-12 rounded-full bg-white"></div>
                    <div className="absolute inset-4 w-8 h-8 rounded-full bg-gradient-to-r from-accent-500 via-primary-500 to-trust-500 animate-pulse"></div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-secondary-900 tracking-tight">
                      Cargando AS de Calidad
                    </h3>
                    <p className="text-secondary-600 font-medium">
                      Buscando los mejores profesionales para ti
                    </p>
                    
                    {/* Loading dots animation */}
                    <div className="flex items-center justify-center space-x-2 mt-4">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-trust-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </CorporateCard>
            </div>
          )}

          {/* Premium Load More Button */}
          {!loadingProfessionals && hasMore && professionals.length > 0 && (
            <div className="text-center mt-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-trust-500 to-accent-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500"></div>
                <CorporateButton
                  onClick={() => loadProfessionals()}
                  size="lg"
                  variant="outline"
                  className="relative px-12 py-4 font-black tracking-tight group"
                  rightIcon={<RocketLaunchIcon className="h-5 w-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />}
                >
                  <span className="relative z-10">Descubrir Más AS</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </CorporateButton>
              </div>
            </div>
          )}

          {/* Premium No More Results */}
          {!loadingProfessionals && !hasMore && professionals.length > 0 && (
            <div className="text-center mt-16">
              <CorporateCard variant="elevated" className="max-w-lg mx-auto relative overflow-hidden" glow>
                {/* Celebration background */}
                <div className="absolute inset-0 bg-gradient-to-br from-success-50/80 via-white to-accent-50/80"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-500 via-accent-500 to-primary-500"></div>
                
                <div className="relative z-10 flex items-center space-x-6 p-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-success-500 via-success-600 to-accent-500 rounded-3xl flex items-center justify-center shadow-xl">
                    <span className="text-2xl text-white drop-shadow-sm">✓</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-black text-secondary-900 tracking-tight mb-1">
                      ¡Misión Cumplida! 🎉
                    </h3>
                    <p className="text-secondary-700 font-medium leading-relaxed">
                      Has visto todos los AS disponibles. Prueba ajustando los filtros para descubrir más opciones.
                    </p>
                  </div>
                </div>
              </CorporateCard>
            </div>
          )}

          {/* Premium No Results State */}
          {!loadingProfessionals && professionals.length === 0 && (
            <div className="text-center py-24">
              <CorporateCard variant="elevated" className="max-w-2xl mx-auto relative overflow-hidden" glow>
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/90 via-white to-primary-50/30"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-500 via-trust-500 to-accent-500"></div>
                
                <div className="relative z-10 space-y-8 p-4">
                  {/* Enhanced illustration */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-secondary-400 via-secondary-500 to-trust-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl ring-8 ring-secondary-100/50">
                      <span className="text-4xl text-white drop-shadow-lg">🔍</span>
                    </div>
                    
                    {/* Floating search elements */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-white">★</span>
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <HeartIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black text-secondary-900 tracking-tight">
                      No Encontramos AS
                    </h3>
                    <div className="space-y-3">
                      <p className="text-lg text-secondary-700 font-medium leading-relaxed max-w-md mx-auto">
                        No hay AS disponibles con los filtros actuales.
                      </p>
                      <p className="text-secondary-600 font-medium">
                        Intenta ajustar tus criterios de búsqueda para encontrar más opciones.
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <CorporateButton
                      onClick={clearFilters}
                      variant="outline"
                      size="lg"
                      className="group px-8"
                      leftIcon={<span className="group-hover:rotate-90 transition-transform duration-300">×</span>}
                    >
                      <span className="font-bold tracking-tight">Limpiar Filtros</span>
                    </CorporateButton>
                    
                    <CorporateButton
                      onClick={() => window.location.reload()}
                      size="lg"
                      className="group px-8"
                      rightIcon={<span className="group-hover:rotate-180 transition-transform duration-500">⟳</span>}
                    >
                      <span className="font-bold tracking-tight">Recargar Búsqueda</span>
                    </CorporateButton>
                  </div>
                  
                  {/* Help suggestion */}
                  <div className="bg-gradient-to-r from-primary-50/80 to-trust-50/80 rounded-2xl p-4 border border-primary-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-trust-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">💡</span>
                      </div>
                      <p className="text-sm text-secondary-700 font-medium">
                        <span className="font-bold text-primary-700">Sugerencia:</span> Prueba expandir el rango de ubicación o eliminar algunos filtros específicos.
                      </p>
                    </div>
                  </div>
                </div>
              </CorporateCard>
            </div>
          )}
        </div>
      </CorporateLayout>
    </>
  );
};

export default NavegarProfesionalesPage;