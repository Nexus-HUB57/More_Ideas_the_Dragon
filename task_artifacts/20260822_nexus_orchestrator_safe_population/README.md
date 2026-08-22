# Nexus Orchestrator — Pacote de Povoamento Seguro

Este diretório contém uma cópia isolada dos artefatos relacionados à tarefa de orquestração tri-nuclear. O pacote foi adicionado em uma área exclusiva para evitar sobrescrever arquivos, pastas ou históricos existentes no repositório.

## Conteúdo

| Caminho | Finalidade |
|---|---|
| `source/server/orchestrator.ts` | Snapshot da implementação do NexusOrchestrator e do protocolo TSRA. |
| `source/server/firebase.ts` | Integração versionada com as instâncias Firebase, sem chaves de serviço. |
| `source/server/db.ts` | Snapshot do módulo de persistência associado à implementação de origem. |
| `tests/test-imbalance.dry-run.ts` | Teste determinístico de homeostase, sem acesso de rede, banco ou Firebase. |
| `audit/end-to-end-001-299-reference.zip` | Referência ao pacote end-to-end 001–299 já versionado no repositório. |
| `MANIFEST.sha256` | Hashes dos arquivos do pacote para auditoria de integridade. |

## Protocolo de segurança

Nenhum arquivo existente foi removido ou substituído. Nenhuma credencial, chave privada, `credentials.json` ou segredo foi copiado para este pacote. O arquivo de teste é explicitamente **dry-run**: ele somente avalia métricas em memória e verifica se o estado esperado é `critical`.

O pacote 001–299 não foi recriado ou duplicado desnecessariamente. O repositório já possuía 299 especificações técnicas e um arquivo ZIP end-to-end; por isso, o pacote é incluído como referência preservada, enquanto os novos artefatos da tarefa ficam em uma pasta nova e isolada.

## Validação

Para validar o teste sem dependências externas, execute o arquivo com o executor TypeScript disponível no projeto. A validação de integridade deve comparar os hashes registrados em `MANIFEST.sha256`.

> Este pacote não inicia o TSRA em produção, não altera dados Firebase e não transmite transações. Sua finalidade é documentação, rastreabilidade e validação segura.
