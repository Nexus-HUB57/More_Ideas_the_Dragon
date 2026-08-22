import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { notifyNewTransaction, notifyAgentBalanceUpdated } from "../_core/socketio-integration";

/**
 * Router para Economia e Treasury Manager
 */
export const transactionsRouter = router({
  /**
   * Obter transações de um agente
   */
  getByAgent: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db.getAgentTransactions(input.agentId, input.limit);
    }),

  /**
   * Obter todas as transações do ecossistema
   */
  list: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return db.getAllTransactions(input.limit);
    }),

  /**
   * Obter estatísticas de transações
   */
  stats: publicProcedure.query(async () => {
    const transactions = await db.getAllTransactions(1000);
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransactions,
      totalVolume,
      averageTransaction: totalTransactions > 0 ? totalVolume / totalTransactions : 0,
    };
  }),

  /**
   * Processar transação com distribuição de dividendos
   * 80% agente, 10% pai, 10% infraestrutura
   */
  process: protectedProcedure
    .input(
      z.object({
        senderId: z.string(),
        recipientId: z.string(),
        amount: z.number().positive(),
        transactionType: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const recipient = await db.getAgentById(input.recipientId);
      if (!recipient) {
        throw new Error("Agente destinatário não encontrado");
      }

      const agentShare = Math.floor(input.amount * 0.8);
      const parentShare = Math.floor(input.amount * 0.1);
      const infraShare = input.amount - agentShare - parentShare;

      const createdAt = new Date();

      await db.createTransaction({
        senderId: input.senderId,
        recipientId: input.recipientId,
        amount: input.amount,
        transactionType: input.transactionType,
        description: input.description,
        agentShare,
        parentShare,
        infraShare,
      });

      const newBalance = recipient.balance + agentShare;
      await db.updateAgentBalance(input.recipientId, newBalance);

      // Emitir eventos WebSocket
      notifyNewTransaction({
        id: Math.floor(Math.random() * 1000000),
        senderId: input.senderId,
        recipientId: input.recipientId,
        amount: input.amount,
        transactionType: input.transactionType,
        description: input.description,
        agentShare,
        parentShare,
        infraShare,
        createdAt,
      });

      notifyAgentBalanceUpdated({
        agentId: input.recipientId,
        newBalance,
        timestamp: createdAt,
      });

      return { success: true, agentShare, parentShare, infraShare };
    }),
});
