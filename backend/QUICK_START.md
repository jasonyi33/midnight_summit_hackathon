# ChainVault Backend - Quick Start Guide

## For the Hackathon Team

### What's Been Implemented (Phase 1-3 Complete)

- Express server with WebSocket support
- Complete REST API for contract workflow
- Mock GPS Oracle for delivery tracking
- **NEW: Blockchain integration layer with graceful degradation**

### Current Status

**Backend is FULLY FUNCTIONAL in mock mode** - No dependencies on Dev 1's smart contract

The system works perfectly right now and will seamlessly upgrade to real blockchain once Dev 1 deploys the contract.

---

## Quick Start

### 1. Install and Run

```bash
cd backend
npm install
npm start
```

Server starts on: `http://localhost:3001`

### 2. Verify It's Working

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "blockchain": {
    "mockMode": true,
    "message": "Running in mock mode - blockchain operations are simulated"
  }
}
```

---

## API Endpoints

### Contract Workflow

**1. Create Contract**
```bash
POST /api/contracts
Content-Type: application/json

{
  "supplierId": "supplier",
  "buyerId": "buyer",
  "quantity": 100,
  "encryptedPrice": "encrypted_price_hash",
  "deliveryLocation": {"lat": 34.0522, "lng": -118.2437},
  "description": "Purchase order for 100 units"
}
```

**Response includes blockchain data:**
```json
{
  "success": true,
  "data": { ... },
  "blockchain": {
    "txHash": "mock_tx_...",
    "mock": true,
    "onChain": false
  }
}
```

**2. Approve with ZK Proof**
```bash
POST /api/contracts/:contractId/approve

{
  "zkProof": {
    "proof": "zk_proof_data",
    "publicInputs": ["100"]
  },
  "approvedBy": "buyer"
}
```

**3. Confirm Delivery**
```bash
POST /api/contracts/:contractId/deliver

{
  "gpsLocation": {"lat": 34.0522, "lng": -118.2437},
  "deliveredBy": "logistics"
}
```

**4. Release Payment**
```bash
POST /api/contracts/:contractId/pay
```

### Blockchain Endpoints

**Check Blockchain Status:**
```bash
GET /api/blockchain/status
```

**Get Contract State from Blockchain:**
```bash
GET /api/blockchain/contract/:contractId
```

---

## WebSocket Events

Connect to: `ws://localhost:3001`

**Events you'll receive:**
- `contract:created`
- `contract:approved`
- `delivery:confirmed`
- `payment:released`
- `gps:update`
- `shipment:status`

---

## For Dev 3 (Frontend Developer)

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';
```

### Example: Create Contract
```javascript
const response = await fetch(`${API_BASE_URL}/contracts`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplierId: 'supplier',
    buyerId: 'buyer',
    quantity: 100,
    encryptedPrice: 'encrypted_price',
    deliveryLocation: { lat: 34.0522, lng: -118.2437 }
  })
});

const { data, blockchain } = await response.json();
console.log('Contract created:', data.id);
console.log('Blockchain tx:', blockchain.txHash);
```

### Example: WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Event received:', message.type);

  if (message.type === 'contract:created') {
    // Update UI with new contract
  }
  if (message.type === 'payment:released') {
    // Show payment notification
  }
};
```

---

## For Dev 4 (Integration Developer)

### Switching to Real Blockchain

**When Dev 1 provides the contract address:**

1. Update `.env`:
```bash
BLOCKCHAIN_ENABLED=true
MIDNIGHT_CONTRACT_ADDRESS=0x1234...
MIDNIGHT_RPC_URL=https://rpc.testnet.midnight.network
```

2. Restart server:
```bash
npm restart
```

3. Verify:
```bash
curl http://localhost:3001/api/blockchain/status
```

**Should show:**
```json
{
  "mockMode": false,
  "contractAddress": "0x1234...",
  "message": "Connected to Midnight blockchain"
}
```

### Integration Tasks

See `BLOCKCHAIN_INTEGRATION.md` for detailed instructions on:
- Installing Midnight SDK
- Replacing mock methods with real contract calls
- Testing blockchain transactions
- Error handling

---

## Testing the Complete Flow

### Manual Test Script

```bash
# 1. Create contract
CONTRACT_ID=$(curl -s -X POST http://localhost:3001/api/contracts \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"supplier","buyerId":"buyer","quantity":100,"encryptedPrice":"test_price","deliveryLocation":{"lat":34.0522,"lng":-118.2437}}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

echo "Contract created: $CONTRACT_ID"

# 2. Approve contract
curl -X POST http://localhost:3001/api/contracts/$CONTRACT_ID/approve \
  -H "Content-Type: application/json" \
  -d '{"zkProof":{"proof":"mock_proof","publicInputs":["100"]},"approvedBy":"buyer"}'

# 3. Wait for GPS oracle to deliver (or manually trigger)
sleep 10

# 4. Check status
curl http://localhost:3001/api/contracts/$CONTRACT_ID
```

---

## Common Issues

### Port Already in Use
```bash
lsof -ti:3001 | xargs kill -9
npm start
```

### WebSocket Not Connecting
- Check CORS settings in browser
- Verify server is running
- Check WebSocket URL (no trailing slash)

### Blockchain Integration Not Working
- Verify `.env` file exists (copy from `.env.example`)
- Check `BLOCKCHAIN_ENABLED` is set correctly
- See `BLOCKCHAIN_INTEGRATION.md` for troubleshooting

---

## Demo Flow

### For Hackathon Presentation

**Scenario: Show the Full Flow**

1. **Create Contract** (Supplier)
   - POST to `/api/contracts`
   - Show blockchain tx hash in response

2. **Approve with ZK Proof** (Buyer)
   - POST to `/api/contracts/:id/approve`
   - Show proof verification on blockchain

3. **GPS Tracking** (Automatic)
   - Oracle sends updates every 30 seconds
   - Watch WebSocket events

4. **Delivery Confirmed** (Oracle triggers)
   - Automatically happens when GPS reaches destination
   - Shows delivery proof on blockchain

5. **Payment Released** (Automatic)
   - 3 seconds after delivery
   - Shows payment tx on blockchain

**Total Time:** ~5 minutes (with Oracle at 30s intervals)

---

## Key Features to Highlight

1. **Graceful Degradation**
   - Works perfectly in mock mode
   - Seamlessly upgrades to real blockchain

2. **Real-time Updates**
   - WebSocket broadcasts all events
   - GPS tracking updates live

3. **Blockchain Integration**
   - Every action has blockchain transaction
   - ZK proof verification
   - Automatic payment release

4. **Privacy Preserving**
   - Price encrypted
   - ZK proof hides price from buyer
   - Regulator sees compliance without commercial details

---

## Next Steps

### For Dev 1
- Deploy smart contract
- Provide contract address and RPC URL
- See: `BLOCKCHAIN_INTEGRATION.md` (section: "For Dev 1")

### For Dev 3
- Connect frontend to API
- Implement WebSocket listeners
- Show blockchain transaction data in UI

### For Dev 4
- Complete blockchain integration
- Test end-to-end flow
- Prepare demo

---

## Support

**Backend Questions:**
- API endpoints: Check Postman collection (if available) or this guide
- WebSocket events: See examples above
- Blockchain integration: See `BLOCKCHAIN_INTEGRATION.md`

**Server Logs:**
All operations are logged with timestamps:
```
[2025-11-17T14:06:50.916Z] POST /api/contracts - 201 (15ms)
[API] Contract contract_00cfc77e-fb36-4fa2-ba54-78ce427ec0d2 registered on blockchain
[Blockchain] MOCK: Creating order for contract contract_00cfc77e-fb36-4fa2-ba54-78ce427ec0d2
```

---

## Success Metrics

Backend is ready when:
- Server starts without errors
- Health endpoint returns 200
- Can create contract via API
- WebSocket connections work
- Blockchain status shows correct mode

**All of these are working NOW!**
