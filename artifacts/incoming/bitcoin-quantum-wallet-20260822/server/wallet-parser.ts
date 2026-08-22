import * as fs from "fs";
import * as path from "path";
import { validateMnemonic } from "bip39";

/**
 * Wallet File Parser
 * Handles parsing and extraction of wallet data from various file formats
 */

export interface ParsedWallet {
  format: "txt" | "dat" | "json" | "electrum" | "unknown";
  addresses: string[];
  privateKeys: string[];
  mnemonic?: string;
  xprv?: string;
  xpub?: string;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Detect wallet file format based on content and extension
 */
export function detectWalletFormat(
  filename: string,
  content: string
): ParsedWallet["format"] {
  const ext = path.extname(filename).toLowerCase();

  // Check by extension first
  if (ext === ".dat") return "dat";
  if (ext === ".json") return "json";

  // Check by content patterns
  if (content.includes("\"addresses\"") && content.includes("\"keys\"")) {
    return "json";
  }

  if (content.includes("xprv") || content.includes("xpub")) {
    return "electrum";
  }

  // Default to TXT for plain text files
  if (ext === ".txt") return "txt";

  return "unknown";
}

/**
 * Parse TXT wallet file (plain text format with one address/key per line)
 */
export function parseTxtWallet(content: string): ParsedWallet {
  const lines = content.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

  const addresses: string[] = [];
  const privateKeys: string[] = [];
  let mnemonic: string | undefined;

  for (const line of lines) {
    // Skip comments
    if (line.startsWith("#") || line.startsWith("//")) continue;

    // Check if it's a mnemonic (12 or 24 words)
    const words = line.split(/\s+/);
    if ((words.length === 12 || words.length === 24) && validateMnemonic(line)) {
      mnemonic = line;
      continue;
    }

    // Check if it's a Bitcoin address (starts with 1, 3, or bc1)
    if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(line)) {
      addresses.push(line);
      continue;
    }

    // Check if it's a WIF private key (51 characters, starts with 5 or K/L)
    if (/^[5KL][1-9A-HJ-NP-Za-km-z]{50}$/.test(line)) {
      privateKeys.push(line);
      continue;
    }

    // Check if it's an extended private key (xprv)
    if (line.startsWith("xprv")) {
      privateKeys.push(line);
      continue;
    }

    // Check if it's an extended public key (xpub)
    if (line.startsWith("xpub")) {
      addresses.push(line);
      continue;
    }

    // Check if it's a hex-encoded private key (64 characters)
    if (/^[0-9a-fA-F]{64}$/.test(line)) {
      privateKeys.push(line);
      continue;
    }
  }

  return {
    format: "txt",
    addresses,
    privateKeys,
    mnemonic,
  };
}

/**
 * Parse JSON wallet file (Exodus, MetaMask, etc)
 */
export function parseJsonWallet(content: string): ParsedWallet {
  try {
    const data = JSON.parse(content);
    const addresses: string[] = [];
    const privateKeys: string[] = [];
    let mnemonic: string | undefined;
    let xprv: string | undefined;
    let xpub: string | undefined;

    // Extract addresses
    if (data.addresses && Array.isArray(data.addresses)) {
      addresses.push(...data.addresses);
    } else if (data.address) {
      addresses.push(data.address);
    }

    // Extract private keys
    if (data.privateKeys && Array.isArray(data.privateKeys)) {
      privateKeys.push(...data.privateKeys);
    } else if (data.privateKey) {
      privateKeys.push(data.privateKey);
    }

    // Extract keys from nested structures
    if (data.keys && Array.isArray(data.keys)) {
      for (const key of data.keys) {
        if (key.address) addresses.push(key.address);
        if (key.privateKey) privateKeys.push(key.privateKey);
      }
    }

    // Extract mnemonic
    if (data.mnemonic) {
      mnemonic = data.mnemonic;
    }

    // Extract extended keys
    if (data.xprv) {
      xprv = data.xprv;
    }
    if (data.xpub) {
      xpub = data.xpub;
    }

    // Extract from Exodus format
    if (data.wallets && Array.isArray(data.wallets)) {
      for (const wallet of data.wallets) {
        if (wallet.address) addresses.push(wallet.address);
        if (wallet.privateKey) privateKeys.push(wallet.privateKey);
      }
    }

    return {
      format: "json",
      addresses: Array.from(new Set(addresses)), // Remove duplicates
      privateKeys: Array.from(new Set(privateKeys)),
      mnemonic,
      xprv,
      xpub,
      metadata: data,
    };
  } catch (error) {
    return {
      format: "json",
      addresses: [],
      privateKeys: [],
      error: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Parse Bitcoin Core wallet.dat file
 * Note: This is a simplified parser. Full wallet.dat parsing requires Berkeley DB library
 */
export function parseDatWallet(buffer: Buffer): ParsedWallet {
  // Bitcoin Core wallet.dat files are Berkeley DB format
  // This is a basic detection - full parsing would require berkeley-db library
  // For now, we'll return a placeholder that indicates the file needs special handling

  const content = buffer.toString("latin1");

  // Check for wallet.dat magic bytes
  if (buffer.length > 0 && buffer[0] === 0x00) {
    // This looks like a Berkeley DB file
    return {
      format: "dat",
      addresses: [],
      privateKeys: [],
      metadata: {
        fileSize: buffer.length,
        isLikelyBerkeleyDB: true,
        requiresSpecialHandling: true,
      },
      error: "Bitcoin Core wallet.dat requires Berkeley DB library for full parsing. Consider exporting as JSON from Bitcoin Core.",
    };
  }

  return {
    format: "dat",
    addresses: [],
    privateKeys: [],
    error: "Invalid wallet.dat file format",
  };
}

/**
 * Parse Electrum wallet file (JSON format with specific structure)
 */
export function parseElectrumWallet(content: string): ParsedWallet {
  try {
    const data = JSON.parse(content);

    const addresses: string[] = [];
    const privateKeys: string[] = [];
    let mnemonic: string | undefined;
    let xprv: string | undefined;

    // Extract from Electrum structure
    if (data.seed) {
      mnemonic = data.seed;
    }

    if (data.keystore) {
      if (data.keystore.xprv) {
        xprv = data.keystore.xprv;
      }
      if (data.keystore.xpub) {
        // xpub is public key, store as address reference
        addresses.push(data.keystore.xpub);
      }
    }

    // Extract addresses from accounts
    if (data.accounts && typeof data.accounts === "object") {
      for (const account of Object.values(data.accounts)) {
        if (typeof account === "object" && account !== null) {
          const accountObj = account as Record<string, any>;
          if (accountObj.addresses && Array.isArray(accountObj.addresses)) {
            addresses.push(...accountObj.addresses);
          }
        }
      }
    }

    return {
      format: "electrum",
      addresses: Array.from(new Set(addresses)),
      privateKeys,
      mnemonic,
      xprv,
      metadata: data,
    };
  } catch (error) {
    return {
      format: "electrum",
      addresses: [],
      privateKeys: [],
      error: `Failed to parse Electrum wallet: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Main parser function - automatically detects format and parses accordingly
 */
export function parseWalletFile(filename: string, content: string | Buffer): ParsedWallet {
  // Convert buffer to string if needed
  const contentStr = typeof content === "string" ? content : content.toString("utf-8");

  // Detect format
  const format = detectWalletFormat(filename, contentStr);

  // Parse based on format
  switch (format) {
    case "txt":
      return parseTxtWallet(contentStr);

    case "json":
      return parseJsonWallet(contentStr);

    case "dat":
      return parseDatWallet(typeof content === "string" ? Buffer.from(content) : content);

    case "electrum":
      return parseElectrumWallet(contentStr);

    default:
      // Try to parse as TXT first, then JSON
      try {
        return parseJsonWallet(contentStr);
      } catch {
        return parseTxtWallet(contentStr);
      }
  }
}

/**
 * Validate parsed wallet data
 */
export function validateParsedWallet(wallet: ParsedWallet): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (wallet.error) {
    errors.push(wallet.error);
  }

  if (wallet.addresses.length === 0 && wallet.privateKeys.length === 0 && !wallet.mnemonic) {
    errors.push("No wallet data found in file");
  }

  // Validate addresses format
  for (const address of wallet.addresses) {
    if (!isValidBitcoinAddress(address) && !address.startsWith("xpub")) {
      errors.push(`Invalid Bitcoin address: ${address}`);
    }
  }

  // Validate private keys format
  for (const key of wallet.privateKeys) {
    if (!isValidPrivateKeyFormat(key)) {
      errors.push(`Invalid private key format: ${key.substring(0, 10)}...`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if string is a valid Bitcoin address
 */
function isValidBitcoinAddress(address: string): boolean {
  // P2PKH (starts with 1)
  if (/^1[a-zA-HJ-NP-Z0-9]{25,34}$/.test(address)) return true;

  // P2SH (starts with 3)
  if (/^3[a-zA-HJ-NP-Z0-9]{25,34}$/.test(address)) return true;

  // Bech32 (starts with bc1)
  if (/^bc1[a-z0-9]{39,59}$/.test(address)) return true;

  return false;
}

/**
 * Check if string is a valid private key format
 */
function isValidPrivateKeyFormat(key: string): boolean {
  // WIF format (51 characters, starts with 5, K, or L)
  if (/^[5KL][1-9A-HJ-NP-Za-km-z]{50}$/.test(key)) return true;

  // Extended private key (xprv)
  if (key.startsWith("xprv")) return true;

  // Hex format (64 characters)
  if (/^[0-9a-fA-F]{64}$/.test(key)) return true;

  return false;
}
