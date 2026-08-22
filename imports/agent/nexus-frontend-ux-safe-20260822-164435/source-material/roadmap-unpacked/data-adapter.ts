import axios, { AxiosInstance } from "axios";
import { saveMarketData } from "./db-helpers";
import { InsertMarketData } from "../drizzle/schema";

/**
 * Data Adapter - Normaliza dados de múltiplas fontes de mercado
 * Suporta: CoinGecko, Binance, e preparação para Chainlink Oracles
 */

export interface MarketPrice {
  symbol: string;
  price: number; // Em centavos (ex: 1 BTC = 4500000 centavos = $45,000)
  volume24h?: number;
  marketCap?: number;
  priceChange24h?: number; // Em centavos
  volatility?: number; // Em pontos base (1 = 0.01%)
  timestamp: Date;
}

class CoinGeckoAdapter {
  private client: AxiosInstance;
  private baseUrl = "https://api.coingecko.com/api/v3";

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  async getPriceData(coinIds: string[]): Promise<MarketPrice[]> {
    try {
      const response = await this.client.get("/simple/price", {
        params: {
          ids: coinIds.join(","),
          vs_currencies: "usd",
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
        },
      });

      const prices: MarketPrice[] = [];

      for (const [coinId, data] of Object.entries(response.data)) {
        const coinData = data as any;
        const symbol = this.mapCoinIdToSymbol(coinId);

        prices.push({
          symbol,
          price: Math.round(coinData.usd * 100), // Converter para centavos
          volume24h: coinData.usd_24h_vol ? Math.round(coinData.usd_24h_vol * 100) : undefined,
          marketCap: coinData.usd_market_cap ? Math.round(coinData.usd_market_cap * 100) : undefined,
          priceChange24h: coinData.usd_24h_change ? Math.round(coinData.usd_24h_change * 100) : undefined,
          timestamp: new Date(),
        });
      }

      return prices;
    } catch (error) {
      console.error("[CoinGecko] Error fetching price data:", error);
      throw error;
    }
  }

  private mapCoinIdToSymbol(coinId: string): string {
    const mapping: Record<string, string> = {
      bitcoin: "BTC",
      ethereum: "ETH",
      cardano: "ADA",
      solana: "SOL",
      polkadot: "DOT",
      ripple: "XRP",
      litecoin: "LTC",
      "binance-coin": "BNB",
    };
    return mapping[coinId] || coinId.toUpperCase();
  }
}

class BinanceAdapter {
  private client: AxiosInstance;
  private baseUrl = "https://api.binance.com/api/v3";

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  async getPriceData(symbols: string[]): Promise<MarketPrice[]> {
    try {
      const prices: MarketPrice[] = [];

      for (const symbol of symbols) {
        const pair = `${symbol}USDT`;

        // Obter ticker atual
        const tickerResponse = await this.client.get("/ticker/24hr", {
          params: { symbol: pair },
        });

        const ticker = tickerResponse.data;

        prices.push({
          symbol,
          price: Math.round(parseFloat(ticker.lastPrice) * 100),
          volume24h: Math.round(parseFloat(ticker.quoteAssetVolume) * 100),
          priceChange24h: Math.round(parseFloat(ticker.priceChange) * 100),
          volatility: this.calculateVolatility(parseFloat(ticker.highPrice), parseFloat(ticker.lowPrice)),
          timestamp: new Date(),
        });
      }

      return prices;
    } catch (error) {
      console.error("[Binance] Error fetching price data:", error);
      throw error;
    }
  }

  private calculateVolatility(high: number, low: number): number {
    // Volatilidade em pontos base (1 = 0.01%)
    const volatility = ((high - low) / low) * 10000;
    return Math.round(volatility);
  }
}

/**
 * Oráculos Chainlink (Preparação para integração futura)
 * Será usado para gatilhos verificáveis on-chain
 */
class ChainlinkOracleAdapter {
  // Placeholder para integração futura com Chainlink Functions
  async getVerifiedData(dataFeedId: string): Promise<any> {
    console.log("[Chainlink] Verified data fetch for:", dataFeedId);
    // Implementação futura
    return null;
  }
}

/**
 * Data Gate - Orquestrador central de dados
 */
export class NexusDataGate {
  private coingecko: CoinGeckoAdapter;
  private binance: BinanceAdapter;
  private chainlink: ChainlinkOracleAdapter;

  constructor() {
    this.coingecko = new CoinGeckoAdapter();
    this.binance = new BinanceAdapter();
    this.chainlink = new ChainlinkOracleAdapter();
  }

  /**
   * Sincronizar dados de mercado de múltiplas fontes
   */
  async syncMarketData(source: "coingecko" | "binance" = "coingecko"): Promise<void> {
    try {
      let prices: MarketPrice[] = [];

      if (source === "coingecko") {
        prices = await this.coingecko.getPriceData([
          "bitcoin",
          "ethereum",
          "cardano",
          "solana",
        ]);
      } else if (source === "binance") {
        prices = await this.binance.getPriceData(["BTC", "ETH", "ADA", "SOL"]);
      }

      // Salvar dados no banco de dados
      for (const price of prices) {
        const data: InsertMarketData = {
          symbol: price.symbol,
          price: price.price,
          volume24h: price.volume24h,
          marketCap: price.marketCap,
          priceChange24h: price.priceChange24h,
          volatility: price.volatility,
          source,
          timestamp: price.timestamp,
        };

        await saveMarketData(data);
      }

      console.log(`[NexusDataGate] Synced ${prices.length} market data points from ${source}`);
    } catch (error) {
      console.error("[NexusDataGate] Sync failed:", error);
      throw error;
    }
  }

  /**
   * Analisar sentimento de mercado baseado em mudanças de preço
   */
  async analyzeMarketSentiment(symbols: string[]): Promise<"bullish" | "neutral" | "bearish"> {
    try {
      const prices = await this.coingecko.getPriceData(
        symbols.map((s) => this.symbolToCoinId(s))
      );

      let bullishCount = 0;
      let bearishCount = 0;

      for (const price of prices) {
        if (price.priceChange24h && price.priceChange24h > 0) {
          bullishCount++;
        } else if (price.priceChange24h && price.priceChange24h < 0) {
          bearishCount++;
        }
      }

      if (bullishCount > bearishCount) {
        return "bullish";
      } else if (bearishCount > bullishCount) {
        return "bearish";
      } else {
        return "neutral";
      }
    } catch (error) {
      console.error("[NexusDataGate] Sentiment analysis failed:", error);
      return "neutral";
    }
  }

  private symbolToCoinId(symbol: string): string {
    const mapping: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      ADA: "cardano",
      SOL: "solana",
      DOT: "polkadot",
      XRP: "ripple",
      LTC: "litecoin",
      BNB: "binance-coin",
    };
    return mapping[symbol] || symbol.toLowerCase();
  }
}

// Singleton instance
export const nexusDataGate = new NexusDataGate();
