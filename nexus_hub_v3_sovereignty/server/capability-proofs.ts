export type ProofDecision = "promote" | "regress" | "blocked";
export type ProofStatus = "draft" | "running" | "accepted" | "rejected";

export type CapabilityProof = {
  id: string;
  capability: string;
  currentLimit: string;
  hypothesis: string;
  authorizedScope: string;
  experiment: string;
  baseline: Record<string, number>;
  observed: Record<string, number>;
  acceptance: Record<string, number>;
  stopConditions: string[];
  evidenceRefs: string[];
  harnessPassed: boolean;
  rollbackAvailable: boolean;
  status: ProofStatus;
  decision?: ProofDecision;
};

export function evaluateCapabilityProof(proof: CapabilityProof): CapabilityProof {
  if (!proof.id || !proof.capability || !proof.hypothesis) throw new Error("CapabilityProof exige identidade, capacidade e hipótese.");
  if (!proof.authorizedScope || proof.evidenceRefs.length === 0) throw new Error("CapabilityProof exige escopo autorizado e evidência.");
  if (!proof.harnessPassed || !proof.rollbackAvailable) {
    return { ...proof, status: "rejected", decision: "blocked" };
  }
  const criteria = Object.entries(proof.acceptance);
  const accepted = criteria.length > 0 && criteria.every(([key, minimum]) => (proof.observed[key] ?? Number.NEGATIVE_INFINITY) >= minimum);
  const regressed = Object.entries(proof.baseline).some(([key, baseline]) => (proof.observed[key] ?? baseline) < baseline);
  if (accepted && !regressed) return { ...proof, status: "accepted", decision: "promote" };
  return { ...proof, status: "rejected", decision: "regress" };
}

export function shouldStopProof(input: {
  elapsedMs: number;
  timeoutMs: number;
  consumedBudget: number;
  budgetLimit: number;
  violations: number;
  contradictionDetected: boolean;
}) {
  return input.elapsedMs >= input.timeoutMs
    || input.consumedBudget > input.budgetLimit
    || input.violations > 0
    || input.contradictionDetected;
}

export function mergeEvidenceRefs(existing: string[], additions: string[]) {
  const unique: string[] = [];
  for (const ref of [...existing, ...additions].filter(Boolean)) {
    if (!unique.includes(ref)) unique.push(ref);
  }
  return unique;
}
