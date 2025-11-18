/**
 * WebSocket Service for Real-Time Updates
 *
 * Manages WebSocket connections and broadcasts events to connected clients
 * Enhanced for Phase 2 with specific supply chain event broadcasting
 */

const WebSocket = require('ws');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      console.log(`[WebSocket] New client connected from ${req.socket.remoteAddress}`);
      this.clients.add(ws);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to ChainVault WebSocket server',
        timestamp: new Date().toISOString()
      }));

      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log(`[WebSocket] Received message:`, data);

          // Handle different message types
          if (data.type === 'ping') {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('[WebSocket] Client error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('[WebSocket] Server initialized');
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event) {
    const message = JSON.stringify(event);
    let sentCount = 0;

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
          sentCount++;
        } catch (error) {
          console.error('[WebSocket] Error sending to client:', error);
        }
      }
    });

    console.log(`[WebSocket] Broadcast event ${event.type} to ${sentCount} clients`);
  }

  /**
   * Broadcast contract update
   */
  broadcastContractUpdate(contract, action = 'updated') {
    this.broadcast({
      type: 'contract_update',
      action,
      data: contract,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast event created
   */
  broadcastEvent(event) {
    this.broadcast({
      type: 'event_created',
      data: event,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast status change
   */
  broadcastStatusChange(contractId, oldStatus, newStatus) {
    this.broadcast({
      type: 'status_change',
      contractId,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString()
    });
  }

  // ===========================================
  // PHASE 2: ENHANCED SUPPLY CHAIN EVENTS
  // ===========================================

  /**
   * Broadcast contract approval notification
   * Specific event for when buyer approves contract with ZK proof
   */
  broadcastContractApproval(contract, zkProof) {
    this.broadcast({
      type: 'contract_approved',
      contractId: contract.id,
      data: {
        contractId: contract.id,
        status: contract.status,
        approvedBy: contract.approvedBy,
        approvedAt: contract.approvedAt,
        quantity: contract.quantity,
        zkProofProvided: !!zkProof,
        message: 'Contract approved with ZK proof - price remains private'
      },
      timestamp: new Date().toISOString()
    });

    console.log(`[WebSocket] Broadcasted approval for contract ${contract.id}`);
  }

  /**
   * Broadcast GPS position update from oracle
   * Real-time updates showing shipment movement
   */
  broadcastGPSUpdate(contractId, gpsData) {
    this.broadcast({
      type: 'gps_update',
      contractId,
      data: {
        contractId,
        currentLocation: gpsData.currentLocation,
        destination: gpsData.destination,
        progress: gpsData.progress,
        estimatedArrival: gpsData.estimatedArrival,
        message: `Shipment at ${gpsData.progress}% progress`
      },
      timestamp: new Date().toISOString()
    });

    // Only log every 25% to avoid spam
    if (gpsData.progress % 25 === 0) {
      console.log(`[WebSocket] Broadcasted GPS update for contract ${contractId} - ${gpsData.progress}%`);
    }
  }

  /**
   * Broadcast delivery confirmation event
   * Triggered when GPS oracle confirms shipment arrival
   */
  broadcastDeliveryConfirmation(contract, gpsLocation) {
    this.broadcast({
      type: 'delivery_confirmed',
      contractId: contract.id,
      data: {
        contractId: contract.id,
        status: contract.status,
        deliveredBy: contract.deliveredBy,
        deliveredAt: contract.deliveredAt,
        finalGpsLocation: gpsLocation || contract.finalGpsLocation,
        message: 'Delivery confirmed at destination - triggering payment'
      },
      timestamp: new Date().toISOString()
    });

    console.log(`[WebSocket] Broadcasted delivery confirmation for contract ${contract.id}`);
  }

  /**
   * Broadcast payment release notification
   * Instant payment when delivery conditions are met
   */
  broadcastPaymentRelease(contract) {
    this.broadcast({
      type: 'payment_released',
      contractId: contract.id,
      data: {
        contractId: contract.id,
        status: contract.status,
        paidAt: contract.paidAt,
        paymentProof: contract.paymentProof,
        recipient: contract.supplierId,
        amount: 'ENCRYPTED',
        message: 'Payment automatically released - contract complete'
      },
      timestamp: new Date().toISOString()
    });

    console.log(`[WebSocket] Broadcasted payment release for contract ${contract.id}`);
  }

  /**
   * Broadcast shipment status change
   * For status changes like created -> approved -> in_transit -> delivered -> paid
   */
  broadcastShipmentStatus(contractId, status, message) {
    this.broadcast({
      type: 'shipment_status',
      contractId,
      data: {
        contractId,
        status,
        message,
        statusColor: this.getStatusColor(status)
      },
      timestamp: new Date().toISOString()
    });

    console.log(`[WebSocket] Broadcasted shipment status for contract ${contractId}: ${status}`);
  }

  /**
   * Helper method to get color coding for different statuses
   * For frontend visualization
   */
  getStatusColor(status) {
    const colorMap = {
      'created': '#3b82f6',      // blue
      'approved': '#10b981',     // green
      'in_transit': '#f59e0b',   // amber
      'delivered': '#8b5cf6',    // purple
      'paid': '#22c55e',         // success green
      'cancelled': '#ef4444'     // red
    };
    return colorMap[status] || '#6b7280'; // gray as default
  }

  /**
   * Get connection count
   */
  getConnectionCount() {
    return this.clients.size;
  }

  /**
   * Close all connections
   */
  close() {
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();
    if (this.wss) {
      this.wss.close();
    }
    console.log('[WebSocket] Server closed');
  }
}

// Export singleton instance
module.exports = new WebSocketService();
