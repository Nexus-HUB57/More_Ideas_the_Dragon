import random
import time
from pesbm_ai_orchestrator import AICryptoOrchestrator

def run_stress_simulation(iterations=1000):
    orchestrator = AICryptoOrchestrator('agents_config.json')
    stats = {"approved": 0, "blocked": 0, "errors": 0}

    print(f"--- Iniciando Simulação de Estresse: {iterations} Iterações ---")
    start_time = time.time()

    for i in range(iterations):
        # Simula dados de transação aleatórios
        sample_tx = {
            "to": f"bc1q{random.getrandbits(160):x}",
            "amount": round(random.uniform(0.1, 6.0), 4) # Alguns acima do limite de 1.5 BTC
        }

        try:
            # Mock de condições de rede voláteis para o Gas Optimizer
            # (Em um teste real, o orquestrador consultaria a API, aqui simulamos a lógica)
            approved = orchestrator.run_consensus(sample_tx)
            if approved:
                stats["approved"] += 1
            else:
                stats["blocked"] += 1
        except Exception as e:
            stats["errors"] += 1

    end_time = time.time()
    duration = end_time - start_time

    print("\n--- RELATÓRIO DE ESTRESSE IA ---")
    print(f"Duração Total: {duration:.2f}s")
    print(f"Média por Decisão: {(duration/iterations)*1000:.2f}ms")
    print(f"Transações Aprovadas: {stats['approved']}")
    print(f"Transações Bloqueadas: {stats['blocked']} (Risco/Limite/Taxas)")
    print(f"Erros de Sistema: {stats['errors']}")
    print("--------------------------------")

if __name__ == "__main__":
    run_stress_simulation(1000)
