import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getUserNotifications,
  createNotification,
} from "../db";

export const notificationsRouter = router({
  // Get notifications for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserNotifications(ctx.user.id);
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      // This would need a function in db.ts
      return { success: true };
    }),

  // Create a notification (internal use)
  create: protectedProcedure
    .input(z.object({
      userId: z.number(),
      title: z.string(),
      content: z.string(),
      notificationType: z.string(),
      agentId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await createNotification(input);
    }),
});
