# Nexus-HUB — Pacote de Continuação da Tarefa

Este diretório materializa, em um namespace isolado, o anexo recebido para a continuação do desenvolvimento do Nexus-HUB. A estrutura preserva a origem dos arquivos sem permitir colisões de nomes: cada arquivo extraído fica associado ao arquivo ZIP de origem em `files/archive-XXX/`, enquanto os ZIPs aninhados são preservados em `embedded_archives/`.

## Integridade e contagem

O manifesto `MANIFEST.json` é a fonte de verdade desta materialização. O anexo original está em `original/`, e `MANIFEST.sha256` registra SHA-256 do anexo, dos arquivos materializados e dos ZIPs internos.

A cadeia contém **15 payloads ZIP únicos**, **16 ocorrências de ZIPs embutidos**, **787 ocorrências de arquivos folha** e **430 conteúdos folha únicos por SHA-256**. A contagem é deliberadamente apresentada como ocorrências e conteúdos únicos, pois o pacote possui arquivos repetidos em diferentes versões/níveis de ZIP.

## Protocolo de preservação

Nenhum caminho existente do repositório foi substituído ou removido. Os nomes originais dos arquivos são preservados no manifesto; a materialização usa diretórios `archive-XXX` e sanitização de nomes apenas para impedir colisões e traversal de caminhos. Conteúdos binários e candidatos a dados fictícios/de teste foram preservados conforme autorização explícita do responsável na operação.

## Navegação

| Caminho | Conteúdo |
|---|---|
| `original/` | Anexo ZIP original, byte a byte |
| `embedded_archives/` | Payloads ZIP internos, cada um com hash e chave no manifesto |
| `files/` | Arquivos folha materializados por arquivo ZIP de origem |
| `MANIFEST.json` | Inventário estruturado, cadeia de origem, tamanhos e hashes |
| `MANIFEST.sha256` | Lista verificável de SHA-256 |

## Verificação local

A verificação pode ser refeita com `sha256sum -c MANIFEST.sha256` a partir deste diretório. Para conferir os ZIPs, use `unzip -t` nos arquivos de `original/` e `embedded_archives/`.
