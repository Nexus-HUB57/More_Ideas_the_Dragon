import requests
import json
import glob
import sys

def broadcast_blockchain_com(tx_hex):
    print("Tentando transmitir via Blockchain.com...")
    url = "https://blockchain.info/pushtx"
    try:
        response = requests.post(url, data={'tx': tx_hex})
        if response.status_code == 200:
            print("Sucesso (Blockchain.com): Transação transmitida.")
            return True, response.text
        else:
            print(f"Erro (Blockchain.com): {response.status_code} - {response.text}")
            return False, response.text
    except Exception as e:
        print(f"Exceção (Blockchain.com): {e}")
        return False, str(e)

def broadcast_mempool_space(tx_hex):
    print("Tentando transmitir via Mempool.space...")
    url = "https://mempool.space/api/tx"
    try:
        response = requests.post(url, data=tx_hex)
        if response.status_code == 200:
            print(f"Sucesso (Mempool.space): TXID {response.text}")
            return True, response.text
        else:
            print(f"Erro (Mempool.space): {response.status_code} - {response.text}")
            return False, response.text
    except Exception as e:
        print(f"Exceção (Mempool.space): {e}")
        return False, str(e)

def broadcast_blockstream_info(tx_hex):
    print("Tentando transmitir via Blockstream.info...")
    url = "https://blockstream.info/api/tx"
    try:
        response = requests.post(url, data=tx_hex)
        if response.status_code == 200:
            print(f"Sucesso (Blockstream.info): TXID {response.text}")
            return True, response.text
        else:
            print(f"Erro (Blockstream.info): {response.status_code} - {response.text}")
            return False, response.text
    except Exception as e:
        print(f"Exceção (Blockstream.info): {e}")
        return False, str(e)

if __name__ == '__main__':
    files = glob.glob('signed_transaction_manual_byte_by_byte_*.json')
    if not files:
        print("Erro: Nenhum arquivo de transação assinado encontrado.")
        sys.exit(1)

    latest_file = sorted(files)[-1]
    print(f"Lendo transação de: {latest_file}")
    with open(latest_file, 'r') as f:
        tx_data = json.load(f)

    tx_hex = tx_data['tx_hex']

    # Tentar APIs em ordem
    success = False
    results = []

    ok, res = broadcast_mempool_space(tx_hex)
    results.append(("Mempool.space", ok, res))
    if ok: success = True

    if not success:
        ok, res = broadcast_blockstream_info(tx_hex)
        results.append(("Blockstream.info", ok, res))
        if ok: success = True

    if not success:
        ok, res = broadcast_blockchain_com(tx_hex)
        results.append(("Blockchain.com", ok, res))
        if ok: success = True

    if success:
        print("\nTransação enviada com sucesso para pelo menos uma API!")
    else:
        print("\nFalha ao enviar a transação em todas as APIs tentadas.")
