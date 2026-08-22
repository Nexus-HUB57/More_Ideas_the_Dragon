"""
PESBM Dashboard (v3 - Public Node Edition)
- NENHUM uso de Bitcoin Core RPC.
- Consultas em tempo real via exploradores públicos (Blockstream / BlockCypher).
- Broadcast de transação via Blockstream (POST /tx), com fallback para BlockCypher (se token disponível).
- PSBT/assinatura acontece no FRONTEND usando bitcoinjs-lib (chave WIF fornecida pelo usuário, opcional).
  *Recomendado usar hardware wallet e importar a TX assinada como HEX, quando possível.*
"""

from flask import Flask, request, jsonify, send_from_directory
import requests, os

app = Flask(__name__, static_folder="static")

BLOCKSTREAM = "https://blockstream.info/api"
BLOCKCYPHER = "https://api.blockcypher.com/v1/btc/main"
BCYPH_TOKEN = os.getenv("BLOCKCYPHER_TOKEN")  # opcional

# --------- Address info (saldo em tempo real) ---------
@app.get("/api/address/<addr>")
def address_info(addr):
    try:
        ai = requests.get(f"{BLOCKSTREAM}/address/{addr}", timeout=30).json()
        utxos = requests.get(f"{BLOCKSTREAM}/address/{addr}/utxo", timeout=30).json()
        chain = ai.get("chain_stats", {})
        mempool = ai.get("mempool_stats", {})
        funded = (chain.get("funded_txo_sum", 0) or 0) + (mempool.get("funded_txo_sum", 0) or 0)
        spent  = (chain.get("spent_txo_sum", 0) or 0)  + (mempool.get("spent_txo_sum", 0) or 0)
        balance_sat = funded - spent
        return jsonify({
            "address": addr,
            "tx_count": (chain.get("tx_count", 0) or 0),
            "funded_txo_sum_sat": funded,
            "spent_txo_sum_sat": spent,
            "balance_sat": balance_sat,
            "balance_btc": balance_sat / 1e8,
            "utxos": utxos
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------- TX status (confirmações) ---------
@app.get("/api/pesbm/status")
def pesbm_status():
    txid = request.args.get("txid")
    if not txid:
        return jsonify({"error": "missing txid"}), 400
    try:
        st = requests.get(f"{BLOCKSTREAM}/tx/{txid}/status", timeout=30).json()
