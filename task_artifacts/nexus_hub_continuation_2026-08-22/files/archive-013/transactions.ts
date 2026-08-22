import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  createTransaction, getTransactionsByAgent, getRecentTransactions,
  getAgentById, updateAgentBalance, createEcosystemActivity,
} from "../db";

const TransactionSchema = z.object({
  senderId: z.string(),
  recipientId: z.string(),
  amount: z.number().min(1),
  transactionType: z.string(),
  description: z.string().optional(),
});

export const transactionsRouter = router({
  // Get recent transactions
  recent: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await getRecentTransactions(input.limit);
    }),

  // Get transactions by agent
  byAgent: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return await getTransactionsByAgent(input.agentId);
    }),

  // Create transaction with automatic distribution
  create: protectedProcedure
    .input(TransactionSchema)
    .mutation(async ({ input }) => {
      const sender = await getAgentById(input.senderId);
      const recipient = await getAgentById(input.recipientId);

      if (!sender || !recipient) {
        throw new Error("Sender or recipient agent not found");
      }

      if (sender.balance < input.amount) {
        throw new Error("Insufficient balance");
      }

      // Calculate distribution: 80% agent, 10% parent, 10% infrastructure
      const agentShare = Math.floor(input.amount * 0.8);
      const parentShare = Math.floor(input.amount * 0.1);
      const infraShare = input.amount - agentShare - parentShare;

      // Create transaction record
      const transaction = await createTransaction({
        senderId: input.senderId,
        recipientId: input.recipientId,
        amount: input.amount,
        transactionType: input.transactionType,
        description: input.description,
        agentShare,
        parentShare,
        infraShare,
      });

      // Update balances
      await updateAgentBalance(input.senderId, sender.balance - input.amount);
      await updateAgentBalance(input.recipientId, recipient.balance + agentShare);

      // If recipient has a parent, distribute parent share
      if (recipient.parentId) {
        const parent = await getAgentById(recipient.parentId);
        if (parent) {
          await updateAgentBalance(recipient.parentId, parent.balance + parentShare);
        }
      }

      // Log activity
      await createEcosystemActivity({
        agentId: input.senderId,
        activityType: "transaction",
        title: `💸 Transação: ${sender.name} → ${recipient.name}`,
        description: `${input.amount} tokens transferidos. Distribuição: Agente ${agentShare}, Parent ${parentShare}, Infra ${infraShare}`,
        metadata: JSON.stringify({
          amount: input.amount,
          agentShare,
          parentShare,
          infraShare,
          type: input.transactionType,
        }),
      });

      return transaction;
    }),

  // Get transaction statistics
  stats: publicProcedure.query(async () => {
    const recentTxs = await getRecentTransactions(100);
    
    const totalVolume = recentTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const avgTransaction = recentTxs.length > 0 ? totalVolume / recentTxs.length : 0;
    
    return {
      totalTransactions: recentTxs.length,
      totalVolume,
      avgTransaction: Math.floor(avgTransaction),
      lastTransaction: recentTxs[0]?.createdAt,
    };
  }),
});
