# Inventário da tarefa Nexus Genesis

## Critério de contagem

A contagem considera somente arquivos regulares efetivamente publicados no namespace da branch. Diretórios, entradas ZIP, arquivos temporários e conteúdo excluído por segurança não são contados como arquivos publicados adicionais. A solicitação menciona 295 e 299 arquivos em momentos diferentes; o inventário abaixo registra a quantidade real encontrada, sem fabricar artefatos para alcançar um número.

| Grupo | Arquivos publicados | Bytes publicados | Origem |
|---|---:|---:|---|
| Snapshot do projeto | 129 | 843.344 | `/home/ubuntu/nexus-genesis-orchestrator` |
| Conteúdo extraído do ZIP | 50 | 39.598.280 | `/home/ubuntu/upload/NexusGenesis_Final.zip` |
| Pacote ZIP sanitizado | 1 | 39.364.210 | ZIP revisado, com 50 entradas |
| Auditoria e proveniência | 8 | ver manifesto | Gerados nesta execução |
| **Total do namespace** | **190** | **ver manifesto** | Contagem final de arquivos regulares no staging público |

## Exclusões

O ZIP bruto foi preservado somente em quarentena local e não será publicado porque a fonte continha material de autenticação financeira. O arquivo correspondente no namespace público é um aviso redigido, mantendo o caminho para rastreabilidade sem reproduzir credenciais. O arquivo ignorado `.project-config.json` também foi sanitizado: seus valores reais de banco, Git e segredos foram substituídos por referências a variáveis de ambiente. Também foram excluídos `node_modules`, `dist`, logs temporários, metadados Git, arquivos de ambiente e chaves/certificados identificáveis.

## Resultado da comparação com o pedido

O escopo local fornece **190 arquivos públicos regulares no namespace desta execução**, e não 295 ou 299. Desse total, 188 são linhas de payload no manifesto e dois são o próprio manifesto e seu hash de integridade. O repositório já possuía milhares de arquivos e centenas de artefatos relacionados ao Nexus Genesis em commits anteriores; esses conteúdos não foram duplicados nem alterados. A diferença para 295/299 é informada de forma explícita para manter a integridade do inventário.

## Categorias incluídas

O snapshot cobre o código e configuração do projeto web, testes, documentação Nexus Genesis, schema e artefatos de banco, além dos documentos, scripts, diagramas e relatórios presentes na extração do ZIP. O conteúdo do pacote sanitizado pode ser reconstituído a partir da pasta `source_zip/`, sem depender de arquivos externos ao repositório.
