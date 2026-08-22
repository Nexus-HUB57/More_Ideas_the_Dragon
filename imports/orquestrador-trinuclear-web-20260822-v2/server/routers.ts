import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createBindCode,
  getBindCodeById,
  getBindCodeByCode,
  getAllBindCodes,
  updateBindCodeStatus,
  createOrUpdateNucleusStatus,
  getNucleusStatus,
  getAllNucleusStatus,
  updateNucleusHeartbeat,
  createBindHistory,
  getBindHistoryByCodeId,
  getAllBindHistory,
  updateBindHistoryStatus,
  createActivityLog,
  getUserCredits,
  consumeCredits,
  getCreditHistory,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  bindCodes: router({
    create: protectedProcedure
      .input(z.object({
        code: z.string().min(1).max(64),
        description: z.string().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await consumeCredits(ctx.user.id, 1, "CREATE_BIND_CODE", `Created bind code: ${input.code}`);
        const result = await createBindCode(input.code, ctx.user.id, input.expiresAt, input.description);
        await createActivityLog(ctx.user.id, "CREATE_BIND_CODE", `Created bind code: ${input.code}`, "bindCode", input.code);
        return result;
      }),

    list: protectedProcedure.query(async () => {
      return await getAllBindCodes();
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getBindCodeById(input);
      }),

    getByCode: protectedProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await getBindCodeByCode(input);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "used", "expired", "revoked"]),
        usedBy: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await updateBindCodeStatus(input.id, input.status, input.usedBy);
        await createActivityLog(ctx.user.id, "UPDATE_BIND_CODE_STATUS", `Updated bind code status to: ${input.status}`, "bindCode", String(input.id));
        return result;
      }),
  }),

  nucleus: router({
    createOrUpdate: protectedProcedure
      .input(z.object({
        nucleusId: z.string().min(1).max(255),
        name: z.string().min(1).max(255),
        type: z.enum(["primary", "secondary", "tertiary"]).default("primary"),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createOrUpdateNucleusStatus(input.nucleusId, input.name, input.type);
        await createActivityLog(ctx.user.id, "CREATE_UPDATE_NUCLEUS", `Created/Updated nucleus: ${input.name}`, "nucleus", input.nucleusId);
        return result;
      }),

    list: protectedProcedure.query(async () => {
      return await getAllNucleusStatus();
    }),

    getById: protectedProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await getNucleusStatus(input);
      }),

    updateHeartbeat: protectedProcedure
      .input(z.object({
        nucleusId: z.string(),
        syncProgress: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        return await updateNucleusHeartbeat(input.nucleusId, input.syncProgress);
      }),
  }),

  bindHistory: router({
    create: protectedProcedure
      .input(z.object({
        bindCodeId: z.number(),
        nucleusId: z.string(),
        status: z.enum(["pending", "sent", "confirmed", "failed"]).default("pending"),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createBindHistory(input.bindCodeId, input.nucleusId, input.status);
        await createActivityLog(ctx.user.id, "CREATE_BIND_HISTORY", `Created bind history for nucleus: ${input.nucleusId}`, "bindHistory", String(input.bindCodeId));
        return result;
      }),

    list: protectedProcedure.query(async () => {
      return await getAllBindHistory();
    }),

    getByCodeId: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getBindHistoryByCodeId(input);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "sent", "confirmed", "failed"]),
        telegramResponse: z.string().optional(),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await updateBindHistoryStatus(input.id, input.status, input.telegramResponse, input.errorMessage);
        await createActivityLog(ctx.user.id, "UPDATE_BIND_HISTORY_STATUS", `Updated bind history status to: ${input.status}`, "bindHistory", String(input.id));
        return result;
      }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(({ ctx }) => getUserCredits(ctx.user.id)),
    getHistory: protectedProcedure.query(({ ctx }) => getCreditHistory(ctx.user.id)),
    consume: protectedProcedure
      .input(z.object({
        creditsAmount: z.number().int().min(1),
        action: z.string().min(1).max(255),
        description: z.string().optional(),
        bindCodeId: z.number().int().optional(),
      }))
      .mutation(({ ctx, input }) => consumeCredits(ctx.user.id, input.creditsAmount, input.action, input.description, input.bindCodeId)),
  }),
});

export type AppRouter = typeof appRouter;
