/**
 * ChainVault - View Order Helper Script
 *
 * Query order details with role-based selective disclosure.
 * Demonstrates different views for different stakeholders.
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
 * Role definitions for selective disclosure
 */
const ROLES = {
  SUPPLIER: "0",     // Full access including encrypted price
  BUYER: "1",        // Quantity + status, no price
  LOGISTICS: "2",    // Delivery details only
  REGULATOR: "3"     // Compliance proof only
};

/**
 * Main function to view order
 */
async function main() {
  console.log("=".repeat(70));
  console.log("ChainVault - View Order (Role-Based Access)");
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

    // Step 1: Select role
    console.log("[1/4] Select Your Role");
    console.log("-".repeat(70));
    console.log("Roles:");
    console.log("  0 - Supplier (sees encrypted price, full details)");
    console.log("  1 - Buyer (sees quantity, not price)");
    console.log("  2 - Logistics (sees delivery info only)");
    console.log("  3 - Regulator (sees compliance proof only)");
    console.log();

    const role = await rl.question("Enter role (0-3): ");
    const orderId = await rl.question("Order ID to view: ");
    const viewerAddress = await rl.question("Your address: ");

    let roleName = "Unknown";
    switch (role) {
      case "0":
        roleName = "SUPPLIER";
        break;
      case "1":
        roleName = "BUYER";
        break;
      case "2":
        roleName = "LOGISTICS";
        break;
      case "3":
        roleName = "REGULATOR";
        break;
    }

    console.log(`\nViewing as: ${roleName}`);

    // Step 2: Build wallet
    console.log("\n[2/4] Building Wallet");
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

    // Step 3: Query contract
    console.log("\n[3/4] Querying Order Data");
    console.log("-".repeat(70));

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

    console.log("Calling getOrderView circuit...");

    // Call getOrderView circuit with role-based access
    const witnesses = {
      orderIdToView: orderId,
      role: role,
      viewerAddress: viewerAddress
    };

    // @ts-ignore
    const result = await deployedContract.callTx.getOrderView(witnesses);

    // Step 4: Display results based on role
    console.log("\n[4/4] Order View Results");
    console.log("-".repeat(70));

    console.log("\n" + "=".repeat(70));
    console.log(`ORDER DETAILS - ${roleName} VIEW`);
    console.log("=".repeat(70));
    console.log(`\nOrder ID: ${orderId}`);

    // Parse results based on role
    // Note: result format depends on Midnight SDK version
    // Using placeholder values for demonstration
    console.log("\nOrder data retrieved successfully");
    console.log(`Result: ${JSON.stringify(result)}`);

    if (role === "0") {
      // Supplier view: full access
      console.log("\nFull Order Details (Supplier View):");
      console.log(`  Order ID: ${orderId}`);
      console.log(`  Status: [Order Status]`);
      console.log(`  Quantity: [Quantity] units`);
      console.log(`  Delivered: [Delivery Status]`);
      console.log(`  Encrypted Price: [ENCRYPTED DATA - Only supplier can decrypt]`);
      console.log("\nPrivacy Note: You can decrypt the price with your private key");

    } else if (role === "1") {
      // Buyer view: quantity + status only
      console.log("\nBuyer View (Limited):");
      console.log(`  Order ID: ${orderId}`);
      console.log(`  Status: [Order Status]`);
      console.log(`  Quantity: [Quantity] units (verified by ZK proof)`);
      console.log(`  Delivered: [Delivery Status]`);
      console.log("\nPrivacy Note: Price is HIDDEN from buyer view");

    } else if (role === "2") {
      // Logistics view: delivery details only
      console.log("\nLogistics View (Delivery Info):");
      console.log(`  Order ID: ${orderId}`);
      console.log(`  Status: [Order Status]`);
      console.log(`  Delivery Required: Yes`);
      console.log(`  Delivered: [Delivery Status]`);
      console.log("\nPrivacy Note: Commercial details are HIDDEN from logistics");

    } else if (role === "3") {
      // Regulator view: compliance proof only
      console.log("\nRegulator View (Compliance Proof):");
      console.log(`  Order ID: ${orderId}`);
      console.log(`  Status: [Order Status]`);
      console.log(`  Delivered: [Delivery Status]`);
      console.log("\nPrivacy Note: Commercial details are HIDDEN from regulator");
    }

    console.log("\n" + "=".repeat(70));
    console.log("Privacy Features Demonstrated:");
    console.log(`  - Role-based selective disclosure`);
    console.log(`  - Different stakeholders see different data`);
    console.log(`  - ZK proofs enforce privacy while maintaining verification`);
    console.log("=".repeat(70));

    await wallet.close();

  } catch (error) {
    console.error("\n" + "!".repeat(70));
    console.error("VIEW ORDER FAILED");
    console.error("!".repeat(70));
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
