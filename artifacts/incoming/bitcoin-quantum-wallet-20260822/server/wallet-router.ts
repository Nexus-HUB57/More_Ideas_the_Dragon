import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as crypto from "./crypto";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

/**
 * Wallet Router - tRPC procedures for Bitcoin wallet operations
 */

export const walletRouter = router({
  /**
   * Generate a new Bitcoin wallet
   * Creates a new BIP39 seed phrase and derives the master key
   */
  generateNewWallet: protectedProcedure
    .input(
      z.object({
        walletName: z.string().min(1).max(255),
        walletType: z.enum(["legacy", "segwit", "taproot"]).default("segwit"),
        network: z.enum(["mainnet", "testnet"]).default("mainnet"),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate new mnemonic
        const mnemonic = crypto.generateMnemonic(12);

        // Convert mnemonic to seed
        const seed = crypto.mnemonicToSeed(mnemonic);

        // Generate BIP32 root key
        const rootKey = crypto.generateBIP32RootKey(seed, input.network);

        // Encrypt seed with password
        const { ciphertext, salt, iv } = crypto.encryptAES256(mnemonic, input.password);

        // Create wallet in database
        const result = await db.createWallet(
          ctx.user.id,
          input.walletName,
          ciphertext,
          salt,
          iv,
          rootKey.seed ? rootKey.seed.toString("hex") : "",
          rootKey.seed ? rootKey.seed.toString("hex") : "",
          input.walletType,
          input.network
        );

        // Log operation
        await db.logOperation(
          (result as any)[0],
          "create_wallet",
          `Created new wallet: ${input.walletName}`,
          "success"
        );

        return {
          success: true,
          walletId: (result as any)[0],
          mnemonic: mnemonic,
          message: "Wallet created successfully. Please save your seed phrase in a safe place.",
        };
      } catch (error) {
        console.error("Error generating wallet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate wallet",
        });
      }
    }),

  /**
   * Import wallet from mnemonic
   */
  importWalletFromMnemonic: protectedProcedure
    .input(
      z.object({
        walletName: z.string().min(1).max(255),
        mnemonic: z.string(),
        password: z.string().min(8),
        walletType: z.enum(["legacy", "segwit", "taproot"]).default("segwit"),
        network: z.enum(["mainnet", "testnet"]).default("mainnet"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate mnemonic
        if (!crypto.validateMnemonic(input.mnemonic)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid mnemonic phrase",
          });
        }

        // Convert mnemonic to seed
        const seed = crypto.mnemonicToSeed(input.mnemonic);

        // Generate BIP32 root key
        const rootKey = crypto.generateBIP32RootKey(seed, input.network);

        // Encrypt seed with password
        const { ciphertext, salt, iv } = crypto.encryptAES256(input.mnemonic, input.password);

        // Create wallet in database
        const result = await db.createWallet(
          ctx.user.id,
          input.walletName,
          ciphertext,
          salt,
          iv,
          rootKey.seed ? rootKey.seed.toString("hex") : "",
          rootKey.seed ? rootKey.seed.toString("hex") : "",
          input.walletType,
          input.network
        );

        // Log operation
        await db.logOperation(
          (result as any)[0],
          "import_wallet",
          `Imported wallet: ${input.walletName}`,
          "success"
        );

        return {
          success: true,
          walletId: (result as any)[0],
          message: "Wallet imported successfully",
        };
      } catch (error) {
        console.error("Error importing wallet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to import wallet",
        });
      }
    }),

  /**
   * Get all wallets for the current user
   */
  getMyWallets: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userWallets = await db.getWalletsByUserId(ctx.user.id);
      return userWallets;
    } catch (error) {
      console.error("Error fetching wallets:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch wallets",
      });
    }
  }),

  /**
   * Get wallet details by ID
   */
  getWallet: protectedProcedure
    .input(z.object({ walletId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const wallet = await db.getWalletById(input.walletId);

        if (!wallet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Wallet not found",
          });
        }

        // Verify ownership
        if (wallet.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this wallet",
          });
        }

        return wallet;
      } catch (error) {
        console.error("Error fetching wallet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch wallet",
        });
      }
    }),

  /**
   * Validate a Bitcoin address
   */
  validateAddress: publicProcedure
    .input(
      z.object({
        address: z.string(),
        network: z.enum(["mainnet", "testnet"]).default("mainnet"),
      })
    )
    .query(({ input }) => {
      const isValid = crypto.validateAddress(input.address, input.network);
      return {
        address: input.address,
        isValid: isValid,
      };
    }),

  /**
   * Generate a new address for a wallet
   */
  generateAddress: protectedProcedure
    .input(
      z.object({
        walletId: z.number(),
        addressIndex: z.number().default(0),
        addressType: z.enum(["receive", "change"]).default("receive"),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get wallet
        const wallet = await db.getWalletById(input.walletId);

        if (!wallet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Wallet not found",
          });
        }

        // Verify ownership
        if (wallet.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this wallet",
          });
        }

        // Decrypt seed
        let mnemonic: string;
        try {
          mnemonic = crypto.decryptAES256(wallet.encryptedSeed, input.password, wallet.seedSalt, wallet.seedIv);
        } catch {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid password",
          });
        }

        // Validate mnemonic
        if (!crypto.validateMnemonic(mnemonic)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stored mnemonic is invalid",
          });
        }

        // Derive address using BIP44 path
        // Path: m/44'/0'/0'/change/index
        const changeType = input.addressType === "change" ? 1 : 0;
        const derivationPath = `m/44'/0'/0'/${changeType}/${input.addressIndex}`;

        // Generate address (placeholder implementation)
        const address = `bc1q${crypto.sha256(derivationPath).slice(0, 32)}`;

        // Encrypt private key
        const privateKey = crypto.sha256(derivationPath);
        const { ciphertext, salt, iv } = crypto.encryptAES256(privateKey, input.password);

        // Create address in database
        await db.createAddress(
          input.walletId,
          derivationPath,
          address,
          privateKey,
          ciphertext,
          salt,
          iv,
          input.addressType
        );

        // Log operation
        await db.logOperation(
          input.walletId,
          "generate_address",
          `Generated new ${input.addressType} address: ${address}`,
          "success"
        );

        return {
          success: true,
          address: address,
          derivationPath: derivationPath,
          message: "Address generated successfully",
        };
      } catch (error) {
        console.error("Error generating address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate address",
        });
      }
    }),

  /**
   * Get all addresses for a wallet
   */
  getAddresses: protectedProcedure
    .input(z.object({ walletId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify wallet ownership
        const wallet = await db.getWalletById(input.walletId);

        if (!wallet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Wallet not found",
          });
        }

        if (wallet.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this wallet",
          });
        }

        // Get addresses
        const addresses = await db.getAddressesByWalletId(input.walletId);
        return addresses;
      } catch (error) {
        console.error("Error fetching addresses:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch addresses",
        });
      }
    }),

  /**
   * Get transaction history for a wallet
   */
  getTransactionHistory: protectedProcedure
    .input(z.object({ walletId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify wallet ownership
        const wallet = await db.getWalletById(input.walletId);

        if (!wallet) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Wallet not found",
          });
        }

        if (wallet.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this wallet",
          });
        }

        // Get transactions
        const transactions = await db.getTransactionsByWalletId(input.walletId);
        return transactions;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch transactions",
        });
      }
    }),
});
