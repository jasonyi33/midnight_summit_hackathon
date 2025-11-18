#!/bin/bash

# ChainVault Workflow Test Script
# Tests the complete supply chain workflow with automatic GPS tracking

set -e

API_URL="http://localhost:3001/api"
CONTRACT_ID=""

echo "=========================================="
echo "ChainVault Workflow Test"
echo "=========================================="
echo ""

# Step 1: Create a contract
echo "1. Creating contract..."
RESPONSE=$(curl -s -X POST "$API_URL/contracts" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier",
    "buyerId": "buyer",
    "logisticsId": "logistics",
    "quantity": 100,
    "encryptedPrice": "encrypted_10000",
    "deliveryLocation": {"lat": 34.0522, "lng": -118.2437},
    "description": "Demo order for 100 units"
  }')

CONTRACT_ID=$(echo $RESPONSE | jq -r '.data.id')
echo "   Contract created: $CONTRACT_ID"
echo "   Status: $(echo $RESPONSE | jq -r '.data.status')"
echo ""

sleep 2

# Step 2: Approve the contract
echo "2. Buyer approving contract with ZK proof..."
RESPONSE=$(curl -s -X POST "$API_URL/contracts/$CONTRACT_ID/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "zkProof": "mock_zk_proof_demo_12345",
    "approvedBy": "buyer"
  }')

echo "   Contract approved!"
echo "   Status: $(echo $RESPONSE | jq -r '.data.status')"
echo "   ZK Proof: $(echo $RESPONSE | jq -r '.data.zkProof')"
echo ""

sleep 2

# Step 3: Check oracle status
echo "3. Checking GPS Oracle tracking..."
RESPONSE=$(curl -s "$API_URL/oracle/status")
echo "   Oracle running: $(echo $RESPONSE | jq -r '.data.isRunning')"
echo "   Tracked contracts: $(echo $RESPONSE | jq -r '.data.trackedContracts')"
echo "   Update frequency: $(echo $RESPONSE | jq -r '.data.updateFrequency')ms"
echo ""

# Step 4: Wait for first GPS update
echo "4. Waiting 32 seconds for first GPS update..."
sleep 32

RESPONSE=$(curl -s "$API_URL/contracts/$CONTRACT_ID")
echo "   Status: $(echo $RESPONSE | jq -r '.data.status')"
echo ""

# Step 5: Check events
echo "5. Checking contract events..."
RESPONSE=$(curl -s "$API_URL/events?contractId=$CONTRACT_ID")
EVENT_COUNT=$(echo $RESPONSE | jq -r '.count')
echo "   Total events: $EVENT_COUNT"
echo "   Event types:"
echo $RESPONSE | jq -r '.data[].type' | sed 's/^/     - /'
echo ""

# Step 6: Show oracle progress
echo "6. Checking GPS tracking progress..."
RESPONSE=$(curl -s "$API_URL/oracle/status")
PROGRESS=$(echo $RESPONSE | jq -r ".data.contracts[] | select(.contractId==\"$CONTRACT_ID\") | .progress")
LOCATION=$(echo $RESPONSE | jq -r ".data.contracts[] | select(.contractId==\"$CONTRACT_ID\") | .currentLocation")
echo "   Progress: $PROGRESS%"
echo "   Current location: $LOCATION"
echo ""

echo "=========================================="
echo "Workflow test complete!"
echo "=========================================="
echo ""
echo "The contract will automatically:"
echo "  - Continue GPS tracking every 30 seconds"
echo "  - Reach destination after 10 updates (~5 minutes)"
echo "  - Trigger automatic delivery confirmation"
echo "  - Release payment 3 seconds after delivery"
echo ""
echo "Check the server logs to see real-time updates!"
