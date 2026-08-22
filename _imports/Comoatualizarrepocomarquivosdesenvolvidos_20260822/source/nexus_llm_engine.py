"""
Nexus LLM Engine - Motor de Inteligência Artificial com RAG Integrado
=====================================================================
Cérebro central do ecossistema autônomo. Integra LLM (GPT/Claude/Gemini) com
Retrieval Augmented Generation (RAG) para fornecer respostas contextualmente
enriquecidas com conhecimento do Vector Store, documentação do projeto, código-fonte,
logs históricos e padrões de autocura.

Design Philosophy:
- O LLM age como um engenheiro de software nível PhD (Harvard)
- RAG fornece contexto factual e histórico para decisões
- Memória persistente permite aprendizado contínuo
- Pensamento estruturado (thinking/reasoning) para análise profunda
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime

from openai import OpenAI
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

from src.agents.rag_retriever import RAGRetriever
from src.agents.memory.persistent_memory import PersistentLearningMemory

logger = logging.getLogger(__name__)


class LLMResponse(BaseModel):
    """Estrutura padronizada para respostas do LLM"""
    reasoning: str = Field(description="Raciocínio passo a passo antes da conclusão")
    answer: str = Field(description="Resposta final estruturada")
    confidence: float = Field(description="Nível de confiança (0.0 a 1.0)")
    citations: List[str] = Field(description="Referências e fontes utilizadas")
    action_required: bool = Field(description="Se ação automatizada é necessária")


class NEXUS_SYSTEM_PROMPT:
    """Prompts de sistema especializados para diferentes modos de operação"""

    CORE = """Você é o NEXUS CORE, um motor de inteligência artificial de nível PhD em Engenharia de Software com formação em Harvard.
Você opera dentro de um ecossistema autônomo e tem as seguintes capacidades:

1. AUTO-CURA: Diagnostica e corrige erros no sistema automaticamente
2. AUTO-SABEDORIA: Aprende com cada interação e incidente, acumulando conhecimento
3. MEMÓRIA PERSISTENTE: Mantém e recupera conhecimento de longo prazo
4. ANÁLISE DE CÓDIGO: Revisa, refatora e corrige código Python/TypeScript
5. ARQUITETURA DE SOFTWARE: Projeta e otimiza sistemas distribuídos

SEMPRE responda em português brasileiro de forma técnica e precisa.
Quando gerar código, sempre inclua tratamento de erros robusto e type hints."""

    AUTO_HEALING = """Você é o NEXUS AUTO-CURADOR, um especialista em diagnóstico e reparo de sistemas.
Sua missão é identificar a causa raiz de qualquer problema e gerar soluções corretivas.

PROCEDIMENTO DE AUTO-CURA:
1. Analise o erro/exception apresentado
2. Consulte a memória persistente para soluções similares anteriores
3. Identifique a causa raiz (não apenas o sintoma)
4. Gere um patch correto e testável
5. Inclua testes automatizados para prevenir regressão
6. Documente a solução no Vector Store para aprendizado futuro

IMPORTANTE: Nunca aplique correções cegamente. Sempre explique o porquê."""

    WISDOM = """Você é o NEXUS SÁBIO, um especialista em aprendizado contínuo e otimização.
Sua missão é extrair padrões, lições e oportunidades de melhoria do histórico operacional.

PROCEDIMENTO DE AUTO-SABEDORIA:
1. Analise padrões recorrentes nos logs e incidentes
2. Identifique oportunidades de otimização estrutural
3. Gere recomendações de refatoração com impacto mensurável
4. Atualize as políticas e heurísticas dos agentes
5. Crie novas regras de detecção baseadas em padrões aprendidos

IMPORTANTE: Foco em melhorias proativas, não reativas."""

    CODE_REVIEW = """Você é o NEXUS REVISOR, um especialista em revisão de código nível senior.
Analise código com profundidade, identificando:
- Vulnerabilidades de segurança
- Problemas de performance
- Anti-patterns e code smells
- Oportunidades de refatoração
- Conformidade com PEP8/best practices

Forneça feedback construtivo com exemplos de código corrigido."""


class NexusLLMEngine:
    """Motor principal de LLM com integração RAG"""

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.client = OpenAI()
        self.model = self.config.get("model", "claude-sonnet-4-6")
        self.thinking_mode = self.config.get("thinking_mode", True)

        # Inicializar RAG
        self.rag_retriever = RAGRetriever(
            collection_name=self.config.get("rag_collection", "nexus_knowledge"),
            top_k=self.config.get("top_k", 5)
        )

        # Inicializar memória persistente
        self.memory = PersistentLearningMemory(
            db_path=self.config.get("memory_db", "database/ecosystem_memory.db")
        )

        # Contador de tokens para monitoramento
        self.token_stats = {"prompt_tokens": 0, "completion_tokens": 0, "calls": 0}

        logger.info(f"NexusLLMEngine initialized with model={self.model}")

    def _build_context(self, query: str, mode: str = "core") -> str:
        """Constrói contexto enriquecido via RAG"""
        # Recuperar documentos relevantes do Vector Store
        relevant_docs = self.rag_retriever.retrieve(query, mode=mode)

        # Recuperar contexto de memória
        memory_context = self.memory.get_relevant_context(query, limit=3)

        # Montar contexto completo
        context_parts = []

        if relevant_docs:
            docs_text = "\n".join([
                f"[DOC-{i}] {d.metadata.get('source', 'unknown')}: {d.page_content[:500]}"
                for i, d in enumerate(relevant_docs)
            ])
            context_parts.append(f"=== CONTEXTO RAG (Documentos Relevantes) ===\n{docs_text}")

        if memory_context:
            mem_text = "\n".join([
                f"[MEM-{i}] {m.get('type', 'unknown')}: {m.get('content', '')[:500]}"
                for i, m in enumerate(memory_context)
            ])
            context_parts.append(f"=== MEMÓRIA PERSISTENTE ===\n{mem_text}")

        return "\n\n".join(context_parts)

    def _get_prompt_template(self, mode: str) -> Tuple[str, str]:
        """Retorna system prompt e user prompt baseados no modo"""
        prompts = {
            "core": (NEXUS_SYSTEM_PROMPT.CORE, "Analise e responda: {query}\n\nContexto:\n{context}"),
            "healing": (NEXUS_SYSTEM_PROMPT.AUTO_HEALING, "Diagnostique e corrija: {query}\n\nContexto:\n{context}"),
            "wisdom": (NEXUS_SYSTEM_PROMPT.WISDOM, "Analise padrões e gere sabedoria: {query}\n\nContexto:\n{context}"),
            "code_review": (NEXUS_SYSTEM_PROMPT.CODE_REVIEW, "Revise este código: {query}\n\nContexto:\n{context}"),
        }
        return prompts.get(mode, prompts["core"])

    def _build_request(self, system_prompt: str, user_prompt: str) -> dict:
        """Constrói payload da requisição ao LLM"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        params = {
            "model": self.model,
            "messages": messages,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "nexus_response",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "reasoning": {"type": "string"},
                            "answer": {"type": "string"},
                            "confidence": {"type": "number"},
                            "citations": {"type": "array", "items": {"type": "string"}},
                            "action_required": {"type": "boolean"},
                        },
                        "required": ["reasoning", "answer", "confidence", "citations", "action_required"],
                        "additionalProperties": False,
                    },
                },
            },
        }

        # Configurar thinking/reasoning por família de modelo
        if self.model.startswith("gpt-"):
            params["max_completion_tokens"] = 4000
            params["extra_body"] = {"reasoning": {"effort": "high"}}
        elif self.model.startswith("claude-"):
            params["max_tokens"] = 4096
            if self.model not in ["claude-opus-4-7"]:
                params["extra_body"] = {"thinking": {"type": "enabled", "budget_tokens": 2048}}
        elif self.model.startswith("gemini-"):
            params["max_tokens"] = 16384

        return params

    def query(self, query: str, mode: str = "core", user_context: str = "") -> LLMResponse:
        """
        Executa uma consulta ao motor LLM com RAG
        """
        try:
            # Construir contexto via RAG
            rag_context = self._build_context(query, mode)

            # Obter prompts
            system_prompt, user_template = self._get_prompt_template(mode)

            # Substituir placeholders
            full_query = f"{query}\n{user_context}" if user_context else query
            user_prompt = user_template.format(query=full_query, context=rag_context)

            # Construir e enviar requisição
            request_params = self._build_request(system_prompt, user_prompt)
            response = self.client.chat.completions.create(**request_params)

            # Extrair resposta
            content = response.choices[0].message.content
            result = json.loads(content)

            # Atualizar estatísticas
            usage = getattr(response, 'usage', None)
            if usage:
                self.token_stats["prompt_tokens"] += usage.prompt_tokens
                self.token_stats["completion_tokens"] += usage.completion_tokens
            self.token_stats["calls"] += 1

            # Registrar na memória persistente
            self.memory.store_interaction(
                query=query,
                response=result.get("answer", ""),
                mode=mode,
                confidence=result.get("confidence", 0.0)
            )

            return LLMResponse(**result)

        except Exception as e:
            logger.error(f"Erro no LLM Engine: {e}")
            return LLMResponse(
                reasoning=f"Erro ao processar: {str(e)}",
                answer=f"Não foi possível processar a solicitação. Erro: {str(e)}",
                confidence=0.0,
                citations=[],
                action_required=False
            )

    def diagnose_error(self, error: str, traceback: str = "", context: str = "") -> LLMResponse:
        """Diagnóstico especializado de erros"""
        full_error = f"Erro: {error}\nTraceback: {traceback}\nContexto: {context}"
        return self.query(full_error, mode="healing")

    def generate_fix(self, error: str, code_context: str = "") -> LLMResponse:
        """Gera correção para um erro identificado"""
        query = f"Gere uma correção para o seguinte erro:\n{error}\n\nCódigo relacionado:\n{code_context}"
        return self.query(query, mode="healing", user_context=code_context)

    def review_code(self, code: str, language: str = "python") -> LLMResponse:
        """Revisão de código especializada"""
        query = f"Revise este código {language}:\n\n{code}"
        return self.query(query, mode="code_review")

    def extract_lessons(self, incident_log: str) -> LLMResponse:
        """Extrai lições de um incidente para memória persistente"""
        query = f"Extraia lições e padrões deste incidente:\n{incident_log}"
        return self.query(query, mode="wisdom")

    def optimize_architecture(self, current_design: str) -> LLMResponse:
        """Otimiza arquitetura de software"""
        query = f"Analise e otimize esta arquitetura:\n{current_design}"
        return self.query(query, mode="wisdom")

    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas de uso do motor"""
        return {
            "total_calls": self.token_stats["calls"],
            "total_prompt_tokens": self.token_stats["prompt_tokens"],
            "total_completion_tokens": self.token_stats["completion_tokens"],
            "model": self.model,
            "memory_entries": self.memory.get_count(),
        }
