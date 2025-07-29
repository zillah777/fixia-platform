import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CheckCircle, Search, ArrowLeft, MessageCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { ExplorerASConnection } from '@/types/explorer';

const ChatsPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [connections, setConnections] = useState<ExplorerASConnection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<ExplorerASConnection[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      loadConnections();
    }
  }, [user, loading]);

  useEffect(() => {
    filterConnections();
  }, [connections, searchText]);

  const loadConnections = async () => {
    try {
      setLoadingChats(true);
      
      const response = await explorerService.getChatConnections();
      if (response.success) {
        setConnections(response.data);
      }
      
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const filterConnections = () => {
    let filtered = connections;

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(conn => 
        conn.as_name?.toLowerCase().includes(search) ||
        conn.service_title?.toLowerCase().includes(search) ||
        conn.category_name?.toLowerCase().includes(search)
      );
    }

    // Sort by last message time, then by created date
    filtered.sort((a, b) => {
      const aTime = a.last_message_time || a.created_at;
      const bTime = b.last_message_time || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setFilteredConnections(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Negociando', color: 'bg-blue-100 text-blue-800', icon: '💬' },
      service_in_progress: { text: 'En Progreso', color: 'bg-orange-100 text-orange-800', icon: '⚡' },
      completed: { text: 'Completado', color: 'bg-green-100 text-green-800', icon: '✅' },
      cancelled: { text: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading || loadingChats) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Glass Background */}
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
            <p className="text-white/80 text-lg">Cargando conversaciones...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mis Conversaciones - Fixia Explorador</title>
        <meta name="description" content="Gestiona todas tus conversaciones con profesionales AS" />
      </Head>

      <div className="min-h-screen relative overflow-hidden">
        {/* Glass Background */}
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/explorador/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mr-4 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Mis Conversaciones
                  </h1>
                  <p className="text-white/70 mt-1">
                    {connections.length} conversación{connections.length !== 1 ? 'es' : ''} con profesionales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                style={{
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px'
                }}
              />
            </div>
          </motion.div>

          {/* Conversations List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden'
            }}
          >
            {filteredConnections.length === 0 ? (
              <div className="text-center py-12 px-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <MessageCircle className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {searchText ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {searchText 
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Crea una solicitud de servicio para empezar a chatear con profesionales'
                    }
                  </p>
                  {!searchText && (
                    <Link href="/explorador/buscar-servicio">
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        style={{ borderRadius: '12px' }}
                      >
                        Buscar Servicio
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                <AnimatePresence>
                  {filteredConnections.map((connection, index) => {
                    const statusBadge = getStatusBadge(connection.status);
                    const hasUnreadMessages = connection.unread_messages && connection.unread_messages > 0;
                    
                    return (
                      <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/explorador/chat/${connection.chat_room_id}`}>
                          <div 
                            className="p-6 cursor-pointer transition-all duration-300 group"
                            style={{
                              background: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div className="flex items-start space-x-4">
                              {/* AS Avatar */}
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  backdropFilter: 'blur(8px)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                              >
                                {connection.as_profile_image ? (
                                  <img 
                                    src={connection.as_profile_image} 
                                    alt={connection.as_name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-medium">
                                    {connection.as_name?.[0]}{connection.as_last_name?.[0]}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-200 transition-colors duration-300">
                                      {connection.as_name} {connection.as_last_name}
                                    </h3>
                                    {connection.verification_status === 'verified' && (
                                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    {hasUnreadMessages && (
                                      <span 
                                        className="text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center"
                                        style={{
                                          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                                        }}
                                      >
                                        {connection.unread_messages}
                                      </span>
                                    )}
                                    <span className="text-sm text-white/60 flex-shrink-0">
                                      {formatTimeAgo(connection.last_message_time || connection.created_at)}
                                    </span>
                                  </div>
                                </div>

                                {/* Service Title */}
                                <p className="text-sm text-white/80 mb-2 truncate">
                                  📂 {connection.service_title}
                                </p>

                                {/* Last Message */}
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm truncate flex-1 transition-colors duration-300 ${
                                    hasUnreadMessages ? 'font-medium text-white' : 'text-white/70'
                                  }`}>
                                    {connection.last_message 
                                      ? truncateMessage(connection.last_message)
                                      : 'Conversación iniciada'
                                    }
                                  </p>
                                </div>

                                {/* Status and Actions */}
                                <div className="flex items-center justify-between mt-3">
                                  <span 
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      background: connection.status === 'completed' 
                                        ? 'rgba(34, 197, 94, 0.2)' 
                                        : connection.status === 'service_in_progress'
                                        ? 'rgba(249, 115, 22, 0.2)'
                                        : connection.status === 'cancelled'
                                        ? 'rgba(239, 68, 68, 0.2)'
                                        : 'rgba(59, 130, 246, 0.2)',
                                      color: connection.status === 'completed' 
                                        ? '#22C55E' 
                                        : connection.status === 'service_in_progress'
                                        ? '#F97316'
                                        : connection.status === 'cancelled'
                                        ? '#EF4444'
                                        : '#3B82F6',
                                      border: `1px solid ${connection.status === 'completed' 
                                        ? 'rgba(34, 197, 94, 0.3)' 
                                        : connection.status === 'service_in_progress'
                                        ? 'rgba(249, 115, 22, 0.3)'
                                        : connection.status === 'cancelled'
                                        ? 'rgba(239, 68, 68, 0.3)'
                                        : 'rgba(59, 130, 246, 0.3)'}`
                                    }}
                                  >
                                    {statusBadge.icon} {statusBadge.text}
                                  </span>

                                  <div className="flex items-center space-x-2">
                                    {connection.status === 'service_in_progress' && (
                                      <span className="text-xs text-orange-400 font-medium">
                                        ⚡ Servicio activo
                                      </span>
                                    )}
                                    
                                    {connection.status === 'completed' && (
                                      <span className="text-xs text-green-400 font-medium">
                                        <Star className="h-3 w-3 inline mr-1" /> Pendiente calificación
                                      </span>
                                    )}

                                    {connection.final_agreed_price && (
                                      <span className="text-xs text-green-400 font-medium">
                                        ${connection.final_agreed_price.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Link href="/explorador/buscar-servicio">
              <motion.div 
                whileHover={{ scale: 1.02 }}
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
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors duration-300">Nueva Solicitud</h3>
                    <p className="text-sm text-white/70">Buscar nuevos profesionales</p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/explorador/calificaciones">
              <motion.div 
                whileHover={{ scale: 1.02 }}
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
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-orange-200 transition-colors duration-300">Calificaciones Pendientes</h3>
                    <p className="text-sm text-white/70">Califica a los AS completados</p>
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

export default ChatsPage;