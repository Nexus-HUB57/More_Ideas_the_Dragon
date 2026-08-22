# Importação segura — Nexus Frontend UX e WebSocket

Esta pasta contém uma cópia auditável dos artefatos elegíveis da tarefa de integração WebSocket e aprimoramento de UX do projeto `nexus-frontend`, importados em branch exclusiva para preservar o trabalho concorrente do repositório.

## Conteúdo

| Área | Conteúdo |
|---|---|
| `source/project/` | Código, configuração, documentação e testes do projeto local, preservando sua árvore relativa e excluindo dependências, caches, logs, builds e credenciais locais. |
| `source-material/roadmap-unpacked/` | Todos os 37 arquivos do ZIP fornecido, extraídos sem sobrescrita. |
| `source-material/` | ZIP original fornecido pelo usuário, incluindo seu ZIP aninhado intacto. |
| `audit/` | Manifesto SHA-256, relatório de validação e registro de omissões. |

A contagem reportada é a contagem efetivamente encontrada; nenhum arquivo artificial foi criado para atingir uma meta numérica. O caminho de importação é único e não substitui arquivos existentes no repositório.

## Regra de segurança

O arquivo `.project-config.json` local não foi incluído porque continha `DATABASE_URL`, informações de backend Git e referências de segredos. O registro detalhado está em `audit/OMISSIONS.md`; nenhum valor secreto é versionado nesta pasta.

## Validação

O manifesto em `audit/manifest.json` registra cada arquivo importado, tamanho, SHA-256 e categoria. O relatório em `audit/VALIDATION.md` registra o baseline remoto, a branch, o commit de origem, as contagens e as verificações executadas. O ZIP consolidado `source-material/nexus-frontend-ux-safe-import.zip` contém 167 entradas e possui SHA-256 `8ec0e7abebf98c873de50bb28a882fe7c5353802cd58851679ca3b558b6dd1e4`.

## Revisão

Esta branch deve ser revisada pelos mantenedores e pelos demais desenvolvedores antes de qualquer merge em `main`. Não foi executado merge automático, rebase destrutivo, reset ou push forçado.
