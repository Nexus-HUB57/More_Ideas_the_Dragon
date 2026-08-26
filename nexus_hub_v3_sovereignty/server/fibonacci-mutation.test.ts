import { describe, expect, it } from "vitest";
import { initialAutonomyState } from "./fibonacci-autonomy";
import { canPromoteMutation, proposeFibonacciMutation } from "./fibonacci-mutation";

describe("Fibonacci mutation proposals", () => {
  const request = { id: "mut-1", state: initialAutonomyState(), mode: "propose" as const, targetFiles: ["server/routers-hub.ts"], objective: "reduce critical latency", expectedGainBps: 500, maxRiskBps: 1_000, requiredChecks: ["smoke_test", "stress_test"] };

  it("creates a deterministic guarded proposal", () => {
    const proposal = proposeFibonacciMutation(request, { baseline: 1 }, { candidate: 2 });
    expect(proposal).toMatchObject({ id: "mut-1", level: 1, mode: "propose", status: "proposed" });
    expect(proposal.gates).toEqual(expect.arrayContaining(["typescript", "unit_tests", "diff_review", "rollback_plan"]));
  });

  it("blocks quarantine and forbidden targets", () => {
    expect(() => proposeFibonacciMutation({ ...request, state: { ...request.state, quarantined: true } }, {}, {})).toThrow("quarentena");
    expect(() => proposeFibonacciMutation({ ...request, targetFiles: [".env"] }, {}, {})).toThrow("não autorizado");
  });

  it("promotes only with matching evidence and complete gates", () => {
    const proposal = proposeFibonacciMutation(request, { baseline: 1 }, { candidate: 2 });
    expect(canPromoteMutation(proposal, { baselineDigest: proposal.baselineDigest, changeDigest: proposal.changeDigest, checksPassed: true, rollbackReady: true, riskBps: 500, gainBps: 500 })).toBe(true);
    expect(canPromoteMutation(proposal, { baselineDigest: proposal.baselineDigest, changeDigest: proposal.changeDigest, checksPassed: false, rollbackReady: true, riskBps: 500, gainBps: 500 })).toBe(false);
  });
});
