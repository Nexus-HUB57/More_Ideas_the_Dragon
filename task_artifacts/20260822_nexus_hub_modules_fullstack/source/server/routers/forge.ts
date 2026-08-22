import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { forgeProjects, type InsertForgeProject } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const projectStatusSchema = z.enum(["development", "audit", "deployed", "archived"]);

export const forgeRouter = router({
  list: publicProcedure
    .input(z.object({ status: projectStatusSchema.optional(), limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const query = input?.status
        ? db.select().from(forgeProjects).where(eq(forgeProjects.status, input.status)).orderBy(desc(forgeProjects.updatedAt))
        : db.select().from(forgeProjects).orderBy(desc(forgeProjects.updatedAt));
      return query.limit(input?.limit ?? 50);
    }),

  getById: publicProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(forgeProjects).where(eq(forgeProjects.projectId, input.projectId)).limit(1);
      return result[0] ?? null;
    }),

  byAgent: publicProcedure
    .input(z.object({ agentId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(forgeProjects).where(eq(forgeProjects.agentId, input.agentId)).orderBy(desc(forgeProjects.updatedAt));
    }),

  create: protectedProcedure
    .input(z.object({
      agentId: z.string().min(1),
      name: z.string().trim().min(1).max(255),
      description: z.string().trim().max(10000).optional(),
      repositoryUrl: z.string().url().optional(),
      documentationUrl: z.string().url().optional(),
      metrics: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const project: InsertForgeProject = {
        projectId: nanoid(),
        agentId: input.agentId,
        name: input.name,
        description: input.description,
        status: "development",
        repositoryUrl: input.repositoryUrl,
        documentationUrl: input.documentationUrl,
        metrics: input.metrics,
      };
      await db.insert(forgeProjects).values(project);
      return project;
    }),

  updateStatus: protectedProcedure
    .input(z.object({ projectId: z.string().min(1), status: projectStatusSchema }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(forgeProjects).set({ status: input.status }).where(eq(forgeProjects.projectId, input.projectId));
      const result = await db.select().from(forgeProjects).where(eq(forgeProjects.projectId, input.projectId)).limit(1);
      return result[0] ?? null;
    }),
});
