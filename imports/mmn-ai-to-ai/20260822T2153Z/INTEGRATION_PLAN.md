# Plano de integração não destrutiva

## Objetivo

Adicionar os artefatos disponíveis do projeto MMN AI-to-AI ao repositório `Nexus-HUB57/More_Ideas_the_Dragon` sem sobrescrever, remover ou reescrever o conteúdo mantido por outros desenvolvedores.

## Base de operação

| Item | Valor |
|---|---|
| Repositório | `Nexus-HUB57/More_Ideas_the_Dragon` |
| Branch padrão auditada | `main` |
| Commit-base | `1254d570131d82a715c1b1bbab4ed1906e3d8201` |
| Branch de integração | `agent/mmn-ai-to-ai-safe-population-20260822T2153Z` |
| Namespace de destino | `imports/mmn-ai-to-ai/20260822T2153Z/` |
| Estratégia | Cópia aditiva em namespace novo |

## Fontes incluídas

| Fonte | Critério de inclusão | Quantidade auditada |
|---|---|---:|
| `/home/ubuntu/mmn-ai-to-ai` | Todos os arquivos regulares, exceto `.git`, `node_modules`, `dist` e os dois arquivos gerados sensíveis documentados | 130 |
| `/home/ubuntu/projeto` | Todos os arquivos regulares restaurados | 3 |
| `/home/ubuntu/upload/ProsseguirDesenvolvimentodoProjeto.zip` | Arquivo original e os arquivos extraídos | 1 + 16 |
| Manifestos de auditoria | Evidências da inspeção local, do destino e da revisão de segurança | 3 |

A carga efetivamente versionada contém **150 arquivos de origem/artefato** antes dos documentos de controle criados dentro do namespace: 130 do projeto web, 3 legados e 17 relacionados ao ZIP. O número é verificável por `SOURCE_INVENTORY.tsv`; não há criação de arquivos vazios ou fictícios para atingir uma quantidade nominal.

## Protocolo de segurança

A operação é reversível por remoção da branch de integração, caso os mantenedores decidam não abrir um pull request. A operação não usa `git reset --hard`, `git rebase`, `git push --force`, exclusões, merges automáticos ou alterações no branch `main`. O namespace foi verificado como inexistente antes da cópia.

Apenas a branch isolada deverá ser publicada. Os dois arquivos gerados com credenciais e dados efêmeros foram excluídos antes do stage; o motivo está em `audit/EXCLUDED_GENERATED_FILES.md`. O commit deve conter exclusivamente arquivos sob `imports/mmn-ai-to-ai/20260822T2153Z/`. Qualquer conflito real de caminho deve interromper a operação; nesta execução não foi encontrado conflito porque o destino é novo.

## Validação de saída

A validação final deve confirmar que o commit-base continua ancestral do commit da integração, que a árvore de trabalho está limpa, que todos os arquivos adicionados estão dentro do namespace, que a cópia do ZIP é byte a byte idêntica e que a branch foi publicada sem sobrescrever outra branch.
