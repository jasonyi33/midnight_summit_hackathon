/**
 * Mock GPS Oracle Service
 *
 * Simulates GPS tracking and shipment movement for demo purposes
 * Automatically progresses contracts through states with timed intervals
 *
 * Features:
 * - Simulates GPS coordinates moving from origin to destination
 * - Broadcasts real-time position updates every 30 seconds
 * - Automatically triggers delivery confirmation when shipment "arrives"
 * - Can be started/stopped for demo control
 */

const state = require('../models/state');
const websocketService = require('./websocket');

class GPSOracleService {
  constructor() {
    this.isRunning = false;
    this.updateInterval = null;
    this.updateFrequency = 30000; // 30 seconds in milliseconds
    this.trackedContracts = new Map(); // contractId -> tracking data
  }

  /**
   * Start the GPS oracle service
   */
  start() {
    if (this.isRunning) {
      console.log('[Oracle] Service already running');
      return;
    }

    this.isRunning = true;
    console.log('[Oracle] GPS Oracle service started');
    console.log(`[Oracle] Tracking updates every ${this.updateFrequency / 1000} seconds`);

    // Start the update loop
    this.updateInterval = setInterval(() => {
      this.processTrackedContracts();
    }, this.updateFrequency);

    // Initial scan for contracts that need tracking
    this.scanForContractsToTrack();
  }

  /**
   * Stop the GPS oracle service
   */
  stop() {
    if (!this.isRunning) {
      console.log('[Oracle] Service not running');
      return;
    }

    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log('[Oracle] GPS Oracle service stopped');
  }

  /**
   * Scan for contracts that need GPS tracking
   * Tracks contracts in 'approved' or 'in_transit' status
   */
  scanForContractsToTrack() {
    const contracts = state.getAllContracts();

    contracts.forEach(contract => {
      const shouldTrack = (
        (contract.status === state.ORDER_STATUS.APPROVED ||
         contract.status === state.ORDER_STATUS.IN_TRANSIT) &&
        !this.trackedContracts.has(contract.id)
      );

      if (shouldTrack) {
        this.startTrackingContract(contract);
      }
    });
  }

  /**
   * Start tracking a specific contract
   */
  startTrackingContract(contract) {
    // Generate realistic origin and destination coordinates
    const origin = this.getOriginLocation(contract);
    const destination = contract.deliveryLocation;

    // Initialize tracking data
    const trackingData = {
      contractId: contract.id,
      origin,
      destination,
      currentLocation: { ...origin },
      progress: 0,
      totalSteps: 10, // Will reach destination in 10 updates (5 minutes at 30s intervals)
      stepCount: 0,
      startedAt: new Date().toISOString()
    };

    this.trackedContracts.set(contract.id, trackingData);

    // Update contract status to in_transit if it's approved
    if (contract.status === state.ORDER_STATUS.APPROVED) {
      state.updateContract(contract.id, {
        status: state.ORDER_STATUS.IN_TRANSIT,
        trackingStartedAt: trackingData.startedAt
      });

      // Broadcast status change
      websocketService.broadcastShipmentStatus(
        contract.id,
        state.ORDER_STATUS.IN_TRANSIT,
        'Shipment picked up and in transit'
      );

      console.log(`[Oracle] Started tracking contract ${contract.id}`);
    }
  }

  /**
   * Stop tracking a specific contract
   */
  stopTrackingContract(contractId) {
    if (this.trackedContracts.has(contractId)) {
      this.trackedContracts.delete(contractId);
      console.log(`[Oracle] Stopped tracking contract ${contractId}`);
    }
  }

  /**
   * Process all tracked contracts - called every update interval
   */
  processTrackedContracts() {
    if (this.trackedContracts.size === 0) {
      // Scan for new contracts to track
      this.scanForContractsToTrack();
      return;
    }

    this.trackedContracts.forEach((trackingData, contractId) => {
      this.updateContractPosition(trackingData);
    });
  }

  /**
   * Update the GPS position for a tracked contract
   */
  updateContractPosition(trackingData) {
    const contract = state.getContract(trackingData.contractId);

    // Contract might have been cancelled or completed
    if (!contract || contract.status === state.ORDER_STATUS.DELIVERED ||
        contract.status === state.ORDER_STATUS.PAID ||
        contract.status === state.ORDER_STATUS.CANCELLED) {
      this.stopTrackingContract(trackingData.contractId);
      return;
    }

    // Increment progress
    trackingData.stepCount++;
    trackingData.progress = Math.min(
      Math.round((trackingData.stepCount / trackingData.totalSteps) * 100),
      100
    );

    // Calculate new position (interpolate between origin and destination)
    const progressRatio = trackingData.stepCount / trackingData.totalSteps;
    trackingData.currentLocation = {
      lat: this.interpolate(
        trackingData.origin.lat,
        trackingData.destination.lat,
        progressRatio
      ),
      lng: this.interpolate(
        trackingData.origin.lng,
        trackingData.destination.lng,
        progressRatio
      )
    };

    // Calculate estimated arrival
    const remainingSteps = trackingData.totalSteps - trackingData.stepCount;
    const remainingTime = remainingSteps * this.updateFrequency;
    const estimatedArrival = new Date(Date.now() + remainingTime).toISOString();

    // Broadcast GPS update
    websocketService.broadcastGPSUpdate(trackingData.contractId, {
      currentLocation: trackingData.currentLocation,
      destination: trackingData.destination,
      progress: trackingData.progress,
      estimatedArrival
    });

    // Create GPS event
    state.addEvent({
      contractId: trackingData.contractId,
      type: 'gps_update',
      data: {
        location: trackingData.currentLocation,
        progress: trackingData.progress,
        estimatedArrival
      }
    });

    // Check if delivery has been reached
    if (trackingData.progress >= 100) {
      this.triggerDeliveryConfirmation(contract, trackingData);
    }
  }

  /**
   * Trigger delivery confirmation when shipment arrives
   * Automatically calls the deliver endpoint
   */
  triggerDeliveryConfirmation(contract, trackingData) {
    console.log(`[Oracle] Shipment arrived for contract ${contract.id} - triggering delivery confirmation`);

    // Update contract to delivered status
    const updatedContract = state.updateContract(contract.id, {
      status: state.ORDER_STATUS.DELIVERED,
      deliveredBy: 'logistics',
      deliveredAt: new Date().toISOString(),
      finalGpsLocation: trackingData.destination
    });

    // Create delivery event
    const event = state.addEvent({
      contractId: contract.id,
      type: 'delivery_confirmed',
      data: {
        deliveredBy: 'logistics',
        gpsLocation: trackingData.destination,
        message: 'Delivery confirmed by GPS oracle'
      }
    });

    // Broadcast delivery confirmation
    websocketService.broadcastDeliveryConfirmation(updatedContract, trackingData.destination);
    websocketService.broadcastEvent(event);

    // Stop tracking this contract
    this.stopTrackingContract(contract.id);

    // Automatically trigger payment release after a short delay (3 seconds)
    setTimeout(() => {
      this.triggerPaymentRelease(contract);
    }, 3000);
  }

  /**
   * Automatically trigger payment release after delivery
   */
  triggerPaymentRelease(contract) {
    // Verify contract is still in delivered status
    const currentContract = state.getContract(contract.id);
    if (!currentContract || currentContract.status !== state.ORDER_STATUS.DELIVERED) {
      return;
    }

    console.log(`[Oracle] Triggering automatic payment release for contract ${contract.id}`);

    // Update contract to paid status
    const updatedContract = state.updateContract(contract.id, {
      status: state.ORDER_STATUS.PAID,
      paidAt: new Date().toISOString(),
      paymentProof: 'oracle_triggered_payment_' + Date.now()
    });

    // Create payment event
    const event = state.addEvent({
      contractId: contract.id,
      type: 'payment_released',
      data: {
        amount: 'ENCRYPTED',
        recipient: contract.supplierId,
        paymentProof: updatedContract.paymentProof,
        message: 'Payment automatically released by smart contract'
      }
    });

    // Broadcast payment notification
    websocketService.broadcastPaymentRelease(updatedContract);
    websocketService.broadcastEvent(event);
  }

  /**
   * Get origin location for a contract (supplier location)
   * Generates realistic coordinates based on supplier
   */
  getOriginLocation(contract) {
    // Mock supplier locations (could be from state or hardcoded)
    const supplierLocations = {
      'supplier': { lat: 37.7749, lng: -122.4194 }, // San Francisco
      'default': { lat: 40.7128, lng: -74.0060 }    // New York
    };

    return supplierLocations[contract.supplierId] || supplierLocations.default;
  }

  /**
   * Linear interpolation helper
   */
  interpolate(start, end, ratio) {
    return start + (end - start) * ratio;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      updateFrequency: this.updateFrequency,
      trackedContracts: this.trackedContracts.size,
      contracts: Array.from(this.trackedContracts.values()).map(data => ({
        contractId: data.contractId,
        progress: data.progress,
        currentLocation: data.currentLocation
      }))
    };
  }

  /**
   * Set update frequency (for demo control)
   */
  setUpdateFrequency(milliseconds) {
    this.updateFrequency = milliseconds;
    console.log(`[Oracle] Update frequency set to ${milliseconds / 1000} seconds`);

    // Restart interval if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Manually trigger tracking for a specific contract
   * Useful for demo purposes
   */
  trackContract(contractId) {
    const contract = state.getContract(contractId);
    if (!contract) {
      console.log(`[Oracle] Contract ${contractId} not found`);
      return false;
    }

    if (this.trackedContracts.has(contractId)) {
      console.log(`[Oracle] Contract ${contractId} is already being tracked`);
      return false;
    }

    this.startTrackingContract(contract);
    return true;
  }
}

// Export singleton instance
module.exports = new GPSOracleService();
