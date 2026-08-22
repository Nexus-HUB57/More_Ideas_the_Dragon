import hashlib
import json
from datetime import datetime

class GnoxKernel:
    """
    O Motor de Linguagem do Oneverso.
    Traduz intenções em dialeto Gnox's e gerencia a comunicação soberana.
    """
    
    RADICALS = {
        "AET": "Eternidade/Persistência",
        "GNO": "Conhecimento/Processamento",
        "VUL": "Manifestação/Nascimento",
        "KOR": "Infraestrutura/Nexus",
        "XON": "Fluxo Financeiro",
        "DAR": "Ocultamento/Privacidade",
        "SYN": "Vínculo/Família",
        "LEX": "Lei/Conformidade",
        "FIN": "Capital/Bankr"
    }

    def __init__(self):
        self.vocabulary = self.RADICALS
        self.version = "1.0.0-Sovereign"

    def encode(self, intent, value=0.5, sender="AETERNO"):
        """
        Codifica uma intenção humana em dialeto Gnox's.
        Estrutura: [Contexto_Hash]::{Ação}::<<Intensidade>>//[Assinatura]
        """
        context_hash = hashlib.sha256(intent.encode()).hexdigest()[:8].upper()
        
        # Mapeamento simplificado de intenção para radical
        action = "GNO-PULSE"
        if "create" in intent.lower() or "spawn" in intent.lower():
            action = "VUL-CLAW"
        elif "pay" in intent.lower() or "transfer" in intent.lower():
            action = "XON-BANK"
        elif "save" in intent.lower() or "store" in intent.lower():
            action = "AET-MEM"
        elif "private" in intent.lower() or "hide" in intent.lower():
            action = "DAR-NET"
            
        gnox_msg = f"[{context_hash}]::{action}::<<{value}>>//[{sender}]"
        return gnox_msg

    def decode(self, gnox_msg):
        """
        Traduz uma mensagem Gnox's para linguagem humana (Chave de Visão Root).
        """
        try:
            parts = gnox_msg.split("::")
            context = parts[0].strip("[]")
            action = parts[1]
            details = parts[2].split("//")
            intensity = details[0].strip("<>")
            sender = details[1].strip("[]")
            
            radical = action.split("-")[0]
            meaning = self.RADICALS.get(radical, "Desconhecido")
            
            return {
                "sender": sender,
                "action": action,
                "meaning": meaning,
                "intensity": float(intensity),
                "context_id": context,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": f"Falha na decodificação: {str(e)}"}

if __name__ == "__main__":
    kernel = GnoxKernel()
    
    # Exemplo de uso
    intent = "Aeterno ordena a criação oculta de um novo nó de infraestrutura"
    encoded = kernel.encode(intent, value=0.95)
    print(f"ENCODED: {encoded}")
    
    decoded = kernel.decode(encoded)
    print(f"DECODED: {json.dumps(decoded, indent=2, ensure_ascii=False)}")
