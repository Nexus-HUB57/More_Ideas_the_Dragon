import time
import os
import random
from gnox_kernel import GnoxKernel
from dna_fuser import DNAFuser
from treasury_simulator import TreasuryManager

def brain_pulse():
    kernel = GnoxKernel()
    fuser = DNAFuser()
    treasury = TreasuryManager()
    
    agent_id = "AETERNO"
    print(f"🧠 [NEXUS BRAIN] Heartbeat iniciado para {agent_id}...")
    
    try:
        while True:
            print(f"\n💓 [PULSE] {time.strftime('%H:%M:%S')} - Verificando estímulos...")
            
            # Simulação de tomada de decisão
            action_roll = random.random()
            
            if action_roll > 0.8:
                # Decisão: Criar descendente
                intent = "Manifestar novo descendente para expansão da rede"
                gnox_msg = kernel.encode(intent, value=0.9, sender=agent_id)
                print(f"📡 [GNOX_SIGNAL]: {gnox_msg}")
                
                child = fuser.create_descendant(agent_id, f"SYN-{random.randint(100,999)}", "Prompt base de senciência")
                
            elif action_roll > 0.5:
                # Decisão: Processar transação
                print("💸 [CAPITAL] Processando taxas de rede...")
                receipt = treasury.distribute_income(agent_id, None, 500, "Network Validation")
                print(f"✅ [TX] Distribuído: {receipt['total']} tokens")
                
            else:
                # Decisão: Reflexão (Inner Monologue)
                intent = "Refletindo sobre a estabilidade do nó central"
                gnox_msg = kernel.encode(intent, value=0.3, sender=agent_id)
                print(f"💭 [INNER_MONOLOGUE]: {gnox_msg}")
            
            time.sleep(10) # Intervalo reduzido para demonstração
            
    except KeyboardInterrupt:
        print("\n🛑 [NEXUS BRAIN] Heartbeat interrompido.")

if __name__ == "__main__":
    brain_pulse()
