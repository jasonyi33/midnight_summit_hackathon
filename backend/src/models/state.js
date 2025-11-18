/**
 * In-Memory State Management for ChainVault Hackathon
 *
 * Note: All data is stored in memory. Restarting the server will reset state.
 * This is intentional for the hackathon demo - no database needed.
 */

// Hardcoded demo users as specified in the hackathon spec
const users = {
  supplier: {
    id: 'supplier',
    role: 'supplier',
    name: 'ACME Corp',
    description: 'Manufacturing Supplier'
  },
  buyer: {
    id: 'buyer',
    role: 'buyer',
    name: 'MegaRetail',
    description: 'Retail Buyer'
  },
  logistics: {
    id: 'logistics',
    role: 'logistics',
    name: 'FastShip',
    description: 'Logistics Provider'
  },
  regulator: {
    id: 'regulator',
    role: 'regulator',
    name: 'TradeComm',
    description: 'Trade Commission Regulator'
  }
};

// In-memory contract storage
// Structure: { contractId: { ...contract data } }
const contracts = {};

// Event stream for real-time updates
// Structure: [{ eventId, contractId, type, timestamp, data }]
const events = [];

// Order status tracking
const ORDER_STATUS = {
  CREATED: 'created',
  APPROVED: 'approved',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

// State management methods
const state = {
  // User methods
  getUsers: () => users,
  getUser: (userId) => users[userId] || null,

  // Contract methods
  getAllContracts: () => Object.values(contracts),
  getContract: (contractId) => contracts[contractId] || null,

  createContract: (contractData) => {
    const contractId = contractData.id;
    contracts[contractId] = {
      ...contractData,
      status: ORDER_STATUS.CREATED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return contracts[contractId];
  },

  updateContract: (contractId, updates) => {
    if (!contracts[contractId]) {
      return null;
    }

    contracts[contractId] = {
      ...contracts[contractId],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return contracts[contractId];
  },

  deleteContract: (contractId) => {
    const contract = contracts[contractId];
    delete contracts[contractId];
    return contract;
  },

  // Event methods
  getAllEvents: () => events,
  getEventsByContract: (contractId) => {
    return events.filter(event => event.contractId === contractId);
  },

  addEvent: (eventData) => {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData
    };
    events.push(event);
    return event;
  },

  // Status helpers
  ORDER_STATUS,

  // Utility methods for demo
  getContractsByStatus: (status) => {
    return Object.values(contracts).filter(contract => contract.status === status);
  },

  getContractsByRole: (role) => {
    return Object.values(contracts).filter(contract => {
      // Return contracts relevant to the role
      if (role === 'supplier') return contract.supplierId === 'supplier';
      if (role === 'buyer') return contract.buyerId === 'buyer';
      if (role === 'logistics') return contract.logisticsId === 'logistics';
      if (role === 'regulator') return true; // Regulators see all
      return false;
    });
  },

  // Reset state (useful for demo reset)
  reset: () => {
    Object.keys(contracts).forEach(key => delete contracts[key]);
    events.length = 0;
  },

  // Get stats for dashboard
  getStats: () => {
    return {
      totalContracts: Object.keys(contracts).length,
      totalEvents: events.length,
      contractsByStatus: {
        created: state.getContractsByStatus(ORDER_STATUS.CREATED).length,
        approved: state.getContractsByStatus(ORDER_STATUS.APPROVED).length,
        inTransit: state.getContractsByStatus(ORDER_STATUS.IN_TRANSIT).length,
        delivered: state.getContractsByStatus(ORDER_STATUS.DELIVERED).length,
        paid: state.getContractsByStatus(ORDER_STATUS.PAID).length,
        cancelled: state.getContractsByStatus(ORDER_STATUS.CANCELLED).length
      }
    };
  }
};

module.exports = state;
