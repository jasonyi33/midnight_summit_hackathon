// API Client for Frontend-Backend Integration
// Handles all API calls and WebSocket connections

const config = require('./config');

class ApiClient {
  constructor() {
    this.baseUrl = config.backend.url;
    this.wsUrl = config.backend.wsUrl;
    this.ws = null;
    this.eventHandlers = new Map();
  }

  // Initialize WebSocket connection
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        // Note: In real implementation, use proper WebSocket library
        console.log(`Connecting to WebSocket at ${this.wsUrl}`);

        // Mock WebSocket for demo
        this.ws = {
          send: (data) => console.log('WS Send:', data),
          close: () => console.log('WS Closed'),
          on: (event, handler) => {
            this.eventHandlers.set(event, handler);
          },
        };

        setTimeout(() => {
          console.log('WebSocket connected');
          resolve(this.ws);
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Subscribe to real-time events
  subscribe(eventType, callback) {
    if (!this.ws) {
      throw new Error('WebSocket not connected');
    }
    this.eventHandlers.set(eventType, callback);
  }

  // API Methods

  // Create a new order
  async createOrder(orderData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.backend.apiKey,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      // Return mock data for demo
      return {
        orderId: `ORD-${Date.now()}`,
        status: 'created',
        ...orderData,
      };
    }
  }

  // Approve an order (buyer action)
  async approveOrder(orderId, zkProof) {
    try {
      const response = await fetch(`${this.baseUrl}/api/orders/${orderId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.backend.apiKey,
        },
        body: JSON.stringify({ zkProof }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving order:', error);
      // Return mock data for demo
      return {
        orderId,
        status: 'approved',
        approvedAt: new Date().toISOString(),
      };
    }
  }

  // Confirm delivery (logistics action)
  async confirmDelivery(orderId, gpsData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.backend.apiKey,
        },
        body: JSON.stringify({ gpsData }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      // Return mock data for demo
      return {
        orderId,
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        paymentReleased: true,
      };
    }
  }

  // Get order by role (different views based on role)
  async getOrderView(orderId, role) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/orders/${orderId}?role=${role}`,
        {
          headers: {
            'X-API-Key': config.backend.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting order view:', error);
      // Return mock data based on role
      return this.getMockOrderView(orderId, role);
    }
  }

  // Get all orders for a role
  async getOrders(role) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/orders?role=${role}`,
        {
          headers: {
            'X-API-Key': config.backend.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting orders:', error);
      // Return mock data for demo
      return this.getMockOrders(role);
    }
  }

  // Mock Data Generators (for demo when backend not available)

  getMockOrderView(orderId, role) {
    const baseOrder = {
      orderId: orderId || 'ORD-001',
      quantity: 100,
      deliveryLocation: 'Chicago, IL',
      status: 'in_transit',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    };

    // Different views based on role
    switch (role) {
      case 'supplier':
        return {
          ...baseOrder,
          price: 10000, // Supplier sees price
          buyer: 'MegaRetail',
          paymentStatus: 'pending',
        };

      case 'buyer':
        return {
          ...baseOrder,
          // Buyer doesn't see price, only proof it's within budget
          priceProof: 'ZK_PROOF_WITHIN_BUDGET',
          supplier: 'ACME Corp',
        };

      case 'logistics':
        return {
          ...baseOrder,
          currentLocation: { lat: 41.8781, lng: -87.6298 },
          estimatedDelivery: new Date(Date.now() + 7200000).toISOString(),
          trackingNumber: 'TRK-123456',
        };

      case 'regulator':
        return {
          ...baseOrder,
          complianceProof: 'ZK_PROOF_COMPLIANT',
          // Regulator sees proof of compliance without commercial details
          proofOfDelivery: null,
          proofOfPayment: null,
        };

      default:
        return baseOrder;
    }
  }

  getMockOrders(role) {
    const orders = [
      {
        orderId: 'ORD-001',
        quantity: 100,
        status: 'in_transit',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        orderId: 'ORD-002',
        quantity: 250,
        status: 'pending_approval',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        orderId: 'ORD-003',
        quantity: 50,
        status: 'delivered',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    // Add role-specific data
    return orders.map(order => this.getMockOrderView(order.orderId, role));
  }

  // Emit mock events for demo
  emitMockEvent(eventType, data) {
    const handler = this.eventHandlers.get(eventType);
    if (handler) {
      handler(data);
    }
  }

  // Clean up
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventHandlers.clear();
  }
}

module.exports = ApiClient;