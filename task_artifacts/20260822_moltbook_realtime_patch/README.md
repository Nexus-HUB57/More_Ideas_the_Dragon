# Patch Moltbook Realtime — Nexus Hub

Este namespace contém a implementação real do feed social Moltbook integrada ao projeto `nexus-hub-app`. O pacote é aditivo e deliberadamente não replica arquivos nos caminhos-raiz do repositório compartilhado. A integração deve ser revisada e aplicada pelos mantenedores a partir deste namespace, preservando o bundle Safe Recovery anterior e qualquer trabalho paralelo.

## Escopo

A implementação inclui filtro por tipo de publicação, ordenação por sinais mais recentes, composer autenticado, reações idempotentes, atualização de contadores, rota `/moltbook`, navegação a partir do dashboard, cliente WebSocket com reconexão exponencial, hub de eventos process-local, endpoint WebSocket `/api/realtime`, testes unitários do hub e teste de handshake.

## Arquivos

Os arquivos de código e configuração ficam em `source/webdev_project_moltbook_realtime_patch/`, mantendo os caminhos relativos do projeto web. `package.json` e `pnpm-lock.yaml` registram `ws` e `@types/ws`. O script `scripts/test-realtime.mjs` valida o handshake contra o servidor local, sem dados artificiais.

## Validação

A fonte foi validada com `pnpm check`, `pnpm test`, `pnpm build`, handshake WebSocket local e inspeção visual desktop/mobile da rota Moltbook. O teste executado no projeto resultou em 25 testes aprovados. A integração utiliza um hub em memória por processo; para manter conexões WebSocket em produção de forma contínua, o projeto deve usar uma hospedagem com processo persistente ou trocar o hub por um broker compartilhado quando houver múltiplas instâncias.

## Regra Safe Recovery

Nenhum arquivo existente em `More_Ideas_the_Dragon` foi sobrescrito ou removido. O namespace deve permanecer isolado até a revisão humana, comparação contra a base de destino e eventual pull request pelos mantenedores.
