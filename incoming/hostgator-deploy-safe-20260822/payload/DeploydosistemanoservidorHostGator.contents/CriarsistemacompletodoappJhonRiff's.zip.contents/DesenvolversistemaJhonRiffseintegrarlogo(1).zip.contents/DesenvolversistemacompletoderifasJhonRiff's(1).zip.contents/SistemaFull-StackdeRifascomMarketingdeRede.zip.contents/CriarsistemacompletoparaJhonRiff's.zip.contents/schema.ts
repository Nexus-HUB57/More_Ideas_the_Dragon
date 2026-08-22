import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

/**
 * Tabela de Afiliados (Membros da Rede)
 * Estende a tabela de usuários com informações específicas de afiliados
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  // Nível de carreira (0-6: Iniciante, Agente, Consultor, Mentor, Executivo, SIN, SGE, Sócio JR)
  careerLevel: int("careerLevel").default(0).notNull(),
  // Pontos acumulados para progressão de carreira
  accumulatedPoints: int("accumulatedPoints").default(0).notNull(),
  // ID do indicador (quem indicou este afiliado)
  sponsorId: int("sponsorId"),
  // Data de inscrição
  enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
  // Status: active, inactive, suspended
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  // Total de comissões acumuladas
  totalCommissions: int("totalCommissions").default(0).notNull(),
  // Saldo disponível para saque
  availableBalance: int("availableBalance").default(0).notNull(),
  // Data da última atualização
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

// Nota: A referência de sponsorId para affiliates.id é auto-referencial
// e será gerenciada manualmente no banco de dados

/**
 * Tabela de Produtos (E-books e Infoprodutos)
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Preço em centavos (para evitar problemas com decimais)
  price: int("price").notNull(),
  // Comissão padrão para afiliados (percentual: 10 = 10%)
  affiliateCommission: int("affiliateCommission").default(10).notNull(),
  // URL do arquivo/produto
  fileUrl: varchar("fileUrl", { length: 512 }),
  // Categoria do produto
  category: varchar("category", { length: 100 }),
  // Status: active, inactive
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  // Criado em
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Tabela de Vendas
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  // Afiliado que realizou a venda
  affiliateId: int("affiliateId").notNull().references(() => affiliates.id),
  // Produto vendido
  productId: int("productId").notNull().references(() => products.id),
  // Valor da venda em centavos
  amount: int("amount").notNull(),
  // Comissão gerada (em centavos)
  commission: int("commission").notNull(),
  // Status: pending, confirmed, cancelled
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  // Data da venda
  saleDate: timestamp("saleDate").defaultNow().notNull(),
  // Data de confirmação
  confirmedAt: timestamp("confirmedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Tabela de Comissões (Histórico de Comissões Unilevel)
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  // Afiliado que recebe a comissão
  affiliateId: int("affiliateId").notNull().references(() => affiliates.id),
  // Venda que gerou a comissão
  saleId: int("saleId").notNull().references(() => sales.id),
  // Nível na rede (1: direto, 2: segundo nível, etc)
  networkLevel: int("networkLevel").notNull(),
  // Valor da comissão em centavos
  amount: int("amount").notNull(),
  // Percentual aplicado
  percentage: int("percentage").notNull(),
  // Status: pending, paid, cancelled
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  // Data de criação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // Data de pagamento
  paidAt: timestamp("paidAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Tabela de Pagamentos
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  // Afiliado que recebe o pagamento
  affiliateId: int("affiliateId").notNull().references(() => affiliates.id),
  // Valor do pagamento em centavos
  amount: int("amount").notNull(),
  // Método de pagamento: bank_transfer, pix, wallet
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  // Status: pending, processing, completed, failed
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  // Referência de transação
  transactionRef: varchar("transactionRef", { length: 255 }),
  // Data de criação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // Data de conclusão
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Tabela de Sorteios (+Sorte)
 */
export const lotteries = mysqlTable("lotteries", {
  id: int("id").autoincrement().primaryKey(),
  // Afiliado participante
  affiliateId: int("affiliateId").notNull().references(() => affiliates.id),
  // Número da sorte (gerado automaticamente)
  luckyNumber: varchar("luckyNumber", { length: 20 }).notNull(),
  // Período/mês do sorteio
  period: varchar("period", { length: 10 }).notNull(),
  // Status: active, drawn, won, expired
  status: mysqlEnum("status", ["active", "drawn", "won", "expired"]).default("active").notNull(),
  // Data de participação
  participationDate: timestamp("participationDate").defaultNow().notNull(),
  // Data do sorteio
  drawDate: timestamp("drawDate"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lottery = typeof lotteries.$inferSelect;
export type InsertLottery = typeof lotteries.$inferInsert;

/**
 * Tabela de Níveis de Carreira
 */
export const careerLevels = mysqlTable("careerLevels", {
  id: int("id").autoincrement().primaryKey(),
  // Nível (0-7)
  level: int("level").notNull().unique(),
  // Título do nível
  title: varchar("title", { length: 100 }).notNull(),
  // Pontos necessários
  requiredPoints: int("requiredPoints").notNull(),
  // Investimento necessário em centavos
  requiredInvestment: int("requiredInvestment").notNull(),
  // Requisito de equipe (quantos diretos necessários)
  teamRequirement: int("teamRequirement").default(0).notNull(),
  // Comissão de diretos (percentual)
  directCommission: int("directCommission").notNull(),
  // Comissão de segundo nível
  secondLevelCommission: int("secondLevelCommission").notNull(),
  // Comissão de terceiro nível
  thirdLevelCommission: int("thirdLevelCommission").notNull(),
  // Comissão de quarto nível (a partir de SIN)
  fourthLevelCommission: int("fourthLevelCommission").default(0).notNull(),
});

export type CareerLevel = typeof careerLevels.$inferSelect;
export type InsertCareerLevel = typeof careerLevels.$inferInsert;

/**
 * Tabela de Auditoria (Log de Ações)
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  // Usuário que realizou a ação
  userId: int("userId").references(() => users.id),
  // Tipo de ação: create, update, delete, payment, commission_calc
  actionType: varchar("actionType", { length: 50 }).notNull(),
  // Entidade afetada: affiliate, sale, commission, payment
  entityType: varchar("entityType", { length: 50 }).notNull(),
  // ID da entidade
  entityId: int("entityId"),
  // Descrição da ação
  description: text("description"),
  // Dados anteriores (JSON)
  previousData: text("previousData"),
  // Dados novos (JSON)
  newData: text("newData"),
  // Data da ação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;