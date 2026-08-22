import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate commission for a sale based on affiliate network
 * Implements Unilevel structure: 10% (direct), 5% (level 2), 2.5% (level 3), 2.5% (level 4+)
 */
async function calculateAndCreateCommissions(saleId: number) {
  const sale = await db.getSaleById(saleId);
  if (!sale) throw new Error("Sale not found");

  const baseAmount = typeof sale.amount === 'string' ? parseFloat(sale.amount) : sale.amount;
  const commissionRates = [
    { level: 1, rate: 10 },
    { level: 2, rate: 5 },
    { level: 3, rate: 2.5 },
    { level: 4, rate: 2.5 },
  ];

  let currentAffiliateId = sale.affiliateId;

  for (const { level, rate } of commissionRates) {
    // Get the referrer at this level
    const network = await db.getAffiliateNetwork(currentAffiliateId);
    if (!network || network.length === 0) break;

    const referrer = network[0];
    currentAffiliateId = referrer.referrerId;

    const commissionAmount = (baseAmount * rate) / 100;

    // Create commission record
    await db.createCommission({
      recipientId: currentAffiliateId,
      saleId,
      affiliateId: sale.affiliateId,
      commissionType:
        level === 1
          ? "direct"
          : level === 2
            ? "level2"
            : level === 3
              ? "level3"
              : "level4",
      commissionRate: rate.toString(),
      baseAmount: baseAmount.toString(),
      commissionAmount: commissionAmount.toString(),
      status: "pending",
    });

    // Update user's team commission balance
    const recipient = await db.getUserById(currentAffiliateId);
    if (recipient) {
      const currentBalance = parseFloat(
        recipient.teamCommissionBalance.toString()
      );
      await db.updateUserBalance(
        currentAffiliateId,
        commissionAmount,
        "add"
      );
    }
  }

  // Mark sale as having commissions calculated
  await db.updateSaleStatus(saleId, "confirmed", new Date());
}

// ============================================================================
// AUTH ROUTER
// ============================================================================

const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});

// ============================================================================
// USER ROUTER
// ============================================================================

const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement profile update
      return { success: true };
    }),

  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return {
      totalBalance: user.totalBalance,
      directSalesCommission: user.directSalesCommission,
      teamCommissionBalance: user.teamCommissionBalance,
    };
  }),

  getCareerInfo: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const careerLevel = await db.getCareerLevel(user.careerLevel);
    return {
      currentLevel: user.careerLevel,
      careerPoints: user.careerPoints,
      levelInfo: careerLevel,
    };
  }),
});

// ============================================================================
// PRODUCT ROUTER
// ============================================================================

const productRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getAllProducts();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await db.getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number().positive(),
        category: z.string().optional(),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.createProduct({
        name: input.name,
        description: input.description,
        price: input.price.toString(),
        category: input.category,
        fileUrl: input.fileUrl,
        createdBy: ctx.user.id,
      });
    }),
});

// ============================================================================
// SALES ROUTER
// ============================================================================

const salesRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number().optional(),
        customerId: z.number().optional(),
        amount: z.number().positive(),
        paymentMethod: z.string().optional(),
        paymentReference: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sale = await db.createSale({
        affiliateId: ctx.user.id,
        productId: input.productId,
        customerId: input.customerId || ctx.user.id,
        amount: input.amount.toString(),
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference,
        status: "pending",
      });

      return sale;
    }),

  getMySales: protectedProcedure.query(async ({ ctx }) => {
    return await db.getSalesByAffiliateId(ctx.user.id);
  }),

  confirmSale: protectedProcedure
    .input(z.object({ saleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const sale = await db.getSaleById(input.saleId);
      if (!sale) throw new TRPCError({ code: "NOT_FOUND" });

      if (sale.affiliateId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Calculate and create commissions
      await calculateAndCreateCommissions(input.saleId);

      // Update affiliate's direct sales commission
      const user = await db.getUserById(ctx.user.id);
      if (user) {
        const currentCommission = parseFloat(
          user.directSalesCommission.toString()
        );
        const saleAmount = typeof sale.amount === 'string' ? parseFloat(sale.amount) : sale.amount;
        const newCommission = currentCommission + saleAmount * 0.1;
        // TODO: Update user's direct sales commission
      }

      return { success: true };
    }),
});

// ============================================================================
// AFFILIATE NETWORK ROUTER
// ============================================================================

const affiliateRouter = router({
  getNetwork: protectedProcedure.query(async ({ ctx }) => {
    return await db.getAffiliateNetwork(ctx.user.id);
  }),

  getDirectReferrals: protectedProcedure.query(async ({ ctx }) => {
    return await db.getDirectReferrals(ctx.user.id);
  }),

  addReferral: protectedProcedure
    .input(z.object({ referredUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await db.createAffiliateRelationship(
        input.referredUserId,
        ctx.user.id
      );
    }),
});

// ============================================================================
// COMMISSION ROUTER
// ============================================================================

const commissionRouter = router({
  getMyCommissions: protectedProcedure.query(async ({ ctx }) => {
    return await db.getCommissionsByRecipientId(ctx.user.id);
  }),

  getSaleCommissions: protectedProcedure
    .input(z.object({ saleId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCommissionsBySaleId(input.saleId);
    }),

  payCommission: protectedProcedure
    .input(z.object({ commissionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.updateCommissionStatus(
        input.commissionId,
        "paid",
        new Date()
      );
    }),
});

// ============================================================================
// CAREER LEVEL ROUTER
// ============================================================================

const careerRouter = router({
  getLevels: publicProcedure.query(async () => {
    return await db.getAllCareerLevels();
  }),

  getLevel: publicProcedure
    .input(z.object({ level: z.number() }))
    .query(async ({ input }) => {
      const careerLevel = await db.getCareerLevel(input.level);
      if (!careerLevel) throw new TRPCError({ code: "NOT_FOUND" });
      return careerLevel;
    }),

  upgradeLevel: protectedProcedure
    .input(z.object({ targetLevel: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const targetLevelInfo = await db.getCareerLevel(input.targetLevel);
      if (!targetLevelInfo) throw new TRPCError({ code: "NOT_FOUND" });

      // Check if user meets requirements
      if (user.careerPoints < targetLevelInfo.pointsRequired) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient career points",
        });
      }

      // TODO: Implement level upgrade logic
      return { success: true };
    }),
});

// ============================================================================
// LOTTERY ROUTER
// ============================================================================

const lotteryRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getActiveLotteries();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const lottery = await db.getLotteryById(input.id);
      if (!lottery) throw new TRPCError({ code: "NOT_FOUND" });
      return lottery;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        drawDate: z.date(),
        totalTickets: z.number().positive(),
        ticketPrice: z.number().positive(),
        prizePool: z.number().positive(),
        salesGoalRequired: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.createLottery({
        name: input.name,
        description: input.description,
        drawDate: input.drawDate,
        totalTickets: input.totalTickets,
        ticketPrice: input.ticketPrice.toString(),
        prizePool: input.prizePool.toString(),
        salesGoalRequired: input.salesGoalRequired?.toString(),
        createdBy: ctx.user.id,
        status: "active",
      });
    }),

  buyTicket: protectedProcedure
    .input(
      z.object({
        lotteryId: z.number(),
        quantity: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lottery = await db.getLotteryById(input.lotteryId);
      if (!lottery) throw new TRPCError({ code: "NOT_FOUND" });

      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // Check balance
      const ticketPrice = typeof lottery.ticketPrice === 'string' ? parseFloat(lottery.ticketPrice) : lottery.ticketPrice;
      const totalCost = ticketPrice * input.quantity;
      const userBalance = parseFloat(user.totalBalance.toString());

      if (userBalance < totalCost) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      // Create tickets
      const tickets = [];
      for (let i = 0; i < input.quantity; i++) {
        const ticketNumber = `${input.lotteryId}-${Date.now()}-${i}`;
        const ticket = await db.createLotteryTicket({
          lotteryId: input.lotteryId,
          ticketNumber,
          ownerId: ctx.user.id,
        });
        tickets.push(ticket);
      }

      // Deduct from user balance
      await db.updateUserBalance(ctx.user.id, totalCost, "subtract");

      return { success: true, ticketCount: input.quantity };
    }),

  getMyTickets: protectedProcedure.query(async ({ ctx }) => {
    return await db.getLotteryTicketsByOwnerId(ctx.user.id);
  }),
});

// ============================================================================
// PAYMENT ROUTER
// ============================================================================

const paymentRouter = router({
  getMyPayments: protectedProcedure.query(async ({ ctx }) => {
    return await db.getPaymentsByUserId(ctx.user.id);
  }),

  requestWithdrawal: protectedProcedure
    .input(z.object({ amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const userBalance = parseFloat(user.totalBalance.toString());
      if (userBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      const payment = await db.createPayment({
        userId: ctx.user.id,
        type: "withdrawal",
        amount: input.amount.toString(),
        status: "pending",
        description: "Withdrawal request",
      });

      return payment;
    }),

  processPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        status: z.enum(["processed", "failed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await db.updatePaymentStatus(
        input.paymentId,
        input.status,
        new Date()
      );
    }),
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  user: userRouter,
  product: productRouter,
  sales: salesRouter,
  affiliate: affiliateRouter,
  commission: commissionRouter,
  career: careerRouter,
  lottery: lotteryRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
