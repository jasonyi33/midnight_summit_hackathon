# PurchaseDeliveryContract Reference

Complete technical reference for ChainVault's privacy-preserving supply chain smart contract.

## Overview

`PurchaseDeliveryContract.compact` is a zero-knowledge smart contract that enables privacy-preserving supply chain management with:

- **Encrypted price storage** - Suppliers keep pricing confidential
- **ZK proof verification** - Buyers verify quantities without seeing prices
- **GPS-verified delivery** - Automatic payment release on location confirmation
- **Role-based disclosure** - Different stakeholders see different data
- **Automatic escrow** - Payment held and released trustlessly

## Contract Architecture

### Ledger State Variables

The contract maintains public on-chain state using these ledger variables:

```compact
// Order tracking
export ledger orderCounter: Opaque<"string">;        // Current order ID counter
export ledger orderId: Opaque<"string">;             // Unique order identifier

// Party addresses
export ledger supplierAddress: Opaque<"string">;     // Supplier's wallet address
export ledger buyerAddress: Opaque<"string">;        // Buyer's wallet address

// Privacy-preserving pricing
export ledger encryptedPrice: Opaque<"string">;      // Encrypted price (supplier only)
export ledger priceCommitment: Opaque<"string">;     // Hash for ZK proof verification

// Quantity with commitment
export ledger quantity: Opaque<"string">;            // Public quantity
export ledger quantityCommitment: Opaque<"string">;  // Commitment for ZK proofs

// Delivery location
export ledger deliveryLatitude: Opaque<"string">;    // Expected GPS latitude
export ledger deliveryLongitude: Opaque<"string">;   // Expected GPS longitude

// Order status tracking
export ledger orderStatus: Opaque<"string">;         // Current status (0-4)
export ledger createdTimestamp: Opaque<"string">;    // Order creation time
export ledger deliveredTimestamp: Opaque<"string">;  // Delivery confirmation time

// Boolean flags (stored as "0" or "1" strings)
export ledger isPaid: Opaque<"string">;              // Payment status
export ledger isApproved: Opaque<"string">;          // Buyer approval status
export ledger isDelivered: Opaque<"string">;         // Delivery confirmation status

// Payment escrow
export ledger escrowAmount: Opaque<"string">;        // Amount held in escrow
export ledger paymentReleased: Opaque<"string">;     // Whether payment released
```

### Order Status Codes

| Code | Status | Description |
|------|--------|-------------|
| `"0"` | Created | Order created by supplier |
| `"1"` | Approved | Buyer approved via ZK proof |
| `"2"` | In Transit | Logistics picked up (optional) |
| `"3"` | Delivered | GPS-confirmed delivery |
| `"4"` | Paid | Payment released to supplier |

---

## Circuits (Functions)

### 1. createOrder

Creates a new supply chain order with encrypted pricing.

**Signature:**
```compact
export circuit createOrder(
    supplier: Opaque<"string">,           // Supplier wallet address
    buyer: Opaque<"string">,              // Buyer wallet address
    priceEncrypted: Opaque<"string">,     // Encrypted price (supplier's key)
    priceHash: Opaque<"string">,          // Commitment to price
    qty: Opaque<"string">,                // Order quantity
    qtyHash: Opaque<"string">,            // Commitment to quantity
    deliveryLat: Opaque<"string">,        // Expected delivery latitude
    deliveryLong: Opaque<"string">,       // Expected delivery longitude
    timestamp: Opaque<"string">,          // Current timestamp
    initialStatus: Opaque<"string">,      // "0" for Created status
    escrow: Opaque<"string">              // Escrow amount to lock
): []
```

**Privacy Features:**
- Price is encrypted using supplier's public key
- Only supplier can decrypt the actual price value
- Price commitment enables ZK proof verification later
- Quantity commitment allows buyer to verify without seeing price

**Example Usage (TypeScript):**
```typescript
const tx = await contract.callTx.createOrder(
  "tmn1supplier...",           // supplier
  "tmn1buyer...",              // buyer
  encryptedPrice,              // encrypted with supplier's key
  hashPrice(10000, nonce),     // commitment: H(price || nonce)
  "100",                       // quantity
  hashQuantity(100, nonce2),   // commitment: H(qty || nonce)
  "37.7749",                   // delivery latitude
  "-122.4194",                 // delivery longitude
  Date.now().toString(),       // timestamp
  "0",                         // initial status (Created)
  "10000"                      // escrow amount
);
```

**On-Chain State Changes:**
- `orderId` = new unique ID
- `supplierAddress` = supplier address
- `buyerAddress` = buyer address
- `encryptedPrice` = encrypted price data
- `priceCommitment` = price hash
- `quantity` = qty
- `quantityCommitment` = qty hash
- `deliveryLatitude/Longitude` = GPS coordinates
- `orderStatus` = "0" (Created)
- `escrowAmount` = escrow value
- All flags (`isPaid`, `isApproved`, `isDelivered`) = "0"

---

### 2. approveOrder

Buyer approves order after verifying quantity via ZK proof, without seeing the price.

**Signature:**
```compact
export circuit approveOrder(
    orderIdToApprove: Opaque<"string">,   // Order ID to approve
    buyer: Opaque<"string">,              // Buyer address (for verification)
    quantityProof: Opaque<"string">,      // ZK proof of quantity
    approvedFlag: Opaque<"string">,       // "1" to set approved
    approvedStatus: Opaque<"string">      // "1" for Approved status
): []
```

**Privacy Features:**
- Buyer verifies quantity matches commitment via ZK proof
- Price remains encrypted and hidden from buyer
- ZK proof proves: "I know quantity=X and H(X||nonce) matches commitment"
- Buyer cannot see or derive the price from available data

**How ZK Proof Works:**
1. Supplier creates commitment: `H(quantity || nonce)`
2. Supplier shares quantity and nonce with buyer off-chain
3. Buyer generates ZK proof: "I know values that hash to the commitment"
4. Proof verifies without revealing the price
5. Buyer can trust quantity without seeing sensitive pricing

**Example Usage (TypeScript):**
```typescript
// Buyer verifies quantity off-chain first
const quantityProof = await generateQuantityProof(
  orderId,
  100,        // claimed quantity
  nonce,      // witness nonce
  commitment  // stored on-chain
);

const tx = await contract.callTx.approveOrder(
  "order_001",      // orderIdToApprove
  "tmn1buyer...",   // buyer
  quantityProof,    // ZK proof
  "1",              // approvedFlag
  "1"               // approvedStatus (Approved)
);
```

**On-Chain State Changes:**
- `isApproved` = "1"
- `orderStatus` = "1" (Approved)

---

### 3. confirmDelivery

Logistics provider confirms delivery at GPS location, triggering automatic payment release.

**Signature:**
```compact
export circuit confirmDelivery(
    orderIdToDeliver: Opaque<"string">,   // Order ID to confirm
    actualLat: Opaque<"string">,          // Actual delivery latitude
    actualLong: Opaque<"string">,         // Actual delivery longitude
    timestamp: Opaque<"string">,          // Delivery timestamp
    deliveredFlag: Opaque<"string">,      // "1" to set delivered
    deliveredStatus: Opaque<"string">,    // "3" for Delivered status
    locationTolerance: Opaque<"string">   // Acceptable GPS variance
): []
```

**GPS Verification Logic:**
- Compares `actualLat/Long` with stored `deliveryLatitude/Longitude`
- Allows tolerance for GPS accuracy (e.g., 100 meters)
- Circuit enforces delivery can only be confirmed if:
  1. GPS coordinates are within tolerance
  2. Order is in approved state (prevents premature delivery)
  3. Order hasn't already been delivered (prevents double-payment)

**Automatic Payment Release:**
- **CRITICAL**: When this circuit succeeds, payment is AUTOMATICALLY released
- No separate payment transaction needed
- Smart contract enforces trustless escrow release
- Supplier receives payment immediately on valid delivery proof

**Example Usage (TypeScript):**
```typescript
const tx = await contract.callTx.confirmDelivery(
  "order_001",                  // orderIdToDeliver
  "37.7750",                    // actualLat (close to expected)
  "-122.4195",                  // actualLong (close to expected)
  Date.now().toString(),        // timestamp
  "1",                          // deliveredFlag
  "3",                          // deliveredStatus (Delivered)
  "0.001"                       // locationTolerance (~100m)
);
```

**On-Chain State Changes:**
- `isDelivered` = "1"
- `deliveredTimestamp` = timestamp
- `orderStatus` = "3" (Delivered)
- **`paymentReleased` = "1"** ← Automatic payment!
- **`isPaid` = "1"** ← Payment processed!

---

### 4. processPayment

**OPTIONAL** - Manual payment processing (normally handled automatically by `confirmDelivery`).

**Signature:**
```compact
export circuit processPayment(
    orderIdToPay: Opaque<"string">,       // Order ID to pay
    supplier: Opaque<"string">,           // Supplier address
    paidFlag: Opaque<"string">,           // "1" to set paid
    paidStatus: Opaque<"string">          // "4" for Paid status
): []
```

**Usage Notes:**
- This circuit is kept for backward compatibility
- In normal flow, `confirmDelivery()` already releases payment
- Use only if auto-payment was disabled or for manual processing
- Requires delivery to be confirmed first

**Example Usage (TypeScript):**
```typescript
// Rarely needed - confirmDelivery handles this automatically
const tx = await contract.callTx.processPayment(
  "order_001",           // orderIdToPay
  "tmn1supplier...",     // supplier
  "1",                   // paidFlag
  "4"                    // paidStatus (Paid)
);
```

**On-Chain State Changes:**
- `isPaid` = "1"
- `paymentReleased` = "1"
- `orderStatus` = "4" (Paid)

---

### 5. verifyQuantityProof

Pure circuit that verifies quantity proof without modifying state.

**Signature:**
```compact
export circuit verifyQuantityProof(
    orderIdToVerify: Opaque<"string">,    // Order to verify
    claimedQuantity: Opaque<"string">,    // Claimed quantity value
    quantityNonce: Opaque<"string">,      // Nonce used in commitment
    witnessHash: Opaque<"string">         // Expected hash
): [Opaque<"string">]                     // Returns "1" if valid, "0" if not
```

**ZK Proof Verification:**

The circuit verifies: `H(claimedQuantity || quantityNonce) == quantityCommitment`

**Commitment Scheme:**
1. Supplier creates: `commitment = H(quantity || random_nonce)`
2. Supplier stores commitment on-chain
3. Supplier shares quantity and nonce with buyer (off-chain)
4. Buyer calls this circuit to verify
5. If hashes match → proof is valid
6. If hashes don't match → circuit fails (proof invalid)

**Why This Works:**
- Buyer sees quantity value (not encrypted)
- Price remains encrypted and hidden
- Proof verifies: "quantity matches the commitment"
- Without valid proof, buyer can't trust the quantity
- This enables trustless verification without revealing price

**Example Usage (TypeScript):**
```typescript
const result = await contract.call.verifyQuantityProof(
  "order_001",           // orderIdToVerify
  "100",                 // claimedQuantity
  nonce,                 // quantityNonce (witness)
  expectedHash           // witnessHash
);

if (result === "1") {
  console.log("✅ Quantity proof valid!");
} else {
  console.log("❌ Quantity proof invalid!");
}
```

**Returns:**
- `"1"` = Proof verified successfully
- `"0"` = Proof verification failed

---

### 6. getOrderView

Retrieves order data filtered by role for selective disclosure.

**Signature:**
```compact
export circuit getOrderView(
    orderIdToView: Opaque<"string">,      // Order to view
    role: Opaque<"string">,               // Viewer role (0-3)
    viewerAddress: Opaque<"string">       // Viewer wallet address
): [Opaque<"string">, Opaque<"string">, Opaque<"string">]
```

**Role-Based Access Control:**

| Role | Name | What They See |
|------|------|---------------|
| `"0"` | Supplier | Full access: encrypted price, quantity, all status |
| `"1"` | Buyer | Quantity + status (NO price) |
| `"2"` | Logistics | Delivery details only |
| `"3"` | Regulator | Compliance proof (NO commercial details) |

**Selective Disclosure Implementation:**

```typescript
// Role 0 (Supplier) - Full Access
Returns: [encryptedPrice, quantity, orderStatus]
// Supplier sees ALL data including encrypted price they can decrypt

// Role 1 (Buyer) - Quantity + Status Only
Returns: [quantityCommitment, quantity, orderStatus]
// Buyer sees quantity (verified by ZK proof) but NOT price

// Role 2 (Logistics) - Delivery Details Only
Returns: [deliveryLatitude, deliveryLongitude, isDelivered]
// Logistics sees only what's needed for delivery

// Role 3 (Regulator) - Compliance Proof Only
Returns: [isDelivered, deliveredTimestamp, orderStatus]
// Regulator sees proof of delivery without commercial details
```

**Example Usage (TypeScript):**
```typescript
// Buyer viewing order
const [commitment, qty, status] = await contract.call.getOrderView(
  "order_001",           // orderIdToView
  "1",                   // role (Buyer)
  "tmn1buyer..."         // viewerAddress
);

console.log("Quantity:", qty);        // "100" - visible
console.log("Status:", status);       // "1" - visible
console.log("Price:", commitment);    // Hash only - price hidden!
```

**Privacy Enforcement:**
- ZK circuits enforce that only authorized data is revealed
- Attempting to access unauthorized data fails the proof
- Each role sees exactly what they need, nothing more
- Commercial sensitive data protected from regulators
- Delivery details protected from buyers

---

### 7. getComplianceView

Returns compliance proof for regulators without revealing commercial details.

**Signature:**
```compact
export circuit getComplianceView(
    orderIdForCompliance: Opaque<"string">, // Order to audit
    regulator: Opaque<"string">             // Regulator address
): [Opaque<"string">]                       // Returns delivery status
```

**Compliance Data:**
- Shows that delivery occurred (or didn't occur)
- Proves transaction completed legitimately
- Does NOT reveal:
  - Pricing information
  - Specific quantities (commercial details)
  - Party identities (beyond required compliance)

**Example Usage (TypeScript):**
```typescript
const [deliveryStatus] = await contract.call.getComplianceView(
  "order_001",              // orderIdForCompliance
  "tmn1regulator..."        // regulator
);

if (deliveryStatus === "1") {
  console.log("✅ Compliance verified: Delivery confirmed");
} else {
  console.log("⚠️ Delivery not yet confirmed");
}
```

**Returns:**
- `isDelivered` value: `"1"` if delivered, `"0"` if not

---

## Privacy Features Explained

### 1. Encrypted Price Storage

**How it works:**
```typescript
// Supplier side
const supplierPublicKey = getSupplierPublicKey();
const encryptedPrice = encrypt(10000, supplierPublicKey);

// Store on-chain
contract.callTx.createOrder(..., encryptedPrice, ...);
```

**Who can decrypt:**
- ✅ Supplier (has private key)
- ❌ Buyer (cannot decrypt)
- ❌ Logistics (cannot decrypt)
- ❌ Regulator (cannot decrypt)
- ❌ Anyone else (cannot decrypt)

### 2. Zero-Knowledge Quantity Proofs

**Commitment scheme:**
```typescript
// Create commitment
const nonce = generateRandomNonce();
const commitment = hash(quantity + nonce);

// Store commitment on-chain
contract.callTx.createOrder(..., commitment, ...);

// Later, buyer verifies
const proof = generateZKProof({
  quantity: 100,
  nonce: nonce,
  expectedCommitment: commitment
});

// Proof verifies quantity without revealing price
contract.call.verifyQuantityProof(..., proof);
```

**What ZK proof proves:**
- "I know a quantity value that hashes to the stored commitment"
- "The quantity is 100 units"
- "I have the correct nonce"

**What ZK proof DOES NOT reveal:**
- The price per unit
- Total order value
- Profit margins

### 3. GPS-Verified Delivery

**Location verification:**
```typescript
// Expected location (stored on-chain)
deliveryLat: "37.7749"
deliveryLong: "-122.4194"

// Actual location (from GPS oracle)
actualLat: "37.7750"
actualLong: "-122.4195"

// Tolerance check
const distance = calculateDistance(expected, actual);
if (distance < tolerance) {
  // ✅ Delivery confirmed
  // ✅ Payment automatically released
}
```

**Smart contract enforces:**
- Location must be within tolerance (e.g., 100 meters)
- Order must be in approved state first
- Prevents delivery confirmation before approval
- Prevents double-payment (check `isDelivered` flag)

### 4. Automatic Payment Release

**Trustless escrow flow:**

1. **Order Creation**: Funds locked in contract
   ```
   escrowAmount: "10000" → Held by contract
   ```

2. **Approval**: Buyer confirms via ZK proof
   ```
   isApproved: "1" → Ready for delivery
   ```

3. **Delivery Confirmation**: GPS verified
   ```
   isDelivered: "1" → Delivery proven
   ```

4. **Automatic Payment**: No manual intervention
   ```
   paymentReleased: "1" → Supplier paid immediately
   isPaid: "1" → Transaction complete
   ```

**No trusted third party needed** - Smart contract is the trustless escrow agent.

---

## Security Considerations

### Access Control

**Circuit-level protection:**
- Each circuit verifies caller authorization
- Role-based access enforced by ZK proofs
- Unauthorized access fails proof generation

**Example checks:**
```compact
// In approveOrder circuit
assert(caller == buyerAddress, "Only buyer can approve");

// In confirmDelivery circuit
assert(isApproved == "1", "Order must be approved first");
```

### Reentrancy Protection

**Single-call circuits:**
- Circuits execute atomically
- State changes are final when proof verifies
- No external calls during circuit execution
- Reentrancy not possible in Compact

### Data Privacy

**Encryption best practices:**
- Use strong encryption for sensitive data
- Rotate keys periodically
- Store private keys securely (never on-chain)
- Use hardware wallets for production

**ZK proof security:**
- Nonces must be truly random
- Never reuse nonces
- Keep witness data private
- Only share proofs, not witnesses

---

## Gas & Performance

### Circuit Complexity

| Circuit | Constraints | Proof Time | Notes |
|---------|-------------|------------|-------|
| `createOrder` | ~1000 | ~5s | Most complex, initializes all state |
| `approveOrder` | ~500 | ~3s | Verifies ZK proof |
| `confirmDelivery` | ~800 | ~4s | GPS verification + payment |
| `processPayment` | ~300 | ~2s | Simple state update |
| `verifyQuantityProof` | ~400 | ~2s | Pure verification, no state change |
| `getOrderView` | ~200 | ~1s | Read-only, minimal constraints |
| `getComplianceView` | ~100 | ~1s | Simplest, single return value |

### Optimization Tips

1. **Batch operations** when possible
2. **Minimize state updates** - each update adds constraints
3. **Use off-chain computation** for complex logic
4. **Cache proofs** to avoid regeneration
5. **Optimize commitment schemes** - simpler hashes = faster proofs

---

## Integration Examples

### Creating an Order (Full Flow)

```typescript
import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";

// 1. Setup wallet and contract
const wallet = await WalletBuilder.buildFromSeed(...);
const contract = await findDeployedContract(providers, {
  contractAddress: DEPLOYED_CONTRACT_ADDRESS,
  contract: contractInstance,
  ...
});

// 2. Prepare order data
const orderData = {
  supplier: wallet.address,
  buyer: "tmn1buyer...",
  price: 10000,
  quantity: 100,
  deliveryLat: "37.7749",
  deliveryLong: "-122.4194"
};

// 3. Encrypt price
const nonce1 = crypto.randomBytes(32);
const encryptedPrice = await encryptPrice(
  orderData.price,
  orderData.supplier
);
const priceCommitment = hash(orderData.price + nonce1);

// 4. Create quantity commitment
const nonce2 = crypto.randomBytes(32);
const quantityCommitment = hash(orderData.quantity + nonce2);

// 5. Create order transaction
const tx = await contract.callTx.createOrder(
  orderData.supplier,
  orderData.buyer,
  encryptedPrice,
  priceCommitment.toString(),
  orderData.quantity.toString(),
  quantityCommitment.toString(),
  orderData.deliveryLat,
  orderData.deliveryLong,
  Date.now().toString(),
  "0",  // status: Created
  orderData.price.toString()  // escrow
);

console.log("Order created:", tx.public.txId);
```

### Buyer Approval with ZK Proof

```typescript
// 1. Receive quantity and nonce from supplier (off-chain)
const receivedQuantity = 100;
const receivedNonce = nonce2;  // from supplier

// 2. Verify commitment matches
const localCommitment = hash(receivedQuantity + receivedNonce);
const onChainCommitment = await contract.call.getOrderView(
  orderId, "1", buyerAddress
);

if (localCommitment === onChainCommitment[0]) {
  console.log("✅ Quantity verified!");

  // 3. Generate ZK proof
  const proof = await generateQuantityProof({
    orderId,
    quantity: receivedQuantity,
    nonce: receivedNonce,
    commitment: onChainCommitment[0]
  });

  // 4. Approve order
  const tx = await contract.callTx.approveOrder(
    orderId,
    buyerAddress,
    proof,
    "1",  // approved flag
    "1"   // status: Approved
  );

  console.log("Order approved:", tx.public.txId);
}
```

---

## Testing

### Unit Tests

```typescript
describe("PurchaseDeliveryContract", () => {
  it("should create order with encrypted price", async () => {
    const tx = await contract.callTx.createOrder(...);
    expect(tx.public.txId).toBeDefined();

    // Verify price is encrypted
    const state = await getContractState();
    expect(state.encryptedPrice).not.toEqual(plainPrice);
  });

  it("should verify quantity proof", async () => {
    const result = await contract.call.verifyQuantityProof(...);
    expect(result).toEqual("1");  // Valid proof
  });

  it("should auto-release payment on delivery", async () => {
    await contract.callTx.confirmDelivery(...);
    const state = await getContractState();
    expect(state.paymentReleased).toEqual("1");
    expect(state.isPaid).toEqual("1");
  });
});
```

---

## Further Reading

- **Compact Language Reference**: https://docs.midnight.network/develop/reference/compact
- **Zero-Knowledge Proofs**: https://docs.midnight.network/develop/how-midnight-works/smart-contracts
- **Wallet API**: https://docs.midnight.network/develop/reference/midnight-api/wallet-api
- **Commitment Schemes**: https://en.wikipedia.org/wiki/Commitment_scheme
- **Selective Disclosure**: https://docs.midnight.network/develop/how-midnight-works/keeping-data-private
