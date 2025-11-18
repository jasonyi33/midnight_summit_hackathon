#!/bin/bash

# ChainVault Environment Verification Script
# Run this to verify your development environment is ready

echo "======================================"
echo "ChainVault Setup Verification"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_PASSED=true

# Function to check command existence
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        ALL_PASSED=false
        return 1
    fi
}

# Function to check version
check_version() {
    local cmd=$1
    local version=$2
    echo "  Version: $version"
}

echo "Checking prerequisites..."
echo "------------------------------------"

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    check_version "node" "$NODE_VERSION"

    # Extract major version number
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 20 ]; then
        echo -e "  ${GREEN}Version OK${NC} (requires 20.x or higher)"
    else
        echo -e "  ${RED}Version too old${NC} (requires 20.x or higher)"
        ALL_PASSED=false
    fi
fi
echo ""

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm --version)
    check_version "npm" "$NPM_VERSION"
fi
echo ""

# Check Compact compiler
if check_command compact; then
    COMPACT_VERSION=$(compact --version)
    check_version "compact" "$COMPACT_VERSION"
    COMPACT_PATH=$(which compact)
    echo "  Path: $COMPACT_PATH"
else
    echo -e "${YELLOW}  Install with: curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/download/compact-v0.2.0/compact-installer.sh | sh${NC}"
fi
echo ""

# Check Docker
if check_command docker; then
    DOCKER_VERSION=$(docker --version)
    check_version "docker" "$DOCKER_VERSION"

    # Check if Docker daemon is running
    if docker ps &> /dev/null; then
        echo -e "  ${GREEN}Docker daemon is running${NC}"
    else
        echo -e "  ${RED}Docker daemon is NOT running${NC}"
        echo -e "  ${YELLOW}Start Docker Desktop${NC}"
        ALL_PASSED=false
    fi
else
    echo -e "${YELLOW}  Install from: https://www.docker.com/products/docker-desktop/${NC}"
fi
echo ""

# Check proof server image
echo "Checking Docker images..."
echo "------------------------------------"
if docker images | grep -q "proof-server"; then
    echo -e "${GREEN}✓${NC} Midnight proof server image is available"
    PROOF_VERSION=$(docker images midnightnetwork/proof-server --format "{{.Tag}}" | head -n 1)
    echo "  Version: $PROOF_VERSION"
else
    echo -e "${RED}✗${NC} Midnight proof server image NOT found"
    echo -e "${YELLOW}  Pull with: docker pull midnightnetwork/proof-server:latest${NC}"
    ALL_PASSED=false
fi
echo ""

# Check contract files
echo "Checking contract files..."
echo "------------------------------------"
if [ -f "contracts/PurchaseDeliveryContract.compact" ]; then
    echo -e "${GREEN}✓${NC} PurchaseDeliveryContract.compact exists"
    FILE_SIZE=$(wc -c < "contracts/PurchaseDeliveryContract.compact")
    echo "  Size: $FILE_SIZE bytes"
else
    echo -e "${RED}✗${NC} PurchaseDeliveryContract.compact NOT found"
    ALL_PASSED=false
fi
echo ""

# Check compiled artifacts
if [ -d "contracts/managed/purchase-delivery" ]; then
    echo -e "${GREEN}✓${NC} Compiled contract artifacts exist"

    if [ -f "contracts/managed/purchase-delivery/contract/index.cjs" ]; then
        echo -e "  ${GREEN}✓${NC} TypeScript API generated"
    else
        echo -e "  ${RED}✗${NC} TypeScript API NOT generated"
        ALL_PASSED=false
    fi

    if [ -d "contracts/managed/purchase-delivery/keys" ]; then
        KEY_COUNT=$(ls contracts/managed/purchase-delivery/keys/*.prover 2>/dev/null | wc -l)
        echo -e "  ${GREEN}✓${NC} Cryptographic keys generated ($KEY_COUNT prover keys)"
    else
        echo -e "  ${RED}✗${NC} Cryptographic keys NOT generated"
        ALL_PASSED=false
    fi
else
    echo -e "${RED}✗${NC} Compiled artifacts NOT found"
    echo -e "${YELLOW}  Compile with: compact compile contracts/PurchaseDeliveryContract.compact contracts/managed/purchase-delivery${NC}"
    ALL_PASSED=false
fi
echo ""

# Check network connectivity (optional)
echo "Checking network endpoints..."
echo "------------------------------------"
if curl -s --max-time 3 https://indexer.testnet-02.midnight.network/api/v1/graphql > /dev/null; then
    echo -e "${GREEN}✓${NC} Midnight Testnet indexer is reachable"
else
    echo -e "${YELLOW}⚠${NC} Midnight Testnet indexer is not reachable (check internet connection)"
fi

if curl -s --max-time 3 https://rpc.testnet-02.midnight.network > /dev/null; then
    echo -e "${GREEN}✓${NC} Midnight Testnet RPC is reachable"
else
    echo -e "${YELLOW}⚠${NC} Midnight Testnet RPC is not reachable (check internet connection)"
fi
echo ""

# Summary
echo "======================================"
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your environment is ready for ChainVault development."
    echo ""
    echo "Next steps:"
    echo "1. Start proof server: docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'"
    echo "2. Install Lace wallet: https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg"
    echo "3. Get test tokens: https://midnight.network/test-faucet/"
    echo ""
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before continuing."
    echo ""
fi
echo "======================================"

# Exit with appropriate code
if [ "$ALL_PASSED" = true ]; then
    exit 0
else
    exit 1
fi
