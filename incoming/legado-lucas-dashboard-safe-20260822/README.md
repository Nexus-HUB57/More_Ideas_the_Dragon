# Integração segura — Legado Lucas Dashboard

Esta pasta é uma **área namespaced e aditiva** para integrar os artefatos do projeto `legado-lucas` ao repositório `Nexus-HUB57/More_Ideas_the_Dragon`. Ela foi criada em uma branch dedicada para evitar alterações diretas na `main` e não modifica, exclui ou sobrescreve caminhos já existentes no repositório.

## Proveniência

| Campo | Valor |
|---|---|
| Repositório de destino | `Nexus-HUB57/More_Ideas_the_Dragon` |
| Branch de integração | `import/legado-lucas-dashboard-safe-20260822` |
| Commit base auditado | `f33745ebdc2697ab791d3963c9d17c1bf3d2daa3` |
| Origem do projeto | `/home/ubuntu/legado-lucas` |
| Snapshot do projeto | `13c71363` (restaurado pelo WebDev) |
| Arquivos do projeto incluídos | 127 arquivos, sem `node_modules` e sem `.git` |
| Pacote de referência | `/home/ubuntu/upload/Documentos.zip` |

## Organização

`source_project/` contém a cópia integral do projeto de aplicação, preservando sua estrutura relativa. `documentos_zip_safe_manifest/` contém o inventário e o hash do pacote de referência; o ZIP bruto não é duplicado no Git por exceder o limite usual de arquivo do GitHub e por conter material potencialmente sensível de carteiras. O arquivo original permanece preservado localmente em `/home/ubuntu/upload/Documentos.zip` para o proprietário revisar e transferir por um canal de custódia apropriado, se necessário. `audit/` contém os relatórios de proveniência, integridade, colisões e validação.

## Protocolo de segurança

Arquivos com seeds, chaves privadas, WIF, xprv, wallet databases, credenciais ou outros segredos não são republicados. O inventário registra seus caminhos e hashes sem copiar valores sensíveis. Nenhum script ou binário recebido de terceiros é executado durante a integração; os documentos são tratados somente como dados.

## Como revisar

A revisão deve começar pelo diff desta branch e pelos manifestos em `audit/`. O merge deve ser feito por pull request após revisão dos demais desenvolvedores. A branch `main` permanece inalterada nesta operação.

> Esta integração é um pacote de proveniência e não substitui a revisão de segurança, a configuração de segredos do ambiente ou a validação operacional de qualquer carteira Bitcoin.
