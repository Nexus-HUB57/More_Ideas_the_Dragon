// Serviço para consultar dados reais da mainnet Bitcoin
// Usa Blockstream API como principal e BlockCypher como fallback

class BitcoinApiService {
  constructor() {
    this.blockstreamBaseUrl = 'https://blockstream.info/api';
    this.blockcypherBaseUrl = 'https://api.blockcypher.com/v1/btc/main';
    this.requestTimeout = 10000; // 10 segundos
  }

  // Função auxiliar para fazer requisições com timeout
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Buscar informações de um endereço Bitcoin
  async getAddressInfo(address) {
    try {
      // Tentar primeiro com Blockstream API
      const blockstreamData = await this.fetchWithTimeout(
        `${this.blockstreamBaseUrl}/address/${address}`
      );
      
      return {
        address: address,
        balance: (blockstreamData.chain_stats.funded_txo_sum - blockstreamData.chain_stats.spent_txo_sum) / 100000000, // Converter satoshis para BTC
        totalReceived: blockstreamData.chain_stats.funded_txo_sum / 100000000,
        totalSent: blockstreamData.chain_stats.spent_txo_sum / 100000000,
        transactionCount: blockstreamData.chain_stats.tx_count,
        source: 'blockstream'
      };
    } catch (error) {
      console.warn('Blockstream API falhou, tentando BlockCypher:', error.message);
      
      try {
        // Fallback para BlockCypher API
        const blockcypherData = await this.fetchWithTimeout(
          `${this.blockcypherBaseUrl}/addrs/${address}/balance`
        );
        
        return {
          address: address,
          balance: blockcypherData.balance / 100000000, // Converter satoshis para BTC
          totalReceived: blockcypherData.total_received / 100000000,
          totalSent: blockcypherData.total_sent / 100000000,
          transactionCount: blockcypherData.n_tx,
          source: 'blockcypher'
        };
      } catch (fallbackError) {
        console.error('Ambas as APIs falharam:', fallbackError.message);
        throw new Error('Não foi possível obter dados do endereço de nenhuma API');
      }
    }
  }

  // Buscar informações de múltiplos endereços
  async getMultipleAddressesInfo(addresses) {
    const results = [];
    const errors = [];

    for (const address of addresses) {
      try {
        const addressInfo = await this.getAddressInfo(address);
        results.push(addressInfo);
      } catch (error) {
        errors.push({ address, error: error.message });
      }
    }

    return { results, errors };
  }

  // Buscar informações de uma transação
  async getTransactionInfo(txHash) {
    try {
      // Tentar primeiro com Blockstream API
      const blockstreamData = await this.fetchWithTimeout(
        `${this.blockstreamBaseUrl}/tx/${txHash}`
      );
      
      return {
        hash: blockstreamData.txid,
        blockHeight: blockstreamData.status.block_height,
        blockHash: blockstreamData.status.block_hash,
        confirmed: blockstreamData.status.confirmed,
        confirmations: blockstreamData.status.confirmed ? 
          (await this.getLatestBlockHeight()) - blockstreamData.status.block_height + 1 : 0,
        fee: blockstreamData.fee / 100000000, // Converter satoshis para BTC
        size: blockstreamData.size,
        inputs: blockstreamData.vin.length,
        outputs: blockstreamData.vout.length,
        totalInput: blockstreamData.vin.reduce((sum, input) => sum + (input.prevout?.value || 0), 0) / 100000000,
        totalOutput: blockstreamData.vout.reduce((sum, output) => sum + output.value, 0) / 100000000,
        source: 'blockstream'
      };
    } catch (error) {
      console.warn('Blockstream API falhou, tentando BlockCypher:', error.message);
      
      try {
        // Fallback para BlockCypher API
        const blockcypherData = await this.fetchWithTimeout(
          `${this.blockcypherBaseUrl}/txs/${txHash}`
        );
        
        return {
          hash: blockcypherData.hash,
          blockHeight: blockcypherData.block_height,
          blockHash: blockcypherData.block_hash,
          confirmed: !!blockcypherData.confirmed,
          confirmations: blockcypherData.confirmations || 0,
          fee: blockcypherData.fees / 100000000, // Converter satoshis para BTC
          size: blockcypherData.size,
          inputs: blockcypherData.vin_sz,
          outputs: blockcypherData.vout_sz,
          totalInput: blockcypherData.total / 100000000,
          totalOutput: (blockcypherData.total - blockcypherData.fees) / 100000000,
          source: 'blockcypher'
        };
      } catch (fallbackError) {
        console.error('Ambas as APIs falharam:', fallbackError.message);
        throw new Error('Não foi possível obter dados da transação de nenhuma API');
      }
    }
  }

  // Buscar altura do último bloco
  async getLatestBlockHeight() {
    try {
      // Tentar primeiro com Blockstream API
      const height = await this.fetchWithTimeout(
        `${this.blockstreamBaseUrl}/blocks/tip/height`
      );
      return parseInt(height);
    } catch (error) {
      console.warn('Blockstream API falhou, tentando BlockCypher:', error.message);
      
      try {
        // Fallback para BlockCypher API
        const blockcypherData = await this.fetchWithTimeout(
          `${this.blockcypherBaseUrl}`
        );
        return blockcypherData.height;
      } catch (fallbackError) {
        console.error('Ambas as APIs falharam:', fallbackError.message);
        throw new Error('Não foi possível obter altura do bloco de nenhuma API');
      }
    }
  }

  // Buscar informações do último bloco
  async getLatestBlockInfo() {
    try {
      // Tentar primeiro com Blockstream API
      const hash = await this.fetchWithTimeout(
        `${this.blockstreamBaseUrl}/blocks/tip/hash`
      );
      
      const blockData = await this.fetchWithTimeout(
        `${this.blockstreamBaseUrl}/block/${hash}`
      );
      
      return {
        height: blockData.height,
        hash: blockData.id,
        timestamp: blockData.timestamp,
        transactionCount: blockData.tx_count,
        size: blockData.size,
        weight: blockData.weight,
        source: 'blockstream'
      };
    } catch (error) {
      console.warn('Blockstream API falhou, tentando BlockCypher:', error.message);
      
      try {
        // Fallback para BlockCypher API
        const blockcypherData = await this.fetchWithTimeout(
          `${this.blockcypherBaseUrl}`
        );
        
        return {
          height: blockcypherData.height,
          hash: blockcypherData.hash,
          timestamp: new Date(blockcypherData.time).getTime() / 1000,
          transactionCount: blockcypherData.n_tx,
          size: null, // BlockCypher não fornece size diretamente
          weight: null, // BlockCypher não fornece weight diretamente
          source: 'blockcypher'
        };
      } catch (fallbackError) {
        console.error('Ambas as APIs falharam:', fallbackError.message);
        throw new Error('Não foi possível obter dados do bloco de nenhuma API');
      }
    }
  }

  // Buscar preço atual do Bitcoin (usando uma API de preços)
  async getBitcoinPrice() {
    try {
      const response = await this.fetchWithTimeout(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,brl'
      );
      
      return {
        usd: response.bitcoin.usd,
        brl: response.bitcoin.brl,
        source: 'coingecko'
      };
    } catch (error) {
      console.error('Erro ao buscar preço do Bitcoin:', error.message);
      // Retornar preços padrão em caso de erro
      return {
        usd: 30000,
        brl: 150000,
        source: 'fallback'
      };
    }
  }

  // Validar se um endereço Bitcoin é válido
  isValidBitcoinAddress(address) {
    // Regex básico para endereços Bitcoin (P2PKH, P2SH, Bech32)
    const p2pkhRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const p2shRegex = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
    
    return p2pkhRegex.test(address) || p2shRegex.test(address) || bech32Regex.test(address);
  }
}

// Exportar uma instância única do serviço
export const bitcoinApi = new BitcoinApiService();
export default bitcoinApi;

