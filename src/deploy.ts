/**
 * ChainVault - Deploy PurchaseDeliveryContract to Midnight Testnet
 *
 * This script deploys the privacy-preserving supply chain contract
 * with encrypted price storage and ZK proof capabilities.
 */

import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  NetworkId,
  setNetworkId,
  getZswapNetworkId,
  getLedgerNetworkId
} from "@midnight-ntwrk/midnight-js-network-id";
import { createBalancedTx } from "@midnight-ntwrk/midnight-js-types";
import { nativeToken, Transaction } from "@midnight-ntwrk/ledger";
import { Transaction as ZswapTransaction } from "@midnight-ntwrk/zswap";
import { WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import * as Rx from "rxjs";
import { type Wallet } from "@midnight-ntwrk/wallet-api";

// Fix WebSocket for Node.js environment
// @ts-ignore
globalThis.WebSocket = WebSocket;

// Configure for Midnight Testnet
setNetworkId(NetworkId.TestNet);

// Testnet connection endpoints
const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300"
};

/**
 * Wait for wallet to sync and receive funds
 */
const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state) => {
        if (state.syncProgress) {
          console.log(
            `Sync progress: synced=${state.syncProgress.synced}, sourceGap=${state.syncProgress.lag.sourceGap}, applyGap=${state.syncProgress.lag.applyGap}`
          );
        }
      }),
      Rx.filter((state) => state.syncProgress?.synced === true),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
      Rx.tap((balance) => console.log(`Wallet funded with balance: ${balance}`))
    )
  );

/**
 * Main deployment function
 */
async function main() {
  console.log("=".repeat(70));
  console.log("ChainVault - Privacy-Preserving Supply Chain Deployment");
  console.log("=".repeat(70));
  console.log();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Step 1: Wallet Setup
    console.log("[1/6] Wallet Setup");
    console.log("-".repeat(70));

    const choice = await rl.question("Do you have a wallet seed? (y/n): ");

    let walletSeed: string;
    if (choice.toLowerCase() === "y" || choice.toLowerCase() === "yes") {
      // Use existing seed
      walletSeed = await rl.question("Enter your 64-character seed: ");
    } else {
      // Generate new wallet seed
      const bytes = new Uint8Array(32);
      // @ts-ignore
      crypto.getRandomValues(bytes);
      walletSeed = Array.from(bytes, (b) =>
        b.toString(16).padStart(2, "0")
      ).join("");
      console.log("\n" + "!".repeat(70));
      console.log("IMPORTANT: SAVE THIS SEED - YOU'LL NEED IT TO RECOVER YOUR WALLET");
      console.log("!".repeat(70));
      console.log(`\nWallet Seed: ${walletSeed}\n`);
      console.log("!".repeat(70));
    }

    // Step 2: Build wallet
    console.log("\n[2/6] Building Wallet...");
    console.log("-".repeat(70));

    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      "info"
    );

    wallet.start();
    const state = await Rx.firstValueFrom(wallet.state());

    console.log(`Wallet Address: ${state.address}`);

    // Step 3: Check balance
    console.log("\n[3/6] Checking Balance...");
    console.log("-".repeat(70));

    let balance = state.balances[nativeToken()] || 0n;

    if (balance === 0n) {
      console.log("Balance: 0 tDUST");
      console.log("\nYou need testnet tokens to deploy the contract.");
      console.log("Visit: https://midnight.network/test-faucet");
      console.log(`Enter your wallet address: ${state.address}`);
      console.log("\nWaiting for funds (this may take 1-2 minutes)...");
      balance = await waitForFunds(wallet);
    }

    console.log(`Balance: ${balance} tDUST`);

    // Step 4: Load compiled contract
    console.log("\n[4/6] Loading Compiled Contract...");
    console.log("-".repeat(70));

    const contractPath = path.join(process.cwd(), "contracts");
    const contractModulePath = path.join(
      contractPath,
      "managed",
      "purchase-delivery",
      "contract",
      "index.cjs"
    );

    if (!fs.existsSync(contractModulePath)) {
      console.error("ERROR: Contract not found!");
      console.error("Run: npm run compile");
      process.exit(1);
    }

    console.log("Loading PurchaseDeliveryContract...");
    const PurchaseDeliveryModule = await import(contractModulePath);
    const contractInstance = new PurchaseDeliveryModule.Contract({});
    console.log("Contract loaded successfully");

    // Step 5: Setup providers
    console.log("\n[5/6] Configuring Providers...");
    console.log("-".repeat(70));

    const walletState = await Rx.firstValueFrom(wallet.state());

    const walletProvider = {
      coinPublicKey: walletState.coinPublicKey,
      encryptionPublicKey: walletState.encryptionPublicKey,
      balanceTx(tx: any, newCoins: any) {
        return wallet
          .balanceTransaction(
            ZswapTransaction.deserialize(
              tx.serialize(getLedgerNetworkId()),
              getZswapNetworkId()
            ),
            newCoins
          )
          .then((tx) => wallet.proveTransaction(tx))
          .then((zswapTx) =>
            Transaction.deserialize(
              zswapTx.serialize(getZswapNetworkId()),
              getLedgerNetworkId()
            )
          )
          .then(createBalancedTx);
      },
      submitTx(tx: any) {
        return wallet.submitTransaction(tx);
      }
    };

    const zkConfigPath = path.join(contractPath, "managed", "purchase-delivery");
    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: "purchase-delivery-state"
      }),
      publicDataProvider: indexerPublicDataProvider(
        TESTNET_CONFIG.indexer,
        TESTNET_CONFIG.indexerWS
      ),
      zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
      proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
      walletProvider: walletProvider,
      midnightProvider: walletProvider
    };

    console.log("Providers configured:");
    console.log("  - Private state provider: LevelDB");
    console.log("  - Public data provider: Indexer");
    console.log("  - ZK config provider: NodeZkConfigProvider");
    console.log("  - Proof provider: HTTP client (localhost:6300)");

    // Step 6: Deploy contract
    console.log("\n[6/6] Deploying Contract to Midnight Testnet...");
    console.log("-".repeat(70));
    console.log("This may take 30-60 seconds...");
    console.log();

    const deployed = await deployContract(providers, {
      contract: contractInstance,
      privateStateId: "purchaseDeliveryState",
      initialPrivateState: {}
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;

    // Save deployment information
    console.log("\n" + "=".repeat(70));
    console.log("DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(70));
    console.log(`\nContract Address: ${contractAddress}`);
    console.log(`Deployed At: ${new Date().toISOString()}`);
    console.log();

    const deploymentInfo = {
      contractAddress,
      deployedAt: new Date().toISOString(),
      network: "testnet-02",
      walletAddress: state.address,
      contractName: "PurchaseDeliveryContract",
      features: [
        "Encrypted price storage",
        "ZK proof generation for quantity",
        "Automatic payment release on delivery",
        "Role-based selective disclosure",
        "GPS-verified delivery confirmation"
      ]
    };

    fs.writeFileSync(
      "deployment.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Deployment info saved to: deployment.json");
    console.log();
    console.log("Next steps:");
    console.log("  1. Share contract address with team");
    console.log("  2. Use helper scripts to interact with contract:");
    console.log("     - npm run create-order");
    console.log("     - npm run approve-order");
    console.log("     - npm run deliver-order");
    console.log("     - npm run view-order");
    console.log();
    console.log("=".repeat(70));

    // Close wallet connection
    await wallet.close();

  } catch (error) {
    console.error("\n" + "!".repeat(70));
    console.error("DEPLOYMENT FAILED");
    console.error("!".repeat(70));
    console.error(error);
    console.error();
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
