export const missionStatuses = [
  "backlog",
  "ready",
  "running",
  "blocked",
  "review",
  "completed",
  "cancelled",
] as const;

export type MissionStatus = (typeof missionStatuses)[number];

export const missionStages = [
  "discovery",
  "validation",
  "build",
  "launch",
  "scale",
] as const;

export type MissionStage = (typeof missionStages)[number];

export const missionPriorities = ["critical", "high", "medium", "low"] as const;

export type MissionPriority = (typeof missionPriorities)[number];

const transitionMap: Record<MissionStatus, readonly MissionStatus[]> = {
  backlog: ["ready", "cancelled"],
  ready: ["running", "cancelled", "backlog"],
  running: ["blocked", "review", "cancelled"],
  blocked: ["ready", "cancelled"],
  review: ["completed", "running", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: MissionStatus, to: MissionStatus) {
  return transitionMap[from].includes(to);
}

export function assertTransition(from: MissionStatus, to: MissionStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Transição inválida: ${from} → ${to}`);
  }
  return to;
}

export function getAllowedTransitions(status: MissionStatus) {
  return [...transitionMap[status]];
}

export function calculateMissionRisk(input: {
  priority: MissionPriority;
  stage: MissionStage;
  dueAt?: Date | null;
}) {
  const priorityRisk: Record<MissionPriority, number> = {
    critical: 35,
    high: 25,
    medium: 15,
    low: 5,
  };
  const stageRisk: Record<MissionStage, number> = {
    discovery: 10,
    validation: 18,
    build: 24,
    launch: 30,
    scale: 20,
  };

  let risk = priorityRisk[input.priority] + stageRisk[input.stage];
  if (input.dueAt) {
    const daysUntilDue = Math.ceil((input.dueAt.getTime() - Date.now()) / 86_400_000);
    if (daysUntilDue <= 7) risk += 15;
    else if (daysUntilDue <= 30) risk += 5;
  }

  return Math.min(100, risk);
}

export function getMissionEventType(to: MissionStatus) {
  if (to === "running") return "mission_started" as const;
  if (to === "completed") return "mission_completed" as const;
  if (to === "blocked") return "mission_blocked" as const;
  if (to === "review") return "mission_submitted_for_review" as const;
  if (to === "cancelled") return "mission_cancelled" as const;
  return "mission_status_changed" as const;
}
