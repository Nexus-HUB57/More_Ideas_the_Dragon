
import requests
import json
import sys
import config

def broadcast_mempool(tx_hex):
    print(f"Transmitindo via Mempool.space...")
    try:
        res = requests.post(f"{config.MEMPOOL_API}/tx", data=tx_hex, timeout=30)
        if res.status_code == 200:
            print(f"Sucesso! TXID: {res.text}")
            return True
        else:
            print(f"Falha Mempool: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"Erro Mempool: {e}")
        return False

def broadcast_blockcypher(tx_hex):
    print(f"Transmitindo via BlockCypher...")
    try:
        res = requests.post(f"{config.BLOCKCYPHER_API}/txs/push", json={"tx": tx_hex}, timeout=30)
        if res.status_code == 201:
            data = res.json()
            print(f"Sucesso! TXID: {data['tx']['hash']}")
            return True
        else:
            print(f"Falha BlockCypher: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"Erro BlockCypher: {e}")
        return False

def broadcast_blockstream(tx_hex):
    print(f"Transmitindo via Blockstream.info...")
    try:
        res = requests.post(f"{config.BLOCKSTREAM_API}/tx", data=tx_hex, timeout=30)
        if res.status_code == 200:
            print(f"Sucesso! TXID: {res.text}")
            return True
        else:
            print(f"Falha Blockstream: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"Erro Blockstream: {e}")
        return False

def run_broadcast(tx_hex):
    print("\n--- Iniciando Broadcast Redundante ---")
    results = []
    results.append(broadcast_mempool(tx_hex))
    results.append(broadcast_blockcypher(tx_hex))
    results.append(broadcast_blockstream(tx_hex))
    
    if any(results):
        print("\nTransação enviada com sucesso para pelo menos um nó.")
    else:
        print("\nFalha crítica: a transação não pôde ser enviada para nenhuma API.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_broadcast(sys.argv[1])
    else:
        import glob
        import os
        files = glob.glob("signed_tx_*.json")
        if files:
            latest = max(files, key=os.path.getctime)
            with open(latest, 'r') as f:
                data = json.load(f)
            run_broadcast(data['tx_hex'])
        else:
            print("Uso: python3 mainnet_tx_broadcaster.py <tx_hex>")
