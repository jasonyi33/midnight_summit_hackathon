# ChainVault Blockchain Integration Guide

## Overview

This document describes the blockchain integration layer for ChainVault, designed with **graceful degradation** to work with or without the deployed Midnight smart contract.

**Current Status:** Phase 3 Complete - Integration layer ready for connection

**Developer Handoff:** This integration layer is ready for Dev 4 to complete the connection once Dev 1 provides the deployed smart contract details.

---

## Architecture

### Graceful Degradation Design

The blockchain service operates in two modes:

1. **MOCK MODE (Default)**: All blockchain operations are simulated
   - Returns mock transaction hashes and block numbers
   - Logs all operations for debugging
   - Backend continues to work perfectly for demo purposes
   - No dependency on smart contract deployment

2. **LIVE MODE (When Configured)**: Connects to actual Midnight blockchain
   - Submits real transactions to the smart contract
   - Verifies ZK proofs on-chain
   - Triggers actual payment releases
   - Requires contract address and RPC URL

### Key Files

```
backend/
├── src/
│   ├── services/
│   │   └── blockchain.js       # Blockchain integration service (NEW - Phase 3)
│   ├── routes/
│   │   └── api.js              # Updated with blockchain calls
│   └── server.js               # Updated with blockchain status
├── .env.example                # Updated with blockchain config
└── BLOCKCHAIN_INTEGRATION.md   # This file
```

---

## Integration Points

The blockchain service integrates with the contract workflow at four key points:

### 1. Contract Creation
**Endpoint:** `POST /api/contracts`
**Blockchain Method:** `blockchainService.createOrder(contract)`

Registers the purchase order on-chain with:
- Order ID
- Encrypted price (privacy-preserving)
- Quantity
- Delivery location
- Supplier and buyer identifiers

**Response includes:**
```json
{
  "blockchain": {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 123456,
    "onChain": true,
    "mock": false
  }
}
```

### 2. Contract Approval (ZK Proof Submission)
**Endpoint:** `POST /api/contracts/:contractId/approve`
**Blockchain Method:** `blockchainService.approveOrder(contractId, zkProof)`

Submits zero-knowledge proof to blockchain for verification:
- ZK proof data from Dev 1's proof generation
- Verifies buyer can approve without seeing encrypted price
- Updates contract state on-chain

**Response includes:**
```json
{
  "blockchain": {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 123457,
    "proofVerified": true,
    "onChain": true
  }
}
```

### 3. Delivery Confirmation
**Endpoint:** `POST /api/contracts/:contractId/deliver`
**Blockchain Method:** `blockchainService.confirmDelivery(contractId, gpsLocation)`

Submits delivery proof with GPS coordinates:
- GPS location from oracle service
- Triggers contract condition check
- Updates delivery status on-chain

**Response includes:**
```json
{
  "blockchain": {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 123458,
    "deliveryConfirmed": true,
    "onChain": true
  }
}
```

### 4. Payment Release
**Endpoint:** `POST /api/contracts/:contractId/pay`
**Blockchain Method:** `blockchainService.releasePayment(contractId)`

Triggers automatic payment release on-chain:
- Executes when all conditions met
- Transfers funds to supplier
- Finalizes contract on-chain

**Response includes:**
```json
{
  "blockchain": {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 123459,
    "paymentReleased": true,
    "onChain": true
  }
}
```

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Enable blockchain integration (set to 'true' after contract deployment)
BLOCKCHAIN_ENABLED=false

# Midnight testnet RPC URL (from Dev 1)
MIDNIGHT_RPC_URL=https://rpc.testnet.midnight.network

# Deployed contract address (from Dev 1)
MIDNIGHT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### Switching from Mock to Live Mode

**Steps:**
1. Get contract address from Dev 1
2. Set `MIDNIGHT_CONTRACT_ADDRESS` in `.env`
3. Set `MIDNIGHT_RPC_URL` in `.env`
4. Set `BLOCKCHAIN_ENABLED=true`
5. Restart backend server
6. Verify with: `GET http://localhost:3001/health`

**Health Check Response:**
```json
{
  "blockchain": {
    "initialized": true,
    "mockMode": false,
    "contractAddress": "0x123...",
    "networkUrl": "https://rpc.testnet.midnight.network",
    "enabled": true,
    "message": "Connected to Midnight blockchain"
  }
}
```

---

## For Dev 1 (Smart Contract Developer)

### What We Need From You

1. **Deployed Contract Address**
   - The address of your deployed `PurchaseDeliveryContract` on Midnight testnet
   - Example: `0x1234567890abcdef1234567890abcdef12345678`

2. **Network RPC URL**
   - The RPC endpoint for Midnight testnet
   - Example: `https://rpc.testnet.midnight.network`

3. **Contract Interface** (for Dev 4)
   - Contract ABI or interface definition
   - Method signatures we need to call:
     - `createOrder(orderId, encryptedPrice, quantity, deliveryLocation, supplier, buyer)`
     - `approveOrder(orderId, zkProof, publicInputs)`
     - `confirmDelivery(orderId, gpsProof)`
     - `releasePayment(orderId)`
     - `getOrderView(orderId, role)` - for querying state

4. **ZK Proof Format**
   - Structure of the ZK proof object
   - What public inputs are required
   - How to format the proof for submission

5. **Integration Instructions**
   - Any specific Midnight SDK usage
   - Transaction signing requirements
   - Gas/fee handling

### Where to Provide This Information

Create a file: `SMART_CONTRACT_DEPLOYMENT.md` with:
```markdown
# Midnight Smart Contract Deployment

## Deployed Contract
- **Address:** 0x...
- **Network:** Midnight Testnet
- **RPC URL:** https://...
- **Deployment Block:** ...
- **Deployment Tx:** ...

## Contract Interface
[Provide ABI or method signatures]

## ZK Proof Format
[Describe proof structure]

## Integration Example
[Provide code example]
```

---

## For Dev 4 (Integration Developer)

### Your Tasks

The blockchain service (`backend/src/services/blockchain.js`) has clearly marked `TODO` comments for integration:

#### 1. Initialize Midnight SDK Connection

**Location:** `blockchain.js` line ~45

Replace mock initialization with:
```javascript
const { MidnightProvider } = require('@midnight-labs/sdk');
this.provider = new MidnightProvider(this.networkUrl);
this.contract = await this.provider.getContract(this.contractAddress);
```

#### 2. Implement Contract Methods

Each method has a `TODO` comment with example code:

**Create Order** (`createOrder` method):
```javascript
const tx = await this.contract.createOrder({
  orderId: contract.id,
  encryptedPrice: contract.encryptedPrice,
  quantity: contract.quantity,
  deliveryLocation: contract.deliveryLocation,
  supplier: contract.supplierId,
  buyer: contract.buyerId
});
const receipt = await tx.wait();
return {
  success: true,
  txHash: receipt.transactionHash,
  blockNumber: receipt.blockNumber,
  onChain: true
};
```

**Approve Order** (`approveOrder` method):
```javascript
const tx = await this.contract.approveOrder({
  orderId: contractId,
  zkProof: zkProof.proof,
  publicInputs: zkProof.publicInputs
});
const receipt = await tx.wait();

// Verify proof was accepted
const isVerified = await this.contract.isOrderApproved(contractId);

return {
  success: true,
  txHash: receipt.transactionHash,
  blockNumber: receipt.blockNumber,
  proofVerified: isVerified,
  onChain: true
};
```

**Confirm Delivery** (`confirmDelivery` method):
```javascript
const tx = await this.contract.confirmDelivery({
  orderId: contractId,
  gpsProof: {
    latitude: gpsLocation.lat,
    longitude: gpsLocation.lng,
    timestamp: Date.now()
  }
});
const receipt = await tx.wait();

return {
  success: true,
  txHash: receipt.transactionHash,
  blockNumber: receipt.blockNumber,
  deliveryConfirmed: true,
  onChain: true
};
```

**Release Payment** (`releasePayment` method):
```javascript
const tx = await this.contract.releasePayment({
  orderId: contractId
});
const receipt = await tx.wait();

// Get payment details from events
const paymentEvent = receipt.logs.find(log =>
  log.topics[0] === this.contract.interface.getEventTopic('PaymentReleased')
);

return {
  success: true,
  txHash: receipt.transactionHash,
  blockNumber: receipt.blockNumber,
  paymentReleased: true,
  onChain: true,
  paymentData: paymentEvent ? paymentEvent.args : null
};
```

#### 3. Testing Integration

**Test Flow:**
1. Create a contract: `POST /api/contracts`
2. Check blockchain status: `GET /api/blockchain/status`
3. Approve with ZK proof: `POST /api/contracts/:id/approve`
4. Deliver: `POST /api/contracts/:id/deliver`
5. Payment: `POST /api/contracts/:id/pay`

**Verify Each Step:**
- Check response includes `blockchain.onChain: true`
- Verify transaction hashes on block explorer
- Confirm contract state matches on-chain state

#### 4. Error Handling

The integration already has graceful error handling:
- Blockchain failures won't crash the API
- Errors are logged but operations continue
- Frontend can still demo with mock mode

**Add specific error handling for:**
- Transaction reverts
- Gas estimation failures
- Network connectivity issues
- Invalid proof submissions

---

## API Endpoints

### Blockchain Status
```
GET /api/blockchain/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "mockMode": false,
    "contractAddress": "0x...",
    "networkUrl": "https://...",
    "enabled": true,
    "message": "Connected to Midnight blockchain"
  }
}
```

### Get Contract State from Blockchain
```
GET /api/blockchain/contract/:contractId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "contract_...",
    "status": "approved",
    "approved": true,
    "delivered": false,
    "paid": false,
    "onChain": true
  }
}
```

---

## Testing

### Test Mock Mode (Works Now)

1. Start server without blockchain config:
```bash
cd backend
npm start
```

2. Check health:
```bash
curl http://localhost:3001/health
```

3. Create contract:
```bash
curl -X POST http://localhost:3001/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier",
    "buyerId": "buyer",
    "quantity": 100,
    "encryptedPrice": "encrypted_price_data",
    "deliveryLocation": {"lat": 34.0522, "lng": -118.2437}
  }'
```

4. Verify response includes mock blockchain data:
```json
{
  "blockchain": {
    "mock": true,
    "txHash": "mock_tx_...",
    "onChain": false
  }
}
```

### Test Live Mode (After Configuration)

Same steps as above, but verify:
- `blockchain.mock` is `false`
- `blockchain.onChain` is `true`
- Transaction hashes are real
- Verify on Midnight block explorer

---

## Troubleshooting

### Backend Won't Start

**Check:**
1. `.env` file exists (copy from `.env.example`)
2. Node version: `node -v` (should be 16+)
3. Dependencies installed: `npm install`

### Blockchain Integration Not Working

**Check:**
1. `BLOCKCHAIN_ENABLED=true` in `.env`
2. Valid contract address set
3. RPC URL accessible: `curl <RPC_URL>`
4. Midnight SDK installed: `npm list @midnight-labs/sdk`

### Mock Mode Stuck

**Verify:**
1. Health endpoint shows correct mode: `curl http://localhost:3001/health`
2. Check server logs for blockchain initialization messages
3. Restart server after .env changes

---

## Demo Workflow

### For Hackathon Presentation

**Scenario 1: Show Mock Mode First**
- Demonstrates backend works independently
- Shows graceful degradation design
- All features work without blockchain

**Scenario 2: Switch to Live Mode**
- Update .env with contract address
- Restart server
- Show real blockchain transactions
- Verify on block explorer

**Wow Factor:**
- Side-by-side comparison of mock vs live
- Show transaction hashes on real blockchain
- Demonstrate ZK proof verification
- Real-time payment release

---

## Next Steps

### Immediate (Dev 1)
- [ ] Deploy smart contract to Midnight testnet
- [ ] Provide contract address and RPC URL
- [ ] Document contract interface
- [ ] Share ZK proof format

### Integration (Dev 4)
- [ ] Install Midnight SDK
- [ ] Replace mock methods with real contract calls
- [ ] Test each workflow endpoint
- [ ] Verify blockchain transactions
- [ ] Update documentation with actual usage

### Final Testing (All Devs)
- [ ] End-to-end flow with real blockchain
- [ ] ZK proof generation and verification
- [ ] Payment release confirmation
- [ ] Demo practice run

---

## Support

**Questions for Dev 1:**
- Smart contract interface
- ZK proof format
- Midnight SDK usage

**Questions for Dev 4:**
- Integration issues
- Testing strategy
- Error handling

**Backend Owner (Dev 2):**
- Available for blockchain service questions
- API endpoint questions
- Integration architecture

---

## Summary

The blockchain integration layer is **COMPLETE and READY** for connection:

- Works perfectly in mock mode (no dependencies)
- Clear integration points with TODO markers
- Graceful error handling throughout
- Comprehensive documentation
- Ready for Dev 4 to connect real contract

**Next Action:** Waiting for Dev 1's deployed contract address to enable live mode.
