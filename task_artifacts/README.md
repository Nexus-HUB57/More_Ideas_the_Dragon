# Task Artifacts — Nexus-HUB

Este diretório contém os artefatos da operação de continuação do Nexus-HUB, adicionados em namespaces próprios para preservar o histórico e os caminhos existentes do repositório.

| Namespace | Conteúdo | Política de preservação |
|---|---|---|
| [`nexus_hub_continuation_2026-08-22/`](./nexus_hub_continuation_2026-08-22/) | Anexo original, ZIPs aninhados, arquivos folha materializados, manifesto e hashes | Cada arquivo é associado ao ZIP de origem; nomes conflitantes não sobrescrevem conteúdo |
| [`nexus_hub_app_source_2026-08-22/`](./nexus_hub_app_source_2026-08-22/) | Código-fonte recuperado do projeto web Nexus-HUB | Fonte materializada fora de `node_modules`, `dist`, logs e arquivos `.env` de runtime |

A branch desta operação foi criada a partir de `origin/main` no commit `79d1b6679bc377bdb0fcdb816fe40ccbbe6dfaa3`. Nenhum commit, branch, pasta ou arquivo preexistente foi alterado nesta etapa.

## Contagem da fonte recebida

A cadeia original contém **15 payloads ZIP únicos**, **16 ocorrências de ZIPs internos**, **787 ocorrências de arquivos folha** e **430 conteúdos folha únicos por SHA-256**. A diferença entre ocorrências e conteúdos únicos decorre das versões aninhadas e repetidas dentro do pacote; o manifesto recursivo mantém a proveniência completa.

O pacote de fonte web contém **132 arquivos materializados** depois da remoção apenas de dependências/runtime e arquivos `.env` locais. Os artefatos do projeto foram colocados em namespace separado e não substituem arquivos do produto já presentes no repositório.

## Verificação

A verificação principal está em `nexus_hub_continuation_2026-08-22/MANIFEST.json`. Para verificar os hashes da materialização, execute `sha256sum -c MANIFEST.sha256` dentro desse namespace. Para validar os ZIPs, execute `unzip -t` no arquivo original e nos arquivos de `embedded_archives/`.

## Autorização de dados de teste

O responsável autorizou explicitamente a opção B da operação: os candidatos a `credentials.json`, `.env`, chaves privadas e binários associados presentes na fonte foram declarados como dados fictícios/de teste. Mesmo assim, eles não devem ser reutilizados em produção; a autorização foi registrada apenas para preservação integral do material fornecido nesta branch.
