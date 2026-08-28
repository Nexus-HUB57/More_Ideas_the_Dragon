import { describe, expect, it } from "vitest";
import { initialAutonomyState } from "./fibonacci-autonomy";
import { createAuditEnvelope, preflightIntent, type OrchestratorIntent } from "./orchestrator-protocol";

const base: OrchestratorIntent = {
  missionId: 10,
  objective: "validar hipótese",
  owner: "CEO",
  autonomy: "execute_reversible",
  risk: "low",
  budgetUnits: 1,
  externalSideEffect: false,
  description: "resultado verificável",
  status: "review",
};

describe("orchestrator protocol", () => {
  it("allows a reversible intent within Fibonacci budget", () => {
    const decision = preflightIntent(base, initialAutonomyState());
    expect(decision.outcome).toBe("ready");
    expect(decision.nextAction).toBe("execute");
    expect(decision.harness.passed).toBe(true);
  });

  it("blocks external side effects without idempotency", () => {
    const decision = preflightIntent({ ...base, externalSideEffect: true }, initialAutonomyState());
    expect(decision.outcome).toBe("blocked");
    expect(decision.reason).toBe("idempotency_required");
  });

  it("blocks guarded intent without evidence, approval, rollback and audit", () => {
    const decision = preflightIntent({ ...base, autonomy: "execute_guarded" }, initialAutonomyState());
    expect(decision.outcome).toBe("blocked");
    expect(decision.reason).toBe("guarded_requirements_missing");
  });

  it("creates a tamper-evident audit envelope", () => {
    const event = createAuditEnvelope({ correlationId: "corr-1", missionId: 10, actor: "orchestrator", action: "preflight", risk: "low", before: "review", after: "ready", evidenceRefs: [], harnessScore: 100, toolRefs: [], outcome: "ready" });
    expect(event.eventId).toBeTruthy();
    expect(event.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(event.occurredAt).toBeTruthy();
  });
});
