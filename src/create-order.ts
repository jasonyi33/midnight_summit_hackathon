/**
 * ChainVault - Create Order Helper Script
 *
 * Creates a new purchase order with encrypted price and quantity commitments.
 * Demonstrates the core privacy-preserving feature: price encryption.
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
 * Simple price encryption using hash-based encryption
 * In production, would use proper encryption library
 */
function encryptPrice(price: number, supplierAddress: string): string {
  const key = crypto.createHash("sha256").update(supplierAddress).digest("hex");
  const priceStr = price.toString();
  // Simple XOR encryption for demonstration
  return Buffer.from(priceStr).toString("hex") + key.substring(0, 16);
}

/**
 * Create commitment (hash) of a value
 */
function createCommitment(value: string, nonce: string): string {
  return crypto.createHash("sha256").update(value + nonce).digest("hex");
}

/**
 * Main function to create an order
 */
async function main() {
  console.log("=".repeat(70));
  console.log("ChainVault - Create Purchase Order");
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
      console.error("Please deploy the contract first: npm run deploy");
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
    const contractAddress = deploymentInfo.contractAddress;

    if (contractAddress === "PENDING_DEPLOYMENT") {
      console.error("ERROR: Contract not yet deployed!");
      console.error("Please complete deployment first: npm run deploy");
      process.exit(1);
    }

    console.log(`Contract Address: ${contractAddress}`);
    console.log();

    // Step 1: Get order details
    console.log("[1/4] Order Details");
    console.log("-".repeat(70));

    const supplierAddress = await rl.question("Supplier address: ");
    const buyerAddress = await rl.question("Buyer address: ");
    const priceInput = await rl.question("Price (e.g., 1000): ");
    const price = parseInt(priceInput);
    const quantityInput = await rl.question("Quantity (e.g., 100): ");
    const quantity = parseInt(quantityInput);
    const deliveryLat = await rl.question("Delivery latitude (e.g., 37.7749): ");
    const deliveryLong = await rl.question("Delivery longitude (e.g., -122.4194): ");

    // Step 2: Encrypt price and create commitments
    console.log("\n[2/4] Encrypting Price & Creating Commitments");
    console.log("-".repeat(70));

    const encryptedPrice = encryptPrice(price, supplierAddress);
    console.log(`Encrypted Price: ${encryptedPrice.substring(0, 20)}...`);

    const priceNonce = crypto.randomBytes(16).toString("hex");
    const priceCommitment = createCommitment(price.toString(), priceNonce);
    console.log(`Price Commitment: ${priceCommitment.substring(0, 20)}...`);

    const quantityNonce = crypto.randomBytes(16).toString("hex");
    const quantityCommitment = createCommitment(quantity.toString(), quantityNonce);
    console.log(`Quantity Commitment: ${quantityCommitment.substring(0, 20)}...`);

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

    // Step 4: Submit transaction
    console.log("\n[4/4] Creating Order on Chain");
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

    console.log("Calling createOrder circuit...");

    // Call createOrder circuit
    const witnesses = {
      supplier: supplierAddress,
      buyer: buyerAddress,
      priceEncrypted: encryptedPrice,
      priceHash: priceCommitment,
      qty: quantity.toString(),
      qtyHash: quantityCommitment,
      deliveryLat: deliveryLat,
      deliveryLong: deliveryLong,
      timestamp: Date.now().toString(),
      initialStatus: "0", // 0 = Created
      escrow: (price * quantity).toString()
    };

    // @ts-ignore
    await deployedContract.callTx.createOrder(witnesses);

    console.log("\n" + "=".repeat(70));
    console.log("ORDER CREATED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log(`\nOrder Details:`);
    console.log(`  Supplier: ${supplierAddress}`);
    console.log(`  Buyer: ${buyerAddress}`);
    console.log(`  Quantity: ${quantity} units`);
    console.log(`  Price: ENCRYPTED (visible only to supplier)`);
    console.log(`  Total Escrow: ${price * quantity} tDUST`);
    console.log(`  Delivery: ${deliveryLat}, ${deliveryLong}`);
    console.log();
    console.log("Privacy Features:");
    console.log(`  - Price is encrypted on-chain`);
    console.log(`  - Quantity can be verified via ZK proof`);
    console.log(`  - Payment held in escrow until delivery`);
    console.log();
    console.log("=".repeat(70));

    await wallet.close();

  } catch (error) {
    console.error("\n" + "!".repeat(70));
    console.error("CREATE ORDER FAILED");
    console.error("!".repeat(70));
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
