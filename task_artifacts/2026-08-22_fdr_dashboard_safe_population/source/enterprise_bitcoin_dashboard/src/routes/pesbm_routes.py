"""
Blueprint PESBM - Integração Mainnet
Endpoints compatíveis com o pesbmMainnetService.js para operações reais
Autor: Manus AI
"""

from flask import Blueprint, request, jsonify
import os
import requests
from datetime import datetime

pesbm_bp = Blueprint('pesbm', __name__)

BLOCKSTREAM_API = "https://blockstream.info/api"
BLOCKCYPHER_API = "https://api.blockcypher.com/v1/btc/main"
BLOCKCYPHER_TOKEN = os.environ.get("BLOCKCYPHER_TOKEN", "")


def ok(data: dict, code: int = 200):
    return jsonify(data), code


def err(message: str, code: int = 500):
    return jsonify({"error": message}), code


@pesbm_bp.route('/api/address/<address>', methods=['GET'])
def get_address_info(address):
    """Retorna saldo e UTXOs reais da mainnet para um endereço"""
    try:
        # Dados gerais do endereço (Blockstream)
        info_resp = requests.get(f"{BLOCKSTREAM_API}/address/{address}", timeout=20)
        if info_resp.status_code != 200:
            return err(f"Erro ao consultar endereço (Blockstream): HTTP {info_resp.status_code}", 502)
        info = info_resp.json()

        # UTXOs (Blockstream)
        utxo_resp = requests.get(f"{BLOCKSTREAM_API}/address/{address}/utxo", timeout=20)
        if utxo_resp.status_code != 200:
            return err(f"Erro ao consultar UTXOs (Blockstream): HTTP {utxo_resp.status_code}", 502)
        utxos_raw = utxo_resp.json()

        balance_sat = info['chain_stats']['funded_txo_sum'] - info['chain_stats']['spent_txo_sum']
        tx_count = info['chain_stats']['tx_count']

        utxos = [
            {
                "txid": u.get("txid"),
                "vout": u.get("vout"),
                "value": u.get("value", 0),
                "script_pubkey": u.get("scriptpubkey", ""),
                "confirmations": u.get("status", {}).get("confirmations") if isinstance(u.get("status"), dict) else None
            }
            for u in utxos_raw
        ]

        return ok({
            "address": address,
            "balance_sat": balance_sat,
            "balance_btc": balance_sat / 1e8,
            "tx_count": tx_count,
            "utxos": utxos,
            "provider": "blockstream",
            "validated_at": datetime.utcnow().isoformat() + 'Z'
        })
    except Exception as e:
        return err(f"Exceção ao obter dados do endereço: {str(e)}", 500)


@pesbm_bp.route('/api/build-transaction', methods=['POST'])
def build_transaction():
    """
    Constrói um template de transação; a assinatura deve ocorrer no frontend.
    Compatível com pesbmMainnetService.buildTransactionHex().
    """
    try:
        data = request.get_json(force=True)
        # Campos esperados: from, to, amount_btc/amount_sat, utxos, fee_rate
        amount_sat = data.get('amount_sat') or int(float(data.get('amount_btc', 0)) * 1e8)
        fee_rate = int(data.get('fee_rate', 10))  # sat/vB

        # Retornar um template/PSBT placeholder para assinatura no frontend
        tx_template = {
            "network": "mainnet",
            "inputs": data.get('utxos', []),
            "from": data.get('from'),
            "to": data.get('to'),
            "amount_sat": amount_sat,
            "fee_rate": fee_rate,
            "change_address": data.get('from'),
        }

        return ok({
            "message": "Template de transação gerado. Assine no frontend e envie o hex via /api/broadcast.",
            "transaction_hex": None,
            "psbt": tx_template,
        })
    except Exception as e:
        return err(f"Erro ao construir transação: {str(e)}", 500)


@pesbm_bp.route('/api/broadcast', methods=['POST'])
def broadcast():
    """Transmite um tx_hex assinado para a mainnet usando BlockCypher (fallback Blockstream)."""
    try:
        payload = request.get_json(force=True)
        tx_hex = payload.get('tx_hex')
        if not tx_hex:
            return err("tx_hex é obrigatório", 400)

        # Tentativa 1: BlockCypher
        try:
            params = {"token": BLOCKCYPHER_TOKEN} if BLOCKCYPHER_TOKEN else {}
            bc_resp = requests.post(f"{BLOCKCYPHER_API}/txs/push", json={"tx": tx_hex}, params=params, timeout=30)
            if bc_resp.status_code in (200, 201):
                j = bc_resp.json()
                tx_hash = j.get('tx', {}).get('hash') or j.get('tx', {}).get('hashes', [None])[0] or j.get('tx', {}).get('tx', {}).get('hash')
                return ok({"txid": tx_hash or "unknown", "provider": "blockcypher"}, 200)
        except Exception:
            pass

        # Tentativa 2: Blockstream (raw hex no corpo)
        bs_resp = requests.post(f"{BLOCKSTREAM_API}/tx", data=tx_hex, headers={"Content-Type": "text/plain"}, timeout=30)
        if bs_resp.status_code in (200, 201):
            return ok({"txid": bs_resp.text.strip(), "provider": "blockstream"}, 200)
        else:
            return err(f"Falha ao transmitir: Blockstream HTTP {bs_resp.status_code} {bs_resp.text}", 502)

    except Exception as e:
        return err(f"Erro na transmissão: {str(e)}", 500)


@pesbm_bp.route('/api/pesbm/status', methods=['GET'])
def tx_status():
    """Consulta status de uma transação na mainnet."""
    try:
        txid = request.args.get('txid')
        if not txid:
            return err("txid é obrigatório", 400)

        # Blockstream
        bs = requests.get(f"{BLOCKSTREAM_API}/tx/{txid}", timeout=20)
        confirmed = False
        confirmations = 0
        block_height = None
        block_hash = None
        if bs.status_code == 200:
            j = bs.json()
            status = j.get('status', {})
            confirmed = status.get('confirmed', False)
            block_height = status.get('block_height')
            block_hash = status.get('block_hash')
            # Confirmations endpoint
            if confirmed and block_height is not None:
                tip_height_resp = requests.get(f"{BLOCKSTREAM_API}/blocks/tip/height", timeout=10)
                if tip_height_resp.status_code == 200:
                    tip = int(tip_height_resp.text)
                    confirmations = max(0, tip - int(block_height) + 1)

        # Fallback BlockCypher
        if not confirmed or confirmations == 0:
            params = {"token": BLOCKCYPHER_TOKEN} if BLOCKCYPHER_TOKEN else {}
            bc = requests.get(f"{BLOCKCYPHER_API}/txs/{txid}", params=params, timeout=20)
            if bc.status_code == 200:
                jb = bc.json()
                confirmations = int(jb.get('confirmations', 0))
                confirmed = confirmations > 0
                block_height = jb.get('block_height')
                block_hash = jb.get('block_hash')

        return ok({
            "txid": txid,
            "confirmed": confirmed,
            "confirmations": confirmations,
            "block_height": block_height,
            "block_hash": block_hash,
            "checked_at": datetime.utcnow().isoformat() + 'Z'
        })
    except Exception as e:
        return err(f"Erro ao consultar status: {str(e)}", 500)
