/**
 * Configuration Utility
 * Carregamento e validação de variáveis de ambiente
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/nexus_hub',

  // API Keys
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  blockstreamApiUrl: process.env.BLOCKSTREAM_API_URL || 'https://blockstream.info/api',

  // Blockchain
  bitcoinNetwork: process.env.BITCOIN_NETWORK || 'mainnet',
  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL || '',
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Features
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export function validateConfig(): void {
  const requiredKeys = ['JWT_SECRET'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);

  if (missingKeys.length > 0 && config.isProduction) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }
}
