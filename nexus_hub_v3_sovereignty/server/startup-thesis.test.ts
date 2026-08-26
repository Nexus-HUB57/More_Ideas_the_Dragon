import { describe, expect, it } from "vitest";
import { nexusAegisMissions, nexusAegisThesis } from "./startup-thesis";

describe("Nexus Aegis thesis", () => {
  it("defines a focused AI operations and compliance wedge", () => {
    expect(nexusAegisThesis.name).toBe("Nexus Aegis");
    expect(nexusAegisThesis.icp).toMatch(/B2B SaaS/);
    expect(nexusAegisThesis.expansionPath).toHaveLength(4);
  });

  it("invokes every executive profile in the first validation sprint", () => {
    expect(nexusAegisMissions).toHaveLength(7);
    expect(new Set(nexusAegisMissions.map((mission) => mission.executiveRole))).toEqual(new Set(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]));
    expect(nexusAegisMissions.every((mission) => mission.externalSideEffect === false)).toBe(true);
    expect(new Set(nexusAegisMissions.map((mission) => mission.skillKey)).size).toBe(nexusAegisMissions.length);
  });
});
