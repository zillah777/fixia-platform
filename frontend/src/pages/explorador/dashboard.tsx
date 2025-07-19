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
  ArrowRightOnRectangleIcon,
  BoltIcon,
  ShieldCheckIcon,
  UsersIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { useExploradorDashboardData } from '@/hooks/useDashboardData';
import { CorporateHeader, CorporateCard, CorporateButton, CorporateInput, CorporateNavigation, CorporateFooter } from '@/components/ui';
import Logo from '@/components/Logo';

const ExplorerDashboard: NextPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
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
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary-600 mx-auto mb-6"></div>
          <p className="text-secondary-600 font-semibold text-lg">Cargando Panel Profesional...</p>
          <p className="text-secondary-500 text-sm mt-2">Iniciando sistema de gestión</p>
        </div>
      </div>
    );
  }


  const statCards = [
    {
      title: 'Solicitudes Activas',
      value: displayStats.activeBookings,
      icon: BoltIcon,
      color: 'bg-gradient-to-r from-primary-500 to-primary-600',
      textColor: 'text-white',
      description: 'En progreso'
    },
    {
      title: 'Servicios Completados',
      value: displayStats.completedBookings,
      icon: CheckCircleIcon,
      color: 'bg-gradient-to-r from-success-500 to-success-600',
      textColor: 'text-white',
      description: 'Finalizados exitosamente'
    },
    {
      title: 'Inversión Total',
      value: `$${displayStats.totalSpent.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-gradient-to-r from-trust-500 to-trust-600',
      textColor: 'text-white',
      description: 'Presupuesto utilizado'
    },
    {
      title: 'Total Solicitudes',
      value: displayStats.favoriteServices,
      icon: BriefcaseIcon,
      color: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
      textColor: 'text-white',
      description: 'Historial completo'
    }
  ];

  return (
    <>
      <Head>
        <title>Panel Profesional de Explorador | Fixia</title>
        <meta name="description" content="Gestiona tus servicios profesionales, solicitudes y comunicación con AS certificados en Chubut" />
        <meta name="keywords" content="panel explorador, gestión servicios, AS certificados, Chubut" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        {/* Unified Corporate Navigation */}
        <CorporateNavigation 
          userType="customer" 
          user={user} 
          onLogout={logout}
        />

        {/* Main Content */}
        <div className="sidebar-desktop:ml-72 xs:sidebar-desktop:ml-80">
          {/* Corporate Professional Header */}
          <div className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-secondary-200/50">
            <div className="px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10">
              {/* Mobile Header */}
              <div className="flex items-center justify-between h-16 sm:h-18 sidebar-desktop:hidden">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-xl text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-all"
                  >
                    <Bars3Icon className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-lg xs:text-xl font-bold text-secondary-900">
                      ¡Hola, {user?.first_name}!
                    </h1>
                    <p className="text-xs text-secondary-600 font-medium">
                      Panel Profesional
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-xl transition-all relative">
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-error-500 rounded-full"></span>
                  </button>
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-trust-500 rounded-lg flex items-center justify-center shadow-lg">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Desktop Header */}
              <div className="hidden sidebar-desktop:flex items-center justify-between h-20">
                <div className="flex items-center">
                  <div className="ml-2">
                    <h1 className="text-2xl xl:text-3xl font-bold text-secondary-900">
                      ¡Bienvenido, {user?.first_name}!
                    </h1>
                    <p className="text-sm xl:text-base text-secondary-600 font-medium mt-1">
                      Panel Profesional de Gestión • Explorador Certificado
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="p-3 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-xl transition-all relative">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full"></span>
                  </button>
                  <Link href="/explorador/cambiar-a-as">
                    <CorporateButton
                      variant="primary"
                      size="sm"
                      leftIcon={<BuildingOfficeIcon className="h-4 w-4" />}
                    >
                      Convertirse en AS
                    </CorporateButton>
                  </Link>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-trust-500 rounded-xl flex items-center justify-center shadow-lg">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Stats Bar */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-secondary-200/50">
            <div className="px-6 sm:px-8 lg:px-10 py-4">
              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-success-600" />
                  <span className="text-sm font-semibold text-secondary-700">Explorador Verificado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-semibold text-secondary-700">AS Disponibles 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BoltIcon className="h-5 w-5 text-warning-600" />
                  <span className="text-sm font-semibold text-secondary-700">Respuesta Instantánea</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10">
            {/* Professional Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-8 sm:mb-10">
              {statCards.map((card, index) => (
                <CorporateCard key={card.title} variant="elevated" className="overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className={`${card.color} p-6 relative`}>
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">{card.value}</p>
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-sm mb-1">{card.title}</h3>
                      <p className="text-white/80 text-xs font-medium">{card.description}</p>
                    </div>
                  </div>
                </CorporateCard>
              ))}
            </div>

            {/* iOS-Style Professional Quick Search */}
            <CorporateCard variant="glass" className="mb-10 backdrop-blur-2xl bg-white/90 border border-white/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">Búsqueda Profesional</h2>
                  <p className="text-sm text-secondary-600 font-medium">Encuentra AS certificados para tu proyecto</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <CorporateInput
                    placeholder="¿Qué servicio profesional necesitás?"
                    value=""
                    onChange={() => {}}
                    variant="glass"
                    className="backdrop-blur-sm"
                    leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                  />
                  <select className="w-full border-2 border-white/30 rounded-2xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70">
                    <option>Todas las categorías profesionales</option>
                    <option>🔧 Plomería y Sanitarios</option>
                    <option>⚡ Electricidad y Automatización</option>
                    <option>🏗️ Carpintería y Muebles</option>
                    <option>✨ Limpieza Profesional</option>
                    <option>🌿 Jardinería y Paisajismo</option>
                  </select>
                </div>
                <div className="flex justify-center">
                  <Link href="/explorador/buscar-servicio">
                    <CorporateButton
                      size="lg"
                      className="px-8 shadow-xl hover:shadow-2xl"
                      rightIcon={<SparklesIcon className="h-4 w-4" />}
                    >
                      Buscar Profesionales
                    </CorporateButton>
                  </Link>
                </div>
              </div>
            </CorporateCard>

            {/* iOS-Style Professional Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 mb-8 sm:mb-10">
              <Link href="/explorador/buscar-servicio">
                <CorporateCard variant="glass" className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-primary-50/80 to-trust-50/80 backdrop-blur-xl border border-primary-200/50 hover:shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                      <MagnifyingGlassIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-secondary-900">Buscar Servicios</h3>
                      <div className="flex items-center mt-1">
                        <ShieldCheckIcon className="h-3 w-3 text-success-600 mr-1" />
                        <span className="text-xs text-success-600 font-semibold">AS Verificados</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary-700 font-medium text-sm leading-relaxed">Conecta con profesionales certificados para tu proyecto</p>
                </CorporateCard>
              </Link>

              <Link href="/explorador/mis-solicitudes">
                <CorporateCard variant="glass" className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-success-50/80 to-accent-50/80 backdrop-blur-xl border border-success-200/50 hover:shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-success-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                      <BriefcaseIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-secondary-900">Mis Solicitudes</h3>
                      <div className="flex items-center mt-1">
                        <BoltIcon className="h-3 w-3 text-warning-600 mr-1" />
                        <span className="text-xs text-warning-600 font-semibold">Gestión Completa</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary-700 font-medium text-sm leading-relaxed">Administra y monitorea todos tus servicios profesionales</p>
                </CorporateCard>
              </Link>

              <Link href="/explorador/chats">
                <CorporateCard variant="glass" className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-trust-50/80 to-secondary-50/80 backdrop-blur-xl border border-trust-200/50 hover:shadow-2xl relative">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-trust-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all relative">
                      <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
                      {displayStats.unreadMessages > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                          {displayStats.unreadMessages}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-secondary-900">Mensajes</h3>
                      <div className="flex items-center mt-1">
                        <UsersIcon className="h-3 w-3 text-trust-600 mr-1" />
                        <span className="text-xs text-trust-600 font-semibold">Comunicación Directa</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-secondary-700 font-medium text-sm leading-relaxed">Chat seguro y verificado con profesionales</p>
                </CorporateCard>
              </Link>
            </div>

            {/* iOS-Style Professional Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
              <CorporateCard variant="glass" className="backdrop-blur-2xl bg-white/90 border border-white/50 shadow-2xl">
                <div className="flex items-center space-x-4 pb-6 border-b border-secondary-200/50">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-trust-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BoltIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">Servicios Activos</h2>
                    <p className="text-sm text-secondary-600 font-medium">Proyectos en curso y programados</p>
                  </div>
                </div>
                <div className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary-50 to-trust-50 rounded-2xl border border-primary-200/50 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-trust-500 rounded-full shadow-lg"></div>
                        <div>
                          <p className="font-bold text-secondary-900">Reparación Plomería Profesional</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <ShieldCheckIcon className="h-3 w-3 text-success-600" />
                            <p className="text-sm text-secondary-600 font-medium">Juan García AS • Hoy 14:00</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-primary-100 text-primary-800 px-3 py-2 rounded-full font-bold shadow-sm">En Progreso</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-warning-50 to-yellow-50 rounded-2xl border border-warning-200/50 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-warning-500 to-yellow-500 rounded-full shadow-lg"></div>
                        <div>
                          <p className="font-bold text-secondary-900">Instalación Eléctrica Certificada</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <ShieldCheckIcon className="h-3 w-3 text-success-600" />
                            <p className="text-sm text-secondary-600 font-medium">María López AS • Mañana 10:00</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-warning-100 text-warning-800 px-3 py-2 rounded-full font-bold shadow-sm">Programado</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-success-50 to-accent-50 rounded-2xl border border-success-200/50 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-success-500 to-accent-500 rounded-full shadow-lg"></div>
                        <div>
                          <p className="font-bold text-secondary-900">Limpieza Profesional Premium</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <ShieldCheckIcon className="h-3 w-3 text-success-600" />
                            <p className="text-sm text-secondary-600 font-medium">Carlos Ruiz AS • Viernes 09:00</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-success-100 text-success-800 px-3 py-2 rounded-full font-bold shadow-sm">Confirmado</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link href="/explorador/mis-solicitudes">
                      <CorporateButton
                        variant="outline"
                        size="sm"
                        className="w-full"
                        rightIcon={<SparklesIcon className="h-4 w-4" />}
                      >
                        Ver Gestión Completa
                      </CorporateButton>
                    </Link>
                  </div>
                </div>
              </CorporateCard>

              <CorporateCard variant="glass" className="backdrop-blur-2xl bg-white/90 border border-white/50 shadow-2xl">
                <div className="flex items-center space-x-4 pb-6 border-b border-secondary-200/50">
                  <div className="w-12 h-12 bg-gradient-to-r from-trust-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">Actividad Reciente</h2>
                    <p className="text-sm text-secondary-600 font-medium">Historial y notificaciones</p>
                  </div>
                </div>
                <div className="pt-6">
                  <div className="space-y-5">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-r from-secondary-50/80 to-white/80 backdrop-blur-sm border border-secondary-200/30 hover:shadow-lg transition-all">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                            activity.activity_type === 'service_request' 
                              ? activity.status === 'active' 
                                ? 'bg-gradient-to-r from-primary-500 to-trust-500' 
                                : activity.status === 'completed' 
                                ? 'bg-gradient-to-r from-success-500 to-accent-500' 
                                : 'bg-gradient-to-r from-secondary-400 to-secondary-500'
                              : 'bg-gradient-to-r from-trust-500 to-secondary-500'
                          }`}>
                            {activity.activity_type === 'service_request' ? (
                              activity.status === 'active' ? (
                                <BoltIcon className="h-5 w-5 text-white" />
                              ) : activity.status === 'completed' ? (
                                <CheckCircleIcon className="h-5 w-5 text-white" />
                              ) : (
                                <BriefcaseIcon className="h-5 w-5 text-white" />
                              )
                            ) : (
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-secondary-900 text-sm">
                                {activity.service_title}
                              </p>
                              {activity.activity_type === 'service_request' && activity.interest_count > 0 && (
                                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-bold">
                                  {activity.interest_count} AS interesados
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <p className="text-xs text-secondary-600 font-medium">
                                {new Date(activity.created_at).toLocaleDateString('es-AR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {activity.category_name && (
                                <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full font-semibold">{activity.category_name}</span>
                              )}
                              {activity.urgency && activity.urgency !== 'medium' && (
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                  activity.urgency === 'high' ? 'bg-warning-100 text-warning-700' :
                                  activity.urgency === 'emergency' ? 'bg-error-100 text-error-700' :
                                  'bg-secondary-100 text-secondary-700'
                                }`}>
                                  {activity.urgency === 'high' ? '⚡ Urgente' :
                                   activity.urgency === 'emergency' ? '🚨 Emergencia' :
                                   activity.urgency === 'low' ? '⏰ Flexible' : 'Normal'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-secondary-100 to-secondary-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <BriefcaseIcon className="h-10 w-10 text-secondary-400" />
                        </div>
                        <h3 className="font-bold text-secondary-700 mb-2">Sin Actividad Reciente</h3>
                        <p className="text-sm text-secondary-600 font-medium mb-4">Comenzá creando tu primera solicitud profesional</p>
                        <Link href="/explorador/buscar-servicio">
                          <CorporateButton
                            size="sm"
                            rightIcon={<SparklesIcon className="h-4 w-4" />}
                          >
                            Crear Primera Solicitud
                          </CorporateButton>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CorporateCard>
            </div>

            {/* iOS-Style Professional Trust Footer */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center justify-center space-x-3 bg-white/80 backdrop-blur-xl rounded-2xl px-8 py-4 shadow-2xl border border-white/50">
                <Logo size="sm" showText={false} />
                <div className="text-center">
                  <p className="text-sm font-bold text-secondary-800">Sistema Profesional Certificado</p>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <ShieldCheckIcon className="h-3 w-3 text-success-600" />
                    <span className="text-xs text-secondary-600 font-semibold">Verificación garantizada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Corporate Footer */}
        <CorporateFooter variant="minimal" />
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