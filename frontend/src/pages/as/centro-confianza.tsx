import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Star,
  Award,
  CheckCircle,
  Upload,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  TrendingUp,
  Eye,
  MessageCircle,
  Clock,
  AlertCircle,
  BadgeCheck,
  Medal,
  Target,
  Zap
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface TrustMetrics {
  overall_score: number;
  profile_completion: number;
  verification_level: 'basic' | 'verified' | 'premium';
  total_reviews: number;
  average_rating: number;
  response_time_hours: number;
  completion_rate: number;
  repeat_customer_rate: number;
}

interface Review {
  id: number;
  explorer_name: string;
  explorer_photo?: string;
  rating: number;
  comment: string;
  service_title: string;
  created_at: string;
  response?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_date?: string;
  progress?: number;
  requirement: string;
}

const ASCentroConfianza: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: Shield },
    { id: 'reviews', label: 'Reseñas', icon: Star },
    { id: 'badges', label: 'Logros', icon: Award },
    { id: 'verification', label: 'Verificación', icon: BadgeCheck },
  ];

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    if (user) {
      loadTrustData();
    }
  }, [user, loading]);

  const loadTrustData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch real data from API
      const response = await fetch('/api/dashboard/trust-metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrustMetrics(data.data.trustMetrics || {
            overall_score: 0,
            profile_completion: 50,
            verification_level: 'basic',
            total_reviews: 0,
            average_rating: 0,
            response_time_hours: 0,
            completion_rate: 0,
            repeat_customer_rate: 0
          });
          setReviews(data.data.reviews || []);
          setBadges(data.data.badges || []);
        } else {
          throw new Error(data.error || 'Error al cargar datos');
        }
      } else {
        throw new Error('Error de conexión con el servidor');
      }
    } catch (error) {
      console.error('Error loading trust data:', error);
      // Set empty state data instead of mock data
      setTrustMetrics({
        overall_score: 0,
        profile_completion: 50,
        verification_level: 'basic',
        total_reviews: 0,
        average_rating: 0,
        response_time_hours: 0,
        completion_rate: 0,
        repeat_customer_rate: 0
      });
      setReviews([]);
      setBadges([]);
      
    } catch (error) {
      console.error('Error loading trust data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getVerificationBadge = (level: string) => {
    const badges = {
      basic: { text: 'Básico', color: 'rgba(107, 114, 128, 0.2)', border: 'rgba(107, 114, 128, 0.3)', icon: '📱' },
      verified: { text: 'Verificado', color: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.3)', icon: '✅' },
      premium: { text: 'Premium', color: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.3)', icon: '👑' }
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const days = Math.floor(diffInHours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  if (loading || loadingData) {
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
          <p className="text-white/90 text-lg font-medium">Cargando centro de confianza...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Centro de Confianza - AS Panel - Fixia</title>
        <meta name="description" content="Gestiona tu reputación y confianza como AS profesional en Fixia" />
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
                    <Shield className="h-8 w-8 text-blue-400 mr-3" />
                    <h1 className="text-3xl font-bold text-white">
                      Centro de Confianza
                    </h1>
                  </motion.div>
                  <motion.p 
                    className="text-white/80 text-lg"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Gestiona tu reputación y credibilidad profesional
                  </motion.p>
                </div>
              </div>

              {trustMetrics && (
                <div className="flex items-center space-x-6">
                  <motion.div 
                    className="text-center px-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="text-3xl font-bold text-blue-400">{trustMetrics.overall_score}</div>
                    <div className="text-white/60 text-sm">Puntuación</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center px-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-2xl font-bold text-white">{trustMetrics.average_rating}</span>
                    </div>
                    <div className="text-white/60 text-sm">{trustMetrics.total_reviews} reseñas</div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Navigation Tabs */}
          <motion.div 
            className="mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="border-b border-white/10">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-400 text-blue-300'
                          : 'border-transparent text-white/60 hover:text-white'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === 'overview' && trustMetrics && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}    
                    transition={{ duration: 0.3 }}
                  >
                    {/* Trust Score Circle */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                      <motion.div 
                        className="lg:col-span-1 text-center"
                        style={{
                          background: 'rgba(30, 41, 59, 0.4)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '20px',
                          padding: '32px'
                        }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${(trustMetrics.overall_score / 100) * 351.86} 351.86`}
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-white">{trustMetrics.overall_score}</div>
                              <div className="text-white/60 text-sm">de 100</div>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Puntuación de Confianza</h3>
                        <p className="text-white/70">Basada en tu desempeño general</p>
                        
                        {/* Verification Level */}
                        <div className="mt-6">
                          {(() => {
                            const verificationBadge = getVerificationBadge(trustMetrics.verification_level);
                            return (
                              <span 
                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
                                style={{
                                  background: verificationBadge.color,
                                  border: `1px solid ${verificationBadge.border}`
                                }}
                              >
                                {verificationBadge.icon} Perfil {verificationBadge.text}
                              </span>
                            );
                          })()}
                        </div>
                      </motion.div>

                      {/* Key Metrics */}
                      <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                        <motion.div 
                          className="text-center p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
                          <div className="text-2xl font-bold text-white mb-1">{trustMetrics.completion_rate}%</div>
                          <div className="text-white/70 text-sm">Tasa de Finalización</div>
                        </motion.div>

                        <motion.div 
                          className="text-center p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <Clock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                          <div className="text-2xl font-bold text-white mb-1">{trustMetrics.response_time_hours}h</div>
                          <div className="text-white/70 text-sm">Tiempo de Respuesta</div>
                        </motion.div>

                        <motion.div 
                          className="text-center p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <Target className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                          <div className="text-2xl font-bold text-white mb-1">{trustMetrics.repeat_customer_rate}%</div>
                          <div className="text-white/70 text-sm">Clientes Repetidos</div>
                        </motion.div>

                        <motion.div 
                          className="text-center p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <User className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                          <div className="text-2xl font-bold text-white mb-1">{trustMetrics.profile_completion}%</div>
                          <div className="text-white/70 text-sm">Perfil Completo</div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Profile Completion Progress */}
                    <motion.div 
                      className="p-6"
                      style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px'
                      }}
                    >
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                        <Edit3 className="h-5 w-5 mr-2" />
                        Completar Perfil
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Progreso general</span>
                          <span className="text-white font-medium">{trustMetrics.profile_completion}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <motion.div 
                            className="h-3 rounded-full"
                            style={{
                              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                              width: `${trustMetrics.profile_completion}%`
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${trustMetrics.profile_completion}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-white/80">Información básica</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-white/80">Foto de perfil</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <AlertCircle className="h-4 w-4 text-orange-400 mr-2" />
                            <span className="text-white/80">Documentos de verificación</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-white/80">Descripción de servicios</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      {reviews.length === 0 ? (
                        <motion.div 
                          className="text-center py-12"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-4 rounded-xl mb-4 mx-auto w-fit" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                            <Star className="h-16 w-16 text-white mx-auto" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Aún no tienes reseñas
                          </h3>
                          <p className="text-white/70 text-lg">
                            Completa servicios para que los clientes puedan dejarte reseñas y mejorar tu reputación.
                          </p>
                        </motion.div>
                      ) : (
                        reviews.map((review, index) => (
                          <motion.div
                            key={review.id}
                            className="p-6"
                            style={{
                              background: 'rgba(30, 41, 59, 0.4)',
                              backdropFilter: 'blur(16px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '16px'
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-white">{review.explorer_name}</h4>
                                  <p className="text-sm text-white/60">{review.service_title}</p>
                                </div>
                                <div className="flex items-center">
                                  <div className="flex items-center mr-3">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-white/20'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-white/60">{formatTimeAgo(review.created_at)}</span>
                                </div>
                              </div>
                              
                              <p className="text-white/80 mb-3">{review.comment}</p>
                              
                              {review.response && (
                                <div className="mt-4 p-4 bg-white/5 rounded-lg border-l-4 border-blue-400">
                                  <p className="text-sm text-white/70 mb-1">Tu respuesta:</p>
                                  <p className="text-white/80">{review.response}</p>
                                </div>
                              )}
                              
                              {!review.response && (
                                <button className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
                                  Responder reseña
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                  <motion.div
                    key="badges"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {badges.length === 0 ? (
                        <motion.div 
                          className="col-span-full text-center py-12"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-4 rounded-xl mb-4 mx-auto w-fit" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
                            <Award className="h-16 w-16 text-white mx-auto" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Logros disponibles próximamente
                          </h3>
                          <p className="text-white/70 text-lg">
                            Completa servicios y mejora tu perfil para desbloquear logros especiales.
                          </p>
                        </motion.div>
                      ) : (
                        badges.map((badge, index) => (
                        <motion.div
                          key={badge.id}
                          className={`p-6 text-center ${badge.earned ? 'opacity-100' : 'opacity-60'}`}
                          style={{
                            background: badge.earned 
                              ? 'rgba(34, 197, 94, 0.1)' 
                              : 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: badge.earned 
                              ? '1px solid rgba(34, 197, 94, 0.3)' 
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: badge.earned ? 1 : 0.6, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="text-4xl mb-4">{badge.icon}</div>
                          <h4 className="font-bold text-white mb-2">{badge.name}</h4>
                          <p className="text-sm text-white/70 mb-4">{badge.description}</p>
                          
                          {badge.earned ? (
                            <div className="flex items-center justify-center text-green-400 text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Obtenido {badge.earned_date ? new Date(badge.earned_date).toLocaleDateString() : ''}
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm text-white/60 mb-2">{badge.requirement}</div>
                              {badge.progress !== undefined && (
                                <div>
                                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                    <div 
                                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                                      style={{ width: `${badge.progress}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-white/60">{badge.progress}/100</div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Verification Tab */}
                {activeTab === 'verification' && (
                  <motion.div
                    key="verification"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      {/* Current Verification Status */}
                      <motion.div 
                        className="p-6"
                        style={{
                          background: 'rgba(30, 41, 59, 0.4)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px'
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-white">Estado de Verificación</h4>
                          {trustMetrics && (() => {
                            const verificationBadge = getVerificationBadge(trustMetrics.verification_level);
                            return (
                              <span 
                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
                                style={{
                                  background: verificationBadge.color,
                                  border: `1px solid ${verificationBadge.border}`
                                }}
                              >
                                {verificationBadge.icon} {verificationBadge.text}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-white/70 mb-6">
                          Aumenta tu credibilidad verificando tu identidad y habilidades profesionales.
                        </p>
                      </motion.div>

                      {/* Verification Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                          className="p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
                              <CheckCircle className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">Identidad</h5>
                              <p className="text-sm text-green-400">Verificado</p>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm">
                            Tu identidad ha sido verificada mediante documento oficial.
                          </p>
                        </motion.div>

                        <motion.div 
                          className="p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
                              <Phone className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">Teléfono</h5>
                              <p className="text-sm text-green-400">Verificado</p>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm">
                            Tu número de teléfono ha sido confirmado mediante SMS.
                          </p>
                        </motion.div>

                        <motion.div 
                          className="p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mr-4">
                              <FileText className="h-6 w-6 text-orange-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">Certificaciones</h5>
                              <p className="text-sm text-orange-400">Pendiente</p>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm mb-4">
                            Sube tus certificaciones profesionales para aumentar tu credibilidad.
                          </p>
                          <motion.button 
                            className="flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200"
                            style={{
                              background: 'linear-gradient(135deg, #F59E0B, #EF4444)'
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Subir certificados
                          </motion.button>
                        </motion.div>

                        <motion.div 
                          className="p-6"
                          style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mr-4">
                              <MapPin className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">Dirección</h5>
                              <p className="text-sm text-green-400">Verificado</p>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm">
                            Tu dirección de servicio ha sido confirmada.
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
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

export default ASCentroConfianza;