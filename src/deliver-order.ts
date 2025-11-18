/**
 * ChainVault - Confirm Delivery Helper Script
 *
 * Logistics provider confirms delivery at GPS location.
 * Demonstrates automatic payment release on delivery confirmation.
 */

import { WalletBuilder } from "@midnight-ntwrk/wallet";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
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
import { Transaction } from "@midnight-ntwrk/ledger";
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
 * Verify GPS coordinates are within tolerance
 */
function verifyGPSLocation(
  expectedLat: number,
  expectedLong: number,
  actualLat: number,
  actualLong: number,
  toleranceKm: number = 0.1
): boolean {
  // Simplified distance calculation
  // In production, would use proper Haversine formula
  const latDiff = Math.abs(expectedLat - actualLat);
  const longDiff = Math.abs(expectedLong - actualLong);
  const approxDistanceKm = Math.sqrt(latDiff * latDiff + longDiff * longDiff) * 111; // rough km conversion

  return approxDistanceKm <= toleranceKm;
}

/**
 * Main function to confirm delivery
 */
async function main() {
  console.log("=".repeat(70));
  console.log("ChainVault - Confirm Delivery (Logistics Provider)");
  console.log("=".repeat(70));
  console.log();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Load deployment info
    if (!fs.existsSync("deployment.json")) {
      console.error("ERROR: deployment.json not found!");
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
    const contractAddress = deploymentInfo.contractAddress;

    if (contractAddress === "PENDING_DEPLOYMENT") {
      console.error("ERROR: Contract not yet deployed!");
      process.exit(1);
    }

    console.log(`Contract Address: ${contractAddress}`);
    console.log();

    // Step 1: Get delivery details
    console.log("[1/4] Delivery Confirmation Details");
    console.log("-".repeat(70));

    const orderId = await rl.question("Order ID to confirm delivery: ");

    // Step 2: Verify GPS location
    console.log("\n[2/4] GPS Location Verification");
    console.log("-".repeat(70));

    const expectedLat = await rl.question("Expected latitude: ");
    const expectedLong = await rl.question("Expected longitude: ");
    const actualLat = await rl.question("Actual delivery latitude: ");
    const actualLong = await rl.question("Actual delivery longitude: ");

    const isLocationValid = verifyGPSLocation(
      parseFloat(expectedLat),
      parseFloat(expectedLong),
      parseFloat(actualLat),
      parseFloat(actualLong),
      0.1 // 100m tolerance
    );

    if (!isLocationValid) {
      console.error("\nWARNING: GPS location verification FAILED!");
      console.error("Actual location is too far from expected delivery point.");
      const proceed = await rl.question("Proceed anyway? (yes/no): ");
      if (proceed.toLowerCase() !== "yes") {
        console.log("Delivery confirmation aborted.");
        process.exit(0);
      }
    } else {
      console.log("\nGPS location VERIFIED!");
      console.log("Delivery is at correct location");
    }

    // Step 3: Build wallet
    console.log("\n[3/4] Building Wallet");
    console.log("-".repeat(70));

    const walletSeed = await rl.question("Enter wallet seed (64 chars): ");

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
    console.log("Wallet connected");

    // Step 4: Submit delivery confirmation
    console.log("\n[4/4] Confirming Delivery on Chain");
    console.log("-".repeat(70));
    console.log("Note: This will AUTOMATICALLY release escrowed payment!");
    console.log();

    const contractPath = path.join(process.cwd(), "contracts");
    const contractModulePath = path.join(
      contractPath,
      "managed",
      "purchase-delivery",
      "contract",
      "index.cjs"
    );

    const PurchaseDeliveryModule = await import(contractModulePath);

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

    // Find deployed contract
    const deployedContract = await findDeployedContract(
      providers,
      PurchaseDeliveryModule.Contract
    );

    console.log("Calling confirmDelivery circuit...");

    // Call confirmDelivery circuit
    const witnesses = {
      orderIdToDeliver: orderId,
      actualLat: actualLat,
      actualLong: actualLong,
      timestamp: Date.now().toString(),
      deliveredFlag: "1", // 1 = true
      deliveredStatus: "3", // 3 = Delivered
      locationTolerance: "100" // 100m tolerance
    };

    // @ts-ignore
    await deployedContract.callTx.confirmDelivery(witnesses);

    console.log("\n" + "=".repeat(70));
    console.log("DELIVERY CONFIRMED & PAYMENT RELEASED!");
    console.log("=".repeat(70));
    console.log(`\nOrder ID: ${orderId}`);
    console.log(`Delivery Location: ${actualLat}, ${actualLong}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log();
    console.log("Automatic Actions Completed:");
    console.log(`  - Delivery status updated to DELIVERED`);
    console.log(`  - Escrowed payment RELEASED to supplier`);
    console.log(`  - Order status updated to PAID`);
    console.log();
    console.log("Key Features Demonstrated:");
    console.log(`  - GPS-verified delivery confirmation`);
    console.log(`  - Automatic payment release (no manual intervention)`);
    console.log(`  - Smart contract enforced delivery conditions`);
    console.log();
    console.log("=".repeat(70));

    await wallet.close();

  } catch (error) {
    console.error("\n" + "!".repeat(70));
    console.error("DELIVERY CONFIRMATION FAILED");
    console.error("!".repeat(70));
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
