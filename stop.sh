#!/bin/bash

# ChainVault System Stop Script
# Stops both backend and frontend servers

echo "=========================================="
echo "  ChainVault System Shutdown"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Stop backend (port 3001)
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Stopping backend (port 3001)...${NC}"
    lsof -ti:3001 | xargs kill -9
    echo -e "${GREEN}✓ Backend stopped${NC}"
else
    echo -e "${GREEN}✓ Backend not running${NC}"
fi

# Stop frontend (port 3000)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Stopping frontend (port 3000)...${NC}"
    lsof -ti:3000 | xargs kill -9
    echo -e "${GREEN}✓ Frontend stopped${NC}"
else
    echo -e "${GREEN}✓ Frontend not running${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
