# Specification: ChainVault Privacy-Preserving Supply Chain

## Goal
Build a privacy-preserving supply chain contract automation system on Midnight blockchain that enables automatic contract evaluation and execution while keeping sensitive business data private through zero-knowledge proofs and selective disclosure.

## User Stories
- As a **supplier**, I want to create purchase orders with automated payment triggers so that I get paid immediately when delivery conditions are met
- As a **buyer**, I want to verify quality and delivery compliance without exposing my pricing agreements so that I maintain competitive advantage
- As a **logistics provider**, I want to confirm deliveries and trigger contract milestones so that the supply chain flows smoothly
- As a **compliance officer**, I want to verify regulatory compliance without accessing sensitive business data so that I can ensure proper governance
- As a **contract approver**, I want to review and approve contracts in sequence so that proper authorization is maintained

## Core Requirements
- Create and manage four essential contract types: purchase orders, shipping confirmations, quality verification, and payment releases
- Process all sensitive contract data locally on user devices with client-side ZK proof generation
- Submit only zero-knowledge proofs to Midnight blockchain for immutable verification
- Simulate IoT sensor data (temperature, GPS, quality metrics) through mock oracles
- Enable three distinct user roles with specific permissions and workflows
- Support sequential approval workflows (supplier → buyer → logistics)
- Automatically evaluate contract conditions based on mock supply chain events
- Trigger self-executing payments when all conditions are satisfied
- Generate compliance verification proofs without revealing private contract terms

## Visual Design
No mockups provided - design will follow standard enterprise dashboard patterns with:
- Clean, data-focused interface optimized for 1920x1080 desktop resolution
- Contract management dashboard with status overview
- Contract creation forms with multi-step wizards
- Approval queue interface for pending contracts
- Event monitoring panel for oracle data streams
- Compliance verification interface with proof generation

## Reusable Components
### Existing Code to Leverage
- No existing codebase - this is a greenfield project
- Will establish foundational patterns for future features

### New Components Required
- **Smart Contract Engine**: Core Compact contracts for Midnight blockchain
- **ZK Proof Generator**: Client-side proof generation library
- **Mock Oracle Service**: Simulated IoT/GPS data pipeline
- **Contract Manager UI**: React components for contract lifecycle
- **Approval Workflow Engine**: Sequential approval state machine
- **Payment Trigger Service**: Automated payment execution logic
- **Compliance Verifier**: Proof generation and verification interface
- **Role-Based Access Control**: Authentication and authorization system

## Technical Architecture

### System Components
1. **Frontend Application** (Next.js 14 with App Router)
   - Desktop-only interface using React and Tailwind CSS
   - Local contract data processing and storage
   - Client-side ZK proof generation
   - JWT-based authentication

2. **Backend Services** (Node.js/TypeScript)
   - REST API for contract management
   - Mock oracle data generation service
   - Sequential workflow orchestration
   - Role-based access control

3. **Blockchain Layer** (Midnight)
   - Compact smart contracts for contract logic
   - ZK proof verification
   - Immutable contract state storage
   - Event emission for contract updates

4. **Data Storage**
   - PostgreSQL for off-chain metadata
   - Redis for session management and caching
   - Local browser storage for sensitive data

### Data Models

```typescript
// Core entities (conceptual structure)
Contract {
  id: string
  type: 'purchase_order' | 'shipping' | 'quality' | 'payment'
  status: 'draft' | 'pending_approval' | 'active' | 'completed'
  parties: Party[]
  conditions: Condition[]
  proofHashes: string[]
  createdBy: string
  approvalChain: Approval[]
}

Party {
  id: string
  role: 'supplier' | 'buyer' | 'logistics'
  publicKey: string
  permissions: Permission[]
}

Condition {
  id: string
  type: 'delivery' | 'quality' | 'payment' | 'timing'
  parameters: Map<string, any>
  verificationProof: string
  status: 'pending' | 'met' | 'failed'
}

OracleEvent {
  id: string
  source: 'temperature' | 'gps' | 'quality'
  contractId: string
  data: Map<string, any>
  timestamp: number
  mockGenerated: boolean
}
```

## API Design

### REST Endpoints
- `POST /api/contracts` - Create new contract
- `GET /api/contracts` - List contracts (filtered by role)
- `GET /api/contracts/{id}` - Get contract details
- `PUT /api/contracts/{id}/approve` - Approve contract in sequence
- `POST /api/contracts/{id}/verify` - Generate compliance proof
- `GET /api/oracle/events` - Stream mock oracle events
- `POST /api/oracle/simulate` - Trigger mock event generation
- `POST /api/payments/trigger` - Execute payment based on conditions
- `GET /api/users/role` - Get current user role and permissions

### Midnight Blockchain Interface
- Deploy Compact contracts for each contract type
- Submit ZK proofs for condition verification
- Query contract state without exposing private data
- Listen for blockchain events for state updates

## Security Considerations

### Privacy Protection
- All sensitive contract data processed locally on client devices
- Only ZK proofs submitted to blockchain
- No private business terms stored on-chain
- Selective disclosure for compliance verification

### Authentication & Authorization
- JWT tokens for session management
- Role-based access control (RBAC) for three user types
- Sequential approval enforcement at smart contract level
- Public key cryptography for party identification

### Data Security
- TLS encryption for all API communications
- Encrypted local storage for sensitive data
- Secure key management for blockchain interactions
- Audit logs for all contract operations

## Testing Strategy

### Unit Testing
- Smart contract logic validation
- ZK proof generation correctness
- Mock oracle data generation
- API endpoint functionality
- React component behavior

### Integration Testing
- End-to-end contract lifecycle
- Sequential approval workflow
- Oracle event processing
- Payment trigger execution
- Compliance proof generation

### Security Testing
- Role-based access enforcement
- Privacy preservation validation
- Smart contract vulnerability assessment
- API authentication testing

### Performance Testing
- ZK proof generation speed
- Contract query performance
- Mock oracle throughput
- UI responsiveness at scale

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up Midnight development environment
- Create basic Compact smart contracts
- Implement mock oracle service
- Build authentication system

### Phase 2: Core Features (Week 2)
- Develop contract creation UI
- Implement sequential approval workflow
- Add ZK proof generation
- Create compliance verification

### Phase 3: Integration (Week 3)
- Connect frontend to smart contracts
- Integrate mock oracle events
- Implement payment triggers
- Complete role-based access

### Phase 4: Polish (Week 4)
- UI/UX refinements
- Performance optimization
- Security hardening
- Documentation completion

## Out of Scope
- Cross-chain interoperability
- Real oracle provider integrations
- Mobile interface or responsive design
- ERP system integrations (SAP, Oracle SCM)
- Advanced analytics and reporting dashboards
- Parallel approval workflows
- System administrator role
- Multi-signature beyond sequential approval
- Partner network discovery
- Predictive contract analytics
- Cross-chain bridges
- Integration with existing payment systems

## Success Criteria
- Successfully create and execute all four contract types through complete lifecycle
- Generate valid ZK proofs that verify on Midnight blockchain
- Achieve sub-3 second proof generation time for standard contracts
- Process 100+ mock oracle events per minute without performance degradation
- Complete sequential approval workflow in under 5 user interactions
- Verify compliance without exposing any private contract data
- Automatically trigger payments within 10 seconds of condition satisfaction
- Support 50+ concurrent users on desktop interface
- Pass all security tests with zero critical vulnerabilities
- Achieve 90% code coverage in unit tests