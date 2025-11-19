/**
 * Cryptographic Utilities for ZK Proof Commitment Scheme
 *
 * Implements proper cryptographic commitments for privacy-preserving supply chain
 *
 * Commitment Scheme:
 * - commitment = H(value || nonce)
 * - Supplier creates commitment with random nonce
 * - Supplier shares value and nonce with buyer off-chain
 * - Buyer verifies: H(received_value || received_nonce) == stored_commitment
 * - This proves buyer knows the correct value without revealing other data (like price)
 *
 * Security:
 * - Uses cryptographically secure random nonces (32 bytes)
 * - Uses SHA-256 for commitment hash
 * - Nonces must be kept secret until shared with authorized party
 */

const crypto = require('crypto');

class CryptoService {
  /**
   * Generate a cryptographically secure random nonce
   *
   * @param {number} bytes - Number of random bytes (default: 32)
   * @returns {string} Hex-encoded random nonce
   */
  generateNonce(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Create a commitment to a value using a nonce
   *
   * Commitment = SHA256(value || nonce)
   *
   * @param {string|number} value - The value to commit to
   * @param {string} nonce - Random nonce (hex string)
   * @returns {string} Hex-encoded commitment hash
   */
  createCommitment(value, nonce) {
    const data = String(value) + nonce;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify a commitment
   *
   * Checks if H(claimedValue || nonce) == storedCommitment
   *
   * @param {string|number} claimedValue - The claimed value
   * @param {string} nonce - The nonce (witness)
   * @param {string} storedCommitment - The stored commitment hash
   * @returns {boolean} True if commitment is valid
   */
  verifyCommitment(claimedValue, nonce, storedCommitment) {
    const computedCommitment = this.createCommitment(claimedValue, nonce);
    return computedCommitment === storedCommitment;
  }

  /**
   * Encrypt data using AES-256-GCM
   *
   * Used to encrypt price data that only supplier can decrypt
   *
   * @param {string} data - Data to encrypt
   * @param {string} key - Encryption key (hex string, 32 bytes)
   * @returns {Object} { encrypted, iv, authTag }
   */
  encrypt(data, key) {
    // Generate random IV (initialization vector)
    const iv = crypto.randomBytes(16);

    // Create cipher
    const keyBuffer = Buffer.from(key, 'hex');
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    // Encrypt data
    let encrypted = cipher.update(String(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   *
   * @param {string} encrypted - Encrypted data (hex string)
   * @param {string} key - Decryption key (hex string, 32 bytes)
   * @param {string} iv - Initialization vector (hex string)
   * @param {string} authTag - Authentication tag (hex string)
   * @returns {string} Decrypted data
   */
  decrypt(encrypted, key, iv, authTag) {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate an encryption key for price encryption
   *
   * In production, this would be derived from supplier's wallet keys
   * For demo, we generate a random key per order
   *
   * @returns {string} Hex-encoded encryption key (32 bytes)
   */
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a complete ZK proof commitment package
   *
   * This creates all the commitments needed for a privacy-preserving order:
   * - Price commitment (for ZK proof without revealing price)
   * - Quantity commitment (for buyer to verify quantity)
   * - Encrypted price (only supplier can decrypt)
   *
   * @param {Object} orderData - { price, quantity }
   * @returns {Object} Commitment package with nonces
   */
  createOrderCommitments(orderData) {
    const { price, quantity } = orderData;

    // Generate random nonces
    const priceNonce = this.generateNonce();
    const quantityNonce = this.generateNonce();
    const encryptionKey = this.generateEncryptionKey();

    // Create commitments
    const priceCommitment = this.createCommitment(price, priceNonce);
    const quantityCommitment = this.createCommitment(quantity, quantityNonce);

    // Encrypt price (only supplier can decrypt with their key)
    const encryptedPrice = this.encrypt(price, encryptionKey);

    return {
      // Commitments (stored on-chain)
      priceCommitment,
      quantityCommitment,
      encryptedPrice: JSON.stringify(encryptedPrice),

      // Witnesses (stored securely off-chain, shared selectively)
      witnesses: {
        priceNonce,
        quantityNonce,
        encryptionKey
      },

      // Metadata
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Verify quantity proof (ZK proof verification)
   *
   * This is the core ZK proof verification:
   * - Buyer receives quantity and nonce from supplier (off-chain)
   * - Buyer computes commitment and verifies it matches on-chain commitment
   * - If match, buyer has proven knowledge of correct quantity without seeing price
   *
   * @param {Object} proof - { quantity, nonce, commitment }
   * @returns {boolean} True if proof is valid
   */
  verifyQuantityProof(proof) {
    const { quantity, nonce, commitment } = proof;
    return this.verifyCommitment(quantity, nonce, commitment);
  }

  /**
   * Create a proof package for buyer to verify
   *
   * Supplier creates this package to share with buyer
   * Contains everything buyer needs to verify quantity (but not price)
   *
   * @param {number} quantity - Order quantity
   * @param {string} quantityNonce - Quantity nonce (witness)
   * @param {string} quantityCommitment - Stored commitment
   * @returns {Object} Proof package for buyer
   */
  createQuantityProofPackage(quantity, quantityNonce, quantityCommitment) {
    return {
      quantity,
      nonce: quantityNonce,
      commitment: quantityCommitment,
      timestamp: new Date().toISOString(),
      // Proof metadata
      proofType: 'quantity_commitment',
      algorithm: 'SHA256'
    };
  }
}

// Export singleton instance
module.exports = new CryptoService();
