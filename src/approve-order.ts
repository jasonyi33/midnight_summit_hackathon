/**
 * ChainVault - Approve Order Helper Script
 *
 * Buyer approves order after verifying quantity via ZK proof.
 * Demonstrates selective disclosure: buyer sees quantity but not price.
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
import * as crypto from "crypto";
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
 * Verify quantity commitment (ZK proof simulation)
 */
function verifyQuantityProof(quantity: string, nonce: string, commitment: string): boolean {
  const computed = crypto.createHash("sha256").update(quantity + nonce).digest("hex");
  return computed === commitment;
}

/**
 * Main function to approve an order
 */
async function main() {
  console.log("=".repeat(70));
  console.log("ChainVault - Approve Order (Buyer)");
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

    // Step 1: Get approval details
    console.log("[1/4] Order Approval Details");
    console.log("-".repeat(70));

    const orderId = await rl.question("Order ID to approve: ");
    const buyerAddress = await rl.question("Your buyer address: ");

    // Step 2: Verify quantity proof (ZK proof)
    console.log("\n[2/4] Verifying Quantity Proof");
    console.log("-".repeat(70));
    console.log("Note: In production, supplier provides quantity + proof");
    console.log("Buyer verifies WITHOUT seeing price");
    console.log();

    const quantity = await rl.question("Quantity (from supplier): ");
    const quantityNonce = await rl.question("Quantity nonce (from supplier): ");
    const quantityCommitment = await rl.question("Expected commitment: ");

    const isValid = verifyQuantityProof(quantity, quantityNonce, quantityCommitment);

    if (!isValid) {
      console.error("\nERROR: Quantity proof verification FAILED!");
      console.error("The quantity does not match the commitment.");
      console.error("Order may be fraudulent. Aborting...");
      process.exit(1);
    }

    console.log("\nQuantity proof VERIFIED!");
    console.log(`Confirmed quantity: ${quantity} units`);
    console.log("Price remains ENCRYPTED and hidden from buyer");

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

    // Step 4: Submit approval transaction
    console.log("\n[4/4] Approving Order on Chain");
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

    console.log("Calling approveOrder circuit...");

    // Call approveOrder circuit
    const witnesses = {
      orderIdToApprove: orderId,
      buyer: buyerAddress,
      quantityProof: quantityCommitment, // ZK proof that quantity is correct
      approvedFlag: "1", // 1 = true
      approvedStatus: "1" // 1 = Approved
    };

    // @ts-ignore
    await deployedContract.callTx.approveOrder(witnesses);

    console.log("\n" + "=".repeat(70));
    console.log("ORDER APPROVED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log(`\nOrder ID: ${orderId}`);
    console.log(`Buyer: ${buyerAddress}`);
    console.log(`Verified Quantity: ${quantity} units`);
    console.log();
    console.log("Privacy Features Demonstrated:");
    console.log(`  - Buyer verified quantity via ZK proof`);
    console.log(`  - Price remains encrypted and hidden`);
    console.log(`  - Order approved without revealing price`);
    console.log();
    console.log("Next Steps:");
    console.log(`  - Logistics provider delivers to GPS coordinates`);
    console.log(`  - Payment will auto-release on delivery confirmation`);
    console.log();
    console.log("=".repeat(70));

    await wallet.close();

  } catch (error) {
    console.error("\n" + "!".repeat(70));
    console.error("APPROVE ORDER FAILED");
    console.error("!".repeat(70));
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
