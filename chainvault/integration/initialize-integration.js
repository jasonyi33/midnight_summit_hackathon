// Integration Initialization Script
// Sets up and validates all connections between frontend, backend, and blockchain

const config = require('./config');
const HealthChecker = require('./health-check');
const FrontendIntegration = require('./frontend-integration');
const ContractClient = require('./contract-client');

class IntegrationInitializer {
  constructor() {
    this.healthChecker = new HealthChecker();
    this.frontendIntegration = new FrontendIntegration();
    this.contractClient = new ContractClient();
    this.setupResults = {};
  }

  // Main initialization flow
  async initialize() {
    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║  ChainVault Integration Initialization ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Configuration loaded:');
    console.log(`  Backend URL: ${config.backend.url}`);
    console.log(`  Frontend URL: ${config.frontend.url}`);
    console.log(`  Blockchain: ${config.blockchain.network}`);
    console.log(`  Oracle: GPS updates every ${config.oracle.gpsUpdateInterval}ms\n`);

    // Step 1: Health check
    console.log('Step 1: Checking services...');
    const healthOk = await this.healthChecker.runAllChecks();

    if (!healthOk) {
      console.log('\n⚠️  Not all services are running.');
      console.log('    Continuing with available services...\n');
    }

    // Step 2: Initialize connections
    console.log('\nStep 2: Initializing connections...');
    await this.initializeConnections();

    // Step 3: Validate endpoints
    console.log('\nStep 3: Validating API endpoints...');
    await this.validateEndpoints();

    // Step 4: Verify demo users
    console.log('\nStep 4: Verifying demo users...');
    this.verifyDemoUsers();

    // Step 5: Generate configuration summary
    console.log('\nStep 5: Generating configuration...');
    await this.generateConfigurationSummary();

    // Print final status
    this.printInitializationStatus();

    return this.setupResults;
  }

  // Initialize all client connections
  async initializeConnections() {
    try {
      // Initialize WebSocket
      try {
        await this.frontendIntegration.initializeWebSocket();
        this.setupResults.websocket = true;
        console.log('  ✅ WebSocket connection initialized');
      } catch (error) {
        console.log('  ⚠️  WebSocket connection failed (will retry)');
        this.setupResults.websocket = false;
      }

      // Initialize contract client
      try {
        await this.contractClient.connect();
        this.setupResults.contract = true;
        console.log('  ✅ Smart contract client initialized');
      } catch (error) {
        console.log('  ⚠️  Smart contract client failed');
        this.setupResults.contract = false;
      }
    } catch (error) {
      console.error('  ❌ Connection initialization failed:', error.message);
      this.setupResults.connections = false;
    }
  }

  // Validate API endpoints
  async validateEndpoints() {
    const endpoints = [
      { method: 'GET', path: '/health', name: 'Health Check' },
      { method: 'POST', path: '/api/orders', name: 'Create Order' },
      {
        method: 'GET',
        path: '/api/orders?role=supplier',
        name: 'Get Orders (Supplier)',
      },
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const url = `${config.backend.url}${endpoint.path}`;
        const response = await fetch(url, {
          method: endpoint.method,
          headers: {
            'X-API-Key': config.backend.apiKey,
          },
        });

        if (response.ok || response.status === 404) {
          console.log(`  ✅ ${endpoint.name}`);
          results.push(true);
        } else {
          console.log(`  ⚠️  ${endpoint.name} (${response.status})`);
          results.push(false);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint.name} - ${error.message}`);
        results.push(false);
      }
    }

    this.setupResults.endpoints = results.filter(r => r).length / results.length;
  }

  // Verify demo users configuration
  verifyDemoUsers() {
    const users = config.users;
    const roles = ['supplier', 'buyer', 'logistics', 'regulator'];

    console.log('  Demo Users:');
    for (const role of roles) {
      if (users[role]) {
        console.log(`    ✅ ${role}: ${users[role].name}`);
      } else {
        console.log(`    ❌ ${role}: NOT CONFIGURED`);
      }
    }

    this.setupResults.users = roles.every(role => users[role] !== undefined);
  }

  // Generate configuration summary
  async generateConfigurationSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      environment: config.demo.autoProgressDelivery ? 'Demo' : 'Testing',
      services: {
        backend: config.backend.url,
        frontend: config.frontend.url,
        blockchain: config.blockchain.network,
        oracle: {
          gpsUpdateInterval: config.oracle.gpsUpdateInterval,
          enabled: config.oracle.mockDataEnabled,
        },
      },
      users: Object.keys(config.users),
      demoSettings: {
        autoProgressDelivery: config.demo.autoProgressDelivery,
        deliverySteps: config.demo.deliverySteps,
        stepDuration: config.demo.stepDuration,
      },
    };

    this.setupResults.configuration = summary;
    console.log('  ✅ Configuration summary generated');
  }

  // Print final initialization status
  printInitializationStatus() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      Initialization Status             ║');
    console.log('╚════════════════════════════════════════╝\n');

    let allReady = true;

    // Check each component
    const checks = [
      { name: 'WebSocket', status: this.setupResults.websocket },
      { name: 'Smart Contract', status: this.setupResults.contract },
      { name: 'API Endpoints', status: this.setupResults.endpoints > 0.5 },
      { name: 'Demo Users', status: this.setupResults.users },
    ];

    for (const check of checks) {
      const icon = check.status ? '✅' : '⚠️ ';
      console.log(`${icon} ${check.name}`);
      if (!check.status) {
        allReady = false;
      }
    }

    console.log('\n---');

    if (allReady) {
      console.log('\n✅ Integration ready for demo!\n');
      console.log('Next steps:');
      console.log('  1. Start backend: cd backend && npm run dev');
      console.log('  2. Start frontend: cd frontend && npm run dev');
      console.log('  3. Run E2E tests: node integration/test-e2e.js\n');
    } else {
      console.log('\n⚠️  Some components need attention.');
      console.log('\nTo run the demo:');
      console.log('  1. Fix the components above');
      console.log('  2. Run: node integration/initialize-integration.js');
      console.log('  3. Run: node integration/test-e2e.js\n');
    }

    // Save results to file for CI/CD
    this.saveResults();
  }

  // Save initialization results to file
  saveResults() {
    try {
      const fs = require('fs');
      const path = require('path');

      const resultsFile = path.join(__dirname, 'initialization-results.json');
      fs.writeFileSync(
        resultsFile,
        JSON.stringify(this.setupResults, null, 2)
      );

      console.log(`\n📋 Results saved to: ${resultsFile}`);
    } catch (error) {
      console.log('Note: Could not save results file');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const initializer = new IntegrationInitializer();
  initializer.initialize().catch(console.error);
}

module.exports = IntegrationInitializer;
