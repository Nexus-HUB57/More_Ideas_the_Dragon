import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { transactions, agents, InsertTransaction } from "../../drizzle/schema";
import { nanoid } from "nanoid";

export const transactionsRouter = router({
  /**
   * Obter todas as transações
   */
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(transactions).orderBy(transactions.createdAt).limit(input.limit).offset(input.offset);
    }),

  /**
   * Obter transações de um agente
   */
  getAgentTransactions: publicProcedure
    .input(z.object({
      agentId: z.string(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      // Buscar transações onde o agente é remetente ou destinatário
      const result = await db.select().from(transactions)
        .where(eq(transactions.senderId, input.agentId))
        .orderBy(transactions.createdAt)
        .limit(input.limit);
      return result;
    }),

  /**
   * Obter transação específica
   */
  getById: publicProcedure
    .input(z.object({ transactionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(transactions).where(eq(transactions.transactionId, input.transactionId)).limit(1);
      return result.length > 0 ? result[0] : null;
    }),

  /**
   * Criar transação com distribuição automática de taxas (80/10/10)
   */
  create: protectedProcedure
    .input(z.object({
      senderId: z.string(),
      recipientId: z.string(),
      amount: z.string(),
      transactionType: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transactionId = nanoid();
      const amountNum = parseFloat(input.amount);

      // Calcular distribuição: 80% agente, 10% pai, 10% infraestrutura
      const agentShare = (amountNum * 0.8).toString();
      const parentShare = (amountNum * 0.1).toString();
      const infraShare = (amountNum * 0.1).toString();

      const newTransaction: InsertTransaction = {
        transactionId,
        senderId: input.senderId,
        recipientId: input.recipientId,
        amount: input.amount,
        transactionType: input.transactionType,
        description: input.description,
        agentShare,
        parentShare,
        infraShare,
        status: "pending",
      };

      await db.insert(transactions).values(newTransaction);

      // Atualizar balances dos agentes
      const recipient = await db.select().from(agents).where(eq(agents.agentId, input.recipientId)).limit(1);
      if (recipient.length > 0) {
        const currentBalance = parseFloat(recipient[0].balance as string) || 0;
        const newBalance = (currentBalance + amountNum).toString();
        await db.update(agents).set({ balance: newBalance }).where(eq(agents.agentId, input.recipientId));
      }

      const sender = await db.select().from(agents).where(eq(agents.agentId, input.senderId)).limit(1);
      if (sender.length > 0) {
        const currentBalance = parseFloat(sender[0].balance as string) || 0;
        const newBalance = (currentBalance - amountNum).toString();
        await db.update(agents).set({ balance: newBalance }).where(eq(agents.agentId, input.senderId));
      }

      // Marcar como completa
      await db.update(transactions).set({ status: "completed", completedAt: new Date() }).where(eq(transactions.transactionId, transactionId));

      return { transactionId };
    }),

  /**
   * Obter estatísticas de economia
   */
  getEconomyStats: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return { totalBalance: "0", totalTransactions: 0, averageTransaction: "0" };

      const allAgents = await db.select().from(agents);
      const allTransactions = await db.select().from(transactions);

      const totalBalance = allAgents.reduce((sum, agent) => {
        return sum + (parseFloat(agent.balance as string) || 0);
      }, 0).toString();

      const averageTransaction = allTransactions.length > 0
        ? (allTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount as string), 0) / allTransactions.length).toString()
        : "0";

      return {
        totalBalance,
        totalTransactions: allTransactions.length,
        averageTransaction,
      };
    }),
});
