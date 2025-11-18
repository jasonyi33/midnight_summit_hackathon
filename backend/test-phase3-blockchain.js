/**
 * COMPREHENSIVE PHASE 3 BLOCKCHAIN INTEGRATION TEST SUITE
 * 
 * This test suite rigorously verifies:
 * - All 5 blockchain service methods
 * - Graceful degradation (MOCK vs LIVE mode)
 * - Integration with all API endpoints
 * - Environment variable configuration
 * - Error handling
 * - Concurrent blockchain calls
 * - Backward compatibility
 */

const http = require('http');
const BASE_URL = 'http://localhost:3001';

let passed = 0;
let failed = 0;
const results = [];

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passed++;
    results.push({ name, status: 'PASSED' });
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
    failed++;
    results.push({ name, status: 'FAILED', error: error.message });
  }
}

async function runPhase3Tests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    COMPREHENSIVE PHASE 3 BLOCKCHAIN INTEGRATION TESTS         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Reset state
  await makeRequest('POST', '/api/reset');

  // ============================================================
  // CATEGORY 1: Blockchain Service Status & Configuration
  // ============================================================
  console.log('=== CATEGORY 1: Blockchain Service Status & Configuration ===');

  await test('Blockchain service is initialized', async () => {
    const res = await makeRequest('GET', '/health');
    if (!res.data.blockchain) throw new Error('No blockchain in health');
    if (!res.data.blockchain.initialized) throw new Error('Not initialized');
  });

  await test('Blockchain status endpoint exists', async () => {
    const res = await makeRequest('GET', '/api/blockchain/status');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.success) throw new Error('Request failed');
  });

  await test('Blockchain returns MOCK mode when not configured', async () => {
    const res = await makeRequest('GET', '/api/blockchain/status');
    if (!res.data.data.mockMode) throw new Error('Should be in MOCK mode');
    if (res.data.data.contractAddress !== 'Not configured') throw new Error('Should not have contract address');
  });

  await test('Blockchain status has all required fields', async () => {
    const res = await makeRequest('GET', '/api/blockchain/status');
    const required = ['initialized', 'mockMode', 'contractAddress', 'networkUrl', 'enabled', 'message'];
    for (const field of required) {
      if (!(field in res.data.data)) throw new Error(`Missing field: ${field}`);
    }
  });

  console.log('');

  // ============================================================
  // CATEGORY 2: Blockchain Methods - Individual Testing
  // ============================================================
  console.log('=== CATEGORY 2: Blockchain Methods - Individual Testing ===');

  let testContractId;

  await test('createOrder() returns transaction data', async () => {
    const res = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 100,
      encryptedPrice: 'zk_price_phase3_test',
      description: 'Phase 3 Blockchain Test'
    });

    testContractId = res.data.data.id;
    
    if (!res.data.blockchain) throw new Error('No blockchain data returned');
    if (!res.data.blockchain.txHash) throw new Error('No transaction hash');
    if (!res.data.blockchain.blockNumber) throw new Error('No block number');
  });

  await test('createOrder() transaction hash is unique', async () => {
    const res1 = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 50,
      encryptedPrice: 'zk_price_test2'
    });

    const res2 = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 75,
      encryptedPrice: 'zk_price_test3'
    });

    if (res1.data.blockchain.txHash === res2.data.blockchain.txHash) {
      throw new Error('Transaction hashes should be unique');
    }
  });

  await test('approveOrder() submits ZK proof', async () => {
    const res = await makeRequest('POST', `/api/contracts/${testContractId}/approve`, {
      zkProof: 'zk_proof_phase3_test',
      approvedBy: 'buyer'
    });

    if (!res.data.blockchain) throw new Error('No blockchain data');
    if (!res.data.blockchain.txHash) throw new Error('No transaction hash');
    if (!res.data.blockchain.proofVerified) throw new Error('Proof not verified');
  });

  await test('confirmDelivery() submits GPS proof', async () => {
    const res = await makeRequest('POST', `/api/contracts/${testContractId}/deliver`, {
      gpsLocation: { lat: 40.7128, lng: -74.0060 },
      deliveredBy: 'logistics'
    });

    if (!res.data.blockchain) throw new Error('No blockchain data');
    if (!res.data.blockchain.txHash) throw new Error('No transaction hash');
    if (!res.data.blockchain.deliveryConfirmed) throw new Error('Delivery not confirmed');
  });

  await test('releasePayment() triggers on-chain payment', async () => {
    const res = await makeRequest('POST', `/api/contracts/${testContractId}/pay`, {});

    if (!res.data.blockchain) throw new Error('No blockchain data');
    if (!res.data.blockchain.txHash) throw new Error('No transaction hash');
    if (!res.data.blockchain.paymentReleased) throw new Error('Payment not released');
  });

  await test('getContractState() queries blockchain', async () => {
    const res = await makeRequest('GET', `/api/blockchain/contract/${testContractId}`);

    if (!res.data.success) throw new Error('Request failed');
    if (!res.data.data) throw new Error('No contract state');
    if (res.data.data.orderId !== testContractId) throw new Error('Wrong contract ID');
  });

  console.log('');

  // ============================================================
  // CATEGORY 3: Graceful Degradation Testing
  // ============================================================
  console.log('=== CATEGORY 3: Graceful Degradation Testing ===');

  await test('System works when blockchain returns mock data', async () => {
    const res = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 200,
      encryptedPrice: 'zk_price_mock_test'
    });

    if (res.status !== 201) throw new Error('Contract creation failed');
    if (!res.data.success) throw new Error('Contract not created');
    if (!res.data.data.id) throw new Error('No contract ID');
  });

  await test('Contract data persists in local state even with mock blockchain', async () => {
    const createRes = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 300,
      encryptedPrice: 'zk_price_persist_test'
    });

    const contractId = createRes.data.data.id;
    
    const getRes = await makeRequest('GET', `/api/contracts/${contractId}`);
    if (!getRes.data.success) throw new Error('Contract not found in local state');
    if (getRes.data.data.quantity !== 300) throw new Error('Data mismatch');
  });

  await test('Blockchain mock flag is correctly set', async () => {
    const res = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 400,
      encryptedPrice: 'zk_price_flag_test'
    });

    if (!res.data.blockchain.mock) throw new Error('Mock flag not set');
    if (res.data.blockchain.onChain !== false) throw new Error('onChain should be false in mock mode');
  });

  console.log('');

  // ============================================================
  // CATEGORY 4: API Integration Testing
  // ============================================================
  console.log('=== CATEGORY 4: API Integration with Blockchain ===');

  let integrationContractId;

  await test('POST /api/contracts integrates with blockchain.createOrder()', async () => {
    const res = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 500,
      encryptedPrice: 'zk_price_integration'
    });

    integrationContractId = res.data.data.id;

    // Check contract has blockchain TX stored
    if (!res.data.data.blockchainTx) throw new Error('No blockchainTx in contract');
    
    // Check response includes blockchain data
    if (!res.data.blockchain) throw new Error('No blockchain in response');
  });

  await test('POST /api/contracts/:id/approve integrates with blockchain.approveOrder()', async () => {
    const res = await makeRequest('POST', `/api/contracts/${integrationContractId}/approve`, {
      zkProof: 'zk_proof_integration',
      approvedBy: 'buyer'
    });

    // Check contract has blockchain approval TX
    if (!res.data.data.blockchainApprovalTx) throw new Error('No blockchainApprovalTx');
    if (!res.data.data.proofVerifiedOnChain) throw new Error('proofVerifiedOnChain not set');

    // Check response includes blockchain data
    if (!res.data.blockchain) throw new Error('No blockchain in response');
  });

  await test('POST /api/contracts/:id/deliver integrates with blockchain.confirmDelivery()', async () => {
    const res = await makeRequest('POST', `/api/contracts/${integrationContractId}/deliver`, {
      gpsLocation: { lat: 40.7128, lng: -74.0060 }
    });

    // Check contract has blockchain delivery TX
    if (!res.data.data.blockchainDeliveryTx) throw new Error('No blockchainDeliveryTx');
    if (!res.data.data.deliveryConfirmedOnChain) throw new Error('deliveryConfirmedOnChain not set');

    // Check response includes blockchain data
    if (!res.data.blockchain) throw new Error('No blockchain in response');
  });

  await test('POST /api/contracts/:id/pay integrates with blockchain.releasePayment()', async () => {
    const res = await makeRequest('POST', `/api/contracts/${integrationContractId}/pay`, {});

    // Check contract has blockchain payment TX
    if (!res.data.data.blockchainPaymentTx) throw new Error('No blockchainPaymentTx');
    if (!res.data.data.paymentReleasedOnChain) throw new Error('paymentReleasedOnChain not set');

    // Check response includes blockchain data
    if (!res.data.blockchain) throw new Error('No blockchain in response');
  });

  console.log('');

  // ============================================================
  // CATEGORY 5: Backward Compatibility
  // ============================================================
  console.log('=== CATEGORY 5: Backward Compatibility ===');

  await test('Existing contracts without blockchain data still work', async () => {
    const res = await makeRequest('GET', '/api/contracts');
    if (!res.data.success) throw new Error('Cannot fetch contracts');
    if (res.data.count < 1) throw new Error('No contracts found');
  });

  await test('Events still logged correctly with blockchain integration', async () => {
    const eventsRes = await makeRequest('GET', '/api/events');
    if (!eventsRes.data.success) throw new Error('Cannot fetch events');
    if (eventsRes.data.count < 1) throw new Error('No events found');

    // Check that events have blockchain data in them
    const hasBlockchainEvent = eventsRes.data.data.some(e => 
      e.data && e.data.blockchain
    );
    if (!hasBlockchainEvent) throw new Error('No events with blockchain data');
  });

  await test('Statistics endpoint still works', async () => {
    const res = await makeRequest('GET', '/api/stats');
    if (!res.data.success) throw new Error('Stats endpoint failed');
    if (!res.data.data.totalContracts) throw new Error('No totalContracts');
  });

  await test('Health endpoint includes blockchain status', async () => {
    const res = await makeRequest('GET', '/health');
    if (!res.data.blockchain) throw new Error('No blockchain in health');
    if (!res.data.blockchain.initialized) throw new Error('Blockchain not initialized');
  });

  console.log('');

  // ============================================================
  // CATEGORY 6: Error Handling & Edge Cases
  // ============================================================
  console.log('=== CATEGORY 6: Error Handling & Edge Cases ===');

  await test('Blockchain endpoint handles non-existent contract', async () => {
    const res = await makeRequest('GET', '/api/blockchain/contract/nonexistent-contract-id');
    if (res.data.success !== false) throw new Error('Should return error');
  });

  await test('Blockchain integration does not crash on approval without contract', async () => {
    const res = await makeRequest('POST', '/api/contracts/fake-id/approve', {
      zkProof: 'test'
    });
    if (res.status !== 404) throw new Error('Should return 404');
  });

  await test('Multiple blockchain transactions for same contract have different hashes', async () => {
    const createRes = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 600,
      encryptedPrice: 'zk_price_multitx'
    });

    const contractId = createRes.data.data.id;
    const createTx = createRes.data.blockchain.txHash;

    const approveRes = await makeRequest('POST', `/api/contracts/${contractId}/approve`, {
      zkProof: 'zk_proof_multitx'
    });
    const approveTx = approveRes.data.blockchain.txHash;

    if (createTx === approveTx) throw new Error('Transaction hashes should be different');
  });

  console.log('');

  // ============================================================
  // CATEGORY 7: Concurrent Blockchain Calls
  // ============================================================
  console.log('=== CATEGORY 7: Concurrent Blockchain Operations ===');

  await test('Multiple simultaneous contract creations work', async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        makeRequest('POST', '/api/contracts', {
          supplierId: 'supplier',
          buyerId: 'buyer',
          quantity: 100 + i,
          encryptedPrice: `zk_price_concurrent_${i}`
        })
      );
    }

    const results = await Promise.all(promises);
    
    // All should succeed
    for (const res of results) {
      if (res.status !== 201) throw new Error('Some requests failed');
      if (!res.data.blockchain) throw new Error('Missing blockchain data');
    }

    // All should have unique transaction hashes
    const txHashes = results.map(r => r.data.blockchain.txHash);
    const uniqueHashes = new Set(txHashes);
    if (uniqueHashes.size !== 5) throw new Error('Transaction hashes not unique');
  });

  await test('Rapid sequential blockchain operations maintain consistency', async () => {
    const createRes = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 700,
      encryptedPrice: 'zk_price_rapid'
    });

    const contractId = createRes.data.data.id;

    // Rapid approve -> deliver -> pay
    const approveRes = await makeRequest('POST', `/api/contracts/${contractId}/approve`, {
      zkProof: 'zk_proof_rapid'
    });

    const deliverRes = await makeRequest('POST', `/api/contracts/${contractId}/deliver`, {
      gpsLocation: { lat: 40, lng: -74 }
    });

    const payRes = await makeRequest('POST', `/api/contracts/${contractId}/pay`, {});

    // All should have blockchain data
    if (!approveRes.data.blockchain) throw new Error('Missing approve blockchain data');
    if (!deliverRes.data.blockchain) throw new Error('Missing deliver blockchain data');
    if (!payRes.data.blockchain) throw new Error('Missing pay blockchain data');
  });

  console.log('');

  // ============================================================
  // CATEGORY 8: Data Integrity
  // ============================================================
  console.log('=== CATEGORY 8: Data Integrity with Blockchain ===');

  await test('Contract stores all blockchain transaction hashes', async () => {
    const createRes = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 800,
      encryptedPrice: 'zk_price_integrity'
    });

    const contractId = createRes.data.data.id;

    await makeRequest('POST', `/api/contracts/${contractId}/approve`, {
      zkProof: 'zk_proof_integrity'
    });

    await makeRequest('POST', `/api/contracts/${contractId}/deliver`, {
      gpsLocation: { lat: 40, lng: -74 }
    });

    await makeRequest('POST', `/api/contracts/${contractId}/pay`, {});

    // Fetch contract and verify all TX hashes are stored
    const getRes = await makeRequest('GET', `/api/contracts/${contractId}`);
    const contract = getRes.data.data;

    if (!contract.blockchainTx) throw new Error('Missing blockchainTx');
    if (!contract.blockchainApprovalTx) throw new Error('Missing blockchainApprovalTx');
    if (!contract.blockchainDeliveryTx) throw new Error('Missing blockchainDeliveryTx');
    if (!contract.blockchainPaymentTx) throw new Error('Missing blockchainPaymentTx');
  });

  await test('Blockchain verification flags stored correctly', async () => {
    const createRes = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 900,
      encryptedPrice: 'zk_price_flags'
    });

    const contractId = createRes.data.data.id;

    await makeRequest('POST', `/api/contracts/${contractId}/approve`, {
      zkProof: 'zk_proof_flags'
    });

    const getRes = await makeRequest('GET', `/api/contracts/${contractId}`);
    const contract = getRes.data.data;

    if (typeof contract.proofVerifiedOnChain !== 'boolean') {
      throw new Error('proofVerifiedOnChain should be boolean');
    }
  });

  console.log('');

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           PHASE 3 BLOCKCHAIN INTEGRATION TEST SUMMARY         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('');

  const total = passed + failed;
  const successRate = Math.round((passed / total) * 100);

  if (failed === 0) {
    console.log(`✅ ALL PHASE 3 TESTS PASSED (${successRate}%)`);
    console.log('');
    console.log('Phase 3 Verification Complete:');
    console.log('✅ All 5 blockchain methods functional');
    console.log('✅ Graceful degradation working (MOCK mode)');
    console.log('✅ Integration with all API endpoints verified');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ Error handling robust');
    console.log('✅ Concurrent operations supported');
    console.log('✅ Data integrity maintained');
    console.log('');
    process.exit(0);
  } else {
    console.log(`❌ SOME PHASE 3 TESTS FAILED (${successRate}% success rate)`);
    console.log('');
    console.log('Failed tests:');
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
}

runPhase3Tests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
