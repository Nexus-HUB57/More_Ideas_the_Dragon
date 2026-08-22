import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { emailNotificationSettings, notifications } from "../../drizzle/schema";
import { createNotification, getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const notificationsRouter = router({
  getEmailSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(emailNotificationSettings).where(eq(emailNotificationSettings.userId, ctx.user.id)).limit(1);
    return result[0] ?? null;
  }),

  updateEmailSettings: protectedProcedure
    .input(z.object({ agentCriticalState: z.boolean(), largeTransactions: z.boolean(), largeTransactionThreshold: z.string().regex(/^\d+(\\.\\d{1,2})?$/), systemAnomalies: z.boolean(), agentBirth: z.boolean(), projectMilestones: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(emailNotificationSettings).where(eq(emailNotificationSettings.userId, ctx.user.id)).limit(1);
      if (existing[0]) {
        await db.update(emailNotificationSettings).set(input).where(eq(emailNotificationSettings.userId, ctx.user.id));
      } else {
        await db.insert(emailNotificationSettings).values({ userId: ctx.user.id, ...input });
      }
      const result = await db.select().from(emailNotificationSettings).where(eq(emailNotificationSettings.userId, ctx.user.id)).limit(1);
      return result[0] ?? null;
    }),
  create: protectedProcedure
    .input(z.object({ title: z.string().trim().min(1).max(255), content: z.string().trim().min(1).max(10000), notificationType: z.string().trim().min(1).max(64), agentId: z.string().min(1).optional(), actionUrl: z.string().url().optional() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await createNotification({
        userId: ctx.user.id,
        title: input.title,
        content: input.content,
        notificationType: input.notificationType,
        agentId: input.agentId,
        actionUrl: input.actionUrl,
        read: false,
      });
      return notification;
    }),
  getMine: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().default(false), limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const userId = ctx.user.id;
      const query = input?.unreadOnly
        ? db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false))).orderBy(desc(notifications.createdAt))
        : db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
      return query.limit(input?.limit ?? 50);
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;
    const rows = await db.select({ id: notifications.id }).from(notifications).where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false)));
    return rows.length;
  }),

  markRead: protectedProcedure
    .input(z.object({ notificationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notifications).set({ read: true }).where(and(eq(notifications.notificationId, input.notificationId), eq(notifications.userId, ctx.user.id)));
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, ctx.user.id));
    return { success: true };
  }),
});
