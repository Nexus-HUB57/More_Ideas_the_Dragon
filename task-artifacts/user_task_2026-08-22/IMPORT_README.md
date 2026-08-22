# Importação segura da tarefa Nexus — 2026-08-22

## Objetivo

Este namespace contém uma cópia aditiva e rastreável dos artefatos disponíveis para a tarefa do Dashboard Ecossistema Nexus Tri-Nuclear. A operação foi executada sobre um branch isolado do repositório `Nexus-HUB57/More_Ideas_the_Dragon`, preservando o histórico e o conteúdo que já existiam no alvo.

## Fonte canônica e fontes secundárias

A **fonte canônica desta importação** é o arquivo ZIP fornecido pelo usuário: `ClonarRepositórioeCriarEcossistemaAI-to-AI.zip`. Seus 16 arquivos foram extraídos para `sources/attached-zip/` e o ZIP original foi preservado em `archives/`.

O projeto local `/home/ubuntu/nexus-dashboard` é uma **fonte secundária de contexto e implementação**, importada separadamente para `sources/nexus-dashboard/`. O conteúdo foi copiado como snapshot, sem merge de arquivos na raiz do repositório alvo. A cópia exclui artefatos gerados, dependências locais, logs do ambiente e materiais potencialmente sensíveis.

O repositório alvo já possuía manifestos e pacotes relacionados a tarefas numeradas de 001 a 299. Eles permanecem intocados. A operação não fabrica arquivos para atingir uma contagem nominal: o inventário final registra a quantidade real de artefatos elegíveis encontrados.

## Destino e política de preservação

O destino escolhido foi a subpasta nova `task-artifacts/user_task_2026-08-22/`. A raiz do repositório não foi usada para integrar arquivos com nomes já existentes. O preflight identificou seis colisões de nomes na raiz (`App.tsx`, `README.md`, `db.ts`, `package.json`, `schema.ts` e `todo.md`); esses arquivos foram mantidos exclusivamente no namespace da fonte, sem sobrescrever os equivalentes do alvo.

A operação não executa `git reset`, `git clean`, remoção de arquivos, exclusão de branches, rebase, squash, alteração de commits antigos ou force push. O commit da operação fica em branch próprio para revisão e eventual merge pelos mantenedores.

## Política de segurança

Não são copiados `.env`, credenciais, tokens, senhas, chaves privadas, mnemonics, xprv, WIF, carteiras ou artefatos equivalentes. A presença de arquivos sensíveis no repositório alvo original não autoriza sua replicação. As exclusões por padrão e os caminhos identificados estão descritos em `audit/exclusions.tsv`, sem expor valores secretos.

Nenhuma transação Bitcoin, assinatura, broadcast ou movimentação financeira é executada por esta operação. Qualquer código relacionado permanece como fonte/documentação e deve passar por revisão e configuração explícita antes de uso.

## Rastreabilidade

`audit/manifest.tsv` registra origem, destino, tamanho e SHA-256 de cada arquivo copiado. `audit/conflicts.tsv` registra colisões e a decisão de não copiar para a raiz. `audit/exclusions.tsv` registra categorias e caminhos omitidos. `audit/preflight-baseline.txt` preserva a referência do HEAD e dos checks realizados antes da importação.

O script `audit/validate_import.sh` é somente leitura. Ele valida o ZIP original, os hashes dos arquivos do namespace e a ausência de diretórios `.git` e arquivos sensíveis dentro da importação.

## ZIP final

O ZIP final deve conter o estado versionado do branch e a árvore de importação, mas **não contém o diretório `.git`**. O ZIP original permanece preservado tanto fora do clone quanto dentro de `archives/`; o pacote final é adicional e não o substitui.

## Contagem

A contagem oficial será preenchida pelo manifesto após sua geração. Como referência do preflight: o ZIP fornecido continha 16 arquivos; o projeto Nexus tinha 127 arquivos rastreados e 1 arquivo adicional não rastreado além dos logs excluídos; o alvo possuía 24.360 arquivos rastreados, 165 commits alcançáveis e 61 referências de branches locais/remotas no clone auditado.

## Reversibilidade

Para recuperar o estado do alvo antes da operação, consulte o commit-base registrado em `audit/preflight-baseline.txt` e descarte somente o branch de trabalho local/remoto após revisão. O branch `main` e todos os commits existentes permanecem fora desta alteração.

## Resultado esperado

Esta importação é deliberadamente **aditiva, isolada, verificável e reversível**. Ela não substitui a revisão humana de código, não declara que os artefatos são prontos para produção e não altera automaticamente o deploy do projeto Nexus.
