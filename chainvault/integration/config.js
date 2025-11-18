// Integration Configuration for ChainVault
// Connects frontend, backend, and smart contracts

const config = {
  // Backend API Configuration
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:3001',
    wsUrl: process.env.WS_URL || 'ws://localhost:3001',
    apiKey: process.env.API_KEY || 'demo-key-hackathon',
  },

  // Frontend Configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    publicPath: '/api',
  },

  // Midnight Blockchain Configuration
  blockchain: {
    network: process.env.NETWORK || 'testnet',
    contractAddress: process.env.CONTRACT_ADDRESS || 'PENDING_DEPLOYMENT',
    rpcUrl: process.env.RPC_URL || 'https://rpc.midnight-testnet.com',
  },

  // Mock Oracle Configuration
  oracle: {
    gpsUpdateInterval: 30000, // 30 seconds
    temperatureUpdateInterval: 60000, // 1 minute
    mockDataEnabled: true,
  },

  // Demo Users (Hardcoded for hackathon)
  users: {
    supplier: {
      id: 'supplier-001',
      name: 'ACME Corp',
      role: 'supplier',
      wallet: '0x1234...', // Mock wallet address
    },
    buyer: {
      id: 'buyer-001',
      name: 'MegaRetail',
      role: 'buyer',
      wallet: '0x5678...', // Mock wallet address
    },
    logistics: {
      id: 'logistics-001',
      name: 'FastShip',
      role: 'logistics',
      wallet: '0x9abc...', // Mock wallet address
    },
    regulator: {
      id: 'regulator-001',
      name: 'TradeComm',
      role: 'regulator',
      wallet: '0xdef0...', // Mock wallet address
    },
  },

  // Demo Settings
  demo: {
    autoProgressDelivery: true,
    deliverySteps: 5,
    stepDuration: 6000, // 6 seconds per step
    autoApprovalDelay: 2000, // 2 seconds
  },
};

module.exports = config;