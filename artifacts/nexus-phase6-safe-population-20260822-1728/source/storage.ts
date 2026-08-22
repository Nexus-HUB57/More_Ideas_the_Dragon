import { nanoid } from "nanoid";

/**
 * Nexus Storage System
 * Gerencia uploads para S3 e cache local de arquivos
 */

export interface StorageResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

/**
 * Simula o upload de um arquivo para o S3
 * Em um ambiente real, usaria o AWS SDK ou um helper do framework
 */
export async function storagePut(
  file: Buffer | string,
  path: string,
  mimeType: string = "application/octet-stream"
): Promise<StorageResult> {
  const fileName = `${nanoid()}-${path.split('/').pop()}`;
  const key = `${path}/${fileName}`;
  
  // Em um ambiente real, aqui faríamos o upload para o S3
  // Para este projeto, simularemos o retorno de uma URL do ecossistema Nexus
  const url = `https://storage.nexus-hub.im/${key}`;
  
  console.log(`[STORAGE] Arquivo armazenado em: ${key}`);
  
  return {
    url,
    key,
    size: typeof file === 'string' ? Buffer.byteLength(file) : file.length,
    mimeType,
  };
}

/**
 * Remove um arquivo do armazenamento
 */
export async function storageDelete(key: string): Promise<boolean> {
  console.log(`[STORAGE] Arquivo removido: ${key}`);
  return true;
}

/**
 * Gera uma URL assinada para acesso temporário (simulado)
 */
export async function getSignedUrl(key: string, expiresId: number = 3600): Promise<string> {
  return `https://storage.nexus-hub.im/${key}?sig=${nanoid()}`;
}

/**
 * Sistema de Cache de Arquivos (Simulado)
 */
const storageCache = new Map<string, any>();

export function setCache(key: string, data: any, ttl: number = 3600) {
  storageCache.set(key, {
    data,
    expiry: Date.now() + ttl * 1000
  });
}

export function getCache(key: string) {
  const cached = storageCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    storageCache.delete(key);
    return null;
  }
  return cached.data;
}
