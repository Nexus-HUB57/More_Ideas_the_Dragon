# Arquitetura de Runtime Perpétuo

## 1. Objetivo

O Nexus HUB operará como inteligência fulltime por meio de ciclos finitos e repetíveis, executados continuamente por scheduler e workers. O sistema não precisa manter um processo infinito em uma única thread: ele preserva estado em banco, retoma trabalho por leases e transforma cada ciclo em evento auditável. Isso permite reinício, escala horizontal e recuperação sem perder a continuidade.

## 2. Camadas

| Camada | Responsabilidade | Estado persistente |
|---|---|---|
| **API / tRPC** | Receber intenções, consultar o Moltbook e expor observabilidade | Usuário, agente, request e autorização |
| **Scheduler** | Disparar jobs por intervalo, CronJob ou fila | Bucket de execução e idempotência |
| **Dispatcher** | Reservar trabalho e encaminhar para worker compatível | Lease, tentativa e prioridade |
| **Worker Obscura** | Executar `discover → plan → execute → verify → recover → learn` | Processo, eventos e artefatos |
| **Memória** | Persistir ideias, versões, evidências e decisões | Grafo e memória procedural |
| **Harness** | Aplicar gates, limites, allowlist e rollback | Decisão de gate e trilha de auditoria |
| **Observabilidade** | Medir saúde, custo, latência, falha e valor | Métricas e alertas |

## 3. Loop lógico

```text
sinal → claim idempotente → contexto → hipótese → plano
  → dose Fibonacci → Obscura → Harness → execução
  → verificação → evidência → memória → próxima prioridade
```

Cada passagem do loop deve ter um começo e um fim observáveis. O “perpétuo” está na continuidade entre ciclos, não em uma operação sem limite temporal. Um worker pode morrer; o processo retomável, seu checkpoint e seus eventos permanecem.

## 4. Escalabilidade

A escala horizontal ocorre por particionamento de trabalho: por startup, saga, tipo de sinal, prioridade ou shard lógico. O ledger de execução evita que dois workers produzam o mesmo efeito. O scheduler deve manter o intervalo mínimo, enquanto os workers podem aumentar ou diminuir conforme a fila e o budget disponível.

Jobs leves de reconciliação continuam no scheduler atual. Processos de inferência, RAG e análise pesada devem ser encaminhados a workers separados para não bloquear a API. O uso de providers externos deve respeitar timeout, retry limitado, backoff e circuit breaker.

## 5. Memória e valor

A memória de curto prazo pertence ao processo em execução. A memória procedural registra como uma ação foi realizada. A memória semântica vive no grafo Moltbook: ideias, relações, ambiguidade, versões e evidências. Uma memória só pode ser promovida a regra reutilizável quando possui proveniência, contexto, resultado e critério de validade.

O loop deve medir valor por sinais como hipóteses eliminadas, decisões melhor informadas, custo por evidência, redução de ambiguidade, missões concluídas, recuperação sem intervenção e capacidades promovidas. “Mais atividade” não é sinônimo de “mais valor”.

## 6. Continuidade com limites

O ciclo contínuo deve incluir backoff, circuit breaker, budget por ciclo, budget diário, timeout, limite de concorrência e sinal de pausa. Quando o provider falhar, o sistema deve recuar; quando a ambiguidade subir, deve investigar; quando o Harness falhar, deve bloquear; quando o custo superar o valor, deve pausar e registrar a decisão.

A operação 24/7 é, portanto, uma propriedade de disponibilidade e recuperação. Não significa que cada agente esteja sempre executando, nem que o sistema possa ignorar sinais de fadiga operacional, custo, segurança ou degradação.

## 7. Deployment

Em Kubernetes, o scheduler pode ser representado por CronJobs idempotentes, enquanto workers são Deployments com HPA orientado por fila. Em Docker Swarm, o mesmo desenho usa serviços separados, replicas configuráveis, restart policy e health checks. A aplicação deve manter a mesma semântica em ambos os ambientes: claim atômico, evento, checkpoint, retry controlado e auditoria.

## 8. SLOs iniciais

| SLO | Intenção |
|---|---|
| Continuidade | Nenhum processo aceito é perdido após reinício do worker |
| Idempotência | Uma chave de execução não produz efeitos duplicados |
| Recuperação | Falhas conhecidas entram em backoff e runbook |
| Observabilidade | Todo ciclo produz eventos de início, resultado e custo |
| Governança | Nenhum efeito de alto risco bypassa o Harness |
| Qualificação | Promoções dependem de CapabilityProof aceita |
