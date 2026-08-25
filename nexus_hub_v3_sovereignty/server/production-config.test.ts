import { afterEach, describe, expect, it, vi } from "vitest";

const savedEnv = { ...process.env };

afterEach(() => {
  process.env = { ...savedEnv };
  vi.resetModules();
});

describe("production configuration", () => {
  it("fails fast when authentication and database settings are absent", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.OAUTH_SERVER_URL;
    delete process.env.NEXUS_EXTERNAL_ADAPTERS_ENABLED;

    const { assertProductionConfiguration } = await import("./_core/env");
    expect(() => assertProductionConfiguration()).toThrow(/DATABASE_URL.*JWT_SECRET.*OAUTH_SERVER_URL/);
  });

  it("accepts a complete production configuration with adapters disabled", async () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "mysql://user:password@db.example.com:3306/nexus_hub";
    process.env.JWT_SECRET = "a".repeat(64);
    process.env.OAUTH_SERVER_URL = "https://auth.example.com";
    process.env.NEXUS_EXTERNAL_ADAPTERS_ENABLED = "false";

    const { assertProductionConfiguration } = await import("./_core/env");
    expect(() => assertProductionConfiguration()).not.toThrow();
  });

  it("requires an HTTPS host allowlist when adapters are enabled", async () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "mysql://user:password@db.example.com:3306/nexus_hub";
    process.env.JWT_SECRET = "a".repeat(64);
    process.env.OAUTH_SERVER_URL = "https://auth.example.com";
    process.env.NEXUS_EXTERNAL_ADAPTERS_ENABLED = "true";
    delete process.env.NEXUS_WEBHOOK_ALLOWLIST;

    const { assertProductionConfiguration } = await import("./_core/env");
    expect(() => assertProductionConfiguration()).toThrow("NEXUS_WEBHOOK_ALLOWLIST");
  });
});
