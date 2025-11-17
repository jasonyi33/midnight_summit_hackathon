# ChainVault - Privacy-Preserving Supply Chain

## Hackathon Project Structure

This is the main ChainVault project for the 24-hour hackathon build.

### Project Structure
```
chainvault/
├── contracts/        # Midnight smart contracts (Dev 1)
├── backend/         # Express API server (Dev 2)
├── frontend/        # Next.js dashboard (Dev 3)
├── integration/     # Integration scripts (Dev 4)
├── demo/           # Demo materials (Dev 4)
└── scripts/        # Utility scripts
```

### Quick Start

1. **Install Dependencies**
```bash
cd chainvault
npm install
```

2. **Start All Services**
```bash
npm run dev:all
```

3. **Run Demo**
```bash
npm run demo
```

### Team Responsibilities

- **Dev 1**: Smart contracts in `contracts/`
- **Dev 2**: Backend API in `backend/`
- **Dev 3**: Frontend UI in `frontend/`
- **Dev 4**: Integration & demo in `integration/` and `demo/`

### Demo Flow

See `demo/DEMO_SCRIPT.md` for the complete demo walkthrough.