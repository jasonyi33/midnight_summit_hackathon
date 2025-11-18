# ChainVault Frontend Revamp Plan

## ✅ Completed
1. **Design System** - Midnight-inspired dark theme with comprehensive CSS
2. **Main Layout** - Modern header with glass morphism, cyber grid background, footer

## 🚧 In Progress - Continue Here

### Priority 1: Redesign Role Switcher
**File**: `frontend/components/RoleSwitcher.tsx`
**Current**: Basic switcher
**Target**: Modern pill selector with animations, icons, hover effects
**Features**:
- Glass morphism background
- Smooth role transition animations
- Icon for each role (TrendingUp, Shield, Activity, Lock)
- Hover glow effects
- Active state with gradient border

### Priority 2: Redesign Supplier Dashboard
**File**: `frontend/components/dashboards/SupplierDashboard.tsx`
**Current**: Basic form and table
**Target**: Advanced dashboard with data visualizations
**Features**:
- Modern card layout with hover effects
- Real-time stats with animated counters
- Create order form with better UX
- Order list with status timeline
- Revenue chart using mini bar chart
- Blockchain transaction indicators
- ZK proof badges

### Priority 3: Redesign Buyer Dashboard
**File**: `frontend/components/dashboards/BuyerDashboard.tsx`
**Features**:
- ZK proof generator with animated visualization
- Approval workflow with status indicators
- Price privacy indicators (encrypted/hidden)
- Advanced order cards with expandable details
- Blockchain verification status

### Priority 4: Redesign Logistics Dashboard
**File**: `frontend/components/dashboards/LogisticsDashboard.tsx`
**Features**:
- Enhanced delivery map with real-time tracking
- GPS route visualization
- Progress indicators (0-100%)
- ETA calculations
- Delivery confirmation with photo/signature UI
- Real-time location updates via WebSocket

### Priority 5: Redesign Regulator Dashboard
**File**: `frontend/components/dashboards/RegulatorDashboard.tsx`
**Features**:
- Compliance monitoring panel
- All transactions view with filters
- ZK proof verification status
- Audit trail timeline
- Export functionality UI
- Analytics and charts

### Priority 6: Enhanced Components

**DeliveryMap.tsx**
- Better map styling (dark mode)
- Animated route lines
- Pulsing markers
- Real-time position updates
- Interactive popups

**ZKProofGenerator.tsx**
- Advanced proof visualization
- Circuit diagram animation
- Proof generation progress
- Verification status indicator
- Copy proof hash functionality

**PrivacyBadge.tsx**
- Multiple badge styles
- Tooltip with privacy details
- Animated lock icon
- Different states (encrypted, verified, hidden)

### Priority 7: New Advanced Components

**BlockchainTransactionHistory.tsx** - NEW
- Transaction list with blockchain data
- TX hash with copy button
- Block number, timestamp
- Transaction type (create, approve, deliver, pay)
- Status badges
- Link to block explorer (mock)

**LiveActivityFeed.tsx** - NEW
- Real-time feed of all activities
- WebSocket connected
- Event types with icons
- Timestamp relative (2 min ago)
- Filter by event type
- Fade-in animations for new items

**AnalyticsDashboard.tsx** - NEW (for each role)
- Charts using simple CSS/divs (no library needed):
  - Bar charts for orders over time
  - Donut chart for status distribution
  - Line chart for revenue trends
- Animated number counters
- Percentage changes with arrows

**StatusTimeline.tsx** - NEW
- Vertical timeline for order status
- Each step with icon, time, user
- Completed steps in green
- Current step pulsing
- Future steps grayed out
- Blockchain TX hash at each step

### Priority 8: WebSocket Integration
**File**: Create `frontend/lib/websocket.ts`
**Features**:
- Connect to backend WebSocket
- Listen for events:
  - contract_update
  - contract_approved
  - gps_update
  - delivery_confirmed
  - payment_released
- Update UI in real-time
- Reconnection logic
- Toast notifications for events

### Priority 9: Animation Enhancements
**Add to components**:
- Framer Motion for page transitions
- Stagger animations for lists
- Hover scale/glow effects
- Number counting animations
- Progress bar animations
- Skeleton loaders
- Success/error animations

### Priority 10: Polish & Testing
- Ensure all backend integration works
- Test WebSocket connection
- Responsive design check
- Performance optimization
- Add loading states
- Error handling UI
- Empty states

## Design Principles to Follow

1. **Dark First**: Always use dark background with light text
2. **Glass Morphism**: Use `glass` and `glass-strong` classes
3. **Gradients**: Use predefined gradients for accents
4. **Animations**: Everything should have smooth transitions
5. **Cyber Aesthetic**: Use cyber-grid, scanlines, neon effects
6. **Typography**: Use font-mono for technical data, font-sans for UI
7. **Status Colors**: Consistent color coding (blue=active, green=success, yellow=pending, purple=delivered)
8. **Icons**: Use lucide-react icons throughout
9. **Spacing**: Generous padding/margins for modern feel
10. **Hover States**: Everything interactive should have hover feedback

## Color Usage Guide

```css
--accent-primary: #3B82F6  /* Blue - Active, In Transit */
--accent-success: #10B981  /* Green - Approved, Paid */
--accent-warning: #F59E0B  /* Yellow - Pending */
--accent-danger: #EF4444   /* Red - Errors */
--accent-purple: #A78BFA   /* Purple - Delivered, Privacy */

Backgrounds:
--bg-primary: #0A0B0E     /* Main background */
--bg-secondary: #111318   /* Cards */
--bg-tertiary: #1A1C23    /* Elevated cards */
--bg-elevated: #1F2937    /* Hover states */

Text:
--text-primary: #F9FAFB   /* Main text */
--text-secondary: #D1D5DB /* Labels */
--text-tertiary: #9CA3AF  /* Muted text */
```

## Component Examples to Reference

Look at the new `page.tsx` for examples of:
- StatBadge component pattern
- DashboardBanner component pattern
- Glass morphism usage
- Animation classes
- Layout structure

## Backend API Endpoints

```typescript
GET  /api/contracts        - List all contracts
POST /api/contracts        - Create contract
GET  /api/contracts/:id    - Get single contract
POST /api/contracts/:id/approve  - Approve with ZK proof
POST /api/contracts/:id/deliver  - Confirm delivery
POST /api/contracts/:id/pay      - Release payment
GET  /api/users            - List users
GET  /api/events           - Get events
GET  /api/stats            - Get statistics
GET  /health               - Health check
```

## WebSocket Events

```typescript
// Events to listen for:
- connection: { message: string }
- contract_update: { contract: Contract, action: string }
- contract_approved: { contractId: string, zkProof: string }
- gps_update: { contractId: string, location: {lat, lng}, progress: number }
- delivery_confirmed: { contractId: string, location: {lat, lng} }
- payment_released: { contractId: string, amount: number }
- event_created: { event: Event }
```

## Next Steps

1. Start with RoleSwitcher (quick win, visible immediately)
2. Then Supplier Dashboard (most complex, sets pattern)
3. Then other dashboards following the pattern
4. Add WebSocket integration
5. Create new advanced components
6. Polish and test
7. Document any issues

## Notes

- Keep all components modular and reusable
- Use TypeScript types from `lib/types.ts`
- Follow naming conventions (PascalCase for components)
- Add comments for complex logic
- Test with backend running on localhost:3001
- Commit frequently with clear messages
