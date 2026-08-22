import crypto from 'crypto';

/**
 * Utilitários de criptografia AES-256-GCM para Gnox's Communicator
 * Implementa criptografia simétrica com autenticação
 */

const ALGORITHM = 'aes-256-gcm';
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 16;

/**
 * Gera uma chave de 256 bits a partir de uma senha
 */
export function deriveKey(password: string): Buffer {
  return crypto.scryptSync(password, 'salt', 32);
}

/**
 * Criptografa uma mensagem com AES-256-GCM
 * Retorna { iv, encryptedContent, authTag } em formato base64
 */
export function encryptMessage(content: string, key: Buffer): {
  iv: string;
  encryptedContent: string;
  authTag: string;
} {
  // Gerar IV aleatório
  const iv = crypto.randomBytes(IV_LENGTH);

  // Criar cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Criptografar conteúdo
  let encryptedContent = cipher.update(content, 'utf-8', 'hex');
  encryptedContent += cipher.final('hex');

  // Obter auth tag
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    encryptedContent,
    authTag: authTag.toString('base64'),
  };
}

/**
 * Descriptografa uma mensagem com AES-256-GCM
 * Recebe { iv, encryptedContent, authTag } em formato base64
 */
export function decryptMessage(
  encryptedContent: string,
  iv: string,
  authTag: string,
  key: Buffer
): string {
  try {
    // Converter de base64 para Buffer
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');

    // Criar decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    // Descriptografar
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gera um hash SHA-256 para verificação de integridade
 */
export function generateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Verifica se um hash corresponde ao conteúdo
 */
export function verifyHash(content: string, hash: string): boolean {
  return generateHash(content) === hash;
}

/**
 * Gera uma chave Root aleatória para o Arquiteto
 */
export function generateRootKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Criptografa a chave Root com uma senha do usuário
 */
export function encryptRootKey(rootKey: string, userPassword: string): {
  encryptedKey: string;
  iv: string;
  authTag: string;
} {
  const key = deriveKey(userPassword);
  const encrypted = encryptMessage(rootKey, key);
  return {
    encryptedKey: encrypted.encryptedContent,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
  };
}

/**
 * Descriptografa a chave Root com a senha do usuário
 */
export function decryptRootKey(
  encryptedKey: string,
  iv: string,
  authTag: string,
  userPassword: string
): string {
  const key = deriveKey(userPassword);
  return decryptMessage(encryptedKey, iv, authTag, key);
}
