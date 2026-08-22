import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { evaluateMainnetReadiness } from "./mainnetGuardrails";

const FDR_WATCH_ADDRESS = process.env.FDR_WATCH_ADDRESS ?? "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug";
const BLOCKSTREAM_API = "https://blockstream.info/api";

type BitcoinTelemetry = {
  network: "mainnet";
  address: string;
  blockHeight: number | null;
  blockHash: string | null;
  blockTime: string | null;
  confirmedBalanceSats: number | null;
  unconfirmedBalanceSats: number | null;
  confirmedBalanceBtc: number | null;
  unconfirmedBalanceBtc: number | null;
  txCount: number | null;
  provider: string;
  fetchedAt: string;
  explorerUrl: string;
  status: "operacional" | "offline";
  error?: string;
};

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "FDR-watch-only/1.0" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.text()).trim();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "FDR-watch-only/1.0" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}

function offlineBitcoinTelemetry(error: unknown): BitcoinTelemetry {
  return {
    network: "mainnet",
    address: FDR_WATCH_ADDRESS,
    blockHeight: null,
    blockHash: null,
    blockTime: null,
    confirmedBalanceSats: null,
    unconfirmedBalanceSats: null,
    confirmedBalanceBtc: null,
    unconfirmedBalanceBtc: null,
    txCount: null,
    provider: "blockstream.info",
    fetchedAt: new Date().toISOString(),
    explorerUrl: `https://blockstream.info/address/${FDR_WATCH_ADDRESS}`,
    status: "offline",
    error: error instanceof Error ? error.message : "Falha desconhecida na consulta",
  };
}

async function getBitcoinTelemetry(): Promise<BitcoinTelemetry> {
  if (process.env.NODE_ENV === "test" || process.env.FDR_DISABLE_LIVE_TELEMETRY === "true") {
    return offlineBitcoinTelemetry("telemetria externa desativada durante o teste");
  }
  try {
    const [addressData, blockHeightText, blockHash] = await Promise.all([
      fetchJson<{
        chain_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
        mempool_stats: { funded_txo_sum: number; spent_txo_sum: number };
      }>(`${BLOCKSTREAM_API}/address/${FDR_WATCH_ADDRESS}`),
      fetchText(`${BLOCKSTREAM_API}/blocks/tip/height`),
      fetchText(`${BLOCKSTREAM_API}/blocks/tip/hash`),
    ]);
    const block = await fetchJson<{ timestamp: number }>(`${BLOCKSTREAM_API}/block/${blockHash}`);
    const confirmedBalanceSats = addressData.chain_stats.funded_txo_sum - addressData.chain_stats.spent_txo_sum;
    const unconfirmedBalanceSats = addressData.mempool_stats.funded_txo_sum - addressData.mempool_stats.spent_txo_sum;

    return {
      network: "mainnet",
      address: FDR_WATCH_ADDRESS,
      blockHeight: Number(blockHeightText),
      blockHash,
      blockTime: new Date(block.timestamp * 1000).toISOString(),
      confirmedBalanceSats,
      unconfirmedBalanceSats,
      confirmedBalanceBtc: confirmedBalanceSats / 100_000_000,
      unconfirmedBalanceBtc: unconfirmedBalanceSats / 100_000_000,
      txCount: addressData.chain_stats.tx_count,
      provider: "blockstream.info",
      fetchedAt: new Date().toISOString(),
      explorerUrl: `https://blockstream.info/address/${FDR_WATCH_ADDRESS}`,
      status: "operacional",
    };
  } catch (error) {
    return offlineBitcoinTelemetry(error);
  }
}

function emptySnapshot(bitcoin: BitcoinTelemetry) {
  return {
    network: { status: bitcoin.status, blockHeight: bitcoin.blockHeight ?? 0, finality: "N/D", peers: 0 },
    consensus: { tps: 0, energyEfficiency: 0, powShare: 100, posShare: 0, difficulty: 0, epoch: 0 },
    participants: { miners: 0, validators: 0, activeStakers: 0, totalHashrate: "N/D" },
    fees: { collected: 0, burned: 0, contract: 0, miners: 0, validators: 0, development: 0 },
    defi: { tvl: 0, volume24h: 0, ammPairs: 0, averageSlippage: 0, stakingApy: 0, liquidityProviders: 0 },
    simulations: { consensusBlocks: 0, feeTransactions: 0, defiSwaps: 0, consensusSuccess: 0, feeSuccess: 0, defiSuccess: 0 },
    bitcoin,
    updatedAt: new Date().toISOString(),
  };
}

async function getMinervaSnapshot() {
  const bitcoin = await getBitcoinTelemetry();
  return emptySnapshot(bitcoin);
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
    snapshot: publicProcedure.query(async () => getMinervaSnapshot()),
    runSimulation: publicProcedure.input((value: unknown) => {
      if (!value || typeof value !== "object" || !("kind" in value)) throw new Error("Simulation kind is required");
      const kind = (value as { kind: string }).kind;
      if (!["consensus", "fees", "defi"].includes(kind)) throw new Error("Unsupported simulation kind");
      return { kind } as { kind: "consensus" | "fees" | "defi" };
    }).mutation(({ input }) => {
      const results = {
        consensus: { title: "CONSENSUS_001 indisponível", summary: "Os cenários simulados foram desativados no modo de telemetria real.", value: "READ-ONLY" },
        fees: { title: "FEES_002 indisponível", summary: "Os cenários simulados foram desativados no modo de telemetria real.", value: "READ-ONLY" },
        defi: { title: "DEFI_003 indisponível", summary: "Os cenários simulados foram desativados no modo de telemetria real.", value: "READ-ONLY" },
      } as const;
      return results[input.kind];
    }),
  }),
});

export type AppRouter = typeof appRouter;
