# ChainVault Backend API

Privacy-preserving supply chain contract automation backend for the Midnight Summit Hackathon.

## Features

### Phase 1 (Complete)
- Express server with WebSocket support
- In-memory state management (no database needed)
- RESTful API for contract management
- Real-time event broadcasting
- Hardcoded demo users (supplier, buyer, logistics, regulator)

### Phase 2 (Complete)
- **Workflow Endpoints**: Approve, Deliver, Pay
- **Mock GPS Oracle**: Automatic shipment tracking simulation
- **Enhanced WebSocket Events**: Supply chain-specific real-time updates

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:3001`
WebSocket available at `ws://localhost:3001`

### Run Production Server
```bash
npm start
```

### Test the Workflow
```bash
./test-workflow.sh
```

## API Endpoints

### Contract Management

#### Create Contract
```bash
POST /api/contracts
Content-Type: application/json

{
  "supplierId": "supplier",
  "buyerId": "buyer",
  "logisticsId": "logistics",
  "quantity": 100,
  "encryptedPrice": "encrypted_10000",
  "deliveryLocation": {"lat": 34.0522, "lng": -118.2437},
  "description": "Purchase order for 100 units"
}
```

#### Get All Contracts
```bash
GET /api/contracts
GET /api/contracts?status=approved
GET /api/contracts?role=buyer
```

#### Get Contract by ID
```bash
GET /api/contracts/:contractId
```

### Workflow Endpoints (Phase 2)

#### Approve Contract
```bash
POST /api/contracts/:contractId/approve
Content-Type: application/json

{
  "zkProof": "mock_zk_proof_12345",
  "approvedBy": "buyer"
}
```

**Sequential workflow validation:**
- Contract must be in `created` status
- ZK proof is required
- Updates status to `approved`
- Triggers GPS tracking automatically

#### Confirm Delivery
```bash
POST /api/contracts/:contractId/deliver
Content-Type: application/json

{
  "gpsLocation": {"lat": 34.0522, "lng": -118.2437},
  "deliveredBy": "logistics"
}
```

**Validation:**
- Contract must be in `approved` or `in_transit` status
- Updates status to `delivered`

#### Release Payment
```bash
POST /api/contracts/:contractId/pay
Content-Type: application/json

{
  "paymentProof": "optional_payment_hash"
}
```

**Validation:**
- Contract must be in `delivered` status
- Updates status to `paid`
- Automatically triggered by oracle after delivery

### GPS Oracle Service

#### Get Oracle Status
```bash
GET /api/oracle/status
```

Response:
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "updateFrequency": 30000,
    "trackedContracts": 1,
    "contracts": [
      {
        "contractId": "contract_xxx",
        "progress": 25,
        "currentLocation": {"lat": 36.5, "lng": -120.0}
      }
    ]
  }
}
```

#### Start Oracle
```bash
POST /api/oracle/start
```

#### Stop Oracle
```bash
POST /api/oracle/stop
```

#### Manually Track Contract
```bash
POST /api/oracle/track/:contractId
```

### Events

#### Get All Events
```bash
GET /api/events
GET /api/events?contractId=contract_xxx
```

### Users

#### Get All Users
```bash
GET /api/users
```

#### Get User by ID
```bash
GET /api/users/:userId
```

### Utilities

#### Health Check
```bash
GET /health
```

#### Reset State
```bash
POST /api/reset
```

#### System Stats
```bash
GET /api/stats
```

## WebSocket Events

Connect to `ws://localhost:3001` to receive real-time updates.

### Event Types

#### Connection Established
```json
{
  "type": "connection",
  "message": "Connected to ChainVault WebSocket server",
  "timestamp": "2025-11-17T13:40:00.000Z"
}
```

#### Contract Approved
```json
{
  "type": "contract_approved",
  "contractId": "contract_xxx",
  "data": {
    "contractId": "contract_xxx",
    "status": "approved",
    "approvedBy": "buyer",
    "zkProofProvided": true,
    "message": "Contract approved with ZK proof - price remains private"
  },
  "timestamp": "2025-11-17T13:40:00.000Z"
}
```

#### GPS Update
```json
{
  "type": "gps_update",
  "contractId": "contract_xxx",
  "data": {
    "currentLocation": {"lat": 36.5, "lng": -120.0},
    "destination": {"lat": 34.0522, "lng": -118.2437},
    "progress": 25,
    "estimatedArrival": "2025-11-17T13:45:00.000Z",
    "message": "Shipment at 25% progress"
  },
  "timestamp": "2025-11-17T13:40:30.000Z"
}
```

#### Delivery Confirmed
```json
{
  "type": "delivery_confirmed",
  "contractId": "contract_xxx",
  "data": {
    "contractId": "contract_xxx",
    "status": "delivered",
    "deliveredBy": "logistics",
    "finalGpsLocation": {"lat": 34.0522, "lng": -118.2437},
    "message": "Delivery confirmed at destination - triggering payment"
  },
  "timestamp": "2025-11-17T13:45:00.000Z"
}
```

#### Payment Released
```json
{
  "type": "payment_released",
  "contractId": "contract_xxx",
  "data": {
    "contractId": "contract_xxx",
    "status": "paid",
    "paidAt": "2025-11-17T13:45:03.000Z",
    "paymentProof": "oracle_triggered_payment_xxx",
    "recipient": "supplier",
    "amount": "ENCRYPTED",
    "message": "Payment automatically released - contract complete"
  },
  "timestamp": "2025-11-17T13:45:03.000Z"
}
```

## GPS Oracle Service

The GPS Oracle automatically tracks approved contracts and simulates shipment movement.

### How It Works

1. **Automatic Tracking**: When a contract is approved, the oracle automatically starts tracking it
2. **GPS Updates**: Every 30 seconds, the oracle updates the shipment's GPS position
3. **Progress Simulation**: The shipment moves from origin to destination in 10 steps (5 minutes total)
4. **Automatic Delivery**: When progress reaches 100%, the oracle triggers delivery confirmation
5. **Automatic Payment**: 3 seconds after delivery, payment is automatically released

### Configuration

- **Update Frequency**: 30 seconds (configurable)
- **Total Steps**: 10 updates to reach destination
- **Origin**: Supplier location (San Francisco: 37.7749, -122.4194)
- **Destination**: From contract deliveryLocation

### Demo Control

The oracle can be started/stopped for demo control:

```bash
# Start oracle
POST /api/oracle/start

# Stop oracle
POST /api/oracle/stop

# Check status
GET /api/oracle/status
```

## Contract States

```
created → approved → in_transit → delivered → paid
   ↓
cancelled
```

### State Transitions

1. **created**: Contract is created by supplier
2. **approved**: Buyer approves with ZK proof → Oracle starts tracking
3. **in_transit**: Oracle picks up shipment and begins GPS updates
4. **delivered**: Oracle confirms arrival OR manual delivery confirmation
5. **paid**: Payment released automatically 3 seconds after delivery
6. **cancelled**: Contract can be cancelled at any time

## Data Models

### User
```json
{
  "id": "supplier",
  "role": "supplier",
  "name": "ACME Corp",
  "description": "Manufacturing Supplier"
}
```

### Contract
```json
{
  "id": "contract_xxx",
  "supplierId": "supplier",
  "buyerId": "buyer",
  "logisticsId": "logistics",
  "quantity": 100,
  "encryptedPrice": "encrypted_data_here",
  "deliveryLocation": { "lat": 40.7128, "lng": -74.0060 },
  "description": "Purchase order for 100 units",
  "status": "created",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Event
```json
{
  "id": "evt_xxx",
  "contractId": "contract_xxx",
  "type": "contract_created",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {}
}
```

## Architecture

```
┌─────────────────┐
│  Express Server │
├─────────────────┤
│  - API Routes   │
│  - WebSocket    │
│  - Oracle       │
└────────┬────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌────────┐  ┌──────────┐
│ State  │  │ WebSocket│
│Manager │  │ Service  │
└────────┘  └──────────┘
    ▲
    │
┌───┴────────┐
│ GPS Oracle │
│  Service   │
└────────────┘
```

## Demo Users

Hardcoded users for demo purposes:

- **supplier**: ACME Corp (Manufacturing Supplier)
- **buyer**: MegaRetail (Retail Buyer)
- **logistics**: FastShip (Logistics Provider)
- **regulator**: TradeComm (Trade Commission Regulator)

## Environment Variables

- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: localhost)
- `NODE_ENV` - Environment (development/production)

## Testing the Complete Workflow

Run the test script to see the full flow:

```bash
./test-workflow.sh
```

This will:
1. Create a new contract
2. Approve it with a ZK proof
3. Wait for GPS tracking to start
4. Show real-time progress updates
5. Automatically deliver and pay when ready

## Development Notes

### Hackathon Shortcuts

This is a 24-hour hackathon build with intentional shortcuts:

- **No Database**: All data in memory (resets on server restart)
- **No Authentication**: Hardcoded demo users
- **Simplified Validation**: Minimal error handling
- **Mock GPS**: Simulated coordinates, not real GPS
- **Auto-start Oracle**: Starts automatically with server

### What's Next (Out of Scope)

- Real database (PostgreSQL)
- User authentication & authorization
- Real GPS oracle integration
- Production error handling
- Comprehensive testing
- Rate limiting & security
- Multi-party signatures
- ERP integrations

## Integration with Frontend

The frontend (Dev 3) will connect to:
- REST API: `http://localhost:3001/api`
- WebSocket: `ws://localhost:3001`

All endpoints return JSON with this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Errors return:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## License

MIT
