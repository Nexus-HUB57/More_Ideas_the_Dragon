import crypto from "crypto";
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function encodeBase58(bytes: Uint8Array): string {
  let zeroes = 0;
  while (zeroes < bytes.length && bytes[zeroes] === 0) zeroes += 1;

  const digits: number[] = [0];
  for (let i = zeroes; i < bytes.length; i += 1) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j += 1) {
      const value = digits[j] * 256 + carry;
      digits[j] = value % 58;
      carry = Math.floor(value / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  let result = "1".repeat(zeroes);
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    result += BASE58_ALPHABET[digits[i]];
  }
  return result;
}

/**
 * Converte uma chave privada hexadecimal para o formato WIF (Wallet Import Format)
 * @param privateKeyHex - Chave privada em formato hexadecimal (64 caracteres)
 * @param compressed - Se true, gera WIF comprimido (padrão: true)
 * @param network - Rede: 'mainnet' (0x80) ou 'testnet' (0xef)
 * @returns Chave WIF gerada
 */
export function toWif(
  privateKeyHex: string,
  compressed: boolean = true,
  network: "mainnet" | "testnet" = "mainnet"
): string {
  // Validar entrada e intervalo secp256k1
  if (!isValidPrivateKeyHex(privateKeyHex)) {
    throw new Error("Chave privada hexadecimal inválida ou fora do intervalo secp256k1");
  }

  try {
    // Definir prefixo baseado na rede
    const prefix = Buffer.from([network === "mainnet" ? 0x80 : 0xef]);

    // Converter hexadecimal para bytes
    const privateKeyBytes = Buffer.from(privateKeyHex, "hex");

    // Construir chave estendida
    let extendedKey: Buffer;
    if (compressed) {
      // Adicionar sufixo 0x01 para indicar chave comprimida
      const suffix = Buffer.from([0x01]);
      extendedKey = Buffer.concat([prefix, privateKeyBytes, suffix]);
    } else {
      // Sem sufixo para chave não comprimida
      extendedKey = Buffer.concat([prefix, privateKeyBytes]);
    }

    // Realizar hash duplo SHA-256
    const firstHash = crypto.createHash("sha256").update(extendedKey).digest();
    const secondHash = crypto.createHash("sha256").update(firstHash).digest();

    // Extrair checksum (primeiros 4 bytes do segundo hash)
    const checksum = secondHash.slice(0, 4);

    // Concatenar chave estendida com checksum
    const finalKey = Buffer.concat([extendedKey, checksum]);

    // Codificar em Base58Check
    const wif = encodeBase58(finalKey);

    return wif;
  } catch (error) {
    throw new Error(`Erro ao converter para WIF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gera ambas as versões (comprimida e não comprimida) de uma chave WIF
 */
export function generateWifPair(
  privateKeyHex: string,
  network: "mainnet" | "testnet" = "mainnet"
): { compressed: string; uncompressed: string } {
  return {
    compressed: toWif(privateKeyHex, true, network),
    uncompressed: toWif(privateKeyHex, false, network),
  };
}

/**
 * Valida se uma chave hexadecimal é válida
 */
export function isValidPrivateKeyHex(hex: string): boolean {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) return false;

  const value = BigInt(`0x${hex}`);
  const secp256k1Order = BigInt(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"
  );

  return value > BigInt(0) && value < secp256k1Order;
}
