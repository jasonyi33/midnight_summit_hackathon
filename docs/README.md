# ChainVault Documentation

Welcome to the ChainVault documentation! This directory contains comprehensive guides for setting up, deploying, and using the privacy-preserving supply chain management system built on Midnight Network.

## 📚 Documentation Index

### Getting Started

1. **[Setup Guide](SETUP_GUIDE.md)** ⭐ **START HERE**
   - Complete installation walkthrough
   - Midnight development environment setup
   - ChainVault deployment guide
   - Backend and frontend configuration
   - End-to-end testing procedures

### Technical Reference

2. **[Contract Reference](CONTRACT_REFERENCE.md)**
   - `PurchaseDeliveryContract.compact` deep dive
   - All 7 circuits explained in detail
   - Privacy features (encrypted price, ZK proofs)
   - GPS-verified delivery mechanics
   - Automatic payment release
   - Integration examples and testing

3. **[API Reference](API_REFERENCE.md)**
   - REST API endpoints documentation
   - WebSocket real-time events
   - Request/response examples
   - Error codes and handling
   - SDK usage examples (JS/Python)

### Midnight Platform Docs

4. **[Installation](install.md)**
   - Lace wallet setup
   - Compact compiler installation
   - Proof server configuration
   - tDUST token acquisition

5. **[Create MN App](create.md)**
   - Midnight Network app basics
   - Compact contract structure
   - Circuit definitions
   - Ledger state management

6. **[Deploy Contract](deploy.md)**
   - Contract deployment process
   - Wallet integration
   - Provider configuration
   - Testnet deployment

7. **[Interact with Contract](interact.md)**
   - CLI interaction patterns
   - Circuit invocation
   - State querying
   - Transaction submission

### Additional Resources

8. **[Lace Wallet Guide](lace-wallet.md)**
   - Chrome extension installation
   - Wallet creation and recovery
   - Network configuration
   - Security best practices

9. **[Run Proof Server](run-proof-server.md)**
   - Docker setup
   - Local proof generation
   - Privacy considerations
   - Systemd service configuration

10. **[React Wallet Connect](react-wallet-connect.md)**
    - DApp connector API
    - React integration
    - Wallet state management
    - UI components

11. **[Acquire Tokens](acquire-tokens.md)**
    - Testnet faucet usage
    - Token management
    - Balance checking

### Troubleshooting

12. **[Fix Package Repository Issues](fix-package-repository-access-failures.md)**
    - npm 403 errors
    - Registry configuration
    - VPN/proxy issues
    - Platform-specific fixes

13. **[Fix Version Mismatches](fix-version-mismatch-errors.md)**
    - Component compatibility
    - Version alignment
    - Upgrade procedures
    - Compatibility matrix

---

## 🚀 Quick Start Path

### For New Users

```
1. Read SETUP_GUIDE.md (Part 1: Midnight Environment)
2. Install Lace wallet
3. Get testnet tokens
4. Install Compact compiler
5. Run proof server
```

### For Developers

```
1. Complete "For New Users" steps above
2. Read SETUP_GUIDE.md (Part 2-3: ChainVault Installation & Deployment)
3. Review CONTRACT_REFERENCE.md
4. Study API_REFERENCE.md
5. Start building!
```

### For Integrators

```
1. Read API_REFERENCE.md
2. Review CONTRACT_REFERENCE.md (Circuits section)
3. Check SDK examples
4. Start integration
```

---

## 📖 Documentation by Role

### Supplier (Order Creator)

**Relevant Docs:**
- [Setup Guide](SETUP_GUIDE.md) - Sections 1-3
- [Contract Reference](CONTRACT_REFERENCE.md) - `createOrder` circuit
- [API Reference](API_REFERENCE.md) - `POST /api/orders`

**Key Features:**
- Create orders with encrypted pricing
- Only you can see actual prices
- Automatic escrow management
- Payment released on delivery

### Buyer (Order Approver)

**Relevant Docs:**
- [Setup Guide](SETUP_GUIDE.md) - Section 1
- [Contract Reference](CONTRACT_REFERENCE.md) - `approveOrder`, `verifyQuantityProof`
- [API Reference](API_REFERENCE.md) - `POST /api/orders/:id/approve`

**Key Features:**
- Verify quantities via ZK proofs
- Approve orders without seeing prices
- Track order status in real-time
- Privacy-preserving verification

### Logistics (Delivery Confirmer)

**Relevant Docs:**
- [Setup Guide](SETUP_GUIDE.md) - Section 1
- [Contract Reference](CONTRACT_REFERENCE.md) - `confirmDelivery`
- [API Reference](API_REFERENCE.md) - `POST /api/orders/:id/deliver`

**Key Features:**
- Confirm delivery with GPS verification
- Trigger automatic payment release
- Real-time location tracking
- Delivery proof generation

### Regulator (Compliance Viewer)

**Relevant Docs:**
- [Contract Reference](CONTRACT_REFERENCE.md) - `getComplianceView`
- [API Reference](API_REFERENCE.md) - WebSocket events

**Key Features:**
- View compliance data
- Verify delivery occurred
- No access to commercial details
- Privacy-preserving auditing

---

## 🏗️ Project Structure

```
midnight_summit_hackathon/
├── docs/                           # 📚 You are here
│   ├── README.md                   # This file
│   ├── SETUP_GUIDE.md              # ⭐ Complete setup walkthrough
│   ├── CONTRACT_REFERENCE.md       # Contract deep dive
│   ├── API_REFERENCE.md            # Backend API docs
│   └── [Midnight platform docs]    # General Midnight guides
│
├── contracts/
│   ├── PurchaseDeliveryContract.compact  # Main smart contract
│   └── managed/purchase-delivery/        # Compiled artifacts
│
├── src/
│   ├── deploy.ts                   # Contract deployment
│   ├── create-order.ts             # Create orders
│   ├── approve-order.ts            # Approve orders
│   ├── deliver-order.ts            # Confirm delivery
│   └── view-order.ts               # View orders
│
├── backend/
│   └── src/
│       ├── server.js               # Express API server
│       ├── routes/api.js           # REST endpoints
│       ├── services/
│       │   ├── blockchain.js       # Contract integration
│       │   ├── oracle.js           # GPS oracle
│       │   └── websocket.js        # Real-time updates
│       └── models/state.js         # State management
│
└── frontend/
    ├── app/                        # Next.js pages
    └── components/
        ├── dashboards/             # Role-based UIs
        ├── ZKProofGenerator.tsx    # ZK proof tools
        └── DeliveryMap.tsx         # GPS visualization
```

---

## 💡 Common Use Cases

### 1. Deploy Your First Contract

```bash
# Follow these docs in order:
1. docs/SETUP_GUIDE.md (Part 1: Midnight Environment)
2. docs/SETUP_GUIDE.md (Part 3: Smart Contract Deployment)
3. docs/CONTRACT_REFERENCE.md (Understanding what you deployed)
```

### 2. Create and Process an Order

```bash
# Command-line approach:
1. npm run create-order     # See: SETUP_GUIDE.md Part 6.1
2. npm run approve-order    # See: CONTRACT_REFERENCE.md approveOrder
3. npm run deliver-order    # See: CONTRACT_REFERENCE.md confirmDelivery

# API approach:
1. POST /api/orders         # See: API_REFERENCE.md
2. POST /api/orders/:id/approve
3. POST /api/orders/:id/deliver
```

### 3. Integrate ChainVault into Your App

```bash
# Follow these docs:
1. API_REFERENCE.md (REST API section)
2. API_REFERENCE.md (WebSocket section)
3. CONTRACT_REFERENCE.md (Integration Examples)
```

### 4. Understand Privacy Features

```bash
# Read these sections:
1. CONTRACT_REFERENCE.md → "Privacy Features Explained"
2. CONTRACT_REFERENCE.md → "verifyQuantityProof" circuit
3. CONTRACT_REFERENCE.md → "Encrypted Price Storage"
```

---

## 🔍 Finding What You Need

### By Topic

| Topic | Document | Section |
|-------|----------|---------|
| Installation | [SETUP_GUIDE.md](SETUP_GUIDE.md) | Part 1 |
| Wallet Setup | [lace-wallet.md](lace-wallet.md) | All |
| Contract Deployment | [SETUP_GUIDE.md](SETUP_GUIDE.md) | Part 3 |
| Creating Orders | [CONTRACT_REFERENCE.md](CONTRACT_REFERENCE.md) | createOrder |
| ZK Proofs | [CONTRACT_REFERENCE.md](CONTRACT_REFERENCE.md) | verifyQuantityProof |
| API Endpoints | [API_REFERENCE.md](API_REFERENCE.md) | REST API |
| Real-time Updates | [API_REFERENCE.md](API_REFERENCE.md) | WebSocket |
| GPS Verification | [CONTRACT_REFERENCE.md](CONTRACT_REFERENCE.md) | confirmDelivery |
| Troubleshooting | [SETUP_GUIDE.md](SETUP_GUIDE.md) | Troubleshooting |

### By Technology

| Technology | Relevant Docs |
|------------|---------------|
| Midnight Network | [install.md](install.md), [create.md](create.md), [deploy.md](deploy.md) |
| Compact Language | [create.md](create.md), [CONTRACT_REFERENCE.md](CONTRACT_REFERENCE.md) |
| Smart Contracts | [CONTRACT_REFERENCE.md](CONTRACT_REFERENCE.md) |
| Next.js Frontend | [SETUP_GUIDE.md](SETUP_GUIDE.md) Part 5 |
| Express Backend | [SETUP_GUIDE.md](SETUP_GUIDE.md) Part 4, [API_REFERENCE.md](API_REFERENCE.md) |
| Zero-Knowledge Proofs | [CONTRACT_REFERENCE.md](CONTRACT_REFERENCE.md) Privacy section |
| WebSocket | [API_REFERENCE.md](API_REFERENCE.md) WebSocket section |

---

## 🆘 Getting Help

### Documentation Issues

If you find errors or gaps in the documentation:
1. Check the [GitHub Issues](https://github.com/jasonyi33/midnight_summit_hackathon/issues)
2. Open a new issue with label `documentation`
3. Provide specific details about what's unclear

### Technical Support

**For Midnight Platform:**
- Official Docs: https://docs.midnight.network
- Discord: #developer-support channel
- Forum: https://forum.midnight.network

**For ChainVault:**
- GitHub Issues: https://github.com/jasonyi33/midnight_summit_hackathon/issues
- Project Discord: #chainvault-support

### Common Issues

| Issue | Solution |
|-------|----------|
| Proof server won't start | See [SETUP_GUIDE.md](SETUP_GUIDE.md) Troubleshooting |
| npm install fails | See [fix-package-repository-access-failures.md](fix-package-repository-access-failures.md) |
| Version mismatches | See [fix-version-mismatch-errors.md](fix-version-mismatch-errors.md) |
| Contract deployment fails | See [SETUP_GUIDE.md](SETUP_GUIDE.md) Part 3.3 |
| Can't connect to backend | See [SETUP_GUIDE.md](SETUP_GUIDE.md) Troubleshooting |

---

## 📝 Contributing to Docs

We welcome documentation improvements! Please:

1. **For Minor Fixes** (typos, broken links):
   - Submit a PR directly

2. **For New Content**:
   - Open an issue first to discuss
   - Follow existing formatting style
   - Include code examples where relevant
   - Test all commands/code snippets

3. **For Major Changes**:
   - Discuss in GitHub Discussions first
   - Coordinate with maintainers
   - Update multiple docs if needed

### Documentation Standards

- Use clear, concise language
- Include practical examples
- Provide troubleshooting steps
- Keep code snippets up-to-date
- Link between related docs
- Test all commands before publishing

---

## 📅 Documentation Updates

### Latest Changes

- **2025-01-18**: Created comprehensive ChainVault-specific docs
  - Added SETUP_GUIDE.md
  - Added CONTRACT_REFERENCE.md
  - Added API_REFERENCE.md
  - Organized existing Midnight platform docs

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-01-18 | Complete ChainVault documentation overhaul |
| 1.0.0 | 2025-01-15 | Initial Midnight platform docs |

---

## 🎯 Next Steps

After reading the documentation:

1. ✅ **Complete Setup** - Follow [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. ✅ **Deploy Contract** - Deploy to testnet
3. ✅ **Test Features** - Run through Part 6 of setup guide
4. ✅ **Build Integration** - Use [API_REFERENCE.md](API_REFERENCE.md)
5. ✅ **Go Live** - Deploy to production when ready

---

## 📚 Additional Resources

### Midnight Network

- **Website**: https://midnight.network
- **Documentation**: https://docs.midnight.network
- **GitHub**: https://github.com/midnightntwrk
- **Discord**: Join the community
- **Blog**: https://midnight.network/blog

### ChainVault

- **Repository**: https://github.com/jasonyi33/midnight_summit_hackathon
- **Demo**: http://localhost:3000 (after setup)
- **API**: http://localhost:3001 (after setup)

### Learning Resources

- **Zero-Knowledge Proofs**: https://docs.midnight.network/develop/how-midnight-works
- **Compact Language**: https://docs.midnight.network/develop/reference/compact
- **Privacy Patterns**: https://docs.midnight.network/develop/how-midnight-works/keeping-data-private

---

**Happy Building!** 🚀

For questions or feedback about ChainVault, open an issue on GitHub or reach out in Discord.
