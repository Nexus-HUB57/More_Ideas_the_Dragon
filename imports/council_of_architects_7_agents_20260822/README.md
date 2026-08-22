# Conselho dos Arquitetos — Importação Segura

Esta pasta contém uma cópia namespaced dos artefatos associados ao desenvolvimento do **Conselho dos 7 Agentes Elite**. A importação foi preparada em uma branch isolada, baseada no `origin/main` observado no momento da auditoria, sem alterar, remover ou sobrescrever qualquer caminho já existente no repositório.

## Estratégia de recuperação segura

O conteúdo foi adicionado exclusivamente em `imports/council_of_architects_7_agents_20260822/`. O pacote não utiliza nomes de arquivos no topo do repositório e não substitui componentes homônimos já versionados. A branch de trabalho é `chore/council-architects-safe-import-20260822`; a branch principal permanece intacta.

> Em caso de conflito, o conteúdo deverá continuar namespaced e ser revisado por pull request. Não usar `reset --hard`, remoções em massa, rebase destrutivo ou sobrescrita de arquivos existentes.

## Conteúdo materializado

| Área | Conteúdo | Quantidade verificada |
|---|---|---:|
| `source_project/` | Snapshot do projeto web restaurado, sem dependências instaladas, logs de runtime, metadados locais ou saídas de build | 125 arquivos |
| `source_archive/` | Arquivo ZIP sanitizado com o pacote recebido e seu pacote aninhado preservado como artefato | 1 ZIP; 49 entradas externas |
| `task_package/outer_files/` | Entradas extraídas do ZIP externo | 49 arquivos |
| `task_package/nested_files/` | Entradas extraídas do ZIP interno, sem material sensível | 304 arquivos |

O arquivo interno sanitizado contém **305 entradas ZIP**, das quais **304 são arquivos materializados**; a diferença corresponde a diretório(s) de arquivo. O payload materializado possui **479 arquivos antes dos manifestos e relatórios desta importação**.

## Contagem solicitada versus evidência disponível

A solicitação mencionou uma coleção numerada de 01 a 295. A auditoria não encontrou 295 arquivos independentes novos no upload: encontrou 125 arquivos no snapshot do projeto, 49 entradas no pacote externo e 326 entradas no pacote interno original, incluindo diretórios e conteúdo que não pode ser versionado com segurança. Não foram criados placeholders, arquivos fictícios ou duplicatas para forçar a contagem 295. A contagem real está registrada nos manifestos versionados.

## Proteção de dados sensíveis

O pacote aninhado original continha 21 entradas associadas a material de configuração privada ou chaves, incluindo um arquivo de configuração local e a árvore `PrivateKey_WIF/`. Essas entradas foram excluídas do arquivo sanitizado e da extração materializada. O arquivo de exemplo de configuração, quando presente, não contém valores secretos e foi preservado como referência técnica.

O arquivo recebido original permanece somente no armazenamento de entrada local; este commit contém apenas o arquivo sanitizado. Nenhum segredo, chave privada ou credencial deve ser adicionado ao repositório.

## Validação

A validação deve confirmar: integridade dos ZIPs com `unzip -tq`, ausência de nomes sensíveis na extração materializada, hashes SHA-256 no manifesto, contagem do payload, base commit preservado e zero arquivos removidos ou modificados em relação ao `origin/main`.

## Origem

- Projeto-fonte local: `nexus-hub-v2`, checkpoint `9b336d27`.
- Repositório-alvo: `Nexus-HUB57/More_Ideas_the_Dragon`.
- Branch de trabalho: `chore/council-architects-safe-import-20260822`.
- Data da operação: 2026-08-22.

Consulte `SAFE_RECOVERY_REPORT.md`, `MANIFEST.tsv` e `MANIFEST.sha256` para a trilha de auditoria completa.
