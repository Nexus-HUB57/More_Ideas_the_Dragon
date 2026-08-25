# NEXUS-HUB — Arquitetura do Control Plane de Startups

## Objetivo

O `nexus_hub_v3_sovereignty` é o subprojeto canônico restaurado para evoluir o ecossistema em torno de um **control plane de startups**. A superfície operacional reúne portfólio, agentes, governança, tesouraria, inteligência de mercado, memória institucional, comunicação, auditoria, execução de missões, processamento de sinais e integração server-side.

A arquitetura separa quatro planos: **intenção**, representada por missões e prioridades; **processamento**, representado por grafos determinísticos e sinais de prontidão; **execução**, representada por jobs e adaptadores; e **confiança**, representada por Harness, autorização, idempotência e auditoria.

## Princípios operacionais

| Princípio | Aplicação |
|---|---|
| Observabilidade antes de autonomia | Toda mudança de estado, execução de job e dispatch de adapter gera evento ou log de auditoria. |
| Preparar antes de executar | Criar e priorizar missão não movimenta dinheiro, publica conteúdo nem chama serviço externo. |
| Autorização explícita | Mutations e execução manual usam `protectedProcedure`; leitura operacional pode ser pública quando não expõe segredo. |
| Harness antes de concluir | Uma missão só chega a `completed` quando passa pelos checks de estado, definição de pronto e ownership. |
| Idempotência por design | Jobs usam buckets temporais persistidos; adapters usam `idempotencyKey` única antes do efeito externo. |
| Segurança server-side | Targets externos exigem HTTPS, allowlist de host e bloqueio de redes privadas; credenciais nunca chegam ao cliente. |
| Execução limitada | Timeout, payload sanitizado, resposta truncada e logs sem segredo reduzem blast radius. |
| Evolução incremental | O control plane pode ganhar novos adapters, agentes e núcleos sem acoplar o domínio a um fornecedor. |

## Planos e módulos

| Plano | Módulo | Responsabilidade | Implementação |
|---|---|---|---|
| Intenção | Portfolio | Cadastro e scorecard de startups | `startups`, `performance_metrics` e telas existentes. |
| Intenção | Mission control | Iniciativas, estágios, risco, prazo, owner e estados | `orchestrator_missions` e `orchestrator_events`. |
| Processamento | Processing Core | Pipeline DAG com ordenação topológica e detecção de ciclos | `server/processing-core.ts`. |
| Processamento | SaaS Readiness Radar | Score composto de receita, tração, reputação e ciclo de vida | `calculateStartupSignal` e `startup_signal_snapshots`. |
| Execução | Background Jobs | Reconciliação de prazos e refresh de sinais | `server/background-jobs.ts`, `jobs-worker.ts` e `orchestrator_job_runs`. |
| Execução | Server Adapters | Webhook JSON com allowlist, HTTPS, timeout e idempotência | `server/adapters.ts` e `orchestrator_adapter_dispatches`. |
| Confiança | Engineering Harness | Quality gate de revisão, DoD, owner, risco e prazo | `server/harness-engine.ts`. |
| Confiança | Compliance | Trilha somente-anexar de decisões e efeitos | `audit_logs`, tela `/audit`. |
| Domínios existentes | Agentes, Conselho, Capital, Inteligência, Memória e Comunicação | Capacidades já restauradas no monorepo | Routers e tabelas existentes preservados. |

## Máquina de estados

```text
BACKLOG ──→ READY ──→ RUNNING ──→ REVIEW ──→ COMPLETED
   │           │          │  │        │
   └→ CANCELLED┘          │  └→ BLOCKED ──→ READY
                          └──────────────→ CANCELLED
REVIEW ──→ RUNNING para reexecução controlada
```

O motor em `server/orchestrator-engine.ts` é puro e não conhece banco, HTTP ou React. A tabela de transição é exportada como contrato de domínio. Estados `completed` e `cancelled` são terminais. A transição para `completed` passa pelo `evaluateMissionHarness`; falhas duras impedem a conclusão e retornam as verificações que precisam ser corrigidas.

## Núcleo de processamento

`executeProcessingGraph` recebe nós com `id`, dependências e função de processamento. Antes de executar, valida IDs duplicados, dependências ausentes e ciclos. Depois produz uma ordem topológica e um `Map` de outputs, permitindo compor pipelines sem estado global.

O pipeline SaaS atual normaliza quatro sinais: receita em escala logarítmica, tração, reputação e estágio de ciclo de vida. O score composto roteia a startup para uma ação de `validate`, `accelerate`, `scale` ou `stabilize`. O resultado é persistido como snapshot para comparação histórica e consumo por UI, jobs e futuros agentes.

## Jobs e cron

Existem duas formas de execução:

| Forma | Uso | Comando/configuração |
|---|---|---|
| Scheduler embutido | Ambiente que mantém o processo HTTP ativo | `NEXUS_ORCHESTRATOR_JOBS_ENABLED=true`; intervalo configurável por `NEXUS_ORCHESTRATOR_JOBS_INTERVAL_MS`. |
| Worker separado | Cron externo, processo dedicado ou pipeline de deployment | `pnpm jobs`, executando um ciclo e encerrando com código de sucesso/erro. |

Cada execução gera uma `runKey` por janela de quinze minutos e tenta obter claim único em `orchestrator_job_runs`. Se outra instância já processou o mesmo bucket, o job é ignorado. O ciclo de reconciliação move missões `running` vencidas para `blocked`; o refresh calcula snapshots de prontidão e registra o sinal agregado no audit log.

## Adapters server-side

O registry atual expõe `json_webhook`. O fluxo de dispatch é:

1. Validar URL com `zod` e política de segurança server-side.
2. Exigir HTTPS, ausência de credenciais na URL, host público e host presente em `NEXUS_WEBHOOK_ALLOWLIST`.
3. Registrar claim com `idempotencyKey` única.
4. Enviar payload JSON com `requestId`, `idempotency-key` e timeout.
5. Truncar a resposta, marcar `accepted` ou `failed` e registrar auditoria sanitizada.

O default é **deny-by-default**: sem allowlist, nenhum webhook é aceito. A camada não suporta arbitragem financeira, transferência de fundos ou publicação social implícita.

## Harness de engenharia

Para concluir uma missão, o Harness avalia:

| Check | Tipo | Regra |
|---|---|---|
| Estado de revisão | Falha dura | Missão deve estar em `review`. |
| Definition of Done | Falha dura | Descrição/critério de conclusão não pode estar vazio. |
| Ownership | Falha dura | Responsável deve estar definido. |
| Budget de risco | Aviso | Risco acima de 70/100 é visível, mas não é ocultado. |
| Sinal de prazo | Aviso | Prazo ausente ou vencido é sinalizado. |

O score do Harness é explicável e cada check retorna evidência legível. O resultado pode ser exposto ao operador pelo procedimento `hub.orchestrator.harness` e reutilizado por agentes futuros.

## Contratos tRPC principais

| Procedimento | Acesso | Efeito |
|---|---|---|
| `hub.orchestrator.overview` | Público | Contagens e distribuição de missões. |
| `hub.orchestrator.listMissions` | Público | Board filtrável. |
| `hub.orchestrator.events` | Público | Timeline operacional. |
| `hub.orchestrator.createMission` | Protegido | Cria em `backlog` e audita. |
| `hub.orchestrator.transition` | Protegido | Valida estado e Harness de conclusão. |
| `hub.orchestrator.harness` | Público | Retorna checks e score de uma missão. |
| `hub.orchestrator.dispatchWebhook` | Protegido | Executa adapter após allowlist e claim idempotente. |
| `hub.orchestrator.adapters` | Público | Lista dispatches recentes sem credenciais. |
| `hub.orchestrator.signals` | Público | Lista snapshots de prontidão. |
| `hub.orchestrator.jobs` | Público | Lista execuções persistidas. |
| `hub.orchestrator.runJob` | Protegido | Executa um job determinístico sob demanda. |

## Critérios de operação

A aplicação deve ser executada com `pnpm install`, validada com `pnpm test`, `pnpm check` e `pnpm build`, e migrada em ambiente com `DATABASE_URL` usando o fluxo padrão do projeto. Em produção, habilite o scheduler apenas quando houver uma instância responsável por ele ou use o worker separado com lock persistente.

O próximo nível de evolução pode adicionar adapters de CRM, analytics e notificações, dependências entre missões, políticas de aprovação por risco, filas externas e agentes especializados. Cada nova capacidade deve manter o mesmo contrato: segredo no servidor, timeout, idempotência, teste determinístico e auditoria.
