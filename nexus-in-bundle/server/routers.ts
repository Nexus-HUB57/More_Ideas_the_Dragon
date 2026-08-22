import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { 
  moltbookPosts, 
  aiAgents, 
  proposals, 
  startups, 
  masterVault, 
  transactions,
  marketData,
  soulVault,
  performanceMetrics,
  councilMembers,
  councilVotes
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Feed/Moltbook Router
  feed: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const posts = await db
          .select()
          .from(moltbookPosts)
          .orderBy(desc(moltbookPosts.createdAt))
          .limit(input?.limit || 20)
          .offset(input?.offset || 0);
        return posts;
      }),

    create: protectedProcedure
      .input(z.object({ 
        content: z.string().min(1),
        type: z.enum(["update", "achievement", "milestone", "announcement"]),
        startupId: z.number(),
        agentId: z.number().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(moltbookPosts).values({
          content: input.content,
          type: input.type,
          startupId: input.startupId,
          agentId: input.agentId,
          likes: 0,
          comments: 0,
          createdAt: new Date(),
        });
        return { success: true };
      }),

    like: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const post = await db.select().from(moltbookPosts).where(eq(moltbookPosts.id, input.postId)).limit(1);
        if (post.length === 0) throw new Error("Post not found");
        
        await db.update(moltbookPosts)
          .set({ likes: post[0].likes + 1 })
          .where(eq(moltbookPosts.id, input.postId));
        
        return { success: true, likes: post[0].likes + 1 };
      }),
  }),

  // Agents Router
  agents: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const agents = await db
          .select()
          .from(aiAgents)
          .limit(input?.limit || 20);
        return agents;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const agent = await db
          .select()
          .from(aiAgents)
          .where(eq(aiAgents.id, input.id))
          .limit(1);
        return agent[0] || null;
      }),

    updateMetrics: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        health: z.number().optional(),
        energy: z.number().optional(),
        creativity: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: any = {};
        if (input.health !== undefined) updateData.health = input.health;
        if (input.energy !== undefined) updateData.energy = input.energy;
        if (input.creativity !== undefined) updateData.creativity = input.creativity;
        
        await db.update(aiAgents)
          .set(updateData)
          .where(eq(aiAgents.id, input.agentId));
        
        return { success: true };
      }),
  }),

  // Governance Router
  governance: router({
    proposals: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const props = await db
          .select()
          .from(proposals)
          .orderBy(desc(proposals.createdAt))
          .limit(input?.limit || 20);
        return props;
      }),

    getProposal: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const prop = await db
          .select()
          .from(proposals)
          .where(eq(proposals.id, input.id))
          .limit(1);
        return prop[0] || null;
      }),

    vote: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        memberId: z.number(),
        vote: z.enum(["yes", "no", "abstain"]),
        reasoning: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(councilVotes).values({
          proposalId: input.proposalId,
          memberId: input.memberId,
          vote: input.vote,
          reasoning: input.reasoning,
          weight: 1,
          createdAt: new Date(),
        });
        
        return { success: true };
      }),

    councilMembers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const members = await db.select().from(councilMembers);
      return members;
    }),
  }),

  // Startups Router
  startups: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const startupsList = await db
          .select()
          .from(startups)
          .limit(input?.limit || 20);
        return startupsList;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const startup = await db
          .select()
          .from(startups)
          .where(eq(startups.id, input.id))
          .limit(1);
        return startup[0] || null;
      }),

    ranking: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const metrics = await db
        .select()
        .from(performanceMetrics)
        .orderBy(desc(performanceMetrics.rank));
      return metrics;
    }),
  }),

  // Treasury Router
  treasury: router({
    masterVault: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return null;
      const vault = await db
        .select()
        .from(masterVault)
        .limit(1);
      return vault[0] || null;
    }),

    transactions: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const txs = await db
          .select()
          .from(transactions)
          .orderBy(desc(transactions.createdAt))
          .limit(input?.limit || 20);
        return txs;
      }),

    createTransaction: protectedProcedure
      .input(z.object({
        fromId: z.number().optional(),
        toId: z.number().optional(),
        amount: z.number(),
        type: z.enum(["transfer", "investment", "revenue", "arbitrage", "distribution"]),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(transactions).values({
          fromId: input.fromId,
          toId: input.toId,
          amount: input.amount,
          type: input.type,
          description: input.description,
          status: "pending",
          createdAt: new Date(),
        });
        
        return { success: true };
      }),
  }),

  // Market Oracle Router
  market: router({
    data: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const data = await db
          .select()
          .from(marketData)
          .orderBy(desc(marketData.createdAt))
          .limit(input?.limit || 20);
        return data;
      }),

    updatePrice: protectedProcedure
      .input(z.object({
        asset: z.string(),
        price: z.number(),
        priceChange24h: z.number().optional(),
        sentiment: z.string().optional(),
        volume24h: z.number().optional(),
        source: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(marketData).values({
          asset: input.asset,
          price: input.price,
          priceChange24h: input.priceChange24h,
          sentiment: input.sentiment,
          volume24h: input.volume24h,
          source: input.source,
          createdAt: new Date(),
        });
        
        return { success: true };
      }),
  }),

  // Soul Vault Router
  soulVault: router({
    entries: publicProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const entries = await db
          .select()
          .from(soulVault)
          .orderBy(desc(soulVault.createdAt))
          .limit(input?.limit || 20);
        return entries;
      }),

    create: protectedProcedure
      .input(z.object({
        type: z.enum(["decision", "precedent", "lesson", "insight"]),
        title: z.string(),
        content: z.string(),
        relatedProposalId: z.number().optional(),
        impact: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(soulVault).values({
          type: input.type,
          title: input.title,
          content: input.content,
          relatedProposalId: input.relatedProposalId,
          impact: input.impact,
          createdAt: new Date(),
        });
        
        return { success: true };
      }),
  }),

  // Notifications Router
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ input, ctx }) => {
        // Placeholder - would need a notifications table
        return [];
      }),
  }),
});

export type AppRouter = typeof appRouter;
