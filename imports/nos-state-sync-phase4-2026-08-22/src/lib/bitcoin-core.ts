import axios from 'axios';

/**
 * NEXUS BITCOIN CORE INTERFACE (V20.5)
 * Execução exclusiva em servidor para ocultar URL RPC e credenciais.
 * Interface para comandos de baixo nível e auditoria de UTXOs.
 * ERRADICAÇÃO DE SIMULAÇÕES: EXIGE CONEXÃO REAL.
 */

const RPC_URL = process.env.BTC_RPC_URL || 'http://localhost:8332';

export class BitcoinCore {
  /**
   * Executa um comando RPC no nó soberano.
   */
  static async call(method: string, params: any[] = []) {
    try {
      const response = await axios.post(
        RPC_URL,
        {
          jsonrpc: '1.0',
          id: `nexus-rpc-${Date.now()}`,
          method,
          params,
        },
        {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 30000
        }
      );

      return { success: true, result: response.data.result };
    } catch (error: any) {
      console.error(`[BITCOIN_CORE] RPC Error (${method}):`, error.message);
      // Erro Fatal: Se o nó real falhar, o sistema interrompe a execução.
      throw new Error(`XON::rpc_failure [critical] :: O nó físico não respondeu ao comando ${method}. Verifique o túnel rRPC.`);
    }
  }

  static async getBlockCount() {
    return this.call('getblockcount');
  }

  static async getRawTransaction(txid: string) {
    return this.call('getrawtransaction', [txid, true]);
  }

  static async getWalletInfo() {
    return this.call('getwalletinfo');
  }

  /**
   * PROTOCOLO RESCAN: Reconstrói o banco de dados de UTXOs.
   */
  static async rescanBlockchain(startHeight: number = 0) {
    return this.call('rescanblockchain', [startHeight]);
  }
}
