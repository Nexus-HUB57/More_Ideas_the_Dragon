# Manifesto de importação segura

## Estado do repositório hospedeiro antes da importação

| Campo | Valor |
|---|---|
| Repositório | `Nexus-HUB57/More_Ideas_the_Dragon` |
| Commit-base | `50d5dbdc9f6f025c51b181d8bf46468080f9b550` |
| Branch de trabalho | `agent/ai-doctor-dimhex-safe-population-20260822` |
| Arquivos rastreados antes | `24408` |
| Especificações `technical_spec_001`–`299` | `299` |
| Referências remotas observadas | `64` |
| Estratégia | Importação aditiva, isolada e revisável |

Os valores acima também estão registrados em `.safe_audit/pre_population_state.txt`, que pertence ao repositório hospedeiro e documenta o ponto de recuperação.

## Conteúdo adicionado

| Caminho | Tipo | Origem |
|---|---|---|
| `source/AI_Doctor/package.json` | Código/configuração | Clone local do AI_Doctor |
| `source/AI_Doctor/server.ts` | Backend TypeScript | Clone local do AI_Doctor |
| `source/AI_Doctor/src/App.tsx` | Frontend React | Clone local do AI_Doctor |
| `source/Ex.ONC.txt` | Especificação textual | Arquivo fornecido na tarefa |
| `README.md` | Documentação | Gerado para esta importação |
| `audit/IMPORT_MANIFEST.md` | Auditoria | Gerado para esta importação |
| `scripts/validate_safe_population.sh` | Validação | Gerado para esta importação |

## Garantias de segurança

A importação não altera os 24.408 caminhos rastreados no commit-base. Todos os arquivos novos ficam sob o diretório único `task_artifacts/ai_doctor_dimhex_safe_population_20260822/`. Não são incluídos `.git`, `node_modules`, builds, `.env`, credenciais, chaves, bancos ou dados pessoais.

O ZIP correspondente deve incluir este manifesto, os arquivos-fonte copiados, os registros de hash e a documentação. O arquivo ZIP não deve ser incluído dentro de si mesmo.

## Resultado esperado

Após o commit, a validação deve confirmar que a branch contém o commit-base como ancestral, que a `main` não foi alterada e que o conjunto importado é exatamente o conteúdo descrito neste manifesto.

Autor: **Manus AI**
