import { describe, expect, it } from "vitest";
import {
  assertTransition,
  calculateMissionRisk,
  canTransition,
  getAllowedTransitions,
  getMissionEventType,
  missionPriorities,
  missionStages,
  missionStatuses,
  transitionMap,
} from "./orchestrator-engine";

const day = 86_400_000;
const now = Date.UTC(2026, 0, 1, 12);

const expectedTransitions: Record<(typeof missionStatuses)[number], readonly (typeof missionStatuses)[number][]> = {
  backlog: ["ready", "cancelled"],
  ready: ["running", "cancelled", "backlog"],
  running: ["blocked", "review", "cancelled"],
  blocked: ["ready", "cancelled"],
  review: ["completed", "running", "cancelled"],
  completed: [],
  cancelled: [],
};

describe("orchestrator engine — state machine", () => {
  it("exposes the complete transition contract without drift", () => {
    for (const status of missionStatuses) {
      expect(transitionMap[status]).toEqual(expectedTransitions[status]);
      expect(getAllowedTransitions(status)).toEqual([...expectedTransitions[status]]);
    }
  });

  it("accepts every explicitly allowed transition", () => {
    for (const from of missionStatuses) {
      for (const to of expectedTransitions[from]) {
        expect(canTransition(from, to)).toBe(true);
        expect(assertTransition(from, to)).toBe(to);
      }
    }
  });

  it("rejects every missing edge, including self-transitions", () => {
    for (const from of missionStatuses) {
      for (const to of missionStatuses) {
        const shouldBeAllowed = expectedTransitions[from].includes(to);
        expect(canTransition(from, to)).toBe(shouldBeAllowed);
        if (!shouldBeAllowed) {
          expect(() => assertTransition(from, to)).toThrow(`Transição inválida: ${from} → ${to}`);
        }
      }
    }
  });

  it("keeps completed and cancelled states terminal", () => {
    expect(getAllowedTransitions("completed")).toEqual([]);
    expect(getAllowedTransitions("cancelled")).toEqual([]);
    expect(missionStatuses.every((status) => !canTransition("completed", status))).toBe(true);
    expect(missionStatuses.every((status) => !canTransition("cancelled", status))).toBe(true);
  });

  it("supports an explicit recovery path from blocked work", () => {
    expect(canTransition("running", "blocked")).toBe(true);
    expect(canTransition("blocked", "ready")).toBe(true);
    expect(canTransition("blocked", "running")).toBe(false);
  });
});

describe("orchestrator engine — risk scoring", () => {
  it("is reproducible for every priority and stage pair", () => {
    for (const priority of missionPriorities) {
      for (const stage of missionStages) {
        const first = calculateMissionRisk({ priority, stage, now });
        const second = calculateMissionRisk({ priority, stage, now });
        expect(first).toBe(second);
        expect(first).toBeGreaterThanOrEqual(0);
        expect(first).toBeLessThanOrEqual(100);
      }
    }
  });

  it("applies the urgent deadline premium at seven days or less", () => {
    const noDeadline = calculateMissionRisk({ priority: "medium", stage: "validation", now });
    const thirtyDays = calculateMissionRisk({ priority: "medium", stage: "validation", dueAt: new Date(now + 30 * day), now });
    const sevenDays = calculateMissionRisk({ priority: "medium", stage: "validation", dueAt: new Date(now + 7 * day), now });
    const overdue = calculateMissionRisk({ priority: "medium", stage: "validation", dueAt: new Date(now - day), now });

    expect(thirtyDays).toBe(noDeadline + 5);
    expect(sevenDays).toBe(noDeadline + 15);
    expect(overdue).toBe(noDeadline + 15);
  });

  it("caps compounded critical launch risk at 100", () => {
    const risk = calculateMissionRisk({ priority: "critical", stage: "launch", dueAt: new Date(now - day), now });
    expect(risk).toBe(80);
    expect(calculateMissionRisk({ priority: "critical", stage: "launch", dueAt: new Date(now - 100 * day), now })).toBeLessThanOrEqual(100);
  });
});

describe("orchestrator engine — audit semantics", () => {
  it("maps every destination status to a stable event type", () => {
    expect(getMissionEventType("backlog")).toBe("mission_status_changed");
    expect(getMissionEventType("ready")).toBe("mission_status_changed");
    expect(getMissionEventType("running")).toBe("mission_started");
    expect(getMissionEventType("blocked")).toBe("mission_blocked");
    expect(getMissionEventType("review")).toBe("mission_submitted_for_review");
    expect(getMissionEventType("completed")).toBe("mission_completed");
    expect(getMissionEventType("cancelled")).toBe("mission_cancelled");
  });
});
