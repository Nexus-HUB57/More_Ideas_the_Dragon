

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
