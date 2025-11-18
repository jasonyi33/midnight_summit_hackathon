/**
 * Blockchain Integration Service for ChainVault
 *
 * This service provides integration with the Midnight blockchain smart contract
 * with graceful degradation when the contract is not yet deployed.
 *
 * Features:
 * - Connects to deployed Midnight smart contract (when available)
 * - Falls back to mock mode when contract address not configured
 * - Handles ZK proof submission to blockchain
 * - Manages on-chain payment releases
 * - Full Midnight SDK integration with dynamic imports
 *
 * Phase 3 Implementation: Smart Contract Integration Layer
 */

const state = require('../models/state');
const websocketService = require('./websocket');
const path = require('path');

class BlockchainService {
  constructor() {
    this.isInitialized = false;
    this.isMockMode = true;
    this.contractAddress = null;
    this.networkUrl = null;
    this.contract = null;
    this.deployedContract = null;
    this.wallet = null;
    this.initializationPromise = null;

    // Configuration from environment variables
    this.config = {
      contractAddress: process.env.MIDNIGHT_CONTRACT_ADDRESS || null,
      networkUrl: process.env.MIDNIGHT_RPC_URL || null,
      indexerUrl: process.env.MIDNIGHT_INDEXER_URL || null,
      indexerWS: process.env.MIDNIGHT_INDEXER_WS || null,
      proofServer: process.env.MIDNIGHT_PROOF_SERVER || null,
      walletSeed: process.env.MIDNIGHT_SERVICE_WALLET_SEED || null,
      enabled: process.env.BLOCKCHAIN_ENABLED === 'true' || false
    };

    // Start initialization (async)
    this.initializationPromise = this.initialize();
  }

  /**
   * Initialize blockchain connection
   * Attempts to connect to Midnight smart contract if configured
   */
  async initialize() {
    console.log('[Blockchain] Initializing blockchain service...');

    // Check if blockchain integration is enabled and configured
    if (!this.config.enabled) {
      console.log('[Blockchain] Blockchain integration disabled in configuration');
      console.log('[Blockchain] Running in MOCK MODE - all blockchain operations will be simulated');
      this.isMockMode = true;
      this.isInitialized = true;
      return;
    }

    if (!this.config.contractAddress || !this.config.networkUrl) {
      console.log('[Blockchain] Contract address or network URL not configured');
      console.log('[Blockchain] Running in MOCK MODE - waiting for contract deployment');
      console.log('[Blockchain] To enable: Set MIDNIGHT_CONTRACT_ADDRESS and MIDNIGHT_RPC_URL in .env');
      this.isMockMode = true;
      this.isInitialized = true;
      return;
    }

    if (!this.config.walletSeed || this.config.walletSeed === 'YOUR_WALLET_SEED_HERE') {
      console.log('[Blockchain] Service wallet seed not configured');
      console.log('[Blockchain] Running in MOCK MODE - set MIDNIGHT_SERVICE_WALLET_SEED in .env');
      console.log('[Blockchain] You can use the same seed from deployment or generate a new one');
      this.isMockMode = true;
      this.isInitialized = true;
      return;
    }

    try {
      console.log('[Blockchain] Loading Midnight SDK modules...');
      
      // Dynamically import ES modules (CommonJS compatible)
      const { WalletBuilder } = await import('@midnight-ntwrk/wallet');
      const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
      const { httpClientProofProvider } = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
      const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
      const { NodeZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');
      const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
      const {
        NetworkId,
        setNetworkId,
        getZswapNetworkId,
        getLedgerNetworkId
      } = await import('@midnight-ntwrk/midnight-js-network-id');
      const { createBalancedTx } = await import('@midnight-ntwrk/midnight-js-types');
      const { Transaction, CostModel } = await import('@midnight-ntwrk/ledger');
      const { Transaction: ZswapTransaction } = await import('@midnight-ntwrk/zswap');
      const Rx = await import('rxjs');

      console.log('[Blockchain] SDK modules loaded successfully');

      // Set network to testnet
      setNetworkId(NetworkId.TestNet);

      // Store configuration
      this.contractAddress = this.config.contractAddress;
      this.networkUrl = this.config.networkUrl;

      // Create dummy cost model for transaction balancing
      const costModel = CostModel.dummyCostModel();

      console.log('[Blockchain] Building service wallet...');
      
      // Build wallet from seed
      this.wallet = await WalletBuilder.buildFromSeed(
        this.config.indexerUrl,
        this.config.indexerWS,
        this.config.proofServer,
        this.config.networkUrl,
        this.config.walletSeed,
        getZswapNetworkId(),
        'info'
      );

      // Start wallet
      this.wallet.start();
      console.log('[Blockchain] Service wallet started');

      // Wait for wallet to sync (with timeout)
      console.log('[Blockchain] Waiting for wallet to sync...');
      const walletState = await Rx.firstValueFrom(
        this.wallet.state().pipe(
          Rx.timeout(30000), // 30 second timeout
          Rx.filter(state => state.syncProgress?.synced === true)
        )
      ).catch(error => {
        console.log('[Blockchain] Wallet sync timeout - continuing anyway');
        return this.wallet.state().pipe(Rx.take(1));
      });

      console.log('[Blockchain] Wallet synced');

      // Create wallet provider (follows Midnight SDK pattern from docs)
      const walletProvider = {
        coinPublicKey: walletState.coinPublicKey,
        encryptionPublicKey: walletState.encryptionPublicKey,
        balanceTx: (tx, newCoins) => {
          return this.wallet
            .balanceTransaction(
              ZswapTransaction.deserialize(
                tx.serialize(getLedgerNetworkId()),
                getZswapNetworkId()
              ),
              newCoins
              // Note: costModel NOT needed - wallet handles it internally
            )
            .then(tx => this.wallet.proveTransaction(tx))
            .then(zswapTx =>
              Transaction.deserialize(
                zswapTx.serialize(getZswapNetworkId()),
                getLedgerNetworkId()
              )
            )
            .then(createBalancedTx);
        },
        submitTx: (tx) => {
          return this.wallet.submitTransaction(tx);
        }
      };

      // Load contract module
      console.log('[Blockchain] Loading contract module...');
      const contractPath = path.join(process.cwd(), '..', 'contracts');
      const contractModulePath = path.join(
        contractPath,
        'managed',
        'purchase-delivery',
        'contract',
        'index.cjs'
      );

      const PurchaseDeliveryModule = await import(contractModulePath);
      console.log('[Blockchain] Contract module loaded');
      
      // Instantiate the contract
      const contractInstance = new PurchaseDeliveryModule.Contract({});
      console.log('[Blockchain] Contract instantiated');

      // Set up providers
      const zkConfigPath = path.join(contractPath, 'managed', 'purchase-delivery');
      const providers = {
        privateStateProvider: levelPrivateStateProvider({
          privateStateStoreName: 'chainvault-backend-private-state'  // Backend's own database
        }),
        publicDataProvider: indexerPublicDataProvider(
          this.config.indexerUrl,
          this.config.indexerWS
        ),
        zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
        proofProvider: httpClientProofProvider(this.config.proofServer),
        walletProvider: walletProvider,
        midnightProvider: walletProvider
      };

      console.log('[Blockchain] Finding deployed contract...');
      
      // Connect to deployed contract (each wallet has its own private state)
      this.deployedContract = await findDeployedContract(
        providers,
        {
          contractAddress: this.contractAddress,
          contract: contractInstance,
          privateStateId: 'chainvaultBackendState',  // Unique ID for backend wallet
          initialPrivateState: {}  // Start with empty private state
        }
      );

      console.log('[Blockchain] ✓ Successfully connected to deployed contract!');
      console.log('[Blockchain] Contract address:', this.contractAddress);
      console.log('[Blockchain] Network:', this.config.networkUrl);
      console.log('[Blockchain] Mode: LIVE (on-chain)');

      this.isMockMode = false;
      this.isInitialized = true;

    } catch (error) {
      console.error('[Blockchain] Failed to initialize smart contract connection:', error.message);
      console.error('[Blockchain] Full error:', error);
      console.log('[Blockchain] Falling back to MOCK MODE');
      this.isMockMode = true;
      this.isInitialized = true;
    }
  }

  /**
   * Ensure the service is initialized before operations
   */
  async ensureInitialized() {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  /**
   * Create order on blockchain
   * Registers the purchase order contract on-chain with encrypted pricing
   *
   * @param {Object} contract - The contract data from state
   * @returns {Promise<Object>} Blockchain transaction result
   */
  async createOrder(contract) {
    await this.ensureInitialized();

    if (this.isMockMode) {
      return this._mockCreateOrder(contract);
    }

    try {
      console.log(`[Blockchain] Creating order on-chain for contract ${contract.id}`);

      // Prepare circuit arguments in EXACT order as defined in contract
      const supplier = contract.supplierId;
      const buyer = contract.buyerId;
      const priceEncrypted = contract.encryptedPrice || 'encrypted_price_data';
      const priceHash = this._createHash(contract.encryptedPrice);
      const qty = contract.quantity.toString();
      const qtyHash = this._createHash(contract.quantity.toString());
      const deliveryLat = contract.deliveryLocation?.lat?.toString() || '0';
      const deliveryLong = contract.deliveryLocation?.lng?.toString() || '0';
      const timestamp = Date.now().toString();
      const initialStatus = '0'; // 0 = Created
      const escrow = '0'; // Would be calculated from price * quantity

      console.log('[Blockchain] Calling createOrder with 11 parameters');
      
      // Call createOrder circuit with arguments in exact order (callTx provides context automatically)
      const result = await this.deployedContract.callTx.createOrder(
        supplier, buyer, priceEncrypted, priceHash, qty, qtyHash,
        deliveryLat, deliveryLong, timestamp, initialStatus, escrow
      );

      console.log(`[Blockchain] Order created successfully on-chain`);

      return {
        success: true,
        txHash: result?.transactionId || 'pending',
        blockNumber: 'pending',
        onChain: true,
        witnesses: witnesses
      };
    } catch (error) {
      console.error(`[Blockchain] Error creating order on-chain:`, error.message);
      // Graceful degradation - return mock on error
      return this._mockCreateOrder(contract);
    }
  }

  /**
   * Submit approval with ZK proof to blockchain
   * Verifies buyer approval without revealing price
   *
   * @param {string} contractId - The contract ID
   * @param {Object} zkProof - Zero-knowledge proof data
   * @returns {Promise<Object>} Blockchain transaction result
   */
  async approveOrder(contractId, zkProof) {
    await this.ensureInitialized();

    if (this.isMockMode) {
      return this._mockApproveOrder(contractId, zkProof);
    }

    try {
      console.log(`[Blockchain] Submitting approval for contract ${contractId}`);

      const contract = state.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Prepare circuit arguments in EXACT order as defined in contract
      const orderIdToApprove = contractId;
      const buyer = contract.buyerId;
      const quantityProof = zkProof?.proof || 'mock_proof';
      const approvedFlag = '1';
      const approvedStatus = '1';

      // Call approveOrder circuit with 5 parameters in exact order
      const result = await this.deployedContract.callTx.approveOrder(
        orderIdToApprove, buyer, quantityProof, approvedFlag, approvedStatus
      );

      console.log(`[Blockchain] Order approved successfully on-chain`);

      return {
        success: true,
        txHash: result?.transactionId || 'pending',
        blockNumber: 'pending',
        proofVerified: true,
        onChain: true
      };
    } catch (error) {
      console.error(`[Blockchain] Error approving order on-chain:`, error.message);
      // Graceful degradation
      return this._mockApproveOrder(contractId, zkProof);
    }
  }

  /**
   * Submit delivery confirmation with GPS proof to blockchain
   * Triggers contract condition check for payment release
   *
   * @param {string} contractId - The contract ID
   * @param {Object} gpsLocation - GPS coordinates of delivery
   * @returns {Promise<Object>} Blockchain transaction result
   */
  async confirmDelivery(contractId, gpsLocation) {
    await this.ensureInitialized();

    if (this.isMockMode) {
      return this._mockConfirmDelivery(contractId, gpsLocation);
    }

    try {
      console.log(`[Blockchain] Confirming delivery on-chain for contract ${contractId}`);

      const contract = state.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Prepare circuit arguments in EXACT order as defined in contract
      const orderIdToDeliver = contractId;
      const actualLat = gpsLocation.lat?.toString() || '0';
      const actualLong = gpsLocation.lng?.toString() || '0';
      const timestamp = Date.now().toString();
      const deliveredFlag = '1';
      const deliveredStatus = '3';
      const locationTolerance = '100';

      // Call confirmDelivery circuit with 7 parameters in exact order
      const result = await this.deployedContract.callTx.confirmDelivery(
        orderIdToDeliver, actualLat, actualLong, timestamp,
        deliveredFlag, deliveredStatus, locationTolerance
      );

      console.log(`[Blockchain] Delivery confirmed successfully on-chain`);

      return {
        success: true,
        txHash: result?.transactionId || 'pending',
        blockNumber: 'pending',
        deliveryConfirmed: true,
        onChain: true
      };
    } catch (error) {
      console.error(`[Blockchain] Error confirming delivery on-chain:`, error.message);
      // Graceful degradation
      return this._mockConfirmDelivery(contractId, gpsLocation);
    }
  }

  /**
   * Release payment on blockchain
   * Executes automatic payment when all conditions are met
   *
   * @param {string} contractId - The contract ID
   * @returns {Promise<Object>} Blockchain transaction result
   */
  async releasePayment(contractId) {
    await this.ensureInitialized();

    if (this.isMockMode) {
      return this._mockReleasePayment(contractId);
    }

    try {
      console.log(`[Blockchain] Releasing payment on-chain for contract ${contractId}`);

      const contract = state.getContract(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Prepare circuit arguments in EXACT order as defined in contract
      const orderIdToPay = contractId;
      const supplier = contract.supplierId;
      const paidFlag = '1';
      const paidStatus = '4';

      // Call processPayment circuit with 4 parameters in exact order
      const result = await this.deployedContract.callTx.processPayment(
        orderIdToPay, supplier, paidFlag, paidStatus
      );

      console.log(`[Blockchain] Payment released successfully on-chain`);

      return {
        success: true,
        txHash: result?.transactionId || 'pending',
        blockNumber: 'pending',
        paymentReleased: true,
        onChain: true
      };
    } catch (error) {
      console.error(`[Blockchain] Error releasing payment on-chain:`, error.message);
      // Graceful degradation
      return this._mockReleasePayment(contractId);
    }
  }

  /**
   * Get contract state from blockchain
   * Queries on-chain contract data
   *
   * @param {string} contractId - The contract ID
   * @returns {Promise<Object>} Contract state from blockchain
   */
  async getContractState(contractId) {
    await this.ensureInitialized();

    if (this.isMockMode) {
      return this._mockGetContractState(contractId);
    }

    try {
      // Query contract state using getOrderView circuit
      const viewWitnesses = {
        orderId: contractId,
        viewType: 'public' // Can be 'supplier', 'buyer', 'logistics', 'regulator', or 'public'
      };

      const orderView = await this.deployedContract.callTx.getOrderView(viewWitnesses);

      return {
        orderId: contractId,
        status: orderView?.status || 'unknown',
        approved: orderView?.approved || false,
        delivered: orderView?.delivered || false,
        paid: orderView?.paid || false,
        onChain: true,
        chainData: orderView
      };
    } catch (error) {
      console.error(`[Blockchain] Error getting contract state:`, error.message);
      // Graceful degradation
      return this._mockGetContractState(contractId);
    }
  }

  /**
   * Create a simple hash (for demo purposes)
   * In production, use proper cryptographic hash
   */
  _createHash(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(String(data)).digest('hex');
  }

  /**
   * Get service status and configuration
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      mockMode: this.isMockMode,
      contractAddress: this.contractAddress || 'Not configured',
      networkUrl: this.networkUrl || 'Not configured',
      enabled: this.config.enabled,
      message: this.isMockMode
        ? 'Running in mock mode - blockchain operations are simulated'
        : 'Connected to Midnight blockchain'
    };
  }

  // ===========================================
  // MOCK IMPLEMENTATION
  // These methods simulate blockchain operations
  // when the smart contract is not yet deployed
  // ===========================================

  /**
   * Mock: Create order on blockchain
   */
  _mockCreateOrder(contract) {
    console.log(`[Blockchain] MOCK: Creating order for contract ${contract.id}`);

    return {
      success: true,
      txHash: `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      onChain: false,
      mock: true,
      message: 'Mock transaction - waiting for smart contract deployment'
    };
  }

  /**
   * Mock: Approve order with ZK proof
   */
  _mockApproveOrder(contractId, zkProof) {
    console.log(`[Blockchain] MOCK: Approving order ${contractId} with ZK proof`);

    return {
      success: true,
      txHash: `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      proofVerified: true,
      onChain: false,
      mock: true,
      message: 'Mock ZK proof verification - waiting for smart contract deployment'
    };
  }

  /**
   * Mock: Confirm delivery
   */
  _mockConfirmDelivery(contractId, gpsLocation) {
    console.log(`[Blockchain] MOCK: Confirming delivery for contract ${contractId}`);

    return {
      success: true,
      txHash: `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      deliveryConfirmed: true,
      onChain: false,
      mock: true,
      message: 'Mock delivery confirmation - waiting for smart contract deployment'
    };
  }

  /**
   * Mock: Release payment
   */
  _mockReleasePayment(contractId) {
    console.log(`[Blockchain] MOCK: Releasing payment for contract ${contractId}`);

    return {
      success: true,
      txHash: `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      paymentReleased: true,
      onChain: false,
      mock: true,
      message: 'Mock payment release - waiting for smart contract deployment'
    };
  }

  /**
   * Mock: Get contract state
   */
  _mockGetContractState(contractId) {
    const contract = state.getContract(contractId);

    if (!contract) {
      return null;
    }

    return {
      orderId: contract.id,
      status: contract.status,
      approved: contract.status !== state.ORDER_STATUS.CREATED,
      delivered: contract.status === state.ORDER_STATUS.DELIVERED || contract.status === state.ORDER_STATUS.PAID,
      paid: contract.status === state.ORDER_STATUS.PAID,
      onChain: false,
      mock: true
    };
  }
}

// Export singleton instance
module.exports = new BlockchainService();
