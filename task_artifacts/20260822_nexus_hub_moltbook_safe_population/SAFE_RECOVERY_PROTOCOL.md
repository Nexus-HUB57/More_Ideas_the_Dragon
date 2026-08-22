# Protocolo Safe Recovery — Nexus Hub

## Objetivo

Povoar o repositório compartilhado com os artefatos desta tarefa sem alterar o histórico, os arquivos ou as pastas que já pertencem a outros desenvolvedores. A operação adota um namespace exclusivo, branch de trabalho baseada em `origin/main` e commits aditivos.

## Controles obrigatórios

| Controle | Regra | Evidência |
| --- | --- | --- |
| Base de trabalho | O branch é criado a partir do `origin/main` auditado | `git rev-parse`, `git merge-base` e log |
| Histórico | Não usar reset destrutivo, rebase de branches de terceiros ou force-push | Revisão dos comandos e do log |
| Arquivos | Adicionar somente em `task_artifacts/20260822_nexus_hub_moltbook_safe_population/` | `git diff --name-status` deve conter apenas `A` |
| Colisões | Não sobrescrever arquivos com o mesmo nome em outros caminhos | Manifesto de colisões |
| Segredos | Não versionar `.env`, tokens, chaves privadas ou credenciais | Relatório de quarentena |
| Binários | Preservar o ZIP original e validar com `unzip -t` | Hash e resultado de integridade |
| Integridade | Verificar hashes e `git diff --check` antes do commit | Manifestos SHA-256 |
| Push | Publicar somente o branch de trabalho; nenhuma alteração direta em `main` | `git ls-remote` após push |

## Tratamento de arquivos sensíveis

Arquivos `.env` e equivalentes podem conter segredos mesmo quando aparecem no material de origem. Eles não devem ser copiados como arquivos soltos para o commit. O fato é registrado com caminho, tamanho e hash do arquivo original, sem expor o conteúdo. O arquivo `.env.example`, quando presente, pode ser mantido se contiver apenas nomes de variáveis e valores de exemplo não sensíveis.

## Tratamento de arquivos gerados

Dependências instaladas, caches, diretórios `.git`, artefatos de build e arquivos temporários não são parte do pacote de fonte. A exclusão desses itens é de escopo de empacotamento, não uma exclusão do repositório compartilhado. O relatório registra os padrões usados para tornar a reprodução auditável.

## Critério de aprovação

A operação somente é considerada aprovada quando todos os itens abaixo forem verdadeiros: o branch remoto de trabalho aponta para um commit novo baseado em `origin/main`; o diff do commit contém apenas adições no namespace isolado; a quantidade de arquivos adicionados coincide com o manifesto; o ZIP passa no teste de integridade; os hashes do pacote são reprodutíveis; os testes e a checagem TypeScript do projeto web passam; e não existe arquivo secreto solto no commit.

## Procedimento de recuperação

Se qualquer validação falhar, interromper o commit ou push, registrar o erro e manter o clone local para análise. Não remover o conteúdo para “limpar” a tentativa. Em caso de conflito de nome ou caminho, manter os dois artefatos em caminhos isolados e registrar o conflito para decisão humana.
