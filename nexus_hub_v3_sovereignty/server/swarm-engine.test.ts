import { describe, expect, it } from "vitest";
import { buildExecutionLevels, executeAgentSwarm } from "./swarm-engine";

describe("agentic swarm engine", () => {
  it("builds deterministic levels and prioritizes critical tasks", () => {
    const levels = buildExecutionLevels([
      { id: "a", agentRole: "CTO", priority: "normal", run: () => "a" },
      { id: "b", agentRole: "CRO", priority: "critical", run: () => "b" },
      { id: "c", agentRole: "CEO", dependsOn: ["a", "b"], run: () => "c" },
    ]);
    expect(levels).toEqual([["b", "a"], ["c"]]);
  });

  it("executes independent tasks in bounded parallel batches", async () => {
    let active = 0;
    let peak = 0;
    const tasks = Array.from({ length: 5 }, (_, index) => ({
      id: `task-${index}`,
      agentRole: "worker",
      estimatedCost: 2,
      run: async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
        return index;
      },
    }));
    const result = await executeAgentSwarm(tasks, {}, { maxConcurrency: 2, budgetUnits: 10 });
    expect(peak).toBe(2);
    expect(result.metrics.peakConcurrency).toBe(2);
    expect(result.metrics.consumedBudgetUnits).toBe(10);
    expect(result.metrics.completedTasks).toBe(5);
  });

  it("respects dependency levels before executing downstream tasks", async () => {
    const result = await executeAgentSwarm([
      { id: "source", agentRole: "research", run: () => 7 },
      { id: "transform", agentRole: "analysis", dependsOn: ["source"], run: (_input, context) => Number(context.get("source")) * 2 },
      { id: "publish", agentRole: "ops", dependsOn: ["transform"], run: (_input, context) => `score:${context.get("transform")}` },
    ], {});
    expect(result.order).toEqual(["source", "transform", "publish"]);
    expect(result.outputs.get("publish")).toBe("score:14");
  });

  it("rejects cycles and missing dependencies", () => {
    expect(() => buildExecutionLevels([
      { id: "a", agentRole: "x", dependsOn: ["b"], run: () => null },
      { id: "b", agentRole: "x", dependsOn: ["a"], run: () => null },
    ])).toThrow(/Ciclo detectado/);
    expect(() => buildExecutionLevels([{ id: "a", agentRole: "x", dependsOn: ["missing"], run: () => null }])).toThrow(/Dependência ausente/);
  });

  it("stops before starting a batch that exceeds the compute budget", async () => {
    const result = executeAgentSwarm([
      { id: "a", agentRole: "x", estimatedCost: 6, run: () => null },
      { id: "b", agentRole: "x", estimatedCost: 6, run: () => null },
    ], {}, { budgetUnits: 10 });
    await expect(result).rejects.toThrow(/Budget de compute excedido/);
  });
});
