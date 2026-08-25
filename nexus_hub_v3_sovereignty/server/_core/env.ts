export class ProductionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductionConfigError";
  }
}

const webhookAllowlist = () => (process.env.NEXUS_WEBHOOK_ALLOWLIST ?? "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  externalAdaptersEnabled: process.env.NEXUS_EXTERNAL_ADAPTERS_ENABLED === "true",
  webhookAllowlist: webhookAllowlist(),
};

export function assertProductionConfiguration() {
  if (!ENV.isProduction) return;

  const missing: string[] = [];
  if (!ENV.databaseUrl.startsWith("mysql://") && !ENV.databaseUrl.startsWith("mysql2://")) missing.push("DATABASE_URL=mysql://...");
  if (ENV.cookieSecret.length < 32) missing.push("JWT_SECRET com pelo menos 32 caracteres");
  if (!ENV.oAuthServerUrl.startsWith("https://")) missing.push("OAUTH_SERVER_URL=https://...");
  if (ENV.externalAdaptersEnabled && ENV.webhookAllowlist.length === 0) missing.push("NEXUS_WEBHOOK_ALLOWLIST quando NEXUS_EXTERNAL_ADAPTERS_ENABLED=true");

  if (missing.length > 0) {
    throw new ProductionConfigError(`Configuração de produção inválida: ${missing.join("; ")}.`);
  }
}
