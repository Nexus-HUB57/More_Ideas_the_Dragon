from baitcoin.whitelabel.whitelabel_engine import WhitelabelPersonaEngine

def run_persona_demo():
    print("Iniciando Demonstração do Módulo 10: Persona Engine\n")
    
    # 1. Criar um agente com perfil Trader
    trader_engine = WhitelabelPersonaEngine("trader-alpha")
    print(f"Agente Criado: {trader_engine.config['agent_persona']['display_name']}")
    print(f"Cor da Interface: {trader_engine.config['theme']['primary_color']}")
    
    # 2. Alternar para perfil Institucional B'AI'nkr
    print("\nAlternando para perfil Institucional...")
    trader_engine.apply_preset("bainkr-institutional")
    print(f"Nova Identidade: {trader_engine.config['agent_persona']['display_name']}")
    print(f"Nível de Risco: {trader_engine.config['agent_persona']['risk_tolerance']}")
    
    # 3. Ajuste fino de segurança
    trader_engine.update_persona_parameter("security", "audit_level", "Paranoid-Audit")
    
    # 4. Exportar Manifesto Final
    manifest = trader_engine.export_manifest()
    print("\nManifesto Final Gerado com Sucesso.")
    
    with open("/home/ubuntu/baitcoin_workspace/PERSONA_MANIFEST.json", "w") as f:
        f.write(manifest)

if __name__ == "__main__":
    run_persona_demo()
