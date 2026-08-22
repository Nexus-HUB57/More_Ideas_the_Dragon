# Guia de revisão e importação segura

## Escopo

Esta execução adiciona um namespace isolado em `imports/nexus-genesis-task-20260822/`. Nenhuma branch existente, commit existente, tag existente ou caminho rastreado no `HEAD` foi destinado à alteração. A branch de trabalho deve ser revisada por Pull Request antes de qualquer merge.

## Revisão recomendada

Use `git fetch origin` e compare a branch com a base indicada no relatório. Revise primeiro `audit/manifest.tsv`, `audit/provenance.md`, `audit/source-inventory.md` e `audit/manifest.sha256`. Em seguida, valide a listagem do pacote com `unzip -Z1 package/NexusGenesis_Final.sanitized.zip` e confira que o arquivo não contém `.git`, `node_modules`, arquivos de ambiente ou chaves.

## Conteúdo do snapshot

A pasta `project/` é um snapshot do projeto local, sem dependências instaladas, artefatos de build, logs temporários ou metadados Git. A pasta `source_zip/` preserva a estrutura extraída da fonte com um arquivo redigido no caminho do material sensível. A pasta `package/` contém o ZIP público sanitizado.

## Limites

O pacote não é uma declaração de que os três núcleos estão conectados a endpoints de produção. Os artefatos são código, documentação, scripts, testes e materiais de integração encontrados nas fontes locais. A contagem é a quantidade real do inventário público; não foram criados arquivos artificiais para atingir 295 ou 299.

## Recuperação

Se a revisão não for aprovada, mantenha a branch e o commit para auditoria e não faça force-push. A branch principal continua sendo a autoridade do repositório. Qualquer correção deve ser feita em nova branch ou em novos commits revisáveis, sem reescrever o histórico existente.
