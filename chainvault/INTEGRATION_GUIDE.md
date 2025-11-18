# ChainVault Integration Guide

## Overview

This guide covers the complete integration between frontend (Next.js), backend (Express), and blockchain (Midnight) components for the ChainVault hackathon demo.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Integration Flow](#integration-flow)
4. [Frontend Integration](#frontend-integration)
5. [API Endpoints](#api-endpoints)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 16+
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Smart contract deployed (contract address in config)

### Start Integration

```bash
# 1. Initialize integration
node integration/initialize-integration.js

# 2. Run health checks
node integration/health-check.js

# 3. Run E2E tests
node integration/test-e2e.js

# 4. Debug if needed
node integration/debug-utilities.js
```

## Architecture

### Components

```
Frontend (Next.js)
    ↓
FrontendIntegration (WebSocket + HTTP)
    ↓
Backend API (Express)
    ↓
Smart Contract (Midnight)
```

### Key Files

- **integration/config.js** - Configuration for all services
- **integration/frontend-integration.js** - Frontend-backend bridge
- **integration/api-client.js** - Low-level API client
- **integration/contract-client.js** - Blockchain integration
- **integration/health-check.js** - Service health verification
- **integration/initialize-integration.js** - Setup and initialization
- **integration/debug-utilities.js** - Debugging and diagnostics
- **integration/test-e2e.js** - End-to-end integration tests

## Integration Flow

### Order Creation Flow

```
1. Supplier creates order in frontend
   ↓
2. Frontend calls: POST /api/orders
   ↓
3. Backend validates and stores order
   ↓
4. Backend calls smart contract: createOrder()
   ↓
5. Smart contract encrypts price
   ↓
6. Order ID returned to frontend
   ↓
7. Frontend receives WebSocket notification
```

### Order Approval Flow

```
1. Buyer views order (sees quantity, not price)
   ↓
2. Buyer approves in frontend
   ↓
3. Frontend generates ZK proof
   ↓
4. Frontend calls: PUT /api/orders/{orderId}/approve
   ↓
5. Backend verifies proof
   ↓
6. Backend calls smart contract: approveOrder()
   ↓
7. Contract state updated
   ↓
8. WebSocket notifications sent to all parties
```

### Delivery & Payment Flow

```
1. Oracle detects delivery location reached
   ↓
2. Backend receives GPS proof
   ↓
3. Backend calls smart contract: confirmDelivery()
   ↓
4. Smart contract releases payment automatically
   ↓
5. Payment event broadcast to frontend
   ↓
6. Supplier sees payment status update
```

## Frontend Integration

### Using FrontendIntegration in Next.js

```javascript
import FrontendIntegration from '@/lib/frontend-integration';

const integration = new FrontendIntegration();

// Initialize connection
await integration.initializeWebSocket();

// Create order
const order = await integration.createOrder({
  quantity: 100,
  price: 10000,
  deliveryLocation: 'Chicago, IL',
});

// Subscribe to events
const unsubscribe = integration.subscribe('order_approved', (data) => {
  console.log('Order approved:', data);
});

// Unsubscribe when done
unsubscribe();

// Disconnect
integration.disconnect();
```

### Available Methods

#### Order Management

```javascript
// Create order
await integration.createOrder({
  supplier: string,
  buyer: string,
  quantity: number,
  price: number,
  deliveryLocation: string,
  deliveryDate: ISO8601,
})

// Get order (with role-specific view)
await integration.getOrder(orderId, role)

// Get all orders for a role
await integration.getOrders(role)

// Approve order
await integration.approveOrder(orderId, zkProof)

// Confirm delivery
await integration.confirmDelivery(orderId, gpsData)
```

#### Proof Generation

```javascript
// Generate approval proof
await integration.generateApprovalProof(orderId, {
  budget: number,
})

// Verify proof
await integration.verifyProof(proofData)
```

#### Oracle & Status

```javascript
// Get oracle status
await integration.getOracleStatus()

// Trigger manual oracle check
await integration.triggerOracleCheck(orderId)

// Health check
await integration.checkHealth()
```

### Event Subscriptions

```javascript
// Order created
integration.subscribe('order_created', (data) => {
  console.log('Order created:', data.orderId);
});

// Order approved
integration.subscribe('order_approved', (data) => {
  console.log('Order approved by:', data.approvedBy);
});

// Delivery update
integration.subscribe('delivery_update', (data) => {
  console.log('Current location:', data.location);
});

// Payment released
integration.subscribe('payment_released', (data) => {
  console.log('Payment released:', data.amount);
});

// Compliance check
integration.subscribe('compliance_verified', (data) => {
  console.log('Compliance status:', data.status);
});
```

## API Endpoints

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/orders | Create new order | Required |
| GET | /api/orders | Get orders for role | Required |
| GET | /api/orders/{id} | Get order details | Required |
| PUT | /api/orders/{id}/approve | Approve order | Required |
| POST | /api/orders/{id}/deliver | Confirm delivery | Required |

### Proofs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/proofs/approval/{id} | Generate approval proof | Required |
| POST | /api/proofs/verify | Verify proof | Required |

### Oracle

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/oracle/status | Get oracle status | Optional |
| POST | /api/oracle/check/{id} | Trigger oracle check | Required |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /health | Health check | Optional |

## Testing

### Initialize Integration

```bash
node integration/initialize-integration.js
```

This will:
- Check all service connections
- Validate API endpoints
- Verify demo user configuration
- Generate configuration summary

### Health Check

```bash
node integration/health-check.js
```

Verify all services are running:
- Backend API
- Frontend
- Blockchain connection
- WebSocket availability

### End-to-End Tests

```bash
node integration/test-e2e.js
```

Tests complete order flow:
1. Create order (Supplier)
2. Approve order with ZK proof (Buyer)
3. Track delivery with GPS (Logistics)
4. Confirm delivery & release payment (Oracle)
5. Verify compliance (Regulator)

## Debugging

### Run Full Diagnostics

```bash
node integration/debug-utilities.js
```

Generates comprehensive report:
- Configuration validation
- API connectivity tests
- WebSocket connectivity
- Smart contract availability
- Saves report to `diagnostic-report.json`

### Test Specific Components

```bash
# Test API only
node integration/debug-utilities.js test-api

# Test WebSocket only
node integration/debug-utilities.js test-websocket

# Test contract only
node integration/debug-utilities.js test-contract

# Validate configuration
node integration/debug-utilities.js validate-config

# Print troubleshooting guide
node integration/debug-utilities.js troubleshoot
```

## Troubleshooting

### Backend Not Responding

**Problem**: `Error: Cannot reach backend at http://localhost:3001`

**Solutions**:
1. Start backend: `cd backend && npm run dev`
2. Check backend logs for errors
3. Verify port 3001 is available
4. Run: `node integration/debug-utilities.js test-api`

### WebSocket Connection Fails

**Problem**: `WebSocket connection failed`

**Solutions**:
1. Verify backend WebSocket is enabled
2. Check WS URL in `config.js`
3. Verify no proxy/firewall blocking
4. Run: `node integration/debug-utilities.js test-websocket`

### Contract Not Deployed

**Problem**: `Contract address is PENDING_DEPLOYMENT`

**Solutions**:
1. Wait for Dev 1 to deploy contract
2. Get contract address from Dev 1
3. Update `CONTRACT_ADDRESS` in `config.js`
4. Run: `node integration/initialize-integration.js`

### Orders Not Appearing in Frontend

**Problem**: Orders created but not visible in UI

**Solutions**:
1. Check WebSocket connection: `integration.isWebSocketConnected()`
2. Verify event listeners are registered
3. Check browser console for JavaScript errors
4. Run E2E tests: `node integration/test-e2e.js`
5. Check backend logs

### Privacy Not Maintained

**Problem**: Buyer can see price, regulator sees commercial details

**Solutions**:
1. Verify ZK proof is generated correctly
2. Check role-based view logic in backend
3. Verify role parameter is sent with requests
4. Review `getOrderView()` implementation
5. Run tests with different roles

### API Key Errors

**Problem**: `401 Unauthorized` or `Invalid API Key`

**Solutions**:
1. Verify `X-API-Key` header is sent
2. Check API key in `config.js`
3. Verify backend API key matches
4. Run: `node integration/debug-utilities.js validate-config`

## Configuration

Edit `integration/config.js` to customize:

```javascript
// Backend API
backend: {
  url: 'http://localhost:3001',
  wsUrl: 'ws://localhost:3001',
  apiKey: 'demo-key-hackathon',
}

// Frontend
frontend: {
  url: 'http://localhost:3000',
}

// Blockchain
blockchain: {
  network: 'testnet',
  contractAddress: 'ADDRESS_FROM_DEV_1',
  rpcUrl: 'https://rpc.midnight-testnet.com',
}

// Mock Oracle
oracle: {
  gpsUpdateInterval: 30000,
  mockDataEnabled: true,
}

// Demo Settings
demo: {
  autoProgressDelivery: true,
  deliverySteps: 5,
  stepDuration: 6000,
}
```

## Demo Users

The system includes 4 hardcoded demo users:

```
Supplier: ACME Corp
  - Create orders
  - View pricing
  - Monitor payments

Buyer: MegaRetail
  - View quantities only
  - Approve orders
  - See ZK proofs

Logistics: FastShip
  - Track delivery with GPS
  - Confirm delivery
  - Update status

Regulator: TradeComm
  - View compliance proofs
  - Verify delivery
  - No access to commercial details
```

## Performance Considerations

### Response Times

- Order creation: < 500ms
- Order approval: < 1s (includes ZK proof generation)
- Delivery confirmation: < 500ms
- WebSocket events: < 100ms

### Scaling for Demo

- In-memory order storage
- Mock oracle (no external calls)
- Single contract instance
- Direct WebSocket (no message queue)

## Security Notes

### For Hackathon Demo

- Hardcoded API key (OK for demo)
- No database encryption
- Mock WebSocket (not production ready)
- Mock ZK proofs (for demo only)

### Production Considerations

- Use JWT tokens instead of API keys
- Implement proper authentication/authorization
- Use secure WebSocket (WSS) with TLS
- Integrate real Midnight ZK proofs
- Implement proper key management
- Add request signing/verification

## Next Steps

1. Start all services: `npm run dev:all`
2. Initialize integration: `node integration/initialize-integration.js`
3. Run E2E tests: `node integration/test-e2e.js`
4. Open frontend: `http://localhost:3000`
5. Create order and test complete flow

## Support

For issues or questions:

1. Run diagnostics: `node integration/debug-utilities.js`
2. Check troubleshooting guide: `node integration/debug-utilities.js troubleshoot`
3. Review logs in `diagnostic-report.json`
4. Check component implementations in `/integration` directory
