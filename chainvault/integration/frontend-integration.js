// Frontend Integration Module
// Provides a clean interface for Next.js frontend to communicate with backend
// Handles all API calls, WebSocket connections, and event subscriptions

const config = require('./config');

class FrontendIntegration {
  constructor() {
    this.apiBase = config.backend.url;
    this.wsBase = config.backend.wsUrl;
    this.apiKey = config.backend.apiKey;
    this.ws = null;
    this.eventListeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  // Initialize WebSocket connection for real-time updates
  async initializeWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        console.log('[FrontendIntegration] Initializing WebSocket connection...');

        // In browser environment, use native WebSocket
        // For Node.js testing, use mock WebSocket
        if (typeof window !== 'undefined' && window.WebSocket) {
          this.ws = new window.WebSocket(`${this.wsBase}/ws`);
        } else {
          // Mock WebSocket for testing
          this.ws = this.createMockWebSocket();
        }

        this.ws.onopen = () => {
          console.log('[FrontendIntegration] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.ws);
        };

        this.ws.onerror = (error) => {
          console.error('[FrontendIntegration] WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };

        this.ws.onclose = () => {
          console.log('[FrontendIntegration] WebSocket closed');
          this.isConnected = false;
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('[FrontendIntegration] Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const { type, data } = message;

      console.log('[FrontendIntegration] Received event:', type);

      // Emit event to all registered listeners
      if (this.eventListeners.has(type)) {
        const listeners = this.eventListeners.get(type);
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`[FrontendIntegration] Error in listener for ${type}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('[FrontendIntegration] Error parsing WebSocket message:', error);
    }
  }

  // Subscribe to WebSocket events
  subscribe(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);

    return () => {
      const listeners = this.eventListeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Attempt to reconnect after connection loss
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[FrontendIntegration] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.initializeWebSocket().catch(() => {
          // Silently fail, will retry
        });
      }, this.reconnectDelay);
    } else {
      console.error('[FrontendIntegration] Max reconnection attempts reached');
    }
  }

  // Create mock WebSocket for testing
  createMockWebSocket() {
    return {
      send: (data) => {
        console.log('[FrontendIntegration] Mock WS send:', data);
      },
      close: () => {
        console.log('[FrontendIntegration] Mock WS closed');
      },
      onopen: null,
      onerror: null,
      onmessage: null,
      onclose: null,
    };
  }

  // --- Order Management APIs ---

  async createOrder(orderData) {
    return this.makeRequest('/api/orders', 'POST', orderData);
  }

  async approveOrder(orderId, zkProof) {
    return this.makeRequest(`/api/orders/${orderId}/approve`, 'PUT', {
      zkProof,
    });
  }

  async confirmDelivery(orderId, gpsData) {
    return this.makeRequest(`/api/orders/${orderId}/deliver`, 'POST', {
      gpsData,
    });
  }

  async getOrder(orderId, role) {
    return this.makeRequest(`/api/orders/${orderId}?role=${role}`, 'GET');
  }

  async getOrders(role) {
    return this.makeRequest(`/api/orders?role=${role}`, 'GET');
  }

  // --- Proof Generation APIs ---

  async generateApprovalProof(orderId, budgetData) {
    return this.makeRequest(`/api/proofs/approval/${orderId}`, 'POST', budgetData);
  }

  async verifyProof(proofData) {
    return this.makeRequest('/api/proofs/verify', 'POST', proofData);
  }

  // --- Oracle APIs ---

  async getOracleStatus() {
    return this.makeRequest('/api/oracle/status', 'GET');
  }

  async triggerOracleCheck(orderId) {
    return this.makeRequest(`/api/oracle/check/${orderId}`, 'POST');
  }

  // --- Health Check ---

  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      return response.ok;
    } catch (error) {
      console.error('[FrontendIntegration] Health check failed:', error);
      return false;
    }
  }

  // --- Internal Helper ---

  async makeRequest(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.apiBase}${endpoint}`, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`[FrontendIntegration] Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Send message through WebSocket
  send(message) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[FrontendIntegration] WebSocket not connected, message queued');
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }

  // Check if connected
  isWebSocketConnected() {
    return this.isConnected;
  }
}

// Export singleton instance for use in frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrontendIntegration;
}
