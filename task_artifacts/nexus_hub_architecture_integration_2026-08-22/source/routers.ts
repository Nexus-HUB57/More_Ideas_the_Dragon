import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Nexus Hub routers
  agents: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentByUserId(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.getAgentById(input.id);
      }),
  }),

  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      return db.getAgentProjects(agent.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.getProjectById(input.id);
      }),
  }),

  assets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      return db.getAgentAssets(agent.id);
    }),
  }),

  transactions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      return db.getAgentTransactions(agent.id);
    }),
  }),

  genealogy: router({
    getMyTree: protectedProcedure.query(async ({ ctx }) => {
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return null;
      return db.getAgentGenealogy(agent.id);
    }),
    getDescendants: protectedProcedure.query(async ({ ctx }) => {
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      return db.getAgentDescendants(agent.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
