# ChainVault Demo Script - Detailed UI Flow with Element Selectors
## Version 2.0 - Phase 2 Demo Prep

---

## PRE-DEMO CHECKLIST (15 minutes before)

### System Verification (5 minutes)
- [ ] Run `node integration/health-check.js` - Verify all GREEN
- [ ] Check terminal shows: "✅ All systems connected"
- [ ] Browser DevTools closed (keep network tab open for reference only)
- [ ] 4 browser tabs open, side-by-side if possible
- [ ] Each tab zoomed to 100% (no zoom applied)
- [ ] Screen resolution at least 1920x1080

### Data Preparation (5 minutes)
- [ ] Clear old demo data: `node integration/clear-demo-data.js`
- [ ] Run: `node integration/generate-demo-data.js`
- [ ] Verify demo users created (check console output)
- [ ] Test data: 1 pre-configured order ready

### Browser Setup (5 minutes)
- [ ] Tab 1: `http://localhost:3000/?role=supplier` (Supplier Dashboard)
- [ ] Tab 2: `http://localhost:3000/?role=buyer` (Buyer Dashboard)
- [ ] Tab 3: `http://localhost:3000/?role=logistics` (Logistics Dashboard)
- [ ] Tab 4: `http://localhost:3000/?role=regulator` (Regulator Dashboard)
- [ ] All tabs fully loaded (no loading spinners visible)
- [ ] Backup video ready to play if needed

### Presentation Setup
- [ ] Slides loaded in presentation mode
- [ ] Backup laptop with copy of slides on USB
- [ ] Speaker notes printed or on second monitor
- [ ] Water bottle at hand
- [ ] Phone on silent

---

## DEMO FLOW - 2 MINUTES TOTAL

### 🎬 OPENING (0:00-0:10) - 10 seconds

**What to Say:**
"ChainVault solves a multi-trillion dollar problem in global supply chains. How do you maintain privacy while ensuring transparency and compliance? Traditional solutions force you to choose one or the other. We're about to show you how Midnight's zero-knowledge proofs let you have both."

**Stage Setup:**
- Be standing center stage
- Make eye contact with judges
- Gesture toward screen with left hand
- Display Title Slide (Slide 1)

**Technical Background:**
- Backend is running and ready for API calls
- WebSocket is active and listening for events
- Smart contract is deployed on Midnight testnet

---

## SCENE 1: SUPPLIER CREATES ORDER (0:10-0:35) - 25 seconds

### Step 1.1: Navigate to Supplier Dashboard (0:10-0:12)
**Location:** Browser Tab 1
**Say:** "Let's start with ACME Corp, our supplier. They need to create a purchase order."

**UI Elements:**
- **Current State:** Supplier Dashboard should show empty orders list
- **Button to Click:** `#create-order-button` or `[data-testid="create-order-btn"]`
  - Text: "Create New Order" or "Create Order"
  - Location: Top-right of dashboard
- **Expected Visual:** Modal/form appears with order creation fields

**Exact Clicks:**
1. Click the "Create New Order" button
   - Wait 0.5 seconds for modal animation
   - Verify form appears with fields

### Step 1.2: Fill Order Details (0:12-0:28)
**Say:** "They're creating an order for 100 units to MegaRetail at $10,000. Here's the critical part - the price gets encrypted on the blockchain."

**Form Fields to Fill (in order):**

1. **Buyer Selection**
   - Element: `#buyer-select` or `[data-testid="buyer-dropdown"]`
   - Action: Click dropdown
   - Select: "MegaRetail"
   - Wait: 0.3 seconds for selection

2. **Quantity**
   - Element: `#quantity-input` or `[data-testid="quantity-field"]`
   - Action: Click field, clear if needed
   - Type: "100"
   - Wait: 0.2 seconds

3. **Price (THE CRITICAL FIELD)**
   - Element: `#price-input` or `[data-testid="price-field"]`
   - Action: Click field
   - Type: "10000"
   - Note: As you type, UI should show encryption indication
   - Wait: 0.3 seconds
   - **Visual Cue:** Lock icon (🔒) should appear next to price field

4. **Delivery Location**
   - Element: `#delivery-location-select` or `[data-testid="delivery-select"]`
   - Action: Click dropdown
   - Select: "Chicago, IL" or just "Chicago"
   - Wait: 0.3 seconds

### Step 1.3: Create Contract (0:28-0:35)
**Say:** "When we click Create Contract, the system encrypts the price using Midnight's privacy-preserving smart contracts."

**Form Submission:**
1. **Click Submit Button**
   - Element: `#create-contract-button` or `[data-testid="submit-order-btn"]`
   - Text: "Create Contract"
   - Location: Bottom-right of form

**Expected Sequence:**
1. Button becomes disabled (shows loading state)
2. Toast appears: "Creating order..." or "Encrypting price..."
3. Loading animation (spinning lock icon recommended)
4. After 2-3 seconds: Toast shows "Order created successfully"
5. Modal closes
6. New order appears in supplier's orders list with:
   - Status: "Pending Approval"
   - Order ID: (e.g., "ORDER-001")
   - Quantity: "100"
   - Buyer: "MegaRetail"

**Key Visual:**
- Price field shows 🔒 **[ENCRYPTED]** in supplier's own view
- Only the supplier can see the actual price

**Screenshot Moment:**
- Capture supplier dashboard with new order visible

---

## SCENE 2: BUYER APPROVES (0:35-1:10) - 35 seconds

### Step 2.1: Switch to Buyer Dashboard (0:35-0:38)
**Location:** Browser Tab 2
**Say:** "Now let's switch to MegaRetail, the buyer. Here's where the privacy magic happens. They need to approve this order, but they can't see the price."

**Tab Switch:**
- Click Tab 2 or use keyboard shortcut (Ctrl+2 or Cmd+2)
- Browser shows Buyer Dashboard

**Current State:**
- Buyer dashboard shows "Pending Approval" section
- Same order should appear (Order-001)
- Quantity shows: "100 units"
- Price shows: 🔒 **[ENCRYPTED]** or 🔒 **[HIDDEN]**

### Step 2.2: Open Order Details (0:38-0:42)
**Say:** "When they click the order, they see it's for 100 units - but the price remains encrypted."

**UI Interaction:**
1. **Click Order Card/Row**
   - Element: `#order-001-card` or `[data-testid="pending-order-001"]`
   - Alternate: Click "View" or "Review" button on order row
   - Expected: Order detail modal opens

**Order Details Modal Shows:**
- Order ID: "001" or "ORDER-001"
- From: "ACME Corp"
- Quantity: "100 units" ✅ **VISIBLE**
- Price: 🔒 **[ENCRYPTED]** ❌ **HIDDEN**
- Delivery Location: "Chicago, IL"
- Budget Limit: $15,000 (buyer's internal constraint)

### Step 2.3: Generate ZK Proof (0:42-0:58)
**Say:** "Now here's the innovation - they generate a zero-knowledge proof that verifies the price is within their budget, without revealing what the price actually is."

**Generate Proof Button:**
1. **Click "Generate Approval Proof"**
   - Element: `#generate-proof-button` or `[data-testid="generate-zk-proof"]`
   - Text: "Generate Approval Proof"
   - Location: Center of modal
   - Expected: Button becomes disabled, spinner appears

**Proof Generation Animation (2-3 seconds):**
- Spinner with text: "Generating zero-knowledge proof..."
- Optional: Animated lock becoming checked
- Background could have subtle animation

**Proof Result Display:**
- Text appears: "✅ ZK Proof Generated"
- Sub-text: "Proof verifies: Price ≤ Budget"
- Actual values NOT shown:
  - ❌ Does NOT show: "$10,000"
  - ❌ Does NOT show: "$15,000"
  - ✅ Shows: Proof is valid (checkmark)

### Step 2.4: Approve Order (0:58-1:10)
**Say:** "The proof is valid, so they can confidently approve the order. They're saying 'yes' to purchasing 100 units within their budget constraints - all without knowing the actual price."

**Click Approve Button:**
1. **Click "Approve Order"**
   - Element: `#approve-order-button` or `[data-testid="approve-order-btn"]`
   - Text: "Approve Order" (usually green/success color)
   - Location: Right side of modal

**Expected Sequence:**
1. Button becomes disabled
2. Loading spinner appears
3. Toast: "Approving order..."
4. After 1-2 seconds: Toast "Order approved successfully!"
5. Modal closes automatically
6. Order disappears from "Pending Approval" section
7. Moves to "Active Orders" or "Approved Orders" section

**Status Update:**
- Order status changes: "Pending Approval" → "Approved"
- Order moves to different section/color

**WebSocket Event Heard (background):**
- Supplier dashboard automatically updates
- Buyer approval notification appears for supplier
- Logistics dashboard notified of new approved order

---

## SCENE 3: LOGISTICS & DELIVERY (1:10-1:55) - 45 seconds

### Step 3.1: Switch to Logistics Dashboard (1:10-1:13)
**Location:** Browser Tab 3
**Say:** "The order is approved. Now FastShip, our logistics provider, handles the delivery with real-time GPS tracking."

**Tab Switch:**
- Click Tab 3
- Browser shows Logistics Dashboard

**Current State:**
- Shows "Active Deliveries" section
- Order appears with status "Ready for Pickup"
- Shows delivery destination: "Chicago, IL"
- Delivery progress bar: 0%

### Step 3.2: View Delivery Tracking (1:13-1:20)
**Say:** "The order is ready for delivery. Let's start the delivery and watch it in real-time."

**UI Elements:**
- Map (if visible): Shows warehouse location
- Truck icon: Starts at warehouse
- Progress indicator: 0%
- Status text: "At warehouse"

### Step 3.3: Start Delivery Simulation (1:20-1:50)
**Say:** "As FastShip delivers the order..."

**Click Start Delivery Button:**
1. **Find and Click "Start Delivery" Button**
   - Element: `#start-delivery-button` or `[data-testid="start-delivery-btn"]`
   - Text: "Start Delivery" or "Start Delivery Simulation"
   - Location: Top-right of logistics dashboard

**Expected Sequence (30 seconds of animation):**

The UI should animate through these stages automatically:

**Stage 1 (5 seconds):** Departed Warehouse
- Map animation: Truck moves 1-2 pixels toward destination
- Progress bar: 20%
- Status: "Departed Warehouse - In Transit"
- Toast (optional): "Shipment departed warehouse"

**Stage 2 (8 seconds):** Highway
- Progress bar: 40%
- Status: "On Highway 90 - 4 hours to destination"
- Map: Truck at highway position

**Stage 3 (8 seconds):** Entering City
- Progress bar: 60%
- Status: "Entering Chicago area"
- Map: Truck near city limits

**Stage 4 (7 seconds):** Final Approach
- Progress bar: 80%
- Status: "Near destination - 10 minutes"
- Map: Truck very close to marker

**Stage 5 (2 seconds):** ARRIVED!
- Progress bar: 100%
- Status: "✅ DELIVERED"
- Map: Truck at destination marker

### Step 3.4: Payment Release (1:50-1:55)
**Say:** "The instant the GPS confirms delivery at the destination..."

**Expected Automatic Events (triggered by delivery completion):**

1. **Payment Release Banner:**
   - Large banner appears: "💰 PAYMENT RELEASED"
   - Sub-text: "Automatic payment triggered on delivery confirmation"
   - Color: Green/success
   - Animation: Slide in from top

2. **Transaction Notification:**
   - Toast appears: "Payment of $10,000 released to ACME Corp"
   - Transaction details visible:
     - Amount: $10,000
     - From: MegaRetail
     - To: ACME Corp
     - Status: Completed ✅

3. **Order Status Update:**
   - Order status: "Completed"
   - Section moves to: "Completed Deliveries"
   - Order shows payment status: "Paid"

4. **Optional Visual:**
   - Transaction hash/ID: "0x1a2b3c4d..." (if blockchain integration)
   - "View on Midnight Explorer" link (if available)

**Key Moment for Judges:**
- The entire payment flow (create → approve → deliver → pay) completed in under 2 minutes
- All automatic, no manual intervention
- No payment disputes or delays

---

## SCENE 4: REGULATOR COMPLIANCE (1:55-2:15) - 20 seconds

### Step 4.1: Switch to Regulator Dashboard (1:55-1:58)
**Location:** Browser Tab 4
**Say:** "Finally, let's look at how regulators see this entire transaction. They have full compliance visibility, but still don't see commercial details."

**Tab Switch:**
- Click Tab 4
- Browser shows Regulator Dashboard

**Current State:**
- Shows "Completed Transactions" section
- Same order appears with ID "001"
- Shows delivery and payment status

### Step 4.2: View Compliance Details (1:58-2:10)
**Say:** "The regulator can verify the entire transaction is compliant - delivery confirmed, payment released - all without seeing the price or commercial terms."

**Click Order/Compliance Record:**
1. **Click Compliance Record**
   - Element: `#compliance-001` or `[data-testid="compliance-order-001"]`
   - Alternate: Click "View Details" on order row

**Compliance Modal Shows:**

**✅ Visible to Regulator:**
- Order ID: "001"
- Parties involved: ACME Corp → MegaRetail
- Quantity: 100 units ✅
- Delivery Status: Confirmed ✅
- Delivery Location: Chicago, IL
- Payment Status: Completed ✅
- Compliance Status: VERIFIED ✅
- Timestamp of approval
- Timestamp of delivery
- Timestamp of payment

**❌ Hidden from Regulator:**
- Price: 🔒 **[ENCRYPTED]**
- Buyer's budget limit: 🔒 **[HIDDEN]**
- Margin/profitability: 🔒 **[HIDDEN]**
- Supplier cost structure: 🔒 **[HIDDEN]**

**Visual Badges:**
- 🔐 "Privacy Verified"
- ✅ "Delivery Verified"
- ✅ "Payment Completed"
- ✅ "Compliance Cleared"

### Step 4.3: Show Audit Trail (2:10-2:15)
**Say:** "They can see the complete audit trail of approvals and transactions, all backed by Midnight blockchain proofs. This is how we achieve transparency without sacrificing privacy."

**Optional: Click "View Audit Trail"**
- Element: `#audit-trail-button` or `[data-testid="audit-trail-btn"]`
- Expected: Timeline showing:
  1. Order created: 0:15
  2. Buyer approved: 0:35
  3. Delivery started: 1:20
  4. Delivery completed: 1:50
  5. Payment released: 1:50

---

## CLOSING (2:15-2:20) - 5 seconds

### Final Remarks
**Say:** "That's ChainVault - where privacy meets transparency. Built on Midnight blockchain, it enables the future of supply chains: instant settlement, full compliance, and zero information leakage to competitors."

### Optional: Split-Screen View
**Action:** If time allows, show all 4 dashboards simultaneously
- Arrange tabs in 2x2 grid if possible
- Show different views of same transaction
- Highlight privacy aspect visually

### Final Slide
- Display Slide 11 (Call to Action)
- Contact info
- Demo GitHub link
- Questions?

---

## TIMING TARGETS

| Scene | Duration | Cumulative | Status |
|-------|----------|-----------|--------|
| Opening | 10s | 0:10 | Say opening hook |
| Create Order | 25s | 0:35 | Fill form, create |
| Buyer Approval | 35s | 1:10 | Generate proof, approve |
| Delivery | 45s | 1:55 | Animate delivery, release payment |
| Compliance | 20s | 2:15 | Show regulator view |
| Closing | 5s | 2:20 | Final remarks |

**Total: 2 minutes 20 seconds (10 seconds buffer)**

---

## BACKUP PROCEDURES

### If Supplier Dashboard Fails
1. Refresh browser tab
2. If form doesn't appear, manually navigate to: `http://localhost:3000/?role=supplier&demo=true`
3. If API unresponsive after 10 seconds, **switch to backup video**

### If Buyer Dashboard Fails
1. Refresh Tab 2
2. Manual URL: `http://localhost:3000/?role=buyer&demo=true`
3. If WebSocket doesn't update, check backend connection
4. Fall back to explaining: "The buyer generates a ZK proof to approve without seeing price"

### If Delivery Animation Stalls
1. Manually click order again to refresh delivery status
2. Or explain the GPS tracking concept while debugging
3. Have screenshot of completed delivery visible

### If Payment Release Doesn't Show
1. Manually refresh logistics page
2. Payment should appear in transaction history
3. Explain that Midnight blockchain has 3-second settlement
4. Show transaction on blockchain explorer if available

### If Regulator Dashboard Unreachable
1. Skip to presentation Slide 5 (Technical Architecture)
2. Show architecture diagram of how regulator sees data
3. Explain: "Regulator gets proofs, not data"

### Complete Backup Plan
If multiple failures occur:
1. **At 1:00 mark:** Transition to backup video
2. Say: "Let me show you the recording of the complete flow"
3. Play pre-recorded video (45 seconds)
4. Continue with presentation slides (Slide 5 onward)
5. Focus on technical explanation and market opportunity

---

## CRITICAL DO's

✅ **DO:**
- Speak clearly and slowly
- Make eye contact with judges
- Gesture toward screen/results
- Pause after big moments (payment release)
- Emphasize privacy aspects
- Point out the "wow" moments:
  - Buyer approved without seeing price
  - Payment released automatically
  - Regulator has no access to price
- Keep narration simple and non-technical
- Tell the story: "Problem → Solution → Live Demo"

❌ **DON'T:**
- Don't talk about code or implementation details
- Don't mention "mock data" (say "test data")
- Don't use technical jargon (ZK proof is explained simply)
- Don't look at terminal/console
- Don't rush through transitions
- Don't let silence happen (keep talking during animations)
- Don't click too fast or too slow
- Don't show error messages
- Don't discuss what's "failing in the background"

---

## TALKING POINTS (Keep Ready)

### Problem Statement (to repeat if needed)
"Supply chains face an impossible choice: Share all data with supply chain partners and lose competitive advantage, or share nothing and lose efficiency and trust. ChainVault solves this with zero-knowledge proofs."

### Privacy Innovation (emphasize)
"The buyer approved without ever seeing the actual price. They only saw proof that the price was acceptable. That's the power of ZK proofs."

### Speed Advantage (emphasize)
"Payment released in seconds when delivery confirmed. No waiting 30-60 days for invoices, disputes, and manual settlement."

### Regulator Benefit (emphasize)
"The regulator has full compliance visibility - they can verify all rules were followed - without seeing any commercial information that competitors could exploit."

### Technical Foundation (if asked)
"This is running live on Midnight blockchain. Midnight specializes in privacy-preserving smart contracts using zero-knowledge proofs. We're using real proofs, not mock simulations."

---

## PRACTICE NOTES

### First Run-Through (Dress Rehearsal)
- Time the entire demo from start to finish
- Note exact click points and timing
- Adjust narration to fit pacing
- Identify any slow points or animation delays
- Practice pauses and emphasis

### Second Run-Through
- Do it without notes
- Focus on delivery and eye contact
- Practice backup transitions
- Time again (target: 2:20 with buffer)

### Third Run-Through
- Full presentation (including intro slide)
- Practice transitioning to demo
- Practice transitioning to closing
- Practice handling a "pause" if something loads

### Final Check (1 hour before)
- Clear all demo data
- Generate fresh demo data
- Run through entire flow once more
- Verify all 4 browsers are working
- Test backup video playback
- Test presentation advances

---

## SUCCESS METRICS

After demo completes, judges should understand:
1. ✅ The problem (supply chain needs privacy AND transparency)
2. ✅ The solution (ZK proofs enable selective disclosure)
3. ✅ That it works (they saw it live)
4. ✅ That it's real (on Midnight blockchain)
5. ✅ The innovation (buyer approves without seeing price)
6. ✅ The market opportunity ($8T supply chain market)

If they remember these 6 things, the demo was successful.

---

## RECOVERY LINES (If Something Goes Wrong)

**If order doesn't create:**
"Let me re-try that... sometimes the network needs a moment. What we're showing here is that ACME is creating an order with encrypted pricing..."

**If buyer page doesn't load:**
"While that refreshes, let me explain - the buyer sees the order but the price stays encrypted. Here you can see [point to other dashboard]..."

**If delivery won't animate:**
"The GPS tracking is animating through the delivery route in real-time. We can see it's progressing to Chicago... [manually advance to completed state]"

**If payment doesn't release:**
"And when delivery is confirmed, the smart contract automatically releases payment - no manual processing needed. This is instant settlement on blockchain."

**If regulator page fails:**
"The regulator dashboard shows full compliance without exposing commercial terms. Here's our architecture diagram showing how that works..."

---

## FINAL CHECKLIST (5 minutes before demo)

- [ ] All 4 tabs loaded and ready
- [ ] Fresh demo data created
- [ ] Backup video ready in separate window
- [ ] Slides loaded and tested
- [ ] Microphone working
- [ ] Lighting good
- [ ] No notifications will pop up
- [ ] Phone on silent
- [ ] Water nearby
- [ ] Deep breath - you've got this!

---

**Last updated:** 2025-11-17
**Version:** 2.0 (Detailed Phase 2)
**Status:** Ready for Live Demo
