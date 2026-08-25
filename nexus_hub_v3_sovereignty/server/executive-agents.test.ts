import { describe, expect, it } from "vitest";
import {
  assertExecutiveAction,
  calculateExecutiveScorecard,
  canDelegate,
  executiveAgents,
  getExecutiveAgent,
} from "./executive-agents";

describe("executive C-level layer", () => {
  it("keeps exactly five top-level nuclei and models CPO under CTO", () => {
    expect(new Set(executiveAgents.filter((agent) => agent.role !== "CPO").map((agent) => agent.nucleus)).size).toBe(5);
    expect(getExecutiveAgent("CPO")?.reportsTo).toBe("CTO");
    expect(getExecutiveAgent("CPO")?.nucleus).toBe("CTO");
  });

  it("allows CEO delegation and restricts peer delegation", () => {
    expect(canDelegate("CEO", "CFO")).toBe(true);
    expect(canDelegate("CTO", "CPO")).toBe(true);
    expect(canDelegate("CFO", "CTO")).toBe(false);
    expect(canDelegate("CRO", "CFO")).toBe(false);
  });

  it("calculates bounded scorecards deterministically", () => {
    const cto = getExecutiveAgent("CTO")!;
    const scorecard = calculateExecutiveScorecard(cto, { availability: 110, lead_time: 50, change_failure_rate: 0, security_findings: 80, cost_per_workflow: 60 });
    expect(scorecard.score).toBe(58);
    expect(scorecard.status).toBe("at_risk");
    expect(scorecard.metrics.availability).toBe(100);
    expect(scorecard.metrics.change_failure_rate).toBe(0);
  });

  it("rejects actions outside each agent mandate", () => {
    expect(assertExecutiveAction("CTO", "run_harness")).toBe(true);
    expect(() => assertExecutiveAction("CFO", "execute_transfer")).toThrow(/Ação restrita/);
    expect(() => assertExecutiveAction("CPO", "alter_architecture")).toThrow(/Ação restrita/);
  });
});
