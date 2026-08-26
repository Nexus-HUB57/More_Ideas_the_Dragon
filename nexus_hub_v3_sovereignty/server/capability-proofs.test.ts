import { describe, expect, it } from "vitest";
import { evaluateCapabilityProof, mergeEvidenceRefs, shouldStopProof, type CapabilityProof } from "./capability-proofs";

const baseProof: CapabilityProof = {
  id: "proof-1", capability: "tool-chain", currentLimit: "3 steps", hypothesis: "idempotent chain",
  authorizedScope: "sandbox", experiment: "run chain", baseline: { successRateBps: 9000 },
  observed: { successRateBps: 9800 }, acceptance: { successRateBps: 9500 },
  stopConditions: ["timeout"], evidenceRefs: ["run-1"], harnessPassed: true,
  rollbackAvailable: true, status: "running",
};

describe("Capability proofs", () => {
  it("promotes an accepted proof", () => {
    expect(evaluateCapabilityProof(baseProof)).toMatchObject({ status: "accepted", decision: "promote" });
  });

  it("blocks proofs without Harness or rollback", () => {
    expect(evaluateCapabilityProof({ ...baseProof, harnessPassed: false })).toMatchObject({ status: "rejected", decision: "blocked" });
  });

  it("stops on budget, timeout, violation or contradiction", () => {
    expect(shouldStopProof({ elapsedMs: 100, timeoutMs: 100, consumedBudget: 1, budgetLimit: 2, violations: 0, contradictionDetected: false })).toBe(true);
    expect(shouldStopProof({ elapsedMs: 1, timeoutMs: 100, consumedBudget: 3, budgetLimit: 2, violations: 0, contradictionDetected: false })).toBe(true);
  });

  it("deduplicates evidence references", () => {
    expect(mergeEvidenceRefs(["a"], ["a", "b", ""])).toEqual(["a", "b"]);
  });
});
