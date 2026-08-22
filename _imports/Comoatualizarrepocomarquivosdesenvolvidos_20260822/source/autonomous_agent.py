"""
Autonomous Agent - Agente Autônomo de Orquestração
==================================================
Orquestra os workflows de Auto-Cura e Auto-Sabedoria.
Monitora o sistema, detecta falhas e aplica correções inteligentes.
"""

import os
import sys
import logging
import traceback
import subprocess
from typing import Dict, Any, Optional, List
from datetime import datetime

from src.agents.nexus_llm_engine import NexusLLMEngine

logger = logging.getLogger(__name__)

class AutonomousAgent:
    """Agente central do ecossistema autônomo"""

    def __init__(self, project_root: str = "."):
        self.project_root = os.path.abspath(project_root)
        self.llm_engine = NexusLLMEngine()
        self.is_running = False
        logger.info("AutonomousAgent initialized and ready.")

    def run_self_diagnostic(self) -> Dict[str, Any]:
        """Executa um diagnóstico completo do sistema em busca de erros"""
        logger.info("Starting self-diagnostic workflow...")
        
        # 1. Verificar erros de sintaxe em todo o projeto
        syntax_errors = self._check_syntax_errors()
        
        # 2. Verificar logs recentes (simulado por enquanto)
        log_errors = self._check_logs()
        
        all_issues = syntax_errors + log_errors
        
        if not all_issues:
            return {"status": "healthy", "message": "Nenhum problema detectado."}
        
        # 3. Se houver problemas, iniciar processo de auto-cura
        results = []
        for issue in all_issues:
            healing_result = self.auto_heal(issue)
            results.append(healing_result)
            
        return {
            "status": "recovering",
            "issues_found": len(all_issues),
            "healing_results": results
        }

    def _check_syntax_errors(self) -> List[Dict[str, Any]]:
        """Verifica erros de sintaxe nos arquivos Python"""
        issues = []
        for root, _, files in os.walk(self.project_root):
            if any(skip in root for skip in ['.git', '__pycache__', 'chroma_db']):
                continue
            for file in files:
                if file.endswith('.py'):
                    path = os.path.join(root, file)
                    try:
                        subprocess.check_output([sys.executable, '-m', 'py_compile', path], stderr=subprocess.STDOUT)
                    except subprocess.CalledProcessError as e:
                        issues.append({
                            "type": "syntax_error",
                            "file": path,
                            "message": e.output.decode('utf-8', errors='ignore')
                        })
        return issues

    def _check_logs(self) -> List[Dict[str, Any]]:
        """Analisa logs em busca de exceções (placeholder)"""
        # Por enquanto, vamos verificar se existe o arquivo syntax_errors.txt que criamos antes
        issues = []
        syntax_log = os.path.join(self.project_root, "syntax_errors.txt")
        if os.path.exists(syntax_log):
            with open(syntax_log, 'r') as f:
                content = f.read()
                if content.strip():
                    issues.append({
                        "type": "logged_error",
                        "source": "syntax_errors.txt",
                        "message": content
                    })
        return issues

    def auto_heal(self, issue: Dict[str, Any]) -> Dict[str, Any]:
        """Workflow de Auto-Cura para um problema específico"""
        logger.info(f"Initiating Auto-Healing for issue: {issue['type']}")
        
        # 1. Diagnóstico via LLM + RAG
        diagnosis = self.llm_engine.diagnose_error(
            error=issue['message'],
            context=f"Arquivo: {issue.get('file', 'N/A')}"
        )
        
        logger.info(f"Diagnosis: {diagnosis.reasoning}")
        
        # 2. Gerar correção
        if issue['type'] == "syntax_error" or issue['type'] == "logged_error":
            file_path = issue.get('file')
            code_content = ""
            if file_path and os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    code_content = f.read()
            
            fix_response = self.llm_engine.generate_fix(
                error=issue['message'],
                code_context=code_content
            )
            
            # 3. Aplicar correção (Se o nível de confiança for alto)
            if fix_response.confidence > 0.8 and fix_response.action_required:
                success = self._apply_fix(file_path, fix_response.answer)
                
                # 4. Aprender com o resultado
                result_status = "Sucesso" if success else "Falha ao aplicar"
                self.llm_engine.rag_retriever.store_solution(
                    error=issue['message'],
                    solution=fix_response.answer,
                    result=result_status
                )
                
                return {
                    "issue": issue['type'],
                    "diagnosis": diagnosis.answer,
                    "fix_applied": True,
                    "status": result_status
                }
        
        return {
            "issue": issue['type'],
            "diagnosis": diagnosis.answer,
            "fix_applied": False,
            "reason": "Baixa confiança ou ação não requerida"
        }

    def _apply_fix(self, file_path: str, new_content: str) -> bool:
        """Aplica a correção ao sistema de arquivos"""
        if not file_path or not os.path.exists(file_path):
            return False
            
        try:
            # Extrair código da resposta do LLM (removendo markdown se houver)
            clean_code = new_content
            if "```python" in new_content:
                clean_code = new_content.split("```python")[1].split("```")[0].strip()
            elif "```" in new_content:
                clean_code = new_content.split("```")[1].split("```")[0].strip()
            
            # Backup antes de alterar
            backup_path = file_path + ".bak"
            subprocess.run(["cp", file_path, backup_path])
            
            with open(file_path, 'w') as f:
                f.write(clean_code)
            
            logger.info(f"Fix applied successfully to {file_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to apply fix: {e}")
            return False

    def evolve_wisdom(self):
        """Workflow de Auto-Sabedoria: Aprende com o estado atual e otimiza"""
        logger.info("Initiating Auto-Wisdom workflow...")
        
        # 1. Analisar histórico de interações recentes
        recent_interactions = self.llm_engine.memory.get_relevant_context("revisão", limit=10)
        incident_log = json.dumps(recent_interactions)
        
        # 2. Extrair lições
        lessons = self.llm_engine.extract_lessons(incident_log)
        
        # 3. Armazenar lições no Vector Store
        if lessons.confidence > 0.7:
            self.llm_engine.rag_retriever.store_lesson(
                lesson=lessons.answer,
                category="architectural_evolution",
                impact="high"
            )
            logger.info("New wisdom stored in Vector Store.")
            return True
        return False
