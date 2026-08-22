import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, affiliates, network, payments, commissions, accounts, accountTransactions, careerLevels, InsertPayment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Helpers para Sistema Multinível Jhon Riff's
// ============================================================================

/**
 * Obter afiliado por ID de usuário
 */
export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Obter afiliado por ID
 */
export async function getAffiliateById(affiliateId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Obter rede de indicações (downline) de um afiliado
 */
export async function getNetworkDownline(affiliateId: number, maxLevels: number = 4) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(network)
    .where(eq(network.sponsorId, affiliateId))
    .orderBy(network.level);

  return result;
}

/**
 * Obter saldo da conta virtual
 */
export async function getAccountBalance(affiliateId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(accounts).where(eq(accounts.affiliateId, affiliateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Criar registro de pagamento
 */
export async function createPaymentRecord(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return result;
}

/**
 * Confirmar pagamento e calcular comissões Unilevel
 */
export async function confirmPaymentAndCommission(paymentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Obter o pagamento
  const paymentResult = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (paymentResult.length === 0) throw new Error("Payment not found");

  const payment = paymentResult[0];

  // Atualizar status do pagamento
  await db.update(payments).set({ status: "confirmado", confirmedAt: new Date() }).where(eq(payments.id, paymentId));

  // Obter afiliado que fez o pagamento
  const affiliate = await getAffiliateById(payment.affiliateId);
  if (!affiliate) throw new Error("Affiliate not found");

  // Calcular comissões Unilevel
  await calculateUnilevelCommissions(paymentId, payment.amount, affiliate.sponsorId);

  // Atualizar saldo da conta virtual
  const account = await getAccountBalance(payment.affiliateId);
  if (account) {
    const currentBalance = typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance;
    const currentEarned = typeof account.totalEarned === 'string' ? parseFloat(account.totalEarned) : account.totalEarned;
    const paymentAmount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
    const newBalance = (currentBalance + paymentAmount).toString();
    const newTotalEarned = (currentEarned + paymentAmount).toString();
    await db.update(accounts).set({ balance: newBalance, totalEarned: newTotalEarned }).where(eq(accounts.affiliateId, payment.affiliateId));
  }
}

/**
 * Calcular comissões Unilevel
 * Estrutura: 10% (direto), 5% (2º nível), 2,5% (3º nível), 2,5% (4º nível)
 */
export async function calculateUnilevelCommissions(
  paymentId: number,
  amount: string | number,
  sponsorId: number | null,
  level: number = 1
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!sponsorId || level > 4) return;

  // Definir taxa de comissão por nível
  const commissionRates: { [key: number]: number } = {
    1: 10, // 10% direto
    2: 5,  // 5% segundo nível
    3: 2.5, // 2,5% terceiro nível
    4: 2.5, // 2,5% quarto nível
  };

  const rate = commissionRates[level] || 0;
  if (rate === 0) return;

  const amountNum = typeof amount === "number" ? amount : parseFloat(amount.toString());
  const commissionAmount = (amountNum * rate) / 100;

  // Criar registro de comissão
  await db.insert(commissions).values({
    affiliateId: sponsorId,
    paymentId,
    level,
    commissionRate: rate.toString(),
    amount: commissionAmount.toString(),
    status: "pendente",
  });

  // Atualizar saldo da conta virtual do sponsor
  const sponsorAccount = await getAccountBalance(sponsorId);
  if (sponsorAccount) {
    const currentBalance = typeof sponsorAccount.balance === 'string' ? parseFloat(sponsorAccount.balance) : sponsorAccount.balance;
    const currentEarned = typeof sponsorAccount.totalEarned === 'string' ? parseFloat(sponsorAccount.totalEarned) : sponsorAccount.totalEarned;
    const newBalance = (currentBalance + commissionAmount).toString();
    const newTotalEarned = (currentEarned + commissionAmount).toString();
    await db.update(accounts).set({ balance: newBalance, totalEarned: newTotalEarned }).where(eq(accounts.affiliateId, sponsorId));
  }

  // Registrar transação
  await db.insert(accountTransactions).values({
    affiliateId: sponsorId,
    type: "comissao",
    amount: commissionAmount.toString(),
    description: `Comissão nível ${level} do pagamento #${paymentId}`,
    relatedPaymentId: paymentId,
  });

  // Recursivamente calcular comissões para o próximo nível
  const sponsorAffiliate = await getAffiliateById(sponsorId);
  if (sponsorAffiliate?.sponsorId) {
    await calculateUnilevelCommissions(paymentId, amount, sponsorAffiliate.sponsorId, level + 1);
  }
}

/**
 * Obter histórico de movimentações da conta
 */
export async function getAccountTransactionHistory(affiliateId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(accountTransactions)
    .where(eq(accountTransactions.affiliateId, affiliateId))
    .orderBy((t) => t.createdAt)
    .limit(limit);

  return result;
}

/**
 * Obter nível de carreira configurado
 */
export async function getCareerLevelConfig(levelName: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(careerLevels).where(eq(careerLevels.level, levelName)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Listar todos os níveis de carreira
 */
export async function getAllCareerLevels() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(careerLevels).orderBy(careerLevels.requiredPoints);
  return result;
}
