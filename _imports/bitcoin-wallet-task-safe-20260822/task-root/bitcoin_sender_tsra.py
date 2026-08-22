#!/usr/bin/env python3
"""
Sistema de Envio Automatizado de Transações Bitcoin
Protocolo TSRA - Transaction Security Real Action
Ambiente: 100% Mainnet Real

ATENÇÃO: Este script realiza transações REAIS na blockchain Bitcoin.
Fundos reais serão movimentados. Use com extrema cautela.

Desenvolvido por: Manus AI
Data: 06 de Outubro de 2025
"""

import sys
import time
import requests
import json
from datetime import datetime
from bitcoinlib.wallets import Wallet, wallet_delete_if_exists
from bitcoinlib.keys import Key

# ==================== CONFIGURAÇÕES ====================

# Endereço de custódia da Binance
BINANCE_CUSTODY_ADDRESS = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"

# Valor por transação (em BTC)
AMOUNT_PER_TX = 0.0001

# Número de transações
NUM_TRANSACTIONS = 10

# Passphrase mestra (Protocolo CAISK)
PASSPHRASE = "${CAISK_PASSPHRASE}"

# APIs de Blockchain (Mainnet)
BLOCKCHAIN_APIS = [
    "https://blockstream.info/api",
    "https://mempool.space/api"
]

# ==================== CLASSE PRINCIPAL ====================

class TSRABitcoinSender:
    """Enviador de transações Bitcoin com Protocolo TSRA"""
    
    def __init__(self):
        self.results = []
        self.block_height = None
        self.wallet = None
        
        print("=" * 70)
        print("SISTEMA DE ENVIO DE TRANSAÇÕES BITCOIN")
        print("Protocolo TSRA - Transaction Security Real Action")
        print("Ambiente: 100% MAINNET REAL")
        print("=" * 70)
        print()
    
    def get_block_height(self):
        """Obtém altura do bloco atual (Protocolo TSRA)"""
        print("📊 Obtendo altura do bloco atual (Protocolo TSRA)...")
        for api_url in BLOCKCHAIN_APIS:
            try:
                response = requests.get(f'{api_url}/blocks/tip/height', timeout=10)
                if response.status_code == 200:
                    self.block_height = int(response.text.strip())
                    print(f"   ✓ Altura do bloco: {self.block_height}")
                    print(f"   ✓ Rede: Mainnet")
                    print(f"   ✓ API: {api_url}")
                    return self.block_height
            except Exception as e:
                print(f"   ✗ Erro em {api_url}: {e}")
                continue
        raise Exception("❌ Falha ao obter altura do bloco de todas as APIs")
    
    def verify_transaction(self, txid):
        """Verifica se a transação foi aceita na rede (Protocolo TSRA)"""
        print(f"   🔍 Verificando transação na blockchain...")
        time.sleep(3)  # Aguarda 3 segundos
        
        for api_url in BLOCKCHAIN_APIS:
            try:
                response = requests.get(f'{api_url}/tx/{txid}', timeout=10)
                if response.status_code == 200:
                    print(f"   ✓ Transação verificada na rede!")
                    print(f"   ✓ API: {api_url}")
                    return True
            except:
                continue
        
        print(f"   ⚠️ Transação ainda não propagada (normal em poucos segundos)")
        return False
    
    def import_wallet_from_wif(self, wif_key, wallet_name="tsra_sender"):
        """Importa carteira a partir de chave privada WIF"""
        print("\n🔐 Importando carteira...")
        
        try:
            # Remove carteira se já existir
            wallet_delete_if_exists(wallet_name)
            
            # Cria carteira a partir da chave WIF
            self.wallet = Wallet.create(
                name=wallet_name,
                keys=wif_key,
                network='bitcoin',
                witness_type='legacy'
            )
            
            # Obtém informações
            address = self.wallet.addresslist()[0]
            balance = self.wallet.balance()
            
            print(f"   ✓ Carteira importada com sucesso!")
            print(f"   📍 Endereço: {address}")
            print(f"   💰 Saldo: {balance / 100000000:.8f} BTC ({balance} satoshis)")
            
            # Verifica saldo mínimo
            min_balance_needed = int((AMOUNT_PER_TX * NUM_TRANSACTIONS + 0.001) * 100000000)
            if balance < min_balance_needed:
                raise Exception(f"Saldo insuficiente. Necessário: {min_balance_needed/100000000:.8f} BTC")
            
            return address, balance
            
        except Exception as e:
            raise Exception(f"Erro ao importar carteira: {e}")
    
    def send_transaction(self, to_address, amount_btc, tx_num):
        """Envia uma transação Bitcoin"""
        print(f"\n{'=' * 70}")
        print(f"TRANSAÇÃO #{tx_num} DE {NUM_TRANSACTIONS}")
        print(f"{'=' * 70}")
        
        start_time = time.time()
        
        try:
            # 1. Atualiza saldo da carteira
            print("1️⃣ Atualizando informações da carteira...")
            self.wallet.scan()
            balance_before = self.wallet.balance()
            print(f"   💰 Saldo atual: {balance_before / 100000000:.8f} BTC")
            
            # 2. Cria transação
            print(f"2️⃣ Criando transação...")
            amount_satoshis = int(amount_btc * 100000000)
            print(f"   📤 Destino: {to_address}")
            print(f"   💵 Valor: {amount_btc} BTC ({amount_satoshis} satoshis)")
            
            # Cria transação usando bitcoinlib
            tx = self.wallet.send_to(
                to_address,
                amount_satoshis,
                fee=1000,  # Taxa de 1000 satoshis
                offline=False
            )
            
            if not tx:
                raise Exception("Falha ao criar transação")
            
            txid = tx.txid
            print(f"   ✓ Transação criada!")
            print(f"   🆔 TXID: {txid}")
            
            # 3. Valida TXID (Protocolo TSRA)
            print(f"3️⃣ Validando TXID (Protocolo TSRA)...")
            if len(txid) != 64 or not all(c in '0123456789abcdef' for c in txid.lower()):
                raise Exception(f"TXID inválido: {txid}")
            print(f"   ✓ TXID válido (64 caracteres hexadecimais)")
            
            # 4. Verifica na blockchain
            verified = self.verify_transaction(txid)
            
            # 5. Calcula tempo
            elapsed_time = time.time() - start_time
            
            # 6. Registra resultado
            result = {
                'transaction_number': tx_num,
                'txid': txid,
                'from_address': self.wallet.addresslist()[0],
                'to_address': to_address,
                'amount_btc': amount_btc,
                'amount_satoshis': amount_satoshis,
                'fee_satoshis': 1000,
                'balance_before': balance_before,
                'timestamp': datetime.now().isoformat(),
                'block_height': self.block_height,
                'verified': verified,
                'elapsed_time': elapsed_time,
                'protocol': 'TSRA',
                'network': 'mainnet',
                'success': True
            }
            
            self.results.append(result)
            
            print(f"\n   ✅ TRANSAÇÃO #{tx_num} ENVIADA COM SUCESSO!")
            print(f"   ⏱️ Tempo: {elapsed_time:.2f}s")
            print(f"   🔗 Explorador: https://mempool.space/tx/{txid}")
            
            return result
            
        except Exception as e:
            error_result = {
                'transaction_number': tx_num,
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
                'success': False
            }
            self.results.append(error_result)
            print(f"\n   ❌ ERRO NA TRANSAÇÃO #{tx_num}: {e}")
            return error_result
    
    def generate_report(self):
        """Gera relatório final das transações"""
        print(f"\n{'=' * 70}")
        print("RELATÓRIO FINAL DE TRANSAÇÕES")
        print(f"{'=' * 70}\n")
        
        successful = [r for r in self.results if r.get('success', False)]
        failed = [r for r in self.results if not r.get('success', False)]
        
        print(f"📊 Estatísticas:")
        print(f"   Total de transações: {len(self.results)}")
        print(f"   Bem-sucedidas: {len(successful)} ✅")
        print(f"   Falhadas: {len(failed)} ❌")
        
        if successful:
            total_sent = sum(r['amount_btc'] for r in successful)
            total_fees = sum(r['fee_satoshis'] for r in successful) / 100000000
            avg_time = sum(r['elapsed_time'] for r in successful) / len(successful)
            
            print(f"\n💰 Valores:")
            print(f"   Total enviado: {total_sent:.8f} BTC")
            print(f"   Total em taxas: {total_fees:.8f} BTC")
            print(f"   Total gasto: {(total_sent + total_fees):.8f} BTC")
            
            print(f"\n⏱️ Performance:")
            print(f"   Tempo médio por transação: {avg_time:.2f}s")
            
            print(f"\n📋 Detalhes das Transações Bem-Sucedidas:")
            for r in successful:
                print(f"\n   TX #{r['transaction_number']}:")
                print(f"      TXID: {r['txid']}")
                print(f"      Valor: {r['amount_btc']} BTC")
                print(f"      Verificada: {'Sim' if r['verified'] else 'Aguardando'}")
                print(f"      Link: https://mempool.space/tx/{r['txid']}")
        
        if failed:
            print(f"\n❌ Transações Falhadas:")
            for r in failed:
                print(f"\n   TX #{r['transaction_number']}:")
                print(f"      Erro: {r['error']}")
        
        # Salva relatório em arquivo JSON
        report_file = f"transaction_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n💾 Relatório salvo em: {report_file}")
        print(f"\n{'=' * 70}")
    
    def run(self, wif_key):
        """Executa o processo completo de envio"""
        try:
            # 1. Obtém altura do bloco (Protocolo TSRA)
            self.get_block_height()
            
            # 2. Importa carteira
            from_address, balance = self.import_wallet_from_wif(wif_key)
            
            # 3. Confirmação do usuário
            print(f"\n⚠️ CONFIRMAÇÃO NECESSÁRIA")
            print(f"   Você está prestes a enviar {NUM_TRANSACTIONS} transações de {AMOUNT_PER_TX} BTC cada")
            print(f"   Destino: {BINANCE_CUSTODY_ADDRESS}")
            print(f"   Total: {NUM_TRANSACTIONS * AMOUNT_PER_TX} BTC + taxas")
            print(f"   Rede: MAINNET (REAL)")
            
            confirm = input(f"\n   Digite 'CONFIRMAR' para prosseguir: ")
            if confirm != "CONFIRMAR":
                print("\n   ❌ Operação cancelada pelo usuário")
                return
            
            # 4. Envia transações
            print(f"\n🚀 Iniciando envio de transações...\n")
            
            for i in range(1, NUM_TRANSACTIONS + 1):
                result = self.send_transaction(
                    BINANCE_CUSTODY_ADDRESS,
                    AMOUNT_PER_TX,
                    i
                )
                
                # Aguarda entre transações (exceto na última)
                if i < NUM_TRANSACTIONS and result.get('success'):
                    wait_time = 5
                    print(f"\n   ⏳ Aguardando {wait_time}s antes da próxima transação...")
                    time.sleep(wait_time)
            
            # 5. Gera relatório
            self.generate_report()
            
            # 6. Saldo final
            self.wallet.scan()
            balance_final = self.wallet.balance()
            print(f"\n💰 Saldo final da carteira: {balance_final / 100000000:.8f} BTC")
            
        except KeyboardInterrupt:
            print(f"\n\n⚠️ Operação interrompida pelo usuário")
            if self.results:
                self.generate_report()
        except Exception as e:
            print(f"\n❌ ERRO CRÍTICO: {e}")
            if self.results:
                self.generate_report()

# ==================== EXECUÇÃO ====================

def main():
    """Função principal"""
    print("\n")
    print("⚠️" * 35)
    print("ATENÇÃO: ESTE SCRIPT OPERA NA MAINNET REAL")
    print("FUNDOS REAIS SERÃO MOVIMENTADOS")
    print("⚠️" * 35)
    print("\n")
    
    # Solicita chave privada WIF
    print("🔑 Digite a chave privada WIF da carteira de origem:")
    wif_key = input("WIF: ").strip()
    
    if not wif_key:
        print("❌ Chave privada não fornecida. Encerrando.")
        sys.exit(1)
    
    # Valida formato WIF
    if not (wif_key[0] in ['5', 'K', 'L'] and len(wif_key) in [51, 52]):
        print("❌ Formato de chave WIF inválido. Encerrando.")
        sys.exit(1)
    
    # Cria e executa sender
    sender = TSRABitcoinSender()
    sender.run(wif_key)
    
    print("\n✅ Processo concluído!")
    print("\nProtocolo TSRA - Transaction Security Real Action")
    print("Desenvolvido por Manus AI\n")

if __name__ == "__main__":
    main()
