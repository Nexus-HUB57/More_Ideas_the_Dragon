import { describe, expect, it } from "vitest";
import { applyEvolutionProof, authorizeEvolutionWork } from "./evolution-controller";
import { initialAutonomyState } from "./fibonacci-autonomy";
import { type CapabilityProof } from "./capability-proofs";

const proof: CapabilityProof = {
  id: "proof-controller", capability: "delegation", currentLimit: "one agent", hypothesis: "handoff preserves contract",
  authorizedScope: "sandbox", experiment: "delegation run", baseline: { successRateBps: 8000 },
  observed: { successRateBps: 9800 }, acceptance: { successRateBps: 9000 }, stopConditions: ["violation"],
  evidenceRefs: ["run-42"], harnessPassed: true, rollbackAvailable: true, status: "running",
};

const strongEvidence = { successRateBps: 9800, evidenceQualityBps: 9000, violationCount: 0, rollbackCount: 0, observedCostUnits: 1, reversible: true, harnessPassed: true };

describe("Evolution controller", () => {
  it("promotes a proven capability", () => {
    const result = applyEvolutionProof(initialAutonomyState(), proof, strongEvidence);
    expect(result.decision).toBe("promote");
    expect(result.autonomy.level).toBe(2);
  });

  it("regresses when Fibonacci evidence is insufficient", () => {
    const result = applyEvolutionProof(initialAutonomyState(), proof, { ...strongEvidence, rollbackCount: 1 });
    expect(result.decision).toBe("regress");
  });

  it("blocks critical proof failures and quarantines the agent", () => {
    const result = applyEvolutionProof(initialAutonomyState(), { ...proof, harnessPassed: false }, strongEvidence);
    expect(result.decision).toBe("blocked");
    expect(result.autonomy.quarantined).toBe(true);
  });

  it("authorizes only work inside the current dose", () => {
    expect(authorizeEvolutionWork(initialAutonomyState(), 1).authorized).toBe(true);
    expect(() => authorizeEvolutionWork(initialAutonomyState(), 2)).toThrow();
  });
});
