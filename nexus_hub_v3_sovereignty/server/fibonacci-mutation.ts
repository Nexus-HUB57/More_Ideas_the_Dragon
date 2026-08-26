import { createHash } from "node:crypto";
import type { AutonomyState, FibonacciLevel } from "./fibonacci-autonomy";

export type MutationMode = "observe" | "propose" | "sandbox_apply" | "promote";
export type MutationRequest = {
  id: string;
  state: AutonomyState;
  mode: MutationMode;
  targetFiles: string[];
  objective: string;
  expectedGainBps: number;
  maxRiskBps: number;
  requiredChecks: string[];
};

export type MutationProposal = {
  id: string;
  level: FibonacciLevel;
  mode: MutationMode;
  targetFiles: string[];
  objective: string;
  baselineDigest: string;
  changeDigest: string;
  expectedGainBps: number;
  maxRiskBps: number;
  gates: string[];
  status: "proposed" | "blocked";
};

const forbiddenTargets = [".env", ".git/", "node_modules/", "dist/", "package-lock.json"];
const safeModes: MutationMode[] = ["observe", "propose", "sandbox_apply"];

function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function proposeFibonacciMutation(request: MutationRequest, baseline: unknown, candidate: unknown): MutationProposal {
  if (!request.id.trim() || !request.objective.trim()) throw new Error("Mutação exige id e objetivo.");
  if (!safeModes.includes(request.mode)) throw new Error("Promoção de mutação exige uma CapabilityProof separada.");
  if (request.state.quarantined) throw new Error("Mutação bloqueada durante quarentena.");
  if (request.targetFiles.length === 0 || request.targetFiles.some((file) => forbiddenTargets.some((target) => file.includes(target)))) throw new Error("Alvo de mutação não autorizado.");
  if (request.expectedGainBps < 0 || request.expectedGainBps > 10_000 || request.maxRiskBps < 0 || request.maxRiskBps > 10_000) throw new Error("Parâmetros de mutação inválidos.");
  if (request.requiredChecks.length === 0) throw new Error("Mutação exige checks obrigatórios.");
  return {
    id: request.id,
    level: request.state.level,
    mode: request.mode,
    targetFiles: [...request.targetFiles],
    objective: request.objective,
    baselineDigest: digest(baseline),
    changeDigest: digest(candidate),
    expectedGainBps: request.expectedGainBps,
    maxRiskBps: request.maxRiskBps,
    gates: [...request.requiredChecks, "typescript", "unit_tests", "diff_review", "rollback_plan"],
    status: "proposed",
  };
}

export function canPromoteMutation(proposal: MutationProposal, evidence: { baselineDigest: string; changeDigest: string; checksPassed: boolean; rollbackReady: boolean; riskBps: number; gainBps: number }) {
  return proposal.status === "proposed"
    && evidence.baselineDigest === proposal.baselineDigest
    && evidence.changeDigest === proposal.changeDigest
    && evidence.checksPassed
    && evidence.rollbackReady
    && evidence.riskBps <= proposal.maxRiskBps
    && evidence.gainBps >= proposal.expectedGainBps;
}
