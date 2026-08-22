# Programa SFN — Seed, Need, Feed

Pacote autocontido da metodologia de validação de projetos concebida nesta tarefa. O protocolo é **agnóstico de segmento** e pode analisar iniciativas físicas, digitais ou híbridas, desde operações locais até projetos científicos e tecnológicos de alta complexidade.

## Estrutura

- `protocolos/`: definições operacionais dos protocolos SEED, NEED e FEED.
- `prompts/`: contratos de instrução para processamento assistido por IA.
- `arquitetura/`: arquitetura lógica e fluxo de dados da futura plataforma.
- `interface/`: protótipo HTML do dashboard para validação visual.
- `validacao/`: manifestos e critérios de integridade do pacote.
- `assets/`: reservado para ativos visuais aprovados; nenhum segredo deve ser colocado aqui.

## Princípios de segurança

Este pacote não contém credenciais, tokens, chaves privadas, arquivos `.env` ou configurações sensíveis. Os artefatos são adicionados em uma pasta nova e isolada para evitar conflitos com o ecossistema existente.

## Ordem conceitual

`SEED → NEED → FEED → decisão de avanço`, com possibilidade de retorno controlado a qualquer etapa quando surgirem lacunas ou hipóteses não comprovadas.
