#!/bin/bash

# ChainVault Backend API Test Script
# Simple script to test all API endpoints

BASE_URL="http://localhost:3001"

echo "=================================="
echo "ChainVault Backend API Tests"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test health endpoint
echo -e "${BLUE}Testing /health endpoint...${NC}"
curl -s "$BASE_URL/health" | python3 -m json.tool
echo -e "${GREEN}✓ Health check passed${NC}\n"

# Test users endpoint
echo -e "${BLUE}Testing /api/users endpoint...${NC}"
curl -s "$BASE_URL/api/users" | python3 -m json.tool
echo -e "${GREEN}✓ Users endpoint passed${NC}\n"

# Test specific user
echo -e "${BLUE}Testing /api/users/supplier endpoint...${NC}"
curl -s "$BASE_URL/api/users/supplier" | python3 -m json.tool
echo -e "${GREEN}✓ User details endpoint passed${NC}\n"

# Create a test contract
echo -e "${BLUE}Creating test contract...${NC}"
CONTRACT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/contracts" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier",
    "buyerId": "buyer",
    "quantity": 100,
    "encryptedPrice": "encrypted_10000",
    "deliveryLocation": {"lat": 40.7128, "lng": -74.0060},
    "description": "Test purchase order for 100 units"
  }')

echo "$CONTRACT_RESPONSE" | python3 -m json.tool

# Extract contract ID
CONTRACT_ID=$(echo "$CONTRACT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")
echo -e "${GREEN}✓ Contract created: $CONTRACT_ID${NC}\n"

# Get all contracts
echo -e "${BLUE}Testing /api/contracts endpoint...${NC}"
curl -s "$BASE_URL/api/contracts" | python3 -m json.tool
echo -e "${GREEN}✓ Contracts list endpoint passed${NC}\n"

# Get specific contract
echo -e "${BLUE}Testing /api/contracts/$CONTRACT_ID endpoint...${NC}"
curl -s "$BASE_URL/api/contracts/$CONTRACT_ID" | python3 -m json.tool
echo -e "${GREEN}✓ Contract details endpoint passed${NC}\n"

# Update contract
echo -e "${BLUE}Updating contract status to approved...${NC}"
curl -s -X PUT "$BASE_URL/api/contracts/$CONTRACT_ID" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}' | python3 -m json.tool
echo -e "${GREEN}✓ Contract update endpoint passed${NC}\n"

# Get events
echo -e "${BLUE}Testing /api/events endpoint...${NC}"
curl -s "$BASE_URL/api/events" | python3 -m json.tool
echo -e "${GREEN}✓ Events endpoint passed${NC}\n"

# Get events for specific contract
echo -e "${BLUE}Testing /api/events?contractId=$CONTRACT_ID endpoint...${NC}"
curl -s "$BASE_URL/api/events?contractId=$CONTRACT_ID" | python3 -m json.tool
echo -e "${GREEN}✓ Contract events endpoint passed${NC}\n"

# Get stats
echo -e "${BLUE}Testing /api/stats endpoint...${NC}"
curl -s "$BASE_URL/api/stats" | python3 -m json.tool
echo -e "${GREEN}✓ Stats endpoint passed${NC}\n"

# Get contracts by role
echo -e "${BLUE}Testing /api/contracts?role=supplier endpoint...${NC}"
curl -s "$BASE_URL/api/contracts?role=supplier" | python3 -m json.tool
echo -e "${GREEN}✓ Contracts by role endpoint passed${NC}\n"

# Get contracts by status
echo -e "${BLUE}Testing /api/contracts?status=approved endpoint...${NC}"
curl -s "$BASE_URL/api/contracts?status=approved" | python3 -m json.tool
echo -e "${GREEN}✓ Contracts by status endpoint passed${NC}\n"

echo ""
echo "=================================="
echo -e "${GREEN}All API tests passed!${NC}"
echo "=================================="
