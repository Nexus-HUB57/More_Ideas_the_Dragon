from flask import Blueprint, request, jsonify
import json
from src.get_utxos import get_utxos
from src.generate_raw_tx import create_unsigned_raw_transaction

bitcoin_bp = Blueprint("bitcoin", __name__)

@bitcoin_bp.route("/utxos/<address>", methods=["GET"])
def get_utxos_route(address):
    utxos = get_utxos(address)
    if utxos is None:
        return jsonify({"error": "Não foi possível buscar UTXOs para o endereço fornecido."}), 500
    return jsonify(utxos)

@bitcoin_bp.route("/create_raw_transaction", methods=["POST"])
def create_raw_transaction_route():
    data = request.get_json()
    utxos = data.get("utxos")
    recipient_address = data.get("recipient_address")
    amount_btc = data.get("amount_btc")
    sender_address = data.get("sender_address")
    fee_satoshi_per_byte = data.get("fee_satoshi_per_byte", 10)

    if not all([utxos, recipient_address, amount_btc, sender_address]):
        return jsonify({"error": "Dados incompletos para criar a transação."}), 400

    try:
        amount_btc = float(amount_btc)
    except ValueError:
        return jsonify({"error": "Quantidade de BTC inválida."}), 400

    raw_tx_hex = create_unsigned_raw_transaction(
        utxos,
        recipient_address,
        amount_btc,
        sender_address,
        fee_satoshi_per_byte
    )

    if raw_tx_hex:
        return jsonify({"raw_tx_hex": raw_tx_hex})
    else:
        return jsonify({"error": "Falha ao criar a transação hexadecimal."}), 500

