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
  llmProvider: process.env.NEXUS_LLM_PROVIDER ?? "ollama",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiBaseUrl: process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1",
  openAiChatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini",
  openAiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  openApiSpecUrl: process.env.NEXUS_OPENAPI_SPEC_URL ?? "/openapi.yaml",
};

export function assertProductionConfiguration() {
  if (!ENV.isProduction) return;

  const missing: string[] = [];
  if (!ENV.databaseUrl.startsWith("mysql://") && !ENV.databaseUrl.startsWith("mysql2://")) missing.push("DATABASE_URL=mysql://...");
  if (ENV.cookieSecret.length < 32) missing.push("JWT_SECRET com pelo menos 32 caracteres");
  if (!ENV.oAuthServerUrl.startsWith("https://")) missing.push("OAUTH_SERVER_URL=https://...");
  if (ENV.externalAdaptersEnabled && ENV.webhookAllowlist.length === 0) missing.push("NEXUS_WEBHOOK_ALLOWLIST quando NEXUS_EXTERNAL_ADAPTERS_ENABLED=true");
  if (!["ollama", "openai"].includes(ENV.llmProvider)) missing.push("NEXUS_LLM_PROVIDER=ollama|openai");
  if (ENV.llmProvider === "openai" && ENV.openAiApiKey.length < 20) missing.push("OPENAI_API_KEY válida quando NEXUS_LLM_PROVIDER=openai");
  if (ENV.llmProvider === "openai" && !ENV.openAiBaseUrl.startsWith("https://")) missing.push("OPENAI_API_BASE=https://... quando NEXUS_LLM_PROVIDER=openai");

  if (missing.length > 0) {
    throw new ProductionConfigError(`Configuração de produção inválida: ${missing.join("; ")}.`);
  }
}
