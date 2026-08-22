"""
MÓDULO DE MONITORAMENTO DE CUSTÓDIA
Sistema de monitoramento em tempo real para 31.089,84 BTC
Autor: Manus AI - Organismo Nuclear Satoshi Nakamoto
"""

from flask import Blueprint, jsonify
import requests
import time
from datetime import datetime
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
custody_logger = logging.getLogger('CUSTODY_MONITOR')

custody_bp = Blueprint('custody', __name__)

class CustodyMonitor:
    """
    Monitor de custódia para carteira principal
    Implementa verificações contínuas e alertas
    """

    def __init__(self):
        # Carteira de custódia principal
        self.custody_address = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"

        # Saldo esperado após consolidação
        self.expected_balance = 31089.84355968

        # APIs blockchain
        self.blockstream_api = "https://blockstream.info/api"
        self.blockcypher_api = "https://api.blockcypher.com/v1/btc/main"
        self.blockcypher_token = "b5dc451970ad4fada007af38ae15332f"

        # Cache para otimização
        self.last_check = None
        self.cached_balance = None
        self.cache_duration = 30  # segundos

    def get_balance_blockstream(self):
        """Obter saldo via Blockstream API"""
        try:
            url = f"{self.blockstream_api}/address/{self.custody_address}"
            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                # Saldo = funded - spent (em satoshis)
                balance_satoshis = data['chain_stats']['funded_txo_sum'] - data['chain_stats']['spent_txo_sum']
                balance_btc = balance_satoshis / 100000000  # Converter para BTC

                return {
                    "success": True,
                    "balance_btc": balance_btc,
                    "balance_satoshis": balance_satoshis,
                    "tx_count": data['chain_stats']['tx_count'],
                    "provider": "Blockstream"
                }
            else:
                custody_logger.error(f"Erro Blockstream: {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}

        except Exception as e:
            custody_logger.error(f"Exceção Blockstream: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_balance_blockcypher(self):
        """Obter saldo via BlockCypher API"""
        try:
            url = f"{self.blockcypher_api}/addrs/{self.custody_address}/balance"
            params = {"token": self.blockcypher_token}
            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()
                balance_satoshis = data.get('balance', 0)
                balance_btc = balance_satoshis / 100000000

                return {
                    "success": True,
                    "balance_btc": balance_btc,
                    "balance_satoshis": balance_satoshis,
                    "unconfirmed_balance": data.get('unconfirmed_balance', 0),
                    "n_tx": data.get('n_tx', 0),
                    "provider": "BlockCypher"
                }
            else:
                custody_logger.error(f"Erro BlockCypher: {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}

        except Exception as e:
            custody_logger.error(f"Exceção BlockCypher: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_consolidated_balance(self):
        """
        Obter saldo consolidado de múltiplas fontes
        Implementa validação cruzada para máxima confiabilidade
        """
        try:
            # Verificar cache
            current_time = time.time()
            if (self.last_check and
                current_time - self.last_check < self.cache_duration and
                self.cached_balance):
                return self.cached_balance

            # Obter dados de múltiplas fontes
            blockstream_result = self.get_balance_blockstream()
            blockcypher_result = self.get_balance_blockcypher()

            results = []
            if blockstream_result.get('success'):
                results.append(blockstream_result)
            if blockcypher_result.get('success'):
                results.append(blockcypher_result)

            if not results:
                return {
                    "success": False,
                    "error": "Nenhuma API disponível",
                    "timestamp": datetime.now().isoformat()
                }

            # Validação cruzada
            balances = [r['balance_btc'] for r in results]
            avg_balance = sum(balances) / len(balances)

            # Verificar discrepâncias
            max_discrepancy = max(abs(b - avg_balance) for b in balances)
            discrepancy_threshold = 0.001  # 0.001 BTC

            if max_discrepancy > discrepancy_threshold:
                custody_logger.warning(f"Discrepância detectada: {max_discrepancy} BTC")

            # Usar resultado mais confiável (BlockCypher preferido)
            primary_result = next((r for r in results if r['provider'] == 'BlockCypher'), results[0])

            # Verificar integridade dos fundos
            balance_btc = primary_result['balance_btc']
            integrity_status = self.check_fund_integrity(balance_btc)

            consolidated_result = {
                "success": True,
                "balance_btc": balance_btc,
                "balance_usd": balance_btc * 60000,  # Estimativa a $60k/BTC
                "expected_balance": self.expected_balance,
                "balance_difference": balance_btc - self.expected_balance,
                "integrity_status": integrity_status,
                "providers_checked": len(results),
                "discrepancy": max_discrepancy,
                "primary_provider": primary_result['provider'],
                "all_results": results,
                "timestamp": datetime.now().isoformat(),
                "last_updated": current_time
            }

            # Atualizar cache
            self.cached_balance = consolidated_result
            self.last_check = current_time

            return consolidated_result

        except Exception as e:
            custody_logger.error(f"Erro na consolidação: {str(e)}")
            return {
                "success": False,
                "error": f"Erro na consolidação: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

    def check_fund_integrity(self, current_balance):
        """
        Verificar integridade dos fundos
        Detectar movimentações não autorizadas
        """
        try:
            difference = abs(current_balance - self.expected_balance)

            if difference < 0.001:  # Menos de 0.001 BTC de diferença
                return {
                    "status": "SECURE",
                    "message": "Fundos íntegros e seguros",
                    "risk_level": "LOW"
                }
            elif difference < 0.1:  # Menos de 0.1 BTC
                return {
                    "status": "MINOR_DISCREPANCY",
                    "message": f"Pequena discrepância: {difference:.8f} BTC",
                    "risk_level": "LOW"
                }
            elif difference < 1.0:  # Menos de 1 BTC
                return {
                    "status": "MODERATE_DISCREPANCY",
                    "message": f"Discrepância moderada: {difference:.8f} BTC",
                    "risk_level": "MEDIUM"
                }
            else:  # Mais de 1 BTC
                return {
                    "status": "CRITICAL_ALERT",
                    "message": f"ALERTA CRÍTICO: Diferença de {difference:.8f} BTC",
                    "risk_level": "HIGH"
                }

        except Exception as e:
            return {
                "status": "ERROR",
                "message": f"Erro na verificação: {str(e)}",
                "risk_level": "UNKNOWN"
            }

    def get_recent_transactions(self, limit=10):
        """Obter transações recentes da carteira de custódia"""
        try:
            url = f"{self.blockstream_api}/address/{self.custody_address}/txs"
            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                transactions = response.json()[:limit]

                processed_txs = []
                for tx in transactions:
                    # Calcular valor recebido/enviado
                    value_in = sum(vout.get('value', 0) for vout in tx.get('vout', [])
                                 if vout.get('scriptpubkey_address') == self.custody_address)
                    value_out = sum(vin.get('prevout', {}).get('value', 0) for vin in tx.get('vin', [])
                                  if vin.get('prevout', {}).get('scriptpubkey_address') == self.custody_address)

                    net_value = (value_in - value_out) / 100000000  # Converter para BTC

                    processed_txs.append({
                        "txid": tx['txid'],
                        "block_height": tx.get('status', {}).get('block_height'),
                        "block_time": tx.get('status', {}).get('block_time'),
                        "confirmations": tx.get('status', {}).get('confirmed', False),
                        "net_value_btc": net_value,
                        "fee": tx.get('fee', 0) / 100000000,
                        "size": tx.get('size', 0)
                    })

                return {
                    "success": True,
                    "transactions": processed_txs,
                    "count": len(processed_txs)
                }
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}

        except Exception as e:
            custody_logger.error(f"Erro ao obter transações: {str(e)}")
            return {"success": False, "error": str(e)}

# Instância global do monitor
custody_monitor = CustodyMonitor()

@custody_bp.route('/api/custody/balance', methods=['GET'])
def get_custody_balance():
    """
    Endpoint para obter saldo da carteira de custódia
    Retorna dados consolidados de múltiplas fontes
    """
    try:
        result = custody_monitor.get_consolidated_balance()

        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500

    except Exception as e:
        custody_logger.error(f"Erro no endpoint de saldo: {str(e)}")
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

@custody_bp.route('/api/custody/transactions', methods=['GET'])
def get_custody_transactions():
    """
    Endpoint para obter transações recentes da custódia
    """
    try:
        result = custody_monitor.get_recent_transactions()

        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500

    except Exception as e:
        custody_logger.error(f"Erro no endpoint de transações: {str(e)}")
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

@custody_bp.route('/api/custody/status', methods=['GET'])
def get_custody_status():
    """
    Endpoint para status geral da custódia
    """
    try:
        balance_result = custody_monitor.get_consolidated_balance()
        tx_result = custody_monitor.get_recent_transactions(limit=5)

        status = {
            "custody_address": custody_monitor.custody_address,
            "expected_balance": custody_monitor.expected_balance,
            "system_status": "OPERATIONAL",
            "balance_data": balance_result if balance_result.get('success') else None,
            "recent_transactions": tx_result if tx_result.get('success') else None,
            "last_check": datetime.now().isoformat(),
            "monitoring_active": True
        }

        return jsonify(status), 200

    except Exception as e:
        custody_logger.error(f"Erro no status da custódia: {str(e)}")
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500
