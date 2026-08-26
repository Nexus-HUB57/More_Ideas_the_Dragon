import { describe, expect, it } from "vitest";
import { addRoute, framePropulsiveWorkflow, recordBreakthrough, selectRoute } from "./propulsive-workflow-engine";

describe("Propulsive workflow engine", () => {
  const route = (id: string, noveltyBps: number, evidenceBps: number) => ({ id, name: id, noveltyBps, evidenceBps, riskBps: 1_000, costUnits: 2, reversible: true, firstProof: `proof-${id}` });

  it("requires three concurrent routes", () => {
    const workflow = addRoute(framePropulsiveWorkflow({ id: "w-1", ambition: "build frontier", tension: "unknown" }), route("a", 9000, 5000));
    expect(() => selectRoute(workflow)).toThrow("três rotas");
  });

  it("selects a route using novelty, evidence and reversibility", () => {
    let workflow = framePropulsiveWorkflow({ id: "w-1", ambition: "build frontier", tension: "unknown" });
    workflow = addRoute(workflow, route("incremental", 4000, 9000));
    workflow = addRoute(workflow, route("inversion", 9500, 7000));
    workflow = addRoute(workflow, route("composition", 8000, 8000));
    const selected = selectRoute(workflow);
    expect(selected.state).toBe("proving");
    expect(selected.selectedRoute).toBe("inversion");
  });

  it("records only evidenced breakthroughs", () => {
    let workflow = framePropulsiveWorkflow({ id: "w-1", ambition: "build frontier", tension: "unknown" });
    for (const item of [route("a", 1, 1), route("b", 2, 2), route("c", 3, 3)]) workflow = addRoute(workflow, item);
    workflow = selectRoute(workflow);
    expect(recordBreakthrough(workflow, { capability: "new", previousLimit: "old", newCapability: "new", evidenceRefs: ["e-1"], transferable: true, conditions: ["sandbox"], failureModes: [] }).state).toBe("breakthrough");
    expect(() => recordBreakthrough(workflow, { capability: "new", previousLimit: "old", newCapability: "new", evidenceRefs: [], transferable: false, conditions: [], failureModes: [] })).toThrow();
  });
});
