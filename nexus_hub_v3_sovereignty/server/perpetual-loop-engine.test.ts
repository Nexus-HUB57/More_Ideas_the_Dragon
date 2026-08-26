import { describe, expect, it } from "vitest";
import { createPerpetualLoop, runPerpetualLoop } from "./perpetual-loop-engine";

describe("Perpetual loop engine", () => {
  it("runs bounded continuous cycles and stops cleanly", async () => {
    const loop = createPerpetualLoop<number>();
    const result = await runPerpetualLoop(loop, { maxCycles: 3, budgetPerCycle: 5, maxConsecutiveFailures: 2, baseBackoffMs: 1, maxBackoffMs: 4 }, async (cycle) => ({ value: cycle, cost: 1 }), { sleep: async () => undefined });
    expect(result.state).toBe("stopped");
    expect(result.results.filter((item) => item.value !== undefined)).toHaveLength(3);
  });

  it("opens the circuit after repeated failures", async () => {
    const loop = createPerpetualLoop<number>();
    const result = await runPerpetualLoop(loop, { maxCycles: 10, budgetPerCycle: 5, maxConsecutiveFailures: 2, baseBackoffMs: 1, maxBackoffMs: 4 }, async () => { throw new Error("provider_down"); }, { sleep: async () => undefined });
    expect(result.state).toBe("open_circuit");
    expect(result.consecutiveFailures).toBe(2);
    expect(result.results[1].nextBackoffMs).toBe(2);
  });

  it("pauses without starting another cycle when aborted", async () => {
    const loop = createPerpetualLoop<number>();
    const controller = new AbortController();
    controller.abort();
    const result = await runPerpetualLoop(loop, { maxCycles: 3, budgetPerCycle: 5, maxConsecutiveFailures: 2, baseBackoffMs: 1, maxBackoffMs: 4 }, async () => ({ value: 1, cost: 1 }), { signal: controller.signal, sleep: async () => undefined });
    expect(result.state).toBe("paused");
    expect(result.cycle).toBe(0);
  });
});
