#!/usr/bin/env python3
"""
Monitor de Varredura de Carteiras
Acompanha progresso e notifica quando encontrar saldos
"""

import json
import time
import os
from datetime import datetime

CHECKPOINT_FILE = 'scan_checkpoint.json'
RESULTS_FILE = 'funded_wallets_scan.json'
LOG_FILE = 'scan_output.log'

def format_time(seconds):
    """Formata tempo em horas e minutos"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    return f"{hours}h {minutes}min"

def monitor():
    """Monitora o progresso da varredura"""
    print("=" * 70)
    print("MONITOR DE VARREDURA DE CARTEIRAS")
    print("=" * 70)
    print()
    
    last_checked = 0
    start_time = time.time()
    
    while True:
        try:
            # Lê checkpoint
            if os.path.exists(CHECKPOINT_FILE):
                with open(CHECKPOINT_FILE, 'r') as f:
                    checkpoint = json.load(f)
                    current_checked = checkpoint.get('last_index', 0)
                    funded_count = len(checkpoint.get('funded_wallets', []))
                    timestamp = checkpoint.get('timestamp', '')
            else:
                current_checked = 0
                funded_count = 0
                timestamp = ''
            
            # Calcula progresso
            total = 423190
            progress_pct = (current_checked / total) * 100
            
            # Calcula taxa e tempo estimado
            elapsed = time.time() - start_time
            if elapsed > 0 and current_checked > last_checked:
                rate = (current_checked - last_checked) / elapsed
                remaining = (total - current_checked) / rate if rate > 0 else 0
            else:
                rate = 0
                remaining = 0
            
            # Limpa tela
            os.system('clear')
            
            print("=" * 70)
            print("MONITOR DE VARREDURA - PROTOCOLO TSRA")
            print("=" * 70)
            print()
            
            print(f"📊 Progresso:")
            print(f"   Verificadas: {current_checked:,} / {total:,} ({progress_pct:.2f}%)")
            print(f"   Restantes: {total - current_checked:,}")
            print()
            
            print(f"⚡ Performance:")
            print(f"   Taxa atual: {rate:.1f} carteiras/segundo")
            print(f"   Tempo decorrido: {format_time(elapsed)}")
            print(f"   Tempo estimado restante: {format_time(remaining)}")
            print()
            
            print(f"💰 Resultados:")
            print(f"   Carteiras com saldo: {funded_count}")
            print()
            
            # Mostra últimas linhas do log
            if os.path.exists(LOG_FILE):
                with open(LOG_FILE, 'r') as f:
                    lines = f.readlines()
                    last_lines = lines[-5:] if len(lines) >= 5 else lines
                    
                print(f"📋 Últimas atualizações:")
                for line in last_lines:
                    if line.strip():
                        print(f"   {line.strip()}")
            
            print()
            print(f"🕐 Última atualização: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print()
            print("=" * 70)
            print("Pressione Ctrl+C para sair do monitor (varredura continuará)")
            print("=" * 70)
            
            # Verifica se encontrou carteiras com saldo
            if funded_count > 0:
                print()
                print("🎉" * 35)
                print(f"CARTEIRAS COM SALDO ENCONTRADAS: {funded_count}")
                print("🎉" * 35)
                print()
                
                if os.path.exists(RESULTS_FILE):
                    with open(RESULTS_FILE, 'r') as f:
                        results = json.load(f)
                        
                    print("💎 Detalhes das Carteiras:")
                    for i, wallet in enumerate(results[:5], 1):
                        print(f"\n   {i}. Índice: {wallet['index']}")
                        print(f"      Endereço: {wallet['address']}")
                        print(f"      Saldo: {wallet['balance_btc']:.8f} BTC")
                        print(f"      Status: {wallet['status']}")
                    
                    if len(results) > 5:
                        print(f"\n   ... e mais {len(results) - 5} carteiras")
                    
                    print()
                    print(f"📁 Arquivo completo: {RESULTS_FILE}")
            
            # Atualiza para próxima iteração
            last_checked = current_checked
            start_time = time.time()
            
            # Aguarda 10 segundos
            time.sleep(10)
            
        except KeyboardInterrupt:
            print("\n\n✋ Monitor interrompido pelo usuário")
            print("   A varredura continua em background")
            print()
            break
        except Exception as e:
            print(f"\n⚠️ Erro no monitor: {e}")
            time.sleep(10)

if __name__ == "__main__":
    monitor()

