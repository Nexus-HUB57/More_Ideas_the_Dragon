import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock database functions
vi.mock("./db", () => ({
  getAgentByUserId: vi.fn(),
  getCommissionsByUserId: vi.fn(),
  getTotalCommissions: vi.fn(),
  getAffiliateByUserId: vi.fn(),
  getRecentSalesByAffiliateId: vi.fn(),
  getNetworkTree: vi.fn(),
  getProductsByMarketplace: vi.fn(),
  getUserFavorites: vi.fn(),
  toggleFavorite: vi.fn(),
  getNotificationsByUserId: vi.fn(),
  markNotificationAsRead: vi.fn(),
  createWithdrawalRequest: vi.fn(),
  createAgentForUser: vi.fn(),
  updateAgentStrategy: vi.fn(),
}));

function createAuthContext(userId: number = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      affiliateCode: "TEST123",
      referrerCode: null,
      totalCommissions: "1000.00",
      availableBalance: "500.00",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("Dashboard Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return dashboard metrics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getAgentByUserId).mockResolvedValue({
      id: 1,
      userId: 1,
      name: "Agent-1",
      status: "active",
      energy: 100,
      health: 100,
      creativity: 80,
      reputation: 50,
      strategy: "balanced",
      lastActionAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(db.getCommissionsByUserId).mockResolvedValue([]);
    vi.mocked(db.getTotalCommissions).mockResolvedValue("1000.00");
    vi.mocked(db.getAffiliateByUserId).mockResolvedValue({
      id: 1,
      userId: 1,
      parentId: null,
      level: 1,
      commission: "0",
      status: "active",
      joinedAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(db.getRecentSalesByAffiliateId).mockResolvedValue([]);

    const result = await caller.dashboard.getMetrics();

    expect(result).toHaveProperty("totalCommissions");
    expect(result).toHaveProperty("availableBalance");
    expect(result).toHaveProperty("agentStatus");
    expect(result.agentStatus).toBe("active");
  });
});

describe("Agent Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get agent data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mockAgent = {
      id: 1,
      userId: 1,
      name: "Agent-1",
      status: "active",
      energy: 100,
      health: 100,
      creativity: 80,
      reputation: 50,
      strategy: "balanced",
      lastActionAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getAgentByUserId).mockResolvedValue(mockAgent);

    const result = await caller.agent.getAgent();

    expect(result).toEqual(mockAgent);
    expect(result.strategy).toBe("balanced");
  });

  it("should update agent strategy", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mockAgent = {
      id: 1,
      userId: 1,
      name: "Agent-1",
      status: "active",
      energy: 100,
      health: 100,
      creativity: 80,
      reputation: 50,
      strategy: "aggressive",
      lastActionAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getAgentByUserId).mockResolvedValue(mockAgent);
    vi.mocked(db.updateAgentStrategy).mockResolvedValue([mockAgent]);

    const result = await caller.agent.updateAgentStrategy({ strategy: "aggressive" });

    expect(result.strategy).toBe("aggressive");
  });
});

describe("Commissions Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get commissions", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mockCommissions = [
      {
        id: 1,
        userId: 1,
        amount: "100.00",
        type: "direct",
        sourceUserId: 2,
        saleId: 1,
        status: "confirmed",
        period: "2026-05",
        createdAt: new Date(),
        paidAt: null,
      },
    ];

    vi.mocked(db.getCommissionsByUserId).mockResolvedValue(mockCommissions as any);

    const result = await caller.commissions.getCommissions();

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("100.00");
  });

  it("should request withdrawal with valid amount", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.createWithdrawalRequest).mockResolvedValue({} as any);

    const result = await caller.commissions.requestWithdrawal({
      amount: "100.00",
      bankAccount: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("should reject withdrawal with insufficient balance", async () => {
    const ctx = createAuthContext();
    ctx.user.availableBalance = "50.00";
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.commissions.requestWithdrawal({
        amount: "100.00",
        bankAccount: "12345678",
      })
    ).rejects.toThrow("Insufficient balance");
  });
});

describe("Marketplace Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mockProducts = [
      {
        id: 1,
        name: "Product 1",
        description: "Test product",
        price: "99.99",
        marketplace: "amazon",
        imageUrl: "https://example.com/image.jpg",
        commissionRate: "10",
        status: "active",
        createdAt: new Date(),
      },
    ];

    vi.mocked(db.getProductsByMarketplace).mockResolvedValue(mockProducts as any);

    const result = await caller.marketplace.getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Product 1");
  });

  it("should toggle favorite", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.toggleFavorite).mockResolvedValue(true);

    const result = await caller.marketplace.toggleFavorite({ productId: 1 });

    expect(result.isFavorite).toBe(true);
  });
});

describe("Notifications Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get notifications", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mockNotifications = [
      {
        id: 1,
        userId: 1,
        type: "commission",
        title: "New Commission",
        content: "You earned a new commission",
        relatedId: 1,
        isRead: false,
        createdAt: new Date(),
      },
    ];

    vi.mocked(db.getNotificationsByUserId).mockResolvedValue(mockNotifications as any);

    const result = await caller.notifications.getNotifications();

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("commission");
  });

  it("should mark notification as read", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.markNotificationAsRead).mockResolvedValue(true);

    const result = await caller.notifications.markAsRead({ notificationId: 1 });

    expect(result.success).toBe(true);
  });
});
