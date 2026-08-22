# Comparação de cobertura de artefatos

## Objetivo

Este documento evita confundir a quantidade de arquivos do projeto atual com a quantidade de entradas do ZIP legado. A cobertura integral do material enviado não é afirmada enquanto os artefatos legados não forem revisados e aprovados pelo mantenedor.

| Origem ou conjunto | Quantidade observada | Tratamento |
|---|---:|---|
| Projeto local `mmn-ai-to-ai`, excluindo dependências, builds, caches, logs, `.git` e arquivos de ambiente | 132 arquivos | Copiados para `source/mmn-ai-to-ai/` |
| ZIP legado `MMNAI-to-AI.zip` | 3.109 entradas | Preservado fora do Git; SHA-256 em `INTEGRATION_METADATA.json` |
| Namespace de integração, antes do ZIP end-to-end | 141 arquivos | Adicionado em diretório próprio, sem colisões no baseline |
| ZIP end-to-end derivado do namespace | 1 arquivo | Adicionado como artefato final versionável |
| Total esperado de adições do commit, após staging | 142 arquivos | Deve ser confirmado pelo `git diff --cached --name-status` |

## Diferença e justificativa

O ZIP legado não foi copiado integralmente para o repositório porque a auditoria nominal encontrou material de banco/configuração, dependências vendorizadas e documentação com credenciais demonstrativas. O arquivo original permanece disponível no sandbox para revisão, mas não foi executado nem incorporado automaticamente. Essa decisão protege o histórico e evita a publicação acidental de dados sensíveis.

A diferença entre **132 arquivos atuais** e **3.109 entradas legadas** é, portanto, deliberada e está documentada. Os manifestos não substituem o conteúdo legado; eles apenas registram o que foi efetivamente copiado e o que foi excluído por segurança.

## Critério de conclusão

A operação só poderá afirmar cobertura integral se o mantenedor aprovar uma das seguintes alternativas: versionamento de todos os artefatos após redaction e classificação; ou exclusão formal do legado, com registro de que o escopo aceito é somente o projeto atual. Sem essa decisão, a descrição correta é **integração aditiva parcial, auditada e reversível**.

## Proteções aplicadas

Nenhum caminho existente foi sobrescrito ou removido. Nenhum commit existente foi reescrito. A branch principal não foi alterada e não deve receber merge automático. O pacote atual não inclui `node_modules`, builds, caches, logs locais, `.git`, `.env`, tokens, chaves privadas, dumps ou credenciais de produção.

## Próxima decisão humana

O mantenedor deve revisar `INTEGRATION_METADATA.json`, `SECURITY_EXCLUSIONS.md`, `MANIFEST.json`, `CHECKSUMS.sha256` e este documento antes de autorizar o commit e o push da branch. A versão do manual textual legado contém valores demonstrativos `admin/admin`; esses valores não devem ser usados como acesso operacional.
