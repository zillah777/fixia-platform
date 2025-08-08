import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Send,
  Image,
  User,
  Phone,
  MapPin,
  Clock,
  Check,
  CheckCircle
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Message, Chat } from '@/types';

const ASChatDetail: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { chatId } = router.query;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && user?.user_type !== 'provider') {
      router.push('/explorador/cambiar-a-as');
      return;
    }

    if (chatId) {
      // Fetch real chat and messages from API
      fetchChatData(chatId as string);
    }
  }, [user, loading, chatId]);

  const fetchChatData = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch chat details
      const chatResponse = await fetch(`/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        setChat(chatData.data);
      }

      // Fetch messages
      const messagesResponse = await fetch(`/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.data?.messages || []);
      }

    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !chat) return;

    // Check if chat is active
    if (chat.status !== 'active') {
      alert('Esta conversación aún no ha sido aceptada o está inactiva');
      return;
    }

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear immediately for better UX

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageContent,
          message_type: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newMessageData: Message = data.data;
        setMessages(prev => [...prev, newMessageData]);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al enviar mensaje');
        setNewMessage(messageContent); // Restore message on error
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar mensaje');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', { 
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
      return date.toLocaleDateString('es-AR');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chat no encontrado</p>
          <Link href="/as/chat">
            <button className="mt-4 text-blue-600 hover:text-blue-700">
              Volver a chats
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Chat con {chat.other_user_first_name} - AS Panel - Fixia</title>
        <meta name="description" content="Chat con cliente en Fixia" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link href="/as/chat">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
              </Link>
              
              <div className="flex items-center flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
                  {chat.other_user_photo ? (
                    <img
                      src={chat.other_user_photo}
                      alt="Cliente"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {chat.other_user_first_name} {chat.other_user_last_name}
                  </h1>
                  {chat.service_title && (
                    <p className="text-sm text-gray-600">{chat.service_title}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MapPin className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showDate = index === 0 || 
                    (messages[index - 1]?.created_at && formatDate(messages[index - 1].created_at) !== formatDate(message.created_at));
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                          {!isOwn && (
                            <div className="flex items-center mb-1">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-2">
                                {message.sender_photo ? (
                                  <img
                                    src={message.sender_photo}
                                    alt="Sender"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {message.sender_first_name}
                              </span>
                            </div>
                          )}
                          
                          <div className={`rounded-2xl px-4 py-2 ${
                            isOwn 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          
                          <div className={`flex items-center mt-1 space-x-1 ${
                            isOwn ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.created_at)}
                            </span>
                            {isOwn && (
                              <div className="text-gray-400">
                                {message.is_read ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Image className="h-5 w-5" aria-label="Adjuntar imagen" />
              </button>
              
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  rows={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
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

export default ASChatDetail;