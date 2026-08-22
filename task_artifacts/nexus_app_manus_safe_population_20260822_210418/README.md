# NEXUS — Bundle de Povoamento Seguro

Este diretório é uma área isolada para os artefatos da tarefa NEXUS. Ele foi criado em uma branch dedicada a partir de `origin/main`, sem reescrever histórico, sem substituir caminhos existentes e sem remover arquivos do repositório.

## Conteúdo

O subdiretório `source/nexus_app_workspace/` contém o workspace da aplicação NEXUS, preservando código, documentação, configurações, schema, routers, páginas React, testes e scripts versionáveis. O subdiretório `source/uploaded_archive_extracted/` contém os arquivos navegáveis extraídos do ZIP fornecido pelo usuário, também isolados e sem colisão com o restante do repositório. O diretório `archives/` contém o ZIP end-to-end sanitizado, com o mesmo conteúdo versionável do upload, exceto arquivos de ambiente e logs gerados.

A auditoria completa está em `audit/MANIFEST.tsv`, com caminho de destino, tamanho e SHA-256 por arquivo. `audit/SHA256SUMS.txt` permite repetir a verificação; `audit/generate-manifests.sh` é o script reprodutível usado para regenerar os manifestos.

## Inventário desta importação

| Item | Quantidade |
|---|---:|
| Arquivos do workspace NEXUS versionados | 172 |
| Arquivos extraídos do ZIP enviado e versionáveis | 66 |
| Arquivos no ZIP end-to-end sanitizado | 66 |
| Arquivos de fonte no bundle | 238 |
| Linhas de manifesto para fontes e arquivo | 243 |

A contagem representa os artefatos realmente disponíveis no workspace e no upload. Nenhum arquivo foi criado artificialmente para atingir uma quantidade nominal. O repositório já possuía outros bundles e históricos, que foram preservados sem alteração.

## Integridade e segurança

O ZIP original foi testado com `unzip -t` e apresentou 68 entradas válidas. A cópia bruta não foi adicionada ao repositório porque continha arquivos de ambiente e marcadores de credenciais. Em seu lugar, foi criado `archives/AplicativoFullstackNexus_sanitized.zip`, preservando os 66 arquivos versionáveis. O SHA-256 do ZIP original, mantido somente como referência de proveniência no ambiente de trabalho, foi `2677299390da71fc5b4ec6684bc084b088920e5c1a08be0d8e812688682e7d49`.

A sanitização excluiu apenas o arquivo de configuração do ambiente que continha credenciais, outros artefatos de credenciais/ambiente, dependências instaladas, histórico Git local, saída de build e logs gerados. O código-fonte e a documentação foram preservados. Ver `audit/IMPORT_POLICY.md` para o detalhamento.

## Recuperação segura

A recuperação pode ser feita removendo somente esta branch ou revertendo somente o commit desta importação, sem tocar em `main` ou em outros bundles. Não use `reset --hard`, `clean` ou force-push. Antes de qualquer integração, revise o diff e os checksums na branch dedicada.
