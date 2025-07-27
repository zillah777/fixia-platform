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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus solicitudes...</p>
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/explorador/dashboard">
                  <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mis Solicitudes de Servicios
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gestiona todas tus solicitudes en un solo lugar
                  </p>
                </div>
              </div>

              <Link href="/explorador/buscar-servicio">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Solicitud
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar solicitudes..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="text-sm text-gray-600">
                {filteredRequests.length} de {requests.length} solicitudes
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const count = requests.filter(req => req.status === tab.status).length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
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
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchText ? 'No se encontraron solicitudes' : 'No tienes solicitudes en esta categoría'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchText 
                      ? 'Intenta con otros términos de búsqueda'
                      : activeTab === 'active' 
                      ? 'Crea tu primera solicitud para encontrar profesionales'
                      : `No tienes solicitudes ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`
                    }
                  </p>
                  {activeTab === 'active' && !searchText && (
                    <Link href="/explorador/buscar-servicio">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Crear Solicitud
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => {
                    const statusBadge = getStatusBadge(request.status);
                    const urgencyBadge = getUrgencyBadge(request.urgency);
                    const StatusIcon = statusBadge.icon;
                    const expired = request.status === 'active' && isExpired(request.expires_at);

                    return (
                      <div key={request.id} className={`border rounded-lg p-6 hover:bg-gray-50 transition-colors ${expired ? 'border-red-200 bg-red-50' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {request.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                <StatusIcon className="h-3 w-3 inline mr-1" />
                                {statusBadge.text}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyBadge.color}`}>
                                {urgencyBadge.icon} {urgencyBadge.text}
                              </span>
                              {expired && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  ⏰ Expirada
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {request.locality}
                              </span>
                              
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatTimeAgo(request.created_at)}
                              </span>
                              
                              {(request.budget_min || request.budget_max) && (
                                <span className="flex items-center text-green-600">
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
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {request.interested_as_count || 0}
                            </div>
                            <div className="text-sm text-gray-500">AS interesados</div>
                            
                            {request.status === 'active' && !expired && (
                              <div className="mt-2 text-xs text-gray-500">
                                Expira: {new Date(request.expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4">
                            {request.category_name && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {request.category_icon} {request.category_name}
                              </span>
                            )}
                            
                            {request.preferred_date && (
                              <span className="text-xs text-gray-500">
                                📅 Fecha preferida: {new Date(request.preferred_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {request.status === 'active' && request.interested_as_count > 0 && (
                              <Link href={`/explorador/solicitud/${request.id}`}>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                  Ver {request.interested_as_count} Propuesta{request.interested_as_count > 1 ? 's' : ''}
                                </button>
                              </Link>
                            )}
                            
                            {request.status === 'in_progress' && (
                              <Link href={`/explorador/chats`}>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                  Ir al Chat
                                </button>
                              </Link>
                            )}
                            
                            <Link href={`/explorador/solicitud/${request.id}`}>
                              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                Ver Detalles
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/explorador/buscar-servicio">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nueva Solicitud</h3>
                    <p className="text-sm text-gray-600">Buscar nuevos servicios</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/explorador/navegar-profesionales">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Explorar AS</h3>
                    <p className="text-sm text-gray-600">Ver perfiles profesionales</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/explorador/calificaciones">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Calificaciones</h3>
                    <p className="text-sm text-gray-600">Revisar y calificar AS</p>
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

export default MisSolicitudesPage;