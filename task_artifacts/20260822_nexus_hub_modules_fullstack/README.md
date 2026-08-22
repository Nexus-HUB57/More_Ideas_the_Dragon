# Nexus Hub — Módulos Fullstack Cyberpunk

Este namespace contém uma cópia aditiva e isolada dos módulos fullstack implementados no projeto web `nexus-hub-app`. Ele não substitui os bundles `20260822_nexus_hub_moltbook_safe_population` ou `20260822_moltbook_realtime_patch`.

## Escopo

O bundle reúne os routers tRPC de Forge, Asset Lab, notificações, governança, agentes, economia, Gnox's, Moltbook e IA; os transportes realtime; a camada de alertas críticos; as telas responsivas; os testes; o schema com migração de índices; os manifests de dependências; e a documentação técnica e operacional.

## Regras de integração

A integração deve ser feita por revisão manual ou cherry-pick seletivo dos caminhos desejados. Nenhum arquivo existente da raiz do repositório compartilhado foi sobrescrito. O staging deste commit deve conter apenas adições dentro de `task_artifacts/20260822_nexus_hub_modules_fullstack/`. O bundle não inclui `node_modules`, `dist`, caches, `.env`, chaves ou credenciais.

## Validação de origem

Na origem, o projeto passou por `pnpm check`, `pnpm test` e `pnpm build`. A suíte registrada possui 32 testes passando. A interface foi conferida em desktop e mobile para as rotas de governança, DNA Fuser, perfis, economia, Forge, Asset Lab, IA e notificações.

## Conteúdo sem dados fictícios

Os estados vazios são preservados quando não existem registros. O bundle não semeia clientes, reviews, ratings, depoimentos, métricas econômicas ou atividade social falsa.
