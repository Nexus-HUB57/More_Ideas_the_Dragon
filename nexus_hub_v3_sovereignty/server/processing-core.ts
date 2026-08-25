export type ProcessingNode<TInput, TOutput> = {
  id: string;
  dependsOn?: string[];
  run: (input: TInput, context: ReadonlyMap<string, unknown>) => TOutput | Promise<TOutput>;
};

export type ProcessingGraphResult = {
  order: string[];
  outputs: Map<string, unknown>;
};

export async function executeProcessingGraph<TInput>(nodes: ProcessingNode<TInput, unknown>[], input: TInput): Promise<ProcessingGraphResult> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  if (byId.size !== nodes.length) throw new Error("Grafo de processamento contém IDs duplicados.");

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const order: string[] = [];

  const visit = (id: string) => {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Ciclo detectado no grafo de processamento em ${id}.`);
    const node = byId.get(id);
    if (!node) throw new Error(`Dependência ausente no grafo de processamento: ${id}.`);
    visiting.add(id);
    for (const dependency of node.dependsOn ?? []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
    order.push(id);
  };

  for (const node of nodes) visit(node.id);

  const outputs = new Map<string, unknown>();
  for (const id of order) {
    const node = byId.get(id)!;
    outputs.set(id, await node.run(input, outputs));
  }
  return { order, outputs };
}

export type StartupSignalInput = {
  id: number;
  name: string;
  revenue: number;
  traction: number;
  reputation: number;
  status: "planning" | "development" | "launched" | "scaling" | "mature" | "archived";
};

export type StartupSignal = {
  startupId: number;
  startupName: string;
  readinessScore: number;
  signal: "validate" | "accelerate" | "scale" | "stabilize";
  recommendedAction: string;
  evidence: Record<string, number | string>;
};

const lifecycleScore: Record<StartupSignalInput["status"], number> = {
  planning: 20,
  development: 45,
  launched: 65,
  scaling: 85,
  mature: 100,
  archived: 0,
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export async function calculateStartupSignal(startup: StartupSignalInput): Promise<StartupSignal> {
  const graph = await executeProcessingGraph<StartupSignalInput>([
    {
      id: "normalize",
      run: (input) => ({
        revenue: clamp(Math.log10(Math.max(0, input.revenue) + 1) * 20),
        traction: clamp(input.traction),
        reputation: clamp(input.reputation),
        lifecycle: lifecycleScore[input.status],
      }),
    },
    {
      id: "readiness",
      dependsOn: ["normalize"],
      run: (_input, context) => {
        const normalized = context.get("normalize") as { revenue: number; traction: number; reputation: number; lifecycle: number };
        return clamp(normalized.revenue * 0.35 + normalized.traction * 0.3 + normalized.reputation * 0.2 + normalized.lifecycle * 0.15);
      },
    },
    {
      id: "routing",
      dependsOn: ["normalize", "readiness"],
      run: (input, context) => {
        const normalized = context.get("normalize") as { reputation: number };
        const readiness = context.get("readiness") as number;
        if (input.status === "archived" || normalized.reputation < 30) return { signal: "stabilize" as const, recommendedAction: "Revisar saúde, reputação e premissas antes de investir mais capacidade." };
        if (readiness < 40) return { signal: "validate" as const, recommendedAction: "Executar experimentos de descoberta e validação com critério de saída." };
        if (readiness < 70) return { signal: "accelerate" as const, recommendedAction: "Acelerar o caminho do MVP até receita repetível e retenção observável." };
        return { signal: "scale" as const, recommendedAction: "Escalar aquisição e infraestrutura com limites de risco e qualidade." };
      },
    },
  ], startup);

  const normalized = graph.outputs.get("normalize") as { revenue: number; traction: number; reputation: number; lifecycle: number };
  const readinessScore = graph.outputs.get("readiness") as number;
  const routing = graph.outputs.get("routing") as { signal: StartupSignal["signal"]; recommendedAction: string };
  return {
    startupId: startup.id,
    startupName: startup.name,
    readinessScore,
    signal: routing.signal,
    recommendedAction: routing.recommendedAction,
    evidence: { revenue: normalized.revenue, traction: normalized.traction, reputation: normalized.reputation, lifecycle: normalized.lifecycle },
  };
}
