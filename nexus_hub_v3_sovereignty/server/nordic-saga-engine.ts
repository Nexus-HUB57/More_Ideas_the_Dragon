export type SagaType = "forge" | "ice" | "raven" | "bridge" | "wolf" | "aurora";
export type ChallengeMutation = "invert_premise" | "remove_channel" | "tighten_budget" | "add_contradiction" | "change_context" | "compress_time";

export type Saga = {
  id: string;
  type: SagaType;
  tension: string;
  objective: string;
  currentRoute: string;
  resilienceScoreBps: number;
  state: "called" | "forming" | "running" | "confronted" | "completed" | "regressed";
};

export type Challenge = {
  id: string;
  mutation: ChallengeMutation;
  constraint: string;
  expectedAdaptation: string;
  maxRiskBps: number;
};

export type StrategyMutation = {
  objectivePreserved: boolean;
  before: string;
  after: string;
  changedVariable: ChallengeMutation;
  newRisks: string[];
  evidenceRequired: string[];
};

export function createSaga(input: Pick<Saga, "id" | "type" | "tension" | "objective" | "currentRoute">): Saga {
  return { ...input, resilienceScoreBps: 0, state: "called" };
}

export function mutateStrategy(saga: Saga, challenge: Challenge, alternativeRoute: string, newRisks: string[]): StrategyMutation {
  if (!saga.objective.trim() || !alternativeRoute.trim()) throw new Error("Saga exige objetivo e rota válidos.");
  if (challenge.maxRiskBps < 0 || challenge.maxRiskBps > 10_000) throw new Error("Limite de risco do desafio inválido.");
  return {
    objectivePreserved: true,
    before: saga.currentRoute,
    after: alternativeRoute,
    changedVariable: challenge.mutation,
    newRisks,
    evidenceRequired: ["comparação com baseline", "teste adversarial", "verificação Harness", "registro de memória"],
  };
}

export function closeSaga(saga: Saga, outcome: "completed" | "regressed", resilienceScoreBps: number): Saga {
  if (resilienceScoreBps < 0 || resilienceScoreBps > 10_000) throw new Error("Score de resiliência inválido.");
  return { ...saga, state: outcome, resilienceScoreBps };
}
