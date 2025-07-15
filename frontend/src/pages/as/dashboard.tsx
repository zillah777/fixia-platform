import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  UserIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CogIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  total_services: number;
  active_services: number;
  pending_requests: number;
  completed_bookings: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
  profile_completion: number;
}

const ASDashboard: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    total_services: 0,
    active_services: 0,
    pending_requests: 0,
    completed_bookings: 0,
    total_earnings: 0,
    average_rating: 0,
    total_reviews: 0,
    profile_completion: 0
  });

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    // TODO: Fetch real stats from API
    setStats({
      total_services: 3,
      active_services: 2,
      pending_requests: 5,
      completed_bookings: 12,
      total_earnings: 25000,
      average_rating: 4.8,
      total_reviews: 8,
      profile_completion: 75
    });
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel AS...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Panel AS - {user?.first_name} - Fixia</title>
        <meta name="description" content="Panel de control para profesionales AS en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" className="text-2xl font-bold text-blue-600">
                    Fixia
                  </Link>
                </div>
                <div className="ml-8">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Panel Profesional AS
                  </h1>
                  <p className="text-gray-600">
                    Bienvenido, {user?.first_name} {user?.last_name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/explorador/dashboard">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Cambiar a Explorador
                  </button>
                </Link>
                
                <Link href="/as/configuracion">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <CogIcon className="h-6 w-6" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Completion Alert */}
          {stats.profile_completion < 100 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Completa tu perfil para obtener más clientes
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Tu perfil está {stats.profile_completion}% completo. Complétalo para aparecer mejor posicionado en las búsquedas.
                  </p>
                  <Link href="/as/perfil">
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                      Completar Perfil
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Servicios Activos</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.active_services}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/as/servicios">
                  <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                    Gestionar servicios →
                  </button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Solicitudes Pendientes</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending_requests}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/as/solicitudes">
                  <button className="text-orange-600 text-sm hover:text-orange-700 font-medium">
                    Ver solicitudes →
                  </button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Calificación</p>
                  <div className="flex items-center">
                    <p className="text-3xl font-bold text-green-600">{stats.average_rating}</p>
                    <StarIcon className="h-6 w-6 text-yellow-400 ml-2" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <StarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/as/calificaciones">
                  <button className="text-green-600 text-sm hover:text-green-700 font-medium">
                    Ver reseñas ({stats.total_reviews}) →
                  </button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Ganancias Totales</p>
                  <p className="text-3xl font-bold text-purple-600">${stats.total_earnings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-purple-600 text-sm font-medium">
                  {stats.completed_bookings} trabajos completados
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
                
                <div className="space-y-4">
                  <Link href="/as/servicios?action=create">
                    <button className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <PlusIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Crear Nuevo Servicio</p>
                        <p className="text-sm text-gray-600">Agrega un servicio a tu catálogo</p>
                      </div>
                    </button>
                  </Link>

                  <Link href="/as/perfil">
                    <button className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <UserIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Editar Perfil</p>
                        <p className="text-sm text-gray-600">Actualiza tu información profesional</p>
                      </div>
                    </button>
                  </Link>

                  <Link href="/as/chat">
                    <button className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Mensajes</p>
                        <p className="text-sm text-gray-600">Chatea con tus clientes</p>
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity & Services */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Mis Servicios</h3>
                  <Link href="/as/servicios">
                    <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                      Ver todos →
                    </button>
                  </Link>
                </div>

                {/* Mock Services List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Reparación de Plomería</p>
                        <p className="text-sm text-gray-600">$2,500 • 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                        <BriefcaseIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Instalación Eléctrica</p>
                        <p className="text-sm text-gray-600">$3,800 • 3 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-60">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <BriefcaseIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Limpieza de Hogar</p>
                        <p className="text-sm text-gray-600">$1,800 • 4 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Pausado</span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link href="/as/servicios?action=create">
                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors font-medium">
                      + Agregar Nuevo Servicio
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Navegación</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/as/solicitudes">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Solicitudes</span>
                  {stats.pending_requests > 0 && (
                    <span className="text-xs text-orange-600">
                      {stats.pending_requests} nuevas
                    </span>
                  )}
                </button>
              </Link>

              <Link href="/as/chat">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Mensajes</span>
                </button>
              </Link>

              <Link href="/as/calificaciones">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <StarIcon className="h-8 w-8 text-yellow-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Reseñas</span>
                </button>
              </Link>

              <Link href="/as/configuracion">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <CogIcon className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Configuración</span>
                </button>
              </Link>
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

export default ASDashboard;