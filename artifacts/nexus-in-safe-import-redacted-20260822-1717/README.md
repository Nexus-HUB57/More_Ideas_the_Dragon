# Nexus-in — importação end-to-end segura

Este diretório contém o pacote Nexus-in preparado para revisão no repositório `Nexus-HUB57/More_Ideas_the_Dragon`.

## Escopo

A fonte contém **135 arquivos** e foi copiada para um diretório novo, isolado e aditivo. Dependências vendorizadas (`node_modules`), saídas de build (`dist`) e o diretório VCS local não fazem parte do espelho. O arquivo ZIP seguro contém os mesmos 135 arquivos e foi validado com `unzip -t`.

## Segurança

Durante a tentativa de publicar a cópia literal, o GitHub Push Protection identificou valores com formato de credenciais AWS no arquivo `.project-config.json`. Por segurança, os valores sensíveis não foram publicados. A versão presente em `source/.project-config.json` mantém a estrutura do arquivo, mas substitui os valores sensíveis por `REDACTED_BY_SAFE_RECOVERY`.

O arquivo original recebido foi preservado apenas no workspace local para auditoria e **não foi copiado para esta branch segura**, pois poderia carregar configuração sensível. A branch anterior que recebeu o primeiro commit literal continua separada e não deve ser mesclada; os responsáveis devem tratá-la como branch de contenção e seguir as políticas de revogação/rotação das credenciais identificadas.

> Não use a URL de desbloqueio do Push Protection para publicar segredos. O fluxo seguro é sanitizar, revogar/rotacionar credenciais comprometidas e revisar o pacote antes do merge.

## Artefatos

- `source/`: projeto Nexus-in com 135 arquivos, incluindo a configuração redigida.
- `archives/Nexus-in-project-source-redacted-20260822-1717.zip`: ZIP end-to-end seguro.
- `reports/MANIFEST.sha256`: hashes dos arquivos da fonte.
- `reports/conflicts.md`: protocolo Safe Recovery e conflitos.
- `reports/import-metadata.txt`: origem, base, contagens e hash do ZIP.
- `reports/project-validation.txt`: validações executadas.
- `reports/sensitive-pattern-scan.txt`: resultado da varredura de padrões; ocorrências de nomes de chaves não representam valores secretos.

## Validações

O ZIP foi testado com sucesso. A contagem da fonte e do ZIP é 135. O arquivo `.project-config.json` passou por redaction antes do staging. A validação técnica do projeto (`pnpm check` e `pnpm test`) foi executada na fonte local antes da reconstrução segura do pacote; a configuração redigida é uma cópia de publicação e deve ser revisada antes de uso em runtime.

## Branch e merge

A branch segura é `agent/nexus-in-safe-import-redacted-20260822-1717`. O commit será publicado somente após a revisão final da ausência de valores sensíveis. Nenhum merge automático será executado e a `main` não será alterada por esta operação.

## Recuperação

A recuperação pode ser feita via checkout da branch segura ou extração do ZIP. Antes de qualquer uso operacional, configure secrets por meio do mecanismo seguro do ambiente, nunca dentro do repositório.
