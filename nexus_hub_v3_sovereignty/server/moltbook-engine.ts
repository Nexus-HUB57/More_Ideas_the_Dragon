export type MoltbookIdeaKind = "hypothesis" | "thesis" | "question" | "opportunity" | "decision" | "objection" | "principle" | "signal";
export type MoltbookRelation = "supports" | "contradicts" | "depends_on" | "refines" | "instantiates" | "analogous_to" | "supersedes" | "causes";
export type AmbiguityLevel = "A0" | "A1" | "A2" | "A3" | "A4";

export type MoltbookIdea = {
  id: string;
  title: string;
  kind: MoltbookIdeaKind;
  confidenceBps: number;
  ambiguityBps: number;
  evidenceCount: number;
};

export type MoltbookEdge = {
  from: string;
  to: string;
  relation: MoltbookRelation;
  strengthBps: number;
};

export type AmbiguityAssessment = {
  level: AmbiguityLevel;
  scoreBps: number;
  reasons: string[];
  requiresExploration: boolean;
  blocksIrreversibleExecution: boolean;
};

export function assessAmbiguity(input: {
  ambiguityBps: number;
  interpretationCount: number;
  contradictionCount: number;
  evidenceCount: number;
  decisionSensitivity: "low" | "medium" | "high" | "critical";
}): AmbiguityAssessment {
  const score = Math.max(0, Math.min(10_000, Math.round(
    input.ambiguityBps * 0.45
      + Math.min(input.interpretationCount, 4) * 700
      + Math.min(input.contradictionCount, 4) * 900
      + Math.max(0, 3 - input.evidenceCount) * 500
      + ({ low: 0, medium: 350, high: 900, critical: 1_500 }[input.decisionSensitivity]),
  )));
  const reasons: string[] = [];
  if (input.interpretationCount > 1) reasons.push("interpretações concorrentes");
  if (input.contradictionCount > 0) reasons.push("evidência contraditória");
  if (input.evidenceCount < 3) reasons.push("evidência insuficiente");
  if (input.decisionSensitivity === "critical" || input.decisionSensitivity === "high") reasons.push("decisão sensível");
  const level: AmbiguityLevel = score <= 1_500 ? "A0" : score <= 3_500 ? "A1" : score <= 6_000 ? "A2" : score <= 8_000 ? "A3" : "A4";
  return {
    level,
    scoreBps: score,
    reasons,
    requiresExploration: level !== "A0",
    blocksIrreversibleExecution: level === "A3" || level === "A4" || input.decisionSensitivity === "critical",
  };
}

export function validateMoltbookEdge(edge: MoltbookEdge, ideas: Map<string, MoltbookIdea>) {
  if (!ideas.has(edge.from) || !ideas.has(edge.to)) throw new Error("Relação aponta para ideia inexistente.");
  if (edge.from === edge.to && ["contradicts", "depends_on", "supersedes"].includes(edge.relation)) {
    throw new Error(`Relação ${edge.relation} não pode apontar para o próprio nó.`);
  }
  if (edge.strengthBps < 0 || edge.strengthBps > 10_000) throw new Error("Força da relação deve estar entre 0 e 10000 bps.");
  return true;
}

export function rankProcessCandidates(ideas: MoltbookIdea[], assessments: Map<string, AmbiguityAssessment>) {
  return ideas
    .filter((idea) => idea.kind === "hypothesis" || idea.kind === "opportunity" || idea.kind === "thesis")
    .map((idea) => {
      const assessment = assessments.get(idea.id);
      const ambiguityPenalty = assessment?.blocksIrreversibleExecution ? 2_000 : (assessment?.scoreBps ?? idea.ambiguityBps) / 4;
      const score = idea.confidenceBps + Math.min(idea.evidenceCount, 10) * 350 - ambiguityPenalty;
      return { idea, assessment, score: Math.round(score) };
    })
    .sort((a, b) => b.score - a.score);
}
