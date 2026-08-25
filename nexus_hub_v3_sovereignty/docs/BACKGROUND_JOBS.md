# Background jobs do Nexus HUB

## Jobs disponíveis

| Job | Função | Efeito | Retorno |
|---|---|---|---|
| `reconcile_missions` | Detecta missões `running` vencidas | Move para `blocked`, cria evento e audit log | Quantidade de missões reconciliadas |
| `refresh_portfolio_signals` | Calcula prontidão SaaS | Persiste um snapshot por startup e registra sinal agregado | Quantidade de snapshots criados |

Os jobs são determinísticos e não dependem de julgamento de IA. O refresh usa o Processing Core para executar um pipeline com os nós `normalize`, `readiness` e `routing`.

## Idempotência

Cada job calcula uma `runKey` composta pelo nome e por um bucket UTC de quinze minutos. A primeira instância cria uma linha em `orchestrator_job_runs`; instâncias concorrentes executam um upsert no-op e recebem `skipped=true`. A execução é finalizada como `completed` ou `failed`, com quantidade de registros e erro sanitizado.

Isso protege o ecossistema contra duplicação quando há múltiplas instâncias HTTP ou quando um cron é reexecutado. A política não substitui transações de banco para efeitos financeiros; esse domínio continua fora do job.

## Execução embutida

O servidor HTTP pode iniciar um scheduler opt-in:

```bash
NEXUS_ORCHESTRATOR_JOBS_ENABLED=true \
NEXUS_ORCHESTRATOR_JOBS_INTERVAL_MS=300000 \
pnpm dev
```

O intervalo é limitado a pelo menos sessenta segundos. O scheduler executa os dois jobs em sequência, impede sobreposição local e não mantém o processo vivo por causa do timer quando o runtime está encerrando.

Em autoscale, prefira apenas uma instância responsável pelo scheduler ou use a alternativa de worker separado. O ledger persistente continua sendo a segunda linha de defesa.

## Worker separado

Após `pnpm build`, o comando `pnpm jobs` usa o bundle de produção, executa um ciclo, aguarda ambos os jobs e encerra com código `0` em sucesso ou `1` em falha. Para rodar diretamente do TypeScript durante o desenvolvimento, use `pnpm jobs:dev`.

```bash
pnpm build
NEXUS_WEBHOOK_ALLOWLIST=hooks.example.com \
pnpm jobs
```

Exemplo de cron externo a cada cinco minutos:

```cron
*/5 * * * * cd /srv/nexus_hub_v3_sovereignty && /usr/bin/pnpm jobs >> /var/log/nexus-hub-jobs.log 2>&1
```

O worker não necessita de navegador aberto. Ele requer `DATABASE_URL` e as demais variáveis server-side normais do projeto. Nenhum segredo deve ser colocado no repositório ou enviado para o frontend.

## Observabilidade

As execuções ficam disponíveis em `hub.orchestrator.jobs` e aparecem no painel `/orchestrator`. A tela mostra a contagem do ledger e permite disparo manual protegido para operação assistida. Cada job também escreve em `audit_logs` quando reconcilia uma missão ou atualiza sinais.

## Checklist de produção

Antes de habilitar automação, aplique as migrations `0002` e `0003`, confirme que a política de acesso ao banco está ativa e decida entre scheduler embutido ou worker único. Para adapters, configure `NEXUS_WEBHOOK_ALLOWLIST` com hosts exatos e HTTPS. O valor vazio significa deny-by-default.
