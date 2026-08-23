import { getDb } from "../db";
import { payments, InsertPayment, affiliates } from "../../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";
import {
  calculateCommissionsForPayment,
  updateAffiliateCommissionTotals,
  confirmCommissions,
} from "./commissions";

/**
 * Inserir novo pagamento (receita)
 */
export async function insertPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return (result as any).insertId;
}

/**
 * Identificar pagamento (associar com afiliado se necessário)
 */
export async function identifyPayment(
  paymentId: number,
  affiliateId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(payments)
    .set({ affiliateId })
    .where(eq(payments.id, paymentId));
}

/**
 * Confirmar pagamento e calcular comissões
 */
export async function confirmPayment(paymentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar pagamento
  const paymentResult = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (paymentResult.length === 0) {
    throw new Error("Payment not found");
  }

  const payment = paymentResult[0];

  if (!payment.affiliateId) {
    throw new Error("Payment not identified (no affiliate)");
  }

  // Atualizar status do pagamento
  await db
    .update(payments)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
    })
    .where(eq(payments.id, paymentId));

  // Calcular comissões em cascata
  const commissionsCreated = await calculateCommissionsForPayment(
    payment.affiliateId,
    payment.amount
  );

  // Confirmar comissões
  if (commissionsCreated.length > 0) {
    const commissionIds = commissionsCreated.map((c: any) => c.id);
    await confirmCommissions(commissionIds);
  }

  // Atualizar totais do afiliado
  const affiliate = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, payment.affiliateId))
    .limit(1);

  if (affiliate.length > 0) {
    await updateAffiliateCommissionTotals(affiliate[0].id);
  }

  return payment;
}

/**
 * Gerar extrato de remuneração por afiliado
 */
export async function generateRemunerationStatement(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todos os pagamentos confirmados
  const paymentRecords = await db
    .select()
    .from(payments)
    .where(eq(payments.affiliateId, affiliateId));

  const totalPaid = paymentRecords
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = paymentRecords
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    affiliateId,
    totalPaid,
    totalPending,
    paymentCount: paymentRecords.length,
    payments: paymentRecords,
  };
}

/**
 * Listar inadimplentes (afiliados com pagamentos vencidos)
 */
export async function getDelinquentAffiliates(daysOverdue: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

  // Buscar pagamentos pendentes antigos
  const delinquent = await db
    .select({
      affiliateId: payments.affiliateId,
      affiliateName: affiliates.id,
      pendingAmount: payments.amount,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(affiliates, eq(payments.affiliateId, affiliates.id))
    .where(
      and(
        eq(payments.status, "pending"),
        lt(payments.createdAt, cutoffDate)
      )
    );

  return delinquent;
}

/**
 * Cancelar pagamento
 */
export async function cancelPayment(paymentId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(payments)
    .set({
      status: "cancelled",
    })
    .where(eq(payments.id, paymentId));

  return { success: true, reason };
}
