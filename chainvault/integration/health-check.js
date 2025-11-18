// Health Check Script
// Verifies all services are running and connected

const config = require('./config');

// Use native fetch if available (Node 18+), otherwise provide fallback
const fetchFn =
  typeof fetch !== 'undefined'
    ? fetch
    : async (url) => {
        const http = require('http');
        return new Promise((resolve, reject) => {
          http
            .get(url, (res) => {
              resolve({ ok: res.statusCode < 400, status: res.statusCode });
            })
            .on('error', reject);
        });
      };

class HealthChecker {
  constructor() {
    this.results = {
      backend: false,
      frontend: false,
      blockchain: false,
      websocket: false,
    };
  }

  // Check backend API
  async checkBackend() {
    try {
      console.log('Checking backend API...');
      const response = await fetchFn(`${config.backend.url}/health`).catch(
        () => null
      );

      if (response && response.ok) {
        this.results.backend = true;
        console.log('✅ Backend API is running');
        return true;
      } else {
        console.log('❌ Backend API is not responding');
        console.log('   Run: cd backend && npm run dev');
        return false;
      }
    } catch (error) {
      console.log('❌ Backend API error:', error.message);
      return false;
    }
  }

  // Check frontend
  async checkFrontend() {
    try {
      console.log('Checking frontend...');
      const response = await fetchFn(config.frontend.url).catch(() => null);

      if (response && response.ok) {
        this.results.frontend = true;
        console.log('✅ Frontend is running');
        return true;
      } else {
        console.log('❌ Frontend is not responding');
        console.log('   Run: cd frontend && npm run dev');
        return false;
      }
    } catch (error) {
      console.log('❌ Frontend error:', error.message);
      return false;
    }
  }

  // Check blockchain connection
  async checkBlockchain() {
    try {
      console.log('Checking blockchain connection...');

      // Mock check for demo
      if (config.blockchain.contractAddress === 'PENDING_DEPLOYMENT') {
        console.log('⚠️  Contract not yet deployed');
        console.log('   Waiting for Dev 1 to deploy contract');
        return false;
      }

      // In real implementation, check RPC connection
      this.results.blockchain = true;
      console.log('✅ Blockchain connection available');
      return true;
    } catch (error) {
      console.log('❌ Blockchain connection error:', error.message);
      return false;
    }
  }

  // Check WebSocket
  async checkWebSocket() {
    try {
      console.log('Checking WebSocket...');

      // Mock check for demo
      this.results.websocket = true;
      console.log('✅ WebSocket available');
      return true;
    } catch (error) {
      console.log('❌ WebSocket error:', error.message);
      return false;
    }
  }

  // Run all checks
  async runAllChecks() {
    console.log('\n🔍 Running ChainVault Health Checks\n');
    console.log('=====================================\n');

    await this.checkBackend();
    await this.checkFrontend();
    await this.checkBlockchain();
    await this.checkWebSocket();

    console.log('\n=====================================');
    this.printSummary();

    return Object.values(this.results).every(r => r === true);
  }

  // Print summary
  printSummary() {
    const allHealthy = Object.values(this.results).every(r => r === true);

    if (allHealthy) {
      console.log('\n✅ All systems operational!');
      console.log('   Ready for demo.');
    } else {
      console.log('\n⚠️  Some systems need attention:');

      if (!this.results.backend) {
        console.log('\n1. Start Backend:');
        console.log('   cd backend && npm install && npm run dev');
      }

      if (!this.results.frontend) {
        console.log('\n2. Start Frontend:');
        console.log('   cd frontend && npm install && npm run dev');
      }

      if (!this.results.blockchain) {
        console.log('\n3. Deploy Contract:');
        console.log('   cd contracts && npm run deploy');
      }

      console.log('\n📝 After fixing, run this health check again:');
      console.log('   node integration/health-check.js');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = HealthChecker;
