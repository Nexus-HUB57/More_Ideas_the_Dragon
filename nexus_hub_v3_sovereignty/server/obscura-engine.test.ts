import { describe, expect, it } from "vitest";
import { runObscuraProcess } from "./obscura-engine";

describe("Obscura process autonomy engine", () => {
  const step = (id: string, cost = 1) => ({
    id,
    phase: "execute" as const,
    estimatedCost: cost,
    run: async (context: { count: number }) => ({ count: context.count + 1 }),
    verify: async (context: { count: number }) => context.count > 0,
  });

  it("does not mutate state in recommend mode", async () => {
    const result = await runObscuraProcess({ count: 0 }, [step("one")], {
      autonomy: "recommend", risk: "low", maxSteps: 2, budgetUnits: 2,
    });
    expect(result.status).toBe("recommended");
    expect(result.context.count).toBe(0);
    expect(result.completedSteps).toEqual([]);
  });

  it("executes within budget and emits learning evidence", async () => {
    const result = await runObscuraProcess({ count: 0 }, [step("one"), step("two")], {
      autonomy: "execute_reversible", risk: "medium", maxSteps: 2, budgetUnits: 2,
    });
    expect(result.status).toBe("completed");
    expect(result.context.count).toBe(2);
    expect(result.events.some((event) => event.phase === "learn" && event.status === "completed")).toBe(true);
  });

  it("blocks high-risk guarded execution without approval and rollback", async () => {
    await expect(runObscuraProcess({ count: 0 }, [step("one")], {
      autonomy: "execute_guarded", risk: "high", maxSteps: 1, budgetUnits: 1,
    })).rejects.toThrow("approvalRef");
  });

  it("marks recovery when verification fails", async () => {
    const result = await runObscuraProcess({ count: 0 }, [{
      id: "unsafe", phase: "execute", estimatedCost: 1,
      run: async (context: { count: number }) => ({ count: context.count }),
      verify: async () => false,
    }], { autonomy: "execute_reversible", risk: "medium", maxSteps: 1, budgetUnits: 1 });
    expect(result.status).toBe("failed");
    expect(result.rollbackRequired).toBe(true);
    expect(result.events.some((event) => event.phase === "recover")).toBe(true);
  });
});
