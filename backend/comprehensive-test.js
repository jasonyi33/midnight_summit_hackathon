/**
 * Comprehensive Phase 2 Test Suite
 * Tests all features rigorously with edge cases
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
      headers: {
        'Content-Type': 'application/json'
      }
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

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         COMPREHENSIVE PHASE 2 TEST SUITE                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // CATEGORY 1: Server Health
  console.log('=== CATEGORY 1: Server Health & Oracle ===');

  await test('Health endpoint returns healthy status', async () => {
    const res = await makeRequest('GET', '/health');
    if (res.data.status !== 'healthy') throw new Error('Not healthy');
  });

  await test('Oracle auto-starts with server', async () => {
    const res = await makeRequest('GET', '/health');
    if (!res.data.oracle || !res.data.oracle.isRunning) throw new Error('Oracle not running');
  });

  await test('Root endpoint returns API info', async () => {
    const res = await makeRequest('GET', '/');
    if (!res.data.name) throw new Error('No API name');
  });

  console.log('');

  // CATEGORY 2: Workflow Endpoints with Edge Cases
  console.log('=== CATEGORY 2: Workflow Endpoints (Edge Cases) ===');

  let contract1Id, contract2Id;

  await test('Create contract with complete data', async () => {
    const res = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      logisticsId: 'logistics',
      quantity: 100,
      encryptedPrice: 'zk_price_100',
      deliveryLocation: { lat: 40.7128, lng: -74.0060 },
      description: 'Test Contract 1'
    });
    if (!res.data.success) throw new Error('Failed to create contract');
    contract1Id = res.data.data.id;
  });

  await test('Create contract with minimal required fields', async () => {
    const res = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      buyerId: 'buyer',
      quantity: 50,
      encryptedPrice: 'zk_price_50'
    });
    if (!res.data.success) throw new Error('Failed to create contract');
    contract2Id = res.data.data.id;
  });

  await test('Reject contract creation with missing required field', async () => {
    const res = await makeRequest('POST', '/api/contracts', {
      supplierId: 'supplier',
      quantity: 100
    });
    if (res.data.success !== false) throw new Error('Should have failed validation');
  });

  await test('Reject approval without ZK proof', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract1Id}/approve`, {
      approvedBy: 'buyer'
    });
    if (res.data.success !== false) throw new Error('Should require ZK proof');
  });

  await test('Approve contract with ZK proof', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract1Id}/approve`, {
      zkProof: 'zk_proof_123',
      approvedBy: 'buyer'
    });
    if (!res.data.success) throw new Error('Approval failed');
  });

  await test('Reject duplicate approval', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract1Id}/approve`, {
      zkProof: 'zk_proof_456'
    });
    if (res.data.success !== false) throw new Error('Should prevent duplicate approval');
  });

  await test('Reject delivery of non-approved contract', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract2Id}/deliver`, {
      gpsLocation: { lat: 40.7128, lng: -74.0060 }
    });
    if (res.data.success !== false) throw new Error('Should prevent invalid delivery');
  });

  // Approve contract2 for next tests
  await makeRequest('POST', `/api/contracts/${contract2Id}/approve`, {
    zkProof: 'zk_proof_789'
  });

  await test('Deliver approved contract', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract1Id}/deliver`, {
      gpsLocation: { lat: 40.7128, lng: -74.0060 },
      deliveredBy: 'logistics'
    });
    if (!res.data.success) throw new Error('Delivery failed');
  });

  await test('Reject payment of non-delivered contract', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract2Id}/pay`, {});
    if (res.data.success !== false) throw new Error('Should prevent invalid payment');
  });

  await test('Pay delivered contract', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract1Id}/pay`, {
      paymentProof: 'payment_proof_xyz'
    });
    if (!res.data.success) throw new Error('Payment failed');
  });

  await test('Reject duplicate payment', async () => {
    const res = await makeRequest('POST', `/api/contracts/${contract1Id}/pay`, {});
    if (res.data.success !== false) throw new Error('Should prevent duplicate payment');
  });

  console.log('');

  // CATEGORY 3: Oracle Control
  console.log('=== CATEGORY 3: Oracle Control ===');

  await test('Get oracle status', async () => {
    const res = await makeRequest('GET', '/api/oracle/status');
    if (!res.data.success) throw new Error('Status failed');
  });

  await test('Stop oracle service', async () => {
    const res = await makeRequest('POST', '/api/oracle/stop');
    if (!res.data.success) throw new Error('Stop failed');
  });

  await test('Verify oracle is stopped', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await makeRequest('GET', '/api/oracle/status');
    if (res.data.data.isRunning !== false) throw new Error('Oracle still running');
  });

  await test('Start oracle service', async () => {
    const res = await makeRequest('POST', '/api/oracle/start');
    if (!res.data.success) throw new Error('Start failed');
  });

  await test('Verify oracle is running', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await makeRequest('GET', '/api/oracle/status');
    if (res.data.data.isRunning !== true) throw new Error('Oracle not running');
  });

  console.log('');

  // CATEGORY 4: Multiple Contracts
  console.log('=== CATEGORY 4: Multiple Contracts ===');

  await test('Create multiple contracts', async () => {
    for (let i = 3; i <= 5; i++) {
      const res = await makeRequest('POST', '/api/contracts', {
        supplierId: 'supplier',
        buyerId: 'buyer',
        quantity: i * 10,
        encryptedPrice: `zk_price_${i}`,
        description: `Test Contract ${i}`
      });
      if (!res.data.success) throw new Error(`Failed to create contract ${i}`);
    }
  });

  await test('Retrieve all contracts', async () => {
    const res = await makeRequest('GET', '/api/contracts');
    if (res.data.count < 5) throw new Error(`Expected >= 5 contracts, got ${res.data.count}`);
  });

  await test('Filter contracts by status=paid', async () => {
    const res = await makeRequest('GET', '/api/contracts?status=paid');
    if (res.data.count < 1) throw new Error('No paid contracts found');
  });

  await test('Filter contracts by role=supplier', async () => {
    const res = await makeRequest('GET', '/api/contracts?role=supplier');
    if (res.data.count < 1) throw new Error('No supplier contracts found');
  });

  console.log('');

  // CATEGORY 5: Event Logging
  console.log('=== CATEGORY 5: Event Logging ===');

  await test('Retrieve all events', async () => {
    const res = await makeRequest('GET', '/api/events');
    if (res.data.count < 5) throw new Error(`Expected >= 5 events, got ${res.data.count}`);
  });

  await test('Filter events by contract ID', async () => {
    const res = await makeRequest('GET', `/api/events?contractId=${contract1Id}`);
    if (res.data.count < 2) throw new Error('Not enough events for contract');
  });

  await test('Verify contract_created event type exists', async () => {
    const res = await makeRequest('GET', '/api/events');
    const hasType = res.data.data.some(e => e.type === 'contract_created');
    if (!hasType) throw new Error('Missing contract_created events');
  });

  await test('Verify contract_approved event type exists', async () => {
    const res = await makeRequest('GET', '/api/events');
    const hasType = res.data.data.some(e => e.type === 'contract_approved');
    if (!hasType) throw new Error('Missing contract_approved events');
  });

  console.log('');

  // CATEGORY 6: Statistics
  console.log('=== CATEGORY 6: Statistics ===');

  await test('Retrieve system statistics', async () => {
    const res = await makeRequest('GET', '/api/stats');
    if (!res.data.success) throw new Error('Stats failed');
  });

  await test('Verify statistics accuracy', async () => {
    const res = await makeRequest('GET', '/api/stats');
    if (res.data.data.totalContracts < 5) throw new Error(`Expected >= 5 contracts, got ${res.data.data.totalContracts}`);
  });

  console.log('');

  // CATEGORY 7: Error Handling
  console.log('=== CATEGORY 7: Error Handling ===');

  await test('404 on invalid endpoint', async () => {
    const res = await makeRequest('GET', '/api/invalid_endpoint');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  await test('404 on non-existent contract', async () => {
    const res = await makeRequest('GET', '/api/contracts/nonexistent-id');
    if (res.data.success !== false) throw new Error('Should return error');
  });

  await test('404 on non-existent user', async () => {
    const res = await makeRequest('GET', '/api/users/invalid-user');
    if (res.data.success !== false) throw new Error('Should return error');
  });

  console.log('');

  // CATEGORY 8: State Management
  console.log('=== CATEGORY 8: State Management ===');

  await test('Reset state', async () => {
    const res = await makeRequest('POST', '/api/reset');
    if (!res.data.success) throw new Error('Reset failed');
  });

  await test('Verify state was reset', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await makeRequest('GET', '/api/stats');
    if (res.data.data.totalContracts !== 0) throw new Error(`Expected 0 contracts after reset, got ${res.data.data.totalContracts}`);
  });

  console.log('');

  // FINAL SUMMARY
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('');

  const total = passed + failed;
  const successRate = Math.round((passed / total) * 100);

  if (failed === 0) {
    console.log(`✅ ALL TESTS PASSED (${successRate}%)`);
    process.exit(0);
  } else {
    console.log(`❌ SOME TESTS FAILED (${successRate}% success rate)`);
    console.log('');
    console.log('Failed tests:');
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
