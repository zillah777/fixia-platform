'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { queryClient } from './QueryProvider';
import { QUERY_KEYS } from '@/hooks/useOptimizedQueries';

interface OptimizedWebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  reconnectAttempts: number;
  lastActivity: Date | null;
}

interface OptimizedWebSocketContextType extends OptimizedWebSocketState {
  // Chat methods
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, content: string, messageType?: string) => Promise<boolean>;
  
  // Connection management
  reconnect: () => void;
  disconnect: () => void;
  
  // Performance monitoring
  getLatency: () => number;
  getConnectionStats: () => {
    uptime: number;
    messagesCount: number;
    reconnectCount: number;
    averageLatency: number;
  };
}

const OptimizedWebSocketContext = createContext<OptimizedWebSocketContextType | null>(null);

// Performance monitoring
interface ConnectionStats {
  connectionStartTime: number;
  messagesCount: number;
  reconnectCount: number;
  latencyHistory: number[];
  lastPingTime: number;
  lastPongTime: number;
}

export function OptimizedWebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Socket state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  
  // Performance tracking
  const statsRef = useRef<ConnectionStats>({
    connectionStartTime: Date.now(),
    messagesCount: 0,
    reconnectCount: 0,
    latencyHistory: [],
    lastPingTime: 0,
    lastPongTime: 0,
  });
  
  // Connection management refs
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<any>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const activeChatsRef = useRef<Set<string>>(new Set());
  
  // Optimized connection with intelligent reconnection
  const createConnection = useCallback(() => {
    if (!user) return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    // Clean up existing connection
    if (socket) {
      socket.disconnect();
    }

    console.log('🔌 Creating optimized WebSocket connection...');

    const newSocket = io(process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      // Connection optimization
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected with optimizations');
      setIsConnected(true);
      setConnectionQuality('excellent');
      setReconnectAttempts(0);
      setLastActivity(new Date());
      
      statsRef.current.connectionStartTime = Date.now();
      
      // Rejoin all active chats
      activeChatsRef.current.forEach(chatId => {
        newSocket.emit('join_chat', chatId);
      });
      
      // Start heartbeat monitoring
      startHeartbeat(newSocket);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      setConnectionQuality('disconnected');
      
      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      // Intelligent reconnection based on reason
      if (reason === 'io server disconnect') {
        // Server initiated disconnect - don't auto-reconnect immediately
        scheduleReconnect(5000);
      } else {
        // Client side issue - attempt immediate reconnect
        scheduleReconnect(1000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.warn('🔸 WebSocket connection error:', error);
      setConnectionQuality('poor');
      setReconnectAttempts(prev => prev + 1);
      statsRef.current.reconnectCount++;
    });

    // Message events with React Query integration
    newSocket.on('new_chat_message', (data) => {
      console.log('💬 New message received:', data);
      setLastActivity(new Date());
      statsRef.current.messagesCount++;
      
      // Optimistically update React Query cache
      if (data.chat_room_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['chats', 'messages', data.chat_room_id] 
        });
      }
      
      // Update global chat list cache
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.chats(user?.id) 
      });
    });

    newSocket.on('message_status_update', (data) => {
      setLastActivity(new Date());
      
      // Update message status in cache
      queryClient.setQueryData(['chats', 'messages', data.chat_room_id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages?.map((msg: any) => 
            msg.id === data.message_id ? { ...msg, status: data.status } : msg
          )
        };
      });
    });

    // Performance monitoring events
    newSocket.on('pong', (latency) => {
      statsRef.current.lastPongTime = Date.now();
      const currentLatency = Date.now() - statsRef.current.lastPingTime;
      statsRef.current.latencyHistory.push(currentLatency);
      
      // Keep only last 20 latency measurements
      if (statsRef.current.latencyHistory.length > 20) {
        statsRef.current.latencyHistory.shift();
      }
      
      // Update connection quality based on latency
      updateConnectionQuality(currentLatency);
    });

    return newSocket;
  }, [user, socket]);

  // Heartbeat monitoring for connection quality
  const startHeartbeat = useCallback((socket: Socket) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        statsRef.current.lastPingTime = Date.now();
        socket.emit('ping');
      }
    }, 30000); // Check every 30 seconds
  }, []);

  // Update connection quality based on latency
  const updateConnectionQuality = useCallback((latency: number) => {
    if (latency < 100) {
      setConnectionQuality('excellent');
    } else if (latency < 300) {
      setConnectionQuality('good');
    } else {
      setConnectionQuality('poor');
    }
    return latency; // Add return to satisfy TypeScript
  }, []);

  // Intelligent reconnection scheduling
  const scheduleReconnect = useCallback((delay: number) => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      const newSocket = createConnection();
      if (newSocket) {
        setSocket(newSocket);
      }
    }, delay);
  }, [createConnection]);

  // Initialize connection
  useEffect(() => {
    if (user && !socket) {
      const newSocket = createConnection();
      if (newSocket) {
        setSocket(newSocket);
      }
    }

    // Cleanup on user change
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  // Chat management methods
  const joinChat = useCallback((chatId: string) => {
    if (socket && socket.connected) {
      socket.emit('join_chat', chatId);
      activeChatsRef.current.add(chatId);
      console.log(`📱 Joined chat: ${chatId}`);
    }
  }, [socket]);

  const leaveChat = useCallback((chatId: string) => {
    if (socket && socket.connected) {
      socket.emit('leave_chat', chatId);
      activeChatsRef.current.delete(chatId);
      console.log(`📱 Left chat: ${chatId}`);
    }
  }, [socket]);

  const sendMessage = useCallback(async (chatId: string, content: string, messageType = 'text'): Promise<boolean> => {
    if (!socket || !socket.connected) {
      console.warn('❌ Cannot send message - socket not connected');
      return false;
    }

    return new Promise((resolve) => {
      const messageData = {
        chat_room_id: chatId,
        content,
        message_type: messageType,
        timestamp: new Date().toISOString()
      };

      socket.emit('send_message', messageData, (acknowledgment: any) => {
        if (acknowledgment?.success) {
          console.log('✅ Message sent successfully');
          setLastActivity(new Date());
          statsRef.current.messagesCount++;
          resolve(true);
        } else {
          console.error('❌ Failed to send message:', acknowledgment?.error);
          resolve(false);
        }
      });

      // Timeout fallback
      setTimeout(() => resolve(false), 5000);
    });
  }, [socket]);

  // Connection management
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection initiated');
    if (socket) {
      socket.disconnect();
    }
    const newSocket = createConnection();
    if (newSocket) {
      setSocket(newSocket);
    }
  }, [createConnection, socket]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket');
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    setIsConnected(false);
    setConnectionQuality('disconnected');
  }, [socket]);

  // Performance monitoring methods
  const getLatency = useCallback((): number => {
    const history = statsRef.current?.latencyHistory || [];
    return history.length > 0 ? (history[history.length - 1] || 0) : 0;
  }, []);

  const getConnectionStats = useCallback(() => {
    const now = Date.now();
    const uptime = now - (statsRef.current?.connectionStartTime || now);
    const latencyHistory = statsRef.current?.latencyHistory || [];
    const averageLatency = latencyHistory.length > 0 
      ? latencyHistory.reduce((sum, latency) => sum + latency, 0) / latencyHistory.length 
      : 0;

    return {
      uptime,
      messagesCount: statsRef.current?.messagesCount || 0,
      reconnectCount: statsRef.current?.reconnectCount || 0,
      averageLatency: Math.round(averageLatency),
    };
  }, []);

  const value: OptimizedWebSocketContextType = {
    socket,
    isConnected,
    connectionQuality,
    reconnectAttempts,
    lastActivity,
    joinChat,
    leaveChat,
    sendMessage,
    reconnect,
    disconnect,
    getLatency,
    getConnectionStats,
  };

  return (
    <OptimizedWebSocketContext.Provider value={value}>
      {children}
    </OptimizedWebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export function useOptimizedWebSocket() {
  const context = useContext(OptimizedWebSocketContext);
  if (!context) {
    throw new Error('useOptimizedWebSocket must be used within OptimizedWebSocketProvider');
  }
  return context;
}

// Hook for chat-specific functionality
export function useOptimizedChat(chatId: string | null) {
  const websocket = useOptimizedWebSocket();
  
  useEffect(() => {
    if (chatId && websocket.isConnected) {
      websocket.joinChat(chatId);
      
      return () => {
        websocket.leaveChat(chatId);
      };
    }
    return () => {}; // Add return to satisfy TypeScript
  }, [chatId, websocket]);

  const sendMessage = useCallback(async (content: string, messageType?: string) => {
    if (!chatId) return false;
    return await websocket.sendMessage(chatId, content, messageType);
  }, [chatId, websocket]);

  return {
    ...websocket,
    sendMessage,
    isInChat: chatId ? true : false,
  };
}