# Validação do pacote Nexus Genesis Sync

Este pacote foi preparado em **22 de agosto de 2026**, em uma branch dedicada, a partir de `/home/ubuntu/upload/NexusGenesis.zip`. A preparação foi não destrutiva: a `main`, os commits, as branchs, as pastas e os arquivos existentes não foram reescritos, excluídos ou sobrescritos.

| Indicador | Resultado |
|---|---:|
| Entradas verificadas no inventário | 69 |
| Registros no manifest incluindo o arquivo de origem | 70 |
| Artefatos copiados para `source/` | 51 |
| Registros em quarentena | 19 |
| ZIPs copiados e testados com `unzip -tq` | 5 |
| SHA-256 do ZIP original | `b8181521d7c608dd950655bf35ffc46a7aff9c329408917b85935914e0916202` |
| Branch de trabalho | `agent/nexus-genesis-sync-safe-population-20260822` |
| Política de push forçado | não utilizada |
| Política de exclusão | não utilizada |

## Quarentena de segurança

O arquivo original não foi publicado porque contém credenciais Firebase, material de carteira, chaves privadas ou arquivos que os contêm. Também foram omitidos os seguintes artefatos individuais ou contêineres: `Nexus_Project.zip`, `bitcoin-wallet.ts`, `PvKeys.txt`, `types.ts`, `FundoNexus.zip`, `Nexus-HUB.zip`, `pasted_content.txt`, os oito scripts com atribuições literais de `API_KEY`/`API_SECRET` e os três arquivos JSON de Service Account Firebase. O manifest registra o motivo e o hash de cada entrada sem reproduzir o conteúdo sensível.

A omissão é deliberada e não significa perda local do material de origem. Nenhum segredo deve ser adicionado ao GitHub. As chaves compartilhadas anteriormente devem ser revogadas e substituídas antes de qualquer integração real.

## Critério de completude

A meta nominal de 299 arquivos não foi usada para fabricar arquivos ou publicar conteúdo não verificável. O ZIP recebido contém 69 entradas de arquivo; portanto, a contagem segura foi calculada a partir da fonte real. Todos os artefatos verificáveis e não confidenciais foram considerados, e cada decisão está registrada em `MANIFEST.json`.

## Revisão recomendada

A revisão deve confirmar o `git diff --cached`, o manifest, os hashes, a ausência de deleções e a lista de quarentena antes de aceitar o commit. O commit desta branch é separado de qualquer merge em `main`; não há merge ou force push automático.
