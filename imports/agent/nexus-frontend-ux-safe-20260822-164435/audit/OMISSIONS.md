# Registro de omissões e proteção de dados

## Arquivo não importado

O arquivo local `.project-config.json` foi deliberadamente omitido do pacote. Embora faça parte da árvore local, ele contém valores sensíveis, incluindo `DATABASE_URL` com credenciais, referências de backend Git e identificadores/segredos de ambiente. Versionar esse arquivo violaria o protocolo de segurança da operação.

## Artefatos gerados não importados

As pastas `node_modules/`, `dist/`, `.manus-logs/`, `coverage/` e `.git/` não foram importadas. São dependências vendorizadas, saídas geradas, logs de execução, cobertura de testes ou metadados internos do repositório local; não constituem fonte autoral da tarefa e podem conter dados transitórios ou sensíveis.

## Contagem

A fonte local apresentou 128 arquivos elegíveis pela regra de inventário. Foram copiados 127 arquivos, com a diferença de um arquivo correspondente ao `.project-config.json` omitido por segurança. O ZIP fornecido passou no teste de integridade e seus 37 arquivos foram extraídos sem sobrescrita. O ZIP original também foi preservado como artefato separado.

## Integridade

As diferenças de conteúdo dos arquivos com nomes semelhantes existentes em `main` foram preservadas: a importação utiliza um caminho isolado e não substitui cópias anteriores. O manifesto SHA-256 é a fonte de conferência para os arquivos efetivamente publicados nesta branch.
