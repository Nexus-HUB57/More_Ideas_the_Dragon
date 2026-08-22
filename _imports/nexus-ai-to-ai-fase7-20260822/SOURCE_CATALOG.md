# Catálogo da fonte importada

A contagem abaixo é feita sobre a árvore preparada antes do commit e exclui somente arquivos de ambiente identificados como sensíveis. Todos os caminhos são novos e ficam sob `_imports/nexus-ai-to-ai-fase7-20260822/`.

| Camada | Conteúdo | Arquivos esperados antes do manifesto |
|---|---|---:|
| `source-archive/` | Arquivos do ZIP principal, sem `.env`, com o ZIP aninhado em versão sanitizada | 55 |
| `nested-archives/` | Conteúdo extraído do `Booster_Nexus-Hibryd.zip`, incluindo os níveis Sigma/AgenteNexus, sem `.env` | 109 |
| `web-project/` | Projeto web atual, sem `.git/`, dependências vendorizadas, logs locais, caches e arquivos de ambiente | 127 |
| **Total da árvore de conteúdo** | **Arquivos antes de documentação e manifestos** | **293** |

O número de conteúdo não representa uma exclusão de arquivos do pacote. O ZIP de origem possui 56 arquivos extraídos; um arquivo `.env` é intencionalmente omitido e o arquivo `Booster_Nexus-Hibryd.zip` é representado por uma cópia sanitizada, além de seus conteúdos extraídos. A árvore do projeto web contém os arquivos fonte necessários, enquanto os diretórios regeneráveis do ambiente local não são versionados.

## Organização

A separação em três camadas evita colisões com caminhos antigos e permite que outros desenvolvedores revisem cada origem independentemente. Arquivos com nomes iguais em fontes diferentes são preservados porque vivem em subdiretórios distintos; nenhum foi mesclado por nome ou gravado sobre outro.
