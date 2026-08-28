# Auditoria Cirúrgica — Runtime tRPC + Fibonacci

## Escopo

Foi executada uma carga local e controlada contra o endpoint read-only `system.health` via tRPC. O motor Fibonacci foi invocado antes de cada requisição, no nível inicial 1, com dose 1, budget de uma unidade e autonomia `execute_reversible`. Nenhum efeito externo, mutação de banco, adapter ou operação financeira foi acionado.

## Resultado medido

| Métrica | Resultado |
|---|---:|
| Requisições planejadas | 10.000 |
| Concorrência por lote | 250 |
| Bloqueios Fibonacci | 0 |
| Requisições tentadas | 10.000 |
| Sucessos | 10.000 |
| Falhas | 0 |
| Taxa de sucesso | 100% |
| p50 | 83,23 ms |
| p95 | 195,50 ms |
| Máximo | 382,46 ms |
| Duração total | 7.328,04 ms |
| Throughput observado | 1.364,62 req/s |

## Interpretação

O caminho local de health suportou 10.000 chamadas com taxa de sucesso integral. A elevação em relação ao benchmark anterior de 500 chamadas é compatível com maior concorrência e deve ser tratada como sinal de capacidade local, não como SLO de produção. O teste não prova comportamento de banco distribuído, providers externos, filas, cold starts, rede pública, TLS, autoscaling ou limites de infraestrutura.

## Auditoria do repositório

O repositório foi preservado por merge normal, sem force-push e sem exclusão de commits. A referência bytebytego permanece fora do versionamento do Nexus HUB. O runner dedicado está em `scripts/stress-fibonacci.ts` e o relatório bruto foi salvo durante a execução em `/tmp/nexus-stress-fibonacci.json`.

## Controles mantidos

O Harness continua exigindo autorização, evidência, rollback, idempotência e revisão de segurança para ações guarded. O motor Fibonacci não aplica patches: ele somente propõe mutações autorizadas com baseline digest, candidate digest e gates. A nova carga testa a integração do gate em uma rota read-only.

## Próxima etapa de produção

Antes de qualquer carga externa, devem ser adicionados teste de banco com massa controlada, benchmark de adapters em sandbox autorizada, métricas Prometheus/OpenTelemetry, limites de fila, rate limiting, autoscaling, canary e critérios de rollback. O benchmark de 10.000 chamadas não autoriza liberar efeitos externos automaticamente.
