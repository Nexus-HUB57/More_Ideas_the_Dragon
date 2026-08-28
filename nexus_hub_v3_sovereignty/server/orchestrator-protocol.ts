import { createHash, randomUUID } from "node:crypto";
import type { ExecutiveRole } from "./executive-agents";
import type { SkillAutonomy, SkillRisk } from "./executive-skills";
import { evaluateGuardedHarness, type MissionHarnessResult } from "./harness-engine";
import { assertDoseWithinBudget, type AutonomyState } from "./fibonacci-autonomy";

export type OrchestratorAutonomy = "recommend" | "execute_reversible" | "execute_guarded";
export type OrchestratorRisk = "low" | "medium" | "high" | "critical";
export type OrchestratorOutcome = "planned" | "blocked" | "ready" | "completed" | "failed" | "quarantined";

export type OrchestratorIntent = {
  missionId: number;
  correlationId?: string;
  objective: string;
  owner: string;
  executiveRole?: ExecutiveRole;
  skillKey?: string;
  skillAutonomy?: SkillAutonomy;
  skillRisk?: SkillRisk;
  autonomy: OrchestratorAutonomy;
  risk: OrchestratorRisk;
  budgetUnits: number;
  externalSideEffect: boolean;
  idempotencyKey?: string;
  evidenceRef?: string;
  approvalRef?: string;
  rollbackPlan?: string;
  securityReviewRef?: string;
  auditRef?: string;
  description?: string;
  status: "review" | "running" | "blocked" | "completed";
  dueAt?: Date | null;
};

export type OrchestratorDecision = {
  correlationId: string;
  outcome: OrchestratorOutcome;
  harness: MissionHarnessResult;
  reason: string;
  nextAction: "execute" | "collect_evidence" | "recover" | "quarantine" | "none";
};

export type AuditEnvelope = {
  eventId: string;
  correlationId: string;
  missionId: number;
  actor: string;
  action: string;
  risk: OrchestratorRisk;
  before: string;
  after: string;
  evidenceRefs: string[];
  harnessScore: number;
  toolRefs: string[];
  outcome: OrchestratorOutcome;
  occurredAt: string;
  digest: string;
};

function canonical(value: unknown) { return JSON.stringify(value, Object.keys(value as object).sort()); }
function makeDigest(value: unknown) { return createHash("sha256").update(canonical(value)).digest("hex"); }

export function preflightIntent(intent: OrchestratorIntent, autonomy: AutonomyState): OrchestratorDecision {
  const correlationId = intent.correlationId ?? randomUUID();
  if (!intent.objective.trim() || !intent.owner.trim()) return blocked(correlationId, "objective_owner_required");
  if (intent.budgetUnits < 0 || !Number.isInteger(intent.budgetUnits)) return blocked(correlationId, "invalid_budget");
  if (intent.externalSideEffect && !intent.idempotencyKey?.trim()) return blocked(correlationId, "idempotency_required");
  if (intent.autonomy === "execute_guarded") {
    if (!intent.evidenceRef?.trim() || !intent.approvalRef?.trim() || !intent.rollbackPlan?.trim() || !intent.auditRef?.trim()) return blocked(correlationId, "guarded_requirements_missing");
  }
  try { assertDoseWithinBudget(autonomy, intent.budgetUnits); } catch { return blocked(correlationId, "fibonacci_budget_exceeded"); }
  const harness = evaluateGuardedHarness({
    status: intent.status,
    title: intent.objective,
    description: intent.description ?? intent.objective,
    owner: intent.owner,
    riskScore: intent.risk === "critical" ? 100 : intent.risk === "high" ? 80 : intent.risk === "medium" ? 50 : 20,
    dueAt: intent.dueAt,
    skillAutonomy: intent.skillAutonomy,
    skillRisk: intent.skillRisk,
    executiveRole: intent.executiveRole,
    evidenceRef: intent.evidenceRef,
    approvalRef: intent.approvalRef,
    rollbackPlan: intent.rollbackPlan,
    idempotencyKey: intent.idempotencyKey,
    securityReviewRef: intent.securityReviewRef,
    auditRef: intent.auditRef,
    externalSideEffect: intent.externalSideEffect,
  });
  if (!harness.passed) return { correlationId, outcome: "blocked", harness, reason: "harness_rejected", nextAction: "collect_evidence" };
  return { correlationId, outcome: intent.autonomy === "recommend" ? "planned" : "ready", harness, reason: "preflight_passed", nextAction: intent.autonomy === "recommend" ? "none" : "execute" };
}

export function createAuditEnvelope(input: Omit<AuditEnvelope, "eventId" | "occurredAt" | "digest">): AuditEnvelope {
  const envelope = { ...input, eventId: randomUUID(), occurredAt: new Date().toISOString() };
  return { ...envelope, digest: makeDigest(envelope) };
}

function blocked(correlationId: string, reason: string): OrchestratorDecision {
  return { correlationId, outcome: "blocked", harness: { passed: false, score: 0, checks: [{ id: "preflight", label: reason, status: "failed", evidence: reason }] }, reason, nextAction: "collect_evidence" };
}
