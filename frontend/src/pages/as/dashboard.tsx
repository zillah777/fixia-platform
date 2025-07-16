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
  EyeIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { useASDashboardData } from '@/hooks/useDashboardData';
import Logo from '@/components/Logo';

const ASDashboard: NextPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { stats, loading: statsLoading, error, refetch } = useASDashboardData();
  
  useEffect(() => {
    if (!authLoading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading || statsLoading) {
    return (
      <div className="hero section-padding-lg">
        <div className="container">
          <div className="text-center animate-fade-in">
            <Logo size="lg" variant="gradient" className="mb-8" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-6"></div>
            <p className="text-secondary font-medium">Cargando tu panel AS...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hero section-padding-lg">
        <div className="container">
          <div className="text-center">
            <div className="card glass p-8 max-w-md mx-auto">
              <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary mb-2">Error al cargar datos</h2>
              <p className="text-secondary mb-6">{error}</p>
              <button 
                onClick={refetch}
                className="btn btn-primary btn-magnetic hover-lift"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Servicios Totales',
      value: stats?.total_services || 0,
      icon: BriefcaseIcon,
      color: 'primary',
      description: 'Servicios publicados'
    },
    {
      title: 'Servicios Activos',
      value: stats?.active_services || 0,
      icon: CheckCircleIcon,
      color: 'success',
      description: 'Disponibles ahora'
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats?.pending_requests || 0,
      icon: ClockIcon,
      color: 'warning',
      description: 'Requieren respuesta'
    },
    {
      title: 'Trabajos Completados',
      value: stats?.completed_bookings || 0,
      icon: CheckCircleIcon,
      color: 'success',
      description: 'Finalizados exitosamente'
    },
    {
      title: 'Ingresos Totales',
      value: `$${(stats?.total_earnings || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'secondary',
      description: 'Ganancias acumuladas'
    },
    {
      title: 'Calificación Promedio',
      value: stats?.average_rating || 0,
      icon: StarIcon,
      color: 'warning',
      description: `${stats?.total_reviews || 0} reseñas`
    }
  ];

  return (
    <>
      <Head>
        <title>Panel AS - {user?.first_name} - Fixia</title>
        <meta name="description" content="Panel de control para Anunciantes de Servicios en las páginas amarillas del futuro" />
      </Head>

      {/* Background with Gradient */}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-primary opacity-5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        
        {/* Modern Header */}
        <header className="nav relative">
          <div className="container">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-8">
                <Link href="/">
                  <div className="hover-lift cursor-pointer">
                    <Logo size="lg" variant="gradient" />
                  </div>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    Panel AS
                  </h1>
                  <p className="text-secondary">
                    Bienvenido, <span className="font-medium">{user?.first_name} {user?.last_name}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/explorador/dashboard">
                  <button className="btn btn-ghost hover-lift hover-magnetic">
                    <UsersIcon className="h-5 w-5 mr-2" />
                    Cambiar a Explorador
                  </button>
                </Link>
                
                <Link href="/as/configuracion">
                  <button className="btn btn-ghost btn-icon hover-lift hover-magnetic">
                    <CogIcon className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="relative py-8">
          <div className="container">
            {/* Profile Completion Alert */}
            {stats && stats.profile_completion < 100 && (
              <div className="card glass mb-8 border border-warning-200 bg-gradient-to-r from-warning-50 to-warning-100 animate-scale-in">
                <div className="flex items-start">
                  <SparklesIcon className="h-6 w-6 text-warning-600 mt-0.5 mr-4 flex-shrink-0 animate-bounce" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-warning-800 mb-2">
                      ¡Completa tu perfil para destacar!
                    </h3>
                    <p className="text-warning-700 mb-4">
                      Tu perfil está <span className="font-bold">{stats.profile_completion}%</span> completo. 
                      Los AS con perfiles completos reciben <span className="font-bold">3x más solicitudes</span>.
                    </p>
                    <div className="w-full bg-warning-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-warning-500 to-warning-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${stats.profile_completion}%` }}
                      ></div>
                    </div>
                    <Link href="/as/perfil">
                      <button className="btn btn-warning btn-magnetic hover-lift">
                        Completar Perfil
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <div className="card glass">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-primary">Análisis de Ingresos</h2>
                    <div className="flex space-x-2">
                      <button className="btn btn-sm btn-ghost">7 días</button>
                      <button className="btn btn-sm btn-primary">30 días</button>
                      <button className="btn btn-sm btn-ghost">90 días</button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-sm text-secondary">Ingresos del mes</p>
                        <p className="text-3xl font-bold text-primary">${(stats?.total_earnings || 0).toLocaleString()}</p>
                        <p className="text-sm text-success-600">+12% vs mes anterior</p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary">Servicios completados</p>
                        <p className="text-2xl font-bold text-primary">{stats?.completed_bookings || 0}</p>
                        <p className="text-sm text-success-600">+5 este mes</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-48 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <ArrowTrendingUpIcon className="h-12 w-12 text-primary-400 mx-auto mb-2" />
                      <p className="text-secondary">Gráfico de ingresos próximamente</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="card glass">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary">Rendimiento</h3>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">Tasa de conversión</span>
                      <span className="text-sm font-medium text-primary">68%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary">Tiempo respuesta</span>
                      <span className="text-sm font-medium text-primary">2.3h</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-gradient-success h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="card glass">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary">Calificación</h3>
                    <StarIcon className="h-5 w-5 text-warning-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{stats?.average_rating || 0}</p>
                    <div className="flex justify-center space-x-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-warning-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-secondary">{stats?.total_reviews || 0} reseñas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div 
                  key={stat.title}
                  className={`card glass hover-lift hover-magnetic cursor-pointer animate-scale-in`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      p-3 rounded-xl 
                      ${stat.color === 'primary' ? 'bg-gradient-primary text-white' : ''}
                      ${stat.color === 'success' ? 'bg-gradient-success text-white' : ''}
                      ${stat.color === 'warning' ? 'bg-gradient-to-r from-warning-500 to-warning-600 text-white' : ''}
                      ${stat.color === 'secondary' ? 'bg-gradient-secondary text-white' : ''}
                      hover-bounce
                    `}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-xs text-tertiary">{stat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/as/servicios">
                <div className="card hover-lift hover-magnetic cursor-pointer text-center animate-scale-in" style={{animationDelay: '0.6s'}}>
                  <div className="p-4 bg-gradient-primary rounded-xl text-white mx-auto w-16 h-16 flex items-center justify-center mb-4 hover-bounce">
                    <BriefcaseIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Mis Servicios</h3>
                  <p className="text-secondary text-sm">Gestiona tus ofertas</p>
                </div>
              </Link>

              <Link href="/as/solicitudes">
                <div className="card hover-lift hover-magnetic cursor-pointer text-center animate-scale-in" style={{animationDelay: '0.7s'}}>
                  <div className="p-4 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl text-white mx-auto w-16 h-16 flex items-center justify-center mb-4 hover-bounce">
                    <ClockIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Solicitudes</h3>
                  <p className="text-secondary text-sm">Revisa peticiones</p>
                </div>
              </Link>

              <Link href="/as/chats">
                <div className="card hover-lift hover-magnetic cursor-pointer text-center animate-scale-in" style={{animationDelay: '0.8s'}}>
                  <div className="p-4 bg-gradient-secondary rounded-xl text-white mx-auto w-16 h-16 flex items-center justify-center mb-4 hover-bounce">
                    <ChatBubbleLeftRightIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Mensajes</h3>
                  <p className="text-secondary text-sm">Chatea con Exploradores</p>
                </div>
              </Link>

              <Link href="/as/calificaciones">
                <div className="card hover-lift hover-magnetic cursor-pointer text-center animate-scale-in" style={{animationDelay: '0.9s'}}>
                  <div className="p-4 bg-gradient-success rounded-xl text-white mx-auto w-16 h-16 flex items-center justify-center mb-4 hover-bounce">
                    <StarIcon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Calificaciones</h3>
                  <p className="text-secondary text-sm">Ve tus reseñas</p>
                </div>
              </Link>
            </div>

            {/* Service Management & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card glass">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-primary">Mis Servicios</h2>
                  <Link href="/as/servicios?action=create">
                    <button className="btn btn-primary btn-sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nuevo
                    </button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Reparación de Plomería</p>
                        <p className="text-sm text-gray-500">$2,500 - $5,000</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Instalación Eléctrica</p>
                        <p className="text-sm text-gray-500">$3,000 - $8,000</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Activo</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Carpintería General</p>
                        <p className="text-sm text-gray-500">$1,500 - $4,000</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Pausado</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/as/servicios">
                    <button className="w-full text-primary hover:text-primary-700 text-sm font-medium">
                      Administrar todos los servicios
                    </button>
                  </Link>
                </div>
              </div>
              
              <div className="card glass">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-primary">Calendario</h2>
                  <CalendarDaysIcon className="h-6 w-6 text-secondary" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        16
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Reparación de plomería</p>
                        <p className="text-sm text-gray-500">14:00 - 16:00 • Juan García</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Hoy</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        17
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Instalación eléctrica</p>
                        <p className="text-sm text-gray-500">10:00 - 12:00 • María López</p>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Mañana</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        20
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Limpieza del hogar</p>
                        <p className="text-sm text-gray-500">09:00 - 11:00 • Carlos Ruiz</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Viernes</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full text-primary hover:text-primary-700 text-sm font-medium">
                    Ver calendario completo
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card glass hover-lift animate-scale-in" style={{animationDelay: '1s'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary">Acciones Rápidas</h2>
                <ArrowTrendingUpIcon className="h-6 w-6 text-secondary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/as/servicios?action=create">
                  <div className="flex items-center p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer hover-lift">
                    <div className="p-2 bg-primary-100 rounded-lg mr-4">
                      <PlusIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">Publicar Nuevo Servicio</h3>
                      <p className="text-sm text-secondary">Llega a más Exploradores</p>
                    </div>
                  </div>
                </Link>

                <Link href="/as/perfil">
                  <div className="flex items-center p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer hover-lift">
                    <div className="p-2 bg-secondary-100 rounded-lg mr-4">
                      <UserIcon className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">Actualizar Perfil</h3>
                      <p className="text-sm text-secondary">Mejora tu visibilidad</p>
                    </div>
                  </div>
                </Link>
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

export default ASDashboard;