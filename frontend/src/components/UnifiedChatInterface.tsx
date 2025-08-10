/**
 * Unified Chat Interface Component
 * Consolidates AS and Explorer chat interfaces into one reusable component
 * Maintains role-appropriate functionality while sharing common UI patterns
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Image,
  User,
  Phone,
  Video,
  MapPin,
  Clock,
  Check,
  CheckCircle,
  AlertTriangle,
  Star,
  Shield,
  MoreVertical,
  Archive,
  Flag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { FixiaAvatar } from './ui/fixia-avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

// Types
type UserType = 'provider' | 'customer';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
type ChatStatus = 'active' | 'pending' | 'completed' | 'cancelled';

interface UnifiedMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_type: UserType;
  timestamp: string;
  status: MessageStatus;
  message_type?: 'text' | 'image' | 'system';
}

interface UnifiedChatParticipant {
  id: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  user_type: UserType;
  rating?: number;
  verified?: boolean;
  location?: string;
  specialty?: string;
}

interface UnifiedChatData {
  id: string;
  status: ChatStatus;
  service_title?: string;
  service_price?: number;
  participants: UnifiedChatParticipant[];
  created_at: string;
  last_activity: string;
}

interface UnifiedChatInterfaceProps {
  /**
   * Chat ID
   */
  chatId: string;
  /**
   * Current user type
   */
  userType: UserType;
  /**
   * Custom back navigation URL
   */
  backUrl?: string;
  /**
   * Enable service completion features (for providers)
   */
  enableServiceCompletion?: boolean;
  /**
   * Enable rating features (for customers)
   */
  enableRating?: boolean;
  /**
   * Custom header component
   */
  headerComponent?: React.ReactNode;
  /**
   * Custom message bubble component
   */
  messageBubbleComponent?: (message: UnifiedMessage, isOwnMessage: boolean) => React.ReactNode;
  /**
   * Event callbacks
   */
  onMessageSent?: (message: string) => void;
  onServiceComplete?: () => void;
  onRatingSubmit?: (rating: number, review: string) => void;
}

export function UnifiedChatInterface({
  chatId,
  userType,
  backUrl,
  enableServiceCompletion = true,
  enableRating = true,
  headerComponent,
  messageBubbleComponent,
  onMessageSent,
  onServiceComplete,
  onRatingSubmit
}: UnifiedChatInterfaceProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [chat, setChat] = useState<UnifiedChatData | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showServiceCompletion, setShowServiceCompletion] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!user) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat');
      setConnectionError(false);
      if (chatId) {
        newSocket.emit('join_chat', chatId);
      }
    });

    newSocket.on('disconnect', () => {
      setConnectionError(true);
    });

    newSocket.on('new_chat_message', (data) => {
      if (data.chat_room_id === chatId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    });

    newSocket.on('message_status_update', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.message_id ? { ...msg, status: data.status } : msg
      ));
    });

    newSocket.on('service_completed', () => {
      setShowServiceCompletion(false);
      if (userType === 'customer' && enableRating) {
        setShowRatingModal(true);
      }
      loadChatData();
    });

    setSocket(newSocket);
  }, [user, chatId, userType, enableRating, scrollToBottom]);

  // Load chat data
  const loadChatData = useCallback(async () => {
    if (!chatId || !user) return;
    
    try {
      setLoading(true);
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
      } else {
        // Redirect if chat not found or no access
        router.push(backUrl || (userType === 'provider' ? '/as/chats' : '/explorador/chats'));
        return;
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
        setTimeout(scrollToBottom, 100);
      }

    } catch (error) {
      console.error('Error loading chat data:', error);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  }, [chatId, user, userType, backUrl, router, scrollToBottom]);

  // Send message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !chat || !socket) return;

    // Check chat status
    if (chat.status !== 'active') {
      alert(userType === 'provider' 
        ? 'Esta conversación aún no ha sido aceptada o está inactiva' 
        : 'Esta conversación no está activa');
      return;
    }

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Create optimistic message
      const optimisticMessage: UnifiedMessage = {
        id: `temp-${Date.now().toString()}`,
        content: messageContent,
        sender_id: user!.id.toString(),
        sender_type: userType,
        timestamp: new Date().toISOString(),
        status: 'sending',
        message_type: 'text'
      };

      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();

      // Send via socket
      socket.emit('send_message', {
        chat_room_id: chatId,
        content: messageContent,
        message_type: 'text'
      });

      // Callback
      onMessageSent?.(messageContent);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setSending(false);
      messageInputRef.current?.focus();
    }
  }, [newMessage, sending, chat, socket, userType, user, chatId, onMessageSent, scrollToBottom]);

  // Handle service completion
  const handleServiceComplete = useCallback(async () => {
    if (!chat || !socket || userType !== 'provider') return;
    
    try {
      socket.emit('complete_service', { chat_room_id: chatId });
      onServiceComplete?.();
    } catch (error) {
      console.error('Error completing service:', error);
    }
  }, [chat, socket, userType, chatId, onServiceComplete]);

  // Effects
  useEffect(() => {
    // Validate user type
    if (!user || user.user_type !== userType) {
      const redirectPath = userType === 'provider' ? '/explorador/cambiar-a-as' : '/auth/login';
      router.push(redirectPath);
      return;
    }

    loadChatData();
    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, userType, loadChatData, initializeSocket, router, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen glass flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (!chat) {
    return (
      <div className="min-h-screen glass flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chat no encontrado</h3>
          <p className="text-muted-foreground mb-4">No se pudo cargar la conversación.</p>
          <Link href={backUrl || (userType === 'provider' ? '/as/chats' : '/explorador/chats')}>
            <Button>Volver a chats</Button>
          </Link>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participants.find(p => p.id !== user?.id?.toString());
  const isServiceCompleted = chat.status === 'completed';
  const canCompleteService = userType === 'provider' && enableServiceCompletion && chat.status === 'active';

  return (
    <div className="min-h-screen glass flex flex-col">
      {/* Header */}
      {headerComponent || (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong border-b border-white/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={backUrl || (userType === 'provider' ? '/as/chats' : '/explorador/chats')}>
                <Button className="glass-medium hover:glass-strong h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              
              {otherParticipant && (
                <div className="flex items-center space-x-3">
                  <FixiaAvatar
                    {...(otherParticipant.profile_image && { src: otherParticipant.profile_image })}
                    alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
                    fallbackText={`${otherParticipant.first_name[0]}${otherParticipant.last_name[0]}`}
                    size="lg"
                    variant={otherParticipant.user_type === 'provider' ? 'professional' : 'client'}
                  />
                  <div>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <span>{otherParticipant.first_name} {otherParticipant.last_name}</span>
                      {otherParticipant.verified && <Shield className="h-4 w-4 text-green-400" />}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {otherParticipant.user_type === 'provider' && otherParticipant.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{otherParticipant.rating}</span>
                        </div>
                      )}
                      {otherParticipant.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{otherParticipant.location}</span>
                        </div>
                      )}
                      {otherParticipant.specialty && <span>{otherParticipant.specialty}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {connectionError && (
                <Badge className="bg-red-500/20 text-red-400 border-0">
                  Desconectado
                </Badge>
              )}
              
              <Badge className={`border-0 ${
                chat.status === 'active' ? 'bg-green-500/20 text-green-400' :
                chat.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                chat.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {chat.status === 'active' ? 'Activo' :
                 chat.status === 'pending' ? 'Pendiente' :
                 chat.status === 'completed' ? 'Completado' : 'Cancelado'}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="glass-medium hover:glass-strong h-10 w-10">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass border-white/20" align="end">
                  {canCompleteService && (
                    <DropdownMenuItem onClick={() => setShowServiceCompletion(true)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marcar como completado
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archivar chat
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400">
                    <Flag className="mr-2 h-4 w-4" />
                    Reportar usuario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {chat.service_title && (
            <div className="mt-3 p-3 glass-light rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{chat.service_title}</span>
                {chat.service_price && (
                  <Badge className="bg-primary/20 text-primary border-0">
                    ${chat.service_price.toLocaleString()} ARS
                  </Badge>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwnMessage = message.sender_id === user?.id.toString();
            const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
            
            if (messageBubbleComponent) {
              return messageBubbleComponent(message, isOwnMessage);
            }

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {!isOwnMessage && showAvatar && otherParticipant && (
                    <FixiaAvatar
                      {...(otherParticipant.profile_image && { src: otherParticipant.profile_image })}
                      alt={`${otherParticipant.first_name} ${otherParticipant.last_name}`}
                      fallbackText={`${otherParticipant.first_name[0]}${otherParticipant.last_name[0]}`}
                      size="sm"
                      variant={otherParticipant.user_type === 'provider' ? 'professional' : 'client'}
                    />
                  )}
                  {!isOwnMessage && !showAvatar && (
                    <div className="w-8 h-8" /> // Spacer
                  )}
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    isOwnMessage 
                      ? 'liquid-gradient text-white' 
                      : 'glass-light border border-white/10'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center space-x-1 mt-1 text-xs ${
                      isOwnMessage ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      <span>{new Date(message.timestamp).toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                      {isOwnMessage && (
                        <div className="flex">
                          {message.status === 'sending' && <Clock className="h-3 w-3" />}
                          {message.status === 'sent' && <Check className="h-3 w-3" />}
                          {message.status === 'delivered' && <Check className="h-3 w-3" />}
                          {message.status === 'read' && <CheckCircle className="h-3 w-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {chat.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong border-t border-white/10 p-4"
        >
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={sending || connectionError}
                className="glass border-white/20 focus:border-primary/50 pr-12"
              />
              <Button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 glass-medium hover:glass-strong"
                disabled={sending}
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending || connectionError}
              className="liquid-gradient hover:opacity-90 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      )}

      {/* Service Completion Modal */}
      <AnimatePresence>
        {showServiceCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowServiceCompletion(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">¿Completar servicio?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Marca este servicio como completado. El cliente podrá dejar una reseña.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowServiceCompletion(false)}
                  className="flex-1 glass-medium hover:glass-strong"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleServiceComplete}
                  className="flex-1 liquid-gradient hover:opacity-90"
                >
                  Completar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}