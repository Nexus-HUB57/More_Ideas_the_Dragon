"""
RAG Retriever - Sistema de Recuperação Aumentada por Geração
=============================================================
Gerencia o Vector Store (ChromaDB) com embeddings para:
- Documentação do projeto
- Código-fonte e snippets
- Logs de erros e incidentes
- Soluções históricas de autocura
- Padrões e melhores práticas
- Resultados de análises anteriores
"""

import os
import hashlib
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

import chromadb
from chromadb.config import Settings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)


class VectorStoreManager:
    """Gerencia o banco de dados vetorial ChromaDB"""

    def __init__(self, persist_dir: str = "database/chroma_db"):
        os.makedirs(persist_dir, exist_ok=True)
        self.persist_dir = persist_dir

        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )

        self.collections: Dict[str, chromadb.Collection] = {}
        self._text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        logger.info(f"VectorStoreManager initialized at {persist_dir}")

    def get_or_create_collection(self, name: str, metadata: Optional[Dict] = None) -> chromadb.Collection:
        """Obtém ou cria uma coleção"""
        if name in self.collections:
            return self.collections[name]

        try:
            collection = self.client.get_collection(name=name)
        except Exception:
            collection = self.client.create_collection(
                name=name,
                metadata=metadata or {"description": f"Collection for {name}"}
            )
        self.collections[name] = collection
        return collection

    def add_documents(self, collection_name: str, documents: List[Document],
                      metadata: Optional[Dict] = None):
        """Adiciona documentos ao vector store com embeddings automáticos"""
        collection = self.get_or_create_collection(collection_name)

        ids = []
        texts = []
        metadatas = []

        for doc in documents:
            doc_id = hashlib.md5(
                f"{doc.metadata.get('source', '')}:{doc.page_content[:100]}".encode()
            ).hexdigest()[:16]
            ids.append(doc_id)
            texts.append(doc.page_content)
            metadatas.append({
                "source": doc.metadata.get("source", "unknown"),
                "type": doc.metadata.get("type", "general"),
                "created_at": doc.metadata.get("created_at", datetime.now().isoformat()),
                **(metadata or {})
            })

        # Adicionar em batches para performance
        batch_size = 100
        for i in range(0, len(ids), batch_size):
            collection.add(
                ids=ids[i:i + batch_size],
                documents=texts[i:i + batch_size],
                metadatas=metadatas[i:i + batch_size]
            )

        logger.info(f"Added {len(documents)} documents to '{collection_name}'")

    def index_project_files(self, project_root: str):
        """Indexa todos os arquivos do projeto no vector store"""
        code_collection = self.get_or_create_collection("code_knowledge")
        docs_collection = self.get_or_create_collection("documentation")

        # Indexar arquivos Python
        for root, dirs, files in os.walk(project_root):
            # Ignorar diretórios irrelevantes
            skip_dirs = {'.git', '__pycache__', 'node_modules', '.venv', 'chroma_db', 'ecosystem_memory.db'}
            dirs[:] = [d for d in dirs if d not in skip_dirs]

            for filename in files:
                filepath = os.path.join(root, filename)
                relative_path = os.path.relpath(filepath, project_root)

                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                except Exception:
                    continue

                # Determinar tipo
                if filename.endswith('.py'):
                    doc_type = "python_code"
                elif filename.endswith('.ts') or filename.endswith('.tsx'):
                    doc_type = "typescript_code"
                elif filename.endswith('.md'):
                    doc_type = "documentation"
                elif filename.endswith('.js'):
                    doc_type = "javascript_code"
                elif filename.endswith('.html') or filename.endswith('.css'):
                    doc_type = "frontend"
                else:
                    doc_type = "other"

                # Dividir em chunks
                chunks = self._text_splitter.split_text(content)

                for i, chunk in enumerate(chunks):
                    doc = Document(
                        page_content=chunk,
                        metadata={
                            "source": relative_path,
                            "type": doc_type,
                            "chunk_index": i,
                            "total_chunks": len(chunks),
                            "created_at": datetime.now().isoformat()
                        }
                    )

                    target_collection = docs_collection if doc_type == "documentation" else code_collection
                    self.add_documents(
                        target_collection.name,
                        [doc],
                        metadata={"project_root": project_root}
                    )

        logger.info(f"Project indexing complete for {project_root}")

    def add_incident(self, collection_name: str = "incidents",
                     error: str = "", diagnosis: str = "", fix: str = "",
                     result: str = "", code_context: str = ""):
        """Registra um incidente resolvido no vector store"""
        content = f"""INCIDENTE RESOLVIDO:
Erro: {error}
Diagnóstico: {diagnosis}
Correção aplicada: {fix}
Resultado: {result}
Contexto de código: {code_context}
"""
        doc = Document(
            page_content=content,
            metadata={
                "source": "incident_log",
                "type": "incident_resolution",
                "timestamp": datetime.now().isoformat()
            }
        )
        self.add_documents(collection_name, [doc])

    def add_lesson(self, collection_name: str = "lessons",
                   lesson: str = "", category: str = "general",
                   impact: str = ""):
        """Registra uma lição aprendida no vector store"""
        doc = Document(
            page_content=f"LIÇÃO APRENDIDA ({category}): {lesson}\nImpacto: {impact}",
            metadata={
                "source": "wisdom_engine",
                "type": "learned_lesson",
                "category": category,
                "timestamp": datetime.now().isoformat()
            }
        )
        self.add_documents(collection_name, [doc])

    def query_collection(self, collection_name: str, query_text: str,
                         top_k: int = 5, where: Optional[Dict] = None) -> List[Document]:
        """Consulta o vector store por similaridade semântica"""
        try:
            collection = self.get_or_create_collection(collection_name)
            kwargs = {
                "query_texts": [query_text],
                "n_results": min(top_k, collection.count()),
            }
            if where:
                kwargs["where"] = where

            results = collection.query(**kwargs)

            documents = []
            for i, doc in enumerate(results['documents'][0]):
                documents.append(Document(
                    page_content=doc,
                    metadata=results['metadatas'][0][i] if results['metadatas'][0][i] else {}
                ))
            return documents

        except Exception as e:
            logger.warning(f"Query failed on '{collection_name}': {e}")
            return []

    def get_collection_stats(self) -> Dict[str, int]:
        """Retorna estatísticas de todas as coleções"""
        stats = {}
        for name in self.client.list_collections():
            try:
                collection = self.client.get_collection(name)
                stats[name] = collection.count()
            except Exception:
                stats[name] = 0
        return stats


class RAGRetriever:
    """Interface principal de recuperação RAG"""

    def __init__(self, collection_name: str = "nexus_knowledge",
                 top_k: int = 5):
        self.vector_store = VectorStoreManager()
        self.collection_name = collection_name
        self.top_k = top_k

        # Coleções auxiliares para busca ampla
        self.collections = [
            "code_knowledge",
            "documentation",
            "incidents",
            "lessons",
            "patterns",
            "architecture",
        ]

    def retrieve(self, query: str, mode: str = "core",
                 extra_collections: Optional[List[str]] = None) -> List[Document]:
        """
        Recupera documentos relevantes para uma query
        Busca em múltiplas coleções e retorna os mais relevantes
        """
        all_docs: List[Document] = []

        # Determinar quais coleções consultar
        target_collections = list(self.collections)
        if extra_collections:
            target_collections.extend(extra_collections)

        # Buscar em cada coleção
        for coll_name in target_collections:
            docs = self.vector_store.query_collection(
                coll_name, query, top_k=self.top_k
            )
            for doc in docs:
                doc.metadata["_collection"] = coll_name
                doc.metadata["_relevance_score"] = 1.0  # Chroma retorna ordenado
            all_docs.extend(docs)

        # Ordenar por relevância (priorizar documentos mais recentes e diversos)
        if all_docs:
            all_docs.sort(key=lambda d: (
                d.metadata.get("_collection", ""),
                d.metadata.get("created_at", ""),
            ), reverse=True)

        return all_docs[:self.top_k * 3]  # Limitar resultados

    def retrieve_for_healing(self, error_description: str) -> List[Document]:
        """Busca específica para autocura - prioriza incidentes resolvidos"""
        docs = self.vector_store.query_collection(
            "incidents", error_description, top_k=self.top_k
        )
        # Adicionar buscas em patterns e lessons
        patterns = self.vector_store.query_collection(
            "patterns", error_description, top_k=2
        )
        lessons = self.vector_store.query_collection(
            "lessons", error_description, top_k=2
        )
        return docs + patterns + lessons

    def retrieve_for_wisdom(self, topic: str) -> List[Document]:
        """Busca específica para auto-sabedoria"""
        docs = self.vector_store.query_collection(
            "lessons", topic, top_k=self.top_k
        )
        architecture = self.vector_store.query_collection(
            "architecture", topic, top_k=2
        )
        return docs + architecture

    def store_solution(self, error: str, solution: str, result: str):
        """Armazena uma solução bem-sucedida para aprendizado futuro"""
        self.vector_store.add_incident(
            error=error,
            diagnosis=solution[:500],
            fix=solution,
            result=result
        )

    def store_lesson(self, lesson: str, category: str = "general", impact: str = ""):
        """Armazena uma lição aprendida"""
        self.vector_store.add_lesson(lesson=lesson, category=category, impact=impact)

    def get_stats(self) -> Dict[str, Any]:
        """Estatísticas do Vector Store"""
        return self.vector_store.get_collection_stats()
