# Proveniência da execução

| Categoria | Origem | Destino relativo | Status |
|---|---|---|---|
| Projeto | `/home/ubuntu/nexus-genesis-orchestrator` | `project/` | Incluído em namespace isolado |
| Conteúdo do ZIP | `/home/ubuntu/upload/NexusGenesis_Final.zip` | `source_zip/` | Incluído com redaction de credenciais |
| Pacote distribuível | conteúdo redigido do ZIP | `package/NexusGenesis_Final.sanitized.zip` | Incluído |
| Auditoria | gerada nesta execução | `audit/` | Incluída |

A cópia foi feita em uma área de staging nova. O destino Git foi reservado sob `imports/nexus-genesis-task-20260822/`, após confirmação de que esse namespace não existia no `HEAD` auditado.

O arquivo de origem `PvKeys.txt` continha material de autenticação financeira e não pode ser publicado. Ele foi mantido somente em quarentena local com permissões restritas e substituído por `source_zip/PvKeys.txt` redigido. O pacote público é, portanto, `NexusGenesis_Final.sanitized.zip`, não o ZIP bruto. Esta é uma exclusão de segurança necessária; não foram fabricados arquivos para satisfazer uma contagem.

Os diretórios `node_modules`, `dist`, logs temporários, metadados `.git` e arquivos de ambiente não fazem parte do snapshot público. O arquivo `audit/manifest.tsv` registra origem, caminho relativo, tamanho e SHA-256 dos artefatos publicados.
