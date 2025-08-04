import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  Star,
  Heart,
  Eye,
  Filter,
  ChevronDown,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface ServiceOpportunity {
  id: number;
  title: string;
  description: string;
  category_name: string;
  category_icon: string;
  locality: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  interested_as_count: number;
  explorer_name: string;
  explorer_rating: number;
  distance_km: number;
  compatibility_score: number;
}

const ASOpportunities: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [opportunities, setOpportunities] = useState<ServiceOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<ServiceOpportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'Todas las categorías', icon: '🔧' },
    { id: 'plomeria', name: 'Plomería', icon: '🔧' },
    { id: 'electricidad', name: 'Electricidad', icon: '⚡' },
    { id: 'carpinteria', name: 'Carpintería', icon: '🔨' },
    { id: 'limpieza', name: 'Limpieza', icon: '🧽' },
    { id: 'jardineria', name: 'Jardinería', icon: '🌱' },
  ];

  const urgencyLevels = [
    { id: 'all', name: 'Todas las urgencias', color: 'text-white/60' },
    { id: 'low', name: 'Baja', color: 'text-gray-400' },
    { id: 'medium', name: 'Media', color: 'text-blue-400' },
    { id: 'high', name: 'Alta', color: 'text-orange-400' },
    { id: 'emergency', name: 'Emergencia', color: 'text-red-400' },
  ];

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    if (user) {
      loadOpportunities();
    }
  }, [user, loading]);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchQuery, selectedCategory, selectedUrgency]);

  const loadOpportunities = async () => {
    try {
      setLoadingOpportunities(true);
      
      // Fetch real opportunities from API
      const response = await fetch('/api/opportunities/available', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOpportunities(data.data.opportunities || []);
        } else {
          throw new Error(data.error || 'Error al cargar oportunidades');
        }
      } else {
        throw new Error('Error de conexión con el servidor');
      }
    } catch (error) {
      console.error('Error loading opportunities:', error);
      // Set empty array instead of mock data
      setOpportunities([]);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = opportunities;

    // Filter by search query
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(search) ||
        opp.description.toLowerCase().includes(search) ||
        opp.locality.toLowerCase().includes(search) ||
        opp.category_name.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(opp => 
        opp.category_name.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by urgency
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(opp => opp.urgency === selectedUrgency);
    }

    // Sort by compatibility score and urgency
    filtered.sort((a, b) => {
      const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.compatibility_score - a.compatibility_score;
    });

    setFilteredOpportunities(filtered);
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: { text: 'Baja', color: 'rgba(107, 114, 128, 0.2)', border: 'rgba(107, 114, 128, 0.3)', icon: '⏰' },
      medium: { text: 'Media', color: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.3)', icon: '📅' },
      high: { text: 'Alta', color: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.3)', icon: '⚡' },
      emergency: { text: 'Emergencia', color: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.3)', icon: '🚨' }
    };
    return badges[urgency as keyof typeof badges] || badges.medium;
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

  const handleExpressInterest = async (opportunityId: number) => {
    // TODO: Implement API call to express interest
    console.log('Expressing interest in opportunity:', opportunityId);
  };

  if (loading || loadingOpportunities) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
        }}
      >
        {/* Floating orbs for loading state */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full"
            style={{ backdropFilter: 'blur(40px)' }}
            animate={{
              y: [0, -20, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/3 w-24 h-24 bg-purple-400/20 rounded-full"
            style={{ backdropFilter: 'blur(40px)' }}
            animate={{
              y: [0, 20, 0],
              x: [0, -10, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <motion.div 
          className="text-center"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.1)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-6"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3))',
              borderRadius: '50%'
            }}
          />
          <p className="text-white/90 text-lg font-medium">Cargando oportunidades...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Oportunidades de Servicio - AS Panel - Fixia</title>
        <meta name="description" content="Encuentra nuevas oportunidades de trabajo como AS profesional en Fixia" />
      </Head>

      <div 
        className="min-h-screen relative"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
        }}
      >
        {/* Floating orbs background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-40 h-40 bg-blue-400/10 rounded-full"
            style={{ backdropFilter: 'blur(60px)' }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 right-20 w-32 h-32 bg-purple-400/10 rounded-full"
            style={{ backdropFilter: 'blur(60px)' }}
            animate={{
              y: [0, 25, 0],
              x: [0, -15, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        {/* Header */}
        <motion.div 
          className="relative z-10"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0 0 24px 24px'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/as/dashboard">
                  <motion.button 
                    className="mr-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </motion.button>
                </Link>
                <div>
                  <motion.div className="flex items-center mb-2">
                    <TrendingUp className="h-8 w-8 text-blue-400 mr-3" />
                    <h1 className="text-3xl font-bold text-white">
                      Oportunidades de Servicio
                    </h1>
                  </motion.div>
                  <motion.p 
                    className="text-white/80 text-lg"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Encuentra nuevos trabajos que coincidan con tus habilidades
                  </motion.p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.div 
                  className="text-center px-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="text-2xl font-bold text-white">{filteredOpportunities.length}</div>
                  <div className="text-white/60 text-sm">Oportunidades</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Search and Filters */}
          <motion.div 
            className="mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar oportunidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-white placeholder-white/60 rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>

              {/* Filter Toggles */}
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-3 text-white rounded-xl transition-all duration-200"
                  style={{
                    background: showFilters ? 'rgba(59, 130, 246, 0.3)' : 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  className="mt-6 pt-6 border-t border-white/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-white/80 font-medium mb-3">Categoría</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 text-white rounded-xl transition-all duration-200"
                        style={{
                          background: 'rgba(30, 41, 59, 0.4)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id} className="bg-slate-800">
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Urgency Filter */}
                    <div>
                      <label className="block text-white/80 font-medium mb-3">Urgencia</label>
                      <select
                        value={selectedUrgency}
                        onChange={(e) => setSelectedUrgency(e.target.value)}
                        className="w-full px-4 py-3 text-white rounded-xl transition-all duration-200"
                        style={{
                          background: 'rgba(30, 41, 59, 0.4)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        {urgencyLevels.map((level) => (
                          <option key={level.id} value={level.id} className="bg-slate-800">
                            {level.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Opportunities List */}
          <div className="space-y-6">
            <AnimatePresence>
              {filteredOpportunities.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="p-4 rounded-xl mb-4 mx-auto w-fit" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                    <TrendingUp className="h-16 w-16 text-white mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all' 
                      ? 'No se encontraron oportunidades' 
                      : 'No hay oportunidades disponibles'
                    }
                  </h3>
                  <p className="text-white/70 text-lg">
                    {searchQuery || selectedCategory !== 'all' || selectedUrgency !== 'all'
                      ? 'Intenta ajustar los filtros o términos de búsqueda.'
                      : 'Las nuevas oportunidades aparecerán aquí cuando estén disponibles.'
                    }
                  </p>
                </motion.div>
              ) : (
                filteredOpportunities.map((opportunity, index) => {
                  const urgencyBadge = getUrgencyBadge(opportunity.urgency);
                  const isExpiringSoon = new Date(opportunity.expires_at).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

                  return (
                    <motion.div
                      key={opportunity.id}
                      className="group cursor-pointer"
                      style={{
                        background: opportunity.urgency === 'emergency' 
                          ? 'rgba(239, 68, 68, 0.1)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(24px)',
                        border: opportunity.urgency === 'emergency' 
                          ? '1px solid rgba(239, 68, 68, 0.3)' 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '20px',
                        padding: '32px',
                        boxShadow: opportunity.urgency === 'emergency' 
                          ? '0 16px 40px rgba(239, 68, 68, 0.2)' 
                          : '0 16px 40px rgba(0, 0, 0, 0.1)'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, y: -5 }}
                    >
                    {/* Header with compatibility score */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                            {opportunity.title}
                          </h3>
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{
                              background: urgencyBadge.color,
                              border: `1px solid ${urgencyBadge.border}`
                            }}
                          >
                            {urgencyBadge.icon} {urgencyBadge.text}
                          </span>
                          {isExpiringSoon && (
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-medium text-white animate-pulse"
                              style={{
                                background: 'rgba(249, 115, 22, 0.2)',
                                border: '1px solid rgba(249, 115, 22, 0.3)'
                              }}
                            >
                              ⏰ Expira pronto
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-white/70 mb-3">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {opportunity.locality} • {opportunity.distance_km}km
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatTimeAgo(opportunity.created_at)}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {opportunity.views_count} vistas
                          </span>
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="flex items-center justify-end mb-2">
                          <Zap className="h-5 w-5 text-yellow-400 mr-1" />
                          <span className="text-2xl font-bold text-yellow-400">
                            {opportunity.compatibility_score}%
                          </span>
                        </div>
                        <div className="text-sm text-white/60">Compatibilidad</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/80 mb-4 line-clamp-2">
                      {opportunity.description}
                    </p>

                    {/* Info row */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-6 text-sm">
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {opportunity.category_icon} {opportunity.category_name}
                        </span>
                        
                        {(opportunity.budget_min || opportunity.budget_max) && (
                          <span className="flex items-center text-green-400 font-medium">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {opportunity.budget_min && opportunity.budget_max 
                              ? `${formatPrice(opportunity.budget_min)} - ${formatPrice(opportunity.budget_max)}`
                              : opportunity.budget_min 
                              ? `Desde ${formatPrice(opportunity.budget_min)}`
                              : `Hasta ${formatPrice(opportunity.budget_max!)}`
                            }
                          </span>
                        )}

                        {opportunity.preferred_date && (
                          <span className="text-white/60">
                            📅 {new Date(opportunity.preferred_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {opportunity.interested_as_count} interesados
                        </span>
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          {opportunity.explorer_rating} • {opportunity.explorer_name}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="text-sm text-white/60">
                        Expira: {new Date(opportunity.expires_at).toLocaleDateString()}
                      </div>

                      <div className="flex items-center space-x-3">
                        <motion.button
                          onClick={() => handleExpressInterest(opportunity.id)}
                          className="flex items-center px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                          style={{
                            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Mostrar Interés
                        </motion.button>

                        <Link href={`/as/oportunidad/${opportunity.id}`}>
                          <motion.button
                            className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200"
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.2)' }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Ver Detalles
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
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

export default ASOpportunities;