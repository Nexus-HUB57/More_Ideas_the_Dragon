import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { getAffiliateByUserId, getAffiliateById, getAccountBalance, getAccountTransactionHistory } from "../db";
import { accounts, accountTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const accountsRouter = router({
  /**
   * Obter saldo da conta virtual do afiliado
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      return null;
    }

    const account = await getAccountBalance(affiliate.id);
    return account;
  }),

  /**
   * Obter histórico de movimentações da conta
   */
  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        return [];
      }

      const transactions = await getAccountTransactionHistory(affiliate.id, input.limit + input.offset);
      return transactions.slice(input.offset, input.offset + input.limit);
    }),

  /**
   * Obter saldo de um afiliado específico (admin)
   */
  getBalanceByAffiliateId: protectedProcedure
    .input(z.object({ affiliateId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const account = await getAccountBalance(input.affiliateId);
      return account;
    }),

  /**
   * Obter histórico de movimentações de um afiliado (admin)
   */
  getTransactionHistoryByAffiliateId: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().int(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const transactions = await getAccountTransactionHistory(input.affiliateId, input.limit + input.offset);
      return transactions.slice(input.offset, input.offset + input.limit);
    }),

  /**
   * Processar saque (admin)
   */
  processWithdrawal: protectedProcedure
    .input(
      z.object({
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new Error("Affiliate not found");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const account = await getAccountBalance(affiliate.id);
      if (!account) {
        throw new Error("Account not found");
      }

      const currentBalance = typeof account.balance === "string" ? parseFloat(account.balance) : account.balance;
      const withdrawalAmount = parseFloat(input.amount);

      if (currentBalance < withdrawalAmount) {
        throw new Error("Insufficient balance");
      }

      // Atualizar saldo
      const newBalance = (currentBalance - withdrawalAmount).toString();
      const newTotalWithdrawn = (typeof account.totalWithdrawn === "string" ? parseFloat(account.totalWithdrawn) : account.totalWithdrawn) + withdrawalAmount;

      await db
        .update(accounts)
        .set({
          balance: newBalance,
          totalWithdrawn: newTotalWithdrawn.toString(),
        })
        .where(eq(accounts.affiliateId, affiliate.id));

      // Registrar transação
      await db.insert(accountTransactions).values({
        affiliateId: affiliate.id,
        type: "saque",
        amount: input.amount,
        description: `Saque de R$ ${input.amount}`,
      });

      return {
        success: true,
        message: "Withdrawal processed successfully",
        newBalance,
      };
    }),

  /**
   * Registrar ajuste manual de saldo (admin)
   */
  recordAdjustment: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().int(),
        amount: z.string().regex(/^-?\d+(\.\d{1,2})?$/),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const account = await getAccountBalance(input.affiliateId);
      if (!account) {
        throw new Error("Account not found");
      }

      const currentBalance = typeof account.balance === "string" ? parseFloat(account.balance) : account.balance;
      const adjustmentAmount = parseFloat(input.amount);
      const newBalance = (currentBalance + adjustmentAmount).toString();

      await db
        .update(accounts)
        .set({
          balance: newBalance,
        })
        .where(eq(accounts.affiliateId, input.affiliateId));

      // Registrar transação
      await db.insert(accountTransactions).values({
        affiliateId: input.affiliateId,
        type: "ajuste",
        amount: input.amount,
        description: input.description,
      });

      return {
        success: true,
        message: "Adjustment recorded successfully",
        newBalance,
      };
    }),

  /**
   * Obter estatísticas de todas as contas (admin)
   */
  getGlobalStats: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se o usuário é admin
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allAccounts = await db.select().from(accounts);

    let totalBalance = 0;
    let totalEarned = 0;
    let totalWithdrawn = 0;

    for (const account of allAccounts) {
      const balance = typeof account.balance === "string" ? parseFloat(account.balance) : account.balance;
      const earned = typeof account.totalEarned === "string" ? parseFloat(account.totalEarned) : account.totalEarned;
      const withdrawn = typeof account.totalWithdrawn === "string" ? parseFloat(account.totalWithdrawn) : account.totalWithdrawn;

      totalBalance += balance;
      totalEarned += earned;
      totalWithdrawn += withdrawn;
    }

    return {
      totalBalance,
      totalEarned,
      totalWithdrawn,
      accountCount: allAccounts.length,
    };
  }),
});
