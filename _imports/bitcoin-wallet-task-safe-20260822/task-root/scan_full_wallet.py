#!/usr/bin/env python3
"""
Varredura Completa de 423.191 Endereços Bitcoin
Protocolo TSRA - Transaction Security Real Action
"""

import csv
import time
import requests
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import signal
import sys

# Configurações
CSV_FILE = '/home/ubuntu/upload/FDR_Master_Wallet_Complete_20251006_143555.csv'
BLOCKCHAIN_APIS = [
    "https://blockstream.info/api",
    "https://mempool.space/api"
]

MAX_WORKERS = 20  # Threads paralelas
BATCH_SIZE = 100  # Salva resultados a cada 100 verificações
CHECKPOINT_FILE = 'scan_checkpoint.json'
RESULTS_FILE = 'funded_wallets_scan.json'

class WalletScanner:
    """Scanner de carteiras em massa"""
    
    def __init__(self):
        self.funded_wallets = []
        self.checked_count = 0
        self.total_wallets = 0
        self.start_time = None
        self.last_checkpoint = 0
        self.running = True
        
        # Carrega checkpoint se existir
        self.load_checkpoint()
        
        # Handler para Ctrl+C
        signal.signal(signal.SIGINT, self.signal_handler)
    
    def signal_handler(self, sig, frame):
        """Handler para interrupção"""
        print("\n\n⚠️ Interrupção detectada. Salvando progresso...")
        self.running = False
        self.save_checkpoint()
        self.save_results()
        print("✅ Progresso salvo. Você pode retomar depois.")
        sys.exit(0)
    
    def load_checkpoint(self):
        """Carrega checkpoint anterior"""
        try:
            with open(CHECKPOINT_FILE, 'r') as f:
                data = json.load(f)
                self.last_checkpoint = data.get('last_index', 0)
                self.funded_wallets = data.get('funded_wallets', [])
                if self.last_checkpoint > 0:
                    print(f"📍 Checkpoint encontrado: Retomando do índice {self.last_checkpoint}")
        except:
            self.last_checkpoint = 0
    
    def save_checkpoint(self):
        """Salva checkpoint"""
        data = {
            'last_index': self.checked_count,
            'funded_wallets': self.funded_wallets,
            'timestamp': datetime.now().isoformat()
        }
        with open(CHECKPOINT_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    
    def check_address_balance(self, address):
        """Verifica saldo de um endereço"""
        for api_url in BLOCKCHAIN_APIS:
            try:
                response = requests.get(f'{api_url}/address/{address}', timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    funded = data['chain_stats']['funded_txo_sum']
                    spent = data['chain_stats']['spent_txo_sum']
                    balance = funded - spent
                    
                    # Retorna também informações de transações
                    tx_count = data['chain_stats']['tx_count']
                    return balance, tx_count
            except:
                continue
        return 0, 0
    
    def check_wallet(self, row):
        """Verifica uma carteira"""
        if not self.running:
            return None
        
        try:
            index = int(row['Index'])
            address = row['Bitcoin_Address']
            private_key = row['Private_Key_WIF']
            
            # Pula se já foi verificado
            if index <= self.last_checkpoint:
                return None
            
            # Verifica saldo
            balance_satoshis, tx_count = self.check_address_balance(address)
            
            self.checked_count += 1
            
            # Mostra progresso
            if self.checked_count % 10 == 0:
                elapsed = time.time() - self.start_time
                rate = self.checked_count / elapsed if elapsed > 0 else 0
                remaining_count = self.total_wallets - (self.last_checkpoint + self.checked_count)
                remaining_time = remaining_count / rate if rate > 0 else 0
                
                print(f"\r  Verificadas: {self.checked_count + self.last_checkpoint}/{self.total_wallets} | "
                      f"Taxa: {rate:.1f}/s | "
                      f"Restante: {remaining_time/60:.1f}min | "
                      f"Com saldo: {len(self.funded_wallets)}", end="", flush=True)
            
            # Salva checkpoint periodicamente
            if self.checked_count % BATCH_SIZE == 0:
                self.save_checkpoint()
            
            # Se tem saldo ou transações, adiciona aos resultados
            if balance_satoshis > 0 or tx_count > 0:
                balance_btc = balance_satoshis / 100000000
                result = {
                    'index': index,
                    'address': address,
                    'private_key_wif': private_key,
                    'balance_satoshis': balance_satoshis,
                    'balance_btc': balance_btc,
                    'tx_count': tx_count,
                    'status': 'FUNDED' if balance_satoshis > 0 else 'USED'
                }
                self.funded_wallets.append(result)
                
                print(f"\n  {'✅ SALDO' if balance_satoshis > 0 else '📊 USADO'} ENCONTRADO!")
                print(f"     Índice: {index}")
                print(f"     Endereço: {address}")
                if balance_satoshis > 0:
                    print(f"     Saldo: {balance_btc:.8f} BTC ({balance_satoshis} satoshis)")
                print(f"     Transações: {tx_count}")
                
                # Salva imediatamente quando encontra saldo
                if balance_satoshis > 0:
                    self.save_results()
                
                return result
            
            return None
            
        except Exception as e:
            return None
    
    def save_results(self):
        """Salva resultados"""
        if self.funded_wallets:
            # Ordena por saldo
            self.funded_wallets.sort(key=lambda x: x['balance_satoshis'], reverse=True)
            
            with open(RESULTS_FILE, 'w') as f:
                json.dump(self.funded_wallets, f, indent=2)
    
    def scan_all(self):
        """Varre todas as carteiras"""
        print("=" * 70)
        print("VARREDURA COMPLETA DE CARTEIRAS BITCOIN")
        print("Protocolo TSRA - Transaction Security Real Action")
        print("=" * 70)
        print()
        
        # Lê CSV
        print("📂 Lendo arquivo CSV...")
        wallets = []
        with open(CSV_FILE, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                wallets.append(row)
        
        self.total_wallets = len(wallets)
        print(f"✓ {self.total_wallets:,} carteiras carregadas")
        
        if self.last_checkpoint > 0:
            print(f"📍 Retomando do índice {self.last_checkpoint}")
            print(f"   Já verificadas: {self.last_checkpoint:,}")
            print(f"   Restantes: {self.total_wallets - self.last_checkpoint:,}")
        
        print()
        print(f"⚙️ Configurações:")
        print(f"   Threads paralelas: {MAX_WORKERS}")
        print(f"   Checkpoint a cada: {BATCH_SIZE} verificações")
        print(f"   Tempo estimado: {(self.total_wallets - self.last_checkpoint)/(MAX_WORKERS*2)/60:.0f}-{(self.total_wallets - self.last_checkpoint)/(MAX_WORKERS*1)/60:.0f} minutos")
        print()
        print("🚀 Iniciando varredura...")
        print("   (Pressione Ctrl+C para pausar e salvar progresso)")
        print()
        
        self.start_time = time.time()
        
        # Processa em paralelo
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {
                executor.submit(self.check_wallet, wallet): wallet 
                for wallet in wallets
            }
            
            for future in as_completed(futures):
                if not self.running:
                    break
                try:
                    result = future.result()
                except Exception as e:
                    continue
        
        print("\n")
        print("=" * 70)
        print("VARREDURA CONCLUÍDA")
        print("=" * 70)
        
        elapsed = time.time() - self.start_time
        total_checked = self.checked_count + self.last_checkpoint
        
        print(f"Tempo total: {elapsed/60:.2f} minutos")
        print(f"Total verificado: {total_checked:,}/{self.total_wallets:,}")
        print(f"Taxa média: {self.checked_count/elapsed:.1f} carteiras/segundo")
        print()
        
        # Salva resultados finais
        self.save_checkpoint()
        self.save_results()
        
        # Mostra resumo
        self.show_summary()
    
    def show_summary(self):
        """Mostra resumo dos resultados"""
        if not self.funded_wallets:
            print("❌ Nenhuma carteira com saldo ou histórico encontrada")
            return
        
        print("=" * 70)
        print("RESUMO DOS RESULTADOS")
        print("=" * 70)
        print()
        
        funded = [w for w in self.funded_wallets if w['balance_satoshis'] > 0]
        used = [w for w in self.funded_wallets if w['balance_satoshis'] == 0 and w['tx_count'] > 0]
        
        print(f"📊 Estatísticas:")
        print(f"   Carteiras com saldo: {len(funded)}")
        print(f"   Carteiras usadas (sem saldo): {len(used)}")
        print(f"   Total de interesse: {len(self.funded_wallets)}")
        print()
        
        if funded:
            total_balance = sum(w['balance_satoshis'] for w in funded)
            print(f"💰 Saldo Total: {total_balance/100000000:.8f} BTC ({total_balance:,} satoshis)")
            print()
            
            print("🏆 Top 10 Carteiras com Maior Saldo:")
            for i, wallet in enumerate(funded[:10], 1):
                print(f"\n   {i}. Índice: {wallet['index']}")
                print(f"      Endereço: {wallet['address']}")
                print(f"      Saldo: {wallet['balance_btc']:.8f} BTC")
                print(f"      Transações: {wallet['tx_count']}")
        
        print()
        print(f"💾 Resultados salvos em: {RESULTS_FILE}")
        print(f"📍 Checkpoint salvo em: {CHECKPOINT_FILE}")
        print()

def main():
    """Função principal"""
    scanner = WalletScanner()
    scanner.scan_all()
    print("✅ Varredura finalizada!")
    print()

if __name__ == "__main__":
    main()

