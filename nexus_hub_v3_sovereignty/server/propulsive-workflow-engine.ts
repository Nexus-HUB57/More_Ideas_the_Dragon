export type Route = {
  id: string;
  name: string;
  noveltyBps: number;
  evidenceBps: number;
  riskBps: number;
  costUnits: number;
  reversible: boolean;
  firstProof: string;
};

export type PropulsiveWorkflow = {
  id: string;
  ambition: string;
  tension: string;
  routes: Route[];
  selectedRoute?: string;
  state: "framed" | "challenging" | "proving" | "executing" | "breakthrough" | "regressed";
};

export type Breakthrough = {
  capability: string;
  previousLimit: string;
  newCapability: string;
  evidenceRefs: string[];
  transferable: boolean;
  conditions: string[];
  failureModes: string[];
};

export function framePropulsiveWorkflow(input: Pick<PropulsiveWorkflow, "id" | "ambition" | "tension">): PropulsiveWorkflow {
  if (!input.ambition.trim() || !input.tension.trim()) throw new Error("Workflow exige ambição e tensão.");
  return { ...input, routes: [], state: "framed" };
}

export function addRoute(workflow: PropulsiveWorkflow, route: Route): PropulsiveWorkflow {
  if (route.costUnits < 0 || route.riskBps < 0 || route.riskBps > 10_000) throw new Error("Rota possui custo ou risco inválido.");
  if (!route.firstProof.trim()) throw new Error("Toda rota deve possuir uma primeira prova.");
  return { ...workflow, routes: [...workflow.routes, route], state: "challenging" };
}

export function selectRoute(workflow: PropulsiveWorkflow): PropulsiveWorkflow {
  if (workflow.routes.length < 3) throw new Error("Workflow propulsor exige pelo menos três rotas concorrentes.");
  const ranked = [...workflow.routes].sort((a, b) => {
    const scoreA = a.noveltyBps * 0.35 + a.evidenceBps * 0.35 + (a.reversible ? 1_500 : 0) - a.riskBps * 0.2 - a.costUnits * 50;
    const scoreB = b.noveltyBps * 0.35 + b.evidenceBps * 0.35 + (b.reversible ? 1_500 : 0) - b.riskBps * 0.2 - b.costUnits * 50;
    return scoreB - scoreA;
  });
  return { ...workflow, selectedRoute: ranked[0].id, state: "proving" };
}

export function recordBreakthrough(workflow: PropulsiveWorkflow, breakthrough: Breakthrough): PropulsiveWorkflow {
  if (!workflow.selectedRoute) throw new Error("Breakthrough exige uma rota selecionada.");
  if (breakthrough.evidenceRefs.length === 0 || breakthrough.conditions.length === 0) throw new Error("Breakthrough exige evidências e condições de validade.");
  return { ...workflow, state: "breakthrough" };
}
