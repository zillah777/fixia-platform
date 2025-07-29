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
