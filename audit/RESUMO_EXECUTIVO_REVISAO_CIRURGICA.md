# Resumo Executivo e Revisão Cirúrgica End to End

**Repositório:** `Nexus-HUB57/More_Ideas_the_Dragon`
**Base revisada:** `origin/main` em `5d8e9c39333c90d18fd1cc7d808dd9ad57e2c4a8`
**Branch de integração preservada:** `integration/safe-mmnai-ai-20260822T132042Z` em `bdb4605a54fcf4cccdbc0803dc54dcd5e6798e7c`
**Data:** 22 de agosto de 2026
**Modo de análise:** leitura passiva, sem execução de scripts, testes, migrations, binários ou conteúdo ofuscado.
**Autor:** Manus AI

## 1. Sumário executivo

O repositório está **preservado e historicamente rico**, porém não deve ser tratado, no estado atual, como um produto monolítico pronto para build, deploy ou execução direta. A árvore reúne diferentes gerações de protótipos, bundles acadêmicos, aplicativos Expo, frontends, backends, bibliotecas PHP legadas, documentos, mídias, snapshots e artefatos de testes. Essa amplitude atende ao objetivo de preservação end to end, mas cria uma fronteira operacional crítica entre **arquivo histórico/teste** e **código de produção validado**.

A conclusão principal é de **risco técnico e de segurança elevado para execução não controlada**, com **risco de integridade baixo para a operação de preservação**. A integridade Git da base revisada está coerente, o worktree estava limpo, a branch de integração foi incorporada à `main` e os arquivos importados foram mantidos. Em contrapartida, a revisão estática identificou sinais suficientes para exigir contenção: 59 manifestos de dependências em subprojetos, 984 candidatos a testes por nome, 4.061 arquivos binários/mídia, 105 nomes de arquivos classificados como alto risco, seis caminhos com marcadores heurísticos de conteúdo de segredo, 4.602 caminhos com marcadores de operações potencialmente perigosas e 117 caminhos com marcadores de instruções não confiáveis. Essas contagens são indicadores de triagem, não prova de vulnerabilidade, mas são incompatíveis com a suposição de que todo o repositório seja executável e seguro por padrão [1].

A recomendação executiva é **não executar o repositório como um todo**. O próximo ciclo deve estabelecer uma arquitetura de execução explicitamente selecionada, separar os artefatos de preservação dos componentes ativos, retirar ou rotacionar qualquer credencial real, criar manifests e lockfiles por aplicação, definir pipelines de CI por subprojeto e corrigir os contratos do backend antes de habilitar build ou deploy.

## 2. Resultado por dimensão

| Dimensão | Avaliação | Evidência principal | Consequência |
|---|---|---|---|
| Preservação e histórico | **Adequada** | `origin/main` contém a integração e o worktree revisado estava limpo | Boa base para revisão por PR e recuperação |
| Completude do pacote MMN | **Confirmada anteriormente** | ZIP e extração preservados no namespace dedicado, com hashes registrados no relatório de Safe Recovery | O pacote pode ser auditado sem depender de memória operacional |
| Organização do monorepo | **Frágil** | 18.482 arquivos, múltiplos bundles, runtimes e gerações de aplicação | Alto risco de executar o entrypoint errado |
| Build da raiz | **Não comprovado** | `package.json` raiz é Expo, sem scripts `test` e `build`; `tsconfig.json` inclui apenas `src/**/*` | Não há evidência de uma pipeline única funcional |
| Backend raiz | **Inconsistente** | `_core`, `server` e `drizzle` não estão presentes na raiz; `routers.ts` referencia esses caminhos | A superfície tRPC raiz aparenta não compilar como está |
| Router NEXUS | **Incompleto** | `routers.ts` importa oito routers; `routers-nexus.ts` exporta apenas dois no arquivo analisado | Contrato de import/export divergente |
| Camada de dados NEXUS | **Incompleta** | `db-nexus.ts` possui somente duas funções exportadas e aponta para `../drizzle/schema` | Helpers chamados pelos routers não estão demonstrados |
| Segurança | **Crítica para execução** | Arquivos e marcadores relacionados a credenciais, chaves, carteiras, tokens e código ofuscado | Exige isolamento, rotação e revisão especializada |
| Documentação | **Insuficiente antes desta revisão** | README era majoritariamente um template genérico; `SECURITY.md` e `CONTRIBUTING.md` eram mínimos | Onboarding e governança ficavam ambíguos |
| Testes | **Não comprovados** | Há 984 candidatos a testes por nome, mas a raiz não declara script de teste | Quantidade de testes não equivale a cobertura executável |

## 3. Integridade, branches e escopo

A revisão foi realizada sobre o `origin/main` atual em `5d8e9c39333c90d18fd1cc7d808dd9ad57e2c4a8`. A branch de integração `integration/safe-mmnai-ai-20260822T132042Z` aponta para `bdb4605a54fcf4cccdbc0803dc54dcd5e6798e7c` e foi incorporada à `main` no merge commit `0d6f99f`. O `origin/main` contém onze commits posteriores àquele SHA da branch, culminando no commit revisado. Não houve reescrita de histórico durante a revisão.

A contagem estrutural do worktree revisado foi de 18.482 arquivos regulares, um link simbólico, 58 arquivos com bit executável e nenhum arquivo acima de 90 MB. A análise anterior do pacote MMN registrou 3.139 arquivos extraídos e o ZIP original preservado. Esses números demonstram cobertura de preservação, mas não demonstram prontidão operacional.

## 4. Achados técnicos prioritários

### 4.1. O repositório não possui um único produto executável inequívoco

A raiz contém um `package.json` de aplicativo Expo com React Native, tRPC 10 e Drizzle, enquanto `nexus_mmn_fullstack_phd/package.json` define um monorepo distinto com frontend React/Vite, backend tRPC/Drizzle/MySQL, mobile Expo, scripts de build, lint, teste e verificação. Também existem outros manifests distribuídos em bundles e snapshots. A coexistência de múltiplos manifests não é um defeito por si só, mas exige documentação de ownership e comandos por subprojeto. Sem essa fronteira, um operador pode instalar ou executar uma aplicação que não corresponde ao objetivo da tarefa [2].

### 4.2. O contrato de compilação da raiz está desalinhado com a árvore

O `tsconfig.json` raiz define `rootDir` como `./src` e `include` como `src/**/*`, mas a árvore raiz contém arquivos TypeScript relevantes fora de `src`. O `routers.ts` referencia `_core`, `COOKIE_NAME` e uma superfície de routers que não é comprovadamente resolvível na raiz. O `routers-nexus.ts` usa `z.object(...)` sem um import visível de `zod` no cabeçalho analisado e declara apenas `agentsRouter` e `missionsRouter`, embora o consumidor importe mais exports. Esses fatos são sinais objetivos de deriva de integração, não uma inferência baseada apenas em estilo.

### 4.3. A camada de dados do backend está incompleta ou é apenas um artefato parcial

O `db-nexus.ts` importa tabelas e tipos de `../drizzle/schema`, caminho que não existe relativo à raiz revisada, e o arquivo analisado contém somente duas funções exportadas, terminando no meio da implementação de uma consulta. Os routers chamam uma quantidade muito maior de helpers. Portanto, o backend raiz deve ser classificado como **não validado e potencialmente não compilável**, até que os contratos, imports, schema e helpers sejam reconstruídos em uma aplicação selecionada.

### 4.4. A superfície de segurança requer contenção imediata

A triagem encontrou nomes de arquivos relacionados a credenciais, chaves privadas, tokens, carteiras, backups e dados de configuração, além de arquivos de teste e scripts com marcadores heurísticos de código perigoso. Um artefato PHP também apresentou conteúdo ofuscado durante a varredura passiva. Nenhum valor foi reproduzido, nenhum segredo foi utilizado e nenhum arquivo foi executado. A classificação adequada é **potencial exposição de material sensível e código não confiável**, não confirmação de exploração.

Como os arquivos foram confirmados pelo usuário como scripts e artefatos de teste, eles permanecem preservados para finalidade histórica. Ainda assim, o repositório deve usar uma política explícita: testes e legado não são automaticamente confiáveis, não devem ser incluídos em imagens de produção e não devem receber acesso a credenciais reais.

### 4.5. A documentação operacional anterior não refletia o estado real

O README anterior iniciava com fluxos de autenticação e exemplos genéricos de template, citando caminhos como `server/routers.ts`, `server/db.ts` e `drizzle/schema.ts` que não descreviam de forma confiável a organização efetiva da raiz. `SECURITY.md` continha somente uma diretriz curta, e `CONTRIBUTING.md` não estabelecia fluxo de branch, revisão, testes ou regras para artefatos sensíveis. Este relatório e o README atualizado passam a estabelecer a distinção entre preservação, auditoria e execução.

## 5. Riscos e controles recomendados

| Prioridade | Risco | Controle recomendado | Critério de aceite |
|---|---|---|---|
| P0 | Possível material sensível versionado | Fazer inventário com ferramenta de secret scanning em cópia controlada; rotacionar credenciais reais; bloquear novos padrões via CI | Zero segredo real ativo no histórico operacional e exceções documentadas |
| P0 | Execução acidental de código ofuscado ou legado | Isolar artefatos, remover execução automática, usar sandbox sem rede e sem secrets | Nenhum job de CI executa diretórios de preservação por padrão |
| P1 | Backend raiz inconsistente | Escolher um único app canônico, corrigir imports, schema, routers e entrypoints | `typecheck`, build e testes do app canônico passam em CI |
| P1 | Dependências fragmentadas | Catalogar os 59 manifests, declarar ownership e fixar lockfile por subprojeto | Cada aplicação possui comando de instalação e build reproduzível |
| P1 | Testes sem comando canônico | Mapear os 984 candidatos, separar testes executáveis de fixtures/documentos | Pipeline reporta testes selecionados, cobertura e falhas sem depender de estado externo |
| P2 | README e guias divergentes | Manter mapa de diretórios, matriz de comandos e política de alteração | Novo contribuidor consegue escolher o app correto sem executar tentativa e erro |
| P2 | Falta de governança de artefatos | Adicionar CODEOWNERS, classificação de diretórios e regra de PR | Mudanças em segurança, legado e deploy exigem revisão especializada |

## 6. Plano de remediação em três ondas

**Onda 1 — Contenção.** Manter os diretórios de preservação fora de qualquer build ou deploy automático. Criar uma cópia de análise sem credenciais e fazer rotação de qualquer segredo que tenha sido real. Adicionar uma regra de CI que falhe em novos arquivos sensíveis, sem alterar os artefatos históricos antes da decisão formal dos proprietários.

**Onda 2 — Normalização.** Selecionar o aplicativo canônico, de preferência o monorepo explicitamente descrito em `nexus_mmn_fullstack_phd/`, e documentar os demais como snapshots, bundles ou componentes legados. Corrigir a árvore de backend, alinhar schema, imports, routers e helpers, e gerar lockfiles reproduzíveis. Nenhuma migration deve ser aplicada antes de uma revisão do schema e de uma cópia de dados autorizada.

**Onda 3 — Evidência operacional.** Criar CI por subprojeto com `install`, `typecheck`, `lint`, `test` e `build`; publicar artefatos de relatório; adicionar smoke tests isolados; e atualizar o README a cada mudança estrutural. Somente após a passagem dessas verificações deve existir qualquer decisão de deploy.

## 7. Limites desta revisão

Esta foi uma revisão **estática e passiva**. Não foram executados scripts, testes, migrations, instalações de dependências, builds, comandos de deploy, chamadas de APIs, binários ou arquivos ofuscados. Não houve tentativa de autenticação, uso de carteira, utilização de chaves, leitura de valores de credenciais ou validação de serviços externos.

As contagens de marcadores são heurísticas e podem incluir falsos positivos em documentação, exemplos, fixtures e testes. Da mesma forma, a conclusão de que determinados módulos são incompletos é baseada na estrutura e nos contratos visíveis no commit revisado; a validação definitiva requer uma aplicação canônica selecionada e um pipeline controlado.

## 8. Referências internas

[1]: ./REVIEW_METRICS_REDACTED.md "Evidências sanitizadas da revisão cirúrgica"
[2]: ../nexus_mmn_fullstack_phd/package.json "Manifesto do monorepo fullstack"
[3]: ../package.json "Manifesto da raiz"
[4]: ../tsconfig.json "Configuração TypeScript da raiz"
[5]: ../routers.ts "Router agregador da raiz"
[6]: ../routers-nexus.ts "Routers NEXUS da raiz"
[7]: ../db-nexus.ts "Camada de dados NEXUS da raiz"
[8]: ../SECURITY.md "Política de segurança existente"
[9]: ../CONTRIBUTING.md "Guia de contribuição existente"
[10]: ../DEPLOYMENT.md "Guia de implantação existente"

> **Conclusão:** o repositório está adequado como acervo versionado e base de recuperação, mas ainda não como unidade executável única. A prioridade é reduzir a superfície de execução, proteger material sensível e escolher um caminho canônico de produto antes de qualquer automação operacional.
