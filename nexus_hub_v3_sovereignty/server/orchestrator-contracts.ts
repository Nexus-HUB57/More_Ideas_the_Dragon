import { createHash } from "node:crypto";

export const authorityTiers = ["observe", "recommend", "reversible", "guarded"] as const;
export type AuthorityTier = (typeof authorityTiers)[number];
export const environments = ["design", "sandbox", "staging", "production"] as const;
export type ExecutionEnvironment = (typeof environments)[number];
export const effectClasses = ["read_only", "internal_write", "external_side_effect", "financial", "infrastructure"] as const;
export type EffectClass = (typeof effectClasses)[number];

export type SloContract = {
  availabilityBps: number;
  p95LatencyMs: number;
  maxErrorRateBps: number;
  observationWindowSec: number;
};

export type EvidenceContract = {
  requiredRefs: string[];
  reproducible: boolean;
  verifierQuorum: number;
  digest?: string;
};

export type RollbackContract = {
  plan: string;
  checkpointRef: string;
  tested: boolean;
  maxRecoverySec: number;
};

export type ExecutionScope = {
  environment: ExecutionEnvironment;
  allowedResources: string[];
  deniedResources: string[];
  effectClass: EffectClass;
  maxBudgetUnits: number;
  timeoutMs: number;
  authority: AuthorityTier;
};

export type MissionContract = {
  contractVersion: "1.0";
  missionId: number;
  correlationId: string;
  objective: string;
  owner: string;
  scope: ExecutionScope;
  preconditions: string[];
  successCriteria: string[];
  evidence: EvidenceContract;
  rollback: RollbackContract;
  slo: SloContract;
  createdAt: string;
};

export function validateMissionContract(contract: MissionContract) {
  if (contract.contractVersion !== "1.0") throw new Error("Versão de contrato não suportada.");
  if (!Number.isInteger(contract.missionId) || contract.missionId <= 0) throw new Error("missionId inválido.");
  if (!contract.correlationId.trim() || !contract.objective.trim() || !contract.owner.trim()) throw new Error("Identidade da missão incompleta.");
  if (contract.scope.allowedResources.some((resource) => contract.scope.deniedResources.includes(resource))) throw new Error("Recurso simultaneamente permitido e negado.");
  if (!Number.isInteger(contract.scope.maxBudgetUnits) || contract.scope.maxBudgetUnits < 0) throw new Error("Budget inválido.");
  if (!Number.isInteger(contract.scope.timeoutMs) || contract.scope.timeoutMs < 100) throw new Error("Timeout inválido.");
  if (contract.scope.effectClass !== "read_only" && contract.scope.authority === "observe") throw new Error("Observe não pode produzir efeitos.");
  if (["external_side_effect", "financial", "infrastructure"].includes(contract.scope.effectClass) && contract.scope.authority !== "guarded") throw new Error("Efeito de alto impacto exige autoridade guarded.");
  if (contract.evidence.verifierQuorum < 1 || !Number.isInteger(contract.evidence.verifierQuorum)) throw new Error("Quorum de verificadores inválido.");
  if (!contract.rollback.plan.trim() || !contract.rollback.checkpointRef.trim()) throw new Error("Rollback incompleto.");
  if (contract.slo.availabilityBps < 0 || contract.slo.availabilityBps > 10_000 || contract.slo.maxErrorRateBps < 0 || contract.slo.maxErrorRateBps > 10_000 || contract.slo.p95LatencyMs <= 0) throw new Error("SLO inválido.");
  return contract;
}

export function digestMissionContract(contract: MissionContract) {
  validateMissionContract(contract);
  return createHash("sha256").update(JSON.stringify(contract)).digest("hex");
}
