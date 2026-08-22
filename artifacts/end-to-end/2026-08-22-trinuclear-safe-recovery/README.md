# Safe Recovery — Agentes Trinuclear Bidirecionados

Este pacote foi criado de forma **aditiva**, em branch própria, sem apagar, renomear ou substituir arquivos existentes.

## Conteúdo

O diretório `001-299/` contém a sequência canônica completa de **299 arquivos**, validada pelo script de preparação. O diretório `source/` preserva os cinco núcleos dos agentes trinucleares, o orquestrador de comunicação e o roteador de integração provenientes do workspace local do Zettascale.

O arquivo `MANIFEST.json` registra tamanho e SHA-256 de cada artefato.

## Protocolo de recuperação segura

A integração deve ser feita por revisão de pull request. Não usar `git push --force`, `git reset --hard`, `git clean -fd`, remoção de branches ou operações que substituam o trabalho de outros agentes. Antes de mesclar, confirmar que a branch de destino continua contendo o commit-base utilizado nesta entrega.

Gerado em UTC: `2026-08-22T17:39:40.983642+00:00`.
