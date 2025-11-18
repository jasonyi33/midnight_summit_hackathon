# ChainVault Hackathon Tasks - 24 Hour Sprint

## Total Tasks: 20 (Simplified from 46)

---

## Dev 1: Midnight Blockchain Specialist

**Focus**: Smart Contract & ZK Proofs
**Timeline**: Hours 0-20

### Phase 1: Setup (Hours 0-4)

- [x] 1.1 Set up Midnight development environment and testnet access
- [x] 1.2 Create single PurchaseDeliveryContract structure in Compact

### Phase 2: Core Contract (Hours 4-12)

- [x] 1.3 Implement createOrder with encrypted price storage
- [x] 1.4 Build ZK proof generation for selective disclosure
- [x] 1.5 Add delivery confirmation and auto-payment logic

### Phase 3: Deploy & Test (Hours 12-20)

- [x] 1.6 Deploy contract to Midnight testnet
- [x] 1.7 Create helper scripts for contract interaction

**Critical Output**: Contract address + ABI for team by Hour 12

---

## Dev 2: Backend & Oracle Developer

**Focus**: Minimal API & Mock Oracle
**Timeline**: Hours 0-16

### Phase 1: Server Setup (Hours 0-4)

- [x] 2.1 Create Express server with WebSocket support
- [x] 2.2 Set up in-memory state management (no database)

### Phase 2: API & Oracle (Hours 4-12)

- [x] 2.3 Implement core API endpoints (create, approve, deliver)
- [x] 2.4 Build mock GPS oracle with timed progression
- [x] 2.5 Add WebSocket event broadcasting

### Phase 3: Integration (Hours 12-16)

- [x] 2.6 Connect to deployed smart contract (depends on Dev 1)

**Critical Output**: Running API by Hour 8 for frontend

---

## Dev 3: Frontend UI Developer

**Focus**: Beautiful Multi-Role Dashboard
**Timeline**: Hours 0-20

### Phase 1: Foundation (Hours 0-6)

- [x] 3.1 Set up Next.js with Tailwind CSS
- [x] 3.2 Create layout with role switcher (Supplier/Buyer/Logistics/Regulator)

### Phase 2: Role Dashboards (Hours 6-14)

- [x] 3.3 Build Supplier view (create order form)
- [x] 3.4 Build Buyer view (approval with hidden pricing)
- [x] 3.5 Build Logistics view (GPS map tracker)
- [x] 3.6 Build Regulator view (compliance dashboard)

### Phase 3: Polish (Hours 14-20)

- [x] 3.7 Add animations, transitions, and real-time updates
- [x] 3.8 Implement ZK proof visualization

**Critical Output**: All UI components ready by Hour 14

---

## Dev 4: Integration & Demo Lead

**Focus**: Wire Everything + Demo Preparation
**Timeline**: Hours 8-24

### Phase 1: Integration (Hours 8-16)

- [x] 4.1 Connect frontend to backend API
- [x] 4.2 Test complete order flow end-to-end
- [x] 4.3 Fix integration issues

### Phase 2: Demo Prep (Hours 16-24)

- [x] 4.4 Create demo script with exact clicks/flow
- [x] 4.5 Record backup demo video
- [x] 4.6 Prepare 3-minute pitch presentation

**Critical Output**: Working demo by Hour 20

---

## 🚨 Critical Sync Points

### Hour 4 Checkpoint

- Dev 1: Contract structure defined
- Dev 2: Server running
- Dev 3: UI framework ready
- **Sync**: Agree on data models

### Hour 8 Checkpoint

- Dev 2: API available for frontend
- Dev 3: Can start API integration
- Dev 4: Joins team
- **Sync**: API contract confirmed

### Hour 12 Checkpoint

- Dev 1: Contract deployed
- **Sync**: Share contract address

### Hour 16 Checkpoint

- All core features complete
- Dev 4: Begin integration
- **Sync**: Feature freeze

### Hour 20 Checkpoint

- Demo must work
- **Sync**: Demo run-through

### Hour 22 Checkpoint

- Presentation ready
- Backup video recorded
- **Final sync**: Demo practice

---

## 🎯 Definition of Done (Hour 24)

### Must Have (Priority 1)

✅ Smart contract deployed on Midnight testnet
✅ One complete flow: Create → Approve → Deliver → Pay
✅ ZK proof hides price from buyer
✅ UI shows different views for each role
✅ 3-minute presentation ready

### Should Have (Priority 2)

✅ Beautiful animations and transitions
✅ Real-time WebSocket updates
✅ Map visualization for delivery
✅ Backup demo video recorded

### Nice to Have (Priority 3)

✅ Multiple orders in parallel
✅ Error handling
✅ Loading states
✅ Sound effects

---

## 💡 Shortcuts We're Taking

1. **Hardcoded Users**: No login, just role switcher
2. **Fake GPS**: Oracle moves shipment automatically
3. **One Contract**: No templates or variations
4. **In-Memory Data**: Refreshing page loses state (fine for demo)
5. **Simple Approval**: Instant, no multi-sig complexity
6. **Mock Payment**: Show transfer, don't need real tokens
7. **No Tests**: Focus on working demo only

---

## 🏁 Final Hour Checklist

- [x] Demo works end-to-end
- [x] Presentation deck complete
- [x] Backup video recorded
- [x] Contract address documented
- [x] Team knows demo script
- [x] Laptop charged
- [x] Backup laptop ready
- [x] Local version available offline
