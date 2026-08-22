# Política de Importação Segura

## Base e branch

A operação parte do commit mais recente observado em `origin/main`, na branch dedicada criada para esta importação. O histórico existente permanece intacto. Nenhuma operação de reescrita, force-push, reset ou limpeza do repositório é permitida.

## Isolamento

Todos os arquivos novos ficam sob `task_artifacts/nexus_app_manus_safe_population_20260822_210418/`. Assim, nomes como `package.json`, `tsconfig.json`, `NEXUS_SYSTEM.md` e `todo.md` não substituem arquivos de mesmo nome que já existam na raiz ou em outros bundles.

## Preservação

A cópia foi feita por adição em uma pasta nova. Colisões de caminho no conteúdo original não podem afetar o conteúdo pré-existente porque os dois conjuntos possuem raízes distintas. O commit deve conter somente entradas `A` nessa pasta; qualquer `M`, `D` ou `R` fora dela é condição de parada.

## Itens não versionados

| Categoria | Motivo |
|---|---|
| Arquivos de ambiente e credenciais, incluindo `.project-config.json` | Não devem ser publicados nem incorporados ao histórico; o arquivo observado continha credenciais de banco, armazenamento, sessão e APIs. |
| `node_modules` e caches do gerenciador | Dependências são reconstruíveis pelo lockfile e não são fonte do produto. |
| Saída de build | É derivada e pode ser regenerada; evita poluir o histórico. |
| Diretório `.git` do workspace | Histórico local não deve ser aninhado no bundle. |
| Logs do runtime | São evidência local e podem conter caminhos ou URLs efêmeras; o código e a documentação permanecem. |

## Pacote ZIP

O upload original foi validado com `unzip -t`, mas não foi commitado em bruto porque continha dois arquivos de ambiente. O arquivo `archives/AplicativoFullstackNexus_sanitized.zip` contém os 66 arquivos versionáveis do upload. O checksum do upload original é registrado no README somente para proveniência; o conteúdo bruto continua fora do repositório.

## Critérios de aceitação

A operação somente é considerada concluída se a branch estiver limpa após o commit, o diff em relação à base mostrar apenas adições dentro do diretório isolado, o manifesto tiver uma linha para cada arquivo versionável e os SHA-256 forem verificáveis com o script fornecido. O push deve ser feito somente para a branch dedicada; a integração em `main` deve ocorrer por revisão/PR.
