# Manifesto técnico e validação

**Pacote:** `livro_das_sementes_20260822`

**Base auditada:** `Nexus-HUB57/More_Ideas_the_Dragon`, branch `main`, commit-base `e2f971f5b9db` (origin/main no momento da auditoria).

**Branch de contribuição:** `agent/livro-das-sementes-safe-20260822`.

**Estratégia:** contribuição exclusivamente aditiva em `task_artifacts/livro_das_sementes_20260822/`. Nenhum caminho previamente rastreado foi alterado, substituído ou removido.

## Inventário

O diretório contém cinco PNGs visuais, este manifesto, `README.md` e `SHA256SUMS`. O ZIP é mantido no nível superior do repositório e contém a pasta do pacote, sem incluir a si próprio.

## Validações executadas

- clone realizado a partir do repositório oficial via GitHub CLI;
- branch local criada a partir de `origin/main` atualizado;
- working tree auditado antes da edição;
- verificação de colisão dos caminhos-alvo concluída sem colisões;
- tipos MIME e dimensões dos PNGs verificados;
- checksums SHA-256 gerados em `SHA256SUMS`;
- `sha256sum -c SHA256SUMS` aprovado;
- ZIP criado com conteúdo delimitado ao pacote;
- diff final revisado para confirmar apenas adições;
- histórico anterior preservado, sem rebase, amend, reset destrutivo ou force push.

## Safe Recovery

Para recuperar o pacote, extraia o ZIP em uma pasta separada ou faça checkout apenas da branch de contribuição. Para comparar com a base: `git diff origin/main...HEAD --stat` e `git diff --name-status origin/main...HEAD`. Não use comandos destrutivos sobre `main` ou sobre branches de outros desenvolvedores.
