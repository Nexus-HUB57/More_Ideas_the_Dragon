export const FIBONACCI_DOSES = [1, 1, 2, 3, 5, 8, 13, 21] as const;

export type FibonacciLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type PromotionEvidence = {
  successRateBps: number;
  evidenceQualityBps: number;
  violationCount: number;
  rollbackCount: number;
  observedCostUnits: number;
  reversible: boolean;
  harnessPassed: boolean;
};

export type AutonomyState = {
  level: FibonacciLevel;
  dose: number;
  quarantined: boolean;
  lastReason: string;
};

const minimumSuccessByLevel = [0, 8_000, 8_000, 8_500, 8_500, 9_000, 9_000, 9_500, 9_500];

export function initialAutonomyState(): AutonomyState {
  return { level: 1, dose: FIBONACCI_DOSES[0], quarantined: false, lastReason: "initialized" };
}

export function canPromote(state: AutonomyState, evidence: PromotionEvidence) {
  if (state.quarantined || !evidence.harnessPassed || !evidence.reversible) return false;
  if (evidence.violationCount > 0 || evidence.rollbackCount > 0) return false;
  if (evidence.successRateBps < minimumSuccessByLevel[state.level]) return false;
  if (evidence.evidenceQualityBps < 7_500) return false;
  return evidence.observedCostUnits <= FIBONACCI_DOSES[state.level - 1];
}

export function promoteAutonomy(state: AutonomyState, evidence: PromotionEvidence): AutonomyState {
  if (!canPromote(state, evidence)) return { ...state, lastReason: "promotion_denied" };
  const nextLevel = Math.min(8, state.level + 1) as FibonacciLevel;
  return { level: nextLevel, dose: FIBONACCI_DOSES[nextLevel - 1], quarantined: false, lastReason: "promoted_with_evidence" };
}

export function regressAutonomy(state: AutonomyState, reason: string, critical = false): AutonomyState {
  if (critical) return { level: 1, dose: FIBONACCI_DOSES[0], quarantined: true, lastReason: reason };
  const nextLevel = Math.max(1, state.level - 2) as FibonacciLevel;
  return { level: nextLevel, dose: FIBONACCI_DOSES[nextLevel - 1], quarantined: false, lastReason: reason };
}

export function assertDoseWithinBudget(state: AutonomyState, requestedUnits: number) {
  if (!Number.isFinite(requestedUnits) || requestedUnits < 0) throw new Error("Dose solicitada inválida.");
  if (requestedUnits > state.dose) throw new Error(`Dose Fibonacci excedida: ${requestedUnits}/${state.dose}.`);
}
