# Relatório de auditoria — NEXUS / Wedark

## Escopo

Esta entrega foi criada a partir de `/home/ubuntu/nexus-hub-v3` e destinada ao repositório `Nexus-HUB57/More_Ideas_the_Dragon`. A operação foi realizada em uma branch exclusiva, sem alteração da branch principal e sem reescrita de histórico.

| Evidência | Valor |
|---|---|
| Branch de entrega | `agent/nexus-wedark-full-sync-20260822-1652` |
| Commit-base remoto observado | `fa71364478f3f105f50852dbd44d743e8d23ec1a` |
| HEAD antes da cópia | `fa71364478f3f105f50852dbd44d743e8d23ec1a` |
| Arquivos reais copiados da origem | 133 |
| Colisões no namespace novo | 0 |
| Incompatibilidades de SHA-256 na cópia | 0 |
| Entradas do ZIP original analisado | 91 |
| Arquivos rastreados em origin/main no inventário | 19622 |
| Namespace da entrega | `task_artifacts/nexus_wedark_full_sync_20260822_1652` |
| ZIP da entrega | `task_artifacts/nexus_wedark_full_sync_20260822_1652.zip` |
| Hash do ZIP | Fonte da verdade: `task_artifacts/nexus_wedark_full_sync_20260822_1652.zip.sha256` |

## Resultado da inspeção do repositório

O repositório já continha diversos pacotes NEXUS e bundles de outros desenvolvedores, além do conjunto `artifacts/end-to-end/001-299`. Para não concorrer com esses conteúdos, esta entrega foi colocada em uma namespace nova: `task_artifacts/nexus_wedark_full_sync_20260822_1652`. Nenhum arquivo existente foi substituído e nenhum caminho existente foi reutilizado.

## Completude

A origem restaurada continha **133 arquivos reais** após a exclusão de dependências, builds, caches, logs operacionais e arquivos de ambiente. Todos foram copiados para `source/` e validados por SHA-256; a tabela completa está em `audit/source-copy-verification.tsv`. A referência do usuário a 295 ou 299 arquivos foi tratada como requisito de inventário: arquivos ausentes não foram fabricados para atingir uma contagem presumida.

O ZIP original enviado para a sessão continha **91 entradas**, incluindo `.env`. Por segurança, o ZIP original não foi copiado diretamente para o repositório. Sua lista de entradas foi preservada em `audit/original-upload-zip-entries.txt`, e as exclusões estão documentadas em `SECURITY_EXCLUSIONS.md`.

## Validação do projeto

A validação local registrada antes do empacotamento concluiu sem erros de TypeScript em `pnpm check`. O `pnpm test` concluiu com **3 arquivos de teste e 21 testes aprovados**. O log bruto está preservado em `validation/pnpm-check-test.log` e deve ser revisado junto com esta entrega.

## Segurança de colaboração

Não foram executados `reset --hard`, rebase destrutivo, exclusão de branch, exclusão de arquivo remoto, alteração na branch `main` ou force push. O merge deve ser realizado manualmente depois da revisão dos demais desenvolvedores. A branch de entrega e seus commits formam o caminho de recuperação não destrutivo.

## Estado honesto da sequência de desenvolvimento

A origem restaurada nesta sessão contém os módulos DataWeaver e CodePreview, mas não contém os arquivos posteriores da sequência WebSocket, sandbox, integração Python e Forge Projects mencionados no histórico compactado. O repositório remoto já contém artefatos relacionados em outras namespaces; eles não foram copiados nem sobrescritos nesta entrega porque pertencem a pacotes existentes de outros desenvolvedores. Nenhum módulo ausente foi inventado ou declarado como reconstruído.

> Este relatório registra o estado efetivamente observado e a cópia validada; não declara que módulos ausentes da restauração foram implementados nesta branch.
