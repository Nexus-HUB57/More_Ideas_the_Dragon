import { describe, expect, it } from "vitest";
import {
  assertTransition,
  calculateMissionRisk,
  canTransition,
  getAllowedTransitions,
  getMissionEventType,
} from "./orchestrator-engine";

describe("orchestrator engine", () => {
  it("accepts the controlled happy path", () => {
    expect(canTransition("backlog", "ready")).toBe(true);
    expect(canTransition("ready", "running")).toBe(true);
    expect(canTransition("running", "review")).toBe(true);
    expect(canTransition("review", "completed")).toBe(true);
  });

  it("rejects regressions and terminal state changes", () => {
    expect(canTransition("completed", "running")).toBe(false);
    expect(canTransition("backlog", "completed")).toBe(false);
    expect(() => assertTransition("completed", "running")).toThrow("Transição inválida");
  });

  it("allows blocked work to return to ready", () => {
    expect(getAllowedTransitions("blocked")).toEqual(["ready", "cancelled"]);
  });

  it("produces higher risk for urgent launch work", () => {
    const urgent = calculateMissionRisk({ priority: "critical", stage: "launch", dueAt: new Date(Date.now() + 2 * 86_400_000) });
    const routine = calculateMissionRisk({ priority: "low", stage: "discovery", dueAt: null });
    expect(urgent).toBeGreaterThan(routine);
    expect(urgent).toBeLessThanOrEqual(100);
  });

  it("maps status transitions to auditable event types", () => {
    expect(getMissionEventType("running")).toBe("mission_started");
    expect(getMissionEventType("review")).toBe("mission_submitted_for_review");
    expect(getMissionEventType("completed")).toBe("mission_completed");
  });
});
