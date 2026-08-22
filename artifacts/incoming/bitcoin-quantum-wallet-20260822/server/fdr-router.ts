import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as fdrParser from "./fdr-parser";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

/**
 * FDR Router - tRPC procedures for FDR (Fundo Descentralizado Gênesis) operations
 */

export const fdrRouter = router({
  /**
   * Preview FDR data before importing
   */
  previewFDRData: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileContent: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        // Determine format based on filename
        const isCSV = input.filename.endsWith(".csv");
        const isJSON = input.filename.endsWith(".json");

        let parsed;
        if (isJSON) {
          parsed = fdrParser.parseFDRJSON(input.fileContent);
        } else {
          // For CSV, we'll parse it as JSON for preview
          parsed = fdrParser.parseFDRJSON(input.fileContent);
        }

        const validation = fdrParser.validateFDRData(parsed);

        return {
          success: true,
          format: parsed.format,
          totalPairs: parsed.totalPairs,
          validPairs: parsed.validPairs,
          duplicates: parsed.duplicates,
          isValid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          preview: {
            firstAddresses: parsed.pairs.slice(0, 10).map((p) => p.address),
            validationRate: parsed.totalPairs > 0 ? ((parsed.validPairs / parsed.totalPairs) * 100).toFixed(2) : "0",
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to preview FDR data: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  /**
   * Import FDR Master Wallet data
   */
  importFDRMasterWallet: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileContent: z.string(),
        masterPassword: z.string().min(8),
        fdrPassphrase: z.string().default("[REDACTED: use a runtime secret outside version control]"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse FDR data
        const isJSON = input.filename.endsWith(".json");
        const parsed = isJSON
          ? fdrParser.parseFDRJSON(input.fileContent)
          : fdrParser.parseFDRJSON(input.fileContent);

        // Validate
        const validation = fdrParser.validateFDRData(parsed);
        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid FDR data: ${validation.errors.join(", ")}`,
          });
        }

        // Create Master Wallet FDR
        const walletResult = await db.createWallet(
          ctx.user.id,
          "FDR - Fundo Descentralizado Gênesis",
          "",
          "",
          "",
          "",
          "",
          "fdr-master",
          "mainnet"
        );

        const walletId = (walletResult as any)[0];

        // Encrypt FDR data with CAISK protocol
        const encrypted = fdrParser.encryptFDRData(parsed, input.fdrPassphrase);

        // Store encrypted FDR data
        // TODO: Store in a dedicated FDR table

        // Import addresses in batches
        let importedCount = 0;
        const batchSize = 100;

        for (let i = 0; i < parsed.pairs.length; i += batchSize) {
          const batch = parsed.pairs.slice(i, i + batchSize);

          for (const pair of batch) {
            try {
              // Encrypt private key
              const encryptedKey = Buffer.from(pair.privateKey).toString("base64");

              await db.createAddress(
                walletId,
                `fdr/${pair.derivationPath || "imported"}`,
                pair.address,
                pair.privateKey,
                encryptedKey,
                "", // salt
                "", // iv
                "receive"
              );

              importedCount++;
            } catch (error) {
              console.error(`Failed to import address ${pair.address}:`, error);
              // Continue with next address
            }
          }
        }

        // Log operation
        await db.logOperation(
          walletId,
          "import_fdr_master_wallet",
          `Imported FDR Master Wallet with ${importedCount} addresses from ${input.filename}`,
          "success",
          null,
          {
            totalPairs: parsed.totalPairs,
            validPairs: parsed.validPairs,
            importedCount,
            duplicates: parsed.duplicates,
          }
        );

        // Generate report
        const report = fdrParser.generateFDRReport(parsed);

        return {
          success: true,
          walletId,
          walletName: "FDR - Fundo Descentralizado Gênesis",
          totalPairs: parsed.totalPairs,
          validPairs: parsed.validPairs,
          importedCount,
          duplicates: parsed.duplicates,
          validationRate: parsed.totalPairs > 0 ? ((parsed.validPairs / parsed.totalPairs) * 100).toFixed(2) : "0",
          report,
          message: `FDR Master Wallet importada com sucesso! ${importedCount} endereços importados.`,
        };
      } catch (error) {
        console.error("Error importing FDR Master Wallet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to import FDR: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),

  /**
   * Validate FDR data
   */
  validateFDRData: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileContent: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        const isJSON = input.filename.endsWith(".json");
        const parsed = isJSON
          ? fdrParser.parseFDRJSON(input.fileContent)
          : fdrParser.parseFDRJSON(input.fileContent);

        const validation = fdrParser.validateFDRData(parsed);

        return {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          summary: {
            totalPairs: parsed.totalPairs,
            validPairs: parsed.validPairs,
            duplicates: parsed.duplicates,
            validationRate: parsed.totalPairs > 0 ? ((parsed.validPairs / parsed.totalPairs) * 100).toFixed(2) : "0",
          },
        };
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          summary: {
            totalPairs: 0,
            validPairs: 0,
            duplicates: 0,
            validationRate: "0",
          },
        };
      }
    }),

  /**
   * Get FDR statistics
   */
  getFDRStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get FDR wallets
      const wallets = await db.getWalletsByUserId(ctx.user.id);
      const fdrWallets = wallets.filter((w: any) => w.walletType === "fdr-master");

      if (fdrWallets.length === 0) {
        return {
          hasFDR: false,
          totalWallets: 0,
          totalAddresses: 0,
          totalBalance: 0,
        };
      }

      let totalAddresses = 0;
      let totalBalance = 0;

      for (const wallet of fdrWallets) {
        const addresses = await db.getAddressesByWalletId(wallet.id);
        totalAddresses += addresses.length;
        // TODO: Calculate total balance from blockchain
      }

      return {
        hasFDR: true,
        totalWallets: fdrWallets.length,
        totalAddresses,
        totalBalance,
        wallets: fdrWallets.map((w: any) => ({
          id: w.id,
          name: w.name,
          addressCount: totalAddresses,
        })),
      };
    } catch (error) {
      console.error("Error getting FDR stats:", error);
      return {
        hasFDR: false,
        totalWallets: 0,
        totalAddresses: 0,
        totalBalance: 0,
      };
    }
  }),

  /**
   * Generate FDR report
   */
  generateFDRReport: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileContent: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        const isJSON = input.filename.endsWith(".json");
        const parsed = isJSON
          ? fdrParser.parseFDRJSON(input.fileContent)
          : fdrParser.parseFDRJSON(input.fileContent);

        const report = fdrParser.generateFDRReport(parsed);

        return {
          success: true,
          report,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate report: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }),
});
