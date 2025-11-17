// Automated Demo Runner
// Orchestrates the demo flow automatically

const ApiClient = require('../integration/api-client');
const ContractClient = require('../integration/contract-client');
const config = require('../integration/config');

class DemoRunner {
  constructor() {
    this.apiClient = new ApiClient();
    this.contractClient = new ContractClient();
    this.currentStep = 0;
    this.orderId = null;
    this.isRunning = false;
  }

  // Initialize demo
  async setup() {
    console.clear();
    this.printHeader();

    console.log('🚀 Initializing ChainVault Demo...\n');

    try {
      await this.apiClient.connectWebSocket();
      await this.contractClient.connect();
      console.log('✅ All systems connected\n');

      await this.pause(1000);
      return true;
    } catch (error) {
      console.error('❌ Setup failed:', error);
      return false;
    }
  }

  // Step 1: Create Order (Supplier)
  async step1_createOrder() {
    this.printStep(1, 'Supplier Creates Order');

    console.log('👤 ACME Corp is creating a purchase order...\n');

    const orderData = {
      supplier: 'ACME Corp',
      buyer: 'MegaRetail',
      quantity: 100,
      price: 10000,
      deliveryLocation: 'Chicago, IL',
    };

    console.log('📋 Order Details:');
    console.log('   Buyer: MegaRetail');
    console.log('   Quantity: 100 units');
    console.log('   Price: $10,000 (encrypting...)');
    console.log('   Delivery: Chicago, IL\n');

    await this.pause(2000);

    // Animate encryption
    await this.animateEncryption();

    // Create order
    const result = await this.apiClient.createOrder(orderData);
    this.orderId = result.orderId;

    console.log(`✅ Order created: ${this.orderId}`);
    console.log('🔒 Price encrypted on blockchain\n');

    await this.pause(2000);
  }

  // Step 2: Buyer Approval
  async step2_buyerApproval() {
    this.printStep(2, 'Buyer Reviews & Approves');

    console.log('👤 MegaRetail reviewing order...\n');

    console.log('🔍 What MegaRetail sees:');
    console.log('   ✅ Quantity: 100 units');
    console.log('   ❌ Price: [ENCRYPTED]');
    console.log('   ✅ Budget Check: Generating ZK Proof...\n');

    await this.pause(2000);

    // Animate ZK proof generation
    await this.animateZKProof();

    console.log('✅ ZK Proof Generated!');
    console.log('   Proof verifies: Price ≤ Budget');
    console.log('   Actual price remains hidden\n');

    await this.pause(1500);

    // Approve order
    const zkProof = 'ZK_PROOF_12345ABCDE';
    await this.apiClient.approveOrder(this.orderId, zkProof);

    console.log('✅ Order approved by MegaRetail');
    console.log('📧 Notifications sent to Supplier & Logistics\n');

    await this.pause(2000);
  }

  // Step 3: Logistics Tracking
  async step3_logistics() {
    this.printStep(3, 'Delivery Tracking');

    console.log('🚚 FastShip beginning delivery...\n');

    const locations = [
      { name: 'ACME Warehouse', progress: 0 },
      { name: 'Highway I-90', progress: 25 },
      { name: 'Rest Stop - Mile 45', progress: 50 },
      { name: 'Chicago City Limits', progress: 75 },
      { name: 'MegaRetail Chicago DC', progress: 100 },
    ];

    for (const location of locations) {
      this.printProgressBar(location.progress);
      console.log(`📍 Current Location: ${location.name}`);

      if (location.progress === 100) {
        console.log('\n🎉 DELIVERY CONFIRMED!');
        await this.pause(1000);
        console.log('💰 Triggering automatic payment...');
        await this.animatePayment();
        console.log('✅ Payment of $10,000 released to ACME Corp');
      }

      await this.pause(1500);
      if (location.progress < 100) {
        this.clearLines(2);
      }
    }

    await this.pause(2000);
  }

  // Step 4: Regulator View
  async step4_compliance() {
    this.printStep(4, 'Regulatory Compliance');

    console.log('👮 TradeComm checking compliance...\n');

    console.log('🔍 What the Regulator sees:');
    console.log('   ✅ Delivery Proof: Verified');
    console.log('   ✅ Payment Proof: Verified');
    console.log('   ✅ Compliance: PASSED');
    console.log('   ❌ Price: NOT VISIBLE');
    console.log('   ❌ Commercial Terms: NOT VISIBLE\n');

    await this.pause(2000);

    console.log('✅ Full compliance verified without exposing business data!\n');

    await this.pause(2000);
  }

  // Run complete demo
  async run() {
    this.isRunning = true;

    const setupSuccess = await this.setup();
    if (!setupSuccess) {
      console.error('Demo setup failed. Please check services.');
      return;
    }

    console.log('🎬 Starting Demo in 3 seconds...\n');
    await this.countdown(3);

    try {
      await this.step1_createOrder();
      await this.step2_buyerApproval();
      await this.step3_logistics();
      await this.step4_compliance();

      this.printSuccess();
    } catch (error) {
      console.error('\n❌ Demo error:', error);
    }

    this.isRunning = false;
    await this.cleanup();
  }

  // Animation helpers

  async animateEncryption() {
    const frames = ['🔐', '🔑', '🔒'];
    for (let i = 0; i < 6; i++) {
      process.stdout.write(`\r   ${frames[i % 3]} Encrypting price data...`);
      await this.pause(200);
    }
    process.stdout.write('\r   🔒 Price encrypted successfully!\n\n');
  }

  async animateZKProof() {
    const steps = [
      'Initializing circuit...',
      'Computing witnesses...',
      'Generating proof...',
      'Verifying proof...',
    ];

    for (const step of steps) {
      console.log(`   🔄 ${step}`);
      await this.pause(500);
    }
    console.log();
  }

  async animatePayment() {
    const frames = ['💳', '💸', '💰'];
    for (let i = 0; i < 6; i++) {
      process.stdout.write(`\r   ${frames[i % 3]} Processing payment...`);
      await this.pause(200);
    }
    process.stdout.write('\r   💰 Payment completed!          \n');
  }

  // UI helpers

  printHeader() {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║         ChainVault Demo Runner          ║');
    console.log('║   Privacy-Preserving Supply Chain       ║');
    console.log('╚══════════════════════════════════════════╝\n');
  }

  printStep(number, title) {
    console.log('\n' + '='.repeat(45));
    console.log(`  Step ${number}: ${title}`);
    console.log('='.repeat(45) + '\n');
  }

  printProgressBar(progress) {
    const width = 30;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\rDelivery Progress: [${bar}] ${progress}%`);
    if (progress === 100) console.log();
  }

  printSuccess() {
    console.log('\n\n');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║          🎉 DEMO COMPLETE! 🎉           ║');
    console.log('╟──────────────────────────────────────────╢');
    console.log('║                                          ║');
    console.log('║  ✅ Order created with encrypted price  ║');
    console.log('║  ✅ Approved via ZK proof               ║');
    console.log('║  ✅ Delivered with GPS tracking         ║');
    console.log('║  ✅ Payment released automatically      ║');
    console.log('║  ✅ Compliance verified privately       ║');
    console.log('║                                          ║');
    console.log('║   🚀 ChainVault: Where Privacy Meets    ║');
    console.log('║      Transparency in Supply Chain       ║');
    console.log('╚══════════════════════════════════════════╝\n');
  }

  async countdown(seconds) {
    for (let i = seconds; i > 0; i--) {
      process.stdout.write(`\r   ${i}...`);
      await this.pause(1000);
    }
    process.stdout.write('\r       \n');
  }

  clearLines(count) {
    for (let i = 0; i < count; i++) {
      process.stdout.write('\x1B[1A\x1B[2K');
    }
  }

  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up demo...');
    this.apiClient.disconnect();
    this.contractClient.disconnect();
    console.log('✅ Demo complete\n');
  }
}

// Run demo if executed directly
if (require.main === module) {
  const demo = new DemoRunner();

  // Handle Ctrl+C gracefully
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Demo interrupted by user');
    if (demo.isRunning) {
      await demo.cleanup();
    }
    process.exit(0);
  });

  demo.run().catch(console.error);
}

module.exports = DemoRunner;