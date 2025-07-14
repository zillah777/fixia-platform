import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/hooks/useAuth';
import { explorerService } from '@/services/explorer';

const CambiarAASPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [switching, setSwitching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!loading && user?.user_type !== 'client') {
      router.push('/auth/login');
      return;
    }

    // If user is already an AS, redirect to AS dashboard
    if (user?.user_type === 'provider') {
      router.push('/as/dashboard');
      return;
    }
  }, [user, loading]);

  const handleSwitchToAS = async () => {
    try {
      setSwitching(true);
      
      const response = await explorerService.switchToProvider();
      
      if (response.success) {
        // Show success message and redirect
        alert('¡Felicitaciones! Tu cuenta se ha convertido exitosamente a AS. Ahora puedes ofrecer tus servicios profesionales en Fixia.');
        
        // Redirect to AS dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/as/dashboard';
        }, 1000);
      } else {
        alert('Error al cambiar a AS: ' + response.message);
      }
    } catch (error: any) {
      alert('Error al cambiar a AS: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setSwitching(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Convertirse en AS - Fixia</title>
        <meta name="description" content="Conviértete en un profesional AS y ofrece tus servicios en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/explorador/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Convertirse en Profesional AS
                </h1>
                <p className="text-gray-600 mt-1">
                  Ofrece tus servicios y genera ingresos en Fixia
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                ¡Únete a los Mejores Profesionales de Chubut!
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Conviértete en un AS (Agente de Servicios) y conecta con clientes que necesitan tus habilidades
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span>Clientes verificados</span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  <span>Pagos seguros</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 mr-2" />
                  <span>Sistema de calificaciones</span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Genera Ingresos Extra
              </h3>
              <p className="text-gray-600 text-sm">
                Monetiza tus habilidades y conocimientos. Fija tus propios precios y horarios de trabajo.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Clientes en Tu Zona
              </h3>
              <p className="text-gray-600 text-sm">
                Conecta con Exploradores de tu localidad que buscan exactamente tus servicios.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Plataforma Segura
              </h3>
              <p className="text-gray-600 text-sm">
                Sistema de verificación, calificaciones mutuas y protección para ambas partes.
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ¿Cómo Funciona Como AS?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Completa tu Perfil</h4>
                <p className="text-sm text-gray-600">
                  Agrega tu experiencia, servicios y verifica tu identidad
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Recibe Solicitudes</h4>
                <p className="text-sm text-gray-600">
                  Los Exploradores te encontrarán y te enviarán solicitudes
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Negocia y Trabaja</h4>
                <p className="text-sm text-gray-600">
                  Chatea, acuerda detalles y realiza el trabajo
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Cobra y Califícate</h4>
                <p className="text-sm text-gray-600">
                  Recibe el pago y construye tu reputación
                </p>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FireIcon className="h-8 w-8 mr-4" />
                <div>
                  <h3 className="text-xl font-bold">¡Oferta de Lanzamiento!</h3>
                  <p className="text-orange-100">
                    Los primeros 200 AS profesionales obtienen 2 meses gratis de suscripción premium
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">GRATIS</div>
                <div className="text-sm text-orange-100">2 meses</div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Importante: Mantén Ambos Roles
                </h3>
                <div className="text-yellow-700 space-y-2 text-sm">
                  <p>• <strong>Podrás seguir siendo Explorador:</strong> Tu rol de cliente se mantiene activo</p>
                  <p>• <strong>Cambio de interfaz:</strong> Al convertirte en AS, accederás al panel de profesionales</p>
                  <p>• <strong>Puedes volver:</strong> Siempre podrás cambiar entre tus roles de Explorador y AS</p>
                  <p>• <strong>Mismo usuario:</strong> Mantiene tu historial, calificaciones y datos de cuenta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <LightBulbIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Listo para Empezar tu Carrera como AS?
              </h3>
              <p className="text-gray-600 mb-6">
                Al hacer clic en "Convertirse en AS" se activará tu perfil profesional y podrás empezar a recibir solicitudes de servicios inmediatamente.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explorador/dashboard">
                  <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Volver al Panel Explorador
                  </button>
                </Link>
                
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center justify-center"
                >
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Convertirse en AS
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              </div>
              
              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>El cambio es instantáneo y reversible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <UserGroupIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ¿Confirmar Conversión a AS?
                </h3>
                <p className="text-gray-600 mb-6">
                  Tu cuenta se convertirá en un perfil profesional AS. Podrás ofrecer servicios y seguir siendo Explorador cuando quieras.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center text-sm text-green-700">
                    <FireIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">¡Incluye 2 meses gratis de suscripción premium!</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={switching}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSwitchToAS}
                    disabled={switching}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {switching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                      </>
                    ) : (
                      'Sí, Convertir a AS'
                    )}
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

export default CambiarAASPage;