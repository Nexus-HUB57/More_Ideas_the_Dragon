import json
import random
from pesbm_ai_orchestrator import AICryptoOrchestrator

def generate_audit_log(iterations=100):
    orchestrator = AICryptoOrchestrator('agents_config.json')
    logs = []

    print(f"--- Gerando Log de Auditoria do Sentinela: {iterations} Transações ---")

    for i in range(iterations):
        amount = round(random.uniform(0.1, 3.0), 4)
        to_address = f"bc1q{random.getrandbits(160):x}"

        # Simula a verificação do Sentinela
        is_approved = orchestrator.sentinel_check(to_address, amount)

        log_entry = {
            "tx_index": i + 1,
            "address": to_address,
            "amount_btc": amount,
            "sentinel_status": "APPROVED" if is_approved else "BLOCKED",
            "reason": "None" if is_approved else "EXCEEDS_MAX_TX_VALUE_LIMIT (1.5 BTC)"
        }
        logs.append(log_entry)

        if not is_approved:
            print(f"[BLOQUEIO] TX #{i+1}: {amount} BTC para {to_address[:10]}... Motivo: Limite Excedido")

    with open('sentinel_audit.json', 'w') as f:
        json.dump(logs, f, indent=4)
    print(f"\nLog de auditoria salvo em 'sentinel_audit.json'")

if __name__ == "__main__":
    generate_audit_log(100)
