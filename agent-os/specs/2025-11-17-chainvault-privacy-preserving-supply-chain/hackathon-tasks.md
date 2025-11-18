# ChainVault Hackathon Tasks - 24 Hour Sprint

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

- [ ] Demo works end-to-end
- [ ] Presentation deck complete
- [ ] Backup video recorded
- [ ] Contract address documented
- [ ] Team knows demo script
- [ ] Laptop charged
- [ ] Backup laptop ready
- [ ] Local version available offline
