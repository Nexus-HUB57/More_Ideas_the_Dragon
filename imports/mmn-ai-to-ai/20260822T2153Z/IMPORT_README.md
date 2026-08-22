# Importação segura do projeto MMN AI-to-AI

Esta pasta é um **namespace aditivo e isolado** criado na branch `agent/mmn-ai-to-ai-safe-population-20260822T2153Z`. Ela reúne os arquivos locais disponíveis da tarefa, o material legado restaurado, o ZIP original e sua extração para inspeção. Nenhum caminho existente do repositório foi usado como destino da cópia.

## Origem e composição

| Área | Origem | Arquivos copiados | Observação |
|---|---|---:|---|
| `web-project/` | `/home/ubuntu/mmn-ai-to-ai` | 130 | Projeto web completo, excluindo `.git`, `node_modules`, `dist` e os dois arquivos gerados sensíveis documentados na auditoria |
| `legacy-artifacts/` | `/home/ubuntu/projeto` | 3 | `MILESTONE_6_SUMMARY.md`, `network.tsx` e `todo.md` |
| `source-zip/ProsseguirDesenvolvimentodoProjeto.zip` | `/home/ubuntu/upload/ProsseguirDesenvolvimentodoProjeto.zip` | 1 | Cópia byte a byte preservada |
| `source-zip/extracted/` | ZIP original | 16 | Conteúdo extraído com `unzip -n`, sem substituição |
| `audit/` | manifestos locais, do repositório e revisão de segurança | 3 | Evidências da auditoria pré-importação e dos arquivos excluídos por segurança |

O ZIP possui 16 entradas de arquivo e SHA-256 `cc04bccf9e95729e03bed6c1644c2d7427895aaa684823d1df00e35be454a6d6`. Após a revisão de segurança, a carga efetivamente versionada contém 150 arquivos de origem/artefato: 130 do projeto web, 3 legados e 17 relacionados ao ZIP (cópia original mais 16 extraídos). O total de arquivos da pasta, incluindo evidências e documentos de controle, será confirmado pelo manifesto versionado; não são criados arquivos fictícios para atingir uma contagem arbitrária de 295 ou 299 itens.

## Protocolo de preservação

A branch foi criada a partir de `origin/main` no commit `1254d570131d82a715c1b1bbab4ed1906e3d8201`. O branch padrão, as branches remotas, o histórico e os caminhos já existentes permanecem fora da operação. A importação usa somente `mkdir`, cópia aditiva para este namespace novo e documentação de auditoria. Não foram executados `reset`, `rebase`, `force-push`, exclusão de branch, exclusão de arquivo ou sobrescrita silenciosa.

## Regras de revisão

Antes do commit, será verificado que todos os arquivos do namespace estão rastreados, que não há alterações fora dele, que os hashes do ZIP e dos arquivos importados são reproduzíveis, que a árvore de trabalho está limpa após o commit e que o commit está contido exclusivamente nesta branch de integração. A publicação será feita somente nesta branch isolada; o branch `main` não será alterado.

## Conteúdo não versionado deliberadamente

Diretórios `.git`, `node_modules` e `dist` não fazem parte da carga de código-fonte e não foram copiados. Durante a revisão, o arquivo gerado `.project-config.json` foi identificado contendo credenciais e foi excluído da cópia antes do stage; o log efêmero `.manus-logs/devserver.log` também foi excluído. Nenhum valor secreto foi replicado na carga. O arquivo `pnpm-lock.yaml` foi preservado por ser parte da reprodutibilidade do projeto. Os detalhes estão em `audit/EXCLUDED_GENERATED_FILES.md`.

## Próximos passos

O arquivo `SOURCE_INVENTORY.tsv` registrará os hashes e tamanhos por arquivo. `CONFLICT_REPORT.md` registrará o resultado da comparação com o destino. Depois da validação, a branch poderá ser revisada e incorporada pelos mantenedores do repositório por meio do fluxo normal de pull request.

**Responsável pela importação:** Manus AI

**Data da auditoria:** 2026-08-22 (UTC)

**Branch de integração:** `agent/mmn-ai-to-ai-safe-population-20260822T2153Z`

**Repositório:** `Nexus-HUB57/More_Ideas_the_Dragon`
