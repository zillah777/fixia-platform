/**
 * WebSocket Configuration for Railway Production Environment
 * 
 * Railway-specific optimizations:
 * - Proper transport fallbacks
 * - Connection retry with exponential backoff
 * - Railway proxy headers handling
 */

export const SOCKET_CONFIG = {
  // Railway production URL
  url: process.env.NODE_ENV === 'production' 
    ? 'https://fixia-platform-production.up.railway.app'
    : 'http://localhost:5000',
  
  // Socket.IO configuration optimized for Railway
  options: {
    // Transport configuration - Railway may block websockets initially
    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    
    // Connection settings for Railway
    timeout: 20000, // 20 seconds timeout
    forceNew: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    
    // Railway-specific headers
    extraHeaders: {
      'Accept': 'application/json',
      'User-Agent': 'Fixia-Frontend/1.0'
    },
    
    // CORS settings for Railway
    withCredentials: true,
    
    // Railway proxy settings
    upgrade: true,
    rememberUpgrade: true,
    
    // Polling configuration for fallback
    polling: {
      extraHeaders: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  },
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2
  },
  
  // Events to handle
  events: {
    connect: 'connect',
    disconnect: 'disconnect',
    reconnect: 'reconnect',
    reconnectAttempt: 'reconnect_attempt',
    reconnectError: 'reconnect_error',
    reconnectFailed: 'reconnect_failed',
    error: 'error'
  }
};

/**
 * Railway Connection Health Check
 */
export const checkRailwayConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SOCKET_CONFIG.url}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Short timeout for health check
      signal: AbortSignal.timeout(5000)
    });
    
    return response.ok;
  } catch (error) {
    console.warn('🔸 Railway health check failed:', error);
    return false;
  }
};

/**
 * WebSocket Connection Manager for Railway
 */
export class RailwaySocketManager {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = SOCKET_CONFIG.retry.maxAttempts;
  private isConnecting = false;
  
  async connect(): Promise<any> {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return this.socket;
    }
    
    this.isConnecting = true;
    
    try {
      // Check Railway health before attempting WebSocket connection
      const isHealthy = await checkRailwayConnection();
      if (!isHealthy) {
        console.warn('🔸 Railway backend appears unhealthy, skipping WebSocket connection');
        this.isConnecting = false;
        return null;
      }
      
      // Dynamic import to avoid SSR issues
      const { io } = await import('socket.io-client');
      
      this.socket = io(SOCKET_CONFIG.url, SOCKET_CONFIG.options);
      
      // Connection event handlers
      this.socket.on(SOCKET_CONFIG.events.connect, () => {
        console.log('🔸 WebSocket connected to Railway');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });
      
      this.socket.on(SOCKET_CONFIG.events.disconnect, (reason: string) => {
        console.log('🔸 WebSocket disconnected from Railway:', reason);
        this.isConnecting = false;
        
        // Only attempt reconnection for certain disconnect reasons
        if (['transport close', 'transport error'].includes(reason)) {
          this.scheduleReconnect();
        }
      });
      
      this.socket.on(SOCKET_CONFIG.events.error, (error: any) => {
        console.warn('🔸 WebSocket connection error:', error);
        this.isConnecting = false;
      });
      
      this.socket.on(SOCKET_CONFIG.events.reconnectAttempt, (attemptNumber: number) => {
        console.log(`🔸 WebSocket reconnection attempt ${attemptNumber}`);
      });
      
      this.socket.on(SOCKET_CONFIG.events.reconnectFailed, () => {
        console.warn('🔸 WebSocket reconnection failed - max attempts reached');
        this.isConnecting = false;
      });
      
      return this.socket;
      
    } catch (error) {
      console.error('🔸 Failed to initialize WebSocket connection:', error);
      this.isConnecting = false;
      return null;
    }
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('🔸 Max reconnection attempts reached');
      return;
    }
    
    const delay = Math.min(
      SOCKET_CONFIG.retry.baseDelay * Math.pow(SOCKET_CONFIG.retry.backoffFactor, this.reconnectAttempts),
      SOCKET_CONFIG.retry.maxDelay
    );
    
    this.reconnectAttempts++;
    
    setTimeout(() => {
      console.log(`🔸 Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
  
  getSocket(): any {
    return this.socket;
  }
  
  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }
}

// Singleton instance
export const railwaySocketManager = new RailwaySocketManager();