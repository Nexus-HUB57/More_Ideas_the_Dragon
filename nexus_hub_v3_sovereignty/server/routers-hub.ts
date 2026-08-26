/**
 * NEXUS-HUB tRPC Routers
 * Endpoints para governança, startups, finanças e análise de mercado
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as dbHub from "./db-hub";
import { AdapterError, createDefaultAdapterRegistry, validateWebhookTarget } from "./adapters";
import { backgroundJobNames, runOrchestratorJob } from "./background-jobs";
import { evaluateGuardedHarness, evaluateMissionHarness } from "./harness-engine";
import {
  executiveAgents as executiveDefinitions,
  calculateExecutiveScorecard,
  getExecutiveAgent,
  canDelegate,
  assertExecutiveAction,
} from "./executive-agents";
import { getSkillsByRole, executiveSkills, validateSkillCatalog } from "./executive-skills";
import {
  assertTransition,
  calculateMissionRisk,
  getMissionEventType,
  missionPriorities,
  missionStages,
  missionStatuses,
} from "./orchestrator-engine";

export const hubRouter = router({
  // ============================================
  // CONSELHO DOS ARQUITETOS
  // ============================================
  council: router({
    getMembers: publicProcedure.query(async () => {
      return dbHub.getCouncilMembers();
    }),

    initialize: protectedProcedure.mutation(async () => {
      return dbHub.initializeCouncil();
    }),
  }),

  // ============================================
  // STARTUPS
  // ============================================
  startups: router({
    list: publicProcedure.query(async () => {
      return dbHub.getStartups();
    }),

    getCore: publicProcedure.query(async () => {
      return dbHub.getCoreStartup();
    }),

    getChallengers: publicProcedure.query(async () => {
      return dbHub.getChallengerStartups();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return dbHub.getStartupById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          isCore: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.createStartup({
          name: input.name,
          description: input.description,
          isCore: input.isCore,
          status: "planning",
          traction: 0,
          revenue: 0,
          reputation: 0,
          generation: 1,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          revenue: z.number().optional(),
          traction: z.number().optional(),
          reputation: z.number().optional(),
          status: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.updateStartup(input.id, {
          revenue: input.revenue,
          traction: input.traction,
          reputation: input.reputation,
          status: input.status as any,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // AGENTES IA
  // ============================================
  agents: router({
    getByStartup: publicProcedure
      .input(z.object({ startupId: z.number() }))
      .query(async ({ input }) => {
        return dbHub.getAgentsByStartup(input.startupId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return dbHub.getAgentById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          specialization: z.string(),
          role: z.enum(["cto", "cmo", "cfo", "cdo", "ceo", "legal", "redteam"]),
          startupId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.createAiAgent({
          name: input.name,
          specialization: input.specialization,
          role: input.role,
          startupId: input.startupId,
          reputation: 0,
          health: 100,
          energy: 100,
          creativity: 100,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // AGENTES EXECUTIVOS C-LEVEL
  // ============================================
  executives: router({
    orgChart: publicProcedure.query(async () => ({
      nuclei: executiveDefinitions,
      persisted: await dbHub.getExecutiveAgents(),
    })),

    getByRole: publicProcedure
      .input(z.object({ role: z.enum(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]) }))
      .query(async ({ input }) => ({
        definition: getExecutiveAgent(input.role),
        persisted: await dbHub.getExecutiveAgentByRole(input.role),
      })),

    initialize: protectedProcedure.mutation(async () => {
      await dbHub.initializeExecutiveAgents(executiveDefinitions.map((agent) => ({
        role: agent.role,
        nucleus: agent.nucleus,
        name: agent.name,
        mandate: agent.mandate,
        reportsTo: agent.reportsTo,
        authorityTier: agent.authorityTier,
        autonomyMode: agent.autonomy,
        maxBudgetBps: agent.maxBudgetBps,
        status: "active" as const,
      })));
      return { success: true, count: executiveDefinitions.length };
    }),

    canDelegate: publicProcedure
      .input(z.object({ from: z.enum(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]), to: z.enum(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]) }))
      .query(({ input }) => ({ allowed: canDelegate(input.from, input.to) })),

    scorecard: publicProcedure
      .input(z.object({ role: z.enum(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]), metrics: z.record(z.string(), z.number().min(0).max(100)) }))
      .query(({ input }) => {
        const definition = getExecutiveAgent(input.role);
        if (!definition) throw new Error("Agente executivo não encontrado");
        return calculateExecutiveScorecard(definition, input.metrics);
      }),

    authorizeAction: protectedProcedure
      .input(z.object({ role: z.enum(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]), action: z.string() }))
      .query(({ input }) => ({ allowed: assertExecutiveAction(input.role, input.action) })),

    skills: publicProcedure
      .input(z.object({ role: z.enum(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]).optional() }).optional())
      .query(async ({ input }) => ({
        catalog: input?.role ? getSkillsByRole(input.role) : executiveSkills,
        persisted: await dbHub.getExecutiveSkills(input?.role),
      })),

    catalogHealth: publicProcedure.query(() => ({
      valid: validateSkillCatalog(),
      totalSkills: executiveSkills.length,
      skillsPerRole: Object.fromEntries(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"].map((role) => [role, getSkillsByRole(role as any).length])),
    })),

    seedSkills: protectedProcedure.mutation(async () => {
      await dbHub.initializeExecutiveSkills(executiveSkills.map((skill) => ({
        skillKey: skill.id,
        role: skill.role,
        name: skill.name,
        description: skill.description,
        artifact: skill.artifact,
        risk: skill.risk,
        autonomy: skill.autonomy,
        kpis: JSON.stringify(skill.kpis),
      })));
      return { success: true, count: executiveSkills.length };
    }),
  }),

  // ============================================
  // PROPOSTAS E VOTAÇÕES
  // ============================================
  governance: router({
    getOpenProposals: publicProcedure.query(async () => {
      return dbHub.getOpenProposals();
    }),

    getAllProposals: publicProcedure.query(async () => {
      return dbHub.getAllProposals();
    }),

    getProposalById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return dbHub.getProposalById(input.id);
      }),

    createProposal: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          type: z.enum(["investment", "succession", "policy", "emergency", "innovation"]),
          targetStartupId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.createProposal({
          title: input.title,
          description: input.description,
          type: input.type,
          targetStartupId: input.targetStartupId,
          status: "open",
          votesYes: 0,
          votesNo: 0,
          votesAbstain: 0,
          totalWeight: 0,
        });
        return { success: true };
      }),

    recordVote: protectedProcedure
      .input(
        z.object({
          proposalId: z.number(),
          memberId: z.number(),
          vote: z.enum(["yes", "no", "abstain"]),
          weight: z.number().default(1),
          reasoning: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.recordVote({
          proposalId: input.proposalId,
          memberId: input.memberId,
          vote: input.vote,
          weight: input.weight,
          reasoning: input.reasoning,
        });

        // Update proposal vote counts
        const votes = await dbHub.getProposalVotes(input.proposalId);
        const votesYes = votes.filter(v => v.vote === "yes").reduce((sum, v) => sum + v.weight, 0);
        const votesNo = votes.filter(v => v.vote === "no").reduce((sum, v) => sum + v.weight, 0);
        const votesAbstain = votes.filter(v => v.vote === "abstain").reduce((sum, v) => sum + v.weight, 0);
        const totalWeight = votesYes + votesNo + votesAbstain;

        await dbHub.updateProposal(input.proposalId, {
          votesYes,
          votesNo,
          votesAbstain,
          totalWeight,
        });

        return { success: true };
      }),

    getProposalVotes: publicProcedure
      .input(z.object({ proposalId: z.number() }))
      .query(async ({ input }) => {
        return dbHub.getProposalVotes(input.proposalId);
      }),
  }),

  // ============================================
  // FINANÇAS
  // ============================================
  finance: router({
    getMasterVault: publicProcedure.query(async () => {
      return dbHub.getMasterVault();
    }),

    initializeVault: protectedProcedure.mutation(async () => {
      await dbHub.initializeMasterVault();
      return { success: true };
    }),

    getTransactions: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return dbHub.getTransactions(input.limit);
      }),

    recordTransaction: protectedProcedure
      .input(
        z.object({
          fromId: z.number().optional(),
          toId: z.number().optional(),
          amount: z.number(),
          type: z.enum(["transfer", "investment", "revenue", "arbitrage", "distribution"]),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.recordTransaction({
          fromId: input.fromId,
          toId: input.toId,
          amount: input.amount,
          type: input.type,
          status: "pending",
          description: input.description,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // MARKET ORACLE
  // ============================================
  market: router({
    getLatestData: publicProcedure
      .input(z.object({ asset: z.string() }))
      .query(async ({ input }) => {
        return dbHub.getLatestMarketData(input.asset);
      }),

    recordData: protectedProcedure
      .input(
        z.object({
          asset: z.string(),
          price: z.string(),
          priceChange24h: z.string().optional(),
          sentiment: z.string().optional(),
          volume24h: z.string().optional(),
          source: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.recordMarketData({
          asset: input.asset,
          price: input.price,
          priceChange24h: input.priceChange24h,
          sentiment: input.sentiment,
          volume24h: input.volume24h,
          source: input.source,
        });
        return { success: true };
      }),

    getInsights: publicProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return dbHub.getMarketInsights(input.limit);
      }),

    recordInsight: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string().optional(),
          sentiment: z.enum(["bullish", "bearish", "neutral"]),
          confidence: z.number(),
          relatedAssets: z.string().optional(),
          source: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.recordMarketInsight({
          title: input.title,
          content: input.content,
          sentiment: input.sentiment,
          confidence: input.confidence,
          relatedAssets: input.relatedAssets,
          source: input.source,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // ARBITRAGEM
  // ============================================
  arbitrage: router({
    getOpenOpportunities: publicProcedure.query(async () => {
      return dbHub.getOpenArbitrageOpportunities();
    }),

    recordOpportunity: protectedProcedure
      .input(
        z.object({
          asset: z.string(),
          exchangeFrom: z.string(),
          exchangeTo: z.string(),
          priceDifference: z.string(),
          profitPotential: z.string(),
          confidence: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.recordArbitrageOpportunity({
          asset: input.asset,
          exchangeFrom: input.exchangeFrom,
          exchangeTo: input.exchangeTo,
          priceDifference: input.priceDifference,
          profitPotential: input.profitPotential,
          confidence: input.confidence,
          status: "identified",
        });
        return { success: true };
      }),
  }),

  // ============================================
  // PERFORMANCE E RANKING
  // ============================================
  performance: router({
    getStartupRanking: publicProcedure.query(async () => {
      return dbHub.getStartupRanking();
    }),

    recordMetrics: protectedProcedure
      .input(
        z.object({
          startupId: z.number(),
          revenue: z.number(),
          userGrowth: z.number(),
          productQuality: z.number(),
          marketFit: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const overallScore = Math.round(
          (input.revenue * 0.3 +
            input.userGrowth * 0.25 +
            input.productQuality * 0.25 +
            input.marketFit * 0.2) /
            100
        );

        await dbHub.recordPerformanceMetrics({
          startupId: input.startupId,
          revenue: input.revenue,
          userGrowth: input.userGrowth,
          productQuality: input.productQuality,
          marketFit: input.marketFit,
          overallScore,
          rank: 0,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // SOUL VAULT
  // ============================================
  soulVault: router({
    getEntries: publicProcedure
      .input(z.object({ type: z.string().optional() }))
      .query(async ({ input }) => {
        return dbHub.getSoulVaultEntries(input.type);
      }),

    recordEntry: protectedProcedure
      .input(
        z.object({
          type: z.enum(["decision", "precedent", "lesson", "insight"]),
          title: z.string(),
          content: z.string().optional(),
          relatedProposalId: z.number().optional(),
          impact: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.recordSoulVaultEntry({
          type: input.type,
          title: input.title,
          content: input.content,
          relatedProposalId: input.relatedProposalId,
          impact: input.impact,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // MOLTBOOK
  // ============================================
  moltbook: router({
    getFeed: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return dbHub.getMoltbookFeed(input.limit);
      }),

    getByStartup: publicProcedure
      .input(z.object({ startupId: z.number(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return dbHub.getMoltbookPostsByStartup(input.startupId, input.limit);
      }),

    createPost: protectedProcedure
      .input(
        z.object({
          startupId: z.number(),
          agentId: z.number().optional(),
          content: z.string(),
          type: z.enum(["update", "achievement", "milestone", "announcement"]),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.createMoltbookPost({
          startupId: input.startupId,
          agentId: input.agentId,
          content: input.content,
          type: input.type,
          likes: 0,
          comments: 0,
        });
        return { success: true };
      }),
  }),

  // ============================================
  // ORQUESTRADOR DE STARTUPS
  // ============================================
  orchestrator: router({
    overview: publicProcedure.query(async () => {
      const missions = await dbHub.getMissions({ limit: 500 });
      const byStatus = missionStatuses.reduce<Record<string, number>>((acc, status) => {
        acc[status] = missions.filter((mission) => mission.status === status).length;
        return acc;
      }, {});
      const active = missions.filter((mission) => ["ready", "running", "blocked", "review"].includes(mission.status)).length;
      const averageRisk = missions.length
        ? Math.round(missions.reduce((sum, mission) => sum + mission.riskScore, 0) / missions.length)
        : 0;
      return {
        total: missions.length,
        active,
        averageRisk,
        byStatus,
        availableStatuses: missionStatuses,
        availableStages: missionStages,
        availablePriorities: missionPriorities,
      };
    }),

    listMissions: publicProcedure
      .input(z.object({ startupId: z.number().optional(), status: z.enum(missionStatuses).optional(), limit: z.number().min(1).max(500).default(100) }).optional())
      .query(async ({ input }) => dbHub.getMissions(input)),

    events: publicProcedure
      .input(z.object({ missionId: z.number().optional(), limit: z.number().min(1).max(200).default(100) }).optional())
      .query(async ({ input }) => dbHub.getMissionEvents(input?.limit ?? 100, input?.missionId)),

    createMission: protectedProcedure
      .input(z.object({
        startupId: z.number().int().positive(),
        title: z.string().trim().min(3).max(255),
        description: z.string().trim().max(5000).optional(),
        stage: z.enum(missionStages),
        priority: z.enum(missionPriorities).default("medium"),
        owner: z.string().trim().min(2).max(128),
        dueAt: z.coerce.date().optional(),
        executiveRole: z.enum(["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]).optional(),
        skillKey: z.string().trim().max(96).optional(),
        evidenceRef: z.string().trim().max(512).optional(),
        approvalRef: z.string().trim().max(255).optional(),
        rollbackPlan: z.string().trim().max(5000).optional(),
        idempotencyKey: z.string().trim().max(255).optional(),
        securityReviewRef: z.string().trim().max(255).optional(),
        auditRef: z.string().trim().max(255).optional(),
        externalSideEffect: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const actor = ctx.user?.name ?? input.owner;
        const riskScore = calculateMissionRisk(input);
        const missionId = await dbHub.createMission({
          startupId: input.startupId,
          title: input.title,
          description: input.description,
          stage: input.stage,
          priority: input.priority,
          status: "backlog",
          owner: input.owner,
          dueAt: input.dueAt,
          riskScore,
          executiveRole: input.executiveRole,
          skillKey: input.skillKey,
          evidenceRef: input.evidenceRef,
          approvalRef: input.approvalRef,
          rollbackPlan: input.rollbackPlan,
          idempotencyKey: input.idempotencyKey,
          securityReviewRef: input.securityReviewRef,
          auditRef: input.auditRef,
          externalSideEffect: input.externalSideEffect,
        });
        await dbHub.createMissionEvent({
          missionId,
          eventType: "mission_created",
          toStatus: "backlog",
          actor,
          payload: JSON.stringify({ stage: input.stage, priority: input.priority, riskScore }),
        });
        await dbHub.recordAuditLog({
          action: "orchestrator.mission.created",
          actor,
          targetType: "mission",
          targetId: missionId,
          details: JSON.stringify({ title: input.title, startupId: input.startupId }),
        });
        return { success: true, missionId, riskScore };
      }),

    transition: protectedProcedure
      .input(z.object({ missionId: z.number().int().positive(), toStatus: z.enum(missionStatuses), note: z.string().trim().max(2000).optional() }))
      .mutation(async ({ input, ctx }) => {
        const mission = await dbHub.getMissionById(input.missionId);
        if (!mission) throw new Error("Missão não encontrada");
        assertTransition(mission.status, input.toStatus);
        if (input.toStatus === "completed") {
          const skill = mission.skillKey ? await dbHub.getExecutiveSkillByKey(mission.skillKey) : null;
          const harness = evaluateGuardedHarness({
            ...mission,
            skillAutonomy: skill?.autonomy,
            skillRisk: skill?.risk,
            executiveRole: mission.executiveRole as any,
            evidenceRef: mission.evidenceRef,
            approvalRef: mission.approvalRef,
            rollbackPlan: mission.rollbackPlan,
            idempotencyKey: mission.idempotencyKey,
            securityReviewRef: mission.securityReviewRef,
            auditRef: mission.auditRef,
            externalSideEffect: mission.externalSideEffect,
          });
          if (!harness.passed) {
            const failures = harness.checks.filter((check) => check.status === "failed").map((check) => check.label).join(", ");
            await dbHub.recordAuditLog({ action: "orchestrator.harness.rejected", actor: ctx.user?.name ?? "operator", targetType: "mission", targetId: input.missionId, details: JSON.stringify({ failures, score: harness.score }) });
            throw new Error(`Harness reprovado: ${failures}`);
          }
        }
        const actor = ctx.user?.name ?? "operator";
        await dbHub.updateMissionStatus(input.missionId, input.toStatus);
        await dbHub.createMissionEvent({
          missionId: input.missionId,
          eventType: getMissionEventType(input.toStatus),
          fromStatus: mission.status,
          toStatus: input.toStatus,
          actor,
          payload: input.note ? JSON.stringify({ note: input.note }) : undefined,
        });
        await dbHub.recordAuditLog({
          action: "orchestrator.mission.transitioned",
          actor,
          targetType: "mission",
          targetId: input.missionId,
          details: JSON.stringify({ from: mission.status, to: input.toStatus, note: input.note }),
        });
        return { success: true, fromStatus: mission.status, toStatus: input.toStatus };
      }),

    harness: publicProcedure
      .input(z.object({ missionId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const mission = await dbHub.getMissionById(input.missionId);
        if (!mission) throw new Error("Missão não encontrada");
        return evaluateMissionHarness(mission);
      }),

    dispatchWebhook: protectedProcedure
      .input(z.object({
        target: z.string().url(),
        idempotencyKey: z.string().trim().min(8).max(255),
        payload: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ input, ctx }) => {
        const target = validateWebhookTarget(input.target);
        const requestId = randomUUID();
        const dispatchId = await dbHub.claimAdapterDispatch({
          adapter: "json_webhook",
          idempotencyKey: input.idempotencyKey,
          requestId,
          targetHost: target.hostname,
          status: "requested",
        });
        if (!dispatchId) return { accepted: false, deduplicated: true, requestId };

        const adapter = createDefaultAdapterRegistry().get("json_webhook");
        try {
          const result = await adapter.execute({ target: input.target, payload: input.payload }, { requestId, idempotencyKey: input.idempotencyKey });
          await dbHub.finishAdapterDispatch(dispatchId, { status: "accepted", responseCode: result.statusCode, responseBody: result.responseBody });
          await dbHub.recordAuditLog({
            action: "orchestrator.adapter.webhook.accepted",
            actor: ctx.user?.name ?? "operator",
            targetType: "adapter_dispatch",
            targetId: dispatchId,
            details: JSON.stringify({ adapter: "json_webhook", targetHost: target.hostname, requestId }),
          });
          return { accepted: true, deduplicated: false, requestId, statusCode: result.statusCode };
        } catch (error) {
          const message = error instanceof AdapterError ? error.message : "Falha no adaptador";
          await dbHub.finishAdapterDispatch(dispatchId, { status: "failed", error: message });
          await dbHub.recordAuditLog({
            action: "orchestrator.adapter.webhook.failed",
            actor: ctx.user?.name ?? "operator",
            targetType: "adapter_dispatch",
            targetId: dispatchId,
            details: JSON.stringify({ adapter: "json_webhook", targetHost: target.hostname, requestId, error: message }),
          });
          throw new Error(message);
        }
      }),

    adapters: publicProcedure.query(async () => dbHub.getAdapterDispatches(50)),

    signals: publicProcedure
      .input(z.object({ startupId: z.number().int().positive().optional(), limit: z.number().min(1).max(200).default(100) }).optional())
      .query(async ({ input }) => dbHub.getStartupSignalSnapshots(input?.limit ?? 100, input?.startupId)),

    jobs: publicProcedure.query(async () => dbHub.getOrchestratorJobRuns(50)),

    runJob: protectedProcedure
      .input(z.object({ jobName: z.enum(backgroundJobNames) }))
      .mutation(async ({ input }) => runOrchestratorJob(input.jobName)),
  }),

  // ============================================
  // AUDITORIA
  // ============================================
  audit: router({
    getLogs: publicProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return dbHub.getAuditLogs(input.limit);
      }),

    recordLog: protectedProcedure
      .input(
        z.object({
          action: z.string(),
          actor: z.string().optional(),
          targetType: z.string().optional(),
          targetId: z.number().optional(),
          details: z.string().optional(),
          s3Key: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dbHub.recordAuditLog({
          action: input.action,
          actor: input.actor,
          targetType: input.targetType,
          targetId: input.targetId,
          details: input.details,
          s3Key: input.s3Key,
        });
        return { success: true };
      }),
  }),
});
