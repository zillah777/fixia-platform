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
  CurrencyDollarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { useExploradorDashboardData } from '@/hooks/useDashboardData';
import { CorporateHeader, CorporateCard, CorporateButton, CorporateInput, CorporateNavigation, CorporateFooter } from '@/components/ui';
import Logo from '@/components/Logo';

const ExplorerDashboard: NextPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { stats: dashboardStats, loading: statsLoading, error } = useExploradorDashboardData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const displayStats = dashboardStats?.stats || {
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteServices: 0,
    unreadMessages: 0
  };

  const recentActivityData = dashboardStats?.recentActivity || [];

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


  const stats = [
    {
      title: "Solicitudes Activas",
      value: displayStats.activeBookings.toString(),
      change: "+12.5%",
      trend: "up",
      icon: BoltIcon,
      description: "En progreso"
    },
    {
      title: "Servicios Completados", 
      value: displayStats.completedBookings.toString(),
      change: "+8.2%",
      trend: "up",
      icon: CheckCircleIcon,
      description: "Finalizados exitosamente"
    },
    {
      title: "Inversión Total",
      value: `$${displayStats.totalSpent.toLocaleString()}`,
      change: "+15.3%",
      trend: "up", 
      icon: CurrencyDollarIcon,
      description: "Presupuesto utilizado"
    },
    {
      title: "Total Solicitudes",
      value: displayStats.favoriteServices.toString(),
      change: "+5.1%",
      trend: "up",
      icon: BriefcaseIcon,
      description: "Historial completo"
    }
  ];

  const recentActivity = [
    {
      user: "AS Plomero",
      action: "Completó reparación de grifo",
      time: "2 horas ago",
      avatar: "AP",
      type: "completed"
    },
    {
      user: "AS Electricista",
      action: "Aceptó solicitud de instalación",
      time: "5 horas ago", 
      avatar: "AE",
      type: "accepted"
    },
    {
      user: "AS Jardinero",
      action: "Envió presupuesto detallado",
      time: "1 día ago",
      avatar: "AJ",
      type: "quote"
    },
    {
      user: "AS Pintor",
      action: "Programó cita para evaluación",
      time: "2 días ago",
      avatar: "AP",
      type: "scheduled"
    }
  ];

  return (
    <>
      <Head>
        <title>Panel Profesional de Explorador | Fixia</title>
        <meta name="description" content="Gestiona tus servicios profesionales, solicitudes y comunicación con AS certificados en Chubut" />
        <meta name="keywords" content="panel explorador, gestión servicios, AS certificados, Chubut" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Unified Corporate Navigation */}
        <CorporateNavigation 
          userType="customer" 
          user={user} 
          onLogout={logout}
        />

        {/* Main Content */}
        <div className="sidebar-desktop:ml-72 xs:sidebar-desktop:ml-80">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Panel de Control</h1>
                <p className="text-gray-600 mt-1">Bienvenido, {user?.first_name}! Aquí tienes un resumen de tu actividad.</p>
              </div>
              <Link href="/explorador/buscar-servicio">
                <button className="glass-cta text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:scale-105 transition-all duration-300 shadow-lg">
                  <PlusIcon className="w-5 h-5" />
                  <span>Nueva Solicitud</span>
                </button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.title} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        {stat.trend === "up" ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ml-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-forest-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Card */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="h-64 bg-gradient-to-br from-forest-50 to-teal-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 text-forest-500 mx-auto mb-4" />
                    <p className="text-gray-600">Gráfico de actividad próximamente</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-forest-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-xs">{activity.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                        <p className="text-xs text-gray-500">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/explorador/perfil">
                  <button className="h-20 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center bg-transparent transition-all w-full">
                    <UserIcon className="w-6 h-6 mb-2 text-forest-600" />
                    <span className="text-sm font-medium">Editar Perfil</span>
                  </button>
                </Link>
                <Link href="/explorador/cambiar-password">
                  <button className="h-20 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center bg-transparent transition-all w-full">
                    <KeyIcon className="w-6 h-6 mb-2 text-teal-600" />
                    <span className="text-sm font-medium">Cambiar Contraseña</span>
                  </button>
                </Link>
                <Link href="/explorador/mis-solicitudes">
                  <button className="h-20 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center bg-transparent transition-all w-full">
                    <DocumentTextIcon className="w-6 h-6 mb-2 text-gold-600" />
                    <span className="text-sm font-medium">Mis Solicitudes</span>
                  </button>
                </Link>
                <Link href="/explorador/chats">
                  <button className="h-20 rounded-xl border border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center bg-transparent transition-all w-full">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 mb-2 text-coral-600" />
                    <span className="text-sm font-medium">Mensajes</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExplorerDashboard;