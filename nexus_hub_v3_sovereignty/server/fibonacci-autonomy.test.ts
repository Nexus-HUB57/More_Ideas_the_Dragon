import { describe, expect, it } from "vitest";
import { assertDoseWithinBudget, initialAutonomyState, promoteAutonomy, regressAutonomy } from "./fibonacci-autonomy";

describe("Fibonacci autonomy controller", () => {
  it("promotes only with strong evidence", () => {
    const next = promoteAutonomy(initialAutonomyState(), {
      successRateBps: 10_000, evidenceQualityBps: 9_000, violationCount: 0,
      rollbackCount: 0, observedCostUnits: 1, reversible: true, harnessPassed: true,
    });
    expect(next.level).toBe(2);
    expect(next.dose).toBe(1);
  });

  it("denies promotion after rollback or violation", () => {
    const next = promoteAutonomy(initialAutonomyState(), {
      successRateBps: 10_000, evidenceQualityBps: 10_000, violationCount: 0,
      rollbackCount: 1, observedCostUnits: 1, reversible: true, harnessPassed: true,
    });
    expect(next.level).toBe(1);
    expect(next.lastReason).toBe("promotion_denied");
  });

  it("regresses two levels and quarantines critical failures", () => {
    const state = { level: 6 as const, dose: 8, quarantined: false, lastReason: "ok" };
    expect(regressAutonomy(state, "repeated_failure").level).toBe(4);
    expect(regressAutonomy(state, "critical_violation", true)).toMatchObject({ level: 1, quarantined: true });
  });

  it("rejects requests beyond the current dose", () => {
    expect(() => assertDoseWithinBudget(initialAutonomyState(), 2)).toThrow("Dose Fibonacci excedida");
  });
});
