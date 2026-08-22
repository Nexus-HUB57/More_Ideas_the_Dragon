# Manifesto da Operação Nexus-HUB

## Escopo

Este manifesto documenta a incorporação dos arquivos recebidos para a continuação do desenvolvimento do Nexus-HUB. O trabalho foi realizado em branch incremental, derivada do `main` atualizado, sem `force push`, sem `reset destrutivo`, sem remoção e sem sobrescrita de caminhos existentes.

## Fonte e materialização

| Indicador | Valor |
|---|---:|
| Arquivo-fonte | `ProsseguirdesenvolvimentodoNexus-HUB.zip` |
| SHA-256 da fonte | `72002b0b68387e7f620413ed4fed88dd94a472162e63785bb087add2057022df` |
| Tamanho da fonte | 41.280.943 bytes |
| Payloads ZIP únicos | 15 |
| Ocorrências de ZIP embutido | 16 |
| Ocorrências de arquivos folha | 787 |
| Conteúdos folha únicos por SHA-256 | 430 |
| Arquivos da fonte web materializados | 132 |
| Namespace da fonte recursiva | `task_artifacts/nexus_hub_continuation_2026-08-22/` |
| Namespace do projeto web | `task_artifacts/nexus_hub_app_source_2026-08-22/` |

A cadeia foi auditada com `unzip -t` em todos os níveis encontrados; não foram identificados ZIPs inválidos. O inventário completo com proveniência, tamanhos e hashes está em `nexus_hub_continuation_2026-08-22/MANIFEST.json`, e a lista de hashes está em `nexus_hub_continuation_2026-08-22/MANIFEST.sha256`.

## Organização sem colisões

Os arquivos não foram mesclados diretamente nas pastas de produção, porque muitos níveis do anexo possuem nomes repetidos como `README.md`, `schema.ts`, `routers.ts`, `Dashboard.tsx` e `todo.md`. Cada arquivo folha foi materializado dentro de `files/archive-XXX/`, mantendo no manifesto o nome original e a cadeia de ZIP de onde veio. Os ZIPs internos foram mantidos em `embedded_archives/`, enquanto o anexo byte a byte está em `original/`.

Essa organização permite revisar, comparar ou integrar itens individualmente sem sobrescrever qualquer artefato que outros desenvolvedores já tenham adicionado ao repositório.

## Critério de completude

“Completo” nesta operação significa preservar tanto o anexo integral quanto todos os arquivos folha recuperáveis da cadeia, inclusive ocorrências repetidas e conteúdos binários, e registrar seus hashes. Por isso, o número verificável não é artificialmente fixado em 295 ou 299: a fonte efetivamente auditada possui 787 ocorrências e 430 conteúdos únicos. Os números 295/299 existentes em outros pacotes do repositório continuam preservados e não foram substituídos.

## Validações previstas antes do push

A branch será submetida a `git diff --check`, verificação de status limpo após o commit, comparação da contagem de arquivos antes/depois, validação dos hashes do manifesto e conferência do SHA remoto após o push. O histórico de `origin/main` e das demais branches será tratado como somente leitura.
