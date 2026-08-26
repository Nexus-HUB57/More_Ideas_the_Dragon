export type LoopState = "idle" | "running" | "backoff" | "paused" | "open_circuit" | "stopped";

export type LoopPolicy = {
  maxCycles: number;
  budgetPerCycle: number;
  maxConsecutiveFailures: number;
  baseBackoffMs: number;
  maxBackoffMs: number;
};

export type LoopCycleResult<T> = {
  state: LoopState;
  cycle: number;
  value?: T;
  consumedBudget: number;
  failures: number;
  nextBackoffMs: number;
  reason?: string;
};

export type LoopEvent = {
  cycle: number;
  state: LoopState;
  detail: string;
  at: string;
};

export type PerpetualLoop<T> = {
  state: LoopState;
  cycle: number;
  consecutiveFailures: number;
  events: LoopEvent[];
  results: LoopCycleResult<T>[];
};

export function createPerpetualLoop<T>(): PerpetualLoop<T> {
  return { state: "idle", cycle: 0, consecutiveFailures: 0, events: [], results: [] };
}

function event<T>(loop: PerpetualLoop<T>, state: LoopState, detail: string) {
  loop.events.push({ cycle: loop.cycle, state, detail, at: new Date().toISOString() });
}

export async function runPerpetualLoop<T>(
  loop: PerpetualLoop<T>,
  policy: LoopPolicy,
  worker: (cycle: number) => Promise<{ value: T; cost: number }>,
  options: { signal?: AbortSignal; sleep?: (ms: number) => Promise<void> } = {},
) {
  if (policy.maxCycles < 1 || policy.budgetPerCycle < 0 || policy.maxConsecutiveFailures < 1) throw new Error("Política de loop inválida.");
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const results: LoopCycleResult<T>[] = [];
  loop.state = "running";
  event(loop, "running", "loop_started");

  while (loop.cycle < policy.maxCycles) {
    if (options.signal?.aborted) {
      loop.state = "paused";
      event(loop, "paused", "abort_signal_received");
      break;
    }
    loop.cycle += 1;
    try {
      const output = await worker(loop.cycle);
      if (!Number.isFinite(output.cost) || output.cost > policy.budgetPerCycle) {
        throw new Error(`budget_exceeded:${output.cost}/${policy.budgetPerCycle}`);
      }
      loop.consecutiveFailures = 0;
      const result: LoopCycleResult<T> = { state: "running", cycle: loop.cycle, value: output.value, consumedBudget: output.cost, failures: 0, nextBackoffMs: 0 };
      results.push(result);
      loop.results.push(result);
      event(loop, "running", `cycle_completed:${loop.cycle}`);
    } catch (error) {
      loop.consecutiveFailures += 1;
      const nextBackoffMs = Math.min(policy.maxBackoffMs, policy.baseBackoffMs * 2 ** (loop.consecutiveFailures - 1));
      const state: LoopState = loop.consecutiveFailures >= policy.maxConsecutiveFailures ? "open_circuit" : "backoff";
      loop.state = state;
      const result: LoopCycleResult<T> = { state, cycle: loop.cycle, consumedBudget: 0, failures: loop.consecutiveFailures, nextBackoffMs, reason: error instanceof Error ? error.message : "worker_failed" };
      results.push(result);
      loop.results.push(result);
      event(loop, state, result.reason ?? "worker_failed");
      if (state === "open_circuit") break;
      await sleep(nextBackoffMs);
      loop.state = "running";
      event(loop, "running", "backoff_completed");
    }
  }
  if (loop.state === "running") {
    loop.state = loop.cycle >= policy.maxCycles ? "stopped" : "idle";
    event(loop, loop.state, "loop_finished");
  }
  return { ...loop, results };
}
