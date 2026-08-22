import { describe, it, expect, beforeEach, vi } from "vitest";
import { dropshippingRouter } from "./dropshippingRouter";
import { TRPCError } from "@trpc/server";
import { products, affiliates, users, orders, commissions } from "./schema-final";

// Mock de dados
const mockProduct = { id: 1, price: 10000, commissionPercentage: 10, title: "Produto Teste", marketplace: "MercadoLivre" };
const mockAffiliate = { id: 1, userId: 2, commissionPercentage: 15 };
const mockUser = { id: 2, role: "user" };
const mockAdmin = { id: 1, role: "admin" };

let mockOrders: any[] = [];
let mockCommissions: any[] = [];

// Mock do banco de dados
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockImplementation((table) => ({
    values: vi.fn().mockImplementation((values) => {
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
      return { insertId: 1 };
    })
  })),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

// Mock de db.ts
vi.mock("./db", () => ({
  getDb: vi.fn(async () => mockDb),
  createNotification: vi.fn(async () => {}),
  getAffiliateByUserId: vi.fn(async () => mockAffiliate),
  getUserByEmail: vi.fn(async () => null),
}));

// Mock de commissions.ts
vi.mock("./commissions", () => ({
  calculateConsumptionCommission: vi.fn(async (affiliateId, amount) => {
    const commission = { id: mockCommissions.length + 1, affiliateId, amount: 1000, status: "pending" };
    mockCommissions.push(commission);
    return commission;
  }),
  confirmCommissions: vi.fn(async (ids) => {
    ids.forEach(id => {
      const c = mockCommissions.find(x => x.id === id);
      if (c) c.status = "confirmed";
    });
  }),
  updateAffiliateCommissionTotals: vi.fn(async () => {}),
}));

describe("Dropshipping Router - Fase 8", () => {
  beforeEach(() => {
    mockOrders = [];
    mockCommissions = [];
    vi.clearAllMocks();
    
    // Configurar retorno padrão do select
    mockDb.limit.mockImplementation(() => {
      const lastFrom = mockDb.from.mock.calls[mockDb.from.mock.calls.length - 1][0];
      if (lastFrom === products) {
        const whereCalls = mockDb.where.mock.calls;
        if (whereCalls.length > 0) {
          const lastWhere = whereCalls[whereCalls.length - 1][0];
          if (JSON.stringify(lastWhere).includes("999")) return [];
        }
        return [mockProduct];
      }
      if (lastFrom === orders) return mockOrders.length > 0 ? [mockOrders[0]] : [];
      if (lastFrom === affiliates) return [mockAffiliate];
      return [];
    });

    mockDb.where.mockImplementation(() => {
      const updateCalls = mockDb.update.mock.calls;
      if (updateCalls.length > 0) {
        const lastUpdate = updateCalls[updateCalls.length - 1][0];
        if (lastUpdate === orders) {
          const setCalls = mockDb.set.mock.calls;
          if (setCalls.length > 0) {
            const lastSet = setCalls[setCalls.length - 1][0];
            if (mockOrders[0]) mockOrders[0].status = lastSet.status;
          }
        }
      }
      return Promise.resolve();
    });
  });

  it("deve registrar um novo pedido", async () => {
    const caller = dropshippingRouter.createCaller({ user: mockUser } as any);
    const result = await caller.registerOrder({
      productId: 1,
      customerName: "Teste",
      customerEmail: "teste@exemplo.com",
      shippingAddress: "Endereço",
      quantity: 1
    });
    expect(result.id).toBe(1);
    expect(mockOrders.length).toBe(1);
  });

  it("deve rejeitar produto inexistente", async () => {
    const caller = dropshippingRouter.createCaller({ user: mockUser } as any);
    await expect(caller.registerOrder({
      productId: 999,
      customerName: "Teste",
      customerEmail: "teste@exemplo.com",
      shippingAddress: "Endereço",
      quantity: 1
    })).rejects.toThrow("Produto não encontrado");
  });

  it("deve atualizar status para entregue e gerar comissão", async () => {
    mockOrders.push({ id: 1, affiliateId: 1, amount: 10000, status: "pending", customerEmail: "teste@exemplo.com" });
    const caller = dropshippingRouter.createCaller({ user: mockAdmin } as any);
    
    await caller.updateOrderStatus({ orderId: 1, newStatus: "delivered" });
    expect(mockOrders[0].status).toBe("delivered");
    expect(mockCommissions.length).toBe(1);
    expect(mockCommissions[0].status).toBe("confirmed");
  });
});
