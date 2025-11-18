# Integration Module

Complete integration suite for ChainVault frontend, backend, and blockchain components.

## Quick Start

```bash
# 1. Initialize integration
node integration/initialize-integration.js

# 2. Check system health
node integration/health-check.js

# 3. Run integration tests
node integration/test-e2e.js

# 4. Debug if needed
node integration/debug-utilities.js
```

## Files

### Core Integration

- **config.js** - Configuration for all services
  - Backend API URLs and keys
  - Frontend URLs
  - Blockchain network settings
  - Oracle configuration
  - Demo user definitions

- **api-client.js** - Low-level API client
  - HTTP request handling
  - WebSocket mock
  - Error handling
  - Mock data generation

- **frontend-integration.js** - Frontend integration layer
  - Clean API for Next.js
  - WebSocket management
  - Event subscription system
  - Automatic reconnection

- **contract-client.js** - Blockchain integration
  - Smart contract interaction
  - ZK proof generation
  - Order management on-chain
  - Mock implementations for testing

### Utilities

- **health-check.js** - Service health verification
  - Backend API status
  - Frontend availability
  - Blockchain connection
  - WebSocket status

- **initialize-integration.js** - Setup and initialization
  - Service health checks
  - Connection initialization
  - Configuration validation
  - Setup status reporting

- **debug-utilities.js** - Debugging and diagnostics
  - Configuration validation
  - API connectivity tests
  - WebSocket testing
  - Contract verification
  - Diagnostic report generation

- **integration-checklist.js** - Pre-demo validation
  - Configuration checks
  - Service availability
  - Connectivity verification
  - Data model validation

### Testing

- **test-e2e.js** - End-to-end integration tests
  - Complete order flow
  - Privacy verification
  - Payment release
  - Compliance checking

## Command Reference

### Initialize

```bash
# Initialize all integrations
node integration/initialize-integration.js

# Check service health
node integration/health-check.js
```

### Debug & Diagnose

```bash
# Full diagnostic report
node integration/debug-utilities.js

# Test API only
node integration/debug-utilities.js test-api

# Test WebSocket only
node integration/debug-utilities.js test-websocket

# Test contract only
node integration/debug-utilities.js test-contract

# Validate configuration
node integration/debug-utilities.js validate-config

# Show troubleshooting guide
node integration/debug-utilities.js troubleshoot
```

### Checklist

```bash
# Run pre-demo checklist
node integration/integration-checklist.js
```

### Testing

```bash
# Run E2E integration tests
node integration/test-e2e.js
```

## Usage in Frontend

### Basic Setup

```javascript
import FrontendIntegration from '@/lib/frontend-integration';

const integration = new FrontendIntegration();

// Initialize on app load
useEffect(() => {
  integration.initializeWebSocket().catch(console.error);

  return () => integration.disconnect();
}, []);
```

### Creating Orders

```javascript
async function handleCreateOrder(orderData) {
  try {
    const result = await integration.createOrder(orderData);
    console.log('Order created:', result.orderId);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
}
```

### Subscribing to Events

```javascript
useEffect(() => {
  const unsubscribe = integration.subscribe('order_created', (data) => {
    setOrders([...orders, data]);
  });

  return unsubscribe;
}, []);
```

### Role-Based Views

```javascript
async function loadOrders(role) {
  const orders = await integration.getOrders(role);

  // Automatically filtered by backend based on role
  // - Supplier: sees price
  // - Buyer: sees ZK proof only
  // - Logistics: sees GPS
  // - Regulator: sees compliance proof

  return orders;
}
```

## Configuration

Edit `config.js` to customize:

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

// Oracle
oracle: {
  gpsUpdateInterval: 30000,
  temperatureUpdateInterval: 60000,
  mockDataEnabled: true,
}

// Demo
demo: {
  autoProgressDelivery: true,
  deliverySteps: 5,
  stepDuration: 6000,
}
```

## Demo Users

Four hardcoded users for hackathon demo:

```
1. Supplier: ACME Corp
   - Create orders with private pricing
   - Monitor payment status

2. Buyer: MegaRetail
   - Approve orders
   - Never sees actual price
   - Verifies with ZK proof

3. Logistics: FastShip
   - Tracks delivery with GPS
   - Confirms delivery
   - Triggers payment release

4. Regulator: TradeComm
   - Views compliance proofs
   - Verifies delivery
   - No access to commercial details
```

## API Endpoints

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (role-filtered)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/approve` - Approve order
- `POST /api/orders/:id/deliver` - Confirm delivery

### Proofs
- `POST /api/proofs/approval/:id` - Generate approval proof
- `POST /api/proofs/verify` - Verify proof

### Oracle
- `GET /api/oracle/status` - Get oracle status
- `POST /api/oracle/check/:id` - Trigger oracle check

### Health
- `GET /health` - Health check

## Events

WebSocket events published by backend:

- `order_created` - New order created
- `order_approved` - Order approved
- `delivery_update` - Delivery status update
- `payment_released` - Payment released
- `compliance_verified` - Compliance verified

## Troubleshooting

### Backend Not Running

```bash
cd backend && npm install && npm run dev
```

### WebSocket Issues

```bash
node integration/debug-utilities.js test-websocket
```

### Contract Not Deployed

```bash
# Wait for Dev 1 to deploy
# Get contract address
# Update CONTRACT_ADDRESS in config.js
```

### API Key Error

```bash
# Check X-API-Key header
# Verify API_KEY in config.js
# Run: node integration/debug-utilities.js validate-config
```

### Orders Not Showing

```bash
# Check WebSocket connection
# Verify event listeners
# Run E2E tests: node integration/test-e2e.js
# Check browser console
```

## Performance

### Target Response Times
- Order creation: < 500ms
- Order approval: < 1s
- Delivery confirmation: < 500ms
- WebSocket events: < 100ms

### Scaling
- In-memory storage (demo only)
- Mock oracle (no external calls)
- Direct WebSocket (no message queue)
- Single contract instance

## Next Steps

1. **Start Services**
   ```bash
   npm run dev:all
   ```

2. **Initialize Integration**
   ```bash
   node integration/initialize-integration.js
   ```

3. **Run Tests**
   ```bash
   node integration/test-e2e.js
   ```

4. **Open Frontend**
   ```
   http://localhost:3000
   ```

5. **Create and Test Order Flow**
   - Supplier creates order
   - Buyer approves with ZK proof
   - Logistics confirms delivery
   - Payment auto-releases
   - Regulator verifies compliance

## Support

For issues:

1. Run diagnostics: `node integration/debug-utilities.js`
2. Check checklist: `node integration/integration-checklist.js`
3. Review guide: `../INTEGRATION_GUIDE.md`
4. Check logs: `diagnostic-report.json`

## Architecture Diagram

```
Frontend (Next.js)
    |
    | HTTP/WebSocket
    |
FrontendIntegration
    |
    | HTTP/WebSocket
    |
Backend API (Express)
    |
    | Contract calls
    |
Smart Contract (Midnight)
    |
    | State updates
    |
Demo State
```

## Integration Flow

```
Order Creation
└─ Frontend: POST /api/orders
   └─ Backend: Store order
      └─ Contract: createOrder()
         └─ Return order ID
            └─ WebSocket: order_created event
               └─ Frontend: Update UI

Order Approval
└─ Frontend: Generate ZK proof
   └─ Frontend: PUT /api/orders/{id}/approve
      └─ Backend: Verify proof
         └─ Contract: approveOrder()
            └─ Backend: Store approval
               └─ WebSocket: order_approved event
                  └─ Frontend: Update UI

Delivery & Payment
└─ Oracle: Detect delivery location
   └─ Backend: POST /api/orders/{id}/deliver
      └─ Contract: confirmDelivery()
         └─ Contract: Release payment
            └─ Backend: Update state
               └─ WebSocket: payment_released event
                  └─ Frontend: Update UI
```

## Key Features

✅ **Privacy**: ZK proofs hide prices from unauthorized parties
✅ **Real-time**: WebSocket updates for instant UI refresh
✅ **Multi-role**: Different views for each participant
✅ **Automated**: Payment releases without manual intervention
✅ **Verifiable**: Compliance proofs for regulators
✅ **Testable**: Complete E2E test suite
✅ **Debuggable**: Comprehensive diagnostics and logging
✅ **Configurable**: Easy to customize for different scenarios

## References

- [Integration Guide](../INTEGRATION_GUIDE.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [Contract Documentation](../contracts/README.md)
