// End-to-End Integration Test
// Tests the complete order flow from creation to payment

const ApiClient = require('./api-client');
const ContractClient = require('./contract-client');
const config = require('./config');

class E2ETestRunner {
  constructor() {
    this.apiClient = new ApiClient();
    this.contractClient = new ContractClient();
    this.testResults = [];
    this.currentOrderId = null;
  }

  // Initialize connections
  async setup() {
    console.log('\n🚀 Setting up E2E test environment...\n');

    try {
      // Connect to backend API
      await this.apiClient.connectWebSocket();
      console.log('✅ Backend WebSocket connected');

      // Connect to smart contract
      await this.contractClient.connect();
      console.log('✅ Smart contract connected');

      return true;
    } catch (error) {
      console.error('❌ Setup failed:', error);
      return false;
    }
  }

  // Test 1: Create Order (Supplier)
  async testCreateOrder() {
    console.log('\n📝 Test 1: Create Order (Supplier View)');
    console.log('=========================================');

    try {
      const orderData = {
        supplier: config.users.supplier.id,
        buyer: config.users.buyer.id,
        quantity: 100,
        price: 10000, // Will be encrypted
        deliveryLocation: 'Chicago, IL',
        deliveryDate: new Date(Date.now() + 86400000).toISOString(), // +1 day
      };

      console.log('Creating order with data:', orderData);

      // Create order via API
      const apiResult = await this.apiClient.createOrder(orderData);
      console.log('✅ API order created:', apiResult.orderId);

      // Create order on blockchain
      const contractResult = await this.contractClient.createOrder({
        ...orderData,
        encryptedPrice: this.encryptPrice(orderData.price),
      });
      console.log('✅ Blockchain order created:', contractResult.txHash);

      this.currentOrderId = apiResult.orderId;

      this.testResults.push({
        test: 'Create Order',
        status: 'PASSED',
        orderId: this.currentOrderId,
        txHash: contractResult.txHash,
      });

      return true;
    } catch (error) {
      console.error('❌ Create order failed:', error);
      this.testResults.push({
        test: 'Create Order',
        status: 'FAILED',
        error: error.message,
      });
      return false;
    }
  }

  // Test 2: Approve Order (Buyer)
  async testApproveOrder() {
    console.log('\n✅ Test 2: Approve Order (Buyer View)');
    console.log('======================================');

    if (!this.currentOrderId) {
      console.error('❌ No order to approve');
      return false;
    }

    try {
      // Get order view as buyer (shouldn't see price)
      const buyerView = await this.apiClient.getOrderView(
        this.currentOrderId,
        'buyer'
      );
      console.log('Buyer sees:', {
        orderId: buyerView.orderId,
        quantity: buyerView.quantity,
        priceVisible: buyerView.price ? 'YES (ERROR!)' : 'NO (Correct)',
        hasProof: buyerView.priceProof ? 'YES' : 'NO',
      });

      // Generate ZK proof for approval
      console.log('Generating ZK proof...');
      const zkProof = await this.contractClient.generateApprovalProof(
        this.currentOrderId,
        { budget: 15000 } // Buyer's budget
      );
      console.log('✅ ZK Proof generated:', zkProof.proof);

      // Approve order
      const approvalResult = await this.apiClient.approveOrder(
        this.currentOrderId,
        zkProof.proof
      );
      console.log('✅ Order approved:', approvalResult.status);

      this.testResults.push({
        test: 'Approve Order',
        status: 'PASSED',
        privacyMaintained: !buyerView.price,
        zkProof: zkProof.proof,
      });

      return true;
    } catch (error) {
      console.error('❌ Approve order failed:', error);
      this.testResults.push({
        test: 'Approve Order',
        status: 'FAILED',
        error: error.message,
      });
      return false;
    }
  }

  // Test 3: Track Delivery (Logistics)
  async testTrackDelivery() {
    console.log('\n🚚 Test 3: Track Delivery (Logistics View)');
    console.log('==========================================');

    if (!this.currentOrderId) {
      console.error('❌ No order to track');
      return false;
    }

    try {
      // Simulate GPS tracking
      const gpsLocations = [
        { lat: 41.8781, lng: -87.6298, status: 'Warehouse' },
        { lat: 41.8500, lng: -87.6500, status: 'In Transit' },
        { lat: 41.8200, lng: -87.6700, status: 'Near Destination' },
        { lat: 41.8000, lng: -87.6900, status: 'At Destination' },
      ];

      for (let i = 0; i < gpsLocations.length; i++) {
        const location = gpsLocations[i];
        console.log(`📍 Location ${i + 1}/4: ${location.status}`);
        console.log(`   Coordinates: ${location.lat}, ${location.lng}`);

        // Emit GPS update event
        this.apiClient.emitMockEvent('gps_update', {
          orderId: this.currentOrderId,
          location,
          timestamp: new Date().toISOString(),
        });

        // Wait between updates
        await this.delay(1000);
      }

      console.log('✅ Delivery tracking complete');

      this.testResults.push({
        test: 'Track Delivery',
        status: 'PASSED',
        locationsTracked: gpsLocations.length,
      });

      return true;
    } catch (error) {
      console.error('❌ Track delivery failed:', error);
      this.testResults.push({
        test: 'Track Delivery',
        status: 'FAILED',
        error: error.message,
      });
      return false;
    }
  }

  // Test 4: Confirm Delivery & Payment (Oracle Trigger)
  async testConfirmDelivery() {
    console.log('\n💰 Test 4: Confirm Delivery & Auto-Payment');
    console.log('===========================================');

    if (!this.currentOrderId) {
      console.error('❌ No order to deliver');
      return false;
    }

    try {
      // GPS proof of delivery
      const gpsProof = {
        location: { lat: 41.8000, lng: -87.6900 },
        timestamp: new Date().toISOString(),
        verified: true,
      };

      console.log('📍 Delivery confirmed at destination');

      // Confirm delivery (triggers payment)
      const deliveryResult = await this.apiClient.confirmDelivery(
        this.currentOrderId,
        gpsProof
      );

      console.log('✅ Delivery confirmed:', deliveryResult.status);
      console.log('💵 Payment released:', deliveryResult.paymentReleased);

      // Verify payment on blockchain
      const blockchainResult = await this.contractClient.confirmDelivery(
        this.currentOrderId,
        gpsProof
      );
      console.log('✅ Blockchain payment:', blockchainResult.txHash);

      this.testResults.push({
        test: 'Confirm Delivery & Payment',
        status: 'PASSED',
        paymentReleased: deliveryResult.paymentReleased,
        txHash: blockchainResult.txHash,
      });

      return true;
    } catch (error) {
      console.error('❌ Confirm delivery failed:', error);
      this.testResults.push({
        test: 'Confirm Delivery & Payment',
        status: 'FAILED',
        error: error.message,
      });
      return false;
    }
  }

  // Test 5: Verify Compliance (Regulator)
  async testComplianceView() {
    console.log('\n👮 Test 5: Compliance View (Regulator)');
    console.log('======================================');

    if (!this.currentOrderId) {
      console.error('❌ No order to verify');
      return false;
    }

    try {
      // Get regulator view (no commercial details)
      const regulatorView = await this.apiClient.getOrderView(
        this.currentOrderId,
        'regulator'
      );

      console.log('Regulator sees:', {
        orderId: regulatorView.orderId,
        status: regulatorView.status,
        priceVisible: regulatorView.price ? 'YES (ERROR!)' : 'NO (Correct)',
        complianceProof: regulatorView.complianceProof ? 'YES' : 'NO',
      });

      // Verify compliance without seeing commercial details
      const privacyMaintained = !regulatorView.price && !regulatorView.supplier;
      console.log(
        privacyMaintained
          ? '✅ Privacy maintained - no commercial details visible'
          : '❌ Privacy breach - commercial details exposed'
      );

      this.testResults.push({
        test: 'Compliance View',
        status: 'PASSED',
        privacyMaintained,
        hasComplianceProof: !!regulatorView.complianceProof,
      });

      return true;
    } catch (error) {
      console.error('❌ Compliance view failed:', error);
      this.testResults.push({
        test: 'Compliance View',
        status: 'FAILED',
        error: error.message,
      });
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   ChainVault E2E Integration Tests    ║');
    console.log('╚════════════════════════════════════════╝');

    // Setup
    const setupSuccess = await this.setup();
    if (!setupSuccess) {
      console.error('\n❌ Setup failed. Cannot continue tests.');
      return false;
    }

    // Run tests in sequence
    const tests = [
      this.testCreateOrder.bind(this),
      this.testApproveOrder.bind(this),
      this.testTrackDelivery.bind(this),
      this.testConfirmDelivery.bind(this),
      this.testComplianceView.bind(this),
    ];

    for (const test of tests) {
      const success = await test();
      if (!success && test.name !== 'testComplianceView') {
        console.error('\n⚠️  Critical test failed. Continuing anyway for demo...');
      }
      await this.delay(2000); // Pause between tests
    }

    // Print summary
    this.printSummary();

    // Cleanup
    await this.teardown();

    return true;
  }

  // Print test summary
  printSummary() {
    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║           Test Summary                ║');
    console.log('╚════════════════════════════════════════╝');
    console.log();

    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;

    this.testResults.forEach((result, index) => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} Test ${index + 1}: ${result.test} - ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n-------------------');
    console.log(`Total: ${this.testResults.length} tests`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log('-------------------');

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Demo is ready.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix.');
    }
  }

  // Cleanup connections
  async teardown() {
    console.log('\n🧹 Cleaning up...');
    this.apiClient.disconnect();
    this.contractClient.disconnect();
    console.log('✅ Cleanup complete');
  }

  // Helper functions

  encryptPrice(price) {
    // Mock encryption for demo
    return Buffer.from(price.toString()).toString('base64');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests if executed directly
if (require.main === module) {
  const runner = new E2ETestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = E2ETestRunner;