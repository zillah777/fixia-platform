import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Award,
  User,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { categoriesService } from '@/services/categories';
import { ExplorerBrowseParams } from '@/types/explorer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Types
interface Professional {
  id: string;
  user_id: string;
  name: string;
  last_name: string;
  profile_image?: string;
  about_me?: string;
  years_experience?: number;
  avg_rating: number;
  total_reviews: number;
  base_price?: number;
  subscription_type: 'free' | 'basic' | 'premium';
  verification_status: 'verified' | 'pending' | 'rejected';
  work_localities?: string;
  portfolio_count: number;
  categories: Array<{ id: string; name: string }>;
  profile_completeness?: number;
  quality_score?: number;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
}

interface FilterState extends ExplorerBrowseParams {
  searchText: string;
}

// Constants
const CHUBUT_LOCALITIES = [
  'Rawson', 'Trelew', 'Puerto Madryn', 'Comodoro Rivadavia', 'Esquel',
  'Gaiman', 'Dolavon', 'Rada Tilly', 'Trevelin', 'Puerto Pirámides',
  'Sarmiento', 'Río Mayo', 'Alto Río Senguer', 'Gobernador Costa',
  'Las Plumas', 'Gastre', 'Paso de Indios', 'Tecka', 'Gualjaina',
  'El Maitén', 'El Hoyo', 'Epuyén', 'Cholila', 'Lago Puelo',
  'José de San Martín', 'Facundo', 'Playa Unión', 'Playa Magagna'
];

const SUBSCRIPTION_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'free', label: 'Gratuito' },
  { value: 'basic', label: 'Básico' },
  { value: 'premium', label: 'Premium' }
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'price', label: 'Precio: menor a mayor' },
  { value: 'newest', label: 'Más recientes' }
];

// Utility functions
const calculateProfileCompleteness = (professional: Professional): number => {
  let completeness = 0;
  const fields = [
    'profile_image', 'about_me', 'years_experience', 'work_localities',
    'base_price', 'portfolio_count'
  ];
  
  fields.forEach(field => {
    if ((professional as any)[field]) {
      completeness += 16.67; // 100% / 6 fields
    }
  });
  
  return Math.round(completeness);
};

const calculateQualityScore = (professional: Professional): number => {
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
  
  return Math.round(score);
};

const getSubscriptionBadge = (type: string) => {
  const badges = {
    free: { text: 'Gratuito', gradient: 'from-gray-500 to-gray-600' },
    basic: { text: 'Básico', gradient: 'from-blue-500 to-blue-600' },
    premium: { text: 'Premium', gradient: 'from-purple-500 to-pink-500' }
  };
  return badges[type as keyof typeof badges] || badges.free;
};

const getVerificationBadge = (status: string) => {
  const badges = {
    verified: { text: 'Verificado', color: 'text-green-400', icon: Shield },
    pending: { text: 'Pendiente', color: 'text-yellow-400', icon: Clock },
    rejected: { text: 'No verificado', color: 'text-gray-400', icon: Shield }
  };
  return badges[status as keyof typeof badges] || badges.pending;
};

// Components
const LoadingState: React.FC = () => (
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
        <p className="text-white/80 text-lg">Cargando profesionales...</p>
      </motion.div>
    </div>
  </div>
);

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-white/30'
          }`}
        />
      ))}
    </div>
  );
};

const ProfessionalCard: React.FC<{ professional: Professional; index: number }> = ({ professional, index }) => {
  const subscriptionBadge = getSubscriptionBadge(professional.subscription_type);
  const verificationBadge = getVerificationBadge(professional.verification_status);
  const VerificationIcon = verificationBadge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
    >
      <Card 
        className="overflow-hidden border-0 h-full transition-all duration-300"
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
        }}
      >
        <CardContent className="p-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20"
                style={{
                  background: professional.profile_image 
                    ? 'none' 
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))'
                }}
              >
                {professional.profile_image ? (
                  <img 
                    src={professional.profile_image} 
                    alt={`${professional.name} ${professional.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white/60" />
                  </div>
                )}
              </div>
              
              {/* Subscription badge */}
              <div 
                className="absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  backgroundImage: `linear-gradient(135deg, ${subscriptionBadge.gradient.includes('gray') ? '#6B7280, #4B5563' : subscriptionBadge.gradient.includes('blue') ? '#3B82F6, #2563EB' : '#8B5CF6, #EC4899'})`
                }}
              >
                {subscriptionBadge.text}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-white truncate">
                  {professional.name} {professional.last_name}
                </h3>
                
                <div className="flex items-center space-x-1">
                  <VerificationIcon className={`h-4 w-4 ${verificationBadge.color}`} />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-2">
                <StarRating rating={professional.avg_rating} />
                <span className="text-sm text-white/60">
                  ({professional.total_reviews} reseñas)
                </span>
              </div>
              
              {professional.years_experience && (
                <div className="flex items-center text-sm text-white/70">
                  <Award className="h-4 w-4 mr-1" />
                  {professional.years_experience} años de experiencia
                </div>
              )}
            </div>
          </div>
          
          {/* About */}
          {professional.about_me && (
            <p className="text-sm text-white/80 mb-4 line-clamp-2">
              {professional.about_me}
            </p>
          )}
          
          {/* Categories */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {professional.categories.map((category) => (
                <span 
                  key={category.id}
                  className="px-2 py-1 rounded-lg text-xs font-medium text-white/80"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {professional.base_price && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  ${professional.base_price.toLocaleString()}
                </div>
                <div className="text-xs text-white/60">Precio base</div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {professional.portfolio_count || 0}
              </div>
              <div className="text-xs text-white/60">Trabajos</div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <Link href={`/explorador/as/${professional.user_id}`} className="flex-1">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300"
                style={{ borderRadius: '12px' }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>
            </Link>
            
            <Button 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              style={{ borderRadius: '12px' }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main component
const NavegarProfesionalesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [filters, setFilters] = useState<FilterState>({
    category_id: undefined,
    locality: '',
    min_rating: 0,
    subscription_type: '',
    sort_by: 'rating' as const,
    limit: 12,
    offset: 0,
    searchText: ''
  });

  // Authentication check
  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      loadInitialData();
    }
  }, [user, loading, router]);

  // Load professionals when filters change
  useEffect(() => {
    if (categories.length > 0) {
      loadProfessionals(true);
    }
  }, [filters, categories]);

  // Memoized filtered categories for search
  const filteredCategories = useMemo(() => {
    if (!filters.searchText) return categories;
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(filters.searchText.toLowerCase())
    );
  }, [categories, filters.searchText]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const categoriesRes = await categoriesService.getAllCategories();
      setCategories(categoriesRes);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // Load professionals
  const loadProfessionals = useCallback(async (reset = false) => {
    try {
      setLoadingProfessionals(true);
      
      const searchFilters = {
        ...filters,
        offset: reset ? 0 : filters.offset
      };

      const response = await explorerService.browseAS(searchFilters);
      
      if (response.success) {
        // Enhance profiles with calculated metrics
        const enhancedProfiles = response.data.profiles.map((professional: any) => ({
          ...professional,
          profile_completeness: calculateProfileCompleteness(professional),
          quality_score: calculateQualityScore(professional)
        }));

        // Sort by quality score
        const sortedProfiles = enhancedProfiles.sort((a: Professional, b: Professional) => 
          (b.quality_score || 0) - (a.quality_score || 0)
        );

        if (reset) {
          setProfessionals(sortedProfiles);
        } else {
          setProfessionals(prev => [...prev, ...sortedProfiles]);
        }
        setHasMore(response.data.has_more);
        
        if (!reset) {
          setFilters(prev => ({ 
            ...prev, 
            offset: (prev.offset || 0) + (prev.limit || 12) 
          }));
        }
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoadingProfessionals(false);
    }
  }, [filters]);

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category_id: undefined,
      locality: '',
      min_rating: 0,
      subscription_type: '',
      sort_by: 'rating' as const,
      limit: 12,
      offset: 0,
      searchText: ''
    });
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingProfessionals) {
      loadProfessionals(false);
    }
  }, [hasMore, loadingProfessionals, loadProfessionals]);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <Head>
        <title>Explorar Profesionales AS | FIXIA</title>
        <meta name="description" content="Descubre los mejores AS certificados de Chubut con sistema Liquid Glass de confianza" />
        <meta name="keywords" content="AS, ases, servicios, Chubut, FIXIA, explorar, buscar, profesionales" />
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

        <div className="relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 mb-8"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link href="/explorador/dashboard">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Explorar Profesionales AS
                    </h1>
                    <p className="text-white/70">
                      Descubre los mejores profesionales verificados de Chubut
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                  style={{ borderRadius: '12px' }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto px-6 pb-12">
            {/* Search and Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar profesionales..."
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange({ searchText: e.target.value })}
                  className="pl-10 pr-4 py-3 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                  style={{
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px'
                  }}
                />
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Categoría</label>
                      <select
                        value={filters.category_id || ''}
                        onChange={(e) => handleFilterChange({ category_id: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full p-3 bg-white/10 border border-white/20 text-white rounded-lg focus:border-white/40 transition-colors"
                        style={{ backdropFilter: 'blur(8px)' }}
                      >
                        <option value="">Todas las categorías</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id} className="bg-slate-800">
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Locality Filter */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Localidad</label>
                      <select
                        value={filters.locality || ''}
                        onChange={(e) => handleFilterChange({ locality: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 text-white rounded-lg focus:border-white/40 transition-colors"
                        style={{ backdropFilter: 'blur(8px)' }}
                      >
                        <option value="">Todas las localidades</option>
                        {CHUBUT_LOCALITIES.map((locality) => (
                          <option key={locality} value={locality} className="bg-slate-800">
                            {locality}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subscription Filter */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Suscripción</label>
                      <select
                        value={filters.subscription_type || ''}
                        onChange={(e) => handleFilterChange({ subscription_type: e.target.value })}
                        className="w-full p-3 bg-white/10 border border-white/20 text-white rounded-lg focus:border-white/40 transition-colors"
                        style={{ backdropFilter: 'blur(8px)' }}
                      >
                        {SUBSCRIPTION_TYPES.map((type) => (
                          <option key={type.value} value={type.value} className="bg-slate-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Ordenar por</label>
                      <select
                        value={filters.sort_by || 'rating'}
                        onChange={(e) => handleFilterChange({ sort_by: e.target.value as 'rating' | 'price' | 'newest' })}
                        className="w-full p-3 bg-white/10 border border-white/20 text-white rounded-lg focus:border-white/40 transition-colors"
                        style={{ backdropFilter: 'blur(8px)' }}
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-800">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clear Filters */}
              {(filters.category_id || filters.locality || filters.subscription_type || filters.searchText) && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Results */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {professionals.length} profesionales encontrados
                </h2>
              </div>

              {/* Professionals Grid */}
              {professionals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {professionals.map((professional, index) => (
                    <ProfessionalCard
                      key={professional.id}
                      professional={professional}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px'
                  }}
                >
                  <Search className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No se encontraron profesionales
                  </h3>
                  <p className="text-white/70 mb-6">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                  <Button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    style={{ borderRadius: '12px' }}
                  >
                    Limpiar filtros
                  </Button>
                </motion.div>
              )}

              {/* Load More */}
              {hasMore && professionals.length > 0 && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loadingProfessionals}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-300"
                    style={{ borderRadius: '12px' }}
                  >
                    {loadingProfessionals ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-white mr-2"></div>
                        Cargando...
                      </>
                    ) : (
                      'Cargar más profesionales'
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

// Disable SSG to avoid AuthProvider errors
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default NavegarProfesionalesPage;