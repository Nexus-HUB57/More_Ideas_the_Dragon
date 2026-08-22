import requests
import time
import json

def monitor_transaction(txid):
    print(f"--- Monitorando Transação: {txid} ---")
    base_url = f"https://mempool.space/api/tx/{txid}"

    while True:
        try:
            response = requests.get(base_url)
            if response.status_code == 200:
                data = response.json()
                status = data.get("status", {})
                confirmed = status.get("confirmed", False)

                if confirmed:
                    block_height = status.get("block_height")
                    print(f"[CONFIRMADA] Transação incluída no bloco {block_height}")
                    break
                else:
                    print(f"[PENDENTE] Transação ainda no Mempool. Aguardando próxima verificação...")
            else:
                print(f"[ERRO] Falha ao consultar status: {response.status_code}")

            time.sleep(30) # Verifica a cada 30 segundos
        except Exception as e:
            print(f"[ERRO] Falha na conexão: {str(e)}")
            time.sleep(10)

def monitor_address(address):
    print(f"--- Monitorando Endereço: {address} ---")
    base_url = f"https://mempool.space/api/address/{address}/txs"

    known_txs = set()

    while True:
        try:
            response = requests.get(base_url)
            if response.status_code == 200:
                txs = response.json()
                for tx in txs:
                    txid = tx.get("txid")
                    if txid not in known_txs:
                        print(f"[NOVA TX] Detectada transação: {txid}")
                        known_txs.add(txid)

            time.sleep(20)
        except Exception as e:
            print(f"[ERRO] Falha ao monitorar endereço: {str(e)}")
            time.sleep(10)

if __name__ == "__main__":
    # Exemplo de uso: monitorar o endereço alvo
    TARGET_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    monitor_address(TARGET_ADDRESS)
