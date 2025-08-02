// WebSocket service for real-time updates
import { authService } from './auth';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.isConnecting = false;
    this.connectionListeners = [];
  }

  // Connect to WebSocket
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return Promise.reject(new Error('Connection already in progress'));
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token available');
        }

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
        const url = `${wsUrl}?token=${encodeURIComponent(token)}`;
        
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionListeners(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.notifyConnectionListeners(false);
          
          // Attempt to reconnect if not closed intentionally
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (authService.isAuthenticated()) {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, ...payload } = data;
    
    // Notify type-specific listeners
    const typeListeners = this.listeners.get(type) || [];
    typeListeners.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });

    // Notify general listeners
    const generalListeners = this.listeners.get('*') || [];
    generalListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket general listener:', error);
      }
    });
  }

  // Subscribe to specific message types
  subscribe(messageType, callback) {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    
    this.listeners.get(messageType).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(messageType);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Subscribe to all messages
  subscribeToAll(callback) {
    return this.subscribe('*', callback);
  }

  // Subscribe to connection status changes
  onConnectionChange(callback) {
    this.connectionListeners.push(callback);
    
    // Call immediately with current status
    callback(this.isConnected());

    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  // Notify connection listeners
  notifyConnectionListeners(isConnected) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Send message through WebSocket
  send(data) {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(data));
  }

  // Initialize WebSocket connection if authenticated
  async initialize() {
    if (authService.isAuthenticated()) {
      try {
        await this.connect();
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    }

    // Listen for auth state changes
    authService.subscribe(({ isAuthenticated }) => {
      if (isAuthenticated && !this.isConnected()) {
        this.connect().catch(error => {
          console.error('Failed to connect WebSocket after login:', error);
        });
      } else if (!isAuthenticated && this.isConnected()) {
        this.disconnect();
      }
    });
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Initialize WebSocket service
wsService.initialize();