import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbHub from "./db-hub";
import { runOrchestratorJob } from "./background-jobs";

vi.mock("./db-hub");

describe("background jobs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("skips a duplicate run key without touching mission data", async () => {
    vi.mocked(dbHub.claimOrchestratorJobRun).mockResolvedValue(null);
    const result = await runOrchestratorJob("reconcile_missions", new Date("2026-01-01T12:00:00Z"));

    expect(result.skipped).toBe(true);
    expect(dbHub.getMissions).not.toHaveBeenCalled();
  });

  it("moves overdue running missions to blocked and audits the change", async () => {
    vi.mocked(dbHub.claimOrchestratorJobRun).mockResolvedValue(77);
    vi.mocked(dbHub.getMissions).mockResolvedValue([{
      id: 9,
      startupId: 2,
      title: "Entrega vencida",
      description: "Critério de aceite",
      stage: "build",
      priority: "high",
      status: "running",
      owner: "Platform Pod",
      dueAt: new Date(Date.now() - 86_400_000),
      riskScore: 65,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
    vi.mocked(dbHub.updateMissionStatus).mockResolvedValue(undefined);
    vi.mocked(dbHub.createMissionEvent).mockResolvedValue(undefined);
    vi.mocked(dbHub.recordAuditLog).mockResolvedValue(undefined);
    vi.mocked(dbHub.finishOrchestratorJobRun).mockResolvedValue(undefined);

    const result = await runOrchestratorJob("reconcile_missions", new Date("2026-01-01T12:00:00Z"));

    expect(result).toMatchObject({ skipped: false, recordsProcessed: 1 });
    expect(dbHub.updateMissionStatus).toHaveBeenCalledWith(9, "blocked");
    expect(dbHub.createMissionEvent).toHaveBeenCalledWith(expect.objectContaining({
      missionId: 9,
      fromStatus: "running",
      toStatus: "blocked",
      actor: "system:reconcile_missions",
    }));
    expect(dbHub.finishOrchestratorJobRun).toHaveBeenCalledWith(77, { status: "completed", recordsProcessed: 1 });
  });

  it("persists a readiness snapshot for each startup during signal refresh", async () => {
    vi.mocked(dbHub.claimOrchestratorJobRun).mockResolvedValue(79);
    vi.mocked(dbHub.getMissions).mockResolvedValue([]);
    vi.mocked(dbHub.getStartups).mockResolvedValue([{
      id: 4,
      name: "Nexus SaaS",
      description: "B2B platform",
      ceoId: null,
      status: "scaling",
      isCore: false,
      traction: 82,
      revenue: 100000,
      reputation: 76,
      generation: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
    vi.mocked(dbHub.createStartupSignalSnapshot).mockResolvedValue(undefined);
    vi.mocked(dbHub.recordAuditLog).mockResolvedValue(undefined);
    vi.mocked(dbHub.finishOrchestratorJobRun).mockResolvedValue(undefined);

    const result = await runOrchestratorJob("refresh_portfolio_signals", new Date("2026-01-01T12:00:00Z"));

    expect(result.recordsProcessed).toBe(1);
    expect(dbHub.createStartupSignalSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      startupId: 4,
      signal: "scale",
    }));
  });

  it("records a portfolio signal refresh even when the portfolio is empty", async () => {
    vi.mocked(dbHub.claimOrchestratorJobRun).mockResolvedValue(78);
    vi.mocked(dbHub.getMissions).mockResolvedValue([]);
    vi.mocked(dbHub.getStartups).mockResolvedValue([]);
    vi.mocked(dbHub.recordAuditLog).mockResolvedValue(undefined);
    vi.mocked(dbHub.finishOrchestratorJobRun).mockResolvedValue(undefined);

    const result = await runOrchestratorJob("refresh_portfolio_signals", new Date("2026-01-01T12:00:00Z"));

    expect(result.recordsProcessed).toBe(0);
    expect(dbHub.recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "orchestrator.job.portfolio_signal_refresh",
      targetType: "portfolio",
    }));
  });
});
