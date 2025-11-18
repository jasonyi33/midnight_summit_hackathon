# ChainVault Setup Guide

Complete installation and deployment guide for ChainVault - a privacy-preserving supply chain management system built on Midnight Network.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Midnight Development Environment](#part-1-midnight-development-environment)
3. [Part 2: ChainVault Installation](#part-2-chainvault-installation)
4. [Part 3: Smart Contract Deployment](#part-3-smart-contract-deployment)
5. [Part 4: Backend Setup](#part-4-backend-setup)
6. [Part 5: Frontend Setup](#part-5-frontend-setup)
7. [Part 6: Testing & Verification](#part-6-testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Operating System**: macOS, Linux, or Windows with WSL2
- **Node.js**: Version 20.x or higher ([Install via NVM](https://github.com/nvm-sh/nvm))
- **Google Chrome**: Required for Lace wallet extension
- **Docker Desktop**: For running the proof server
- **Git**: For cloning the repository
- **Terminal**: Basic command-line familiarity

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 5GB free
- **Internet**: Stable connection for testnet access

---

## Part 1: Midnight Development Environment

### Step 1.1: Install Lace Midnight Preview Wallet

The Lace wallet manages your testnet tokens and signs transactions.

1. **Install the Chrome Extension**
   - Open Google Chrome
   - Visit: [Lace Wallet on Chrome Web Store](https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg)
   - Click **Add to Chrome** → **Add extension**
   - Pin the extension to your toolbar

2. **Create Your Wallet**
   - Click the Lace wallet icon
   - Select **Create a new wallet**
   - Choose a strong password
   - **CRITICAL**: Write down your seed phrase on paper
   - Store it securely offline (never digitally)
   - Confirm your seed phrase

3. **Configure Network Settings**
   - Open Lace wallet
   - Go to **Settings** → **Midnight**
   - Select **Testnet** network
   - Set proof server to: `http://localhost:6300`

**Verification**: Your wallet shows `0 tDUST` balance

### Step 1.2: Get Testnet Tokens (tDUST)

1. In Lace wallet, click **Receive**
2. Copy your wallet address
3. Visit the [Midnight Testnet Faucet](https://midnight.network/test-faucet/)
4. Paste your address and click **Request tDUST**
5. Wait 1-2 minutes for tokens to arrive

**Verification**: Your wallet shows `1000 tDUST` balance

### Step 1.3: Install Compact Compiler

Compact is Midnight's smart contract language compiler.

```bash
# Install Compact v0.2.0
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh
```

**Update your shell PATH** (choose your shell):

```bash
# For bash
echo 'export PATH="$HOME/.compact/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# For zsh
echo 'export PATH="$HOME/.compact/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Verify installation**:

```bash
compact --version  # Should show: compact 0.2.0
which compact      # Should show: /Users/[you]/.compact/bin/compact
```

### Step 1.4: Install and Run Proof Server

The proof server generates zero-knowledge proofs locally to protect your privacy.

1. **Verify Docker is running**
   ```bash
   docker --version
   docker ps
   ```

2. **Pull the proof server image**
   ```bash
   docker pull midnightnetwork/proof-server:latest
   ```

3. **Start the proof server** (keep this terminal open):
   ```bash
   docker run -p 6300:6300 midnightnetwork/proof-server -- \
     'midnight-proof-server --network testnet'
   ```

   You should see:
   ```
   Targeting network: TestNet
   Listening at http://localhost:6300
   ```

**Verification**: Open a new terminal and test:
```bash
curl http://localhost:6300/health
# Should return: {"status":"ok"}
```

**IMPORTANT**: Keep the proof server running in a dedicated terminal window for the entire setup process.

---

## Part 2: ChainVault Installation

### Step 2.1: Clone the Repository

```bash
cd ~/Projects  # or your preferred directory
git clone https://github.com/jasonyi33/midnight_summit_hackathon.git
cd midnight_summit_hackathon
```

### Step 2.2: Install Root Dependencies

```bash
# Install project dependencies
npm install
```

This installs all Midnight SDK packages including:
- `@midnight-ntwrk/compact-runtime`
- `@midnight-ntwrk/midnight-js-contracts`
- `@midnight-ntwrk/wallet`
- And other required packages

**Verification**:
```bash
npm list @midnight-ntwrk
# Should show all installed Midnight packages
```

### Step 2.3: Compile the Smart Contract

ChainVault uses a privacy-preserving supply chain contract called `PurchaseDeliveryContract`.

```bash
npm run compile
```

This compiles `contracts/PurchaseDeliveryContract.compact` and generates:
- Zero-knowledge circuits
- Cryptographic proving/verifying keys
- TypeScript contract interfaces

**Expected output structure**:
```
contracts/
└── managed/
    └── purchase-delivery/
        ├── compiler/
        ├── contract/       # Contains index.cjs
        ├── keys/           # ZK proving/verifying keys
        └── zkir/           # Zero-knowledge intermediate representation
```

**Verification**:
```bash
ls contracts/managed/purchase-delivery/contract/index.cjs
# Should exist and show the compiled contract
```

### Step 2.4: Build TypeScript Files

```bash
npm run build
```

This compiles all TypeScript files in `src/` to JavaScript in `dist/`:
- `deploy.js` - Contract deployment script
- `create-order.js` - Create supply chain orders
- `approve-order.js` - Buyer approval with ZK proofs
- `deliver-order.js` - GPS-verified delivery confirmation
- `view-order.js` - View orders with role-based access

**Verification**:
```bash
ls dist/
# Should show: deploy.js, create-order.js, approve-order.js, deliver-order.js, view-order.js
```

---

## Part 3: Smart Contract Deployment

### Step 3.1: Prepare for Deployment

**IMPORTANT**: Make sure:
- ✅ Proof server is running (`docker ps` shows proof-server container)
- ✅ You have tDUST in your Lace wallet
- ✅ Contract is compiled (`contracts/managed/purchase-delivery/` exists)
- ✅ TypeScript is built (`dist/deploy.js` exists)

### Step 3.2: Deploy to Midnight Testnet

```bash
npm run deploy
```

The deployment script will:

1. **Ask about wallet seed**
   ```
   Do you have a wallet seed? (y/n):
   ```

   - First time: Type `n` → Script generates a new seed
   - Existing wallet: Type `y` → Enter your 64-character seed

2. **SAVE YOUR WALLET SEED** (if new)
   ```
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   IMPORTANT: SAVE THIS SEED - YOU'LL NEED IT TO RECOVER YOUR WALLET
   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

   Wallet Seed: a1b2c3d4e5f6... (64 characters)
   ```

   **Write this down and store it securely!**

3. **Wait for wallet sync**
   ```
   Building wallet...
   Wallet Address: tmn1abc...xyz
   Checking Balance...
   ```

4. **Get funds if needed**
   - If balance is 0, visit the faucet with your displayed address
   - Script waits for funds automatically

5. **Contract deployment** (30-60 seconds)
   ```
   Deploying Contract to Midnight Testnet...
   This may take 30-60 seconds...
   ```

6. **Success!**
   ```
   ======================================================================
   DEPLOYMENT SUCCESSFUL!
   ======================================================================

   Contract Address: 0x1234567890abcdef...
   Deployed At: 2025-01-18T10:30:00.000Z
   ```

### Step 3.3: Save Deployment Information

The script automatically creates `deployment.json`:

```json
{
  "contractAddress": "0x1234567890abcdef...",
  "deployedAt": "2025-01-18T10:30:00.000Z",
  "network": "testnet-02",
  "walletAddress": "tmn1abc...xyz",
  "contractName": "PurchaseDeliveryContract",
  "features": [
    "Encrypted price storage",
    "ZK proof generation for quantity",
    "Automatic payment release on delivery",
    "Role-based selective disclosure",
    "GPS-verified delivery confirmation"
  ]
}
```

**IMPORTANT**: Share the `contractAddress` with your team for integration.

**Note on Wallet Address Format**: In the actual deployment, the wallet address format will be `mn_shield-addr_test1...` (not `tmn1...`). The examples in this guide use simplified placeholders for illustration.

---

## Part 4: Backend Setup

The ChainVault backend provides:
- REST API for order management
- Oracle service for GPS tracking simulation
- WebSocket for real-time updates
- Blockchain integration layer

### Step 4.1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4.2: Configure Environment

Create `.env` file in the `backend/` directory:

```bash
cat > backend/.env << EOF
# Midnight Network Configuration
MIDNIGHT_INDEXER_URL=https://indexer.testnet-02.midnight.network/api/v1/graphql
MIDNIGHT_INDEXER_WS=wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws
MIDNIGHT_NODE_URL=https://rpc.testnet-02.midnight.network
MIDNIGHT_PROOF_SERVER=http://127.0.0.1:6300

# Contract Configuration (from deployment.json)
CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS_HERE

# Server Configuration
PORT=3001
NODE_ENV=development
EOF
```

**Replace `YOUR_CONTRACT_ADDRESS_HERE`** with the address from `deployment.json`.

### Step 4.3: Start the Backend Server

```bash
cd backend
npm run dev
```

**Expected output**:
```
Backend server running on http://localhost:3001
WebSocket server running on ws://localhost:3001
Oracle service initialized
Blockchain service connected to: 0x1234...
```

**Verification**:
Open a new terminal and test:
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy","blockchain":"connected"}
```

### Step 4.4: Backend API Endpoints

The backend exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/contracts` | GET | List all contracts |
| `/api/contracts` | POST | Create new contract |
| `/api/contracts/:contractId` | GET | Get contract details |
| `/api/contracts/:contractId/approve` | POST | Approve contract |
| `/api/contracts/:contractId/deliver` | POST | Confirm delivery |
| `/api/oracle/status` | GET | Get oracle service status |
| `/api/oracle/track/:contractId` | POST | Start GPS tracking for contract |

---

## Part 5: Frontend Setup

The ChainVault frontend is a Next.js application with role-based dashboards.

### Step 5.1: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 5.2: Configure Environment

Create `.env.local` file in the `frontend/` directory:

```bash
cat > frontend/.env.local << EOF
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS_HERE

# Network Configuration
NEXT_PUBLIC_NETWORK=testnet
EOF
```

**Replace `YOUR_CONTRACT_ADDRESS_HERE`** with the address from `deployment.json`.

### Step 5.3: Start the Frontend

```bash
cd frontend
npm run dev
```

**Expected output**:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully
```

### Step 5.4: Access the Dashboard

Open your browser to: **http://localhost:3000**

You should see the ChainVault landing page with role selection:
- **Supplier** - Create orders with encrypted pricing
- **Buyer** - Approve orders without seeing prices
- **Logistics** - Confirm deliveries with GPS
- **Regulator** - View compliance data

**Note:** The frontend currently operates in demo mode with mock data for rapid prototyping. Full backend integration via the REST API and WebSocket is configured but not yet fully implemented. Use the CLI scripts (Part 6) for end-to-end blockchain interactions.

---

## Part 6: Testing & Verification

### Step 6.1: End-to-End Flow Test

Test the complete supply chain workflow:

#### 1. Create an Order (Supplier)

```bash
# From project root
npm run create-order
```

Follow the prompts:
```
Enter supplier address: tmn1supplier...
Enter buyer address: tmn1buyer...
Enter price: 10000
Enter quantity: 100
Enter delivery latitude: 37.7749
Enter delivery longitude: -122.4194
```

**Expected output**:
```
Order created successfully!
Order ID: order_001
Transaction ID: 0xabc123...
Encrypted price stored on-chain
```

#### 2. Approve Order (Buyer)

```bash
npm run approve-order
```

The buyer sees:
- ✅ Quantity: 100 units
- ❌ Price: HIDDEN (encrypted)
- ✅ ZK Proof: Quantity verified without revealing price

```
Order approved!
ZK proof generated and verified
Buyer confirmed 100 units without seeing price
```

#### 3. Confirm Delivery (Logistics)

```bash
npm run deliver-order
```

GPS verification:
```
Enter order ID: order_001
Current GPS: 37.7749, -122.4194
Location match: ✅ Within tolerance
Delivery confirmed!
Payment automatically released to supplier
```

#### 4. View Order (Any Role)

```bash
npm run view-order
```

Different views based on role:
- **Supplier**: Full details including price
- **Buyer**: Quantity and status only
- **Logistics**: Delivery information only
- **Regulator**: Compliance proof without commercial details

### Step 6.2: Test Real-Time Updates

1. Open frontend: **http://localhost:3000**
2. Select **Supplier** role
3. In another browser tab, select **Buyer** role
4. Create an order in Supplier dashboard
5. Watch it appear in real-time in Buyer dashboard (via WebSocket)

### Step 6.3: Verify Privacy Features

**Test encrypted price storage**:
```bash
# Query blockchain directly
curl "https://indexer.testnet-02.midnight.network/api/v1/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ contract(address: \"YOUR_CONTRACT_ADDRESS\") { state } }"
  }'
```

You should see:
- ✅ Order exists on-chain
- ✅ Encrypted price (unreadable ciphertext)
- ✅ Quantity visible
- ✅ Status visible

**Test ZK proof verification**:
- Buyer can verify quantity matches commitment
- Buyer CANNOT decrypt the price
- Proof verifies without revealing sensitive data

---

## Troubleshooting

### Issue: Proof server not responding

**Symptoms**: `Error: Failed to connect to proof server`

**Solution**:
```bash
# Check if proof server is running
docker ps | grep proof-server

# If not running, restart it
docker run -p 6300:6300 midnightnetwork/proof-server -- \
  'midnight-proof-server --network testnet'

# Test connection
curl http://localhost:6300/health
```

### Issue: Contract deployment fails

**Symptoms**: `Error: Insufficient balance` or `Transaction timeout`

**Solutions**:
1. **Check balance**:
   ```bash
   # Open Lace wallet and verify tDUST balance > 100
   ```

2. **Get more tokens**:
   - Visit [Midnight Faucet](https://midnight.network/test-faucet/)
   - Request more tDUST

3. **Wait for network sync**:
   - Deployment requires wallet to be fully synced
   - Wait for "Sync complete" message

### Issue: Backend can't connect to contract

**Symptoms**: `Error: Contract not found`

**Solution**:
1. Verify `CONTRACT_ADDRESS` in `backend/.env` matches `deployment.json`
2. Check contract was deployed:
   ```bash
   cat deployment.json
   ```

3. Restart backend:
   ```bash
   cd backend
   npm run dev
   ```

### Issue: Frontend shows no data

**Symptoms**: Empty dashboards, "No orders found"

**Solutions**:
1. **Check backend is running**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verify environment variables**:
   ```bash
   cat frontend/.env.local
   # Ensure NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for CORS or connection errors
   - Verify WebSocket connection

### Issue: npm install fails with 403 errors

**Symptoms**: `403 Forbidden - GET https://registry.npmjs.org/@midnight-ntwrk/...`

**Solution**:
```bash
# Reset npm registry
npm config set registry https://registry.npmjs.org/
npm config delete @midnight-ntwrk:registry
npm cache clean --force

# Retry installation
npm install
```

See `docs/fix-package-repository-access-failures.md` for detailed solutions.

### Issue: Version mismatch errors

**Symptoms**: `Error: Compact runtime version mismatch`

**Solution**:
```bash
# Check Compact version
compact --version

# Should be 0.2.0
# If not, reinstall:
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh

# Recompile contract
npm run compile
npm run build
```

See `docs/fix-version-mismatch-errors.md` for version compatibility matrix.

---

## Summary Checklist

Before considering setup complete, verify:

- [ ] Lace wallet installed with testnet tokens
- [ ] Proof server running on port 6300
- [ ] Compact compiler installed (version 0.2.0)
- [ ] ChainVault repository cloned
- [ ] Contract compiled successfully
- [ ] Contract deployed to testnet
- [ ] `deployment.json` file created with contract address
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Can create orders via CLI or UI
- [ ] Can approve orders (buyer role)
- [ ] Can confirm delivery (logistics role)
- [ ] Real-time updates working in dashboard
- [ ] Privacy features verified (encrypted price)

---

## Next Steps

Now that ChainVault is set up, you can:

1. **Explore the Dashboards**
   - Navigate to http://localhost:3000
   - Try each role (Supplier, Buyer, Logistics, Regulator)
   - See how privacy features work in action

2. **Review the Smart Contract**
   - Open `contracts/PurchaseDeliveryContract.compact`
   - Study the ZK circuits and privacy patterns
   - See how encrypted price storage works

3. **Customize for Your Use Case**
   - Modify contract logic
   - Add new circuits
   - Extend API endpoints
   - Customize dashboards

4. **Deploy to Production**
   - When ready, deploy to Midnight mainnet
   - Update configuration for production network
   - Implement proper key management

---

## Additional Resources

- **Midnight Documentation**: https://docs.midnight.network
- **Compact Language Reference**: https://docs.midnight.network/develop/reference/compact
- **ChainVault Repository**: https://github.com/jasonyi33/midnight_summit_hackathon
- **Midnight Discord**: Join #developer-support for help
- **Testnet Faucet**: https://midnight.network/test-faucet

---

**Congratulations!** 🎉 You now have a fully functional privacy-preserving supply chain system running on Midnight Network.
