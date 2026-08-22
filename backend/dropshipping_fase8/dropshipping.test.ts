import { describe, it, expect, beforeEach, vi } from "vitest";
import { dropshippingRouter } from "./dropshippingRouter";
import { TRPCError } from "@trpc/server";
import { products, affiliates, users, orders, commissions } from "./schema-final";

// Mock do banco de dados e suas funções
const mockProducts = [
  { id: 1, externalId: "prod-1", marketplace: "MercadoLivre", title: "Produto Teste", description: "Descrição", price: 10000, commissionPercentage: 10, category: "Eletrônicos", imageUrl: "url", url: "url", trending: 1, syncedAt: new Date(), updatedAt: new Date() },
];

const mockAffiliates = [
  { id: 1, userId: 2, affiliateCode: "AFF2", sponsorId: null, commissionPercentage: 15, status: "active", totalCommissions: 0, pendingCommissions: 0, createdAt: new Date(), updatedAt: new Date() },
];

const mockUsers = [
  { id: 1, openId: "admin-123", name: "Admin User", email: "admin@example.com", role: "admin", lastSignedIn: new Date(), loginMethod: "oauth", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, openId: "affiliate-123", name: "Affiliate User", email: "affiliate@example.com", role: "user", lastSignedIn: new Date(), loginMethod: "oauth", createdAt: new Date(), updatedAt: new Date() },
  { id: 3, openId: "customer-123", name: "Customer User", email: "cliente@teste.com", role: "user", lastSignedIn: new Date(), loginMethod: "oauth", createdAt: new Date(), updatedAt: new Date() },
];

let mockOrders: any[] = [];
let mockCommissions: any[] = [];
let mockNotifications: any[] = [];

const mockDb = {
  select: vi.fn(() => mockDb), // Retorna o próprio mockDb para encadeamento
  from: vi.fn(() => mockDb),
  where: vi.fn(() => mockDb),
  limit: vi.fn(() => mockDb),
  orderBy: vi.fn(() => mockDb),
  insert: vi.fn((table) => {
    return {
      values: vi.fn((values) => {
        if (table === orders) {
          const newOrder = { id: mockOrders.length + 1, ...values };
          mockOrders.push(newOrder);
          return { insertId: newOrder.id };
        }
        if (table === commissions) {
          const newCommission = { id: mockCommissions.length + 1, ...values };
          mockCommissions.push(newCommission);
          return { insertId: newCommission.id };
        }
        if (table === notifications) {
          const newNotification = { id: mockNotifications.length + 1, ...values };
          mockNotifications.push(newNotification);
          return { insertId: newNotification.id };
        }
        return { insertId: 1 };
      })
    };
  }),
  values: vi.fn(() => mockDb),
  onDuplicateKeyUpdate: vi.fn(() => mockDb),
  update: vi.fn(() => mockDb),
  set: vi.fn(() => mockDb),
};

// Mock das funções de db.ts
vi.mock("./db", async (importOriginal) => {
  return {
    getDb: vi.fn(async () => mockDb),
    createNotification: vi.fn(async (data) => {
      mockNotifications.push({ id: mockNotifications.length + 1, ...data, createdAt: new Date() });
    }),
    getAffiliateByUserId: vi.fn(async (userId) => mockAffiliates.find(a => a.userId === userId)),
    getUserByEmail: vi.fn(async (email) => mockUsers.find(u => u.email === email)),
  };
});

// Mock das funções de commissions.ts
vi.mock("./commissions", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    calculateConsumptionCommission: vi.fn(async (affiliateId, salesAmount) => {
      const affiliate = mockAffiliates.find(a => a.id === affiliateId);
      if (!affiliate) return null;
      const commissionAmount = Math.floor((salesAmount * affiliate.commissionPercentage) / 100);
      const newCommission = { id: mockCommissions.length + 1, affiliateId, amount: commissionAmount, level: 0, source: "order", status: "pending", createdAt: new Date(), updatedAt: new Date() };
      mockCommissions.push(newCommission);
      return newCommission;
    }),
    confirmCommissions: vi.fn(async (commissionIds) => {
      commissionIds.forEach(id => {
        const commission = mockCommissions.find(c => c.id === id);
        if (commission) commission.status = "confirmed";
      });
    }),
    updateAffiliateCommissionTotals: vi.fn(async (affiliateId) => {
      const affiliate = mockAffiliates.find(a => a.id === affiliateId);
      if (affiliate) {
        affiliate.totalCommissions = mockCommissions.filter(c => c.affiliateId === affiliateId && c.status === "confirmed").reduce((sum, c) => sum + c.amount, 0);
        affiliate.pendingCommissions = mockCommissions.filter(c => c.affiliateId === affiliateId && c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
      }
    }),
  };
});

// Mock context para admin
const adminContext: any = {
  user: mockUsers[0],
  req: {} as any,
  res: {} as any,
};

// Mock context para afiliado
const affiliateContext: any = {
  user: mockUsers[1],
  req: {} as any,
  res: {} as any,
};

describe("Dropshipping Router - Fase 8", () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    mockOrders = [];
    mockCommissions = [];
    mockNotifications = [];

    mockDb.select.mockClear();
    mockDb.from.mockClear();
    mockDb.where.mockClear();
    mockDb.limit.mockClear();
    mockDb.orderBy.mockClear();
    mockDb.insert.mockClear();
    mockDb.values.mockClear();
    mockDb.onDuplicateKeyUpdate.mockClear();
    mockDb.update.mockClear();
    mockDb.set.mockClear();

    // Configurar mocks para o comportamento esperado
    mockDb.select.mockImplementation(() => ({
      from: vi.fn((table) => ({
        where: vi.fn((condition) => ({
          limit: vi.fn((n) => {
            // Se for busca de produto
            if (table === products) {
              if (mockProducts.length > 0 && (condition as any)?.right?.value === 1) return [mockProducts[0]];
              return [];
            }
            // Se for busca de pedido
            if (table === orders) {
              if (mockOrders.length > 0 && (condition as any)?.right?.value === 1) return [mockOrders[0]];
              return [];
            }
            if (table === affiliates) return mockAffiliates;
            if (table === users) return mockUsers;
            return [];
          })
        }))
      }))
    }));

    mockDb.update.mockImplementation((table) => ({
      set: vi.fn((updateData) => ({
        where: vi.fn((condition) => {
          if (table === orders && mockOrders.length > 0) {
            Object.assign(mockOrders[0], updateData);
          }
        })
      }))
    }));
  });

  describe("registerOrder", () => {
    it("deve registrar um novo pedido de dropshipping com dados válidos", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      const result = await caller.registerOrder({
        productId: 1,
        customerName: "Cliente Teste",
        customerEmail: "cliente@teste.com",
        shippingAddress: "Rua Teste, 123, São Paulo - SP",
        quantity: 2,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.customerName).toBe("Cliente Teste");
      expect(result.status).toBe("pending");
      expect(result.externalOrderId).toContain("DROPSHIP-");
      expect(mockOrders.length).toBe(1);
      expect(mockNotifications.length).toBe(2); // Notificação para fornecedor e cliente
    });

    it("deve rejeitar pedido sem nome do cliente", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      await expect(
        caller.registerOrder({
          productId: 1,
          customerName: "",
          customerEmail: "cliente@teste.com",
          shippingAddress: "Endereço",
          quantity: 1,
        })
      ).rejects.toThrow(TRPCError);
    });

    it("deve rejeitar pedido com email inválido", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      await expect(
        caller.registerOrder({
          productId: 1,
          customerName: "Cliente",
          customerEmail: "email-invalido",
          shippingAddress: "Endereço",
          quantity: 1,
        })
      ).rejects.toThrow(TRPCError);
    });

    it("deve rejeitar pedido com produto não encontrado", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      await expect(
        caller.registerOrder({
          productId: 999, // Produto inexistente
          customerName: "Cliente Teste",
          customerEmail: "cliente@teste.com",
          shippingAddress: "Rua Teste, 123, São Paulo - SP",
          quantity: 1,
        })
      ).rejects.toThrow(TRPCError);
    });

    it("deve rejeitar pedido se afiliado não encontrado para usuário logado", async () => {
      const caller = dropshippingRouter.createCaller({ user: { id: 999, openId: "no-aff", name: "No Affiliate", email: "no@aff.com", role: "user" } });

      await expect(
        caller.registerOrder({
          productId: 1,
          customerName: "Cliente Teste",
          customerEmail: "cliente@teste.com",
          shippingAddress: "Rua Teste, 123, São Paulo - SP",
          quantity: 1,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("updateOrderStatus", () => {
    beforeEach(() => {
      // Pré-popular um pedido para os testes de atualização
      mockOrders.push({
        id: 1,
        affiliateId: 1,
        productId: 1,
        externalOrderId: "DROPSHIP-TEST-1",
        marketplace: "MercadoLivre",
        amount: 10000,
        commissionAmount: 1000,
        status: "pending",
        customerName: "Cliente Teste",
        customerEmail: "cliente@teste.com",
        shippingAddress: "Rua Teste, 123, São Paulo - SP",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it("deve atualizar o status de um pedido para 'shipped'", async () => {
      const caller = dropshippingRouter.createCaller(adminContext);

      const result = await caller.updateOrderStatus({
        orderId: 1,
        newStatus: "shipped",
      });

      expect(result.success).toBe(true);
      expect(mockOrders[0].status).toBe("shipped");
      expect(mockNotifications.length).toBe(1); // Notificação para o cliente/afiliado
    });

    it("deve atualizar o status para 'delivered' e disparar comissionamento", async () => {
      const caller = dropshippingRouter.createCaller(adminContext);

      const result = await caller.updateOrderStatus({
        orderId: 1,
        newStatus: "delivered",
      });

      expect(result.success).toBe(true);
      expect(mockOrders[0].status).toBe("delivered");
      expect(mockCommissions.length).toBe(1);
      expect(mockCommissions[0].status).toBe("confirmed");
      expect(mockAffiliates[0].totalCommissions).toBe(mockCommissions[0].amount);
      expect(mockNotifications.length).toBe(2); // Notificação de status e de comissão
    });

    it("deve rejeitar atualização por usuário não admin", async () => {
      const caller = dropshippingRouter.createCaller(affiliateContext);

      await expect(
        caller.updateOrderStatus({
          orderId: 1,
          newStatus: "shipped",
        })
      ).rejects.toThrow(TRPCError);
    });

    it("deve rejeitar atualização para pedido não encontrado", async () => {
      const caller = dropshippingRouter.createCaller(adminContext);

      await expect(
        caller.updateOrderStatus({
          orderId: 999, // Pedido inexistente
          newStatus: "shipped",
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("Fluxo completo de Dropshipping", () => {
    it("deve executar fluxo: registrar pedido -> atualizar para enviado -> atualizar para entregue", async () => {
      const affiliateCaller = dropshippingRouter.createCaller(affiliateContext);
      const adminCaller = dropshippingRouter.createCaller(adminContext);

      // 1. Registrar pedido
      const order = await affiliateCaller.registerOrder({
        productId: 1,
        customerName: "João Silva",
        customerEmail: "joao@exemplo.com",
        shippingAddress: "Av. Paulista, 1000, São Paulo - SP",
        quantity: 1,
      });

      expect(order.status).toBe("pending");
      expect(mockOrders.length).toBe(1);
      expect(mockNotifications.length).toBe(2);

      // 2. Atualizar para enviado
      const shipped = await adminCaller.updateOrderStatus({
        orderId: order.id,
        newStatus: "shipped",
      });

      expect(shipped.success).toBe(true);
      expect(mockOrders[0].status).toBe("shipped");
      expect(mockNotifications.length).toBe(3); // +1 notificação de status

      // 3. Atualizar para entregue (gatilho de comissão)
      const delivered = await adminCaller.updateOrderStatus({
        orderId: order.id,
        newStatus: "delivered",
      });

      expect(delivered.success).toBe(true);
      expect(mockOrders[0].status).toBe("delivered");
      expect(mockCommissions.length).toBe(1);
      expect(mockCommissions[0].status).toBe("confirmed");
      expect(mockAffiliates[0].totalCommissions).toBe(mockCommissions[0].amount);
      expect(mockNotifications.length).toBe(5); // +1 notificação de status, +1 notificação de comissão
    });
  });
});
