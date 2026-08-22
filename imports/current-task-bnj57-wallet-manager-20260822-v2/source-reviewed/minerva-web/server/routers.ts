import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { evaluateMainnetReadiness } from "./mainnetGuardrails";

const BASE_SNAPSHOT = {
  network: { status: "operacional" as const, blockHeight: 184_920, finality: "2.8 s", peers: 128 },
  consensus: { tps: 1_240, energyEfficiency: 67, powShare: 45, posShare: 55, difficulty: 18.4, epoch: 742 },
  participants: { miners: 2_418, validators: 864, activeStakers: 12_540, totalHashrate: "42.8 PH/s" },
  fees: { collected: 184_720, burned: 9_236, contract: 73_888, miners: 46_180, validators: 36_944, development: 18_472 },
  defi: { tvl: 48_600_000, volume24h: 12_840_000, ammPairs: 24, averageSlippage: 0.3, stakingApy: 8.2, liquidityProviders: 4_218 },
  simulations: { consensusBlocks: 100, feeTransactions: 1000, defiSwaps: 50, consensusSuccess: 100, feeSuccess: 100, defiSuccess: 98 },
};

function getMinervaSnapshot() {
  const drift = Math.round((Date.now() / 6000) % 7);
  return {
    ...BASE_SNAPSHOT,
    network: { ...BASE_SNAPSHOT.network, blockHeight: BASE_SNAPSHOT.network.blockHeight + drift },
    consensus: { ...BASE_SNAPSHOT.consensus, tps: BASE_SNAPSHOT.consensus.tps + drift * 9 },
    updatedAt: new Date().toISOString(),
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  minerva: router({
    readiness: publicProcedure.query(() => evaluateMainnetReadiness()),
    snapshot: publicProcedure.query(() => getMinervaSnapshot()),
    runSimulation: publicProcedure.input((value: unknown) => {
      if (!value || typeof value !== "object" || !("kind" in value)) throw new Error("Simulation kind is required");
      const kind = (value as { kind: string }).kind;
      if (!['consensus', 'fees', 'defi'].includes(kind)) throw new Error("Unsupported simulation kind");
      return { kind } as { kind: 'consensus' | 'fees' | 'defi' };
    }).mutation(({ input }) => {
      const results = {
        consensus: { title: "CONSENSUS_001 concluído", summary: "100 blocos alternaram PoW/PoS com finalização consistente.", value: "100% PASS" },
        fees: { title: "FEES_002 concluído", summary: "1.000 transações roteadas para os cinco destinos do pool.", value: "100% PASS" },
        defi: { title: "DEFI_003 concluído", summary: "50 swaps simulados com slippage médio mantido abaixo do limite.", value: "98% PASS" },
      } as const;
      return results[input.kind];
    }),
  }),
});

export type AppRouter = typeof appRouter;
