import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  listStartups,
  getStartupById,
  createStartup,
  updateStartupStatus,
  getStartupMilestones,
  createStartupMilestone,
} from "../db";
import { invokeLLM } from "../_core/llm";

export const startupsRouter = router({
  list: protectedProcedure.query(async () => {
    return listStartups();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getStartupById(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        fundingGoal: z.number().positive(),
        leaderId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createStartup({
        name: input.name,
        description: input.description,
        fundingGoal: input.fundingGoal,
        leaderId: input.leaderId || ctx.user?.id,
        status: "development",
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ideation", "development", "launch", "growth", "mature"]),
      })
    )
    .mutation(async ({ input }) => {
      return updateStartupStatus(input.id, input.status);
    }),

  getMilestones: protectedProcedure
    .input(z.object({ startupId: z.number() }))
    .query(async ({ input }) => {
      return getStartupMilestones(input.startupId);
    }),

  createMilestone: protectedProcedure
    .input(
      z.object({
        startupId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        targetDate: z.date().optional(),
        financialTarget: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createStartupMilestone({
        startupId: input.startupId,
        title: input.title,
        description: input.description,
        targetDate: input.targetDate,
        financialTarget: input.financialTarget,
      });
    }),

  // Analyze startup performance and potential
  analyze: protectedProcedure
    .input(z.object({ startupId: z.number() }))
    .query(async ({ input }) => {
      const startup = await getStartupById(input.startupId);
      if (!startup) throw new Error("Startup not found");

      const milestones = await getStartupMilestones(input.startupId);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a startup analyst. Analyze the provided startup data and return a JSON object with analysis.`,
          },
          {
            role: "user",
            content: `Analyze this startup:
            Name: ${startup.name}
            Description: ${startup.description}
            Status: ${startup.status}
            Funding Goal: ${startup.fundingGoal} BTC
            Funding Received: ${startup.fundingReceived} BTC
            Active Collaborators: ${startup.activeCollaborators}
            
            Milestones: ${JSON.stringify(milestones)}
            
            Provide market analysis, growth potential, risk assessment, and recommendations.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "startup_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                marketAnalysis: { type: "string" },
                growthPotential: { type: "string" },
                riskAssessment: { type: "string" },
                recommendations: { type: "array", items: { type: "string" } },
              },
              required: ["marketAnalysis", "growthPotential", "riskAssessment", "recommendations"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content;
      const contentStr = typeof content === "string" ? content : "{}";
      return JSON.parse(contentStr);
    }),
});
