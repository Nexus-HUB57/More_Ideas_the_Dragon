import type { MissionStatus } from "./orchestrator-engine";

export type HarnessCheckStatus = "passed" | "warning" | "failed";

export type HarnessCheck = {
  id: string;
  label: string;
  status: HarnessCheckStatus;
  evidence: string;
};

export type MissionHarnessInput = {
  status: MissionStatus;
  title: string;
  description?: string | null;
  owner: string;
  riskScore: number;
  dueAt?: Date | string | null;
};

export type MissionHarnessResult = {
  passed: boolean;
  score: number;
  checks: HarnessCheck[];
};

export function evaluateMissionHarness(mission: MissionHarnessInput, now = Date.now()): MissionHarnessResult {
  const checks: HarnessCheck[] = [
    {
      id: "review-state",
      label: "Missão está em revisão",
      status: mission.status === "review" ? "passed" : "failed",
      evidence: mission.status === "review" ? "A missão passou pelo fluxo operacional." : `Estado atual: ${mission.status}.`,
    },
    {
      id: "definition-of-done",
      label: "Resultado esperado documentado",
      status: mission.description?.trim() ? "passed" : "failed",
      evidence: mission.description?.trim() ? "Descrição disponível para validação." : "Adicione a descrição e o critério de conclusão.",
    },
    {
      id: "ownership",
      label: "Responsável definido",
      status: mission.owner.trim() ? "passed" : "failed",
      evidence: mission.owner.trim() ? `Responsável: ${mission.owner}.` : "A missão precisa de um responsável.",
    },
    {
      id: "risk-budget",
      label: "Risco dentro do orçamento de conclusão",
      status: mission.riskScore <= 70 ? "passed" : "warning",
      evidence: `Risco calculado: ${mission.riskScore}/100; limite recomendado: 70/100.`,
    },
    {
      id: "deadline-signal",
      label: "Prazo conhecido ou explicitamente sem prazo",
      status: mission.dueAt ? (new Date(mission.dueAt).getTime() >= now ? "passed" : "warning") : "warning",
      evidence: mission.dueAt ? `Prazo: ${new Date(mission.dueAt).toISOString()}.` : "Sem prazo informado; registrar decisão ou prazo aumenta a previsibilidade.",
    },
  ];

  const hardFailures = checks.filter((check) => check.status === "failed").length;
  const score = Math.round((checks.filter((check) => check.status === "passed").length / checks.length) * 100);
  return { passed: hardFailures === 0, score, checks };
}
