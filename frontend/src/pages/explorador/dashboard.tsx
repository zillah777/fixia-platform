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
  MapPinIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';

const ExplorerDashboard: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }

    if (!loading && user?.user_type === 'customer') {
      setLoadingData(false);
    }
  }, [user, loading, router]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu panel de explorador...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Panel de Explorador - Fixia</title>
        <meta name="description" content="Busca y contrata los mejores servicios profesionales en Chubut" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <h1 className="text-2xl font-bold text-gray-900">
                ¡Hola, {user?.first_name}!
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Buscar Servicios */}
            <Link href="/explorador/buscar-servicio">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <MagnifyingGlassIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Buscar Servicios</h3>
                </div>
                <p className="text-gray-600">Encuentra profesionales para tus necesidades</p>
              </div>
            </Link>

            {/* Mis Solicitudes */}
            <Link href="/explorador/mis-solicitudes">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <BriefcaseIcon className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Mis Solicitudes</h3>
                </div>
                <p className="text-gray-600">Gestiona tus servicios contratados</p>
              </div>
            </Link>

            {/* Chats */}
            <Link href="/explorador/chats">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Chats</h3>
                </div>
                <p className="text-gray-600">Comunícate con profesionales</p>
              </div>
            </Link>

            {/* Calificaciones */}
            <Link href="/explorador/calificaciones">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <StarIcon className="h-8 w-8 text-yellow-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Mis Calificaciones</h3>
                </div>
                <p className="text-gray-600">Revisa y deja reseñas</p>
              </div>
            </Link>

            {/* Profesionales */}
            <Link href="/explorador/navegar-profesionales">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-8 w-8 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Profesionales</h3>
                </div>
                <p className="text-gray-600">Explora profesionales cercanos</p>
              </div>
            </Link>

            {/* Convertirse en AS */}
            <Link href="/explorador/cambiar-a-as">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">¿Querés ofrecer servicios?</h3>
                <p className="text-blue-100">Convertite en AS y empezá a ganar dinero</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExplorerDashboard;