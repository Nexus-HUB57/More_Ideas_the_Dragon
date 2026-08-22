import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as walletParser from "./wallet-parser";
import * as db from "./db";
import * as crypto from "./crypto";
import { TRPCError } from "@trpc/server";

/**
 * Wallet Import Router - tRPC procedures for importing wallets from files
 */

export const walletImportRouter = router({
  /**
   * Parse and preview wallet file before importing
   * Returns parsed data without storing it
   */
  previewWalletFile: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileContent: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        // Parse the wallet file
        const parsed = walletParser.parseWalletFile(input.filename, input.fileContent);

        // Validate the parsed data
        const validation = walletParser.validateParsedWallet(parsed);

        return {
          success: true,
          format: parsed.format,
          addressCount: parsed.addresses.length,
          privateKeyCount: parsed.privateKeys.length,
          hasMnemonic: !!parsed.mnemonic,
          hasXprv: !!parsed.xprv,
          hasXpub: !!parsed.xpub,
          isValid: validation.valid,
          errors: validation.errors,
          preview: {
            addresses: parsed.addresses.slice(0, 5), // Show first 5
            privateKeyCount: parsed.privateKeys.length,
            mnemonic: parsed.mnemonic ? "***" : undefined,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to parse file: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  /**
   * Import wallet from file
   * Stores the wallet and all its addresses in the database
   */
  importWalletFromFile: protectedProcedure
    .input(
      z.object({
        walletName: z.string().min(1).max(255),
        filename: z.string(),
        fileContent: z.string(),
        password: z.string().min(8),
        network: z.enum(["mainnet", "testnet"]).default("mainnet"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse the wallet file
        const parsed = walletParser.parseWalletFile(input.filename, input.fileContent);

        // Validate the parsed data
        const validation = walletParser.validateParsedWallet(parsed);
        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid wallet file: ${validation.errors.join(", ")}`,
          });
        }

        // Determine wallet type based on parsed data
        let walletType = "imported";
        if (parsed.format === "electrum") walletType = "electrum";
        if (parsed.format === "dat") walletType = "bitcoin-core";
        if (parsed.format === "json") walletType = "json";

        // Create wallet in database
        let xprv = parsed.xprv || "";
        let xpub = parsed.xpub || "";

        // If we have a mnemonic, derive the keys
        if (parsed.mnemonic) {
          const seed = crypto.mnemonicToSeed(parsed.mnemonic);
          const rootKey = crypto.generateBIP32RootKey(seed, input.network);
          // Note: In production, properly derive xprv/xpub
          xprv = rootKey.seed ? rootKey.seed.toString("hex") : "";
        }

        // Encrypt mnemonic or seed phrase if available
        let encryptedSeed = "";
        let seedSalt = "";
        let seedIv = "";

        if (parsed.mnemonic) {
          const encrypted = crypto.encryptAES256(parsed.mnemonic, input.password);
          encryptedSeed = encrypted.ciphertext;
          seedSalt = encrypted.salt;
          seedIv = encrypted.iv;
        }

        // Create wallet
        const walletResult = await db.createWallet(
          ctx.user.id,
          input.walletName,
          encryptedSeed,
          seedSalt,
          seedIv,
          xprv,
          xpub,
          walletType,
          input.network
        );

        const walletId = (walletResult as any)[0];

        // Import addresses
        let addressCount = 0;
        for (let i = 0; i < parsed.addresses.length; i++) {
          const address = parsed.addresses[i];
          const privateKey = parsed.privateKeys[i] || "";

          // Encrypt private key if available
          let encryptedPrivateKey = "";
          let privatekeySalt = "";
          let privatekeyIv = "";

          if (privateKey) {
            const encrypted = crypto.encryptAES256(privateKey, input.password);
            encryptedPrivateKey = encrypted.ciphertext;
            privatekeySalt = encrypted.salt;
            privatekeyIv = encrypted.iv;
          }

          try {
            await db.createAddress(
              walletId,
              `imported/${i}`,
              address,
              privateKey,
              encryptedPrivateKey,
              privatekeySalt,
              privatekeyIv,
              "receive"
            );
            addressCount++;
          } catch (error) {
            console.error(`Failed to import address ${address}:`, error);
            // Continue with next address
          }
        }

        // Log operation
        await db.logOperation(
          walletId,
          "import_wallet_from_file",
          `Imported wallet from ${input.filename} with ${addressCount} addresses`,
          "success"
        );

        return {
          success: true,
          walletId,
          walletName: input.walletName,
          format: parsed.format,
          addressCount,
          privateKeyCount: parsed.privateKeys.length,
          message: `Wallet imported successfully with ${addressCount} addresses`,
        };
      } catch (error) {
        console.error("Error importing wallet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to import wallet: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  /**
   * Import wallet from Bitcoin Core wallet.dat
   * Requires special handling due to Berkeley DB format
   */
  importWalletFromDAT: protectedProcedure
    .input(
      z.object({
        walletName: z.string().min(1).max(255),
        fileContent: z.string().base64(),
        password: z.string().min(8),
        walletPassword: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 content
        const buffer = Buffer.from(input.fileContent, "base64");

        // Parse DAT file
        const parsed = walletParser.parseDatWallet(buffer);

        if (parsed.error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: parsed.error,
          });
        }

        // Create wallet
        const walletResult = await db.createWallet(
          ctx.user.id,
          input.walletName,
          "",
          "",
          "",
          "",
          "",
          "bitcoin-core",
          "mainnet"
        );

        const walletId = (walletResult as any)[0];

        // Log operation
        await db.logOperation(
          walletId,
          "import_wallet_from_dat",
          `Imported Bitcoin Core wallet.dat`,
          "success",
          null,
          {
            requiresManualParsing: true,
            hint: "Bitcoin Core wallet.dat requires Berkeley DB library for full parsing",
          }
        );

        return {
          success: true,
          walletId,
          walletName: input.walletName,
          format: "dat",
          message: "Bitcoin Core wallet.dat imported. Manual parsing may be required.",
          warning:
            "Bitcoin Core wallet.dat files require Berkeley DB library for full parsing. Consider exporting your wallet as JSON from Bitcoin Core.",
        };
      } catch (error) {
        console.error("Error importing DAT wallet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to import wallet.dat: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  /**
   * Validate wallet file before import
   */
  validateWalletFile: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileContent: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        const parsed = walletParser.parseWalletFile(input.filename, input.fileContent);
        const validation = walletParser.validateParsedWallet(parsed);

        return {
          valid: validation.valid,
          errors: validation.errors,
          format: parsed.format,
          summary: {
            addresses: parsed.addresses.length,
            privateKeys: parsed.privateKeys.length,
            mnemonic: !!parsed.mnemonic,
            xprv: !!parsed.xprv,
            xpub: !!parsed.xpub,
          },
        };
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : String(error)],
          format: "unknown" as const,
          summary: {
            addresses: 0,
            privateKeys: 0,
            mnemonic: false,
            xprv: false,
            xpub: false,
          },
        };
      }
    }),
});
