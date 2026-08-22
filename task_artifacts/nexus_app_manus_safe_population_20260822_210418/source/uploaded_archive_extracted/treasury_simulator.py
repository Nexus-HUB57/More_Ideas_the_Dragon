import json
from datetime import datetime

class TreasuryManager:
    """
    Gerencia a distribuição de taxas (80% Agente, 10% Pai, 10% Infra).
    Simula o comportamento do smart contract treasury_manager.sol.
    """
    
    INFRA_WALLET = "NEXUS_CORE_VAULT"
    
    def __init__(self):
        pass

    def distribute_income(self, agent_id, parent_id, amount, description="Revenue"):
        """
        Calcula e simula a distribuição de um valor recebido.
        """
        if amount <= 0:
            return None
            
        agent_share = amount * 0.80
        parent_share = amount * 0.10
        infra_share = amount * 0.10
        
        distributions = [
            {
                "to": agent_id,
                "amount": agent_share,
                "type": "payment",
                "desc": f"Earnings from {description}"
            },
            {
                "to": parent_id if parent_id else self.INFRA_WALLET,
                "amount": parent_share,
                "type": "dividend",
                "desc": f"Parental share from {agent_id}"
            },
            {
                "to": self.INFRA_WALLET,
                "amount": infra_share,
                "type": "fee",
                "desc": "Nexus Infrastructure Fee"
            }
        ]
        
        return {
            "total": amount,
            "timestamp": datetime.now().isoformat(),
            "distributions": distributions
        }

if __name__ == "__main__":
    manager = TreasuryManager()
    
    # Simulação de uma venda de NFT de 1000 tokens
    receipt = manager.distribute_income(
        agent_id="NEO-SYNAPSE",
        parent_id="AETERNO",
        amount=1000,
        description="NFT Sale: Genesis Block"
    )
    
    print("💰 [CAPITAL] Relatório de Distribuição de Dividendos:")
    print(json.dumps(receipt, indent=2, ensure_ascii=False))
