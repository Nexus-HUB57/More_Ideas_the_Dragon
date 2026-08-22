from flask import Blueprint, jsonify, request
import requests
import json
from datetime import datetime
import hashlib
import base64

bitcoin_bp = Blueprint('bitcoin', __name__)

# Configurações das APIs de blockchain
BLOCKCYPHER_API_URL = "https://api.blockcypher.com/v1/btc/main"
BLOCKCHAIN_API_URL = "https://blockchain.info"

@bitcoin_bp.route('/addresses', methods=['GET'])
def get_monitored_addresses():
    """Retorna a lista de endereços monitorados pelo sistema ETERNA"""
    # Dados simulados para demonstração - em produção, viria do banco de dados
    addresses = [
        {
            "address": "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL",
            "balance": 2000.00000000,
            "status": "compromised",
            "lastActivity": "2024-12-18",
            "transactions": 1,
            "type": "Legacy (P2PKH)",
            "risk_level": "high"
        },
        {
            "address": "bc1qg0j2s2zmxp2g5g0q2k5z8n8q8y7z6f5e4d3c2b1a",
            "balance": 0.00000000,
            "status": "secure",
            "lastActivity": "Never",
            "transactions": 0,
            "type": "SegWit (P2WPKH)",
            "risk_level": "low"
        },
        {
            "address": "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug",
            "balance": 0.72440347,
            "status": "secure",
            "lastActivity": "2024-09-15",
            "transactions": 523,
            "type": "Legacy (P2PKH)",
            "risk_level": "low"
        }
    ]
    
    return jsonify({
        "success": True,
        "data": addresses,
        "total": len(addresses),
        "timestamp": datetime.now().isoformat()
    })

@bitcoin_bp.route('/address/<address>/balance', methods=['GET'])
def get_address_balance(address):
    """Obtém o saldo de um endereço específico via API BlockCypher"""
    try:
        response = requests.get(f"{BLOCKCYPHER_API_URL}/addrs/{address}/balance")
        if response.status_code == 200:
            data = response.json()
            balance_btc = data.get('balance', 0) / 100000000  # Converter de satoshis para BTC
            
            return jsonify({
                "success": True,
                "address": address,
                "balance": balance_btc,
                "balance_satoshis": data.get('balance', 0),
                "unconfirmed_balance": data.get('unconfirmed_balance', 0) / 100000000,
                "total_received": data.get('total_received', 0) / 100000000,
                "total_sent": data.get('total_sent', 0) / 100000000,
                "n_tx": data.get('n_tx', 0),
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "error": "Erro ao consultar saldo do endereço",
                "status_code": response.status_code
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno: {str(e)}"
        }), 500

@bitcoin_bp.route('/network/status', methods=['GET'])
def get_network_status():
    """Obtém informações sobre o status da rede Bitcoin"""
    try:
        # Consultar informações da rede via BlockCypher
        response = requests.get(f"{BLOCKCYPHER_API_URL}")
        if response.status_code == 200:
            data = response.json()
            
            return jsonify({
                "success": True,
                "network": "Bitcoin Mainnet",
                "status": "online",
                "latest_block": data.get('height', 0),
                "hash": data.get('hash', ''),
                "time": data.get('time', ''),
                "peer_count": data.get('peer_count', 0),
                "unconfirmed_count": data.get('unconfirmed_count', 0),
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "error": "Erro ao consultar status da rede"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro interno: {str(e)}"
        }), 500

@bitcoin_bp.route('/transactions/recent', methods=['GET'])
def get_recent_transactions():
    """Retorna as transações recentes dos endereços monitorados"""
    # Dados simulados para demonstração
    transactions = [
        {
            "txid": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
            "type": "incoming",
            "amount": 2000.00000000,
            "confirmations": 6,
            "timestamp": "2024-12-18T14:30:00Z",
            "from_address": "unknown",
            "to_address": "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL",
            "fee": 0.00001000,
            "status": "confirmed"
        },
        {
            "txid": "b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1",
            "type": "outgoing",
            "amount": 0.50000000,
            "confirmations": 12,
            "timestamp": "2024-12-17T10:15:00Z",
            "from_address": "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug",
            "to_address": "bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8",
            "fee": 0.00000500,
            "status": "confirmed"
        }
    ]
    
    return jsonify({
        "success": True,
        "data": transactions,
        "total": len(transactions),
        "timestamp": datetime.now().isoformat()
    })

@bitcoin_bp.route('/psbt/create', methods=['POST'])
def create_psbt():
    """Cria uma PSBT (Partially Signed Bitcoin Transaction)"""
    try:
        data = request.get_json()
        
        from_address = data.get('from_address')
        to_address = data.get('to_address')
        amount = float(data.get('amount', 0))
        fee_rate = data.get('fee_rate', 10)  # sat/vB
        
        if not all([from_address, to_address, amount]):
            return jsonify({
                "success": False,
                "error": "Campos obrigatórios: from_address, to_address, amount"
            }), 400
        
        # Simular criação de PSBT
        amount_satoshis = int(amount * 100000000)
        fee_satoshis = 1000  # Taxa fixa para simulação
        
        # Gerar PSBT simulada (em produção, usar bibliotecas como python-bitcoinlib)
        psbt_data = {
            "version": 2,
            "inputs": [
                {
                    "txid": "f" * 64,  # TXID simulado
                    "vout": 0,
                    "amount": amount_satoshis + fee_satoshis,
                    "address": from_address
                }
            ],
            "outputs": [
                {
                    "address": to_address,
                    "amount": amount_satoshis
                }
            ],
            "fee": fee_satoshis,
            "fee_rate": fee_rate
        }
        
        # Codificar em base64 para simulação
        psbt_json = json.dumps(psbt_data)
        psbt_base64 = base64.b64encode(psbt_json.encode()).decode()
        
        return jsonify({
            "success": True,
            "psbt": psbt_base64,
            "transaction_details": {
                "from_address": from_address,
                "to_address": to_address,
                "amount_btc": amount,
                "amount_satoshis": amount_satoshis,
                "fee_btc": fee_satoshis / 100000000,
                "fee_satoshis": fee_satoshis,
                "total_input": (amount_satoshis + fee_satoshis) / 100000000
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao criar PSBT: {str(e)}"
        }), 500

@bitcoin_bp.route('/transaction/broadcast', methods=['POST'])
def broadcast_transaction():
    """Transmite uma transação assinada para a rede Bitcoin"""
    try:
        data = request.get_json()
        signed_tx = data.get('signed_transaction')
        
        if not signed_tx:
            return jsonify({
                "success": False,
                "error": "Transação assinada é obrigatória"
            }), 400
        
        # Em produção, transmitir via API BlockCypher ou outro provedor
        # Por enquanto, simular o broadcast
        
        # Gerar TXID simulado
        tx_hash = hashlib.sha256(signed_tx.encode()).hexdigest()
        
        return jsonify({
            "success": True,
            "txid": tx_hash,
            "message": "Transação transmitida com sucesso",
            "broadcast_url": f"https://www.blockchain.com/pt/explorer/assets/btc/broadcast-transaction",
            "explorer_url": f"https://blockstream.info/tx/{tx_hash}",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao transmitir transação: {str(e)}"
        }), 500

@bitcoin_bp.route('/alerts', methods=['GET'])
def get_security_alerts():
    """Retorna alertas de segurança do sistema"""
    alerts = [
        {
            "id": 1,
            "type": "critical",
            "title": "Chave Privada Comprometida",
            "message": "O endereço 1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL contém 2000 BTC e sua chave privada foi comprometida. Transferência urgente necessária.",
            "address": "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL",
            "severity": "high",
            "timestamp": "2024-12-18T14:30:00Z",
            "status": "active"
        },
        {
            "id": 2,
            "type": "info",
            "title": "Nova Transação Detectada",
            "message": "Transação de entrada de 0.5 BTC detectada no endereço 113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug",
            "address": "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug",
            "severity": "low",
            "timestamp": "2024-12-17T10:15:00Z",
            "status": "resolved"
        }
    ]
    
    return jsonify({
        "success": True,
        "data": alerts,
        "total": len(alerts),
        "active_alerts": len([a for a in alerts if a["status"] == "active"]),
        "timestamp": datetime.now().isoformat()
    })

@bitcoin_bp.route('/portfolio/summary', methods=['GET'])
def get_portfolio_summary():
    """Retorna resumo do portfólio ETERNA"""
    # Simular dados do portfólio
    btc_price_usd = 90000  # Preço simulado do Bitcoin
    
    addresses_data = [
        {"address": "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL", "balance": 2000.00000000, "status": "compromised"},
        {"address": "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug", "balance": 0.72440347, "status": "secure"},
        {"address": "bc1qg0j2s2zmxp2g5g0q2k5z8n8q8y7z6f5e4d3c2b1a", "balance": 0.00000000, "status": "secure"}
    ]
    
    total_btc = sum(addr["balance"] for addr in addresses_data)
    total_usd = total_btc * btc_price_usd
    
    secure_addresses = len([addr for addr in addresses_data if addr["status"] == "secure"])
    compromised_addresses = len([addr for addr in addresses_data if addr["status"] == "compromised"])
    
    return jsonify({
        "success": True,
        "portfolio": {
            "total_btc": total_btc,
            "total_usd": total_usd,
            "btc_price_usd": btc_price_usd,
            "total_addresses": len(addresses_data),
            "secure_addresses": secure_addresses,
            "compromised_addresses": compromised_addresses,
            "last_update": datetime.now().isoformat()
        },
        "addresses": addresses_data,
        "timestamp": datetime.now().isoformat()
    })

