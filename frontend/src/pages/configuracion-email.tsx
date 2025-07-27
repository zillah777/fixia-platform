import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { CorporateLayout, CorporateCard, CorporateButton, CorporateHeader, CorporateFooter } from '@/components/ui';

interface EmailPreferences {
  serviceNotifications: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  instantNotifications: boolean;
  loginAlerts: boolean;
}

const ConfiguracionEmail: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    serviceNotifications: true,
    securityAlerts: true,
    marketingEmails: false,
    weeklyDigest: true,
    instantNotifications: true,
    loginAlerts: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <CorporateLayout variant="centered">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary-600 mx-auto mb-6"></div>
          <p className="text-secondary-600 font-semibold">Cargando configuración...</p>
        </div>
      </CorporateLayout>
    );
  }

  const handlePreferenceChange = (key: keyof EmailPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Email de prueba enviado correctamente' });
      } else {
        setMessage({ type: 'error', text: 'Error al enviar email de prueba' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const preferenceItems = [
    {
      key: 'serviceNotifications' as keyof EmailPreferences,
      title: 'Notificaciones de Servicios',
      description: 'Recibir emails sobre nuevas solicitudes y actualizaciones de servicios',
      icon: () => <span>🔔</span>,
      essential: true
    },
    {
      key: 'securityAlerts' as keyof EmailPreferences,
      title: 'Alertas de Seguridad',
      description: 'Notificaciones sobre cambios en tu cuenta y actividad de seguridad',
      icon: () => <span>🛡</span>,
      essential: true
    },
    {
      key: 'instantNotifications' as keyof EmailPreferences,
      title: 'Notificaciones Instantáneas',
      description: 'Recibir emails inmediatamente cuando ocurra una acción importante',
      icon: () => <span>✉</span>,
      essential: false
    },
    {
      key: 'loginAlerts' as keyof EmailPreferences,
      title: 'Alertas de Inicio de Sesión',
      description: 'Notificaciones cuando alguien acceda a tu cuenta',
      icon: () => <span>⚠</span>,
      essential: false
    },
    {
      key: 'weeklyDigest' as keyof EmailPreferences,
      title: 'Resumen Semanal',
      description: 'Recibir un resumen de tu actividad y estadísticas semanales',
      icon: () => <span>ℹ</span>,
      essential: false
    },
    {
      key: 'marketingEmails' as keyof EmailPreferences,
      title: 'Emails de Marketing',
      description: 'Recibir novedades, promociones y consejos de FIXIA',
      icon: () => <span>✉</span>,
      essential: false
    }
  ];

  return (
    <>
      <Head>
        <title>Configuración de Email | FIXIA</title>
        <meta name="description" content="Configura tus preferencias de email y notificaciones en FIXIA" />
        <meta name="keywords" content="configuración email, notificaciones, FIXIA, preferencias" />
      </Head>

      <CorporateLayout variant="default">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuración de Email</h1>
              <p className="text-gray-600">Personaliza cómo y cuándo recibir notificaciones</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-8">
          {/* Status Message */}
          {message && (
            <div 
              className={`mb-6 border-l-4 glass backdrop-blur-md shadow-xl border border-white/20 p-6 ${
                message.type === 'success' ? 'border-l-success-500' : 'border-l-error-500'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  message.type === 'success' 
                    ? 'bg-success-100' 
                    : 'bg-error-100'
                }`}>
                  {message.type === 'success' ? (
                    <span className="text-success-600">✓</span>
                  ) : (
                    <span className="text-error-600">×</span>
                  )}
                </div>
                <p className={`font-medium ${
                  message.type === 'success' ? 'text-success-800' : 'text-error-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="mb-8 glass backdrop-blur-md shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-4 pb-6 border-b border-secondary-200">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-trust-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✉</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary-900">
                  Cuenta de Email
                </h2>
                <p className="text-secondary-600 font-medium">
                  {user?.email} • {user?.user_type === 'provider' ? 'AS Profesional' : 'Explorador'}
                </p>
              </div>
            </div>
            
            <div className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">
                  Todas las notificaciones se enviarán a esta dirección
                </p>
              </div>
              <button
                className="h-9 px-3 glass border-white/20 hover:glass-medium text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                onClick={handleTestEmail}
              >
                <span>✉</span>
                Enviar Email de Prueba
              </button>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="mb-8 glass backdrop-blur-md shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-4 pb-6 border-b border-secondary-200">
              <div className="w-12 h-12 bg-gradient-to-r from-trust-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🔔</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary-900">
                  Preferencias de Notificaciones
                </h2>
                <p className="text-secondary-600 font-medium">
                  Controla qué tipos de emails quieres recibir
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-6">
              {preferenceItems.map((item) => (
                <div key={item.key} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-secondary-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.essential 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      <item.icon />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-secondary-900 flex items-center">
                          {item.title}
                          {item.essential && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                              Esencial
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-secondary-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[item.key]}
                          onChange={() => handlePreferenceChange(item.key)}
                          disabled={item.essential}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences[item.key] ? 'bg-primary-600' : 'bg-secondary-300'
                        } ${item.essential ? 'opacity-50' : ''}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences[item.key] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-8 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
              {!saving && <span>✓</span>}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          © 2025 FIXIA. Todos los derechos reservados.
        </div>
      </CorporateLayout>
    </>
  );
};

export default ConfiguracionEmail;