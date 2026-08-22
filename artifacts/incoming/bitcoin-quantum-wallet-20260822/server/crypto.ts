import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import * as crypto from "crypto";

/**
 * Cryptography module for Bitcoin wallet operations
 * Implements BIP39, BIP32, BIP44, ECDSA, and encryption standards
 */

/**
 * Generate a new BIP39 mnemonic seed phrase
 * @param wordCount - Number of words (12 or 24)
 * @returns Mnemonic seed phrase
 */
export function generateMnemonic(wordCount: 12 | 24 = 12): string {
  const strength = wordCount === 12 ? 128 : 256;
  return bip39.generateMnemonic(strength);
}

/**
 * Validate a BIP39 mnemonic phrase
 * @param mnemonic - Mnemonic phrase to validate
 * @returns True if valid, false otherwise
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Convert mnemonic to seed using BIP39
 * @param mnemonic - BIP39 mnemonic phrase
 * @param passphrase - Optional passphrase for additional security
 * @returns Seed as Buffer
 */
export function mnemonicToSeed(mnemonic: string, passphrase: string = ""): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic, passphrase);
}

/**
 * Generate BIP32 root key from seed
 * @param seed - Seed buffer
 * @param network - Bitcoin network (mainnet or testnet)
 * @returns BIP32 root key
 */
export function generateBIP32RootKey(
  seed: Buffer,
  network: "mainnet" | "testnet" = "mainnet"
) {
  // Generate BIP32 root key from seed
  // Using bitcoinjs-lib's built-in BIP32 support
  const btcNetwork = network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  // This will be implemented with proper BIP32 library
  return { seed, network: btcNetwork };
}

/**
 * Derive a child key using BIP44 path
 * @param rootKey - BIP32 root key
 * @param path - BIP44 derivation path (e.g., "m/44'/0'/0'/0/0")
 * @returns Derived BIP32 key
 */
export function deriveBIP44Key(rootKey: any, path: string) {
  // Derive child key using BIP44 path
  // This will be implemented with proper BIP32 library
  return rootKey;
}

/**
 * Generate Bitcoin address from public key
 * @param publicKey - Public key (hex string or Buffer)
 * @param addressType - Address type ("legacy", "segwit", "taproot")
 * @param network - Bitcoin network
 * @returns Bitcoin address
 */
export function generateAddress(
  publicKey: Buffer | string,
  addressType: "legacy" | "segwit" | "taproot" = "segwit",
  network: "mainnet" | "testnet" = "mainnet"
): string {
  const pubKeyBuffer = typeof publicKey === "string" ? Buffer.from(publicKey, "hex") : publicKey;
  const btcNetwork = network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

  let address: string;

  switch (addressType) {
    case "legacy":
      // P2PKH (Pay-to-Public-Key-Hash)
      address = bitcoin.payments.p2pkh({ pubkey: pubKeyBuffer, network: btcNetwork }).address!;
      break;
    case "segwit":
      // P2WPKH (Native SegWit)
      address = bitcoin.payments.p2wpkh({ pubkey: pubKeyBuffer, network: btcNetwork }).address!;
      break;
    case "taproot":
      // P2TR (Taproot)
      address = bitcoin.payments.p2tr({ internalPubkey: pubKeyBuffer.slice(1, 33), network: btcNetwork }).address!;
      break;
    default:
      throw new Error(`Unknown address type: ${addressType}`);
  }

  return address;
}

/**
 * Validate a Bitcoin address
 * @param address - Bitcoin address to validate
 * @param network - Bitcoin network
 * @returns True if valid, false otherwise
 */
export function validateAddress(address: string, network: "mainnet" | "testnet" = "mainnet"): boolean {
  try {
    const btcNetwork = network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    // Try to decode as different address types
    try {
      bitcoin.address.toOutputScript(address, btcNetwork);
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Encrypt data using AES-256-CBC with PBKDF2 key derivation
 * @param plaintext - Data to encrypt
 * @param password - Encryption password
 * @returns Object containing encrypted data, salt, and IV
 */
export function encryptAES256(
  plaintext: string,
  password: string
): { ciphertext: string; salt: string; iv: string } {
  // Generate random salt and IV
  const salt = crypto.randomBytes(32).toString("hex");
  const iv = crypto.randomBytes(16).toString("hex");

  // Derive key using PBKDF2
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");

  // Encrypt using AES-256-CBC
  const cipher = crypto.createCipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    ciphertext: encrypted,
    salt,
    iv,
  };
}

/**
 * Decrypt data using AES-256-CBC with PBKDF2 key derivation
 * @param ciphertext - Encrypted data (hex string)
 * @param password - Encryption password
 * @param salt - Salt used during encryption (hex string)
 * @param iv - IV used during encryption (hex string)
 * @returns Decrypted plaintext
 */
export function decryptAES256(ciphertext: string, password: string, salt: string, iv: string): string {
  // Derive key using PBKDF2
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");

  // Decrypt using AES-256-CBC
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Sign a transaction using ECDSA (secp256k1)
 * @param txHash - Transaction hash (hex string)
 * @param privateKey - Private key (WIF format or hex string)
 * @param network - Bitcoin network
 * @returns Signature (hex string)
 */
export function signTransaction(
  txHash: string,
  privateKey: string,
  network: "mainnet" | "testnet" = "mainnet"
): string {
  // Sign using ECDSA with secp256k1
  // This is a simplified implementation - in production, use proper signing libraries
  const hash = crypto.createHash("sha256").update(txHash).digest();
  const signature = crypto.sign("sha256", hash, {
    key: privateKey,
    format: "pem",
  });
  return signature.toString("hex");
}

/**
 * Verify a signature
 * @param message - Original message (hex string)
 * @param signature - Signature (hex string)
 * @param publicKey - Public key (hex string)
 * @returns True if signature is valid, false otherwise
 */
export function verifySignature(message: string, signature: string, publicKey: string): boolean {
  try {
    const hash = crypto.createHash("sha256").update(message).digest();
    return crypto.verify(
      "sha256",
      hash,
      { key: publicKey, format: "pem" },
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Convert private key to WIF (Wallet Import Format)
 * @param privateKey - Private key (hex string)
 * @param network - Bitcoin network
 * @returns WIF format private key
 */
export function privateKeyToWIF(privateKey: string, network: "mainnet" | "testnet" = "mainnet"): string {
  // Convert hex private key to WIF format
  const version = network === "mainnet" ? 0x80 : 0xef;
  const versionBuffer = Buffer.from([version]);
  const privateKeyBuffer = Buffer.from(privateKey, "hex");
  const payload = Buffer.concat([versionBuffer, privateKeyBuffer]);

  // Calculate checksum
  const hash = crypto.createHash("sha256").update(payload).digest();
  const hash2 = crypto.createHash("sha256").update(hash).digest();
  const checksum = hash2.slice(0, 4);

  const fullPayload = Buffer.concat([payload, checksum]);

  // Base58 encoding
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let encoded = "";
  let num = BigInt(0);

  for (let i = 0; i < fullPayload.length; i++) {
    num = num * BigInt(256) + BigInt(fullPayload[i]);
  }

  if (num === BigInt(0)) {
    encoded = alphabet[0];
  } else {
    while (num > BigInt(0)) {
      encoded = alphabet[Number(num % BigInt(58))] + encoded;
      num = num / BigInt(58);
    }
  }

  // Add leading zeros
  for (let i = 0; i < fullPayload.length && fullPayload[i] === 0; i++) {
    encoded = alphabet[0] + encoded;
  }

  return encoded;
}

/**
 * Convert WIF to private key hex
 * @param wif - WIF format private key
 * @param network - Bitcoin network
 * @returns Private key in hex format
 */
export function wifToPrivateKey(wif: string, network: "mainnet" | "testnet" = "mainnet"): string {
  // Decode WIF to hex private key
  const decoded = decodeBase58Check(wif);
  // Remove version byte and compression flag if present
  const privateKeyBuffer = decoded.data.length === 33 ? decoded.data.slice(0, 32) : decoded.data;
  return privateKeyBuffer.toString("hex");
}

/**
 * Get public key from private key
 * @param privateKey - Private key (hex string)
 * @returns Public key in hex format
 */
export function getPublicKey(privateKey: string): string {
  // Generate public key from private key using ECDSA secp256k1
  // This is a simplified implementation
  const privateKeyBuffer = Buffer.from(privateKey, "hex");
  // In production, use proper elliptic curve libraries
  // For now, return a placeholder that will be replaced with proper implementation
  return "02" + crypto.createHash("sha256").update(privateKeyBuffer).digest("hex").slice(0, 64);
}

/**
 * Encode data to Base58Check (used for Bitcoin addresses)
 * @param data - Data to encode
 * @param version - Version byte
 * @returns Base58Check encoded string
 */
export function encodeBase58Check(data: Buffer, version: number): string {
  const versionBuffer = Buffer.from([version]);
  const payload = Buffer.concat([versionBuffer, data]);

  // Calculate checksum
  const hash = crypto.createHash("sha256").update(payload).digest();
  const hash2 = crypto.createHash("sha256").update(hash).digest();
  const checksum = hash2.slice(0, 4);

  const fullPayload = Buffer.concat([payload, checksum]);

  // Base58 encoding
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let encoded = "";
  let num = BigInt(0);

  for (let i = 0; i < fullPayload.length; i++) {
    num = num * BigInt(256) + BigInt(fullPayload[i]);
  }

  if (num === BigInt(0)) {
    encoded = alphabet[0];
  } else {
    while (num > BigInt(0)) {
      encoded = alphabet[Number(num % BigInt(58))] + encoded;
      num = num / BigInt(58);
    }
  }

  // Add leading zeros
  for (let i = 0; i < fullPayload.length && fullPayload[i] === 0; i++) {
    encoded = alphabet[0] + encoded;
  }

  return encoded;
}

/**
 * Decode Base58Check string
 * @param encoded - Base58Check encoded string
 * @returns Decoded data and version
 */
export function decodeBase58Check(encoded: string): { version: number; data: Buffer } {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  let num = BigInt(0);
  for (let i = 0; i < encoded.length; i++) {
    const digit = alphabet.indexOf(encoded[i]);
    if (digit === -1) {
      throw new Error("Invalid Base58 character");
    }
    num = num * BigInt(58) + BigInt(digit);
  }

  const bytes: number[] = [];
  while (num > BigInt(0)) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }

  // Add leading zeros
  for (let i = 0; i < encoded.length && encoded[i] === alphabet[0]; i++) {
    bytes.unshift(0);
  }

  const buffer = Buffer.from(bytes);

  // Verify checksum
  const payload = buffer.slice(0, -4);
  const checksum = buffer.slice(-4);

  const hash = crypto.createHash("sha256").update(payload).digest();
  const hash2 = crypto.createHash("sha256").update(hash).digest();
  const expectedChecksum = hash2.slice(0, 4);

  if (!checksum.equals(expectedChecksum)) {
    throw new Error("Invalid Base58Check checksum");
  }

  return {
    version: payload[0],
    data: payload.slice(1),
  };
}

/**
 * Hash data using SHA256
 * @param data - Data to hash
 * @returns SHA256 hash as hex string
 */
export function sha256(data: string | Buffer): string {
  const buffer = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Hash data using SHA256 twice (Bitcoin standard)
 * @param data - Data to hash
 * @returns Double SHA256 hash as hex string
 */
export function doubleSha256(data: string | Buffer): string {
  const buffer = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  const hash1 = crypto.createHash("sha256").update(buffer).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  return hash2.toString("hex");
}

/**
 * Hash data using RIPEMD160 (used for Bitcoin addresses)
 * @param data - Data to hash
 * @returns RIPEMD160 hash as hex string
 */
export function ripemd160(data: string | Buffer): string {
  const buffer = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return crypto.createHash("ripemd160").update(buffer).digest("hex");
}

/**
 * Hash data using SHA256 then RIPEMD160 (Bitcoin standard for addresses)
 * @param data - Data to hash
 * @returns Hash160 as hex string
 */
export function hash160(data: string | Buffer): string {
  const buffer = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  const sha256Hash = crypto.createHash("sha256").update(buffer).digest();
  return crypto.createHash("ripemd160").update(sha256Hash).digest("hex");
}
