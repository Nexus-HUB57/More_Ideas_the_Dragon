# Auditoria da base do repositório

A branch de integração foi criada a partir do commit `f33745ebdc2697ab791d3963c9d17c1bf3d2daa3`, que era o `origin/main` observado no início desta operação. A base continha 43.618 arquivos rastreados e aproximadamente 180 branches remotas visíveis no clone. A branch `main` não foi editada.

## Controles aplicados

| Controle | Resultado |
|---|---|
| Branch de integração | `import/legado-lucas-dashboard-safe-20260822` |
| Prefixo namespaced | `incoming/legado-lucas-dashboard-safe-20260822/` |
| Alterações destrutivas | Nenhuma |
| `git reset --hard` | Não utilizado |
| Exclusão de arquivos da base | Não realizada |
| Sobrescrita de caminhos da base | Não realizada |
| Colisões no prefixo novo | Nenhuma identificada |
| Projeto importado | 127 arquivos, sem `node_modules` e `.git` |
| Pacote de referência | 125 entradas; 467.467.961 bytes; SHA-256 registrado no manifesto |

O repositório já contém outras integrações de Legado Lucas e Bitcoin em caminhos distintos. Por isso, esta entrega não tenta mesclar arquivos na raiz nem substituir bundles anteriores: adiciona somente uma nova unidade de proveniência, permitindo revisão e merge independentes.

## Limitação do ZIP

O ZIP bruto não foi adicionado. Além de superar 100 MB, ele contém artefatos de carteira e arquivos com potencial material de custódia. O inventário preserva nomes, quantidade, tamanho e SHA-256 sem replicar segredos. O original continua no armazenamento local indicado no README da integração.
