# Agente Orquestrador — Blueprint + Handwritten Protocol

## Intenção

O Agente Orquestrador é o núcleo de coordenação do Nexus HUB. Ele converte sinais e ideias em missões delimitadas, seleciona agentes executivos por competência, executa somente dentro do nível de autonomia permitido e transforma resultados em evidência auditável.

## Blueprint operacional

```text
SIGNAL
  ↓ normalize + provenance
HYPOTHESIS
  ↓ objective + constraints + success evidence
MISSION
  ↓ owner + risk + budget + idempotency
ROUTE
  ↓ C-level agent + skills + alternative path
HARNESS PREFLIGHT
  ↓ authorization + rollback + security + audit
EXECUTION
  ↓ bounded tools / adapters / workers
VERIFICATION
  ↓ evidence + invariants + SLO + cost
DECISION
  ├─ completed → memory + capability proof
  ├─ blocked   → recovery route
  ├─ review    → guarded harness
  └─ failed    → rollback / quarantine
```

## Handwritten protocol

Cada ciclo deve ser escrito como uma intenção explícita, não como uma cadeia implícita de chamadas. A intenção registra `objective`, `preconditions`, `steps`, `successEvidence`, `recoveryPlan`, `autonomy`, `risk`, `budgetUnits`, `owner` e `idempotencyKey` quando houver efeito externo.

O orquestrador deve preferir a menor ação reversível que produza evidência útil. A autonomia é escalada por prova de capacidade; uma ação de maior risco nunca herda autorização de uma ação anterior de menor risco.

## Seleção de agentes

A seleção combina estágio da missão, papel executivo, skill necessária, risco da tarefa, autonomia da skill e carga corrente do agente. Empates são resolvidos por menor risco e maior evidência histórica. O sistema deve manter uma rota alternativa para missões críticas.

## Padrão de auditoria

Toda decisão emite um envelope imutável com `eventId`, `correlationId`, `missionId`, `actor`, `action`, `risk`, `before`, `after`, `evidenceRefs`, `harnessScore`, `toolRefs`, `outcome` e timestamp. Dados sensíveis não entram em logs; referências substituem payloads secretos.

## Regras Harness

Nenhuma missão pode concluir sem estado `review`, definição de resultado, responsável e risco dentro do orçamento. Ações `execute_guarded` exigem identidade de skill e agente, evidência, aprovação, rollback, auditoria; efeitos externos também exigem idempotência e revisão de segurança.

## Referência externa

O repositório bytebytego foi clonado como referência documental de padrões públicos de system design. Nenhum código externo foi executado, copiado ou misturado ao Nexus HUB. A inspiração permitida limita-se a conceitos gerais de escalabilidade, latência, rate limiting, filas, replicação e resiliência.
