#!/usr/bin/env node

/**
 * Get Service Wallet Address
 * 
 * This script retrieves the wallet address for the backend service wallet
 * so you can fund it with tDUST tokens.
 */

const path = require('path');

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         ChainVault - Get Service Wallet Address              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log();

  try {
    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

    const walletSeed = process.env.MIDNIGHT_SERVICE_WALLET_SEED;

    if (!walletSeed || walletSeed === 'YOUR_WALLET_SEED_HERE') {
      console.error('❌ Error: Wallet seed not configured in backend/.env');
      console.error('   Please run: node configure-backend-wallet.js');
      process.exit(1);
    }

    console.log('🔄 Loading Midnight SDK...');
    
    // Dynamically import ES modules
    const { WalletBuilder } = await import('@midnight-ntwrk/wallet');
    const { NetworkId, setNetworkId, getZswapNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');

    // Set network to testnet
    setNetworkId(NetworkId.TestNet);

    const TESTNET_CONFIG = {
      indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
      indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
      node: 'https://rpc.testnet-02.midnight.network',
      proofServer: 'http://127.0.0.1:6300'
    };

    console.log('🔄 Building wallet from seed...');

    // Build wallet
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      'error'
    );

    wallet.start();

    console.log('🔄 Waiting for wallet to sync (this may take a moment)...');

    // Get wallet state
    const Rx = await import('rxjs');
    const state = await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.timeout(15000),
        Rx.take(1)
      )
    ).catch(() => {
      // If timeout, get whatever state is available
      return new Promise(resolve => {
        const sub = wallet.state().subscribe(s => {
          resolve(s);
          sub.unsubscribe();
        });
      });
    });

    console.log();
    console.log('✅ Service Wallet Information:');
    console.log('━'.repeat(70));
    console.log();
    console.log('📍 Wallet Address:');
    console.log(state.address || 'Syncing...');
    console.log();

    if (state.balances) {
      const balance = state.balances['tDUST'] || 0n;
      console.log('💰 Balance:', balance.toString(), 'tDUST');
      console.log();

      if (balance === 0n) {
        console.log('⚠️  Wallet has no funds!');
        console.log();
        console.log('To fund your wallet:');
        console.log('1. Copy the wallet address above');
        console.log('2. Visit: https://faucet.midnight.network');
        console.log('3. Paste the address and request tDUST tokens');
        console.log('4. Wait ~30 seconds for the transaction to confirm');
        console.log('5. Run this script again to verify');
      } else {
        console.log('✅ Wallet is funded and ready to use!');
      }
    } else {
      console.log('⚠️  Balance information not available yet (wallet still syncing)');
      console.log('   This is normal. The wallet will sync when the backend starts.');
    }

    console.log();
    console.log('━'.repeat(70));
    console.log();
    console.log('Next steps:');
    console.log('1. Fund the wallet at https://faucet.midnight.network (if needed)');
    console.log('2. Start the backend: cd backend && npm run dev');
    console.log('3. Backend will automatically use this wallet for transactions');
    console.log();

    await wallet.close();

  } catch (error) {
    console.error();
    console.error('❌ Error:', error.message);
    console.error();
    
    if (error.message.includes('Cannot find module')) {
      console.error('💡 Tip: Make sure Midnight SDK packages are installed');
      console.error('   Run: cd backend && npm install');
    }
    
    process.exit(1);
  }
}

main();
