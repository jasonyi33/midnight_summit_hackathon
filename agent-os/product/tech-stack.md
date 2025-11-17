# Tech Stack

## Blockchain & Smart Contracts
- **Blockchain Platform:** Midnight (privacy-first blockchain with ZK proofs)
- **Smart Contract Language:** Compact (TypeScript-based language for Midnight)
- **Token Standards:** DUST tokens (computation), NIGHT tokens (governance)
- **Development SDK:** Midnight SDK and development tools
- **Testnet:** Midnight Testnet for development and testing

## Framework & Runtime
- **Application Framework:** Next.js 14 (App Router)
- **Language/Runtime:** Node.js 20.x with TypeScript 5.x
- **Package Manager:** npm (with npm workspaces for monorepo)

## Frontend
- **JavaScript Framework:** React 18 with TypeScript
- **CSS Framework:** Tailwind CSS 3.x
- **UI Components:** shadcn/ui for consistent component library
- **State Management:** Zustand for client state, TanStack Query for server state
- **Form Handling:** React Hook Form with Zod validation
- **Web3 Integration:** Midnight Wallet SDK for blockchain interactions

## Backend Services
- **API Framework:** Express.js with TypeScript
- **API Design:** RESTful APIs with OpenAPI specification
- **Authentication:** JWT tokens with refresh token rotation
- **Validation:** Zod for runtime type validation
- **Background Jobs:** Bull queue with Redis for async processing

## Database & Storage
- **Primary Database:** PostgreSQL 15 for off-chain data
- **ORM/Query Builder:** Prisma ORM for type-safe database access
- **Caching:** Redis for session management and caching
- **File Storage:** IPFS for distributed document storage
- **Time-Series Data:** TimescaleDB for IoT sensor data

## Oracles & External Data
- **Oracle Network:** Custom oracle nodes for supply chain data
- **IoT Integration:** MQTT broker for sensor data ingestion
- **External APIs:** REST/GraphQL adapters for third-party services

## Cryptography & Privacy
- **Zero-Knowledge Proofs:** Midnight's built-in ZK proof system
- **Encryption:** AES-256 for data at rest, TLS 1.3 for data in transit
- **Key Management:** Hardware Security Module (HSM) integration
- **Privacy Tools:** Midnight's selective disclosure framework

## Testing & Quality
- **Test Framework:** Jest for unit tests, Playwright for E2E tests
- **Smart Contract Testing:** Midnight testing framework for Compact
- **Linting/Formatting:** ESLint, Prettier with consistent configs
- **Code Quality:** SonarQube for code analysis
- **Security Testing:** Automated vulnerability scanning with Snyk

## Development Tools
- **Version Control:** Git with conventional commits
- **IDE:** VS Code with Midnight extension
- **API Documentation:** Swagger/OpenAPI specification
- **Local Development:** Docker Compose for service orchestration

## Deployment & Infrastructure
- **Hosting:** AWS ECS for containerized deployment
- **Container:** Docker with multi-stage builds
- **CI/CD:** GitHub Actions for automated testing and deployment
- **Infrastructure as Code:** Terraform for AWS resources
- **Monitoring:** Datadog for application monitoring
- **Logging:** ELK stack (Elasticsearch, Logstash, Kibana)

## Third-Party Services
- **Email Notifications:** SendGrid for transactional emails
- **SMS Alerts:** Twilio for critical notifications
- **Error Tracking:** Sentry for error monitoring
- **Analytics:** Mixpanel for privacy-compliant usage analytics
- **CDN:** CloudFlare for static asset delivery

## Integration Standards
- **API Standards:** REST with JSON:API specification
- **Event Streaming:** Apache Kafka for event-driven architecture
- **Message Format:** Protocol Buffers for efficient serialization
- **ERP Connectors:** SAP RFC, Oracle Integration Cloud adapters

## Security & Compliance
- **Security Framework:** OWASP Top 10 compliance
- **Audit Logging:** Immutable audit trails on Midnight blockchain
- **Compliance Tools:** GDPR and CCPA compliance modules
- **Penetration Testing:** Regular third-party security audits
- **Secret Management:** HashiCorp Vault for secrets

## Development Standards
- **Code Style:** Airbnb JavaScript/TypeScript style guide
- **Git Workflow:** GitHub Flow with PR reviews
- **Documentation:** JSDoc for code, Markdown for guides
- **Semantic Versioning:** SemVer for releases
- **Dependency Updates:** Renovate bot for automated updates