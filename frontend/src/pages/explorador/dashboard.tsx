import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  MapPinIcon,
  HomeIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { useExploradorDashboardData } from '@/hooks/useDashboardData';

const ExplorerDashboard: NextPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { stats, loading: statsLoading, error } = useExploradorDashboardData();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Only redirect to login if we're actually on the dashboard (prevent redirect loops)
        if (router.pathname === '/explorador/dashboard') {
          // Add delay to prevent rapid redirects
          setTimeout(() => {
            router.push('/auth/login');
          }, 100);
        }
        return;
      }
      
      if (user.user_type !== 'customer') {
        console.warn('User type mismatch:', user.user_type, 'expected: customer');
        // Add delay to prevent rapid redirects
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
        return;
      }
    }
  }, [user, loading, router]);

  // Default stats if none loaded
  const displayStats = stats?.stats || {
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteServices: 0,
    unreadMessages: 0
  };

  const recentActivity = stats?.recentActivity || [];

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu panel de explorador...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { name: 'Dashboard', href: '/explorador/dashboard', icon: HomeIcon, current: true },
    { name: 'Buscar Servicios', href: '/explorador/buscar-servicio', icon: MagnifyingGlassIcon, current: false },
    { name: 'Mis Solicitudes', href: '/explorador/mis-solicitudes', icon: BriefcaseIcon, current: false },
    { name: 'Mensajes', href: '/explorador/chats', icon: ChatBubbleLeftRightIcon, current: false, badge: displayStats.unreadMessages },
    { name: 'Calificaciones', href: '/explorador/calificaciones', icon: StarIcon, current: false },
    { name: 'Profesionales', href: '/explorador/navegar-profesionales', icon: MapPinIcon, current: false },
  ];

  const statCards = [
    {
      title: 'Solicitudes Activas',
      value: displayStats.activeBookings,
      icon: ClockIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-white'
    },
    {
      title: 'Servicios Completados',
      value: displayStats.completedBookings,
      icon: CheckCircleIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-white'
    },
    {
      title: 'Total Invertido',
      value: `$${displayStats.totalSpent.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-white'
    },
    {
      title: 'Total Solicitudes',
      value: displayStats.favoriteServices,
      icon: BriefcaseIcon,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      textColor: 'text-white'
    }
  ];

  return (
    <>
      <Head>
        <title>Panel de Explorador - Fixia</title>
        <meta name="description" content="Busca y contrata los mejores servicios profesionales en Chubut" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  F
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Fixia</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-4 px-2">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link href="/explorador/cambiar-a-as">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all mb-4">
                  <h3 className="font-semibold text-sm mb-1">¿Querés ofrecer servicios?</h3>
                  <p className="text-xs text-blue-100">Convertite en AS y empezá a ganar dinero</p>
                </div>
              </Link>
              
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Top Navigation */}
          <div className="bg-white shadow-sm border-b">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                  <h1 className="ml-2 text-2xl font-bold text-gray-900">
                    ¡Hola, {user?.first_name}!
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <BellIcon className="h-6 w-6" />
                  </button>
                  <Link href="/explorador/cambiar-a-as">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      Cambiar a AS
                    </button>
                  </Link>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, index) => (
                <div key={card.title} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className={`${card.color} p-6`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">{card.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                      </div>
                      <card.icon className="h-8 w-8 text-white/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Search */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <div className="flex items-center mb-4">
                <MagnifyingGlassIcon className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">Buscar Servicios</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="¿Qué servicio necesitás?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Todas las categorías</option>
                    <option>Plomería</option>
                    <option>Electricidad</option>
                    <option>Carpintería</option>
                    <option>Limpieza</option>
                    <option>Jardinería</option>
                  </select>
                </div>
                <Link href="/explorador/buscar-servicio">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Buscar
                  </button>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/explorador/buscar-servicio">
                <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Buscar Servicios</h3>
                  </div>
                  <p className="text-gray-600">Encuentra profesionales para tus necesidades</p>
                </div>
              </Link>

              <Link href="/explorador/mis-solicitudes">
                <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BriefcaseIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Mis Solicitudes</h3>
                  </div>
                  <p className="text-gray-600">Gestiona tus servicios contratados</p>
                </div>
              </Link>

              <Link href="/explorador/chats">
                <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Mensajes</h3>
                    {displayStats.unreadMessages > 0 && (
                      <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                        {displayStats.unreadMessages}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">Comunícate con profesionales</p>
                </div>
              </Link>
            </div>

            {/* Booking Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Servicios Activos</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Reparación de plomería</p>
                          <p className="text-sm text-gray-500">Juan García • Hoy 14:00</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">En progreso</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Instalación eléctrica</p>
                          <p className="text-sm text-gray-500">María López • Mañana 10:00</p>
                        </div>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Programado</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">Limpieza del hogar</p>
                          <p className="text-sm text-gray-500">Carlos Ruiz • Viernes 09:00</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Confirmado</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/explorador/mis-solicitudes">
                      <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Ver todas las solicitudes
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.activity_type === 'service_request' 
                              ? activity.status === 'active' 
                                ? 'bg-blue-100' 
                                : activity.status === 'completed' 
                                ? 'bg-green-100' 
                                : 'bg-gray-100'
                              : 'bg-purple-100'
                          }`}>
                            {activity.activity_type === 'service_request' ? (
                              activity.status === 'active' ? (
                                <ClockIcon className={`h-5 w-5 ${
                                  activity.status === 'active' ? 'text-blue-600' : 'text-gray-600'
                                }`} />
                              ) : activity.status === 'completed' ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                              ) : (
                                <BriefcaseIcon className="h-5 w-5 text-gray-600" />
                              )
                            ) : (
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {activity.service_title}
                              {activity.activity_type === 'service_request' && activity.interest_count > 0 && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  {activity.interest_count} interesados
                                </span>
                              )}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleDateString('es-AR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {activity.category_name && (
                                <span className="text-xs text-gray-400">•</span>
                              )}
                              {activity.category_name && (
                                <span className="text-xs text-gray-500">{activity.category_name}</span>
                              )}
                              {activity.urgency && activity.urgency !== 'medium' && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    activity.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                                    activity.urgency === 'emergency' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {activity.urgency === 'high' ? 'Urgente' :
                                     activity.urgency === 'emergency' ? 'Emergencia' :
                                     activity.urgency === 'low' ? 'Baja' : 'Normal'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BriefcaseIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No hay actividad reciente</p>
                        <p className="text-xs mt-1">Comenzá creando tu primera solicitud de servicio</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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

export default ExplorerDashboard;