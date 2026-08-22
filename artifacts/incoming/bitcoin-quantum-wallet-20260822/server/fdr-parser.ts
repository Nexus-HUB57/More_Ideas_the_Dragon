import * as crypto from "crypto";
import { createReadStream } from "fs";
import { createInterface } from "readline";

/**
 * FDR Parser - Fundo Descentralizado Gênesis
 * Handles parsing and validation of FDR Master Wallet data
 */

export interface FDRAddressPair {
  address: string;
  privateKey: string;
  derivationPath?: string;
  walletType?: string;
  imported: boolean;
  validated: boolean;
}

export interface FDRMasterWalletData {
  format: "csv" | "json" | "backup";
  totalPairs: number;
  validPairs: number;
  duplicates: number;
  pairs: FDRAddressPair[];
  metadata?: {
    processedAt?: string;
    protocol?: string;
    encryption?: string;
    iterationsPBKDF2?: number;
    saltBits?: number;
  };
  error?: string;
}

/**
 * Parse CSV format from FDR Master Wallet
 * Expected format: address,privateKey,derivationPath,walletType
 */
export async function parseFDRCSV(filePath: string): Promise<FDRMasterWalletData> {
  const pairs: FDRAddressPair[] = [];
  const addressSet = new Set<string>();
  const privateKeySet = new Set<string>();
  let duplicates = 0;

  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineCount = 0;
    let headerSkipped = false;

    rl.on("line", (line) => {
      lineCount++;

      // Skip header
      if (!headerSkipped && (line.includes("address") || lineCount === 1)) {
        headerSkipped = true;
        return;
      }

      // Parse CSV line
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 2) return;

      const [address, privateKey, derivationPath, walletType] = parts;

      // Validate address and private key
      if (!isValidBitcoinAddress(address) || !isValidPrivateKeyFormat(privateKey)) {
        return;
      }

      // Check for duplicates
      if (addressSet.has(address) || privateKeySet.has(privateKey)) {
        duplicates++;
        return;
      }

      addressSet.add(address);
      privateKeySet.add(privateKey);

      pairs.push({
        address,
        privateKey,
        derivationPath: derivationPath || undefined,
        walletType: walletType || "imported",
        imported: false,
        validated: true,
      });
    });

    rl.on("close", () => {
      resolve({
        format: "csv",
        totalPairs: lineCount - 1, // Exclude header
        validPairs: pairs.length,
        duplicates,
        pairs,
        metadata: {
          processedAt: new Date().toISOString(),
          protocol: "CAISK",
          encryption: "AES-256-GCM",
          iterationsPBKDF2: 100000,
          saltBits: 128,
        },
      });
    });

    rl.on("error", (error) => {
      reject({
        format: "csv" as const,
        totalPairs: 0,
        validPairs: 0,
        duplicates: 0,
        pairs: [],
        error: `Failed to parse CSV: ${error.message}`,
      });
    });
  });
}

/**
 * Parse JSON format from FDR Encrypted Backup
 */
export function parseFDRJSON(content: string): FDRMasterWalletData {
  try {
    const data = JSON.parse(content);
    const pairs: FDRAddressPair[] = [];
    const addressSet = new Set<string>();
    const privateKeySet = new Set<string>();
    let duplicates = 0;

    // Handle different JSON structures
    const items = data.wallets || data.addresses || data.pairs || [];

    for (const item of items) {
      const address = item.address || item.addr;
      const privateKey = item.privateKey || item.privkey || item.key;

      if (!address || !privateKey) continue;

      // Validate
      if (!isValidBitcoinAddress(address) || !isValidPrivateKeyFormat(privateKey)) {
        continue;
      }

      // Check for duplicates
      if (addressSet.has(address) || privateKeySet.has(privateKey)) {
        duplicates++;
        continue;
      }

      addressSet.add(address);
      privateKeySet.add(privateKey);

      pairs.push({
        address,
        privateKey,
        derivationPath: item.derivationPath || item.path,
        walletType: item.walletType || item.type || "imported",
        imported: false,
        validated: true,
      });
    }

    return {
      format: "json",
      totalPairs: items.length,
      validPairs: pairs.length,
      duplicates,
      pairs,
      metadata: {
        processedAt: new Date().toISOString(),
        protocol: data.protocol || "CAISK",
        encryption: data.encryption || "AES-256-GCM",
        iterationsPBKDF2: data.iterationsPBKDF2 || 100000,
        saltBits: data.saltBits || 128,
      },
    };
  } catch (error) {
    return {
      format: "json",
      totalPairs: 0,
      validPairs: 0,
      duplicates: 0,
      pairs: [],
      error: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Validate FDR data integrity
 */
export function validateFDRData(data: FDRMasterWalletData): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.error) {
    errors.push(data.error);
  }

  if (data.validPairs === 0) {
    errors.push("No valid address/key pairs found");
  }

  if (data.duplicates > 0) {
    warnings.push(`${data.duplicates} duplicate entries were removed`);
  }

  // Check validation rate
  const validationRate = data.totalPairs > 0 ? (data.validPairs / data.totalPairs) * 100 : 0;
  if (validationRate < 50) {
    warnings.push(`Low validation rate: ${validationRate.toFixed(2)}%`);
  }

  // Validate each pair
  for (const pair of data.pairs) {
    if (!isValidBitcoinAddress(pair.address)) {
      errors.push(`Invalid Bitcoin address: ${pair.address}`);
    }
    if (!isValidPrivateKeyFormat(pair.privateKey)) {
      errors.push(`Invalid private key format: ${pair.privateKey.substring(0, 10)}...`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Encrypt FDR data using CAISK protocol (AES-256-GCM + PBKDF2)
 */
export function encryptFDRData(
  data: FDRMasterWalletData,
  passphrase: string
): {
  encrypted: string;
  salt: string;
  iv: string;
  authTag: string;
} {
  // Generate salt and derive key using PBKDF2
  const salt = crypto.randomBytes(16); // 128 bits
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");

  // Generate IV and auth tag
  const iv = crypto.randomBytes(12); // 96 bits for GCM

  // Encrypt using AES-256-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const jsonData = JSON.stringify(data);

  let encrypted = cipher.update(jsonData, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt FDR data using CAISK protocol
 */
export function decryptFDRData(
  encrypted: string,
  salt: string,
  iv: string,
  authTag: string,
  passphrase: string
): FDRMasterWalletData | null {
  try {
    // Derive key using PBKDF2
    const saltBuffer = Buffer.from(salt, "hex");
    const key = crypto.pbkdf2Sync(passphrase, saltBuffer, 100000, 32, "sha256");

    // Decrypt using AES-256-GCM
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Failed to decrypt FDR data:", error);
    return null;
  }
}

/**
 * Generate FDR report summary
 */
export function generateFDRReport(data: FDRMasterWalletData): string {
  const validation = validateFDRData(data);
  const validationRate = data.totalPairs > 0 ? ((data.validPairs / data.totalPairs) * 100).toFixed(2) : "0";

  return `
================================================================================
FDR BITCOIN WALLET - RELATÓRIO CONSOLIDADO
================================================================================

Master Wallet: FDR
Protocolo: ${data.metadata?.protocol || "CAISK"}
Criptografia: ${data.metadata?.encryption || "AES-256-GCM"}
Data/Hora: ${data.metadata?.processedAt || new Date().toISOString()}
Total de Pares Validados: ${data.validPairs.toLocaleString()}

RESUMO DE PROCESSAMENTO:
----------------------------------------
• Formato: ${data.format.toUpperCase()}
• Total de pares encontrados: ${data.totalPairs.toLocaleString()}
• Pares válidos: ${data.validPairs.toLocaleString()}
• Duplicatas removidas: ${data.duplicates.toLocaleString()}
• Taxa de validação: ${validationRate}%

VALIDAÇÃO E SEGURANÇA:
----------------------------------------
• Status de validação: ${validation.valid ? "✓ VÁLIDO" : "✗ INVÁLIDO"}
• Erros encontrados: ${validation.errors.length}
• Avisos: ${validation.warnings.length}

PROTOCOLO CAISK:
----------------------------------------
• Algoritmo: ${data.metadata?.encryption || "AES-256-GCM"}
• Iterações PBKDF2: ${(data.metadata?.iterationsPBKDF2 || 100000).toLocaleString()}
• Salt: ${data.metadata?.saltBits || 128} bits
• Nonce: 96 bits
• Tag de autenticação: 128 bits

${validation.errors.length > 0 ? `ERROS:\n${validation.errors.map((e) => `• ${e}`).join("\n")}\n` : ""}
${validation.warnings.length > 0 ? `AVISOS:\n${validation.warnings.map((w) => `• ${w}`).join("\n")}\n` : ""}
================================================================================
`;
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

/**
 * Batch import FDR pairs with progress tracking
 */
export async function* batchImportFDRPairs(
  pairs: FDRAddressPair[],
  batchSize: number = 100
): AsyncGenerator<{ processed: number; total: number; batch: FDRAddressPair[] }> {
  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize);
    yield {
      processed: i + batch.length,
      total: pairs.length,
      batch,
    };
  }
}
