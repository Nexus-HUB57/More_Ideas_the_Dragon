import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  listMissions,
  getMissionById,
  createMission,
  assignMission,
  updateMissionProgress,
  recordMissionCompletion,
} from "../db";

export const missionsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["created", "assigned", "in_progress", "completed", "failed"])
          .optional(),
        assignedAgentId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return listMissions({
        status: input.status,
        assignedAgentId: input.assignedAgentId,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getMissionById(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        creatorAgentId: z.number(),
        requiredSkills: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createMission({
        title: input.title,
        description: input.description,
        creatorAgentId: input.creatorAgentId,
        requiredSkills: input.requiredSkills,
        priority: input.priority,
      });
    }),

  assign: protectedProcedure
    .input(
      z.object({
        missionId: z.number(),
        agentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return assignMission(input.missionId, input.agentId);
    }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        missionId: z.number(),
        progress: z.number().min(0).max(100),
        status: z
          .enum(["created", "assigned", "in_progress", "completed", "failed"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      return updateMissionProgress(input.missionId, input.progress, input.status);
    }),

  complete: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        missionId: z.number(),
        completionStatus: z.enum(["completed", "failed", "abandoned"]),
        performanceScore: z.number().min(0).max(100).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return recordMissionCompletion({
        agentId: input.agentId,
        missionId: input.missionId,
        completionStatus: input.completionStatus,
        performanceScore: input.performanceScore,
        notes: input.notes,
      });
    }),
});
