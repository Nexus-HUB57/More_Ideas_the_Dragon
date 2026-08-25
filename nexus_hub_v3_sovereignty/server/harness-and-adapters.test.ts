import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AdapterError, validateWebhookTarget } from "./adapters";
import { evaluateMissionHarness } from "./harness-engine";

describe("mission engineering harness", () => {
  const baseMission = {
    status: "review" as const,
    title: "Release do MVP",
    description: "Checklist de release, evidência e critério de conclusão.",
    owner: "Platform Pod",
    riskScore: 45,
    dueAt: new Date(Date.UTC(2026, 0, 10)),
  };

  it("passes a review-ready mission", () => {
    const result = evaluateMissionHarness(baseMission, Date.UTC(2026, 0, 1));
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.checks.every((check) => ["passed", "warning"].includes(check.status))).toBe(true);
  });

  it("fails completion when the mission skips review", () => {
    const result = evaluateMissionHarness({ ...baseMission, status: "running" }, Date.UTC(2026, 0, 1));
    expect(result.passed).toBe(false);
    expect(result.checks.find((check) => check.id === "review-state")?.status).toBe("failed");
  });

  it("fails when definition of done or ownership is missing", () => {
    const result = evaluateMissionHarness({ ...baseMission, description: " ", owner: "" }, Date.UTC(2026, 0, 1));
    expect(result.passed).toBe(false);
    expect(result.checks.filter((check) => check.status === "failed").map((check) => check.id)).toEqual(["definition-of-done", "ownership"]);
  });

  it("keeps high risk as a warning rather than silently hiding it", () => {
    const result = evaluateMissionHarness({ ...baseMission, riskScore: 92 }, Date.UTC(2026, 0, 1));
    expect(result.passed).toBe(true);
    expect(result.checks.find((check) => check.id === "risk-budget")?.status).toBe("warning");
  });
});

describe("server adapter security boundary", () => {
  beforeEach(() => {
    process.env.NEXUS_EXTERNAL_ADAPTERS_ENABLED = "true";
  });

  afterEach(() => {
    delete process.env.NEXUS_EXTERNAL_ADAPTERS_ENABLED;
    delete process.env.NEXUS_WEBHOOK_ALLOWLIST;
  });

  it("requires an explicitly allowlisted HTTPS host", () => {
    process.env.NEXUS_WEBHOOK_ALLOWLIST = "hooks.example.com";
    expect(validateWebhookTarget("https://hooks.example.com/events").hostname).toBe("hooks.example.com");
    expect(() => validateWebhookTarget("https://other.example.com/events")).toThrow(AdapterError);
  });

  it("blocks plaintext, credentials and private targets", () => {
    process.env.NEXUS_WEBHOOK_ALLOWLIST = "hooks.example.com,127.0.0.1,localhost";
    expect(() => validateWebhookTarget("http://hooks.example.com/events")).toThrow("HTTPS");
    expect(() => validateWebhookTarget("https://user:pass@hooks.example.com/events")).toThrow("HTTPS");
    expect(() => validateWebhookTarget("https://127.0.0.1/events")).toThrow("local ou privado");
  });

  it("rejects malformed targets before any network call", () => {
    expect(() => validateWebhookTarget("not-a-url")).toThrow("Destino do webhook inválido");
  });
});
