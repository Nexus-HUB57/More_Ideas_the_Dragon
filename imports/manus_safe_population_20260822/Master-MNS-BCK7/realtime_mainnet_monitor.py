import requests
import time
import json
from datetime import datetime

class RealTimeMainnetMonitor:
    def __init__(self, master_address):
        self.address = master_address
        self.base_url = "https://mempool.space/api"
        print(f"[MONITOR] Iniciando vigilância para: {self.address}")

    def get_balance(self):
        try:
            response = requests.get(f"{self.base_url}/address/{self.address}")
            data = response.json()
            chain_stats = data.get("chain_stats", {})
            mempool_stats = data.get("mempool_stats", {})

            # Saldo Confirmado + Pendente
            confirmed = (chain_stats.get("funded_txo_sum", 0) - chain_stats.get("spent_txo_sum", 0)) / 1e8
            pending = (mempool_stats.get("funded_txo_sum", 0) - mempool_stats.get("spent_txo_sum", 0)) / 1e8

            return confirmed, pending
        except Exception as e:
            print(f"[ERRO] Falha ao obter saldo: {e}")
            return None, None

    def get_recent_transactions(self):
        try:
            response = requests.get(f"{self.base_url}/address/{self.address}/txs")
            return response.json()
        except Exception as e:
            print(f"[ERRO] Falha ao obter transações: {e}")
            return []

    def start_monitoring(self, interval=60):
        print(f"[MONITOR] Loop de monitoramento ativo (Intervalo: {interval}s)")
        last_txid = None

        while True:
            confirmed, pending = self.get_balance()
            if confirmed is not None:
                now = datetime.now().strftime("%H:%M:%S")
                print(f"[{now}] Saldo Confirmado: {confirmed:.8f} BTC | Pendente: {pending:.8f} BTC")

            txs = self.get_recent_transactions()
            if txs and txs[0]['txid'] != last_txid:
                new_tx = txs[0]
                last_txid = new_tx['txid']
                status = "CONFIRMADA" if new_tx['status']['confirmed'] else "PENDENTE"
                print(f"[ALERTA] Nova Transação Detectada: {last_txid} | Status: {status}")

            time.sleep(interval)

if __name__ == "__main__":
    MASTER_ADDR = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    monitor = RealTimeMainnetMonitor(MASTER_ADDR)
    monitor.start_monitoring(30)
