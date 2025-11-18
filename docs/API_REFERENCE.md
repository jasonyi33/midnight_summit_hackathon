# ChainVault API Reference

Complete API documentation for the ChainVault backend REST API and WebSocket interface.

## Base URL

```
Development: http://localhost:3001
Production: https://api.chainvault.example.com
```

## Authentication

Currently, the hackathon version uses simplified authentication. Production should implement proper JWT-based auth.

```http
Authorization: Bearer <wallet_signature>
```

---

## REST API Endpoints

### Health Check

Check if the backend service is healthy and connected to blockchain.

#### GET /health

**Response:**
```json
{
  "status": "healthy",
  "blockchain": "connected",
  "contractAddress": "0x1234567890abcdef...",
  "network": "testnet-02",
  "timestamp": "2025-01-18T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Service healthy
- `503 Service Unavailable` - Service degraded

---

### Contracts

#### GET /api/contracts

Retrieve all contracts with optional filtering.

**Query Parameters:**
- `status` (string, optional) - Filter by status: `created`, `approved`, `delivered`, `paid`
- `supplier` (string, optional) - Filter by supplier address
- `buyer` (string, optional) - Filter by buyer address
- `limit` (number, optional) - Max results (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

**Request Example:**
```http
GET /api/contracts?status=approved&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contract_001",
      "supplierAddress": "tmn1supplier...",
      "buyerAddress": "tmn1buyer...",
      "quantity": "100",
      "status": "approved",
      "createdAt": "2025-01-18T10:00:00.000Z",
      "deliveryLocation": {
        "latitude": "37.7749",
        "longitude": "-122.4194"
      },
      "isApproved": true,
      "isDelivered": false,
      "isPaid": false
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid query parameters

---

#### GET /api/contracts/:contractId

Get details for a specific contract with role-based filtering.

**Path Parameters:**
- `contractId` (string, required) - Contract identifier

**Query Parameters:**
- `role` (string, optional) - Viewing role: `supplier`, `buyer`, `logistics`, `regulator`
- `address` (string, optional) - Viewer wallet address

**Request Example:**
```http
GET /api/contracts/contract_001?role=buyer&address=tmn1buyer...
```

**Response (Buyer View):**
```json
{
  "id": "contract_001",
  "buyerAddress": "tmn1buyer...",
  "quantity": "100",
  "quantityCommitment": "0xabc123...",
  "status": "approved",
  "statusCode": "1",
  "createdAt": "2025-01-18T10:00:00.000Z",
  "isApproved": true,
  "isDelivered": false,
  "isPaid": false,
  "zkProofVerified": true
}
```

**Response (Supplier View):**
```json
{
  "contractId": "contract_001",
  "supplierAddress": "tmn1supplier...",
  "buyerAddress": "tmn1buyer...",
  "encryptedPrice": "0xdef456...",
  "quantity": "100",
  "status": "approved",
  "statusCode": "1",
  "createdAt": "2025-01-18T10:00:00.000Z",
  "deliveryLocation": {
    "latitude": "37.7749",
    "longitude": "-122.4194"
  },
  "escrowAmount": "10000",
  "isApproved": true,
  "isDelivered": false,
  "isPaid": false
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Order doesn't exist
- `403 Forbidden` - Unauthorized role/address

---

#### POST /api/contracts

Create a new supply chain contract.

**Request Body:**
```json
{
  "supplier": "tmn1supplier...",
  "buyer": "tmn1buyer...",
  "price": 10000,
  "quantity": 100,
  "deliveryLocation": {
    "latitude": "37.7749",
    "longitude": "-122.4194"
  },
  "escrowAmount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "contract_001",
  "transactionId": "0xabc123...",
  "contractAddress": "0x1234567890abcdef...",
  "encryptedPrice": "0xdef456...",
  "priceCommitment": "0x789abc...",
  "quantityCommitment": "0x456def...",
  "status": "created",
  "createdAt": "2025-01-18T10:00:00.000Z"
}
```

**Status Codes:**
- `201 Created` - Contract created successfully
- `400 Bad Request` - Invalid request body
- `500 Internal Server Error` - Blockchain transaction failed

**Privacy Notes:**
- `price` is encrypted using supplier's public key before storing on-chain
- `priceCommitment` enables ZK proof verification
- `quantityCommitment` allows buyer to verify quantity without seeing price

---

#### POST /api/contracts/:contractId/approve

Buyer approves a contract after verifying quantity via ZK proof.

**Path Parameters:**
- `contractId` (string, required) - Contract to approve

**Request Body:**
```json
{
  "buyer": "tmn1buyer...",
  "quantity": 100,
  "quantityNonce": "0xabc123...",
  "zkProof": "0xdef456..."
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "contract_001",
  "transactionId": "0x789def...",
  "status": "approved",
  "zkProofVerified": true,
  "approvedAt": "2025-01-18T10:05:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Order approved
- `400 Bad Request` - Invalid ZK proof
- `403 Forbidden` - Not authorized (must be buyer)
- `409 Conflict` - Order already approved

---

#### POST /api/contracts/:contractId/deliver

Logistics confirms delivery at GPS location.

**Path Parameters:**
- `contractId` (string, required) - Contract to confirm delivery

**Request Body:**
```json
{
  "actualLocation": {
    "latitude": "37.7750",
    "longitude": "-122.4195"
  },
  "timestamp": "2025-01-18T10:10:00.000Z",
  "locationTolerance": 0.001
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "contract_001",
  "transactionId": "0xabc789...",
  "status": "delivered",
  "deliveredAt": "2025-01-18T10:10:00.000Z",
  "locationVerified": true,
  "distance": 15.3,
  "paymentReleased": true,
  "paymentAmount": "10000"
}
```

**Status Codes:**
- `200 OK` - Delivery confirmed, payment released
- `400 Bad Request` - Location out of tolerance
- `403 Forbidden` - Contract not approved yet
- `409 Conflict` - Contract already delivered

**Automatic Actions:**
- Payment is automatically released from escrow to supplier
- Contract status updated to "delivered" and then "paid"
- Real-time notification sent via WebSocket

---

### Oracle Service

#### GET /api/oracle/location

Get current GPS location from oracle service (for demo/testing).

**Query Parameters:**
- `contractId` (string, optional) - Get location for specific contract

**Response:**
```json
{
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "timestamp": "2025-01-18T10:15:00.000Z",
  "accuracy": 10.5,
  "source": "gps_simulator"
}
```

**Status Codes:**
- `200 OK` - Location retrieved
- `503 Service Unavailable` - Oracle service offline

---

#### POST /api/oracle/update-location

Update simulated GPS location (demo only).

**Request Body:**
```json
{
  "contractId": "contract_001",
  "latitude": "37.7750",
  "longitude": "-122.4195",
  "simulate": true
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "contract_001",
  "location": {
    "latitude": "37.7750",
    "longitude": "-122.4195"
  },
  "updated": true
}
```

**Status Codes:**
- `200 OK` - Location updated
- `400 Bad Request` - Invalid coordinates

---

### Blockchain Integration

#### GET /api/blockchain/contract

Get contract information.

**Response:**
```json
{
  "contractAddress": "0x1234567890abcdef...",
  "network": "testnet-02",
  "deployedAt": "2025-01-18T09:00:00.000Z",
  "features": [
    "Encrypted price storage",
    "ZK proof generation for quantity",
    "Automatic payment release on delivery",
    "Role-based selective disclosure",
    "GPS-verified delivery confirmation"
  ],
  "circuits": [
    "createOrder",
    "approveOrder",
    "confirmDelivery",
    "processPayment",
    "verifyQuantityProof",
    "getOrderView",
    "getComplianceView"
  ]
}
```

---

#### GET /api/blockchain/state/:contractId

Query on-chain contract state for a contract.

**Path Parameters:**
- `contractId` (string, required) - Contract to query

**Response:**
```json
{
  "contractId": "contract_001",
  "onChainState": {
    "supplierAddress": "tmn1supplier...",
    "buyerAddress": "tmn1buyer...",
    "encryptedPrice": "0xdef456...",
    "priceCommitment": "0x789abc...",
    "quantity": "100",
    "quantityCommitment": "0x456def...",
    "deliveryLatitude": "37.7749",
    "deliveryLongitude": "-122.4194",
    "orderStatus": "1",
    "isApproved": "1",
    "isDelivered": "0",
    "isPaid": "0",
    "escrowAmount": "10000",
    "paymentReleased": "0"
  },
  "lastUpdated": "2025-01-18T10:05:00.000Z"
}
```

---

## WebSocket API

Connect to receive real-time updates about orders, deliveries, and payments.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to ChainVault WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleUpdate(data);
};
```

### Events

#### subscribe

Subscribe to updates for specific order(s).

**Client → Server:**
```json
{
  "type": "subscribe",
  "contractIds": ["contract_001", "contract_002"],
  "roles": ["buyer"]
}
```

**Server → Client (Confirmation):**
```json
{
  "type": "subscribed",
  "contractIds": ["contract_001", "contract_002"],
  "timestamp": "2025-01-18T10:20:00.000Z"
}
```

---

#### order.created

New order created.

**Server → Client:**
```json
{
  "type": "order.created",
  "contractId": "contract_001",
  "supplier": "tmn1supplier...",
  "buyer": "tmn1buyer...",
  "quantity": "100",
  "status": "created",
  "timestamp": "2025-01-18T10:00:00.000Z"
}
```

---

#### order.approved

Order approved by buyer.

**Server → Client:**
```json
{
  "type": "order.approved",
  "contractId": "contract_001",
  "buyer": "tmn1buyer...",
  "zkProofVerified": true,
  "status": "approved",
  "timestamp": "2025-01-18T10:05:00.000Z"
}
```

---

#### order.delivered

Delivery confirmed at GPS location.

**Server → Client:**
```json
{
  "type": "order.delivered",
  "contractId": "contract_001",
  "location": {
    "latitude": "37.7750",
    "longitude": "-122.4195"
  },
  "locationVerified": true,
  "distance": 15.3,
  "status": "delivered",
  "timestamp": "2025-01-18T10:10:00.000Z"
}
```

---

#### payment.released

Payment automatically released to supplier.

**Server → Client:**
```json
{
  "type": "payment.released",
  "contractId": "contract_001",
  "supplier": "tmn1supplier...",
  "amount": "10000",
  "transactionId": "0xabc789...",
  "status": "paid",
  "timestamp": "2025-01-18T10:10:01.000Z"
}
```

---

#### location.update

GPS location update from oracle (real-time tracking).

**Server → Client:**
```json
{
  "type": "location.update",
  "contractId": "contract_001",
  "location": {
    "latitude": "37.7748",
    "longitude": "-122.4193"
  },
  "accuracy": 10.5,
  "timestamp": "2025-01-18T10:08:30.000Z"
}
```

---

#### error

Error occurred during processing.

**Server → Client:**
```json
{
  "type": "error",
  "code": "APPROVAL_FAILED",
  "message": "ZK proof verification failed",
  "contractId": "contract_001",
  "timestamp": "2025-01-18T10:05:30.000Z"
}
```

**Error Codes:**
- `APPROVAL_FAILED` - Order approval failed
- `DELIVERY_FAILED` - Delivery confirmation failed
- `LOCATION_OUT_OF_RANGE` - GPS coordinates outside tolerance
- `UNAUTHORIZED` - Insufficient permissions
- `BLOCKCHAIN_ERROR` - Contract interaction error

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  },
  "timestamp": "2025-01-18T10:00:00.000Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Malformed request body |
| `ORDER_NOT_FOUND` | Order ID doesn't exist |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions for action |
| `ALREADY_APPROVED` | Order already approved |
| `ALREADY_DELIVERED` | Order already delivered |
| `NOT_APPROVED` | Order must be approved first |
| `ZK_PROOF_INVALID` | Zero-knowledge proof verification failed |
| `LOCATION_MISMATCH` | GPS coordinates outside tolerance |
| `BLOCKCHAIN_ERROR` | Smart contract interaction failed |
| `WALLET_ERROR` | Wallet operation failed |
| `ORACLE_OFFLINE` | Oracle service unavailable |

---

## Rate Limiting

The API implements rate limiting to prevent abuse.

**Limits:**
- Anonymous: 60 requests/minute
- Authenticated: 600 requests/minute
- WebSocket: 100 messages/minute

**Headers:**
```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 595
X-RateLimit-Reset: 1642515600
```

**Rate Limit Exceeded Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

// Create contract
async function createContract(contractData: ContractData) {
  const response = await axios.post(`${API_BASE}/api/contracts`, contractData);
  return response.data;
}

// Get contract details
async function getContract(contractId: string, role: string, address: string) {
  const response = await axios.get(
    `${API_BASE}/api/contracts/${contractId}`,
    {
      params: { role, address }
    }
  );
  return response.data;
}

// Approve contract
async function approveContract(contractId: string, approvalData: ApprovalData) {
  const response = await axios.post(
    `${API_BASE}/api/contracts/${contractId}/approve`,
    approvalData
  );
  return response.data;
}

// WebSocket connection
function connectWebSocket(contractIds: string[]) {
  const ws = new WebSocket('ws://localhost:3001');

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      contractIds,
      roles: ['buyer']
    }));
  };

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    console.log('Received update:', update);
  };

  return ws;
}
```

### Python

```python
import requests
import websocket
import json

API_BASE = 'http://localhost:3001'

# Create contract
def create_contract(contract_data):
    response = requests.post(f'{API_BASE}/api/contracts', json=contract_data)
    return response.json()

# Get contract
def get_contract(contract_id, role, address):
    params = {'role': role, 'address': address}
    response = requests.get(f'{API_BASE}/api/contracts/{contract_id}', params=params)
    return response.json()

# WebSocket
def on_message(ws, message):
    data = json.loads(message)
    print(f'Received: {data}')

def connect_websocket(contract_ids):
    ws = websocket.WebSocketApp(
        'ws://localhost:3001',
        on_message=on_message
    )

    def on_open(ws):
        ws.send(json.dumps({
            'type': 'subscribe',
            'contractIds': contract_ids,
            'roles': ['buyer']
        }))

    ws.on_open = on_open
    ws.run_forever()
```

---

## Testing

### Health Check

```bash
curl http://localhost:3001/health
```

### Create Contract

```bash
curl -X POST http://localhost:3001/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "supplier": "tmn1supplier...",
    "buyer": "tmn1buyer...",
    "price": 10000,
    "quantity": 100,
    "deliveryLocation": {
      "latitude": "37.7749",
      "longitude": "-122.4194"
    },
    "escrowAmount": 10000
  }'
```

### Get Contract

```bash
curl "http://localhost:3001/api/contracts/contract_001?role=buyer&address=tmn1buyer..."
```

### Approve Contract

```bash
curl -X POST http://localhost:3001/api/contracts/contract_001/approve \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": "tmn1buyer...",
    "quantity": 100,
    "quantityNonce": "0xabc123...",
    "zkProof": "0xdef456..."
  }'
```

---

## Development

### Running Locally

```bash
# Start backend
cd backend
npm run dev

# In another terminal, test API
curl http://localhost:3001/health
```

### Environment Variables

```bash
# backend/.env
MIDNIGHT_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
MIDNIGHT_INDEXER_WS=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
MIDNIGHT_NODE_URL=https://rpc.testnet-02.midnight.network
MIDNIGHT_PROOF_SERVER=http://127.0.0.1:6300
CONTRACT_ADDRESS=0x1234567890abcdef...
PORT=3001
WS_PORT=3002
NODE_ENV=development
```

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/jasonyi33/midnight_summit_hackathon/issues
- Discord: #chainvault-support
- Email: support@chainvault.example.com
