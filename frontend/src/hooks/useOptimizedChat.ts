'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useOptimizedChat } from '@/contexts/OptimizedWebSocketContext';
import { useAuth } from '@/contexts/AuthContext';

// Types
interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_type: 'provider' | 'customer';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  message_type?: 'text' | 'image' | 'system';
}

interface ChatRoom {
  id: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  service_title?: string;
  service_price?: number;
  participants: Array<{
    id: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
    user_type: 'provider' | 'customer';
    rating?: number;
    verified?: boolean;
  }>;
  created_at: string;
  last_activity: string;
  unread_count: number;
}

// Enhanced chat hook with React Query + WebSocket optimization
export function useOptimizedChatRoom(chatId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const optimizedSocket = useOptimizedChat(chatId);
  
  // Track local optimistic updates
  const pendingMessages = useRef<Map<string, ChatMessage>>(new Map());
  const messageQueue = useRef<Array<{ content: string, tempId: string }>>([]); 
  
  // Chat room query with intelligent caching
  const chatQuery = useQuery({
    queryKey: ['chats', 'room', chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch chat room');
      const data = await response.json();
      return data as ChatRoom;
    },
    enabled: !!chatId && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Messages query with optimistic updates
  const messagesQuery = useQuery({
    queryKey: ['chats', 'messages', chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.messages as ChatMessage[];
    },
    enabled: !!chatId && !!user,
    staleTime: 1000 * 30, // 30 seconds for messages
    refetchInterval: optimizedSocket.isConnected ? false : 30000, // Poll only when disconnected
  });

  // Enhanced message sending with optimistic updates and retry logic
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: { content: string; messageType?: string }) => {
      if (!chatId) throw new Error('No chat ID');
      
      // Try WebSocket first (faster)
      if (optimizedSocket.isConnected) {
        const success = await optimizedSocket.sendMessage(content, messageType);
        if (success) return { success: true, method: 'websocket' };
      }
      
      // Fallback to HTTP API
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content, message_type: messageType }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      return { success: true, method: 'http', message: data.message };
    },
    
    // Optimistic update
    onMutate: async ({ content, messageType = 'text' }) => {
      if (!chatId || !user) return;

      // Create temporary optimistic message
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        content,
        sender_id: user.id.toString(),
        sender_type: user.user_type as 'provider' | 'customer',
        timestamp: new Date().toISOString(),
        status: 'sending',
        message_type: messageType as any,
      };

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chats', 'messages', chatId] });

      // Get previous messages
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['chats', 'messages', chatId]) || [];

      // Add optimistic message
      queryClient.setQueryData(['chats', 'messages', chatId], [...previousMessages, optimisticMessage]);

      // Store for rollback
      pendingMessages.current.set(tempId, optimisticMessage);

      return { previousMessages, tempId };
    },

    onSuccess: (data, variables, context) => {
      if (!context || !chatId) return;

      const { tempId } = context;
      
      // If WebSocket succeeded, the real message will arrive via WebSocket
      if (data.method === 'websocket') {
        // Just update the optimistic message status
        queryClient.setQueryData(['chats', 'messages', chatId], (old: ChatMessage[] | undefined) => {
          if (!old) return old;
          return old.map(msg => 
            msg.id === tempId ? { ...msg, status: 'sent' as const } : msg
          );
        });
      } else {
        // Replace optimistic message with real one
        queryClient.setQueryData(['chats', 'messages', chatId], (old: ChatMessage[] | undefined) => {
          if (!old) return old;
          return old.map(msg => 
            msg.id === tempId ? { ...data.message, status: 'sent' as const } : msg
          );
        });
      }

      // Clean up
      pendingMessages.current.delete(tempId);
      
      // Update chat list (mark as recently active)
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
    },

    onError: (error, variables, context) => {
      if (!context || !chatId) return;

      const { previousMessages, tempId } = context;
      
      // Revert to previous state
      queryClient.setQueryData(['chats', 'messages', chatId], previousMessages);
      
      // Clean up
      pendingMessages.current.delete(tempId);
      
      console.error('Failed to send message:', error);
    },
  });

  // Message retry system for failed messages
  const retryMessage = useCallback(async (tempId: string) => {
    const pendingMessage = pendingMessages.current.get(tempId);
    if (!pendingMessage) return;

    try {
      await sendMessageMutation.mutateAsync({ 
        content: pendingMessage.content, 
        messageType: pendingMessage.message_type || 'text'
      });
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }, [sendMessageMutation]);

  // Auto-mark messages as read when user views them
  const markAsRead = useCallback(async () => {
    if (!chatId || !messagesQuery.data || !user) return;

    const unreadMessages = messagesQuery.data.filter(
      msg => msg.sender_id !== user.id.toString() && msg.status !== 'read'
    );

    if (unreadMessages.length === 0) return;

    // Optimistically update locally
    queryClient.setQueryData(['chats', 'messages', chatId], (old: ChatMessage[] | undefined) => {
      if (!old) return old;
      return old.map(msg => 
        msg.sender_id !== user.id.toString() ? { ...msg, status: 'read' as const } : msg
      );
    });

    // Send to server
    try {
      await fetch(`/api/chats/${chatId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['chats', 'messages', chatId] });
    }
  }, [chatId, messagesQuery.data, queryClient, user]);

  // Auto mark as read when messages are viewed
  useEffect(() => {
    if (messagesQuery.data && chatId) {
      const timer = setTimeout(markAsRead, 1000); // 1 second delay
      return () => clearTimeout(timer);
    }
    // Always return cleanup function to satisfy TypeScript
    return () => {};
  }, [messagesQuery.data, chatId, markAsRead]);

  const retryFailedMessage = useCallback((tempId: string) => {
    return retryMessage(tempId);
  }, [retryMessage]);

  // Typing indicator support
  const sendTyping = useCallback(() => {
    if (optimizedSocket.isConnected && chatId) {
      optimizedSocket.socket?.emit('typing', { chat_room_id: chatId });
    }
    return true; // Add return to satisfy TypeScript
  }, [optimizedSocket, chatId]);

  const stopTyping = useCallback(() => {
    if (optimizedSocket.isConnected && chatId) {
      optimizedSocket.socket?.emit('stop_typing', { chat_room_id: chatId });
    }
    return true; // Add return to satisfy TypeScript
  }, [optimizedSocket, chatId]);

  return {
    // Data
    chat: chatQuery.data,
    messages: messagesQuery.data || [],
    
    // Loading states
    isLoadingChat: chatQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    isInitialLoading: chatQuery.isLoading || messagesQuery.isLoading,
    
    // Connection info
    isConnected: optimizedSocket.isConnected,
    connectionQuality: optimizedSocket.connectionQuality,
    
    // Actions
    sendMessage: (content: string, messageType?: string) => 
      sendMessageMutation.mutate({ content, messageType: messageType || 'text' }),
    retryMessage,
    markAsRead,
    sendTyping,
    stopTyping,
    
    // States
    isSending: sendMessageMutation.isPending,
    sendError: sendMessageMutation.error,
    
    // Refetch methods
    refetch: () => {
      chatQuery.refetch();
      messagesQuery.refetch();
    }
  };
}

// Hook for chat list with real-time updates
export function useOptimizedChatList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isConnected, socket } = useOptimizedChat(null);

  const chatsQuery = useQuery({
    queryKey: ['chats', 'list', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      return data.chats as ChatRoom[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: isConnected ? false : 60000, // Poll only when disconnected
  });

  // Listen for real-time chat updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleChatUpdate = (data: { chat_room_id: string, update: Partial<ChatRoom> }) => {
      queryClient.setQueryData(['chats', 'list', user?.id], (old: ChatRoom[] | undefined) => {
        if (!old) return old;
        return old.map(chat => 
          chat.id === data.chat_room_id ? { ...chat, ...data.update } : chat
        );
      });
    };

    socket.on('chat_updated', handleChatUpdate);
    
    return () => {
      socket.off('chat_updated', handleChatUpdate);
    };
  }, [socket, isConnected, queryClient, user]);

  return {
    chats: chatsQuery.data || [],
    isLoading: chatsQuery.isLoading,
    error: chatsQuery.error,
    refetch: chatsQuery.refetch,
    isConnected,
  };
}