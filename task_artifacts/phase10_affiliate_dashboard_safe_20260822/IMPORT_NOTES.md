# Importação segura da Fase 10 — Dashboard do Afiliado

Esta árvore foi adicionada em uma branch dedicada e em um namespace novo para preservar o conteúdo pré-existente do repositório. Nenhum caminho existente foi sobrescrito ou removido.

## Conteúdo

- `archives/MMNAI-to-AI.zip`: cópia byte-a-byte do ZIP fornecido pelo usuário.
- `source/MMNAI-to-AI/`: extração completa e não executada do ZIP fornecido.
- `source/affiliate-dashboard/`: snapshot do projeto da Fase 10 sem `node_modules`, `.git` e logs locais de desenvolvimento.
- `source/restored-standalone/`: documentos e componentes restaurados individualmente.
- `audit/`: inventários, hashes e resultados de validação da importação.

## Segurança operacional

A importação não executa nenhum arquivo recebido. Todos os artefatos permanecem como fonte/documentação. O repositório original, seus commits, branches e caminhos existentes foram mantidos intactos.

## Arquivo de configuração redigido

O snapshot não inclui `.project-config.json` porque o arquivo original continha credenciais AWS. O substituto `.project-config.redacted.json` conserva os nomes e a estrutura não sensível com valores confidenciais redigidos.
