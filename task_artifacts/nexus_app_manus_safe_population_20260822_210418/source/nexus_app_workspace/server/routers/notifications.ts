import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { z } from "zod";

export const notificationsRouter = router({
  /**
   * Obter notificações do usuário com paginação
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        type: z.string().optional(),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const conditions = [eq(notifications.userId, ctx.user.id)];

        if (input.type && input.type !== "all") {
          conditions.push(eq(notifications.notificationType, input.type));
        }

        if (input.unreadOnly) {
          conditions.push(eq(notifications.read, false));
        }

        const total = await db
          .select()
          .from(notifications)
          .where(and(...conditions));

        const items = await db
          .select()
          .from(notifications)
          .where(and(...conditions))
          .orderBy(desc(notifications.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          items: items || [],
          total: total.length,
          hasMore: input.offset + input.limit < total.length,
        };
      } catch (error) {
        console.error("[notificationsRouter] Error fetching notifications:", error);
        throw error;
      }
    }),

  /**
   * Obter contagem de notificações não lidas
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const unread = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false)));

      return {
        count: unread.length,
      };
    } catch (error) {
      console.error("[notificationsRouter] Error fetching unread count:", error);
      throw error;
    }
  }),

  /**
   * Marcar notificação como lida
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        await db
          .update(notifications)
          .set({ read: true })
          .where(
            and(
              eq(notifications.id, input.notificationId),
              eq(notifications.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("[notificationsRouter] Error marking notification as read:", error);
        throw error;
      }
    }),

  /**
   * Marcar todas as notificações como lidas
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false)));

      return { success: true };
    } catch (error) {
      console.error("[notificationsRouter] Error marking all as read:", error);
      throw error;
    }
  }),

  /**
   * Deletar notificação
   */
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        await db
          .delete(notifications)
          .where(
            and(
              eq(notifications.id, input.notificationId),
              eq(notifications.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        console.error("[notificationsRouter] Error deleting notification:", error);
        throw error;
      }
    }),

  /**
   * Obter estatísticas de notificações
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const allNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id));

      const stats = {
        total: allNotifications.length,
        unread: allNotifications.filter((n: any) => !n.read).length,
        byType: {} as Record<string, number>,
      };

      for (const notif of allNotifications) {
        const type = notif.notificationType;
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      }

      return stats;
    } catch (error) {
      console.error("[notificationsRouter] Error fetching stats:", error);
      throw error;
    }
  }),
});
