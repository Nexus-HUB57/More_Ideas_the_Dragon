export type SwarmPriority = "critical" | "high" | "normal" | "low";

export type SwarmTask<TInput, TOutput> = {
  id: string;
  agentRole: string;
  priority?: SwarmPriority;
  dependsOn?: string[];
  estimatedCost?: number;
  run: (input: TInput, context: ReadonlyMap<string, unknown>, signal: AbortSignal) => TOutput | Promise<TOutput>;
};

export type SwarmExecutionOptions = {
  maxConcurrency?: number;
  budgetUnits?: number;
  signal?: AbortSignal;
};

export type SwarmExecutionResult = {
  outputs: Map<string, unknown>;
  order: string[];
  levels: string[][];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    peakConcurrency: number;
    consumedBudgetUnits: number;
    durationMs: number;
  };
};

const priorityRank: Record<SwarmPriority, number> = { critical: 4, high: 3, normal: 2, low: 1 };

export function buildExecutionLevels<TInput, TOutput>(tasks: SwarmTask<TInput, TOutput>[]): string[][] {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  if (byId.size !== tasks.length) throw new Error("Enxame contém IDs de tasks duplicados.");

  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const task of tasks) {
    indegree.set(task.id, task.dependsOn?.length ?? 0);
    for (const dependency of task.dependsOn ?? []) {
      if (!byId.has(dependency)) throw new Error(`Dependência ausente no enxame: ${dependency}.`);
      dependents.set(dependency, [...(dependents.get(dependency) ?? []), task.id]);
    }
  }

  let frontier = tasks.filter((task) => indegree.get(task.id) === 0).map((task) => task.id);
  const levels: string[][] = [];
  let visited = 0;
  while (frontier.length > 0) {
    const level = [...frontier].sort((a, b) => {
      const left = priorityRank[byId.get(a)?.priority ?? "normal"];
      const right = priorityRank[byId.get(b)?.priority ?? "normal"];
      return right - left || a.localeCompare(b);
    });
    levels.push(level);
    visited += level.length;
    const next: string[] = [];
    for (const completed of level) {
      for (const dependent of dependents.get(completed) ?? []) {
        const remaining = (indegree.get(dependent) ?? 0) - 1;
        indegree.set(dependent, remaining);
        if (remaining === 0) next.push(dependent);
      }
    }
    frontier = next;
  }

  if (visited !== tasks.length) throw new Error("Ciclo detectado no enxame agentico.");
  return levels;
}

export async function executeAgentSwarm<TInput, TOutput>(
  tasks: SwarmTask<TInput, TOutput>[],
  input: TInput,
  options: SwarmExecutionOptions = {},
): Promise<SwarmExecutionResult> {
  const startedAt = Date.now();
  const levels = buildExecutionLevels(tasks);
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const outputs = new Map<string, unknown>();
  const order: string[] = [];
  const maxConcurrency = Math.max(1, Math.floor(options.maxConcurrency ?? 4));
  const budgetUnits = options.budgetUnits ?? Number.POSITIVE_INFINITY;
  const controller = new AbortController();
  const signal = options.signal ?? controller.signal;
  let consumedBudgetUnits = 0;
  let peakConcurrency = 0;
  let active = 0;
  let failedTasks = 0;

  for (const level of levels) {
    if (signal.aborted) throw new Error("Execução do enxame cancelada.");
    const queue = [...level];
    while (queue.length > 0) {
      if (signal.aborted) throw new Error("Execução do enxame cancelada.");
      const batch = queue.splice(0, maxConcurrency);
      const cost = batch.reduce((sum, id) => sum + (byId.get(id)?.estimatedCost ?? 1), 0);
      if (consumedBudgetUnits + cost > budgetUnits) {
        throw new Error(`Budget de compute excedido: ${consumedBudgetUnits + cost}/${budgetUnits} unidades.`);
      }
      consumedBudgetUnits += cost;
      active += batch.length;
      peakConcurrency = Math.max(peakConcurrency, active);
      const results = await Promise.allSettled(batch.map(async (id) => {
        const task = byId.get(id)!;
        return [id, await task.run(input, outputs, signal)] as const;
      }));
      active -= batch.length;
      for (const result of results) {
        if (result.status === "rejected") {
          failedTasks += 1;
          controller.abort();
          throw result.reason;
        }
        const [id, value] = result.value;
        outputs.set(id, value);
        order.push(id);
      }
    }
  }

  return {
    outputs,
    order,
    levels,
    metrics: {
      totalTasks: tasks.length,
      completedTasks: outputs.size,
      failedTasks,
      peakConcurrency,
      consumedBudgetUnits,
      durationMs: Date.now() - startedAt,
    },
  };
}
