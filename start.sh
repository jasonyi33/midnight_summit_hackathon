#!/bin/bash

# ChainVault System Startup Script
# This script starts both backend and frontend servers

echo "=========================================="
echo "  ChainVault System Startup"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo -e "${YELLOW}📋 Pre-flight Checks:${NC}"
echo ""

# Check if ports are available
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use (backend)${NC}"
    echo "   Kill existing process? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        lsof -ti:3001 | xargs kill -9
        echo -e "${GREEN}✓ Port 3001 freed${NC}"
    else
        echo -e "${RED}❌ Cannot start backend on occupied port${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Port 3001 available (backend)${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use (frontend)${NC}"
    echo "   Kill existing process? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo -e "${GREEN}✓ Port 3000 freed${NC}"
    else
        echo -e "${RED}❌ Cannot start frontend on occupied port${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Port 3000 available (frontend)${NC}"
fi

# Check for proof server
if curl -s http://127.0.0.1:6300/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Proof server running (port 6300)${NC}"
else
    echo -e "${YELLOW}⚠️  Proof server not detected on port 6300${NC}"
    echo "   The proof server is required for wallet operations."
    echo "   See docs/run-proof-server.md for setup instructions."
fi

echo ""
echo -e "${YELLOW}🚀 Starting Services...${NC}"
echo ""

# Start Backend
echo -e "${GREEN}Starting Backend...${NC}"
cd backend
npm start > /tmp/chainvault-backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "   PID: ${BACKEND_PID}"
echo -e "   Logs: /tmp/chainvault-backend.log"

# Wait for backend to start
echo -e "   Waiting for backend to initialize..."
sleep 3

# Check if backend is responding
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend ready at http://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend starting (may take a few more seconds)${NC}"
fi

echo ""

# Start Frontend
echo -e "${GREEN}Starting Frontend...${NC}"
cd frontend
npm run dev > /tmp/chainvault-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "   PID: ${FRONTEND_PID}"
echo -e "   Logs: /tmp/chainvault-frontend.log"

# Wait for frontend to start
echo -e "   Waiting for frontend to initialize..."
sleep 3

# Check if frontend is responding
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend ready at http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend starting (may take a few more seconds)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ ChainVault System Started!${NC}"
echo "=========================================="
echo ""
echo "📍 Services:"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "📊 Process IDs:"
echo "   Backend:  ${BACKEND_PID}"
echo "   Frontend: ${FRONTEND_PID}"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/chainvault-backend.log"
echo "   Frontend: tail -f /tmp/chainvault-frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   kill ${BACKEND_PID} ${FRONTEND_PID}"
echo "   Or: ./stop.sh"
echo ""
echo "🔍 View backend logs:"
echo "   tail -f /tmp/chainvault-backend.log | grep -E 'Blockchain|Contract|Mode'"
echo ""
echo "🌐 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Open browser DevTools (F12) to see console logs"
echo "   3. Click 'Connect Wallet' to connect Lace wallet"
echo "   4. Authorize connection in Lace popup"
echo "   5. Check that your balance displays correctly"
echo ""
echo "📚 Troubleshooting:"
echo "   - Wallet issues: see WALLET_CONNECTION_GUIDE.md"
echo "   - Contract info: see CONTRACT_VERIFICATION.md"
echo "   - API reference: see docs/API_REFERENCE.md"
echo ""
echo "Press CTRL+C to stop monitoring (services will keep running)"
echo ""

# Monitor logs
echo "=========================================="
echo "  Live Backend Logs"
echo "=========================================="
echo ""
tail -f /tmp/chainvault-backend.log | grep --line-buffered -E 'Blockchain|Contract|Mode|Server|Error|✓'
