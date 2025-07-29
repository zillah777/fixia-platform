import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Bell,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  LogOut,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Clock,
  MapPin,
  DollarSign,
  Star,
  CheckCircle,
  AlertTriangle,
  Settings,
  Save
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  booking_updates: boolean;
  payment_updates: boolean;
  chat_messages: boolean;
  marketing_emails: boolean;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'clients_only' | 'private';
  show_phone: boolean;
  show_address: boolean;
  show_last_active: boolean;
}

interface ServiceSettings {
  auto_accept_bookings: boolean;
  advance_booking_days: number;
  service_radius_km: number;
  minimum_service_price: number;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
}

const ASConfiguracion: NextPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy' | 'service' | 'help'>('account');
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    booking_updates: true,
    payment_updates: true,
    chat_messages: true,
    marketing_emails: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: 'public',
    show_phone: true,
    show_address: false,
    show_last_active: true
  });

  const [serviceSettings, setServiceSettings] = useState<ServiceSettings>({
    auto_accept_bookings: false,
    advance_booking_days: 7,
    service_radius_km: 10,
    minimum_service_price: 1000,
    working_hours_start: '08:00',
    working_hours_end: '18:00',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  });

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }
  }, [user, loading]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Configuración guardada exitosamente');
    } catch (error) {
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const tabs = [
    { id: 'account' as const, label: 'Cuenta', icon: User },
    { id: 'notifications' as const, label: 'Notificaciones', icon: Bell },
    { id: 'privacy' as const, label: 'Privacidad', icon: ShieldCheck },
    { id: 'service' as const, label: 'Servicios', icon: DollarSign },
    { id: 'help' as const, label: 'Ayuda', icon: HelpCircle }
  ];

  const workingDaysOptions = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  if (loading) {
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
          <p className="text-white/90 text-lg font-medium">Cargando configuración...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Configuración - AS Panel - Fixia</title>
        <meta name="description" content="Configura tu cuenta y preferencias como AS en Fixia" />
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
            <div className="flex items-center py-6">
              <Link href="/as/dashboard">
                <motion.button 
                  className="mr-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="h-6 w-6" />
                </motion.button>
              </Link>
              <div className="flex-1">
                <motion.div className="flex items-center mb-2">
                  <Settings className="h-8 w-8 text-blue-400 mr-3" />
                  <h1 className="text-3xl font-bold text-white">
                    Configuración
                  </h1>
                </motion.div>
                <motion.p 
                  className="text-white/80 text-lg"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Gestiona tu cuenta y preferencias profesionales
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div 
                className="p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
                }}
              >
                <nav className="space-y-2">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        style={activeTab === tab.id ? {
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)'
                        } : {}}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.label}
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <AnimatePresence mode="wait">
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <motion.div 
                    key="account"
                    className="p-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center">
                      <User className="h-6 w-6 mr-3 text-blue-400" />
                      Información de Cuenta
                    </h3>
                    
                    <div className="space-y-6">
                      <motion.div 
                        className="flex items-center p-6"
                        style={{
                          background: 'rgba(30, 41, 59, 0.4)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px'
                        }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden mr-6"
                             style={{
                               background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                               border: '2px solid rgba(255, 255, 255, 0.2)'
                             }}>
                          {user?.profile_photo_url ? (
                            <img
                              src={user.profile_photo_url}
                              alt="Perfil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-1">
                            {user?.first_name} {user?.last_name}
                          </h4>
                          <p className="text-white/80 mb-3">{user?.email}</p>
                          <Link href="/as/perfil">
                            <motion.button 
                              className="text-blue-400 text-sm hover:text-blue-300 font-medium flex items-center"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              Editar perfil →
                            </motion.button>
                          </Link>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                          className="p-6"
                          style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-white">Estado de Verificación</span>
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          </div>
                          <p className="text-green-200">Cuenta verificada</p>
                        </motion.div>

                        <motion.div 
                          className="p-6"
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '16px'
                          }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-white">Tipo de Cuenta</span>
                            <Star className="h-6 w-6 text-blue-400" />
                          </div>
                          <p className="text-blue-200">Profesional AS</p>
                        </motion.div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <h4 className="font-bold text-white mb-6 flex items-center">
                          <Settings className="h-5 w-5 mr-2 text-blue-400" />
                          Acciones de Cuenta
                        </h4>
                        <div className="space-y-4">
                          <Link href="/explorador/dashboard">
                            <motion.button 
                              className="w-full md:w-auto flex items-center px-6 py-3 text-white rounded-xl font-medium transition-all duration-200"
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }}
                              whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.2)' }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <User className="h-5 w-5 mr-3" />
                              Cambiar a Explorador
                            </motion.button>
                          </Link>
                          
                          <motion.button
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full md:w-auto flex items-center px-6 py-3 text-white rounded-xl font-medium transition-all duration-200"
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              backdropFilter: 'blur(16px)',
                              border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <LogOut className="h-5 w-5 mr-3" />
                            Cerrar Sesión
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div 
                    key="notifications"
                    className="p-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center">
                      <Bell className="h-6 w-6 mr-3 text-blue-400" />
                      Configuración de Notificaciones
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-white mb-6">Métodos de Notificación</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <span className="text-sm font-medium text-white">Email</span>
                                <p className="text-xs text-white/70">Recibir notificaciones por correo electrónico</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.email_notifications}
                              onChange={(e) => setNotifications(prev => ({ ...prev, email_notifications: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Push</span>
                                <p className="text-xs text-gray-600">Notificaciones en el navegador y app móvil</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.push_notifications}
                              onChange={(e) => setNotifications(prev => ({ ...prev, push_notifications: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">SMS</span>
                                <p className="text-xs text-gray-600">Mensajes de texto a tu teléfono</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications.sms_notifications}
                              onChange={(e) => setNotifications(prev => ({ ...prev, sms_notifications: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Tipos de Notificaciones</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">Nuevas solicitudes de servicios</span>
                            <input
                              type="checkbox"
                              checked={notifications.booking_updates}
                              onChange={(e) => setNotifications(prev => ({ ...prev, booking_updates: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">Actualizaciones de pagos</span>
                            <input
                              type="checkbox"
                              checked={notifications.payment_updates}
                              onChange={(e) => setNotifications(prev => ({ ...prev, payment_updates: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">Nuevos mensajes de chat</span>
                            <input
                              type="checkbox"
                              checked={notifications.chat_messages}
                              onChange={(e) => setNotifications(prev => ({ ...prev, chat_messages: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">Emails promocionales</span>
                            <input
                              type="checkbox"
                              checked={notifications.marketing_emails}
                              onChange={(e) => setNotifications(prev => ({ ...prev, marketing_emails: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Privacidad</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visibilidad del Perfil
                        </label>
                        <select
                          value={privacy.profile_visibility}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profile_visibility: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="public">Público - Visible para todos</option>
                          <option value="clients_only">Solo Clientes - Visible para clientes confirmados</option>
                          <option value="private">Privado - Solo información básica</option>
                        </select>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Información Visible</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">Mostrar número de teléfono</span>
                            <input
                              type="checkbox"
                              checked={privacy.show_phone}
                              onChange={(e) => setPrivacy(prev => ({ ...prev, show_phone: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">Mostrar dirección completa</span>
                            <input
                              type="checkbox"
                              checked={privacy.show_address}
                              onChange={(e) => setPrivacy(prev => ({ ...prev, show_address: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">Mostrar última conexión</span>
                            <input
                              type="checkbox"
                              checked={privacy.show_last_active}
                              onChange={(e) => setPrivacy(prev => ({ ...prev, show_last_active: e.target.checked }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Tab */}
                {activeTab === 'service' && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Servicios</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Automatización</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">Auto-aceptar solicitudes</span>
                            <p className="text-xs text-gray-600">Acepta automáticamente nuevas solicitudes de servicios</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={serviceSettings.auto_accept_bookings}
                            onChange={(e) => setServiceSettings(prev => ({ ...prev, auto_accept_bookings: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días de anticipación máxima
                          </label>
                          <input
                            type="number"
                            value={serviceSettings.advance_booking_days}
                            onChange={(e) => setServiceSettings(prev => ({ ...prev, advance_booking_days: parseInt(e.target.value) || 7 }))}
                            min="1"
                            max="30"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Radio de servicio (km)
                          </label>
                          <input
                            type="number"
                            value={serviceSettings.service_radius_km}
                            onChange={(e) => setServiceSettings(prev => ({ ...prev, service_radius_km: parseInt(e.target.value) || 10 }))}
                            min="1"
                            max="50"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio mínimo de servicio ($)
                          </label>
                          <input
                            type="number"
                            value={serviceSettings.minimum_service_price}
                            onChange={(e) => setServiceSettings(prev => ({ ...prev, minimum_service_price: parseInt(e.target.value) || 1000 }))}
                            min="500"
                            step="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Horarios de Trabajo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hora de inicio
                            </label>
                            <input
                              type="time"
                              value={serviceSettings.working_hours_start}
                              onChange={(e) => setServiceSettings(prev => ({ ...prev, working_hours_start: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hora de fin
                            </label>
                            <input
                              type="time"
                              value={serviceSettings.working_hours_end}
                              onChange={(e) => setServiceSettings(prev => ({ ...prev, working_hours_end: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días de trabajo
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {workingDaysOptions.map((day) => (
                              <label key={day.value} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={serviceSettings.working_days.includes(day.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setServiceSettings(prev => ({
                                        ...prev,
                                        working_days: [...prev.working_days, day.value]
                                      }));
                                    } else {
                                      setServiceSettings(prev => ({
                                        ...prev,
                                        working_days: prev.working_days.filter(d => d !== day.value)
                                      }));
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                />
                                <span className="text-sm text-gray-700">{day.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Help Tab */}
                {activeTab === 'help' && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Centro de Ayuda</h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-gray-900 mb-2">Preguntas Frecuentes</h4>
                          <p className="text-sm text-gray-600 mb-3">Encuentra respuestas a las preguntas más comunes</p>
                          <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                            Ver FAQ →
                          </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-gray-900 mb-2">Contactar Soporte</h4>
                          <p className="text-sm text-gray-600 mb-3">¿Necesitas ayuda? Contacta a nuestro equipo</p>
                          <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                            Enviar mensaje →
                          </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-gray-900 mb-2">Guías y Tutoriales</h4>
                          <p className="text-sm text-gray-600 mb-3">Aprende a usar todas las funciones de Fixia</p>
                          <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                            Ver guías →
                          </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-gray-900 mb-2">Términos y Condiciones</h4>
                          <p className="text-sm text-gray-600 mb-3">Revisa nuestros términos de servicio</p>
                          <Link href="/legal/terms">
                            <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                              Leer términos →
                            </button>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">¿Necesitas ayuda inmediata?</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Nuestro equipo de soporte está disponible de lunes a viernes de 9:00 a 18:00.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Chat en vivo
                          </button>
                          <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            Llamar soporte
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {(activeTab === 'notifications' || activeTab === 'privacy' || activeTab === 'service') && (
                  <motion.div 
                    className="px-8 py-6 border-t border-white/10"
                    style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      backdropFilter: 'blur(8px)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="flex justify-end">
                      <motion.button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="flex items-center px-8 py-3 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: saving ? 'rgba(107, 114, 128, 0.4)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: saving ? 'none' : '0 8px 24px rgba(59, 130, 246, 0.3)'
                        }}
                        whileHover={!saving ? { scale: 1.02 } : {}}
                        whileTap={!saving ? { scale: 0.98 } : {}}
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div 
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="max-w-md w-full p-8"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
                }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid rgba(239, 68, 68, 0.3)'
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <AlertTriangle className="h-10 w-10 text-red-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    ¿Cerrar Sesión?
                  </h3>
                  <p className="text-white/80 mb-8 leading-relaxed">
                    ¿Estás seguro de que quieres cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
                  </p>
                  
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      onClick={handleLogout}
                      className="flex-1 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cerrar Sesión
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

export default ASConfiguracion;