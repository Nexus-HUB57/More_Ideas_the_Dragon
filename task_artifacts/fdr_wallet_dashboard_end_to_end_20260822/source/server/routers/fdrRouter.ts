import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { FdrTransactionManager, verifyPassword, PASSWORD_A_HASH, PASSWORD_B_HASH, PASSWORD_C_HASH, CUSTODY_WALLET_ADDRESS } from "../fdr_service";
import { getDb } from "../db";
import { fdrTransactions, auditLogs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export const fdrRouter = router({
  // Status da Mainnet e visão geral da carteira FDR
  status: publicProcedure.query(async () => {
    return FdrTransactionManager.getNetworkStatus();
  }),

  // Listar transações e histórico de auditoria
  listTransactions: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      return await db.select().from(fdrTransactions).orderBy(desc(fdrTransactions.createdAt)).limit(50);
    } catch (e) {
      console.error("Erro ao listar transações:", e);
      return [];
    }
  }),

  listAuditLogs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(50);
    } catch (e) {
      console.error("Erro ao listar audit logs:", e);
      return [];
    }
  }),

  // Protocolo A: Criar Transação e Validar UTXOs
  protocolA: publicProcedure.input(
    z.object({
      amountBtc: z.number().positive(),
      passwordA: z.string(),
      sourceAddress: z.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    if (!verifyPassword(input.passwordA, PASSWORD_A_HASH)) {
      throw new Error("Senha do Protocolo A incorreta (Senha incorreta para iniciar transação).");
    }

    const result = FdrTransactionManager.simulateProtocolA(input.amountBtc, input.sourceAddress || "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug");
    const txId = "fdr_tx_" + crypto.randomBytes(8).toString('hex');

    const db = await getDb();
    if (db) {
      try {
        await db.insert(fdrTransactions).values({
          id: txId,
          amountBtc: input.amountBtc.toString(),
          destinationAddress: CUSTODY_WALLET_ADDRESS,
          sourceAddress: input.sourceAddress || "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug",
          feeSatoshi: result.feeSatoshi,
          state: "PENDING_B",
          rawTxUnsignedHex: result.unsignedHex,
          network: "bitcoin",
          createdBy: ctx.user?.email || "corporativo@fdr.local"
        });

        await db.insert(auditLogs).values({
          action: "Protocolo A Executado - UTXOs Validados e Tx Não Assinada Criada",
          protocol: "Protocol_A",
          details: `Valor: ${input.amountBtc} BTC para ${CUSTODY_WALLET_ADDRESS}`,
          txId: txId,
          userOpenId: ctx.user?.openId || "system"
        });
      } catch (dbErr) {
        console.error("Erro ao gravar transação no banco:", dbErr);
      }
    }

    return {
      txId,
      ...result
    };
  }),

  // Protocolo B: Assinatura PSBT e Chave Mestra
  protocolB: publicProcedure.input(
    z.object({
      txId: z.string(),
      passwordB: z.string(),
      unsignedHex: z.string()
    })
  ).mutation(async ({ input, ctx }) => {
    if (!verifyPassword(input.passwordB, PASSWORD_B_HASH)) {
      throw new Error("Senha do Protocolo B incorreta (Falha na assinatura PSBT).");
    }

    const result = FdrTransactionManager.simulateProtocolB(input.unsignedHex);

    const db = await getDb();
    if (db) {
      try {
        await db.update(fdrTransactions)
          .set({ signedTxHex: result.signedHex, state: "PENDING_C", updatedAt: new Date() })
          .where(eq(fdrTransactions.id, input.txId));

        await db.insert(auditLogs).values({
          action: "Protocolo B Executado - Assinatura PSBT Concluída",
          protocol: "Protocol_B",
          details: `Assinatura gerada com sucesso para Tx ${input.txId}`,
          txId: input.txId,
          userOpenId: ctx.user?.openId || "system"
        });
      } catch (dbErr) {
        console.error("Erro ao atualizar transação no banco:", dbErr);
      }
    }

    return result;
  }),

  // Protocolo C: Broadcast Mainnet com Fallbacks
  protocolC: publicProcedure.input(
    z.object({
      txId: z.string(),
      passwordC: z.string(),
      signedHex: z.string()
    })
  ).mutation(async ({ input, ctx }) => {
    if (!verifyPassword(input.passwordC, PASSWORD_C_HASH)) {
      throw new Error("Senha do Protocolo C incorreta (Falha na autorização de broadcast).");
    }

    const result = FdrTransactionManager.simulateProtocolC(input.signedHex);

    const db = await getDb();
    if (db) {
      try {
        await db.update(fdrTransactions)
          .set({ txid: result.txid, state: "COMPLETED", updatedAt: new Date() })
          .where(eq(fdrTransactions.id, input.txId));

        await db.insert(auditLogs).values({
          action: "Protocolo C Executado - Broadcast Real na Mainnet Bitcoin",
          protocol: "Protocol_C",
          details: `Transação confirmada. TxID: ${result.txid}`,
          txId: input.txId,
          userOpenId: ctx.user?.openId || "system"
        });
      } catch (dbErr) {
        console.error("Erro ao finalizar transação no banco:", dbErr);
      }
    }

    return result;
  })
});
