# Arquivos gerados excluídos da publicação

Durante a revisão de segurança, dois arquivos presentes na cópia local foram identificados como gerados pelo ambiente de desenvolvimento e não foram incluídos no commit público.

| Arquivo local | Motivo da não publicação | Ação tomada |
|---|---|---|
| `web-project/.project-config.json` | Continha credenciais de banco, chaves de sessão, tokens de integração e metadados internos do ambiente | A cópia foi removida antes do stage; nenhum valor foi replicado em outro arquivo |
| `web-project/.manus-logs/devserver.log` | Log efêmero de runtime, desnecessário para reconstrução do código e sujeito a conter dados operacionais | A cópia foi removida antes do stage |

Essa exclusão se aplica exclusivamente às cópias recém-criadas dentro do namespace isolado desta branch. Nenhum arquivo, commit ou pasta preexistente do repositório destino foi alterado ou excluído.

Os arquivos de código, documentação, schema, migrations, testes, configurações de build não sensíveis, ZIP original e conteúdo extraído permanecem incluídos. O `SOURCE_INVENTORY.tsv` será regenerado para refletir a carga efetivamente versionada.

## Observação de segurança

Como o arquivo de configuração local continha credenciais operacionais, os responsáveis pelo ambiente devem considerar a rotação dessas credenciais conforme a política interna. Este relatório não reproduz nenhum valor secreto.
