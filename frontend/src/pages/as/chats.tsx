import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  User,
  Search,
  Clock,
  Check,
  CheckCircle
} from 'lucide-react';

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
    setChats([]);
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
          <p className="text-white/90 text-lg font-medium">Cargando chats...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mensajes - AS Panel - Fixia</title>
        <meta name="description" content="Gestiona tus conversaciones con clientes como AS en Fixia" />
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <motion.h1 
                  className="text-3xl font-bold text-white mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Mensajes
                </motion.h1>
                <motion.p 
                  className="text-white/80 text-lg flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Conversaciones con tus clientes
                  {totalUnread > 0 && (
                    <motion.span 
                      className="ml-3 px-3 py-1 text-white text-sm rounded-full font-medium"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.8) 100%)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      {totalUnread} no leídos
                    </motion.span>
                  )}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Search */}
          <motion.div 
            className="p-6 mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-white placeholder-white/60 rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>
          </motion.div>

          {/* Chats List */}
          <motion.div 
            className="overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {filteredChats.length === 0 ? (
              <div className="p-12 text-center">
                <div className="p-4 rounded-xl mb-4 mx-auto w-fit" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                  <MessageCircle className="h-16 w-16 text-white mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
                </h3>
                <p className="text-white/70 text-lg">
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
                              <User className="h-6 w-6 text-gray-400" />
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
                                <CheckCircle className="h-4 w-4" />
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
          </motion.div>

          {/* Quick Tips */}
          {chats.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Consejos para un mejor servicio</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-blue-600" />
                  Responde rápidamente para generar confianza
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-blue-600" />
                  Confirma siempre los detalles del servicio y horario
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-blue-600" />
                  Mantén una comunicación profesional y cordial
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-blue-600" />
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