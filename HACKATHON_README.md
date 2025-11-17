# 🏁 ChainVault - Midnight Summit Hackathon

## ⚡ Quick Start (24 Hour Build)

### What We're Building
A privacy-preserving supply chain demo where buyers can verify deliveries and trigger payments WITHOUT seeing supplier pricing - powered by Midnight's zero-knowledge proofs.

### The Demo Flow
1. **Supplier** creates order: 100 units @ $10,000 (price hidden)
2. **Buyer** approves: Sees "100 units" only via ZK proof
3. **Oracle** triggers: GPS delivery confirmation
4. **Payment** releases: Instant, automatic settlement
5. **Regulator** verifies: Compliance without seeing commercial details

---

## 👥 Team Assignments

| Developer | Focus | Hours | Key Deliverables |
|-----------|--------|--------|------------------|
| **Dev 1** | Blockchain & ZK | 0-20 | Deploy contract, implement proofs |
| **Dev 2** | Backend & Oracle | 0-16 | Express API, mock GPS oracle |
| **Dev 3** | Frontend UI | 0-20 | 4-role dashboard, animations |
| **Dev 4** | Integration & Demo | 8-24 | Wire everything, prep presentation |

---

## 📁 Key Files

### Hackathon-Specific Docs
- `agent-os/specs/*/hackathon-spec.md` - Simplified 24-hour specification
- `agent-os/specs/*/hackathon-tasks.md` - 20 focused tasks (down from 46)
- `agent-os/product/hackathon-mission.md` - Demo-focused mission

### Original Docs (For Reference)
- `agent-os/specs/*/spec.md` - Full specification (post-hackathon)
- `agent-os/specs/*/tasks.md` - Complete 46 tasks
- `agent-os/product/mission.md` - Full product vision

---

## 🚀 Quick Commands

```bash
# Dev 1: Blockchain
cd blockchain/
npm run deploy:midnight

# Dev 2: Backend
cd backend/
npm run dev  # Runs on :3001

# Dev 3: Frontend
cd frontend/
npm run dev  # Runs on :3000

# Dev 4: Integration
npm run demo:test
```

---

## ⏱️ Critical Checkpoints

| Hour | Checkpoint | Must Be Done |
|------|------------|--------------|
| 4 | Foundation | Contract structure, server running, UI framework |
| 8 | API Ready | Backend available for frontend |
| 12 | Contract Deployed | Share address with team |
| 16 | Feature Complete | All individual parts working |
| 20 | Demo Works | End-to-end flow successful |
| 22 | Presentation | Deck ready, video recorded |

---

## 🎯 Definition of "Done" (Hour 24)

### ✅ Must Have
- [ ] Contract on Midnight testnet
- [ ] One complete flow working
- [ ] ZK proof hides pricing
- [ ] 4 different role views
- [ ] 3-minute pitch ready

### 🎨 Should Have
- [ ] Beautiful animations
- [ ] Real-time updates
- [ ] Map visualization
- [ ] Backup demo video

### 🌟 Nice to Have
- [ ] Multiple orders
- [ ] Error handling
- [ ] Sound effects

---

## 🔥 Demo Script

### Setup (30 sec)
"Supply chains run on trust, but trust requires transparency. Yet businesses need privacy to compete. Today's solutions force you to choose. ChainVault gives you both."

### Demo (90 sec)
1. **Create**: "ACME creates a $10,000 order for MegaRetail..."
2. **Approve**: "MegaRetail sees quantity but NOT the price..."
3. **Deliver**: "FastShip's GPS triggers delivery confirmation..."
4. **Pay**: "Payment releases instantly and automatically..."
5. **Comply**: "Regulators verify without seeing sensitive data..."

### Close (30 sec)
"ChainVault transforms supply chains from slow, manual, and exposed to instant, automatic, and private. Built on Midnight, it's not just a demo - it's the future of B2B commerce."

---

## 💡 Simplifications for Speed

| Full Version | Hackathon Version |
|--------------|-------------------|
| PostgreSQL + Redis | In-memory objects |
| Auth system | Hardcoded 4 users |
| 4 contract types | 1 unified contract |
| Real oracles | Mock GPS progression |
| Test coverage | No tests (demo only) |
| Mobile responsive | Desktop only |

---

## 🚨 If Things Go Wrong

### Contract Won't Deploy?
- Use local Midnight simulation
- Focus on ZK proof visualization

### Integration Breaking?
- Each component can demo standalone
- Pre-record individual sections

### Running Out of Time?
- Priority: One flow working > Multiple features
- Cut: Multiple orders, fancy animations

### Demo Day Issues?
- Have video backup ready
- Run local version offline
- Use slides to explain

---

## 📞 War Room Contacts

- **Midnight Support**: [Discord/Slack channel]
- **Team Chat**: #chainvault-hackathon
- **Shared Drive**: [Link to assets]
- **Demo URL**: http://localhost:3000

---

## 🏆 Remember

1. **Visual Impact > Perfect Code** - Judges see the UI, not the codebase
2. **One Great Demo > Many Features** - Better to nail one flow than half-build five
3. **Story Matters** - Make them feel the problem and see the solution
4. **Midnight's Magic** - Emphasize what ONLY Midnight can do
5. **Have Fun** - Energy and enthusiasm are contagious

---

**LET'S SHIP IT!** 🚀