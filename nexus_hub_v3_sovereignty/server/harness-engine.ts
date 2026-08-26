import type { MissionStatus } from "./orchestrator-engine";
import type { ExecutiveRole } from "./executive-agents";
import type { SkillAutonomy, SkillRisk } from "./executive-skills";

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

export type GuardedHarnessInput = MissionHarnessInput & {
  skillAutonomy?: SkillAutonomy | null;
  skillRisk?: SkillRisk | null;
  executiveRole?: ExecutiveRole | null;
  evidenceRef?: string | null;
  approvalRef?: string | null;
  rollbackPlan?: string | null;
  idempotencyKey?: string | null;
  securityReviewRef?: string | null;
  auditRef?: string | null;
  externalSideEffect?: boolean;
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
  return summarizeHarness(checks);
}

export function evaluateGuardedHarness(input: GuardedHarnessInput, now = Date.now()): MissionHarnessResult {
  const base = evaluateMissionHarness(input, now);
  if (input.skillAutonomy !== "execute_guarded") return base;

  const guardedChecks: HarnessCheck[] = [
    {
      id: "guarded-skill-identity",
      label: "Skill guarded e agente executivo identificados",
      status: input.skillRisk && input.executiveRole ? "passed" : "failed",
      evidence: input.skillRisk && input.executiveRole ? `Skill de risco ${input.skillRisk} atribuída a ${input.executiveRole}.` : "Skill guarded exige risco e agente executivo identificados.",
    },
    {
      id: "guarded-evidence",
      label: "Evidência do resultado anexada",
      status: input.evidenceRef?.trim() ? "passed" : "failed",
      evidence: input.evidenceRef?.trim() ? `Evidência: ${input.evidenceRef}.` : "Sem evidência verificável do resultado.",
    },
    {
      id: "guarded-approval",
      label: "Aprovação explícita registrada",
      status: input.approvalRef?.trim() ? "passed" : "failed",
      evidence: input.approvalRef?.trim() ? `Aprovação: ${input.approvalRef}.` : "Ação guarded requer aprovação explícita antes do efeito.",
    },
    {
      id: "guarded-rollback",
      label: "Plano de rollback definido",
      status: input.rollbackPlan?.trim() ? "passed" : "failed",
      evidence: input.rollbackPlan?.trim() ? "Plano de reversão disponível." : "Nenhum plano de rollback foi informado.",
    },
    {
      id: "guarded-idempotency",
      label: "Chave de idempotência presente para efeitos externos",
      status: input.externalSideEffect ? (input.idempotencyKey?.trim() ? "passed" : "failed") : "passed",
      evidence: input.externalSideEffect ? (input.idempotencyKey?.trim() ? `Idempotency key: ${input.idempotencyKey}.` : "Efeito externo sem chave de idempotência.") : "Nenhum efeito externo declarado.",
    },
    {
      id: "guarded-security-review",
      label: "Revisão de segurança registrada",
      status: input.externalSideEffect ? (input.securityReviewRef?.trim() ? "passed" : "failed") : "passed",
      evidence: input.externalSideEffect ? (input.securityReviewRef?.trim() ? `Revisão: ${input.securityReviewRef}.` : "Efeito externo sem referência de revisão de segurança.") : "Gate de segurança externa não aplicável.",
    },
    {
      id: "guarded-audit",
      label: "Referência de auditoria preparada",
      status: input.auditRef?.trim() ? "passed" : "failed",
      evidence: input.auditRef?.trim() ? `Auditoria: ${input.auditRef}.` : "A ação guarded precisa de uma referência de auditoria.",
    },
  ];

  return summarizeHarness([...base.checks, ...guardedChecks]);
}

function summarizeHarness(checks: HarnessCheck[]): MissionHarnessResult {
  const hardFailures = checks.filter((check) => check.status === "failed").length;
  const score = Math.round((checks.filter((check) => check.status === "passed").length / checks.length) * 100);
  return { passed: hardFailures === 0, score, checks };
}
