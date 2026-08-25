# Testes unitários da máquina de estados

## Escopo

A máquina de estados está implementada em `server/orchestrator-engine.ts` como uma função pura. Ela recebe um estado de origem e um destino, consulta a matriz de transições e não acessa banco, rede, relógio ou contexto de usuário. Essa separação permite validar o comportamento do control plane sem mocks de infraestrutura.

A suíte executável está em `server/orchestrator-engine.test.ts`. Na última execução, ela apresentou **16 casos** dentro do arquivo, como parte de uma suíte global com **42 testes aprovados**.

## Matriz coberta

| Estado de origem | Destinos permitidos | Estados terminais |
|---|---|---|
| `backlog` | `ready`, `cancelled` | Não |
| `ready` | `running`, `cancelled`, `backlog` | Não |
| `running` | `blocked`, `review`, `cancelled` | Não |
| `blocked` | `ready`, `cancelled` | Não |
| `review` | `completed`, `running`, `cancelled` | Não |
| `completed` | Nenhum | Sim |
| `cancelled` | Nenhum | Sim |

A matriz é uma política deliberada. O caminho feliz é linear até revisão; bloqueios retornam para `ready`, permitindo replanejamento antes de nova execução; `review` pode retornar a `running` para correções; e estados terminais não podem ser reabertos silenciosamente.

## Casos unitários

| Grupo | Teste | O que protege |
|---|---|---|
| Contrato | A matriz exportada corresponde à matriz esperada | Evita drift entre documentação, UI e backend. |
| Contrato | `getAllowedTransitions` retorna cópia dos destinos | Evita que consumidores mutem o contrato interno. |
| Arestas válidas | Cada aresta declarada retorna `true` em `canTransition` | Garante cobertura de todas as transições suportadas. |
| Arestas válidas | Cada aresta declarada retorna o destino em `assertTransition` | Garante que a validação também seja utilizável como guard. |
| Arestas inválidas | Cada par ausente retorna `false` | Evita saltos como `backlog → completed` ou `review → backlog`. |
| Arestas inválidas | Cada par ausente lança mensagem com origem e destino | Garante erro observável para API e operador. |
| Terminais | `completed` e `cancelled` não possuem destinos | Impede reabertura de trabalho concluído ou cancelado. |
| Recuperação | `running → blocked → ready` é aceito | Mantém caminho explícito para recuperação operacional. |

O teste de arestas inválidas é exaustivo: percorre o produto cartesiano de todos os estados com todos os estados e compara o resultado efetivo com a matriz esperada. Assim, ele cobre inclusive auto-transições, que não são permitidas.

## Cálculo de risco

O mesmo arquivo contém testes do score de risco, com relógio injetado por `now` para eliminar flakiness. A pontuação é limitada a `100` e combina prioridade, estágio e proximidade do prazo.

| Cenário | Expectativa |
|---|---|
| Todas as combinações de prioridade e estágio | Resultado reprodutível e entre 0 e 100. |
| Prazo em 30 dias | Acréscimo de 5 pontos. |
| Prazo em 7 dias | Acréscimo de 15 pontos. |
| Prazo vencido | Acréscimo de 15 pontos. |
| Prioridade crítica + lançamento + prazo vencido | Resultado permanece limitado a 100. |

A injeção de `now` é importante para CI: testes não dependem do instante real da máquina e podem reproduzir exatamente os mesmos resultados em qualquer execução.

## Semântica de auditoria

Também são testados os mapeamentos de estado para eventos de auditoria. `running` gera `mission_started`, `blocked` gera `mission_blocked`, `review` gera `mission_submitted_for_review`, `completed` gera `mission_completed`, `cancelled` gera `mission_cancelled` e os demais estados usam `mission_status_changed`.

Essa camada não testa banco ou tRPC por construção. Os contratos de integração são testados separadamente em `server/routers-hub.test.ts`, enquanto jobs, Harness, adapters e processamento possuem suas próprias suítes. O resultado é uma pirâmide de testes em que a política pura é rápida e exaustiva, e os fluxos de borda usam mocks controlados.

## Comando de execução

```bash
pnpm test -- server/orchestrator-engine.test.ts
pnpm check
```

O primeiro comando executa especificamente a suíte da máquina; `pnpm check` confirma que tipos e contratos consumidos pelo frontend e backend continuam consistentes.
