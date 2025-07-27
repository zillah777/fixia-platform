import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando conversaciones...</p>
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/explorador/dashboard">
                  <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-xl text-gray-600">←</span>
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mis Conversaciones
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {connections.length} conversación{connections.length !== 1 ? 'es' : ''} con profesionales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="bg-white rounded-xl shadow-sm border">
            {filteredConnections.length === 0 ? (
              <div className="text-center py-12">
                <span className="block text-4xl text-gray-400 mb-4">💬</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchText ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchText 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Crea una solicitud de servicio para empezar a chatear con profesionales'
                  }
                </p>
                {!searchText && (
                  <Link href="/explorador/buscar-servicio">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Buscar Servicio
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConnections.map((connection) => {
                  const statusBadge = getStatusBadge(connection.status);
                  const hasUnreadMessages = connection.unread_messages && connection.unread_messages > 0;
                  
                  return (
                    <Link key={connection.id} href={`/explorador/chat/${connection.chat_room_id}`}>
                      <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-4">
                          {/* AS Avatar */}
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {connection.as_profile_image ? (
                              <img 
                                src={connection.as_profile_image} 
                                alt={connection.as_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-medium">
                                {connection.as_name?.[0]}{connection.as_last_name?.[0]}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {connection.as_name} {connection.as_last_name}
                                </h3>
                                {connection.verification_status === 'verified' && (
                                  <CheckBadgeIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {hasUnreadMessages && (
                                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                                    {connection.unread_messages}
                                  </span>
                                )}
                                <span className="text-sm text-gray-500 flex-shrink-0">
                                  {formatTimeAgo(connection.last_message_time || connection.created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Service Title */}
                            <p className="text-sm text-gray-600 mb-2 truncate">
                              📂 {connection.service_title}
                            </p>

                            {/* Last Message */}
                            <div className="flex items-center justify-between">
                              <p className={`text-sm truncate flex-1 ${
                                hasUnreadMessages ? 'font-medium text-gray-900' : 'text-gray-600'
                              }`}>
                                {connection.last_message 
                                  ? truncateMessage(connection.last_message)
                                  : 'Conversación iniciada'
                                }
                              </p>
                            </div>

                            {/* Status and Actions */}
                            <div className="flex items-center justify-between mt-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                {statusBadge.icon} {statusBadge.text}
                              </span>

                              <div className="flex items-center space-x-2">
                                {connection.status === 'service_in_progress' && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    ⚡ Servicio activo
                                  </span>
                                )}
                                
                                {connection.status === 'completed' && (
                                  <span className="text-xs text-green-600 font-medium">
                                    ⭐ Pendiente calificación
                                  </span>
                                )}

                                {connection.final_agreed_price && (
                                  <span className="text-xs text-green-600 font-medium">
                                    ${connection.final_agreed_price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/explorador/buscar-servicio">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-blue-600">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nueva Solicitud</h3>
                    <p className="text-sm text-gray-600">Buscar nuevos profesionales</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/explorador/calificaciones">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl text-orange-600">ℹ</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Calificaciones Pendientes</h3>
                    <p className="text-sm text-gray-600">Califica a los AS completados</p>
                  </div>
                </div>
              </div>
            </Link>
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

export default ChatsPage;