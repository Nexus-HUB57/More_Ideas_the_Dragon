import requests
import json
import time
from datetime import datetime

class DailyCustodyMonitor:
    def __init__(self, source_addr, custody_addr):
        self.source = source_addr
        self.custody = custody_addr
        self.api_url = "https://mempool.space/api"

    def get_address_stats(self, address):
        try:
            res = requests.get(f"{self.api_url}/address/{address}")
            data = res.json()
            chain = data.get('chain_stats', {})
            mempool = data.get('mempool_stats', {})

            balance = (chain.get('funded_txo_sum', 0) - chain.get('spent_txo_sum', 0)) / 1e8
            pending = (mempool.get('funded_txo_sum', 0) - mempool.get('spent_txo_sum', 0)) / 1e8

            return {
                "balance": balance,
                "pending": pending,
                "tx_count": chain.get('tx_count', 0)
            }
        except:
            return None

    def generate_report(self):
        print(f"--- GERANDO RELATÓRIO DIÁRIO PESBM: {datetime.now().strftime('%Y-%m-%d')} ---")

        source_stats = self.get_address_stats(self.source)
        custody_stats = self.get_address_stats(self.custody)

        report = {
            "date": datetime.now().isoformat(),
            "source_wallet": {
                "address": self.source,
                "stats": source_stats
            },
            "custody_wallet": {
                "address": self.custody,
                "stats": custody_stats
            },
            "network_status": {
                "fees": requests.get(f"{self.api_url}/v1/fees/recommended").json(),
                "block_height": requests.get(f"{self.api_url}/blocks/tip/height").text
            }
        }

        filename = f"reports/daily_report_{datetime.now().strftime('%Y%m%d')}.json"
        with open(filename, 'w') as f:
            json.dump(report, f, indent=4)

        print(f"[SUCESSO] Relatório consolidado em: {filename}")
        return report

if __name__ == "__main__":
    import os
    if not os.path.exists('reports'):
        os.makedirs('reports')

    monitor = DailyCustodyMonitor(
        "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "bc1qtydmzqcyltsm4tfmxl3a8f9tqvdxls62j05a8s"
    )
    monitor.generate_report()
