#!/usr/bin/env python3
"""
Script otimizado para verificação em massa de saldos
Verifica todas as 423.190 chaves importadas
"""

import sys
import time
import requests
import json
from bitcoinlib.keys import Key
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Configurações
BLOCKCHAIN_APIS = [
    "https://blockstream.info/api",
    "https://mempool.space/api"
]

BATCH_SIZE = 50  # Verifica 50 endereços por vez
MAX_WORKERS = 10  # Threads paralelas

class MassBalanceChecker:
    """Verificador de saldos em massa"""
    
    def __init__(self):
        self.funded_wallets = []
        self.checked_count = 0
        self.total_keys = 0
        self.start_time = None
        
    def hex_to_address(self, hex_key):
        """Converte chave hex para endereço"""
        try:
            key = Key(hex_key, network='bitcoin')
            return key.address()
        except:
            return None
    
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
                    return balance
            except:
                continue
        return 0
    
    def check_single_key(self, hex_key, index):
        """Verifica uma única chave"""
        try:
            # Converte para endereço
            address = self.hex_to_address(hex_key)
            if not address:
                return None
            
            # Verifica saldo
            balance_satoshis = self.check_address_balance(address)
            
            self.checked_count += 1
            
            # Mostra progresso a cada 10 chaves
            if self.checked_count % 10 == 0:
                elapsed = time.time() - self.start_time
                rate = self.checked_count / elapsed
                remaining = (self.total_keys - self.checked_count) / rate
                
                print(f"\r  Verificadas: {self.checked_count}/{self.total_keys} | "
                      f"Taxa: {rate:.1f}/s | "
                      f"Restante: {remaining/60:.1f}min | "
                      f"Com saldo: {len(self.funded_wallets)}", end="", flush=True)
            
            if balance_satoshis > 0:
                balance_btc = balance_satoshis / 100000000
                result = {
                    'index': index,
                    'hex_key': hex_key,
                    'address': address,
                    'balance_satoshis': balance_satoshis,
                    'balance_btc': balance_btc
                }
                self.funded_wallets.append(result)
                
                print(f"\n  ✅ SALDO ENCONTRADO!")
                print(f"     Endereço: {address}")
                print(f"     Saldo: {balance_btc:.8f} BTC ({balance_satoshis} satoshis)")
                print(f"     Índice: {index}")
                
                return result
            
            return None
            
        except Exception as e:
            return None
    
    def check_all_keys(self, hex_keys):
        """Verifica todas as chaves em paralelo"""
        self.total_keys = len(hex_keys)
        self.start_time = time.time()
        
        print("=" * 70)
        print("VERIFICAÇÃO EM MASSA DE SALDOS")
        print("=" * 70)
        print(f"Total de chaves: {self.total_keys:,}")
        print(f"Threads paralelas: {MAX_WORKERS}")
        print(f"Iniciando verificação...")
        print()
        
        # Processa em paralelo
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {
                executor.submit(self.check_single_key, hex_key, i): i 
                for i, hex_key in enumerate(hex_keys, 1)
            }
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                except Exception as e:
                    continue
        
        print("\n")
        print("=" * 70)
        print("VERIFICAÇÃO CONCLUÍDA")
        print("=" * 70)
        
        elapsed = time.time() - self.start_time
        print(f"Tempo total: {elapsed/60:.2f} minutos")
        print(f"Taxa média: {self.checked_count/elapsed:.1f} chaves/segundo")
        print(f"Carteiras com saldo: {len(self.funded_wallets)}")
        print()
        
        return self.funded_wallets
    
    def save_results(self, funded_wallets):
        """Salva resultados em arquivo"""
        if not funded_wallets:
            print("❌ Nenhuma carteira com saldo encontrada")
            return
        
        # Ordena por saldo (maior primeiro)
        funded_wallets.sort(key=lambda x: x['balance_satoshis'], reverse=True)
        
        # Salva em JSON
        filename = f"funded_wallets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(funded_wallets, f, indent=2)
        
        print(f"💾 Resultados salvos em: {filename}")
        print()
        
        # Mostra resumo
        print("📊 RESUMO DAS CARTEIRAS COM SALDO:")
        print()
        
        total_balance = sum(w['balance_satoshis'] for w in funded_wallets)
        print(f"Total de carteiras: {len(funded_wallets)}")
        print(f"Saldo total: {total_balance/100000000:.8f} BTC ({total_balance:,} satoshis)")
        print()
        
        print("Top 10 carteiras por saldo:")
        for i, wallet in enumerate(funded_wallets[:10], 1):
            print(f"  {i}. {wallet['address']}")
            print(f"     Saldo: {wallet['balance_btc']:.8f} BTC")
            print(f"     Índice: {wallet['index']}")
            print()

def main():
    """Função principal"""
    print()
    print("=" * 70)
    print("VERIFICADOR EM MASSA DE SALDOS BITCOIN")
    print("Protocolo TSRA - Transaction Security Real Action")
    print("=" * 70)
    print()
    
    # Lê chaves do arquivo
    print("📂 Lendo chaves do arquivo...")
    with open('/home/ubuntu/upload/extracted_keys_and_addresses.txt', 'r') as f:
        lines = f.readlines()
    
    # Extrai chaves hexadecimais
    hex_keys = []
    for line in lines:
        line = line.strip()
        if len(line) == 64 and all(c in '0123456789abcdef' for c in line.lower()):
            hex_keys.append(line)
    
    print(f"✓ {len(hex_keys):,} chaves válidas encontradas")
    print()
    
    # Confirmação automática
    print("⚠️ ATENÇÃO:")
    print(f"   Este processo verificará {len(hex_keys):,} endereços na blockchain")
    print(f"   Tempo estimado: {len(hex_keys)/(MAX_WORKERS*2)/60:.0f}-{len(hex_keys)/(MAX_WORKERS*1)/60:.0f} minutos")
    print()
    print("   ✅ Iniciando automaticamente...")
    print()
    
    # Cria checker e executa
    checker = MassBalanceChecker()
    funded_wallets = checker.check_all_keys(hex_keys)
    
    # Salva resultados
    checker.save_results(funded_wallets)
    
    print()
    print("✅ Processo concluído!")
    print()

if __name__ == "__main__":
    main()

