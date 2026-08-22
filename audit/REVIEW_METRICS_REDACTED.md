# Evidências Sanitizadas da Revisão Cirúrgica

**Data da revisão:** 22 de agosto de 2026
**Modo:** leitura passiva; nenhum script, teste, migration ou artefato foi executado.
**Escopo:** `origin/main` no commit `5d8e9c39333c90d18fd1cc7d808dd9ad57e2c4a8` e a branch publicada de integração no commit `bdb4605a54fcf4cccdbc0803dc54dcd5e6798e7c`.

| Métrica | Resultado |
|---|---:|
| Arquivos regulares no worktree | 18.482 |
| Links simbólicos | 1 |
| Arquivos executáveis | 58 |
| Arquivos acima de 90 MB | 0 |
| Candidatos a testes por nome | 984 |
| Manifestos de dependências | 59 |
| Arquivos binários ou de mídia por extensão | 4.061 |
| Nomes de arquivos classificados como alto risco | 105 |
| Caminhos com marcadores de conteúdo de segredo | 6 |
| Caminhos com marcadores heurísticos de operações perigosas | 4.602 |
| Caminhos com marcadores de instruções não confiáveis | 117 |
| Arquivos `.gitignore` | 12 |
| Arquivos `.gitattributes` | 0 |
| Ponteiros Git LFS detectados | 0 |
| Estado do worktree durante a auditoria | limpo |

## Limites da evidência

Os marcadores de alto risco, operações perigosas e instruções não confiáveis são **heurísticas de triagem**, não uma conclusão de explorabilidade. A contagem elevada de operações perigosas pode incluir documentação, exemplos, fixtures e testes. Nenhum valor de segredo, token, chave privada, credencial, payload ou conteúdo ofuscado foi copiado para este relatório.

A presença de nomes de arquivos relacionados a credenciais, chaves, carteiras, backups ou tokens deve ser tratada como exposição potencial até que os proprietários confirmem a natureza de teste e a inexistência de material real. A auditoria não substitui rotação de credenciais, análise forense de histórico ou revisão jurídica de dados sensíveis.

## Relação entre branches

A branch publicada `integration/safe-mmnai-ai-20260822T132042Z` foi incorporada ao `origin/main` pelo merge commit `0d6f99f`. O `origin/main` atual contém essa integração e onze commits posteriores, culminando em `5d8e9c3`. A revisão foi feita sobre essa base atual, sem modificar a `main` durante a auditoria.

## Evidências estruturais principais

- O `package.json` da raiz representa um aplicativo Expo e não declara scripts `test` ou `build`.
- O `tsconfig.json` da raiz restringe a compilação a `src/**/*`, embora existam numerosos módulos TypeScript na raiz e em subárvores.
- O `routers.ts` da raiz referencia `_core`, `COOKIE_NAME` e vários routers que não estão coerentes com a árvore raiz observada.
- O `routers-nexus.ts` declara somente dois routers exportados no arquivo analisado, apesar de `routers.ts` importar uma superfície maior.
- O `db-nexus.ts` é muito curto para a superfície chamada por `routers-nexus.ts`, referencia `../drizzle/schema` e termina no meio de uma consulta no trecho observado.
- O `README.md` original descreve um template genérico e não representa fielmente a estrutura múltipla de aplicativos, bundles, legados e artefatos preservados.
- `SECURITY.md` e `CONTRIBUTING.md` existem, porém são insuficientes para governar um repositório com múltiplos runtimes, artefatos históricos e potenciais dados sensíveis.

> Este arquivo é deliberadamente sanitizado. Para fins de segurança, não contém nomes detalhados ou valores dos artefatos classificados como restritos.
