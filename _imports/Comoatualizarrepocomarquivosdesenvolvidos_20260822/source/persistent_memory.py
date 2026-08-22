"""
Persistent Learning Memory - Memória Persistente de Aprendizado
==============================================================
Gerencia o armazenamento de longo prazo de interações, decisões,
padrões aprendidos e estado dos agentes utilizando SQLite.
"""

import sqlite3
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class PersistentLearningMemory:
    """Memória persistente para o ecossistema autônomo"""

    def __init__(self, db_path: str = "database/ecosystem_memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Inicializa as tabelas da memória"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Tabela de interações (Histórico de conversas e decisões)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                query TEXT,
                response TEXT,
                mode TEXT,
                confidence REAL,
                metadata TEXT
            )
        ''')

        # Tabela de lições aprendidas (Auto-sabedoria)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learned_lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                category TEXT,
                lesson TEXT,
                impact TEXT,
                tags TEXT
            )
        ''')

        # Tabela de incidentes e correções (Auto-cura)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                error_type TEXT,
                error_message TEXT,
                diagnosis TEXT,
                fix_applied TEXT,
                result TEXT,
                status TEXT
            )
        ''')

        conn.commit()
        conn.close()

    def store_interaction(self, query: str, response: str, mode: str, confidence: float, metadata: Optional[Dict] = None):
        """Armazena uma interação no banco de dados"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO interactions (timestamp, query, response, mode, confidence, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (datetime.now().isoformat(), query, response, mode, confidence, json.dumps(metadata or {})))
        conn.commit()
        conn.close()

    def get_relevant_context(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Recupera contexto relevante da memória (busca simples por palavras-chave por enquanto)"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Busca simples por LIKE para exemplo inicial (RAG cuidará da busca semântica)
        keywords = query.split()[:3]
        where_clause = " OR ".join(["query LIKE ?" for _ in keywords])
        params = [f"%{k}%" for k in keywords]
        
        if not params:
            cursor.execute('SELECT * FROM interactions ORDER BY timestamp DESC LIMIT ?', (limit,))
        else:
            cursor.execute(f'SELECT * FROM interactions WHERE {where_clause} ORDER BY timestamp DESC LIMIT ?', (*params, limit))
            
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results

    def store_incident(self, error_type: str, error_message: str, diagnosis: str, fix: str, result: str):
        """Registra um incidente de auto-cura"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO incidents (timestamp, error_type, error_message, diagnosis, fix_applied, result, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (datetime.now().isoformat(), error_type, error_message, diagnosis, fix, result, 'resolved'))
        conn.commit()
        conn.close()

    def get_count(self) -> int:
        """Retorna o total de registros na memória"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM interactions')
        count = cursor.fetchone()[0]
        conn.close()
        return count
