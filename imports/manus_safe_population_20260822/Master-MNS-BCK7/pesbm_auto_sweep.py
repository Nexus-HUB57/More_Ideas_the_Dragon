import time
import requests
from bit import Key

class PESBMAutoSweep:
    def __init__(self, wif_key, destination_address):
        self.key = Key(wif_key)
        self.destination = destination_address
        print(f"[SWEEP] Iniciando Workflow para: {self.key.address}")
        print(f"[SWEEP] Destino de Custódia: {self.destination}")

    def get_average_fee(self):
        try:
            res = requests.get("https://mempool.space/api/v1/fees/recommended")
            return res.json()['hourFee'] # Taxa média para confirmação em ~1h
        except:
            return 20 # Fallback seguro

    def sweep_all(self):
        print(f"\n[{time.ctime()}] Verificando UTXOs para exaustão...")
        try:
            # O método 'send' com saldo total menos taxas
            # Buscamos o saldo total primeiro
            self.key.get_unspents()
            balance_btc = self.key.get_balance('btc')

            if float(balance_btc) > 0:
                print(f"[DETECTADO] Saldo de {balance_btc} BTC encontrado.")
                fee_rate = self.get_average_fee()
                print(f"[TAXA] Usando taxa média: {fee_rate} sat/vB")

                # Realiza o sweep de 100% do saldo
                # O 'bit' calcula automaticamente a taxa se passarmos os outputs
                tx_hash = self.key.send([(self.destination, balance_btc, 'btc')], fee=fee_rate)
                print(f"[SUCESSO] Sweep realizado! TXID: {tx_hash}")
                return tx_hash
            else:
                print("[INFO] Nenhum saldo disponível para sweep no momento.")
                return None
        except Exception as e:
            print(f"[ERRO] Falha no processo de sweep: {e}")
            return None

    def run_continuous(self, interval=300):
        print(f"[SISTEMA] Workflow de Exaustão Ativo (Loop: {interval}s)")
        while True:
            self.sweep_all()
            time.sleep(interval)

if __name__ == "__main__":
    # Nota: O WIF deve ser carregado de uma variável de ambiente segura em produção
    WIF_KEY = "CHAVE_WIF_SINCRONIZADA_AO_SISTEMA"
    DESTINO_BINANCE = "bc1qtydmzqcyltsm4tfmxl3a8f9tqvdxls62j05a8s"

    # workflow = PESBMAutoSweep(WIF_KEY, DESTINO_BINANCE)
    # workflow.run_continuous()
