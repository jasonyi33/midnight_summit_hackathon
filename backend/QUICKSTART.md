# ChainVault Backend - Quick Start Guide

## For Team Members

This is a 2-minute guide to get the backend running.

## Prerequisites

- Node.js installed (v16 or later)
- Terminal/command line access

## Installation & Running

```bash
# Navigate to backend directory
cd /Users/IshrithG/midnight_summit_hackathon/backend

# Install dependencies (first time only)
npm install

# Start the server
npm run dev
```

The server will start on `http://localhost:3001`

You'll see:
```
===========================================
  ChainVault Backend Server
===========================================
  Environment: development
  Server:      http://localhost:3001
  WebSocket:   ws://localhost:3001
  Health:      http://localhost:3001/health
===========================================

[Server] Ready to accept connections
[WebSocket] Ready for real-time updates
[State] In-memory storage initialized
[Users] 4 demo users loaded
```

## Quick Test

Open a new terminal and run:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Get demo users
curl http://localhost:3001/api/users

# Create a test contract
curl -X POST http://localhost:3001/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier",
    "buyerId": "buyer",
    "quantity": 100,
    "encryptedPrice": "encrypted_10000"
  }'
```

## For Dev 3 (Frontend Developer)

Your frontend should connect to:
- **REST API**: `http://localhost:3001/api`
- **WebSocket**: `ws://localhost:3001`

Example API calls:
```javascript
// Get all contracts
const contracts = await fetch('http://localhost:3001/api/contracts')
  .then(res => res.json());

// Create contract
const newContract = await fetch('http://localhost:3001/api/contracts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplierId: 'supplier',
    buyerId: 'buyer',
    quantity: 100,
    encryptedPrice: 'encrypted_10000'
  })
}).then(res => res.json());

// WebSocket connection
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## For Dev 4 (Integration Developer)

Everything is ready for you to:
1. Connect smart contract interactions to the API endpoints
2. Implement the mock GPS oracle in Phase 2
3. Wire the frontend to the backend

Key files you'll work with:
- `/src/routes/api.js` - Add smart contract calls here
- `/src/services/` - Add oracle service here
- `/src/models/state.js` - State management (already done)

## Test Tools

### API Test Script
```bash
./test-api.sh
```
Tests all endpoints automatically.

### WebSocket Test Client
```bash
open test-websocket.html
```
Beautiful UI to test WebSocket connections.

## Available Endpoints

### Users
- GET `/api/users` - All users
- GET `/api/users/:userId` - Specific user

### Contracts
- GET `/api/contracts` - All contracts
- GET `/api/contracts?status=created` - Filter by status
- GET `/api/contracts?role=supplier` - Filter by role
- GET `/api/contracts/:contractId` - Specific contract
- POST `/api/contracts` - Create contract
- PUT `/api/contracts/:contractId` - Update contract
- DELETE `/api/contracts/:contractId` - Cancel contract

### Events
- GET `/api/events` - All events
- GET `/api/events?contractId=xxx` - Contract events
- POST `/api/events` - Create event

### Utility
- GET `/health` - Server health
- GET `/api/stats` - Statistics
- POST `/api/reset` - Reset all state

## Demo Users

4 hardcoded users (no login needed):
1. **supplier** - ACME Corp
2. **buyer** - MegaRetail
3. **logistics** - FastShip
4. **regulator** - TradeComm

## Order Statuses

- `created` - Contract created
- `approved` - Buyer approved
- `in_transit` - Shipment started
- `delivered` - Delivery confirmed
- `paid` - Payment released
- `cancelled` - Contract cancelled

## Troubleshooting

### Port Already in Use
```bash
# Kill existing process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002 npm run dev
```

### Dependencies Missing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Server Won't Start
- Check Node.js version: `node --version` (need v16+)
- Check for syntax errors in recent changes
- Look at console output for specific errors

## Need Help?

- Full documentation: `README.md`
- Implementation details: `IMPLEMENTATION.md`
- Check the code comments in `/src/`

## Remember

- All data is in-memory (restarting = reset)
- This is intentional for the hackathon demo
- No authentication needed
- CORS is enabled for all origins
- Perfect for fast iteration

## Next Steps

After server is running:
1. Dev 3: Start building frontend
2. Dev 2: Continue to Phase 2 (Oracle)
3. Dev 4: Plan integration strategy

Happy hacking!
