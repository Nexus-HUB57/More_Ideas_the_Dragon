# NEXUS / Wedark — Entrega de sincronização segura

Esta pasta contém uma cópia auditável dos arquivos disponíveis no projeto local `/home/ubuntu/nexus-hub-v3` no momento da sincronização. A cópia foi criada na branch dedicada `agent/nexus-wedark-full-sync-20260822-1652`, a partir do commit-base observado em `origin/main`, sem alteração da branch principal.

## Conteúdo

Os arquivos da aplicação estão em `source/`, mantendo os caminhos relativos da origem. A origem continha **133 arquivos reais** no inventário desta execução, incluindo frontend React/TypeScript, backend Express/tRPC, schema Drizzle, testes, configuração e documentação. O pacote não inclui `node_modules`, `dist`, caches, logs operacionais ou arquivos `.env`.

A sequência de desenvolvimento solicitada inclui WebSocket, execução sandboxed, integração Python e Forge Projects. Nesta restauração do projeto, somente os arquivos presentes na árvore local foram copiados. O relatório de auditoria identifica módulos que já existem no repositório em pacotes de outros desenvolvedores e qualquer arquivo posterior ao checkpoint que não esteja disponível nesta origem não foi inventado nem reconstruído.

## Segurança e colaboração

Esta entrega está isolada em uma namespace nova para evitar colisões com artefatos existentes, incluindo `artifacts/end-to-end/001-299`, `task_artifacts/nexus_hub_app_source_2026-08-22` e `task_artifacts/nexus_hub_continuation_2026-08-22`. Nenhum caminho existente foi sobrescrito, nenhum arquivo foi excluído, nenhum commit foi reescrito e nenhum force push foi executado.

O merge para `main` deve ser feito somente após revisão humana dos demais desenvolvedores. A branch dedicada e seus commits formam o ponto de recuperação desta entrega.

## Verificação

Consulte `SOURCE_MANIFEST.sha256` para os hashes dos arquivos copiados, `AUDIT_REPORT.md` para o relatório de auditoria e `SECURITY_EXCLUSIONS.md` para as exclusões técnicas e de segurança. O ZIP final e seu SHA-256 serão registrados no manifesto após a validação do pacote.

> A contagem informada é a contagem real de arquivos disponíveis e seguros para inclusão; arquivos ausentes não foram fabricados apenas para atingir 295 ou 299 entradas.
