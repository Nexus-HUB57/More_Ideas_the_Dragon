import { describe, it, expect, beforeEach, vi } from "vitest";
import { hubRouter } from "./routers-hub";
import * as dbHub from "./db-hub";

// Mock the db-hub module
vi.mock("./db-hub");

describe("hubRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("council", () => {
    it("should get council members", async () => {
      const mockMembers = [
        {
          id: 1,
          name: "AETERNO",
          role: "Patriarca",
          description: "Test",
          votingPower: 2,
          specialization: "Infrastructure",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(dbHub.getCouncilMembers).mockResolvedValue(mockMembers);

      const caller = hubRouter.createCaller({} as any);
      const result = await caller.council.getMembers();

      expect(result).toEqual(mockMembers);
      expect(dbHub.getCouncilMembers).toHaveBeenCalled();
    });

    it("should initialize council", async () => {
      const mockMembers = [
        {
          id: 1,
          name: "AETERNO",
          role: "Patriarca",
          description: "Test",
          votingPower: 2,
          specialization: "Infrastructure",
        },
      ];

      vi.mocked(dbHub.initializeCouncil).mockResolvedValue(mockMembers as any);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.council.initialize();

      expect(result).toEqual(mockMembers);
      expect(dbHub.initializeCouncil).toHaveBeenCalled();
    });
  });

  describe("startups", () => {
    it("should list startups", async () => {
      const mockStartups = [
        {
          id: 1,
          name: "NEXUS RWA",
          description: "Test",
          revenue: 1000000,
          traction: 100,
          reputation: 80,
          status: "launched",
          isCore: true,
          generation: 1,
          ceoId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(dbHub.getStartups).mockResolvedValue(mockStartups);

      const caller = hubRouter.createCaller({} as any);
      const result = await caller.startups.list();

      expect(result).toEqual(mockStartups);
      expect(dbHub.getStartups).toHaveBeenCalled();
    });

    it("should create a startup", async () => {
      vi.mocked(dbHub.createStartup).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.startups.create({
        name: "Test Startup",
        description: "Test Description",
        isCore: false,
      });

      expect(result).toEqual({ success: true });
      expect(dbHub.createStartup).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Startup",
          description: "Test Description",
          isCore: false,
          status: "planning",
        })
      );
    });

    it("should update a startup", async () => {
      vi.mocked(dbHub.updateStartup).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.startups.update({
        id: 1,
        revenue: 2000000,
        traction: 150,
        reputation: 90,
      });

      expect(result).toEqual({ success: true });
      expect(dbHub.updateStartup).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe("finance", () => {
    it("should get master vault", async () => {
      const mockVault = {
        id: 1,
        totalBalance: 1000000,
        btcReserve: 1000,
        liquidityFund: 300000,
        infrastructureFund: 100000,
        lastUpdated: new Date(),
      };

      vi.mocked(dbHub.getMasterVault).mockResolvedValue(mockVault);

      const caller = hubRouter.createCaller({} as any);
      const result = await caller.finance.getMasterVault();

      expect(result).toEqual(mockVault);
      expect(dbHub.getMasterVault).toHaveBeenCalled();
    });

    it("should initialize vault", async () => {
      vi.mocked(dbHub.initializeMasterVault).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.finance.initializeVault();

      expect(result).toEqual({ success: true });
      expect(dbHub.initializeMasterVault).toHaveBeenCalled();
    });

    it("should record a transaction", async () => {
      vi.mocked(dbHub.recordTransaction).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.finance.recordTransaction({
        amount: 500000,
        type: "investment",
        description: "Test investment",
      });

      expect(result).toEqual({ success: true });
      expect(dbHub.recordTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500000,
          type: "investment",
          status: "pending",
        })
      );
    });
  });

  describe("governance", () => {
    it("should get open proposals", async () => {
      const mockProposals = [
        {
          id: 1,
          title: "Test Proposal",
          description: "Test",
          type: "investment",
          status: "open",
          targetStartupId: null,
          votesYes: 0,
          votesNo: 0,
          votesAbstain: 0,
          totalWeight: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(dbHub.getOpenProposals).mockResolvedValue(mockProposals);

      const caller = hubRouter.createCaller({} as any);
      const result = await caller.governance.getOpenProposals();

      expect(result).toEqual(mockProposals);
      expect(dbHub.getOpenProposals).toHaveBeenCalled();
    });

    it("should create a proposal", async () => {
      vi.mocked(dbHub.createProposal).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.governance.createProposal({
        title: "Test Proposal",
        description: "Test Description",
        type: "investment",
      });

      expect(result).toEqual({ success: true });
      expect(dbHub.createProposal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Proposal",
          type: "investment",
          status: "open",
        })
      );
    });

    it("should record a vote", async () => {
      vi.mocked(dbHub.recordVote).mockResolvedValue(undefined);
      vi.mocked(dbHub.getProposalVotes).mockResolvedValue([
        {
          id: 1,
          proposalId: 1,
          memberId: 1,
          vote: "yes",
          weight: 2,
          reasoning: "Test",
          createdAt: new Date(),
        },
      ]);
      vi.mocked(dbHub.updateProposal).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.governance.recordVote({
        proposalId: 1,
        memberId: 1,
        vote: "yes",
        weight: 2,
      });

      expect(result).toEqual({ success: true });
      expect(dbHub.recordVote).toHaveBeenCalled();
      expect(dbHub.updateProposal).toHaveBeenCalled();
    });
  });

  describe("performance", () => {
    it("should record performance metrics", async () => {
      vi.mocked(dbHub.recordPerformanceMetrics).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.performance.recordMetrics({
        startupId: 1,
        revenue: 1000000,
        userGrowth: 50,
        productQuality: 80,
        marketFit: 70,
      });

      expect(result).toEqual({ success: true });
      expect(dbHub.recordPerformanceMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          startupId: 1,
          revenue: 1000000,
        })
      );
    });
  });

  describe("audit", () => {
    it("should get audit logs", async () => {
      const mockLogs = [
        {
          id: 1,
          action: "create_startup",
          actor: "admin",
          targetType: "startup",
          targetId: 1,
          details: "Test",
          s3Key: null,
          createdAt: new Date(),
        },
      ];

      vi.mocked(dbHub.getAuditLogs).mockResolvedValue(mockLogs);

      const caller = hubRouter.createCaller({} as any);
      const result = await caller.audit.getLogs({ limit: 100 });

      expect(result).toEqual(mockLogs);
      expect(dbHub.getAuditLogs).toHaveBeenCalledWith(100);
    });

    it("should record an audit log", async () => {
      vi.mocked(dbHub.recordAuditLog).mockResolvedValue(undefined);

      const caller = hubRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);
      const result = await caller.audit.recordLog({
        action: "create_startup",
        actor: "admin",
        targetType: "startup",
        targetId: 1,
      });

      expect(result).toEqual({ success: true });
      expect(dbHub.recordAuditLog).toHaveBeenCalled();
    });
  });
});


describe("hubRouter.orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a backlog mission and records its audit trail", async () => {
    vi.mocked(dbHub.createMission).mockResolvedValue(44);
    vi.mocked(dbHub.createMissionEvent).mockResolvedValue(undefined);
    vi.mocked(dbHub.recordAuditLog).mockResolvedValue(undefined);

    const caller = hubRouter.createCaller({ user: { id: 1, name: "Ana Operadora", role: "admin" } } as any);
    const result = await caller.orchestrator.createMission({
      startupId: 7,
      title: "Validar canal B2B",
      description: "Executar entrevistas com compradores",
      stage: "validation",
      priority: "high",
      owner: "Growth Pod",
    });

    expect(result.success).toBe(true);
    expect(result.missionId).toBe(44);
    expect(result.riskScore).toBeGreaterThan(0);
    expect(dbHub.createMission).toHaveBeenCalledWith(expect.objectContaining({
      startupId: 7,
      title: "Validar canal B2B",
      status: "backlog",
      owner: "Growth Pod",
    }));
    expect(dbHub.createMissionEvent).toHaveBeenCalledWith(expect.objectContaining({
      missionId: 44,
      eventType: "mission_created",
      toStatus: "backlog",
      actor: "Ana Operadora",
    }));
  });

  it("transitions a mission and emits an audit event", async () => {
    vi.mocked(dbHub.getMissionById).mockResolvedValue({
      id: 12,
      startupId: 7,
      title: "Construir protótipo",
      description: null,
      stage: "build",
      priority: "medium",
      status: "ready",
      owner: "Build Pod",
      dueAt: null,
      riskScore: 39,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(dbHub.updateMissionStatus).mockResolvedValue(undefined);
    vi.mocked(dbHub.createMissionEvent).mockResolvedValue(undefined);
    vi.mocked(dbHub.recordAuditLog).mockResolvedValue(undefined);

    const caller = hubRouter.createCaller({ user: { id: 1, name: "Ana Operadora", role: "admin" } } as any);
    const result = await caller.orchestrator.transition({ missionId: 12, toStatus: "running", note: "Capacidade alocada" });

    expect(result).toEqual({ success: true, fromStatus: "ready", toStatus: "running" });
    expect(dbHub.updateMissionStatus).toHaveBeenCalledWith(12, "running");
    expect(dbHub.createMissionEvent).toHaveBeenCalledWith(expect.objectContaining({
      missionId: 12,
      eventType: "mission_started",
      fromStatus: "ready",
      toStatus: "running",
    }));
  });
});


describe("hubRouter.orchestrator guardrails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks completion when the Harness has hard failures", async () => {
    vi.mocked(dbHub.getMissionById).mockResolvedValue({
      id: 21,
      startupId: 7,
      title: "Release sem DoD",
      description: null,
      stage: "launch",
      priority: "high",
      status: "review",
      owner: "Release Pod",
      dueAt: null,
      riskScore: 61,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const caller = hubRouter.createCaller({ user: { id: 1, name: "Ana Operadora", role: "admin" } } as any);
    await expect(caller.orchestrator.transition({ missionId: 21, toStatus: "completed" })).rejects.toThrow("Harness reprovado");
    expect(dbHub.updateMissionStatus).not.toHaveBeenCalled();
  });

  it("rejects an unallowlisted webhook before claiming a dispatch", async () => {
    process.env.NEXUS_WEBHOOK_ALLOWLIST = "hooks.example.com";
    const caller = hubRouter.createCaller({ user: { id: 1, name: "Ana Operadora", role: "admin" } } as any);

    await expect(caller.orchestrator.dispatchWebhook({
      target: "https://127.0.0.1/events",
      idempotencyKey: "mission-21-run-1",
      payload: { event: "mission.completed" },
    })).rejects.toThrow("local ou privado");
    expect(dbHub.claimAdapterDispatch).not.toHaveBeenCalled();
    delete process.env.NEXUS_WEBHOOK_ALLOWLIST;
  });
});
