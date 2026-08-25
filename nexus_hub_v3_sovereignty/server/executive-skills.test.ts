import { describe, expect, it } from "vitest";
import { executiveSkills, getSkillsByRole, validateSkillCatalog } from "./executive-skills";

describe("executive skill organism", () => {
  const roles = ["CEO", "CTO", "CPO", "COO", "CFO", "CRO"] as const;

  it("provides at least fifteen skills for every executive profile", () => {
    expect(validateSkillCatalog()).toBe(true);
    for (const role of roles) expect(getSkillsByRole(role)).toHaveLength(15);
    expect(executiveSkills).toHaveLength(90);
  });

  it("keeps skill keys unique and all skills tied to an artifact", () => {
    expect(new Set(executiveSkills.map((skill) => skill.id)).size).toBe(executiveSkills.length);
    expect(executiveSkills.every((skill) => skill.artifact.length > 0)).toBe(true);
    expect(executiveSkills.every((skill) => skill.kpis.length > 0)).toBe(true);
  });

  it("does not allow high-risk skills to bypass guarded execution", () => {
    const highRiskSkills = executiveSkills.filter((skill) => skill.risk === "high");
    expect(highRiskSkills.length).toBeGreaterThan(0);
    expect(highRiskSkills.every((skill) => skill.autonomy !== "execute_reversible")).toBe(true);
  });
});
