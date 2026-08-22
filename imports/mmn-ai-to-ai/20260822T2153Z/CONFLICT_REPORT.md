# Relatório de preservação de conflitos

A comparação foi realizada antes da integração usando o namespace exclusivo `imports/mmn-ai-to-ai/20260822T2153Z`. Como o namespace não existia no branch-base, não houve colisão de caminho nem arquivo preexistente sobrescrito.

| Verificação | Resultado |
|---|---|
| Namespace de destino | Novo e exclusivo |
| Arquivos fora do namespace alterados | 0 na etapa de cópia |
| Branch padrão `main` alterada | Não |
| Branches remotas excluídas ou reescritas | Não |
| Reset, rebase destrutivo ou force-push | Não executados |
| Colisões de caminho | 0 |

## Nomes repetidos preservados

Arquivos com o mesmo nome-base entre fontes distintas permanecem em diretórios separados. Isso evita a sobreposição e mantém cada origem auditável.

| Nome-base repetido | Localizações preservadas |
|---|---|
| `.gitkeep` | `web-project/.gitkeep`, `web-project/client/public/.gitkeep`, `web-project/drizzle/migrations/.gitkeep` |
| `MILESTONE_6_SUMMARY.md` | `legacy-artifacts/MILESTONE_6_SUMMARY.md`, `source-zip/extracted/MILESTONE_6_SUMMARY.md` |
| `const.ts` | `web-project/client/src/const.ts`, `web-project/shared/const.ts` |
| `db.ts` | `source-zip/extracted/db.ts`, `web-project/server/db.ts` |
| `network.tsx` | `legacy-artifacts/network.tsx`, `source-zip/extracted/network.tsx` |
| `todo.md` | `legacy-artifacts/todo.md`, `source-zip/extracted/todo.md`, `web-project/todo.md` |
| `trpc.ts` | `source-zip/extracted/trpc.ts`, `web-project/client/src/lib/trpc.ts`, `web-project/server/_core/trpc.ts` |

Nenhuma cópia foi descartada por conflito. O manifesto `SOURCE_INVENTORY.tsv` registra o hash SHA-256 e o tamanho de cada arquivo de carga.
