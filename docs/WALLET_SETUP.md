# Backend Wallet Configuration Guide

## Quick Setup

You need to configure the backend service wallet using the same wallet seed that deployed the contract.

### Option 1: Use the Configuration Script (Recommended)

Run the interactive configuration script:

```bash
node configure-backend-wallet.js
```

The script will:
1. Prompt you for your wallet seed (the one used for deployment)
2. Validate the seed format
3. Update `backend/.env` with the seed
4. Show you next steps

### Option 2: Manual Configuration

If you prefer to configure manually:

1. Open `backend/.env` in your editor

2. Find this line:
   ```
   MIDNIGHT_SERVICE_WALLET_SEED=YOUR_WALLET_SEED_HERE
   ```

3. Replace `YOUR_WALLET_SEED_HERE` with your actual 64-character wallet seed:
   ```
   MIDNIGHT_SERVICE_WALLET_SEED=your_actual_64_character_hex_seed_here
   ```

4. Save the file

### Where to Find Your Wallet Seed

Your wallet seed was shown when you first ran `npm run deploy`. It should be:
- A 64-character hexadecimal string (0-9, a-f)
- The same seed used to deploy the contract
- Stored securely (never commit it to git!)

If you don't have the seed saved, you'll need to either:
- Generate a new wallet seed and fund it with tDUST tokens, OR
- Use a wallet you have access to

### Verify Configuration

After configuring, start the backend to verify:

```bash
cd backend
npm run dev
```

**Success indicators:**
- ✅ `[Blockchain] Loading Midnight SDK modules...`
- ✅ `[Blockchain] SDK modules loaded successfully`
- ✅ `[Blockchain] Building service wallet...`
- ✅ `[Blockchain] ✓ Successfully connected to deployed contract!`
- ✅ `[Blockchain] Mode: LIVE (on-chain)`

**Failure indicators:**
- ❌ `[Blockchain] Running in MOCK MODE` - Seed not set or incorrect
- ❌ `Error: ENOENT` - Contract files not found
- ❌ `Wallet sync timeout` - Network issues or wallet has no funds

### Common Issues

**"Running in MOCK MODE"**
- Check that `MIDNIGHT_SERVICE_WALLET_SEED` is set (not `YOUR_WALLET_SEED_HERE`)
- Verify the seed is 64 characters
- Ensure wallet has tDUST tokens

**"Module not found"**
- Run `npm install` in the backend directory

**"Contract path not found"**
- Verify you're running from the correct directory
- Check that `contracts/managed/purchase-delivery/` exists

### Testing the Connection

Once the backend is running in LIVE mode, test it:

```bash
# In another terminal
curl http://localhost:3001/api/contracts

# Should return [] or existing contracts (not an error)
```

Then try creating a contract:

```bash
curl -X POST http://localhost:3001/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier_001",
    "buyerId": "buyer_001",
    "quantity": 100,
    "encryptedPrice": "encrypted_test_price",
    "deliveryLocation": {"lat": 37.7749, "lng": -122.4194}
  }'
```

The response should include a real transaction hash (not `mock_tx_...`).

### Security Note

⚠️ **NEVER commit your wallet seed to git!**

The `.env` file is already in `.gitignore`, but always double-check before committing.

For production deployments, use environment variables or a secrets manager instead of `.env` files.
