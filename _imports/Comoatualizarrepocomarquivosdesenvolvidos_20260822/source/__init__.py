"""
NTesteB Autonomous Ecosystem
============================
Ecossistema autônomo com auto-cura, auto-sabedoria e memória persistente de aprendizado.
Arquitetura baseada em LLM + RAG + LangChain com agentes especializados.
"""

__version__ = "2.0.0"
__author__ = "Manus AI"

from src.agents.nexus_llm_engine import NexusLLMEngine
from src.agents.rag_retriever import RAGRetriever
from src.agents.autonomous_agent import AutonomousAgent
from src.agents.memory.persistent_memory import PersistentLearningMemory

__all__ = ["NexusLLMEngine", "RAGRetriever", "AutonomousAgent", "PersistentLearningMemory"]
