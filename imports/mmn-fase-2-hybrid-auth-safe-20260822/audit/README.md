# Pacote seguro — Fase 2 MMN

## Escopo

Cópia isolada dos 12 arquivos disponíveis no workspace `MMN_AI-to-AI`, preservando os caminhos relativos em `source/MMN_AI-to-AI/`.

## Safe Recovery

Nenhum arquivo, pasta, branch ou commit existente foi sobrescrito ou excluído. O conteúdo foi colocado somente em um diretório novo. Não foram usados `git reset`, `git clean`, `git rm` ou `push --force`.

## Integridade

- `MANIFEST.paths`: lista dos arquivos copiados.
- `SHA256SUMS.txt`: hashes SHA-256 dos arquivos fonte.
- `../mmn-fase-2-hybrid-auth-safe-20260822.zip`: pacote ZIP.
- `../mmn-fase-2-hybrid-auth-safe-20260822.zip.sha256`: hash do ZIP.

## Proveniência

Origem: `/home/ubuntu/MMN_AI-to-AI`  
Destino: `imports/mmn-fase-2-hybrid-auth-safe-20260822/source/MMN_AI-to-AI`  
Identificador: `MMN-F2-SAFE-20260822`

## Segurança operacional

Os arquivos não foram executados. O ETL e o código legado permanecem como referência e não foram conectados a nenhum banco ou credencial.

## Validação prevista

Confirmar os checksums, conferir o diff staged e garantir que o commit contenha somente arquivos novos dentro deste diretório. A árvore é aditiva, isolada e reversível.

## Status

Pacote preparado para validação e commit aditivo.
