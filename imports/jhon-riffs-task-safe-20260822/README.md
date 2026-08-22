# Jhon Riff's — Safe Import Bundle

Este pacote contém, de ponta a ponta, os artefatos disponíveis para a tarefa **Jhon Riff's**, incorporados de maneira aditiva ao repositório `Nexus-HUB57/More_Ideas_the_Dragon`.

## Conteúdo

| Diretório | Finalidade |
|---|---|
| `source/outer-root/` | Extração do ZIP principal fornecido |
| `source/nested-root/` | Extração do ZIP de overview aninhado |
| `source/expanded/legacy-root/` | Extração completa do sistema legado incluído na fonte |
| `source/expanded/libraries/` | Extração das bibliotecas ZIP internas |
| `archives/` | Arquivos ZIP preservados como binários originais |
| `modern-project/` | Projeto full-stack moderno produzido durante a tarefa |
| `audit/` | Manifestos, hashes, inventários e protocolo de recuperação |

## Proveniência

A origem primária é `DevelopingaFull-StackAppwithLlama4Maverick.zip`. O hash SHA-256 do arquivo recebido está em `audit/preflight/source_zip.sha256`. O conteúdo foi copiado somente depois de testar a integridade estrutural dos arquivos ZIP e de confirmar que não havia caminhos absolutos ou traversal nos arquivos listados.

## Contagem

A contagem de arquivos incorporados é determinada por `audit/FILES_MANIFEST_SHA256.tsv`, que contém caminho relativo, tamanho em bytes e SHA-256 para cada arquivo. O pacote efetivamente recebido contém mais do que o alvo nominal de 295/299 itens porque inclui um sistema legado com milhares de arquivos e bibliotecas internas. Nenhum arquivo fictício foi criado para preencher a contagem.

## Segurança

Os arquivos não foram executados. Bibliotecas, scripts PHP, JavaScript, TypeScript, binários e documentos foram tratados como artefatos de proveniência. O namespace evita sobrescrever arquivos homônimos no repositório. O protocolo completo está em `audit/SAFE_RECOVERY_PROTOCOL.md`.

## Verificação

A auditoria pode ser reproduzida recalculando os hashes do manifesto e comparando-os com as linhas versionadas. Os arquivos ZIP preservados podem ser validados com `unzip -t`. Antes da publicação, também deve ser confirmada a ausência de alterações fora de `imports/jhon-riffs-task-safe-20260822/` e a ancestralidade direta de `origin/main`.

## Colaboração

A branch desta operação é isolada. Outros commits e branches não são alterados. Se a branch principal avançar durante a revisão, o procedimento deve ser interrompido e atualizado por fast-forward não destrutivo antes de publicar o commit aditivo.
