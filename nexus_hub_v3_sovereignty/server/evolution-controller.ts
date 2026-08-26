import { evaluateCapabilityProof, type CapabilityProof } from "./capability-proofs";
import { assertDoseWithinBudget, promoteAutonomy, regressAutonomy, type AutonomyState, type PromotionEvidence } from "./fibonacci-autonomy";

export type EvolutionOutcome = {
  decision: "promote" | "regress" | "blocked";
  proof: CapabilityProof;
  autonomy: AutonomyState;
  reason: string;
};

export function applyEvolutionProof(
  state: AutonomyState,
  proof: CapabilityProof,
  evidence: PromotionEvidence,
): EvolutionOutcome {
  const evaluated = evaluateCapabilityProof(proof);
  if (evaluated.decision === "blocked") {
    return {
      decision: "blocked",
      proof: evaluated,
      autonomy: regressAutonomy(state, "proof_blocked", true),
      reason: "A prova não possui Harness ou rollback disponíveis.",
    };
  }
  if (evaluated.decision === "regress") {
    return {
      decision: "regress",
      proof: evaluated,
      autonomy: regressAutonomy(state, "proof_rejected"),
      reason: "A capacidade não atingiu os critérios de aceitação sem regressão de baseline.",
    };
  }
  const next = promoteAutonomy(state, evidence);
  if (next.level === state.level) {
    return { decision: "regress", proof: evaluated, autonomy: next, reason: "A prova foi aceita, mas a evidência Fibonacci não autoriza promoção." };
  }
  return { decision: "promote", proof: evaluated, autonomy: next, reason: "Capacidade promovida com evidência e guardrails preservados." };
}

export function authorizeEvolutionWork(state: AutonomyState, requestedUnits: number) {
  assertDoseWithinBudget(state, requestedUnits);
  return { authorized: true, level: state.level, dose: state.dose, requestedUnits } as const;
}
