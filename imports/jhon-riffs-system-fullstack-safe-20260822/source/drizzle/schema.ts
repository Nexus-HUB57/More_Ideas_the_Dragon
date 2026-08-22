import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// Tabelas do Sistema Multinível Jhon Riff's
// ============================================================================

/**
 * Tabela de Afiliados - Membros do sistema de Multinível
 * Cada usuário pode ter um registro de afiliado associado
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  sponsorId: int("sponsorId"), // ID do patrocinador (quem indicou)
  careerLevel: mysqlEnum("careerLevel", [
    "inscrito",
    "agente_autonomo",
    "consultor",
    "mentor",
    "executivo",
    "socio_investidor",
    "socio_gestor",
    "socio_jr_group"
  ]).default("inscrito").notNull(),
  status: mysqlEnum("status", ["ativo", "inativo", "suspenso"]).default("ativo").notNull(),
  accumulatedPoints: int("accumulatedPoints").default(0).notNull(),
  monthlyPoints: int("monthlyPoints").default(0).notNull(),
  directDownlineCount: int("directDownlineCount").default(0).notNull(), // Contagem de indicados diretos
  totalDownlineCount: int("totalDownlineCount").default(0).notNull(), // Total de indicados (todos os níveis)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Tabela de Rede - Relacionamento entre afiliados (indicações)
 * Mantém a hierarquia de indicações para cálculo de comissões Unilevel
 */
export const network = mysqlTable("network", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  sponsorId: int("sponsorId").notNull(),
  level: int("level").notNull(), // Nível na hierarquia (1 = direto, 2 = segundo nível, etc)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NetworkRecord = typeof network.$inferSelect;
export type InsertNetworkRecord = typeof network.$inferInsert;

/**
 * Tabela de Pagamentos - Receitas inseridas pelos clientes
 * Fluxo: Inserir → Identificar → Confirmar (dispara cálculo de comissões)
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  bank: varchar("bank", { length: 100 }),
  accountNumber: varchar("accountNumber", { length: 50 }),
  paymentDate: timestamp("paymentDate").notNull(),
  status: mysqlEnum("status", ["pendente", "identificado", "confirmado"]).default("pendente").notNull(),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Tabela de Comissões - Comissões calculadas a partir dos pagamentos
 * Gerada automaticamente quando um pagamento é confirmado
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  paymentId: int("paymentId").notNull(),
  level: int("level").notNull(), // Nível na rede (1 = direto, 2 = segundo nível, etc)
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).notNull(), // Percentual (ex: 10.00)
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pendente", "pago"]).default("pendente").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Tabela de Contas Virtuais - JR Bank (saldo de cada afiliado)
 * Mantém o saldo, ganhos totais e saques
 */
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  totalEarned: decimal("totalEarned", { precision: 12, scale: 2 }).default("0.00").notNull(),
  totalWithdrawn: decimal("totalWithdrawn", { precision: 12, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

/**
 * Tabela de Bilhetes de Sorte - +Sorte (números da sorte)
 * Gerados quando o afiliado atinge as metas de vendas
 */
export const lotteryTickets = mysqlTable("lottery_tickets", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  paymentId: int("paymentId"),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull(),
  lotteryDrawDate: timestamp("lotteryDrawDate"),
  status: mysqlEnum("status", ["ativo", "sorteado", "expirado"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LotteryTicket = typeof lotteryTickets.$inferSelect;
export type InsertLotteryTicket = typeof lotteryTickets.$inferInsert;

/**
 * Tabela de Níveis de Carreira - Configuração dos 7 níveis
 * Define os requisitos, investimentos e taxas de comissão para cada nível
 */
export const careerLevels = mysqlTable("career_levels", {
  id: int("id").autoincrement().primaryKey(),
  level: varchar("level", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  requiredPoints: int("requiredPoints").notNull(),
  investmentAmount: decimal("investmentAmount", { precision: 10, scale: 2 }),
  directCommissionRate: decimal("directCommissionRate", { precision: 5, scale: 2 }).notNull(), // Taxa de comissão direta
  level2CommissionRate: decimal("level2CommissionRate", { precision: 5, scale: 2 }).notNull(),
  level3CommissionRate: decimal("level3CommissionRate", { precision: 5, scale: 2 }).notNull(),
  level4CommissionRate: decimal("level4CommissionRate", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CareerLevel = typeof careerLevels.$inferSelect;
export type InsertCareerLevel = typeof careerLevels.$inferInsert;

/**
 * Tabela de E-books/Infoprodutos
 * Gerencia os produtos digitais vendidos pelo sistema
 */
export const ebooks = mysqlTable("ebooks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  fileUrl: text("fileUrl"), // URL do arquivo no S3
  category: varchar("category", { length: 100 }),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ebook = typeof ebooks.$inferSelect;
export type InsertEbook = typeof ebooks.$inferInsert;

/**
 * Tabela de Histórico de Movimentações - Rastreamento de transações
 * Registra todas as movimentações na conta virtual (JR Bank)
 */
export const accountTransactions = mysqlTable("account_transactions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  type: mysqlEnum("type", ["comissao", "saque", "ajuste", "bonus"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  relatedPaymentId: int("relatedPaymentId"), // Referência ao pagamento que gerou a transação
  relatedCommissionId: int("relatedCommissionId"), // Referência à comissão
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccountTransaction = typeof accountTransactions.$inferSelect;
export type InsertAccountTransaction = typeof accountTransactions.$inferInsert;
