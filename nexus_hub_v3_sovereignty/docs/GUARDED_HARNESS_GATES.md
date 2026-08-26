# Engineering Harness e gates para skills `execute_guarded`

## Objetivo

O modo `execute_guarded` é usado quando uma skill pode produzir efeito externo, alterar estado sensível, acessar infraestrutura, publicar conteúdo, manipular dados privados ou influenciar recursos financeiros. Nesse modo, a recomendação do agente não equivale à autorização de execução. O Harness converte a intenção em uma decisão verificável baseada em identidade, evidência, aprovação, reversibilidade, segurança, idempotência e auditoria.

## Fluxo de controle

```text
Skill selecionada
      |
      v
Identidade do agente + risco + mandato
      |
      v
Missão em review + DoD + owner + risco aceitável
      |
      v
Evidência + aprovação + rollback + auditoria
      |
      +---- efeito externo? ---- sim ---> idempotency key + security review + allowlist adapter
      |                                  |
      |                                  v
      |                            dispatch controlado
      |
      v
Harness aprovado -> transição para completed
Harness reprovado -> bloqueio + audit log
```

## Gates obrigatórios

| Gate | Obrigatoriedade | Falha impede conclusão? | Evidência esperada |
|---|---|---:|---|
| Identidade | Skill `execute_guarded`, risco e agente executivo | Sim | `skillKey`, `skillRisk`, `executiveRole`. |
| Estado | Missão em `review` | Sim | Transição válida no control plane. |
| Definition of Done | Resultado esperado documentado | Sim | Descrição e critério verificável. |
| Ownership | Responsável definido | Sim | Owner executivo ou operacional. |
| Evidência | Resultado observável anexado | Sim | `evidenceRef` para artefato, log, teste ou relatório. |
| Aprovação | Autorização explícita anterior ao efeito | Sim | `approvalRef` para decisão, policy ou aprovação do superior. |
| Rollback | Reversão ou contenção definida | Sim | `rollbackPlan` executável. |
| Idempotência | Necessária se houver efeito externo | Sim | `idempotencyKey` estável por intenção. |
| Segurança | Necessária se houver efeito externo | Sim | `securityReviewRef`, allowlist e adapter validado. |
| Auditoria | Sempre | Sim | `auditRef` e registro em `audit_logs`. |
| Prazo/risco | Controle operacional | Risco gera warning; prazo vencido gera warning | Score e data registrados. |

## Enforcement no código

`evaluateGuardedHarness` começa pelo Harness base e adiciona os gates guarded apenas quando `skillAutonomy === "execute_guarded"`. O resultado contém `passed`, `score` e a lista completa de checks com status e evidência legível. Qualquer check `failed` torna `passed` falso.

A transição `hub.orchestrator.transition` executa o Harness antes de aceitar `review → completed`. Quando a missão possui `skillKey`, a política da skill é resolvida no catálogo persistido. Se a missão foi marcada com efeito externo mas não tem chave de idempotência ou revisão de segurança, a conclusão é bloqueada. Uma reprovação grava `orchestrator.harness.rejected` no audit log.

## Separação de responsabilidades

O agente executivo propõe a ação e produz o artefato. O C-level superior ou a política correspondente registra a aprovação. O Harness avalia pré-condições e não pode ser desativado pelo próprio agente que solicita a execução. O adapter valida HTTPS, allowlist, SSRF, timeout e idempotência antes da rede. O ledger de dispatch impede duplicação. O audit log registra aprovação, resultado, falha e referência de evidência.

Esse desenho permite autonomia operacional crescente sem transformar o sistema em uma autoridade irreversível. Uma skill pode automatizar execução reversível; efeitos financeiros, jurídicos, destrutivos, de privacidade ou de publicação permanecem condicionados a gates adicionais e autorização explícita.

## Matriz de decisão

| Situação | Resultado |
|---|---|
| Skill recomendatória sem efeito externo | Pode gerar recomendação e artefato; não precisa de gates guarded. |
| Skill reversível em missão regular | Usa Harness base e registra execução. |
| Skill guarded sem evidência ou aprovação | Bloqueia `completed` e audita a reprovação. |
| Skill guarded com efeito externo sem idempotência | Bloqueia antes do adapter e não faz chamada de rede. |
| Skill guarded com destino fora da allowlist | Bloqueia no adapter, registra falha e não envia payload. |
| Todos os gates aprovados | Permite a transição controlada e grava evento de conclusão. |

## Testes

`server/harness-engine.test.ts` prova que a ausência de evidência, aprovação, rollback, idempotência, revisão de segurança e auditoria reprova uma skill guarded. O teste positivo verifica que todos os gates permitem conclusão. O terceiro caso garante que skills reversíveis não recebem gates guarded indevidos.
