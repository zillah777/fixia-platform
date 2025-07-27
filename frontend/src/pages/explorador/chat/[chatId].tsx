import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeft,
  Send,
  CheckCircle,
  AlertTriangle,
  Star,
  User,
  CheckCircle as CheckBadge,
  Phone,
  Video
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { explorerService } from '@/services/explorer';
import { ChatMessage, ExplorerASConnection } from '@/types/explorer';
import { io, Socket } from 'socket.io-client';

const ChatPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { chatId } = router.query;
  
  const [connection, setConnection] = useState<ExplorerASConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showServiceCompletion, setShowServiceCompletion] = useState(false);
  const [completingService, setCompletingService] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && user?.user_type !== 'customer') {
      router.push('/auth/login');
      return;
    }
    
    if (chatId && user) {
      loadChatData();
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [chatId, user, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat');
      if (chatId) {
        newSocket.emit('join_chat', chatId);
      }
    });

    newSocket.on('new_chat_message', (data) => {
      if (data.chat_room_id === chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    newSocket.on('service_completed', () => {
      setShowServiceCompletion(false);
      loadChatData(); // Reload to get updated connection status
    });

    setSocket(newSocket);
  };

  const loadChatData = async () => {
    try {
      setLoadingData(true);
      
      // First get all connections to find the one with this chat room ID
      const connectionsRes = await explorerService.getChatConnections();
      if (!connectionsRes.success) {
        router.push('/explorador/chats');
        return;
      }

      const currentConnection = connectionsRes.data.find(conn => conn.chat_room_id === chatId);
      if (!currentConnection) {
        router.push('/explorador/chats');
        return;
      }

      setConnection(currentConnection);
      
      // Load messages for this chat
      const messagesRes = await explorerService.getChatMessages(chatId as string);
      if (messagesRes.success) {
        setMessages(messagesRes.data);
      }
      
    } catch (error) {
      console.error('Error loading chat data:', error);
      router.push('/explorador/chats');
    } finally {
      setLoadingData(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      const response = await explorerService.sendChatMessage(chatId as string, {
        message: newMessage.trim()
      });
      
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        messageInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleServiceCompletion = async () => {
    if (!connection) return;
    
    try {
      setCompletingService(true);
      
      const response = await explorerService.confirmServiceCompletion(connection.id, {
        comment: 'Servicio completado desde el chat del Explorador'
      });
      
      if (response.success) {
        setShowServiceCompletion(false);
        
        if (response.data.both_confirmed) {
          // Both parties have confirmed - show success message
          alert('¡Perfecto! Ambas partes han confirmado que el servicio fue exitoso. Ahora puedes calificar al AS.');
        } else {
          // Only explorer confirmed, waiting for AS
          alert('Has confirmado que el servicio fue exitoso. El AS también debe confirmar antes de que puedan calificarse mutuamente.');
        }
        
        loadChatData(); // Reload to get updated status
      } else {
        alert('Error al confirmar finalización del servicio: ' + response.message);
      }
    } catch (error: any) {
      alert('Error al confirmar finalización del servicio: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setCompletingService(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-AR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chat no encontrado</h2>
          <Link href="/explorador/chats">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Volver a mis chats
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Chat con {connection.as_name} - Fixia</title>
        <meta name="description" content={`Conversación con ${connection.as_name} sobre ${connection.service_title}`} />
      </Head>

      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        </div>

        {/* Modern Glassmorphism Header */}
        <div className="relative z-10 backdrop-blur-xl bg-white/90 shadow-2xl border-b border-white/20 flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Link href="/explorador/chats">
                  <button className="group mr-6 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-blue-200">
                    <ArrowLeft className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                  </button>
                </Link>
                
                <div className="flex items-center space-x-4">
                  {/* Enhanced Avatar with Status */}
                  <div className="relative group">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-105 transition-all duration-300">
                      {connection.as_profile_image ? (
                        <img 
                          src={connection.as_profile_image} 
                          alt={connection.as_name}
                          className="w-14 h-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-bold text-lg">
                          {connection.as_name?.[0]}{connection.as_last_name?.[0]}
                        </span>
                      )}
                    </div>
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 border-3 border-white rounded-full animate-pulse shadow-lg"></div>
                    {connection.verification_status === 'verified' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckBadge className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {connection.as_name} {connection.as_last_name}
                      </h1>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        En línea
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium mt-1">💼 {connection.service_title}</p>
                    <p className="text-sm text-gray-500">⚡ Responde típicamente en 5 minutos</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link href={`/explorador/profesional/${connection.as_id}`}>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Ver perfil">
                    <User className="h-5 w-5 text-gray-600" />
                  </button>
                </Link>
                
                {connection.status === 'service_in_progress' && (
                  <>
                    {connection.explorer_confirmed_completion && !connection.as_confirmed_completion ? (
                      <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium">
                        ⏳ Esperando confirmación del AS
                      </div>
                    ) : connection.as_confirmed_completion && !connection.explorer_confirmed_completion ? (
                      <button
                        onClick={() => setShowServiceCompletion(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium animate-pulse"
                      >
                        🔔 AS confirmó - Confirmar también
                      </button>
                    ) : !connection.explorer_confirmed_completion && !connection.as_confirmed_completion ? (
                      <button
                        onClick={() => setShowServiceCompletion(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Confirmar Finalización
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Service Status Alert */}
        {connection.status === 'completed' && (
          <div className="bg-green-50 border-b border-green-200 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 text-sm font-medium">
                Servicio completado. ¡No olvides calificar al AS!
              </span>
              <Link href="/explorador/calificaciones" className="ml-auto">
                <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                  Calificar
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Inicia la conversación
                  </h3>
                  <p className="text-gray-500">
                    Pregunta detalles sobre el servicio y acuerden los términos
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  const showDate = index === 0 || 
                    formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 my-4">
                          {formatDate(message.created_at)}
                        </div>
                      )}
                      
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <form onSubmit={sendMessage} className="flex items-center space-x-4">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sendingMessage || connection.status === 'completed'}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage || connection.status === 'completed'}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Service Completion Modal */}
        {showServiceCompletion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {connection?.as_confirmed_completion 
                  ? '🔔 ¡El AS ya confirmó! Confirma también'
                  : '¿Confirmar que el servicio fue exitoso?'
                }
              </h3>
              <div className="text-gray-600 mb-6 space-y-2">
                <p>
                  {connection?.as_confirmed_completion 
                    ? 'El AS ya confirmó que el trabajo fue exitoso. Al confirmar también:'
                    : 'Al confirmar que el servicio fue exitoso:'
                  }
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 text-gray-500">
                  <li>Ambas partes deben confirmar que el trabajo fue exitoso</li>
                  <li>Solo cuando ambos confirmen, podrán calificarse mutuamente</li>
                  <li>Tendrán 7 días para completar las calificaciones</li>
                  <li>Las calificaciones son obligatorias para seguir usando Fixia</li>
                </ul>
                {!connection?.as_confirmed_completion && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-blue-700 text-sm">
                      💡 Después de tu confirmación, el AS también deberá confirmar
                    </p>
                  </div>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowServiceCompletion(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                  disabled={completingService}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleServiceCompletion}
                  disabled={completingService}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {completingService ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Confirmando...
                    </>
                  ) : (
                    '✅ Confirmar Éxito'
                  )}
                </button>
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

export default ChatPage;