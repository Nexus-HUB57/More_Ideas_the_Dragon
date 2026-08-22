# Arquitetura lógica SFN

```text
Entrada do idealizador
        ↓
Ingestão guiada e normalização
        ↓
SEED: Concept Document + hipóteses
        ↓ gate de completude
NEED: Operations Blueprint + custos + cronograma
        ↓ gate de executabilidade
FEED: Business Case + evidências + cenários
        ↓ gate de decisão
Dashboard: GO | PIVOT | HOLD | NO-GO
```

## Componentes

- **Interface de ingestão:** questionários progressivos, autosave e indicação de campos obrigatórios.
- **Orquestrador:** controla etapas, versões, validações e prompts.
- **Camada de conhecimento:** armazena respostas, evidências, fontes e decisões com rastreabilidade.
- **Agentes especializados:** síntese SEED, planejamento NEED, análise FEED e auditoria de consistência.
- **Camada de saída:** dashboard, documentos Markdown/HTML e exportação posterior.
- **Governança:** controle de acesso, versionamento, logs, consentimento, proteção de dados e revisão humana.

## Contrato de dados mínimo

Cada resposta deve conter `id`, `protocolo`, `pilar`, `pergunta`, `resposta`, `tipo_de_evidencia`, `confianca`, `fonte`, `autor`, `timestamp` e `versao`.
