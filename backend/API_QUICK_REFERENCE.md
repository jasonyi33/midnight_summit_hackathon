# ChainVault API Quick Reference

## Base URL
```
http://localhost:3001
```

## Complete Workflow Example

### Step 1: Create Contract
```bash
curl -X POST http://localhost:3001/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier",
    "buyerId": "buyer",
    "quantity": 100,
    "encryptedPrice": "encrypted_10000",
    "deliveryLocation": {"lat": 34.0522, "lng": -118.2437}
  }'
```

Response: `contract_xxx` (save this ID)

### Step 2: Approve Contract
```bash
curl -X POST http://localhost:3001/api/contracts/contract_xxx/approve \
  -H "Content-Type: application/json" \
  -d '{
    "zkProof": "mock_zk_proof_12345",
    "approvedBy": "buyer"
  }'
```

Oracle automatically starts tracking!

### Step 3: Wait for GPS Updates
Oracle updates every 30 seconds. Check progress:

```bash
curl http://localhost:3001/api/oracle/status
```

### Step 4: Automatic Delivery & Payment
After ~5 minutes (10 GPS updates):
- Oracle triggers delivery confirmation
- 3 seconds later, payment is released automatically

### Step 5: Verify Completion
```bash
curl http://localhost:3001/api/contracts/contract_xxx
```

Status should be `paid`

## All Endpoints at a Glance

### Contracts
```
GET    /api/contracts                    List all contracts
GET    /api/contracts?status=approved    Filter by status
GET    /api/contracts?role=buyer         Filter by role
GET    /api/contracts/:id                Get specific contract
POST   /api/contracts                    Create contract
PUT    /api/contracts/:id                Update contract
DELETE /api/contracts/:id                Cancel contract
```

### Workflow (Phase 2)
```
POST   /api/contracts/:id/approve        Approve with ZK proof
POST   /api/contracts/:id/deliver        Confirm delivery
POST   /api/contracts/:id/pay            Release payment
```

### Oracle (Phase 2)
```
GET    /api/oracle/status                Check oracle status
POST   /api/oracle/start                 Start oracle
POST   /api/oracle/stop                  Stop oracle
POST   /api/oracle/track/:id             Manually track contract
```

### Events
```
GET    /api/events                       List all events
GET    /api/events?contractId=xxx        Filter by contract
POST   /api/events                       Create custom event
```

### Users
```
GET    /api/users                        List all users
GET    /api/users/:id                    Get specific user
```

### System
```
GET    /health                           Health check
GET    /api/stats                        System statistics
POST   /api/reset                        Reset all state
```

## WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case 'contract_approved':
      console.log('Contract approved!', data.data);
      break;
    case 'gps_update':
      console.log('GPS Update:', data.data.progress + '%');
      break;
    case 'delivery_confirmed':
      console.log('Delivered!', data.data);
      break;
    case 'payment_released':
      console.log('Payment released!', data.data);
      break;
  }
};
```

## Contract States

```
created → approved → in_transit → delivered → paid
```

## Demo Users

```
supplier   - ACME Corp
buyer      - MegaRetail
logistics  - FastShip
regulator  - TradeComm
```

## Quick Test

Run the complete workflow test:

```bash
cd backend
./test-workflow.sh
```

## Oracle Configuration

- **Update Frequency**: 30 seconds
- **Total Duration**: ~5 minutes (10 updates)
- **Auto-start**: Yes (starts with server)
- **Origin**: San Francisco (37.7749, -122.4194)
- **Destination**: From contract's deliveryLocation

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

## Response Format

Success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-11-17T13:40:00.000Z"
}
```

## Tips for Frontend Integration

1. **Listen to WebSocket** - All state changes broadcast in real-time
2. **Poll Oracle Status** - Show GPS progress to users
3. **Filter by Role** - Use `?role=buyer` to show role-specific contracts
4. **Handle States** - Show different UI for each contract status
5. **Reset for Demo** - Use POST /api/reset to start fresh

## Common Workflows

### For Supplier Dashboard
```bash
# Get my contracts
GET /api/contracts?role=supplier

# Create new contract
POST /api/contracts

# Check payment status
GET /api/contracts/:id
```

### For Buyer Dashboard
```bash
# Get contracts to approve
GET /api/contracts?status=created

# Approve contract
POST /api/contracts/:id/approve
```

### For Logistics Dashboard
```bash
# Get in-transit shipments
GET /api/contracts?status=in_transit

# Check GPS tracking
GET /api/oracle/status

# Manual delivery (if needed)
POST /api/contracts/:id/deliver
```

### For Regulator Dashboard
```bash
# View all contracts
GET /api/contracts

# View audit trail
GET /api/events

# Check specific contract
GET /api/contracts/:id
```

## WebSocket Events Summary

| Event Type | Triggered By | Data Includes |
|------------|--------------|---------------|
| `contract_approved` | Approval endpoint | ZK proof status, quantity |
| `gps_update` | Oracle (every 30s) | Progress %, location, ETA |
| `delivery_confirmed` | Oracle or manual | Final GPS location |
| `payment_released` | Oracle (3s after delivery) | Payment proof |
| `contract_update` | Any contract change | Full contract data |
| `event_created` | Any event | Event details |

---

**Ready for Hour 8 frontend integration!**
