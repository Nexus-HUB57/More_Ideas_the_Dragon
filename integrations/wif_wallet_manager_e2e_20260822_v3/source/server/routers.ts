import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateWifPair, isValidPrivateKeyHex } from "./wifConverter";
import { saveWifConversion, getUserWifConversions, addWallet, getUserWallets } from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  wif: router({
    generate: protectedProcedure
      .input(
        z.object({
          privateKeyHex: z.string().length(64, "Chave privada deve ter 64 caracteres"),
          network: z.enum(["mainnet", "testnet"]).default("mainnet"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validar formato hexadecimal
        if (!isValidPrivateKeyHex(input.privateKeyHex)) {
          throw new Error("Formato hexadecimal inválido");
        }

        try {
          // Gerar ambas as versões
          const { compressed, uncompressed } = generateWifPair(
            input.privateKeyHex,
            input.network
          );

          // Salvar no banco de dados
          await saveWifConversion(ctx.user.id, {
            privateKeyHex: input.privateKeyHex,
            wifCompressed: compressed,
            wifUncompressed: uncompressed,
            network: input.network,
          });

          return {
            wifCompressed: compressed,
            wifUncompressed: uncompressed,
            network: input.network,
          };
        } catch (error) {
          throw new Error(
            `Erro ao gerar WIF: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      return await getUserWifConversions(ctx.user.id);
    }),
  }),

  wallet: router({
    add: protectedProcedure
      .input(
        z.object({
          address: z.string().min(26, "Endereço Bitcoin inválido"),
          name: z.string().optional(),
          network: z.enum(["mainnet", "testnet"]).default("mainnet"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const wallet = await addWallet(ctx.user.id, {
            address: input.address,
            name: input.name,
            network: input.network,
          });

          if (!wallet) {
            throw new Error("Falha ao adicionar carteira");
          }

          return wallet;
        } catch (error) {
          throw new Error(
            `Erro ao adicionar carteira: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserWallets(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
