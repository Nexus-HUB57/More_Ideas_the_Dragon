import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import {
  createFundingRequest,
  listFundingRequests,
  approveFundingRequest,
  rejectFundingRequest,
  allocateFunding,
  updateFundingAllocationTransaction,
  createBitcoinWallet,
  getBitcoinWallet,
  getActiveBitcoinWallet,
  recordBitcoinTransaction,
} from "../db";
import { notifyOwner } from "../_core/notification";

export const fundingRouter = router({
  // Request funding (user)
  requestFunds: protectedProcedure
    .input(
      z.object({
        startupId: z.number(),
        requestedAmount: z.number().positive(),
        purpose: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createFundingRequest({
        startupId: input.startupId,
        requestedAmount: input.requestedAmount,
        purpose: input.purpose,
      });

      // Notify owner/admin about new funding request
      await notifyOwner({
        title: "New Funding Request",
        content: `Startup ${input.startupId} requested ${input.requestedAmount} BTC for: ${input.purpose}`,
      });

      return result;
    }),

  // List funding requests
  listRequests: adminProcedure
    .input(
      z.object({
        status: z
          .enum(["pending", "approved", "rejected", "allocated"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      return listFundingRequests(input.status);
    }),

  // Approve funding (admin/Nexus Prime)
  approveFunding: adminProcedure
    .input(
      z.object({
        requestId: z.number(),
        approvedAmount: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await approveFundingRequest(
        input.requestId,
        input.approvedAmount,
        ctx.user!.id
      );

      // Notify startup leader about approval
      await notifyOwner({
        title: "Funding Request Approved",
        content: `Your funding request #${input.requestId} has been approved for ${input.approvedAmount} BTC`,
      });

      return result;
    }),

  // Reject funding (admin/Nexus Prime)
  rejectFunding: adminProcedure
    .input(
      z.object({
        requestId: z.number(),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const result = await rejectFundingRequest(input.requestId, input.reason);

      // Notify startup leader about rejection
      await notifyOwner({
        title: "Funding Request Rejected",
        content: `Your funding request #${input.requestId} has been rejected. Reason: ${input.reason}`,
      });

      return result;
    }),

  // Allocate funds to Bitcoin address
  allocateFunds: adminProcedure
    .input(
      z.object({
        fundingRequestId: z.number(),
        startupId: z.number(),
        allocatedAmount: z.number().positive(),
        bitcoinAddress: z.string().min(26),
      })
    )
    .mutation(async ({ input }) => {
      return allocateFunding({
        fundingRequestId: input.fundingRequestId,
        startupId: input.startupId,
        allocatedAmount: input.allocatedAmount,
        bitcoinAddress: input.bitcoinAddress,
      });
    }),

  // Broadcast Bitcoin transaction
  broadcastTransaction: adminProcedure
    .input(
      z.object({
        allocationId: z.number(),
        transactionHash: z.string().min(1),
        transactionHex: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return updateFundingAllocationTransaction(
        input.allocationId,
        input.transactionHash,
        input.transactionHex
      );
    }),

  // Bitcoin Wallet Management
  createWallet: adminProcedure
    .input(
      z.object({
        walletName: z.string().min(1),
        publicAddress: z.string().min(26),
        masterKeyEncrypted: z.string().min(1),
        network: z.enum(["mainnet", "testnet"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createBitcoinWallet({
        walletName: input.walletName,
        publicAddress: input.publicAddress,
        masterKeyEncrypted: input.masterKeyEncrypted,
        network: input.network,
      });
    }),

  getWallet: protectedProcedure
    .input(z.object({ publicAddress: z.string() }))
    .query(async ({ input }) => {
      return getBitcoinWallet(input.publicAddress);
    }),

  getActiveWallet: protectedProcedure.query(async () => {
    return getActiveBitcoinWallet();
  }),

  recordTransaction: adminProcedure
    .input(
      z.object({
        fundingAllocationId: z.number().optional(),
        fromAddress: z.string().min(26),
        toAddress: z.string().min(26),
        amount: z.number().positive(),
        transactionHex: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return recordBitcoinTransaction({
        fundingAllocationId: input.fundingAllocationId,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        amount: input.amount,
        transactionHex: input.transactionHex,
      });
    }),
});
