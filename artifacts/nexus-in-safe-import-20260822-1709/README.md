# Importação segura do Nexus-in

Este diretório contém uma cópia aditiva e isolada do projeto Nexus-in preparada para revisão colaborativa no repositório `Nexus-HUB57/More_Ideas_the_Dragon`.

## Origem e escopo

A fonte foi coletada de `/home/ubuntu/nexus-in-project` e copiada sem movimentar ou alterar a origem. Foram preservados os arquivos do projeto, documentação, testes, configurações e artefatos necessários para a revisão. Dependências vendorizadas (`node_modules`), saídas de build (`dist`) e o diretório VCS local não foram incluídos no espelho da fonte.

A fonte empacotada contém **135 arquivos** e **2.542.874 bytes**. O arquivo ZIP reproduzível está em `archives/Nexus-in-project-source-20260822-1709.zip`; o arquivo original recebido está em `archives/Nexus-in-original-upload.zip`.

## Validações executadas

A integridade do ZIP foi conferida com `unzip -t`. A extração temporária contém 135 arquivos e o manifest extraído coincide com o manifest da fonte. `pnpm check` e `pnpm test` foram executados no projeto local com sucesso. A varredura de padrões sensíveis não encontrou correspondências nos arquivos de texto considerados.

Os relatórios auditáveis estão em `reports/`, incluindo `MANIFEST.sha256`, `conflicts.md`, `import-metadata.txt`, `project-validation.txt`, `zip-manifest-diff.txt` e `sensitive-pattern-scan.txt`.

## Protocolo Safe Recovery

A importação foi feita em `artifacts/nexus-in-safe-import-20260822-1709`, um caminho que não existia na base auditada. Nenhum arquivo, pasta, commit, branch, tag ou conteúdo preexistente foi excluído ou sobrescrito. A branch `main` não foi alterada e nenhum merge automático foi executado.

> Qualquer conflito futuro deve ser preservado e escalado para decisão humana; não use `reset --hard`, `git clean` destrutivo, rebase de branch compartilhada ou force-push.

## Revisão e merge

A branch de trabalho deve ser revisada antes de qualquer merge. Compare o commit com `main`, confirme o diff aditivo e valide os relatórios. O merge na branch principal permanece pendente de autorização explícita dos responsáveis pelo repositório.

## Rastreabilidade

- Repositório: `Nexus-HUB57/More_Ideas_the_Dragon`
- Diretório isolado: `artifacts/nexus-in-safe-import-20260822-1709`
- Branch de trabalho: `agent/nexus-in-safe-import-20260822-1709`
- Commit-base: registrado em `reports/import-metadata.txt`
- SHA-256 do ZIP gerado: registrado em `reports/import-metadata.txt`

## Observação sobre os itens 001–299

A base remota já continha 299 artefatos em `artifacts/end-to-end/001-299/`. Eles foram preservados e não foram duplicados nem sobrescritos. Este pacote adiciona o projeto Nexus-in completo e seus artefatos de auditoria em uma área separada.

## Recuperação

Para recuperar a cópia, faça checkout da branch de trabalho ou extraia o ZIP. Para validar novamente o pacote, confira o SHA-256 registrado e execute `unzip -t archives/Nexus-in-project-source-20260822-1709.zip`. Para retornar à base principal sem perda, basta abandonar a branch de trabalho após a revisão; a `main` não foi modificada por esta operação.

## Status

O pacote está preparado para staging, commit, publicação da branch e revisão colaborativa. O merge permanece deliberadamente pendente.

## Licença e responsabilidade

A origem e os direitos de uso do conteúdo devem ser confirmados pelos responsáveis do projeto antes de qualquer redistribuição pública ou publicação em produção.
