# Nexus Hub Agent Platform — Safe Population Bundle

Este diretório contém a população não destrutiva dos artefatos disponíveis da tarefa Nexus Hub. A integração foi feita em uma branch dedicada, criada a partir de `origin/main`, sem `reset`, `rebase`, exclusão ou sobrescrita de caminhos preexistentes.

## Conteúdo integrado

| Origem | Destino | Critério |
|---|---|---|
| Projeto local `/home/ubuntu/nexus-hub` | `source-project/` | Arquivos persistentes do projeto, isolados em um caminho novo |
| ZIP `SeniorAIArchitectRoleandResponsibilitiesOverview.zip` | `source-zip/` | ZIP original preservado e conteúdo extraído em subdiretório isolado |
| Manifesto de integridade | `INTEGRATION_MANIFEST.tsv` | SHA-256 e origem de cada arquivo integrado |
| Relatório de segurança | `SAFE_POPULATION_REPORT.md` | Contagens, decisões, conflitos e validações |

## Proteções aplicadas

Os diretórios `.git`, `node_modules`, `dist` e `.manus-logs` não são artefatos de entrega e foram excluídos. Arquivos locais potencialmente sensíveis, como `.env`, `credentials.json`, chaves privadas e certificados, também não foram copiados. Nenhum arquivo ou pasta já existente no repositório foi substituído.

O ZIP original foi preservado byte a byte. Seu SHA-256 está no manifesto. A extração foi realizada somente depois de uma verificação de nomes para impedir path traversal.

## Verificação

O manifesto deve ser usado para conferir a população completa após o commit. A branch de integração deve ser revisada por outro desenvolvedor antes de qualquer merge na branch padrão.
