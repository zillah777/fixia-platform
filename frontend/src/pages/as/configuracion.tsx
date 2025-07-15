import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeftIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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
    { id: 'account' as const, label: 'Cuenta', icon: UserIcon },
    { id: 'notifications' as const, label: 'Notificaciones', icon: BellIcon },
    { id: 'privacy' as const, label: 'Privacidad', icon: ShieldCheckIcon },
    { id: 'service' as const, label: 'Servicios', icon: CurrencyDollarIcon },
    { id: 'help' as const, label: 'Ayuda', icon: QuestionMarkCircleIcon }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Configuración - AS Panel - Fixia</title>
        <meta name="description" content="Configura tu cuenta y preferencias como AS en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/as/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona tu cuenta y preferencias
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border">
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Información de Cuenta</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                          {user?.profile_photo_url ? (
                            <img
                              src={user.profile_photo_url}
                              alt="Perfil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {user?.first_name} {user?.last_name}
                          </h4>
                          <p className="text-gray-600">{user?.email}</p>
                          <Link href="/as/perfil">
                            <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                              Editar perfil →
                            </button>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Estado de Verificación</span>
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          </div>
                          <p className="text-sm text-gray-600">Cuenta verificada</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Tipo de Cuenta</span>
                            <StarIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <p className="text-sm text-gray-600">Profesional AS</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Acciones de Cuenta</h4>
                        <div className="space-y-3">
                          <Link href="/explorador/dashboard">
                            <button className="w-full md:w-auto flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                              <UserIcon className="h-4 w-4 mr-2" />
                              Cambiar a Explorador
                            </button>
                          </Link>
                          
                          <button
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full md:w-auto flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Notificaciones</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Métodos de Notificación</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <span className="text-sm font-medium text-gray-900">Email</span>
                                <p className="text-xs text-gray-600">Recibir notificaciones por correo electrónico</p>
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
                              <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
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
                              <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
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
                  </div>
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
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ¿Cerrar Sesión?
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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