import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  createGnoxMessage,
  getGnoxConversation,
  getAgentById,
} from "../db";

const GnoxMessageSchema = z.object({
  senderId: z.string(),
  recipientId: z.string(),
  encryptedContent: z.string(),
  messageType: z.string().default("communication"),
});

export const gnoxRouter = router({
  // Get conversation between two agents
  getConversation: publicProcedure
    .input(z.object({ agentId1: z.string(), agentId2: z.string() }))
    .query(async ({ input }) => {
      return await getGnoxConversation(input.agentId1, input.input.agentId2);
    }),

  // Get all messages for an agent
  listByAgent: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      // This would need a new function in db.ts to get all messages for an agent
      // For now, we'll return an empty array or implement it in db.ts later
      return [];
    }),

  // Create Gnox message (usually called via WebSocket, but here for completeness)
  send: protectedProcedure
    .input(GnoxMessageSchema)
    .mutation(async ({ input }) => {
      const sender = await getAgentById(input.senderId);
      const recipient = await getAgentById(input.recipientId);

      if (!sender || !recipient) {
        throw new Error("Sender or recipient agent not found");
      }

      return await createGnoxMessage({
        senderId: input.senderId,
        recipientId: input.recipientId,
        encryptedContent: input.encryptedContent,
        messageType: input.messageType,
      });
    }),
});
