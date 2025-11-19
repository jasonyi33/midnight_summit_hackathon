/**
 * API Routes for ChainVault Backend
 *
 * RESTful endpoints for contract management and event tracking
 * Phase 3: Integrated with blockchain service for on-chain operations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const state = require('../models/state');
const websocketService = require('../services/websocket');
const blockchainService = require('../services/blockchain');
const cryptoService = require('../services/crypto');

const router = express.Router();

// ===========================================
// USER ENDPOINTS
// ===========================================

/**
 * GET /api/users
 * Get all demo users
 */
router.get('/users', (req, res) => {
  try {
    const users = state.getUsers();
    res.json({
      success: true,
      data: users,
      count: Object.keys(users).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:userId
 * Get specific user
 */
router.get('/users/:userId', (req, res) => {
  try {
    const user = state.getUser(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================================
// CONTRACT ENDPOINTS
// ===========================================

/**
 * GET /api/contracts
 * Get all contracts (with optional filtering)
 */
router.get('/contracts', (req, res) => {
  try {
    const { status, role } = req.query;

    let contracts;
    if (status) {
      contracts = state.getContractsByStatus(status);
    } else if (role) {
      contracts = state.getContractsByRole(role);
    } else {
      contracts = state.getAllContracts();
    }

    res.json({
      success: true,
      data: contracts,
      count: contracts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/contracts/:contractId
 * Get specific contract
 */
router.get('/contracts/:contractId', (req, res) => {
  try {
    const contract = state.getContract(req.params.contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contracts
 * Create new contract
 * Phase 3: Registers contract on blockchain
 */
router.post('/contracts', async (req, res) => {
  try {
    const {
      supplierId,
      buyerId,
      logisticsId,
      quantity,
      price,  // FIXED: Accept plain price, not encrypted
      deliveryLocation,
      description
    } = req.body;

    // Validation
    if (!supplierId || !buyerId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supplierId, buyerId, quantity, price'
      });
    }

    // Create contract in state
    const contractId = `contract_${uuidv4()}`;
    const contractData = {
      id: contractId,
      supplierId,
      buyerId,
      logisticsId: logisticsId || 'logistics',
      quantity,
      price,  // FIXED: Store plain price for blockchain service
      deliveryLocation: deliveryLocation || { lat: 0, lng: 0 },
      description: description || `Purchase order for ${quantity} units`,
      status: state.ORDER_STATUS.CREATED
    };

    let contract = state.createContract(contractData);

    // Phase 3: Register contract on blockchain
    let blockchainTx = null;
    try {
      blockchainTx = await blockchainService.createOrder(contract);
      console.log(`[API] Contract ${contractId} registered on blockchain:`, blockchainTx);

      // Store blockchain transaction info with contract
      const updatedContract = state.updateContract(contractId, {
        blockchainTx: blockchainTx.txHash,
        onChain: blockchainTx.onChain || false
      });

      // Update contract variable with blockchain data
      if (updatedContract) {
        contract = updatedContract;
      }
    } catch (blockchainError) {
      console.error('[API] Blockchain registration failed, continuing with local state:', blockchainError.message);
      // Continue without blockchain - graceful degradation
    }

    // Create event
    const event = state.addEvent({
      contractId,
      type: 'contract_created',
      data: {
        supplierId,
        buyerId,
        quantity,
        description: contractData.description,
        blockchain: blockchainTx || { mock: true }
      }
    });

    // Broadcast updates
    websocketService.broadcastContractUpdate(contract, 'created');
    websocketService.broadcastEvent(event);

    res.status(201).json({
      success: true,
      data: contract,
      blockchain: blockchainTx,
      message: 'Contract created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/contracts/:contractId
 * Update contract (generic update)
 */
router.put('/contracts/:contractId', (req, res) => {
  try {
    const { contractId } = req.params;
    const updates = req.body;

    const existingContract = state.getContract(contractId);
    if (!existingContract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    const updatedContract = state.updateContract(contractId, updates);

    // Create event
    const event = state.addEvent({
      contractId,
      type: 'contract_updated',
      data: updates
    });

    // Broadcast updates
    websocketService.broadcastContractUpdate(updatedContract, 'updated');
    websocketService.broadcastEvent(event);

    res.json({
      success: true,
      data: updatedContract,
      message: 'Contract updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/contracts/:contractId
 * Delete/Cancel contract
 */
router.delete('/contracts/:contractId', (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = state.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Update status to cancelled
    const updatedContract = state.updateContract(contractId, {
      status: state.ORDER_STATUS.CANCELLED
    });

    // Create event
    const event = state.addEvent({
      contractId,
      type: 'contract_cancelled',
      data: { reason: req.body.reason || 'User cancelled' }
    });

    // Broadcast updates
    websocketService.broadcastContractUpdate(updatedContract, 'cancelled');
    websocketService.broadcastEvent(event);

    res.json({
      success: true,
      data: updatedContract,
      message: 'Contract cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================================
// WORKFLOW ENDPOINTS (Phase 2 + Phase 3)
// ===========================================

/**
 * POST /api/contracts/:contractId/approve
 * Buyer approves contract with ZK proof
 * Phase 3: Submits ZK proof to blockchain for verification
 *
 * Sequential workflow: supplier creates → buyer approves → logistics delivers → payment releases
 */
router.post('/contracts/:contractId/approve', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { zkProof, approvedBy } = req.body;

    // Validation
    const contract = state.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Check if contract is in correct state for approval
    if (contract.status !== state.ORDER_STATUS.CREATED) {
      return res.status(400).json({
        success: false,
        error: `Contract cannot be approved in ${contract.status} status. Must be in 'created' status.`
      });
    }

    // Validate ZK proof is provided (even if mocked for demo)
    if (!zkProof) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: zkProof'
      });
    }

    // Phase 3: Submit ZK proof to blockchain for verification
    let blockchainTx = null;
    try {
      blockchainTx = await blockchainService.approveOrder(contractId, zkProof);
      console.log(`[API] ZK proof submitted to blockchain for contract ${contractId}:`, blockchainTx);
    } catch (blockchainError) {
      console.error('[API] Blockchain proof submission failed:', blockchainError.message);

      // CRITICAL FIX: If ZK proof verification failed, DO NOT APPROVE!
      if (blockchainError.message && blockchainError.message.includes('ZK proof verification failed')) {
        return res.status(400).json({
          success: false,
          error: 'ZK proof verification failed',
          message: blockchainError.message
        });
      }

      // For other errors (network, etc.), continue with graceful degradation
      console.log('[API] Continuing with local approval due to network error');
    }

    // Update contract status to approved (only if ZK proof passed)
    const updatedContract = state.updateContract(contractId, {
      status: state.ORDER_STATUS.APPROVED,
      zkProof,
      approvedBy: approvedBy || 'buyer',
      approvedAt: new Date().toISOString(),
      blockchainApprovalTx: blockchainTx ? blockchainTx.txHash : null,
      proofVerifiedOnChain: blockchainTx ? blockchainTx.proofVerified : false
    });

    // Create approval event
    const event = state.addEvent({
      contractId,
      type: 'contract_approved',
      data: {
        approvedBy: approvedBy || 'buyer',
        quantity: contract.quantity,
        zkProofProvided: true,
        blockchain: blockchainTx || { mock: true },
        message: 'Buyer approved contract with ZK proof (price remains private)'
      }
    });

    // Broadcast approval notification
    websocketService.broadcastContractApproval(updatedContract, zkProof);
    websocketService.broadcastEvent(event);

    res.json({
      success: true,
      data: updatedContract,
      blockchain: blockchainTx,
      message: 'Contract approved successfully with ZK proof'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contracts/:contractId/deliver
 * Logistics confirms delivery with GPS proof
 * Phase 3: Submits delivery proof to blockchain
 */
router.post('/contracts/:contractId/deliver', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { gpsLocation, deliveredBy } = req.body;

    // Validation
    const contract = state.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Check if contract is in approved or in_transit status
    if (contract.status !== state.ORDER_STATUS.APPROVED &&
        contract.status !== state.ORDER_STATUS.IN_TRANSIT) {
      return res.status(400).json({
        success: false,
        error: `Contract cannot be delivered in ${contract.status} status. Must be 'approved' or 'in_transit'.`
      });
    }

    // Phase 3: Submit delivery proof to blockchain
    let blockchainTx = null;
    try {
      blockchainTx = await blockchainService.confirmDelivery(contractId, gpsLocation || contract.deliveryLocation);
      console.log(`[API] Delivery proof submitted to blockchain for contract ${contractId}:`, blockchainTx);
    } catch (blockchainError) {
      console.error('[API] Blockchain delivery confirmation failed, continuing with local state:', blockchainError.message);
      // Continue without blockchain - graceful degradation
    }

    // Update contract status to delivered
    const updatedContract = state.updateContract(contractId, {
      status: state.ORDER_STATUS.DELIVERED,
      deliveredBy: deliveredBy || 'logistics',
      deliveredAt: new Date().toISOString(),
      finalGpsLocation: gpsLocation || contract.deliveryLocation,
      blockchainDeliveryTx: blockchainTx ? blockchainTx.txHash : null,
      deliveryConfirmedOnChain: blockchainTx ? blockchainTx.deliveryConfirmed : false
    });

    // Create delivery event
    const event = state.addEvent({
      contractId,
      type: 'delivery_confirmed',
      data: {
        deliveredBy: deliveredBy || 'logistics',
        gpsLocation: gpsLocation || contract.deliveryLocation,
        blockchain: blockchainTx || { mock: true },
        message: 'Delivery confirmed at destination'
      }
    });

    // Broadcast delivery notification
    websocketService.broadcastDeliveryConfirmation(updatedContract, gpsLocation);
    websocketService.broadcastEvent(event);

    res.json({
      success: true,
      data: updatedContract,
      blockchain: blockchainTx,
      message: 'Delivery confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contracts/:contractId/pay
 * Release payment when conditions are met
 * Phase 3: Triggers on-chain payment release
 *
 * Automatically triggered when delivery is confirmed
 */
router.post('/contracts/:contractId/pay', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { paymentProof } = req.body;

    // Validation
    const contract = state.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Check if contract is delivered
    if (contract.status !== state.ORDER_STATUS.DELIVERED) {
      return res.status(400).json({
        success: false,
        error: `Payment cannot be released in ${contract.status} status. Must be 'delivered'.`
      });
    }

    // Phase 3: Trigger on-chain payment release
    let blockchainTx = null;
    try {
      blockchainTx = await blockchainService.releasePayment(contractId);
      console.log(`[API] Payment released on blockchain for contract ${contractId}:`, blockchainTx);
    } catch (blockchainError) {
      console.error('[API] Blockchain payment release failed, continuing with local state:', blockchainError.message);
      // Continue without blockchain - graceful degradation
    }

    // Update contract status to paid
    const updatedContract = state.updateContract(contractId, {
      status: state.ORDER_STATUS.PAID,
      paidAt: new Date().toISOString(),
      paymentProof: blockchainTx ? blockchainTx.txHash : (paymentProof || 'mock_payment_hash_' + Date.now()),
      blockchainPaymentTx: blockchainTx ? blockchainTx.txHash : null,
      paymentReleasedOnChain: blockchainTx ? blockchainTx.paymentReleased : false
    });

    // Create payment event
    const event = state.addEvent({
      contractId,
      type: 'payment_released',
      data: {
        amount: 'ENCRYPTED',
        recipient: contract.supplierId,
        paymentProof: updatedContract.paymentProof,
        blockchain: blockchainTx || { mock: true },
        message: 'Payment automatically released upon delivery confirmation'
      }
    });

    // Broadcast payment notification
    websocketService.broadcastPaymentRelease(updatedContract);
    websocketService.broadcastEvent(event);

    res.json({
      success: true,
      data: updatedContract,
      blockchain: blockchainTx,
      message: 'Payment released successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================================
// ZK PROOF ENDPOINTS (Real Implementation)
// ===========================================

/**
 * GET /api/contracts/:contractId/proof-package
 * Get ZK proof package for buyer verification
 *
 * Supplier shares this with buyer to enable quantity verification
 * Contains: quantity, nonce, commitment (but NOT price)
 */
router.get('/contracts/:contractId/proof-package', (req, res) => {
  try {
    const { contractId } = req.params;
    const { role } = req.query;

    const contract = state.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    // Only supplier can generate proof package
    if (role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: 'Only supplier can generate proof package'
      });
    }

    // Check if contract has ZK proof witnesses
    if (!contract.zkProofWitnesses || !contract.quantityCommitment) {
      return res.status(400).json({
        success: false,
        error: 'Contract does not have ZK proof data'
      });
    }

    // Create proof package for buyer
    const proofPackage = cryptoService.createQuantityProofPackage(
      contract.quantity,
      contract.zkProofWitnesses.quantityNonce,
      contract.quantityCommitment
    );

    console.log(`[API] Proof package generated for contract ${contractId}`);
    console.log(`[API] Buyer can now verify quantity without seeing price`);

    res.json({
      success: true,
      data: proofPackage,
      message: 'Share this proof package with buyer for verification'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contracts/:contractId/verify-proof
 * Verify a ZK proof (buyer checks quantity)
 *
 * Buyer uses this to verify quantity matches commitment
 * Does NOT approve the order, just verifies the proof
 */
router.post('/contracts/:contractId/verify-proof', (req, res) => {
  try {
    const { contractId } = req.params;
    const { quantity, nonce } = req.body;

    const contract = state.getContract(contractId);
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    if (!contract.quantityCommitment) {
      return res.status(400).json({
        success: false,
        error: 'Contract does not have quantity commitment'
      });
    }

    // Verify the proof
    const isValid = cryptoService.verifyCommitment(
      quantity,
      nonce,
      contract.quantityCommitment
    );

    if (!isValid) {
      return res.json({
        success: false,
        verified: false,
        message: 'ZK proof verification failed: quantity/nonce do not match commitment'
      });
    }

    console.log(`[API] ZK proof verified successfully for contract ${contractId}`);
    console.log(`[API] Quantity: ${quantity} (verified without revealing price)`);

    res.json({
      success: true,
      verified: true,
      quantity: quantity,
      message: 'ZK proof verified! Quantity matches commitment. You can now approve the order.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================================
// BLOCKCHAIN ENDPOINTS (Phase 3)
// ===========================================

/**
 * GET /api/blockchain/status
 * Get blockchain service status and configuration
 */
router.get('/blockchain/status', (req, res) => {
  try {
    const status = blockchainService.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/contract/:contractId
 * Get contract state from blockchain
 */
router.get('/blockchain/contract/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;

    const onChainState = await blockchainService.getContractState(contractId);

    if (!onChainState) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found on blockchain'
      });
    }

    res.json({
      success: true,
      data: onChainState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================================
// EVENT ENDPOINTS
// ===========================================

/**
 * GET /api/events
 * Get all events (with optional filtering by contract)
 */
router.get('/events', (req, res) => {
  try {
    const { contractId } = req.query;

    const events = contractId
      ? state.getEventsByContract(contractId)
      : state.getAllEvents();

    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/events
 * Create custom event
 */
router.post('/events', (req, res) => {
  try {
    const { contractId, type, data } = req.body;

    if (!contractId || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contractId, type'
      });
    }

    const event = state.addEvent({
      contractId,
      type,
      data: data || {}
    });

    // Broadcast event
    websocketService.broadcastEvent(event);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================================
// STATS ENDPOINT
// ===========================================

/**
 * GET /api/stats
 * Get system statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = state.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================================
// UTILITY ENDPOINTS
// ===========================================

/**
 * POST /api/reset
 * Reset all state (useful for demo)
 */
router.post('/reset', (req, res) => {
  try {
    state.reset();

    // Broadcast reset
    websocketService.broadcast({
      type: 'system_reset',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'State reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
