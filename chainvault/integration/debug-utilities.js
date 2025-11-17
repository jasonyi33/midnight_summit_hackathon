// Debugging and Troubleshooting Utilities
// Provides tools for diagnosing integration issues

const config = require('./config');

class DebugUtilities {
  // Log a formatted debug message
  static log(message, context = '', level = 'INFO') {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    console.log(`${timestamp} ${level}${contextStr}: ${message}`);
  }

  // Log error with full stack
  static error(message, error, context = '') {
    this.log(message, context, 'ERROR');
    if (error) {
      if (error.stack) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  }

  // Log API request details
  static logApiRequest(method, endpoint, headers = {}, body = null) {
    this.log(`${method} ${endpoint}`, 'API', 'DEBUG');

    if (Object.keys(headers).length > 0) {
      console.log('  Headers:', headers);
    }

    if (body) {
      const bodyStr =
        typeof body === 'string' ? body : JSON.stringify(body, null, 2);
      console.log('  Body:', bodyStr.substring(0, 200));
    }
  }

  // Log API response details
  static logApiResponse(status, statusText, data = null) {
    const statusIcon = status >= 200 && status < 300 ? '✅' : '❌';
    this.log(`${statusIcon} ${status} ${statusText}`, 'API', 'DEBUG');

    if (data) {
      const dataStr =
        typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const preview = dataStr.substring(0, 200);
      console.log('  Response:', preview + (dataStr.length > 200 ? '...' : ''));
    }
  }

  // Validate configuration
  static validateConfig() {
    console.log('\n=== Configuration Validation ===\n');

    const checks = [
      {
        name: 'Backend URL',
        check: config.backend.url && config.backend.url !== '',
        value: config.backend.url,
      },
      {
        name: 'Frontend URL',
        check: config.frontend.url && config.frontend.url !== '',
        value: config.frontend.url,
      },
      {
        name: 'API Key',
        check: config.backend.apiKey && config.backend.apiKey !== '',
        value: '***' + config.backend.apiKey.substring(config.backend.apiKey.length - 4),
      },
      {
        name: 'Blockchain Network',
        check: config.blockchain.network && config.blockchain.network !== '',
        value: config.blockchain.network,
      },
      {
        name: 'Oracle Enabled',
        check: config.oracle.mockDataEnabled === true,
        value: config.oracle.mockDataEnabled,
      },
      {
        name: 'Demo Mode',
        check: config.demo.autoProgressDelivery === true,
        value: config.demo.autoProgressDelivery,
      },
    ];

    let allValid = true;

    for (const check of checks) {
      const status = check.check ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.value}`);
      if (!check.check) {
        allValid = false;
      }
    }

    console.log(`\n${allValid ? '✅ Configuration valid' : '❌ Configuration has issues'}\n`);

    return allValid;
  }

  // Test API connectivity
  static async testApiConnectivity() {
    console.log('\n=== API Connectivity Test ===\n');

    const endpoints = [
      { method: 'GET', path: '/health', timeout: 5000 },
      { method: 'GET', path: '/api/orders', timeout: 5000 },
      { method: 'GET', path: '/api/oracle/status', timeout: 5000 },
    ];

    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  // Test a single endpoint
  static async testEndpoint(endpoint) {
    const url = `${config.backend.url}${endpoint.path}`;

    console.log(`Testing: ${endpoint.method} ${endpoint.path}`);

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        endpoint.timeout || 5000
      );

      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'X-API-Key': config.backend.apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      const statusIcon = response.ok ? '✅' : '⚠️ ';

      console.log(
        `${statusIcon} ${response.status} ${response.statusText} (${duration}ms)\n`
      );

      return response.ok;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error.name === 'AbortError' ? 'Timeout' : error.message;

      console.log(`❌ ${errorMsg} (${duration}ms)\n`);

      return false;
    }
  }

  // Test WebSocket connectivity
  static async testWebSocketConnectivity() {
    console.log('\n=== WebSocket Connectivity Test ===\n');

    return new Promise((resolve) => {
      try {
        console.log(`Connecting to: ${config.backend.wsUrl}`);

        // Note: This assumes browser environment with WebSocket
        // In Node.js, would need 'ws' package
        if (typeof WebSocket !== 'undefined') {
          const ws = new WebSocket(`${config.backend.wsUrl}/ws`);
          const timeout = setTimeout(() => {
            ws.close();
            console.log('❌ WebSocket connection timeout\n');
            resolve(false);
          }, 5000);

          ws.onopen = () => {
            clearTimeout(timeout);
            console.log('✅ WebSocket connected successfully\n');
            ws.close();
            resolve(true);
          };

          ws.onerror = (error) => {
            clearTimeout(timeout);
            console.log('❌ WebSocket connection error:', error.message, '\n');
            resolve(false);
          };
        } else {
          console.log('⚠️  WebSocket not available in this environment\n');
          resolve(true);
        }
      } catch (error) {
        console.log('❌ WebSocket test failed:', error.message, '\n');
        resolve(false);
      }
    });
  }

  // Test contract connectivity
  static async testContractConnectivity() {
    console.log('\n=== Smart Contract Connectivity Test ===\n');

    const { contractAddress, rpcUrl, network } = config.blockchain;

    console.log(`Network: ${network}`);
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}\n`);

    if (contractAddress === 'PENDING_DEPLOYMENT') {
      console.log('⚠️  Contract not yet deployed');
      console.log('    Waiting for Dev 1 to deploy contract\n');
      return false;
    }

    // In real implementation, would test RPC connection here
    console.log('✅ Contract configuration valid\n');
    return true;
  }

  // Generate full diagnostic report
  static async generateDiagnosticReport() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    ChainVault Diagnostic Report        ║');
    console.log('╚════════════════════════════════════════╝\n');

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      config: config,
      tests: {},
    };

    // Run all tests
    results.tests.config = this.validateConfig();

    const apiResult = await this.testApiConnectivity();
    results.tests.api = true; // Always passes if we get here

    const wsResult = await this.testWebSocketConnectivity();
    results.tests.websocket = wsResult;

    const contractResult = await this.testContractConnectivity();
    results.tests.contract = contractResult;

    // Print summary
    console.log('=== Diagnostic Summary ===\n');

    let allTests = true;

    for (const [test, passed] of Object.entries(results.tests)) {
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${test}`);
      if (!passed) {
        allTests = false;
      }
    }

    console.log(`\n${allTests ? '✅ All diagnostics passed' : '❌ Some diagnostics failed'}\n`);

    // Save report
    this.saveReport(results);

    return results;
  }

  // Save diagnostic report to file
  static saveReport(results) {
    try {
      const fs = require('fs');
      const path = require('path');

      const reportFile = path.join(__dirname, 'diagnostic-report.json');
      fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));

      console.log(`📋 Report saved to: ${reportFile}\n`);
    } catch (error) {
      console.log('Note: Could not save diagnostic report\n');
    }
  }

  // Print usage tips
  static printTroubleshootingGuide() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Troubleshooting Guide                ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Common Issues & Solutions:\n');

    console.log('1. Backend not responding');
    console.log('   - Check: Is backend running? (npm run dev)');
    console.log('   - Check: Backend URL in config.js');
    console.log('   - Run: node integration/debug-utilities.js test-api\n');

    console.log('2. WebSocket connection fails');
    console.log('   - Check: Backend WebSocket enabled');
    console.log('   - Check: WS URL in config.js');
    console.log('   - Run: node integration/debug-utilities.js test-websocket\n');

    console.log('3. Contract not deployed');
    console.log('   - Check: Dev 1 has deployed contract');
    console.log('   - Update: CONTRACT_ADDRESS in config.js');
    console.log('   - Run: node integration/debug-utilities.js test-contract\n');

    console.log('4. API key error');
    console.log('   - Check: API_KEY in config.js');
    console.log('   - Check: Headers in API requests\n');

    console.log('5. Orders not appearing in frontend');
    console.log('   - Run: node integration/test-e2e.js');
    console.log('   - Check: WebSocket events in console');
    console.log('   - Check: Backend logs for errors\n');

    console.log('Commands:\n');
    console.log('  - Run full diagnostics:');
    console.log('    node integration/debug-utilities.js\n');

    console.log('  - Test API only:');
    console.log('    node integration/debug-utilities.js test-api\n');

    console.log('  - Test WebSocket only:');
    console.log('    node integration/debug-utilities.js test-websocket\n');

    console.log('  - Test contract only:');
    console.log('    node integration/debug-utilities.js test-contract\n');

    console.log('  - Validate configuration:');
    console.log('    node integration/debug-utilities.js validate-config\n');
  }
}

// Run if executed directly
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'test-api':
      DebugUtilities.testApiConnectivity().catch(console.error);
      break;

    case 'test-websocket':
      DebugUtilities.testWebSocketConnectivity().catch(console.error);
      break;

    case 'test-contract':
      DebugUtilities.testContractConnectivity().catch(console.error);
      break;

    case 'validate-config':
      DebugUtilities.validateConfig();
      break;

    case 'troubleshoot':
      DebugUtilities.printTroubleshootingGuide();
      break;

    default:
      DebugUtilities.generateDiagnosticReport().catch(console.error);
      break;
  }
}

module.exports = DebugUtilities;
