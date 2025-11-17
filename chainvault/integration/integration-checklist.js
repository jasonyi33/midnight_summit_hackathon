// Integration Checklist
// Validates all integration requirements before running demo

const config = require('./config');
const fs = require('fs');
const path = require('path');

class IntegrationChecklist {
  constructor() {
    this.checks = [];
    this.passedChecks = 0;
    this.failedChecks = 0;
    this.warningChecks = 0;
  }

  // Add a check
  addCheck(name, passed, message = '', severity = 'error') {
    this.checks.push({
      name,
      passed,
      message,
      severity,
      timestamp: new Date().toISOString(),
    });

    if (passed) {
      this.passedChecks++;
    } else if (severity === 'warning') {
      this.warningChecks++;
    } else {
      this.failedChecks++;
    }
  }

  // Run all checks
  async runAll() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    Integration Checklist               ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Configuration checks
    console.log('Configuration Checks:');
    await this.checkConfiguration();

    // Service checks
    console.log('\nService Checks:');
    await this.checkServices();

    // Connectivity checks
    console.log('\nConnectivity Checks:');
    await this.checkConnectivity();

    // Frontend checks
    console.log('\nFrontend Checks:');
    await this.checkFrontend();

    // Backend checks
    console.log('\nBackend Checks:');
    await this.checkBackend();

    // Blockchain checks
    console.log('\nBlockchain Checks:');
    await this.checkBlockchain();

    // Data model checks
    console.log('\nData Model Checks:');
    await this.checkDataModels();

    // Print summary
    this.printSummary();
  }

  // Configuration checks
  async checkConfiguration() {
    // Check backend URL
    const backendUrlValid =
      config.backend.url && config.backend.url !== '' && !config.backend.url.includes('undefined');
    this.addCheck(
      'Backend URL configured',
      backendUrlValid,
      backendUrlValid ? '' : `Invalid URL: ${config.backend.url}`
    );

    // Check frontend URL
    const frontendUrlValid =
      config.frontend.url &&
      config.frontend.url !== '' &&
      !config.frontend.url.includes('undefined');
    this.addCheck(
      'Frontend URL configured',
      frontendUrlValid,
      frontendUrlValid ? '' : `Invalid URL: ${config.frontend.url}`
    );

    // Check API key
    const apiKeyValid = config.backend.apiKey && config.backend.apiKey.length > 0;
    this.addCheck(
      'API key configured',
      apiKeyValid,
      apiKeyValid ? '' : 'API key is empty'
    );

    // Check WebSocket URL
    const wsUrlValid = config.backend.wsUrl && config.backend.wsUrl !== '';
    this.addCheck(
      'WebSocket URL configured',
      wsUrlValid,
      wsUrlValid ? '' : `Invalid WS URL: ${config.backend.wsUrl}`
    );

    // Check blockchain config
    const blockchainValid =
      config.blockchain.network &&
      config.blockchain.rpcUrl &&
      config.blockchain.contractAddress !== 'PENDING_DEPLOYMENT';
    this.addCheck(
      'Blockchain configured',
      blockchainValid,
      blockchainValid ? '' : 'Contract not deployed yet',
      blockchainValid ? 'error' : 'warning'
    );

    // Check demo settings
    const demoValid =
      config.demo.autoProgressDelivery === true &&
      config.demo.deliverySteps > 0 &&
      config.demo.stepDuration > 0;
    this.addCheck(
      'Demo settings valid',
      demoValid,
      demoValid ? '' : 'Invalid demo configuration'
    );
  }

  // Service availability checks
  async checkServices() {
    // Check if files exist
    const files = [
      'config.js',
      'api-client.js',
      'contract-client.js',
      'frontend-integration.js',
      'health-check.js',
      'test-e2e.js',
    ];

    for (const file of files) {
      const filePath = path.join(__dirname, file);
      const exists = fs.existsSync(filePath);
      this.addCheck(
        `Integration file exists: ${file}`,
        exists,
        exists ? '' : `Missing: ${filePath}`
      );
    }
  }

  // Connectivity checks
  async checkConnectivity() {
    // Check backend connectivity
    try {
      const response = await this.testEndpoint(`${config.backend.url}/health`, 5000);
      this.addCheck(
        'Backend API responding',
        response.ok,
        response.ok ? '' : `Status: ${response.status}`
      );
    } catch (error) {
      this.addCheck(
        'Backend API responding',
        false,
        `Error: ${error.message}`,
        'warning'
      );
    }

    // Check frontend connectivity
    try {
      const response = await this.testEndpoint(config.frontend.url, 5000);
      this.addCheck(
        'Frontend responding',
        response.ok,
        response.ok ? '' : `Status: ${response.status}`
      );
    } catch (error) {
      this.addCheck(
        'Frontend responding',
        false,
        `Error: ${error.message}`,
        'warning'
      );
    }
  }

  // Frontend-specific checks
  async checkFrontend() {
    try {
      const response = await this.testEndpoint(config.frontend.url);
      const isRunning = response.ok;

      this.addCheck(
        'Frontend server running',
        isRunning,
        isRunning ? '' : 'Run: cd frontend && npm run dev',
        isRunning ? 'error' : 'warning'
      );

      // Check for required API routes
      const apiCheck = await this.testEndpoint(
        `${config.backend.url}/api/orders`,
        3000
      );
      this.addCheck(
        'Frontend API accessible',
        apiCheck.ok,
        apiCheck.ok ? '' : 'Backend API not accessible',
        apiCheck.ok ? 'error' : 'warning'
      );
    } catch (error) {
      this.addCheck(
        'Frontend server running',
        false,
        'Run: cd frontend && npm run dev',
        'warning'
      );
    }
  }

  // Backend-specific checks
  async checkBackend() {
    try {
      const response = await this.testEndpoint(`${config.backend.url}/health`);
      const isRunning = response.ok;

      this.addCheck(
        'Backend server running',
        isRunning,
        isRunning ? '' : 'Run: cd backend && npm run dev',
        isRunning ? 'error' : 'warning'
      );

      // Check API endpoints
      const endpoints = [
        { path: '/api/orders', name: 'Create order endpoint' },
        { path: '/api/oracle/status', name: 'Oracle status endpoint' },
      ];

      for (const endpoint of endpoints) {
        try {
          const result = await this.testEndpoint(
            `${config.backend.url}${endpoint.path}`,
            2000
          );
          this.addCheck(
            endpoint.name,
            result.ok || result.status === 400, // 400 is OK (validation error)
            ''
          );
        } catch (error) {
          this.addCheck(
            endpoint.name,
            false,
            `Error: ${error.message}`,
            'warning'
          );
        }
      }
    } catch (error) {
      this.addCheck(
        'Backend server running',
        false,
        'Run: cd backend && npm run dev',
        'warning'
      );
    }
  }

  // Blockchain-specific checks
  async checkBlockchain() {
    // Check contract address
    const contractDeployed =
      config.blockchain.contractAddress &&
      config.blockchain.contractAddress !== 'PENDING_DEPLOYMENT';

    this.addCheck(
      'Smart contract deployed',
      contractDeployed,
      contractDeployed
        ? `Address: ${config.blockchain.contractAddress.substring(0, 10)}...`
        : 'Waiting for Dev 1 to deploy',
      contractDeployed ? 'error' : 'warning'
    );

    // Check RPC endpoint
    const rpcValid = config.blockchain.rpcUrl && config.blockchain.rpcUrl !== '';
    this.addCheck('RPC endpoint configured', rpcValid, '');

    // Check network
    const networkValid =
      config.blockchain.network &&
      ['testnet', 'mainnet', 'devnet'].includes(config.blockchain.network);
    this.addCheck(
      'Network valid',
      networkValid,
      networkValid ? '' : `Invalid network: ${config.blockchain.network}`
    );
  }

  // Data model checks
  async checkDataModels() {
    // Check demo users
    const users = ['supplier', 'buyer', 'logistics', 'regulator'];
    let allUsersValid = true;

    for (const role of users) {
      const userExists =
        config.users[role] &&
        config.users[role].id &&
        config.users[role].name &&
        config.users[role].role === role;

      if (!userExists) {
        allUsersValid = false;
      }

      this.addCheck(
        `Demo user: ${role}`,
        userExists,
        userExists ? config.users[role].name : 'Invalid configuration'
      );
    }

    // Check oracle configuration
    const oracleValid =
      config.oracle.gpsUpdateInterval > 0 &&
      config.oracle.temperatureUpdateInterval > 0 &&
      config.oracle.mockDataEnabled === true;

    this.addCheck(
      'Oracle configuration valid',
      oracleValid,
      oracleValid ? '' : 'Invalid oracle settings'
    );
  }

  // Test endpoint connectivity
  async testEndpoint(url, timeout = 5000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: {
          'X-API-Key': config.backend.apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Print summary
  printSummary() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║           Checklist Summary            ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Group checks by status
    const passed = this.checks.filter(c => c.passed);
    const failed = this.checks.filter(c => !c.passed && c.severity === 'error');
    const warnings = this.checks.filter(c => !c.passed && c.severity === 'warning');

    // Print each check
    for (const check of this.checks) {
      const icon = check.passed ? '✅' : check.severity === 'warning' ? '⚠️ ' : '❌';
      const message = check.message ? ` - ${check.message}` : '';
      console.log(`${icon} ${check.name}${message}`);
    }

    // Print summary
    console.log('\n---');
    console.log(`Passed: ${passed.length} ✅`);
    console.log(`Warnings: ${warnings.length} ⚠️ `);
    console.log(`Failed: ${failed.length} ❌`);

    // Ready status
    console.log('\n---');
    if (failed.length === 0) {
      if (warnings.length === 0) {
        console.log('\n✅ All checks passed! Ready for demo.\n');
        console.log('Next: npm run demo\n');
      } else {
        console.log('\n⚠️  Ready for demo but some warnings.\n');
        console.log('Review warnings above and fix if needed.\n');
      }
    } else {
      console.log('\n❌ Some checks failed. Please fix before demo.\n');
      console.log('Failed items:');
      failed.forEach(check => {
        console.log(`  - ${check.name}: ${check.message}`);
      });
      console.log();
    }

    // Save results
    this.saveResults();
  }

  // Save checklist results
  saveResults() {
    try {
      const resultsFile = path.join(__dirname, 'checklist-results.json');
      fs.writeFileSync(
        resultsFile,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            summary: {
              total: this.checks.length,
              passed: this.passedChecks,
              warnings: this.warningChecks,
              failed: this.failedChecks,
            },
            checks: this.checks,
          },
          null,
          2
        )
      );

      console.log(`📋 Results saved to: ${resultsFile}`);
    } catch (error) {
      console.log('Note: Could not save checklist results');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const checklist = new IntegrationChecklist();
  checklist.runAll().catch(console.error);
}

module.exports = IntegrationChecklist;
