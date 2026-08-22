import axios from 'axios';

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

export class DataAdapter {
  private coingeckoApiUrl: string = 'https://api.coingecko.com/api/v3';

  constructor() {
    console.log('[DataAdapter] Initialized');
  }

  public async getCryptoPrices(coinIds: string[]): Promise<CryptoPrice[]> {
    try {
      const response = await axios.get(`${this.coingeckoApiUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          order: 'market_cap_desc',
          per_page: coinIds.length,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
      });
      return response.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        current_price: coin.current_price,
        market_cap_rank: coin.market_cap_rank,
        price_change_percentage_24h: coin.price_change_percentage_24h,
      }));
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        console.warn('[DataAdapter] CoinGecko API rate limit hit. Returning mock data for testing.');
        return [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000, market_cap_rank: 1, price_change_percentage_24h: 2.5 },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3500, market_cap_rank: 2, price_change_percentage_24h: -1.2 }
        ];
      }
      console.error('[DataAdapter] Error fetching crypto prices from CoinGecko:', error);
      return [];
    }
  }

  // Outras funções de adaptação de dados podem ser adicionadas aqui no futuro
}

export const dataAdapter = new DataAdapter();
