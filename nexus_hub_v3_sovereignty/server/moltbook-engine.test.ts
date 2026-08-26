import { describe, expect, it } from "vitest";
import { assessAmbiguity, rankProcessCandidates, validateMoltbookEdge } from "./moltbook-engine";

describe("Moltbook semantic engine", () => {
  it("classifies a well-supported idea as A0", () => {
    const result = assessAmbiguity({ ambiguityBps: 200, interpretationCount: 1, contradictionCount: 0, evidenceCount: 8, decisionSensitivity: "low" });
    expect(result.level).toBe("A0");
    expect(result.blocksIrreversibleExecution).toBe(false);
  });

  it("keeps critical ambiguity from irreversible execution", () => {
    const result = assessAmbiguity({ ambiguityBps: 3_000, interpretationCount: 2, contradictionCount: 1, evidenceCount: 1, decisionSensitivity: "critical" });
    expect(["A2", "A3", "A4"]).toContain(result.level);
    expect(result.blocksIrreversibleExecution).toBe(true);
    expect(result.requiresExploration).toBe(true);
  });

  it("rejects invalid self-referential dependency", () => {
    const ideas = new Map([["a", { id: "a", title: "A", kind: "hypothesis" as const, confidenceBps: 5000, ambiguityBps: 1000, evidenceCount: 2 }]]);
    expect(() => validateMoltbookEdge({ from: "a", to: "a", relation: "depends_on", strengthBps: 5000 }, ideas)).toThrow();
  });

  it("ranks supported opportunities above ambiguous candidates", () => {
    const ideas = [
      { id: "a", title: "A", kind: "opportunity" as const, confidenceBps: 8000, ambiguityBps: 1000, evidenceCount: 6 },
      { id: "b", title: "B", kind: "hypothesis" as const, confidenceBps: 7000, ambiguityBps: 9000, evidenceCount: 1 },
    ];
    const assessments = new Map([["a", assessAmbiguity({ ambiguityBps: 1000, interpretationCount: 1, contradictionCount: 0, evidenceCount: 6, decisionSensitivity: "medium" })], ["b", assessAmbiguity({ ambiguityBps: 9000, interpretationCount: 3, contradictionCount: 1, evidenceCount: 1, decisionSensitivity: "high" })]]);
    const ranked = rankProcessCandidates(ideas, assessments);
    expect(ranked[0].idea.id).toBe("a");
  });
});
