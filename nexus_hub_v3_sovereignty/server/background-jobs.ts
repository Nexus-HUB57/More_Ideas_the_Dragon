import * as dbHub from "./db-hub";
import { canTransition, getMissionEventType, type MissionStatus } from "./orchestrator-engine";
import { calculateStartupSignal } from "./processing-core";

export const backgroundJobNames = ["reconcile_missions", "refresh_portfolio_signals"] as const;
export type BackgroundJobName = (typeof backgroundJobNames)[number];

const defaultIntervalMs = 5 * 60_000;
const jobBucketMs = 15 * 60_000;

function getRunKey(jobName: BackgroundJobName, now: Date) {
  const bucket = Math.floor(now.getTime() / jobBucketMs) * jobBucketMs;
  return `${jobName}:${new Date(bucket).toISOString()}`;
}

function isPastDue(dueAt: Date | string | null) {
  return Boolean(dueAt && new Date(dueAt).getTime() < Date.now());
}

async function reconcileMissions() {
  const missions = await dbHub.getMissions({ limit: 500 });
  let recordsProcessed = 0;
  for (const mission of missions) {
    if (!isPastDue(mission.dueAt) || mission.status !== "running") continue;
    const target: MissionStatus = "blocked";
    if (!canTransition(mission.status, target)) continue;
    await dbHub.updateMissionStatus(mission.id, target);
    await dbHub.createMissionEvent({
      missionId: mission.id,
      eventType: getMissionEventType(target),
      fromStatus: mission.status,
      toStatus: target,
      actor: "system:reconcile_missions",
      payload: JSON.stringify({ reason: "deadline_elapsed" }),
    });
    await dbHub.recordAuditLog({
      action: "orchestrator.job.reconciled_overdue_mission",
      actor: "system:reconcile_missions",
      targetType: "mission",
      targetId: mission.id,
      details: JSON.stringify({ from: mission.status, to: target, dueAt: mission.dueAt }),
    });
    recordsProcessed += 1;
  }
  return recordsProcessed;
}

async function refreshPortfolioSignals() {
  const [missions, startups] = await Promise.all([
    dbHub.getMissions({ limit: 500 }),
    dbHub.getStartups(),
  ]);
  let snapshotsCreated = 0;
  for (const startup of startups) {
    const signal = await calculateStartupSignal({
      id: startup.id,
      name: startup.name,
      revenue: startup.revenue,
      traction: startup.traction,
      reputation: startup.reputation,
      status: startup.status,
    });
    await dbHub.createStartupSignalSnapshot({
      startupId: signal.startupId,
      readinessScore: signal.readinessScore,
      signal: signal.signal,
      recommendedAction: signal.recommendedAction,
      evidence: JSON.stringify(signal.evidence),
    });
    snapshotsCreated += 1;
  }
  const averageRisk = missions.length
    ? Math.round(missions.reduce((sum, mission) => sum + mission.riskScore, 0) / missions.length)
    : 0;
  await dbHub.recordAuditLog({
    action: "orchestrator.job.portfolio_signal_refresh",
    actor: "system:refresh_portfolio_signals",
    targetType: "portfolio",
    details: JSON.stringify({ missionCount: missions.length, startupCount: startups.length, snapshotsCreated, averageRisk }),
  });
  return snapshotsCreated;
}

export async function runOrchestratorJob(jobName: BackgroundJobName, now = new Date()) {
  const runKey = getRunKey(jobName, now);
  const runId = await dbHub.claimOrchestratorJobRun({
    jobName,
    runKey,
    status: "running",
  });
  if (!runId) return { jobName, runKey, skipped: true, recordsProcessed: 0 };

  await dbHub.recordAuditLog({
    action: "orchestrator.job.started",
    actor: `system:${jobName}`,
    targetType: "job",
    targetId: runId,
    details: JSON.stringify({ jobName, runKey }),
  });

  try {
    const recordsProcessed = jobName === "reconcile_missions"
      ? await reconcileMissions()
      : await refreshPortfolioSignals();
    await dbHub.finishOrchestratorJobRun(runId, { status: "completed", recordsProcessed });
    await dbHub.recordAuditLog({
      action: "orchestrator.job.completed",
      actor: `system:${jobName}`,
      targetType: "job",
      targetId: runId,
      details: JSON.stringify({ jobName, runKey, recordsProcessed }),
    });
    return { jobName, runKey, skipped: false, recordsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await dbHub.finishOrchestratorJobRun(runId, { status: "failed", error: message });
    await dbHub.recordAuditLog({
      action: "orchestrator.job.failed",
      actor: `system:${jobName}`,
      targetType: "job",
      targetId: runId,
      details: JSON.stringify({ jobName, runKey, error: message }),
    });
    throw error;
  }
}

export function startBackgroundJobs(options: { enabled?: boolean; intervalMs?: number } = {}) {
  const enabled = options.enabled ?? process.env.NEXUS_ORCHESTRATOR_JOBS_ENABLED === "true";
  if (!enabled) return { enabled: false, stop: () => undefined };

  const intervalMs = Math.max(60_000, options.intervalMs ?? Number(process.env.NEXUS_ORCHESTRATOR_JOBS_INTERVAL_MS ?? defaultIntervalMs));
  let inFlight = false;

  const tick = async () => {
    if (inFlight) return;
    inFlight = true;
    try {
      for (const jobName of backgroundJobNames) {
        await runOrchestratorJob(jobName);
      }
    } catch (error) {
      console.error("[Nexus Jobs] execução falhou", error);
    } finally {
      inFlight = false;
    }
  };

  const timer = setInterval(() => void tick(), intervalMs);
  timer.unref?.();
  void tick();

  return { enabled: true, stop: () => clearInterval(timer) };
}
