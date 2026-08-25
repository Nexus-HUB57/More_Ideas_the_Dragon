import { describe, expect, it } from "vitest";
import { calculateStartupSignal, executeProcessingGraph } from "./processing-core";

describe("processing core", () => {
  it("executes dependencies in topological order", async () => {
    const result = await executeProcessingGraph([
      { id: "route", dependsOn: ["score"], run: (_input, context) => `route:${context.get("score")}` },
      { id: "score", dependsOn: ["normalize"], run: (_input, context) => Number(context.get("normalize")) + 1 },
      { id: "normalize", run: () => 41 },
    ], {});

    expect(result.order).toEqual(["normalize", "score", "route"]);
    expect(result.outputs.get("route")).toBe("route:42");
  });

  it("rejects missing dependencies and cycles", async () => {
    await expect(executeProcessingGraph([{ id: "a", dependsOn: ["missing"], run: () => 1 }], {})).rejects.toThrow("Dependência ausente");
    await expect(executeProcessingGraph([
      { id: "a", dependsOn: ["b"], run: () => 1 },
      { id: "b", dependsOn: ["a"], run: () => 1 },
    ], {})).rejects.toThrow("Ciclo detectado");
  });

  it("routes a low-signal startup to validation", async () => {
    const signal = await calculateStartupSignal({ id: 1, name: "Idea", revenue: 0, traction: 10, reputation: 60, status: "planning" });
    expect(signal.signal).toBe("validate");
    expect(signal.readinessScore).toBeLessThan(40);
  });

  it("routes a healthy scaling startup to scale", async () => {
    const signal = await calculateStartupSignal({ id: 2, name: "ScaleUp", revenue: 10_000_000, traction: 90, reputation: 90, status: "scaling" });
    expect(signal.signal).toBe("scale");
    expect(signal.readinessScore).toBeGreaterThanOrEqual(70);
  });

  it("routes archived or low-reputation startups to stabilization", async () => {
    const archived = await calculateStartupSignal({ id: 3, name: "Legacy", revenue: 500_000, traction: 70, reputation: 90, status: "archived" });
    const fragile = await calculateStartupSignal({ id: 4, name: "Fragile", revenue: 500_000, traction: 70, reputation: 20, status: "launched" });
    expect(archived.signal).toBe("stabilize");
    expect(fragile.signal).toBe("stabilize");
  });
});
