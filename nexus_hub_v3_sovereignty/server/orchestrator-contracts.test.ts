import { describe, expect, it } from "vitest";
import { digestMissionContract, validateMissionContract, type MissionContract } from "./orchestrator-contracts";

const contract: MissionContract = {
  contractVersion: "1.0",
  missionId: 1,
  correlationId: "corr-1",
  objective: "validar health",
  owner: "orchestrator",
  scope: { environment: "sandbox", allowedResources: ["system.health"], deniedResources: ["financial.write"], effectClass: "read_only", maxBudgetUnits: 1, timeoutMs: 1_000, authority: "reversible" },
  preconditions: ["service_available"],
  successCriteria: ["status_ok"],
  evidence: { requiredRefs: ["stress-report"], reproducible: true, verifierQuorum: 1 },
  rollback: { plan: "stop worker", checkpointRef: "cp-1", tested: true, maxRecoverySec: 30 },
  slo: { availabilityBps: 9_900, p95LatencyMs: 250, maxErrorRateBps: 100, observationWindowSec: 60 },
  createdAt: "2026-08-28T00:00:00.000Z",
};

describe("orchestrator contracts", () => {
  it("validates a bounded read-only contract and generates a digest", () => {
    expect(validateMissionContract(contract)).toEqual(contract);
    expect(digestMissionContract(contract)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects high-impact effects without guarded authority", () => {
    expect(() => validateMissionContract({ ...contract, scope: { ...contract.scope, effectClass: "financial", authority: "reversible" } })).toThrow("guarded");
  });

  it("rejects overlapping and invalid scopes", () => {
    expect(() => validateMissionContract({ ...contract, scope: { ...contract.scope, allowedResources: ["same"], deniedResources: ["same"] } })).toThrow("simultaneamente");
    expect(() => validateMissionContract({ ...contract, scope: { ...contract.scope, timeoutMs: 10 } })).toThrow("Timeout");
  });

  it("requires a verifier quorum and rollback contract", () => {
    expect(() => validateMissionContract({ ...contract, evidence: { ...contract.evidence, verifierQuorum: 0 } })).toThrow("Quorum");
    expect(() => validateMissionContract({ ...contract, rollback: { ...contract.rollback, plan: "" } })).toThrow("Rollback");
  });
});
