

## Orquestrador de Startups — slice end-to-end

O subprojeto agora contém o control plane operacional em [`/orchestrator`](./client/src/pages/Orchestrator.tsx). Ele conecta startups a missões com estágio, prioridade, prazo, risco, responsável, estados controlados e timeline de eventos. Toda criação e transição protegida gera registro no domínio de auditoria.

Para executar localmente:

```bash
pnpm install
pnpm dev
```

Para validar a entrega:

```bash
pnpm test
pnpm build
```

A migration [`drizzle/0002_brown_aaron_stack.sql`](./drizzle/0002_brown_aaron_stack.sql) cria `orchestrator_missions` e `orchestrator_events`. Em um ambiente com `DATABASE_URL`, aplique-a pelo fluxo padrão do projeto (`pnpm db:push`). A especificação de domínio está em [`docs/ORCHESTRATOR_ARCHITECTURE.md`](./docs/ORCHESTRATOR_ARCHITECTURE.md).

O executor inicial é deliberadamente **controlado e determinístico**: criar ou avançar uma missão não chama serviços externos, não movimenta fundos e não publica conteúdo. Isso deixa a fundação pronta para conectar agentes, sinais de mercado, OKRs e jobs de background com aprovação explícita, idempotência e logs sanitizados.


## Expansão do HUB de última onda

A segunda camada do control plane adiciona o Processing Core em `server/processing-core.ts`, o Engineering Harness em `server/harness-engine.ts`, adapters server-side em `server/adapters.ts`, jobs em `server/background-jobs.ts` e o worker de ciclo único em `server/jobs-worker.ts`.

A execução automática é opt-in. Para usar o scheduler no processo HTTP, defina `NEXUS_ORCHESTRATOR_JOBS_ENABLED=true`. Para enviar webhooks, defina `NEXUS_WEBHOOK_ALLOWLIST` com os hosts HTTPS exatos, separados por vírgula; sem allowlist, o sistema bloqueia todos os destinos. O comando `pnpm jobs` usa o bundle gerado por `pnpm build`; `pnpm jobs:dev` executa diretamente o TypeScript.

A documentação detalhada está em [`docs/ORCHESTRATOR_ARCHITECTURE.md`](./docs/ORCHESTRATOR_ARCHITECTURE.md), [`docs/STATE_MACHINE_TESTS.md`](./docs/STATE_MACHINE_TESTS.md) e [`docs/BACKGROUND_JOBS.md`](./docs/BACKGROUND_JOBS.md).

## Camada executiva C-level

O control plane inclui cinco núcleos executivos de primeira linha — CEO, CTO, COO, CFO e CRO — e uma função CPO subordinada ao CTO. O catálogo está em `server/executive-agents.ts`, a persistência em `drizzle/0004_executive_agents.sql` e a API em `hub.executives.*`. Consulte `docs/EXECUTIVE_AGENTS.md` para responsabilidades, autonomia, delegação, limites de orçamento e scorecards.

Para inicializar os perfis após aplicar as migrations, execute a mutation protegida `hub.executives.initialize` com um operador autenticado. O endpoint é idempotente e não concede autorização para movimentação financeira, contratos, exclusões ou deployments destrutivos.

## Produção e cron jobs

A imagem é construída com `Dockerfile` multi-stage e executa como usuário não-root. O manifesto Kubernetes está em `deploy/kubernetes/nexus-hub.yaml`, com Deployment, Service, probes, ConfigMap e CronJobs nativos para reconciliação e refresh de sinais. O stack Docker Swarm está em `deploy/swarm/docker-stack.yml` e usa `crazymax/swarm-cronjob:1.16.0` com secrets externos e labels documentados pelo projeto.

Substitua a imagem placeholder por uma referência imutável de registry, crie o Secret `nexus-hub-secrets` fora do Git e aplique a migration antes de habilitar adapters externos. Em Kubernetes, prefira `concurrencyPolicy: Forbid`, `timeZone: Etc/UTC` e `startingDeadlineSeconds`; em Swarm, mantenha o scheduler restrito a managers e preserve o ledger de idempotência do worker. O deploy real exige cluster, registry, DNS, secret manager e credenciais do operador.
