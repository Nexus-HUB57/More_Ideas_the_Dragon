import { describe, expect, it } from "vitest";
import { evaluateGuardedHarness } from "./harness-engine";

const base = {
  status: "review" as const,
  title: "Deploy de integração",
  description: "Critério de conclusão verificável",
  owner: "NEXUS-CTO",
  riskScore: 40,
  dueAt: new Date("2099-01-01T00:00:00.000Z"),
};

describe("guarded Engineering Harness", () => {
  it("blocks a guarded skill without required evidence and controls", () => {
    const result = evaluateGuardedHarness({
      ...base,
      skillAutonomy: "execute_guarded",
      skillRisk: "high",
      executiveRole: "CTO",
      externalSideEffect: true,
    });
    expect(result.passed).toBe(false);
    expect(result.checks.filter((check) => check.status === "failed").map((check) => check.id)).toEqual([
      "guarded-evidence",
      "guarded-approval",
      "guarded-rollback",
      "guarded-idempotency",
      "guarded-security-review",
      "guarded-audit",
    ]);
  });

  it("passes when all guarded evidence and external controls are present", () => {
    const result = evaluateGuardedHarness({
      ...base,
      skillAutonomy: "execute_guarded",
      skillRisk: "high",
      executiveRole: "CTO",
      evidenceRef: "artifact://release/123",
      approvalRef: "approval://board/456",
      rollbackPlan: "Reverter para a imagem anterior e invalidar o dispatch.",
      idempotencyKey: "mission-release-123",
      securityReviewRef: "security://review/789",
      auditRef: "audit://mission/123",
      externalSideEffect: true,
    });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });

  it("does not impose guarded gates on a reversible skill", () => {
    const result = evaluateGuardedHarness({ ...base, skillAutonomy: "execute_reversible", skillRisk: "medium" });
    expect(result.passed).toBe(true);
    expect(result.checks.some((check) => check.id === "guarded-approval")).toBe(false);
  });
});
