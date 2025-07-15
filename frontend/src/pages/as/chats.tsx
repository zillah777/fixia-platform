import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { Chat } from '@/types';

const ASChats: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    // TODO: Fetch real chats from API
    setChats([
      {
        id: 1,
        customer_id: 101,
        provider_id: user?.id || 1,
        booking_id: 1,
        created_at: '2024-01-18T10:30:00Z',
        updated_at: '2024-01-18T15:45:00Z',
        other_user_first_name: 'María',
        other_user_last_name: 'González',
        other_user_photo: undefined,
        service_title: 'Reparación de Plomería Residencial',
        last_message: 'Perfecto, nos vemos mañana entonces. ¡Gracias!',
        last_message_time: '2024-01-18T15:45:00Z',
        unread_count: 1
      },
      {
        id: 2,
        customer_id: 102,
        provider_id: user?.id || 1,
        booking_id: 2,
        created_at: '2024-01-17T16:45:00Z',
        updated_at: '2024-01-18T08:15:00Z',
        other_user_first_name: 'Carlos',
        other_user_last_name: 'Rodríguez',
        other_user_photo: undefined,
        service_title: 'Instalación Eléctrica Completa',
        last_message: '¿Necesitas que tenga algún material preparado?',
        last_message_time: '2024-01-18T08:15:00Z',
        unread_count: 0
      },
      {
        id: 3,
        customer_id: 103,
        provider_id: user?.id || 1,
        booking_id: 3,
        created_at: '2024-01-16T14:20:00Z',
        updated_at: '2024-01-17T12:30:00Z',
        other_user_first_name: 'Ana',
        other_user_last_name: 'López',
        other_user_photo: undefined,
        service_title: 'Reparación de Plomería Residencial',
        last_message: 'Muchas gracias por el excelente trabajo',
        last_message_time: '2024-01-17T12:30:00Z',
        unread_count: 0
      },
      {
        id: 4,
        customer_id: 104,
        provider_id: user?.id || 1,
        booking_id: undefined,
        created_at: '2024-01-15T09:15:00Z',
        updated_at: '2024-01-15T09:45:00Z',
        other_user_first_name: 'Roberto',
        other_user_last_name: 'Martínez',
        other_user_photo: undefined,
        service_title: undefined,
        last_message: 'Hola, ¿tienes disponibilidad para este fin de semana?',
        last_message_time: '2024-01-15T09:45:00Z',
        unread_count: 2
      }
    ]);
  }, [user, loading]);

  const filteredChats = chats.filter(chat => {
    const fullName = `${chat.other_user_first_name} ${chat.other_user_last_name}`.toLowerCase();
    const serviceTitle = chat.service_title?.toLowerCase() || '';
    return fullName.includes(searchQuery.toLowerCase()) || 
           serviceTitle.includes(searchQuery.toLowerCase());
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    }
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unread_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chats...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mensajes - AS Panel - Fixia</title>
        <meta name="description" content="Gestiona tus conversaciones con clientes como AS en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link href="/as/dashboard">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
                <p className="text-gray-600 mt-1">
                  Conversaciones con tus clientes
                  {totalUnread > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {totalUnread} no leídos
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Chats List */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {filteredChats.length === 0 ? (
              <div className="p-12 text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Intenta con un término de búsqueda diferente.'
                    : 'Cuando recibas solicitudes de servicios, las conversaciones aparecerán aquí.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredChats.map((chat) => (
                  <Link key={chat.id} href={`/as/chat/${chat.id}`}>
                    <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start">
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0 mr-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {chat.other_user_photo ? (
                              <img
                                src={chat.other_user_photo}
                                alt="Cliente"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          {chat.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {chat.unread_count > 9 ? '9+' : chat.unread_count}
                            </div>
                          )}
                        </div>

                        {/* Chat Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-sm font-medium truncate ${
                              chat.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {chat.other_user_first_name} {chat.other_user_last_name}
                            </h3>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {chat.last_message_time && formatTime(chat.last_message_time)}
                            </span>
                          </div>
                          
                          {chat.service_title && (
                            <p className="text-xs text-blue-600 mb-1 truncate">
                              {chat.service_title}
                            </p>
                          )}
                          
                          <div className="flex items-center">
                            <p className={`text-sm truncate flex-1 ${
                              chat.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                            }`}>
                              {chat.last_message}
                            </p>
                            
                            {chat.unread_count === 0 && (
                              <div className="ml-2 text-gray-400">
                                <CheckCircleIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          {chats.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Consejos para un mejor servicio</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Responde rápidamente para generar confianza
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Confirma siempre los detalles del servicio y horario
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Mantén una comunicación profesional y cordial
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 mr-2 text-blue-600" />
                  Avisa si necesitas reprogramar con anticipación
                </li>
              </ul>
            </div>
          )}
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

export default ASChats;