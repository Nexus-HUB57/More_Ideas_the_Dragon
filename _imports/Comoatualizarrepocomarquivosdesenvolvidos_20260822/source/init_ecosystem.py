"""
Ecosystem Initializer - Inicializador do Ecossistema Autônomo
============================================================
Este script prepara o ambiente, indexa o código-fonte no Vector Store
e inicia os workflows de autocura e auto-sabedoria.
"""

import os
import logging
from src.agents.rag_retriever import VectorStoreManager
from src.agents.autonomous_agent import AutonomousAgent

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("EcosystemInit")

def initialize():
    project_root = os.path.dirname(os.path.abspath(__file__))
    logger.info(f"Iniciando ecossistema autônomo em: {project_root}")

    # 1. Preparar banco de dados vetorial
    logger.info("Passo 1: Indexando projeto no Vector Store (RAG)...")
    vsm = VectorStoreManager()
    vsm.index_project_files(project_root)
    
    # 2. Inicializar o Agente Autônomo
    logger.info("Passo 2: Inicializando Agente Autônomo...")
    agent = AutonomousAgent(project_root=project_root)
    
    # 3. Executar primeiro ciclo de diagnóstico e auto-cura
    logger.info("Passo 3: Executando diagnóstico inicial de auto-cura...")
    diagnostic = agent.run_self_diagnostic()
    logger.info(f"Resultado do diagnóstico: {diagnostic['status']}")
    
    if 'healing_results' in diagnostic:
        for res in diagnostic['healing_results']:
            logger.info(f"Ação de cura: {res}")

    # 4. Executar primeiro ciclo de auto-sabedoria
    logger.info("Passo 4: Evoluindo sabedoria do sistema...")
    wisdom_evolved = agent.evolve_wisdom()
    if wisdom_evolved:
        logger.info("O sistema aprendeu com o estado atual e evoluiu sua base de conhecimento.")

    logger.info("Ecossistema Autônomo inicializado com sucesso!")

if __name__ == "__main__":
    initialize()
