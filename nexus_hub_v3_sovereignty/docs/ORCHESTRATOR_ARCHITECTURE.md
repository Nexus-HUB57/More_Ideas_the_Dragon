# NEXUS-HUB — Arquitetura do Orquestrador de Startups

## Objetivo

O `nexus_hub_v3_sovereignty` é o subprojeto canônico restaurado para evolução do ecossistema. O produto organiza startups, agentes, governança, tesouraria, inteligência de mercado, memória institucional, publicação social e auditoria em uma única superfície operacional.

A primeira entrega end-to-end adiciona um **Orquestrador de Missões**. Uma missão representa uma unidade de execução controlada: uma iniciativa de descoberta, construção, validação, lançamento ou escala associada a uma startup. O orquestrador registra intenção, prioridade, owner, estado, risco, prazo e eventos de ciclo de vida.

## Princípios operacionais

| Princípio | Aplicação |
|---|---|
| Observabilidade antes de autonomia | Toda mudança de estado gera evento e log de auditoria. |
| Preparar antes de executar | Criar e priorizar uma missão não movimenta dinheiro, publica conteúdo nem chama serviços externos. |
| Autorização explícita | Operações de escrita usam `protectedProcedure`; credenciais e execução externa ficam fora do cliente. |
| Estados monotônicos | O motor aceita apenas transições válidas e impede regressões silenciosas. |
| Segurança por padrão | O estado inicial é `backlog`; a execução exige ação humana explícita. |
| Evolução incremental | O primeiro slice usa a infraestrutura atual e deixa adaptadores externos para uma etapa posterior. |

## Domínios

| Domínio | Responsabilidade | Situação na base restaurada |
|---|---|---|
| Portfolio | Cadastro e scorecard de startups | Existente em `startups` e `performance_metrics`. |
| Orquestração | Missões, prioridades, estados e eventos | Adicionado nesta entrega. |
| Agentes | Papéis especializados por startup | Existente em `ai_agents`. |
| Governança | Conselho, propostas e votos ponderados | Existente em `council_members`, `proposals` e `council_votes`. |
| Capital | Cofre, transações e distribuição | Existente em `master_vault` e `transactions`. |
| Inteligência | Market Oracle e oportunidades | Existente em `market_data`, `market_insights` e `arbitrage_opportunities`. |
| Memória | Decisões, precedentes, lições e insights | Existente em `soul_vault`. |
| Comunicação | Feed operacional | Existente em `moltbook_posts`. |
| Compliance | Trilha de auditoria | Existente em `audit_logs`. |

## Fluxo de uma missão

```text
BACKLOG → READY → RUNNING → BLOCKED → READY
                         └→ REVIEW → COMPLETED
                         └→ CANCELLED
```

`BLOCKED` e `REVIEW` são estados de controle. Uma missão em `REVIEW` requer revisão humana antes de ser marcada como `COMPLETED`. A versão inicial não dispara integrações financeiras, publicação social ou agentes autônomos; ela prepara o trabalho, cria o rastro operacional e expõe o próximo passo para o operador.

## Modelo de dados novo

| Entidade | Campos-chave | Finalidade |
|---|---|---|
| `orchestrator_missions` | startup, title, description, stage, priority, status, owner, due date, risk score | Fonte de verdade da execução. |
| `orchestrator_events` | mission, event type, from/to status, actor, payload | Timeline imutável de mudanças e sinais. |

As tabelas não substituem os domínios existentes. Uma missão referencia uma startup, enquanto decisões de investimento e operações financeiras permanecem nos fluxos de governança e tesouraria.

## Contratos de API

| Procedimento | Acesso | Efeito |
|---|---|---|
| `hub.orchestrator.overview` | Público | Retorna contagens e distribuição por status. |
| `hub.orchestrator.listMissions` | Público | Lista missões com filtros opcionais. |
| `hub.orchestrator.events` | Público | Exibe eventos recentes do ciclo operacional. |
| `hub.orchestrator.createMission` | Protegido | Cria missão em `backlog` e registra evento. |
| `hub.orchestrator.transition` | Protegido | Valida e aplica uma transição explícita. |

## Critérios de aceite

1. O subprojeto instala e compila de forma independente.
2. O menu expõe a área de Orquestração em desktop e mobile.
3. O operador consegue criar missão, visualizar o board e avançar estados válidos.
4. Transições inválidas retornam erro sem alterar dados.
5. A timeline exibe eventos de criação e de transição.
6. Testes cobrem a máquina de estados e os procedimentos do router com mocks.
7. Nenhuma integração externa é chamada durante a criação ou transição da missão.

## Próximas extensões

A fundação permite adicionar scorecards de OKRs, dependências entre missões, adaptadores de CRM/analytics, jobs agendados para sinais de saúde e um executor de agentes com políticas de aprovação. Cada integração deve ser conectada por adaptador server-side, com segredo mínimo, idempotência, timeout e log sanitizado.
