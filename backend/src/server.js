/**
 * ChainVault Express Server with WebSocket Support
 *
 * Minimal server for 24-hour hackathon demo
 * - In-memory state management (no database)
 * - WebSocket for real-time updates
 * - RESTful API endpoints
 * - CORS enabled for frontend integration
 * - Mock GPS Oracle for shipment tracking (Phase 2)
 * - Blockchain integration with graceful degradation (Phase 3)
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const state = require('./models/state');
const websocketService = require('./services/websocket');
const oracleService = require('./services/oracle');
const blockchainService = require('./services/blockchain');
const apiRoutes = require('./routes/api');

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Create Express app
const app = express();

// Create HTTP server (needed for WebSocket)
const server = http.createServer(app);

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chainvault-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    websocket: {
      connections: websocketService.getConnectionCount()
    },
    oracle: oracleService.getStatus(),
    blockchain: blockchainService.getStatus(),
    stats: state.getStats()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ChainVault Backend API',
    version: '1.0.0',
    description: 'Privacy-preserving supply chain contract automation',
    endpoints: {
      health: '/health',
      api: '/api',
      contracts: '/api/contracts',
      events: '/api/events',
      users: '/api/users',
      oracle: '/api/oracle',
      blockchain: '/api/blockchain/status'
    },
    websocket: {
      url: `ws://${HOST}:${PORT}`,
      connections: websocketService.getConnectionCount()
    },
    oracle: oracleService.getStatus(),
    blockchain: blockchainService.getStatus()
  });
});

// API routes
app.use('/api', apiRoutes);

// Oracle control endpoints
app.get('/api/oracle/status', (req, res) => {
  res.json({
    success: true,
    data: oracleService.getStatus()
  });
});

app.post('/api/oracle/start', (req, res) => {
  oracleService.start();
  res.json({
    success: true,
    message: 'Oracle service started',
    data: oracleService.getStatus()
  });
});

app.post('/api/oracle/stop', (req, res) => {
  oracleService.stop();
  res.json({
    success: true,
    message: 'Oracle service stopped',
    data: oracleService.getStatus()
  });
});

app.post('/api/oracle/track/:contractId', (req, res) => {
  const { contractId } = req.params;
  const success = oracleService.trackContract(contractId);

  if (success) {
    res.json({
      success: true,
      message: `Started tracking contract ${contractId}`
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Contract not found or already being tracked'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize WebSocket server
websocketService.initialize(server);

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n[Server] Shutting down gracefully...');

  // Stop oracle service
  oracleService.stop();

  server.close(() => {
    console.log('[Server] HTTP server closed');
    websocketService.close();
    console.log('[Server] Shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
server.listen(PORT, HOST, () => {
  console.log('\n===========================================');
  console.log('  ChainVault Backend Server');
  console.log('===========================================');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Server:      http://${HOST}:${PORT}`);
  console.log(`  WebSocket:   ws://${HOST}:${PORT}`);
  console.log(`  Health:      http://${HOST}:${PORT}/health`);
  console.log('===========================================\n');
  console.log('[Server] Ready to accept connections');
  console.log('[WebSocket] Ready for real-time updates');
  console.log('[State] In-memory storage initialized');
  console.log(`[Users] ${Object.keys(state.getUsers()).length} demo users loaded`);

  // Display blockchain status
  const blockchainStatus = blockchainService.getStatus();
  console.log('\n[Blockchain] Integration status:');
  console.log(`  Mode:            ${blockchainStatus.mockMode ? 'MOCK (simulated)' : 'LIVE (on-chain)'}`);
  console.log(`  Contract:        ${blockchainStatus.contractAddress}`);
  console.log(`  Network:         ${blockchainStatus.networkUrl}`);
  console.log(`  Message:         ${blockchainStatus.message}`);

  // Start GPS Oracle service automatically
  console.log('\n[Oracle] Starting GPS Oracle service...');
  oracleService.start();

  console.log('\nPress CTRL+C to stop\n');
});

module.exports = { app, server };
