import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Star,
  Eye,
  Settings,
  Tag,
  BarChart3,
  Trophy,
  DollarSign,
  Camera,
  MessageSquare,
  Shield,
  Clock,
  Heart,
  Rocket,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { categoriesService } from '@/services/categories';
import { ExplorerBrowseParams } from '@/types/explorer';
import { Button, Card, CardContent } from '@/components/ui';

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
      verified: { text: 'Verificado', color: 'text-green-600', icon: Shield },
      pending: { text: 'Pendiente', color: 'text-yellow-600', icon: Clock },
      rejected: { text: 'No verificado', color: 'text-gray-600', icon: Shield }
    };
    return badges[status as keyof typeof badges] || badges.pending;
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

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'
      }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }} />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-40" style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }} />
        </div>
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center p-8 rounded-3xl" style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white/90 font-medium text-lg">Cargando profesionales...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Head>
        <title>Explorar AS | FIXIA</title>
        <meta name="description" content="Descubre los mejores AS certificados de Chubut - Sistema Liquid Glass" />
        <meta name="keywords" content="AS, ases, servicios, Chubut, FIXIA, explorar, buscar, profesionales" />
      </Head>

      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'
      }}>
        {/* Floating Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite'
          }} />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-40" style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }} />
          <div className="absolute -bottom-32 left-1/3 w-64 h-64 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)',
            animation: 'float 30s ease-in-out infinite'
          }} />
        </div>

        <div className="relative z-10 min-h-screen">
          {/* Header con Liquid Glass */}
          <div className="p-6 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="p-6 rounded-3xl" style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Link href="/explorador/dashboard">
                      <button className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                      }}>
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                      </button>
                    </Link>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        <Search className="w-7 h-7 text-blue-300" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-2" style={{
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}>
                          Explorar AS
                        </h1>
                        <p className="text-white/70 font-medium">
                          Descubre los mejores AS certificados de Chubut
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            {/* Stats Header con Liquid Glass */}
            <div className="mb-8 p-6 rounded-3xl" style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
                  }}>
                    <Eye className="w-8 h-8 text-blue-300" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2" style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      {professionals.length} AS 
                      <span className="text-blue-300 ml-2">disponibles</span>
                    </h2>
                    <p className="text-white/70 font-medium mb-2">
                      Encuentra el AS perfecto para tu proyecto
                    </p>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span>Chubut</span>
                      <span>•</span>
                      <span>Servicios verificados</span>
                      <span>•</span>
                      <span>Ordenados por calidad</span>
                    </div>
                  </div>
                </div>

                {/* Filter Toggle con Liquid Glass */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: showFilters 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: showFilters 
                      ? '0 8px 32px rgba(59, 130, 246, 0.3)'
                      : '0 8px 32px rgba(0, 0, 0, 0.2)',
                    color: 'white'
                  }}
                >
                  <Filter className="w-5 h-5" />
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </button>
              </div>
            </div>

            {/* Filters Panel con Liquid Glass */}
            {showFilters && (
              <div className="mb-8 transition-all duration-500 ease-out">
                <div className="p-8 rounded-3xl" style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  {/* Filter Header */}
                  <div className="flex items-center justify-between mb-8 pb-6" style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                        background: 'rgba(139, 92, 246, 0.2)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}>
                        <Settings className="w-6 h-6 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1" style={{
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}>
                          Filtros Avanzados
                        </h3>
                        <p className="text-white/70 font-medium">
                          Personaliza tu búsqueda de AS profesionales
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white'
                      }}
                    >
                      ×
                    </button>
                  </div>

              {/* Filters Grid with Liquid Glass */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter with Liquid Glass */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <Tag className="w-4 h-4 text-blue-300" />
                    </div>
                    Categoría
                  </label>
                  <select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange({ category_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 rounded-xl font-medium text-white transition-all duration-300 focus:scale-105 focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <option value="" style={{ background: '#1e293b', color: 'white' }}>Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} style={{ background: '#1e293b', color: 'white' }}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locality Filter with Liquid Glass */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <span className="text-purple-300">📍</span>
                    </div>
                    Localidad
                  </label>
                  <select
                    value={filters.locality || ''}
                    onChange={(e) => handleFilterChange({ locality: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl font-medium text-white transition-all duration-300 focus:scale-105 focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <option value="" style={{ background: '#1e293b', color: 'white' }}>Todas las localidades</option>
                    {CHUBUT_LOCALITIES.map((locality) => (
                      <option key={locality} value={locality} style={{ background: '#1e293b', color: 'white' }}>
                        {locality}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter with Liquid Glass */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                      background: 'rgba(234, 179, 8, 0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(234, 179, 8, 0.3)'
                    }}>
                      <span className="text-yellow-300">★</span>
                    </div>
                    Calificación
                  </label>
                  <select
                    value={filters.min_rating || 0}
                    onChange={(e) => handleFilterChange({ min_rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl font-medium text-white transition-all duration-300 focus:scale-105 focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <option value={0} style={{ background: '#1e293b', color: 'white' }}>Cualquier calificación</option>
                    <option value={3} style={{ background: '#1e293b', color: 'white' }}>⭐⭐⭐ 3+ estrellas</option>
                    <option value={4} style={{ background: '#1e293b', color: 'white' }}>⭐⭐⭐⭐ 4+ estrellas</option>
                    <option value={5} style={{ background: '#1e293b', color: 'white' }}>⭐⭐⭐⭐⭐ 5 estrellas</option>
                  </select>
                </div>

                {/* Sort By with Liquid Glass */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-white font-semibold text-lg mb-2" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      <BarChart3 className="w-4 h-4 text-green-300" />
                    </div>
                    Ordenar
                  </label>
                  <select
                    value={filters.sort_by || 'rating'}
                    onChange={(e) => handleFilterChange({ sort_by: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl font-medium text-white transition-all duration-300 focus:scale-105 focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <option value="rating" style={{ background: '#1e293b', color: 'white' }}>🏆 Mejor calificados</option>
                    <option value="price" style={{ background: '#1e293b', color: 'white' }}>💰 Menor precio</option>
                    <option value="newest" style={{ background: '#1e293b', color: 'white' }}>🆕 Más recientes</option>
                  </select>
                </div>
              </div>

              {/* Filter Footer with Liquid Glass */}
              <div className="flex items-center justify-between mt-8 pt-6" style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  >
                    <span className="text-sm">×</span>
                    Limpiar filtros
                  </button>
                  
                  <div className="hidden md:flex items-center gap-2 text-white/60 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Filtros activos: {Object.values(filters).filter(v => v && v !== 0 && v !== 'rating').length}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      <span className="text-green-300 font-bold">✓</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {professionals.length}
                      </div>
                      <div className="text-xs text-white/60 font-medium">
                        AS encontrados
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:flex items-center gap-2 text-white/60 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Ordenados por calidad</span>
                  </div>
                </div>
              </div>
                </div>
            </div>
          )}

            {/* AS Grid con Liquid Glass */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {professionals.map((professional) => (
                <div 
                  key={professional.id} 
                  className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] relative overflow-hidden rounded-3xl"
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Hover Effects */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                  }} />
                  <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-500" style={{
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 50%, rgba(236, 72, 153, 0.8) 100%)'
                  }} />
                  
                  <div className="relative z-10 p-6">
                    {/* Professional Profile Header with Liquid Glass */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden" style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
                        }}>
                          {professional.profile_image ? (
                            <img 
                              src={professional.profile_image} 
                              alt={`${professional.first_name} ${professional.last_name}`}
                              className="w-16 h-16 rounded-3xl object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {professional.first_name[0]}{professional.last_name[0]}
                            </span>
                          )}
                        </div>
                        
                        {/* Verification Badge with Liquid Glass */}
                        {professional.verification_status === 'verified' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{
                            background: 'rgba(34, 197, 94, 0.9)',
                            boxShadow: '0 4px 8px rgba(34, 197, 94, 0.4)'
                          }}>
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                        
                        {/* Profile Completeness with Liquid Glass */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div className="relative w-6 h-6">
                            <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.3)"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke={professional.profile_completeness > 80 ? "#10b981" : professional.profile_completeness > 60 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="2"
                                strokeDasharray={`${(professional.profile_completeness / 100) * 62.83} 62.83`}
                                className="transition-all duration-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-gray-800">
                                {professional.profile_completeness}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate text-lg mb-2 group-hover:text-blue-300 transition-colors duration-300" style={{
                              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}>
                              {professional.first_name} {professional.last_name}
                            </h3>
                            
                            {/* Rating Display with Liquid Glass */}
                            <div className="flex items-center gap-2 mt-2">
                              {professional.avg_rating ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 transition-all duration-300 ${
                                          star <= Math.round(professional.avg_rating) 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-white/30'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <div className="px-2 py-1 rounded-lg" style={{
                                    background: 'rgba(234, 179, 8, 0.2)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(234, 179, 8, 0.3)'
                                  }}>
                                    <span className="text-sm text-yellow-300 font-bold">
                                      {professional.avg_rating.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-yellow-200 ml-1">
                                      ({professional.total_reviews})
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="px-3 py-1 rounded-lg" style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  backdropFilter: 'blur(8px)'
                                }}>
                                  <span className="text-sm text-white/80 font-medium">Nuevo AS</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 group-hover:scale-105 ${getSubscriptionBadge(professional.subscription_type).color}`} style={{
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                          }}>
                            {getSubscriptionBadge(professional.subscription_type).text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Details with Liquid Glass */}
                    <div className="space-y-3">
                      {/* Experience Display */}
                      {professional.years_experience && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02]" style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                            background: 'rgba(34, 197, 94, 0.3)',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <Trophy className="w-4 h-4 text-green-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {professional.years_experience} años
                              </span>
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            </div>
                            <span className="text-xs text-green-300 font-medium">
                              Experiencia Verificada
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Location Display */}
                      {professional.work_localities && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02]" style={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                            background: 'rgba(139, 92, 246, 0.3)',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <span className="text-purple-300 text-sm">📍</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">
                                {professional.work_localities}
                            </span>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                          </div>
                          <span className="text-xs text-purple-300 font-semibold uppercase tracking-wide">
                            Disponible en Tu Zona
                          </span>
                        </div>
                      </div>
                    )}

                      {/* Pricing Display with Liquid Glass */}
                      {professional.base_price && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02]" style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                            background: 'rgba(34, 197, 94, 0.3)',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <DollarSign className="w-4 h-4 text-green-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                ${professional.base_price.toLocaleString()}
                              </span>
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            </div>
                            <span className="text-xs text-green-300 font-medium">
                              Precio Base
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Portfolio Display with Liquid Glass */}
                      {professional.portfolio_count > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02]" style={{
                          background: 'rgba(236, 72, 153, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(236, 72, 153, 0.3)'
                        }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
                            background: 'rgba(236, 72, 153, 0.3)',
                            backdropFilter: 'blur(8px)'
                          }}>
                            <Camera className="w-4 h-4 text-pink-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {professional.portfolio_count} trabajos
                              </span>
                              <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                            </div>
                            <span className="text-xs text-pink-300 font-medium">
                              Portfolio Verificado
                            </span>
                          </div>
                        </div>
                      )}

                      {/* About Me Preview with Liquid Glass */}
                      {professional.about_me && (
                        <div className="p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02]" style={{
                          background: 'rgba(59, 130, 246, 0.08)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              backdropFilter: 'blur(8px)'
                            }}>
                              <span className="text-blue-300 text-xs font-bold">"</span>
                            </div>
                            <p className="text-sm text-white/80 line-clamp-3 font-medium leading-relaxed italic">
                              {professional.about_me}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>

                    {/* Action Section with Liquid Glass */}
                    <div className="mt-6 pt-4" style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <Link href={`/explorador/profesional/${professional.id}`}>
                          <button className="w-full group relative overflow-hidden px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white'
                          }}>
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-bold">Ver Perfil</span>
                          </button>
                        </Link>
                        
                        <Link href={`/explorador/chat/new?as_id=${professional.id}`}>
                          <button className="w-full group relative overflow-hidden px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2" style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                            color: 'white'
                          }}>
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm font-bold">Chatear</span>
                          </button>
                        </Link>
                      </div>

                      {/* Trust Indicators with Liquid Glass */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105" style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
                            background: 'rgba(34, 197, 94, 0.3)'
                          }}>
                            <Shield className="w-3 h-3 text-green-300" />
                          </div>
                          <span className="text-xs font-bold text-green-300 text-center">
                            Verificado
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105" style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
                            background: 'rgba(59, 130, 246, 0.3)'
                          }}>
                            <Clock className="w-3 h-3 text-blue-300" />
                          </div>
                          <span className="text-xs font-bold text-blue-300 text-center">
                            Rápido
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105" style={{
                          background: 'rgba(236, 72, 153, 0.1)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(236, 72, 153, 0.3)'
                        }}>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
                            background: 'rgba(236, 72, 153, 0.3)'
                          }}>
                            <Heart className="w-3 h-3 text-pink-300" />
                          </div>
                          <span className="text-xs font-bold text-pink-300 text-center">
                            Confiable
                          </span>
                        </div>
                      </div>
                    </div>
                </div>
              ))}
          </div>

          {/* Loading State with Liquid Glass */}
          {loadingProfessionals && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto p-8 rounded-3xl" style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
              }}>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 w-12 h-12 rounded-full" style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                      backdropFilter: 'blur(8px)'
                    }}></div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      Cargando AS de Calidad
                    </h3>
                    <p className="text-white/70 font-medium">
                      Buscando los mejores profesionales para ti
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Load More Button with Liquid Glass */}
          {!loadingProfessionals && hasMore && professionals.length > 0 && (
            <div className="text-center mt-16">
              <button
                onClick={() => loadProfessionals()}
                className="group px-12 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 16px 32px rgba(59, 130, 246, 0.3)',
                  color: 'white'
                }}
              >
                <span>Descubrir Más AS</span>
                <Rocket className="w-5 h-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              </button>
            </div>
          )}

          {/* No More Results with Liquid Glass */}
          {!loadingProfessionals && !hasMore && professionals.length > 0 && (
            <div className="text-center mt-16">
              <div className="max-w-lg mx-auto relative overflow-hidden rounded-3xl" style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
              }}>
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl" style={{
                  background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.8), rgba(59, 130, 246, 0.8), rgba(236, 72, 153, 0.8))'
                }}></div>
                
                <div className="relative z-10 flex items-center gap-6 p-6">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(59, 130, 246, 0.8))',
                    boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)'
                  }}>
                    <span className="text-2xl text-white">✓</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-white mb-2">
                      ¡Misión Cumplida! 🎉
                    </h3>
                    <p className="text-white/80 font-medium leading-relaxed">
                      Has visto todos los AS disponibles. Prueba ajustando los filtros para descubrir más opciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Results State with Liquid Glass */}
          {!loadingProfessionals && professionals.length === 0 && (
            <div className="text-center py-24">
              <div className="max-w-2xl mx-auto relative overflow-hidden rounded-3xl" style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
              }}>
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl" style={{
                  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8))'
                }}></div>
                
                <div className="relative z-10 space-y-8 p-8">
                  {/* Illustration with Liquid Glass */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto" style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))',
                      boxShadow: '0 16px 32px rgba(59, 130, 246, 0.3)'
                    }}>
                      <span className="text-4xl text-white">🔍</span>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-2xl flex items-center justify-center animate-bounce" style={{
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(168, 85, 247, 0.8))',
                      boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)'
                    }}>
                      <span className="text-white">★</span>
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-xl flex items-center justify-center animate-bounce" style={{
                      animationDelay: '0.5s',
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(59, 130, 246, 0.8))',
                      boxShadow: '0 6px 12px rgba(34, 197, 94, 0.3)'
                    }}>
                      <Heart className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-white">
                      No Encontramos AS
                    </h3>
                    <div className="space-y-3">
                      <p className="text-lg text-white/80 font-medium leading-relaxed max-w-md mx-auto">
                        No hay AS disponibles con los filtros actuales.
                      </p>
                      <p className="text-white/60 font-medium">
                        Intenta ajustar tus criterios de búsqueda para encontrar más opciones.
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons with Liquid Glass */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={clearFilters}
                      className="group px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                    >
                      <span className="group-hover:rotate-90 transition-transform duration-300">×</span>
                      <span>Limpiar Filtros</span>
                    </button>
                    
                    <button
                      onClick={() => window.location.reload()}
                      className="group px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                        color: 'white'
                      }}
                    >
                      <span>Recargar Búsqueda</span>
                      <span className="group-hover:rotate-180 transition-transform duration-500">⟳</span>
                    </button>
                  </div>
                  
                  {/* Help suggestion with Liquid Glass */}
                  <div className="rounded-2xl p-4" style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                        background: 'rgba(59, 130, 246, 0.3)'
                      }}>
                        <span className="text-blue-300 text-sm font-bold">💡</span>
                      </div>
                      <p className="text-sm text-white/80 font-medium">
                        <span className="font-bold text-blue-300">Sugerencia:</span> Prueba expandir el rango de ubicación o eliminar algunos filtros específicos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default NavegarProfesionalesPage;