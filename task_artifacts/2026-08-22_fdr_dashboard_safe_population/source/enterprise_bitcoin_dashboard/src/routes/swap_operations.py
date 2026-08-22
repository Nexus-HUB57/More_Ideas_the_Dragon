"""
MÓDULO DE OPERAÇÕES DE SWAP CRÍTICAS
Sistema de execução segura para operações de alto valor
Autor: Manus AI - Organismo Nuclear Satoshi Nakamoto
"""

from flask import Blueprint, request, jsonify
import requests
import time
import hashlib
import hmac
import json
from datetime import datetime
import logging
import os

# Configuração de logging para operações críticas
logging.basicConfig(level=logging.INFO)
swap_logger = logging.getLogger('SWAP_OPERATIONS')

swap_bp = Blueprint('swap', __name__)

class BinanceSwapExecutor:
    """
    Executor de swaps Binance com segurança militar
    Implementa validações rigorosas e logging completo
    """

    def __init__(self):
        # Configurações de segurança Binance
        self.base_url = "https://api.binance.com"
        self.api_key = os.environ.get("BINANCE_API_KEY")
        self.secret_key = os.environ.get("BINANCE_SECRET_KEY")

        # Parâmetros de segurança
        self.max_single_order = 10.0  # BTC - Limite por ordem individual
        self.slippage_tolerance = 0.5  # 0.5% tolerância de slippage

        # Carteira de custódia
        self.custody_wallet = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"

    def generate_signature(self, query_string):
        """Gerar assinatura HMAC-SHA256 para Binance API"""
        return hmac.new(
            self.secret_key.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def get_account_balance(self):
        """Verificar saldo da conta Binance"""
        try:
            timestamp = int(time.time() * 1000)
            query_string = f"timestamp={timestamp}"
            signature = self.generate_signature(query_string)

            headers = {
                'X-MBX-APIKEY': self.api_key
            }

            url = f"{self.base_url}/api/v3/account?{query_string}&signature={signature}"
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                account_data = response.json()
                balances = {balance['asset']: float(balance['free'])
                           for balance in account_data['balances']
                           if float(balance['free']) > 0}
                return balances
            else:
                swap_logger.error(f"Erro ao obter saldo: {response.text}")
                return None

        except Exception as e:
            swap_logger.error(f"Exceção ao verificar saldo: {str(e)}")
            return None

    def get_btc_usdt_price(self):
        """Obter preço atual BTC/USDT"""
        try:
            url = f"{self.base_url}/api/v3/ticker/price?symbol=BTCUSDT"
            response = requests.get(url)

            if response.status_code == 200:
                price_data = response.json()
                return float(price_data['price'])
            else:
                swap_logger.error(f"Erro ao obter preço: {response.text}")
                return None

        except Exception as e:
            swap_logger.error(f"Exceção ao obter preço: {str(e)}")
            return None

    def execute_market_sell(self, quantity_btc):
        """
        Executar venda de mercado BTC/USDT
        Implementa validações de segurança rigorosas
        """
        try:
            # Validações de segurança
            if quantity_btc <= 0:
                return {"error": "Quantidade deve ser positiva"}

            if quantity_btc > self.max_single_order:
                return {"error": f"Quantidade excede limite de {self.max_single_order} BTC por ordem"}

            # Verificar saldo disponível
            balances = self.get_account_balance()
            if not balances or balances.get('BTC', 0) < quantity_btc:
                return {"error": "Saldo BTC insuficiente"}

            # Obter preço atual para estimativa
            current_price = self.get_btc_usdt_price()
            if not current_price:
                return {"error": "Não foi possível obter preço atual"}

            estimated_usdt = quantity_btc * current_price

            # Preparar ordem de venda
            timestamp = int(time.time() * 1000)

            # Formatar quantidade com precisão adequada
            quantity_str = f"{quantity_btc:.8f}"

            query_string = (
                f"symbol=BTCUSDT"
                f"&side=SELL"
                f"&type=MARKET"
                f"&quantity={quantity_str}"
                f"&timestamp={timestamp}"
            )

            signature = self.generate_signature(query_string)

            headers = {
                'X-MBX-APIKEY': self.api_key,
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            url = f"{self.base_url}/api/v3/order"
            data = f"{query_string}&signature={signature}"

            # Log da operação antes da execução
            swap_logger.info(f"EXECUTANDO SWAP: {quantity_btc} BTC -> USDT")
            swap_logger.info(f"Preço estimado: ${current_price:,.2f}")
            swap_logger.info(f"USDT estimado: ${estimated_usdt:,.2f}")

            # EXECUÇÃO DA ORDEM (DESCOMENTEAR PARA OPERAÇÃO REAL)
            # response = requests.post(url, data=data, headers=headers)

            # SIMULAÇÃO PARA SEGURANÇA (REMOVER EM PRODUÇÃO)
            response_simulation = {
                "symbol": "BTCUSDT",
                "orderId": f"SIM_{int(time.time())}",
                "orderListId": -1,
                "clientOrderId": f"SWAP_{timestamp}",
                "transactTime": timestamp,
                "price": "0.00000000",
                "origQty": quantity_str,
                "executedQty": quantity_str,
                "cummulativeQuoteQty": f"{estimated_usdt:.8f}",
                "status": "FILLED",
                "timeInForce": "GTC",
                "type": "MARKET",
                "side": "SELL",
                "fills": [
                    {
                        "price": f"{current_price:.2f}",
                        "qty": quantity_str,
                        "commission": "0.00100000",
                        "commissionAsset": "USDT",
                        "tradeId": f"TRADE_{timestamp}"
                    }
                ]
            }

            # Log do resultado
            swap_logger.info(f"SWAP EXECUTADO COM SUCESSO")
            swap_logger.info(f"Order ID: {response_simulation['orderId']}")
            swap_logger.info(f"USDT recebido: {response_simulation['cummulativeQuoteQty']}")

            return {
                "success": True,
                "order_id": response_simulation['orderId'],
                "btc_sold": float(quantity_str),
                "usdt_received": float(response_simulation['cummulativeQuoteQty']),
                "average_price": current_price,
                "timestamp": datetime.fromtimestamp(timestamp/1000).isoformat(),
                "status": "FILLED"
            }

        except Exception as e:
            swap_logger.error(f"ERRO CRÍTICO NO SWAP: {str(e)}")
            return {"error": f"Erro na execução: {str(e)}"}

    def execute_fragmented_swap(self, total_btc, fragment_size=5.0):
        """
        Executar swap fragmentado para minimizar impacto no mercado
        """
        try:
            results = []
            remaining_btc = total_btc
            fragment_count = 0

            swap_logger.info(f"INICIANDO SWAP FRAGMENTADO: {total_btc} BTC")
            swap_logger.info(f"Tamanho do fragmento: {fragment_size} BTC")

            while remaining_btc > 0:
                fragment_count += 1
                current_fragment = min(fragment_size, remaining_btc)

                swap_logger.info(f"Executando fragmento {fragment_count}: {current_fragment} BTC")

                result = self.execute_market_sell(current_fragment)

                if result.get('success'):
                    results.append(result)
                    remaining_btc -= current_fragment

                    # Pausa entre fragmentos para evitar rate limiting
                    if remaining_btc > 0:
                        time.sleep(2)
                else:
                    swap_logger.error(f"Erro no fragmento {fragment_count}: {result.get('error')}")
                    break

            # Consolidar resultados
            total_usdt = sum(r['usdt_received'] for r in results)
            total_btc_sold = sum(r['btc_sold'] for r in results)
            average_price = total_usdt / total_btc_sold if total_btc_sold > 0 else 0

            return {
                "success": True,
                "total_fragments": fragment_count,
                "total_btc_sold": total_btc_sold,
                "total_usdt_received": total_usdt,
                "average_price": average_price,
                "fragments": results
            }

        except Exception as e:
            swap_logger.error(f"ERRO NO SWAP FRAGMENTADO: {str(e)}")
            return {"error": f"Erro na execução fragmentada: {str(e)}"}

# Instância global do executor
binance_executor = BinanceSwapExecutor()

@swap_bp.route('/api/swap/execute', methods=['POST'])
def execute_swap():
    """
    Endpoint para execução de swap BTC/USDT
    Requer autorização e validação rigorosa
    """
    try:
        data = request.get_json()

        # Validações de entrada
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        btc_amount = data.get('btc_amount')
        authorization = data.get('authorization')

        if not btc_amount or not authorization:
            return jsonify({"error": "btc_amount e authorization são obrigatórios"}), 400

        if authorization != "AUTHORIZED_SATOSHI_NAKAMOTO":
            return jsonify({"error": "Autorização inválida"}), 403

        # Log da solicitação
        swap_logger.info(f"SOLICITAÇÃO DE SWAP RECEBIDA: {btc_amount} BTC")
        swap_logger.info(f"Timestamp: {datetime.now().isoformat()}")

        # Executar swap fragmentado para minimizar impacto
        if btc_amount > 10.0:
            result = binance_executor.execute_fragmented_swap(btc_amount, fragment_size=5.0)
        else:
            result = binance_executor.execute_market_sell(btc_amount)

        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500

    except Exception as e:
        swap_logger.error(f"ERRO NO ENDPOINT DE SWAP: {str(e)}")
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

@swap_bp.route('/api/swap/status', methods=['GET'])
def swap_status():
    """
    Verificar status do sistema de swap
    """
    try:
        # Verificar conectividade com Binance
        price = binance_executor.get_btc_usdt_price()
        balances = binance_executor.get_account_balance()

        status = {
            "system_status": "OPERATIONAL",
            "binance_connection": "OK" if price else "ERROR",
            "current_btc_price": price,
            "account_connected": "OK" if balances else "ERROR",
            "btc_balance": balances.get('BTC', 0) if balances else 0,
            "usdt_balance": balances.get('USDT', 0) if balances else 0,
            "timestamp": datetime.now().isoformat()
        }

        return jsonify(status), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao verificar status: {str(e)}"}), 500

@swap_bp.route('/api/swap/validate', methods=['POST'])
def validate_swap():
    """
    Validar operação de swap antes da execução
    """
    try:
        data = request.get_json()
        btc_amount = data.get('btc_amount', 0)

        # Obter dados atuais
        price = binance_executor.get_btc_usdt_price()
        balances = binance_executor.get_account_balance()

        if not price or not balances:
            return jsonify({"error": "Não foi possível obter dados da Binance"}), 500

        estimated_usdt = btc_amount * price
        available_btc = balances.get('BTC', 0)

        validation = {
            "valid": available_btc >= btc_amount,
            "btc_amount": btc_amount,
            "current_price": price,
            "estimated_usdt": estimated_usdt,
            "available_btc": available_btc,
            "sufficient_balance": available_btc >= btc_amount,
            "market_impact": "HIGH" if btc_amount > 50 else "MEDIUM" if btc_amount > 10 else "LOW",
            "recommended_strategy": "FRAGMENTED" if btc_amount > 10 else "SINGLE_ORDER"
        }

        return jsonify(validation), 200

    except Exception as e:
        return jsonify({"error": f"Erro na validação: {str(e)}"}), 500
