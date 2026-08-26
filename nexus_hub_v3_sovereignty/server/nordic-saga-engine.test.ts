import { describe, expect, it } from "vitest";
import { closeSaga, createSaga, mutateStrategy } from "./nordic-saga-engine";

describe("Nordic saga engine", () => {
  it("creates a saga with a called state", () => {
    expect(createSaga({ id: "s-1", type: "raven", tension: "signal", objective: "validate", currentRoute: "market" })).toMatchObject({ state: "called", resilienceScoreBps: 0 });
  });

  it("mutates the route while preserving the objective", () => {
    const saga = createSaga({ id: "s-1", type: "forge", tension: "constraint", objective: "validate SaaS", currentRoute: "build-first" });
    const mutation = mutateStrategy(saga, { id: "c-1", mutation: "invert_premise", constraint: "sell before build", expectedAdaptation: "discover demand", maxRiskBps: 2_000 }, "customer-first", ["false demand"]);
    expect(mutation.objectivePreserved).toBe(true);
    expect(mutation.before).toBe("build-first");
    expect(mutation.after).toBe("customer-first");
    expect(mutation.evidenceRequired).toContain("teste adversarial");
  });

  it("closes a saga with bounded resilience", () => {
    const saga = createSaga({ id: "s-1", type: "ice", tension: "budget", objective: "operate", currentRoute: "lean" });
    expect(closeSaga(saga, "completed", 9_000).state).toBe("completed");
    expect(() => closeSaga(saga, "completed", 10_001)).toThrow();
  });
});
