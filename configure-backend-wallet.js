#!/usr/bin/env node

/**
 * Configure Backend Wallet Script
 * 
 * This script helps you securely configure the backend service wallet
 * by updating the .env file with your wallet seed.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, 'backend', '.env');

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║         ChainVault - Backend Wallet Configuration            ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log();
console.log('This script will configure your backend service wallet.');
console.log('You can use the same wallet seed that deployed the contract.');
console.log();
console.log('⚠️  IMPORTANT: Keep your wallet seed secure and never commit it to git!');
console.log();

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.error('❌ Error: backend/.env file not found!');
      console.error('   Please make sure you are running this from the project root.');
      process.exit(1);
    }

    console.log('📄 Found backend/.env file');
    console.log();

    // Get wallet seed from user
    console.log('Please enter your wallet seed (the one used to deploy the contract):');
    console.log('It should be a 64-character hexadecimal string.');
    console.log();
    
    const seed = await question('Wallet Seed: ');
    
    // Validate seed format
    const trimmedSeed = seed.trim();
    
    if (trimmedSeed.length === 0) {
      console.error('❌ Error: Wallet seed cannot be empty!');
      rl.close();
      process.exit(1);
    }

    if (trimmedSeed.length !== 64) {
      console.warn('⚠️  Warning: Wallet seed should be 64 characters.');
      console.warn(`   Your input is ${trimmedSeed.length} characters.`);
      console.log();
      const confirm = await question('Continue anyway? (y/n): ');
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled.');
        rl.close();
        process.exit(0);
      }
    }

    if (!/^[0-9a-fA-F]+$/.test(trimmedSeed)) {
      console.warn('⚠️  Warning: Wallet seed should only contain hexadecimal characters (0-9, a-f).');
      console.log();
      const confirm = await question('Continue anyway? (y/n): ');
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled.');
        rl.close();
        process.exit(0);
      }
    }

    console.log();
    console.log('Updating backend/.env file...');

    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace the wallet seed line
    const seedPattern = /MIDNIGHT_SERVICE_WALLET_SEED=.*/;
    if (seedPattern.test(envContent)) {
      envContent = envContent.replace(
        seedPattern,
        `MIDNIGHT_SERVICE_WALLET_SEED=${trimmedSeed}`
      );
    } else {
      // Add the line if it doesn't exist
      envContent += `\n\n# Service Wallet Configuration\nMIDNIGHT_SERVICE_WALLET_SEED=${trimmedSeed}\n`;
    }

    // Write back to file
    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log('✅ Backend wallet configured successfully!');
    console.log();
    console.log('Next steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Look for: [Blockchain] ✓ Successfully connected to deployed contract!');
    console.log('3. If you see "MOCK mode", check that your wallet has tDUST tokens');
    console.log();
    console.log('💡 Tip: You can verify your wallet balance using: npm run view-order');
    console.log();

    rl.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
