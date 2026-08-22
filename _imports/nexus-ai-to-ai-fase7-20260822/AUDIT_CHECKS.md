# Checklist de validação do import

A operação só pode ser considerada pronta quando todos os checks abaixo forem confirmados no staging e novamente após o commit.

| Verificação | Critério de aprovação |
|---|---|
| Integridade do ZIP de origem | `unzip -t` sem erros |
| Integridade do ZIP sanitizado | `unzip -t` sem erros |
| Arquivos sensíveis publicados | zero entradas de ambiente na árvore importada |
| Links simbólicos inesperados | zero links simbólicos na árvore importada |
| Colisões | zero gravações sobre caminhos existentes |
| Exclusões remotas | zero caminhos removidos em relação à base |
| Histórico | HEAD da base preservado como ancestral do commit |
| Manifesto | todas as entradas de conteúdo possuem hash SHA-256 |
| Conteúdo | projeto web, fonte principal e níveis aninhados presentes |
| Push | branch nova enviada sem force-push |

A validação de colisões usa a lista de caminhos da base e compara o conjunto pós-importação. A única diferença aprovada é a adição da árvore `_imports/nexus-ai-to-ai-fase7-20260822/` e do artefato `artifacts/nexus-ai-to-ai-fase7-20260822-end-to-end.zip`.
