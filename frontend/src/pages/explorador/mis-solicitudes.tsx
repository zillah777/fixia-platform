import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeft,
  Search,
  Eye,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { ExplorerServiceRequest } from '@/types/explorer';

const MisSolicitudesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [requests, setRequests] = useState<ExplorerServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ExplorerServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchText, setSearchText] = useState('');

  const tabs = [
    { id: 'active', label: 'Activas', status: 'active' },
    { id: 'in_progress', label: 'En Progreso', status: 'in_progress' },
    { id: 'completed', label: 'Completadas', status: 'completed' },
    { id: 'cancelled', label: 'Canceladas', status: 'cancelled' }
  ];

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      loadAllRequests();
    }
  }, [user, loading]);

  useEffect(() => {
    filterRequests();
  }, [requests, activeTab, searchText]);

  const loadAllRequests = async () => {
    try {
      setLoadingRequests(true);
      
      // Load requests for all statuses
      const [activeRes, inProgressRes, completedRes, cancelledRes] = await Promise.all([
        explorerService.getMyServiceRequests('active'),
        explorerService.getMyServiceRequests('in_progress'),
        explorerService.getMyServiceRequests('completed'),
        explorerService.getMyServiceRequests('cancelled')
      ]);

      const allRequests = [
        ...(activeRes.success ? activeRes.data : []),
        ...(inProgressRes.success ? inProgressRes.data : []),
        ...(completedRes.success ? completedRes.data : []),
        ...(cancelledRes.success ? cancelledRes.data : [])
      ];

      setRequests(allRequests);
      
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (activeTab !== 'all') {
      const currentTab = tabs.find(tab => tab.id === activeTab);
      if (currentTab) {
        filtered = filtered.filter(req => req.status === currentTab.status);
      }
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(search) ||
        req.description.toLowerCase().includes(search) ||
        req.locality.toLowerCase().includes(search) ||
        req.category_name?.toLowerCase().includes(search)
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Activa', color: 'bg-blue-100 text-blue-800', icon: Clock },
      in_progress: { text: 'En Progreso', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      completed: { text: 'Completada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { text: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[status as keyof typeof badges] || badges.active;
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const days = Math.floor(diffInHours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading || loadingRequests) {
    return (
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
        
        {/* Loading content */}
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
            <p className="text-white/80 text-lg">Cargando tus solicitudes...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mis Solicitudes - Fixia Explorador</title>
        <meta name="description" content="Gestiona todas tus solicitudes de servicios en Fixia" />
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

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/explorador/dashboard">
                  <button className="mr-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Mis Solicitudes de Servicios
                  </h1>
                  <p className="text-white/70 mt-1">
                    Gestiona todas tus solicitudes en un solo lugar
                  </p>
                </div>
              </div>

              <Link href="/explorador/buscar-servicio">
                <button 
                  className="text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    borderRadius: '12px'
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Solicitud
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar solicitudes..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-lg focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                  style={{
                    backdropFilter: 'blur(8px)'
                  }}
                />
              </div>

              <div className="text-sm text-white/70 font-medium">
                {filteredRequests.length} de {requests.length} solicitudes
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden'
            }}
          >
            <div className="border-b border-white/10">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const count = requests.filter(req => req.status === tab.status).length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'border-blue-400 text-blue-300'
                          : 'border-transparent text-white/60 hover:text-white'
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Requests List */}
            <div className="p-6">
              {filteredRequests.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-12"
                >
                  <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {searchText ? 'No se encontraron solicitudes' : 'No tienes solicitudes en esta categoría'}
                  </h3>
                  <p className="text-white/70 mb-4">
                    {searchText 
                      ? 'Intenta con otros términos de búsqueda'
                      : activeTab === 'active' 
                      ? 'Crea tu primera solicitud para encontrar profesionales'
                      : `No tienes solicitudes ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`
                    }
                  </p>
                  {activeTab === 'active' && !searchText && (
                    <Link href="/explorador/buscar-servicio">
                      <button 
                        className="text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        style={{
                          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                          borderRadius: '12px'
                        }}
                      >
                        Crear Solicitud
                      </button>
                    </Link>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredRequests.map((request, index) => {
                      const statusBadge = getStatusBadge(request.status);
                      const urgencyBadge = getUrgencyBadge(request.urgency);
                      const StatusIcon = statusBadge.icon;
                      const expired = request.status === 'active' && isExpired(request.expires_at);

                      return (
                        <motion.div 
                          key={request.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, y: -5 }}
                          className="group cursor-pointer"
                          style={{
                            background: expired 
                              ? 'rgba(239, 68, 68, 0.1)' 
                              : 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(8px)',
                            border: expired 
                              ? '1px solid rgba(239, 68, 68, 0.3)' 
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: expired 
                              ? '0 16px 32px rgba(239, 68, 68, 0.2)' 
                              : '0 16px 32px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors duration-300">
                                {request.title}
                              </h3>
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                  background: request.status === 'completed' 
                                    ? 'rgba(34, 197, 94, 0.2)' 
                                    : request.status === 'in_progress'
                                    ? 'rgba(249, 115, 22, 0.2)'
                                    : request.status === 'cancelled'
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : 'rgba(59, 130, 246, 0.2)',
                                  border: `1px solid ${request.status === 'completed' 
                                    ? 'rgba(34, 197, 94, 0.3)' 
                                    : request.status === 'in_progress'
                                    ? 'rgba(249, 115, 22, 0.3)'
                                    : request.status === 'cancelled'
                                    ? 'rgba(239, 68, 68, 0.3)'
                                    : 'rgba(59, 130, 246, 0.3)'}`
                                }}
                              >
                                <StatusIcon className="h-3 w-3 inline mr-1" />
                                {statusBadge.text}
                              </span>
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                  background: request.urgency === 'emergency' 
                                    ? 'rgba(239, 68, 68, 0.2)' 
                                    : request.urgency === 'high'
                                    ? 'rgba(249, 115, 22, 0.2)'
                                    : request.urgency === 'medium'
                                    ? 'rgba(59, 130, 246, 0.2)'
                                    : 'rgba(107, 114, 128, 0.2)',
                                  border: `1px solid ${request.urgency === 'emergency' 
                                    ? 'rgba(239, 68, 68, 0.3)' 
                                    : request.urgency === 'high'
                                    ? 'rgba(249, 115, 22, 0.3)'
                                    : request.urgency === 'medium'
                                    ? 'rgba(59, 130, 246, 0.3)'
                                    : 'rgba(107, 114, 128, 0.3)'}`
                                }}
                              >
                                {urgencyBadge.icon} {urgencyBadge.text}
                              </span>
                              {expired && (
                                <span 
                                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                  }}
                                >
                                  ⏰ Expirada
                                </span>
                              )}
                            </div>
                            
                            <p className="text-white/80 mb-3 line-clamp-2">{request.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-white/60">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {request.locality}
                              </span>
                              
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatTimeAgo(request.created_at)}
                              </span>
                              
                              {(request.budget_min || request.budget_max) && (
                                <span className="flex items-center text-green-400">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {request.budget_min && request.budget_max 
                                    ? `${formatPrice(request.budget_min)} - ${formatPrice(request.budget_max)}`
                                    : request.budget_min 
                                    ? `Desde ${formatPrice(request.budget_min)}`
                                    : `Hasta ${formatPrice(request.budget_max!)}`
                                  }
                                </span>
                              )}
                              
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {request.views_count} vistas
                              </span>
                            </div>
                          </div>

                          <div className="ml-6 text-right">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                              {request.interested_as_count || 0}
                            </div>
                            <div className="text-sm text-white/60">AS interesados</div>
                            
                            {request.status === 'active' && !expired && (
                              <div className="mt-2 text-xs text-white/60">
                                Expira: {new Date(request.expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-4">
                            {request.category_name && (
                              <span 
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                              >
                                {request.category_icon} {request.category_name}
                              </span>
                            )}
                            
                            {request.preferred_date && (
                              <span className="text-xs text-white/60">
                                📅 Fecha preferida: {new Date(request.preferred_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {request.status === 'active' && request.interested_as_count > 0 && (
                              <Link href={`/explorador/solicitud/${request.id}`}>
                                <button 
                                  className="text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl"
                                  style={{
                                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  Ver {request.interested_as_count} Propuesta{request.interested_as_count > 1 ? 's' : ''}
                                </button>
                              </Link>
                            )}
                            
                            {request.status === 'in_progress' && (
                              <Link href={`/explorador/chats`}>
                                <button 
                                  className="text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl"
                                  style={{
                                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                    borderRadius: '8px'
                                  }}
                                >
                                  Ir al Chat
                                </button>
                              </Link>
                            )}
                            
                            <Link href={`/explorador/solicitud/${request.id}`}>
                              <button 
                                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
                                style={{ borderRadius: '8px' }}
                              >
                                Ver Detalles
                              </button>
                            </Link>
                          </div>
                        </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Link href="/explorador/buscar-servicio">
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer group"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors duration-300">Nueva Solicitud</h3>
                    <p className="text-sm text-white/70">Buscar nuevos servicios</p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/explorador/navegar-profesionales">
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer group"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">Explorar AS</h3>
                    <p className="text-sm text-white/70">Ver perfiles profesionales</p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/explorador/calificaciones">
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer group"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                      boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-orange-200 transition-colors duration-300">Calificaciones</h3>
                    <p className="text-sm text-white/70">Revisar y calificar AS</p>
                  </div>
                </div>
              </motion.div>
            </Link>
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

export default MisSolicitudesPage;