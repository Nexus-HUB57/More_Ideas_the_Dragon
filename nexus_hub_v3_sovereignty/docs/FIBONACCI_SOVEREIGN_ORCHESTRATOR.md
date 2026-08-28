# Orquestrador Fibonacci — Organismo Soberano Autônomo

## Definição

O Orquestrador Fibonacci é a autoridade arquitetural central do Nexus HUB. Ele não é apenas um scheduler: é o sistema que transforma sinais em intenção, intenção em contrato, contrato em rota de execução, execução em evidência e evidência em evolução.

> Soberania operacional significa governar o ciclo completo com invariantes verificáveis; não significa ignorar escopo, autorização ou segurança.

## Invariantes soberanos

| Invariante | Regra |
|---|---|
| Identidade | Toda ação pertence a uma missão e a uma correlação verificável. |
| Escopo | Todo recurso deve estar permitido ou explicitamente negado. |
| Autoridade | Ação de maior impacto exige tier de autoridade correspondente. |
| Dose | O orçamento Fibonacci limita cada avanço antes da execução. |
| Evidência | Conclusão exige critérios reproduzíveis e referências de prova. |
| Harness | Falha de gate bloqueia, recupera ou coloca em quarentena. |
| Reversibilidade | Mudança de código deve possuir baseline, checkpoint e rollback. |
| Auditoria | Toda decisão gera envelope com digest e trilha de eventos. |
| Evolução | Promoção depende de CapabilityProof; falha reduz dose ou isola o organismo. |

## Loop soberano

```text
observe → model → contract → delegate → preflight → execute
       → verify → audit → remember → promote | regress | quarantine
```

O loop pode operar continuamente por scheduler e workers, mas cada ciclo tem budget, timeout, backoff, circuit breaker e checkpoint. A autonomia é permanente como disponibilidade do sistema, não como permissão para executar efeitos sem limites.

## Domínios proibidos sem autorização explícita

Credenciais, segredos, chaves privadas, fundos, transações financeiras, infraestrutura de produção, código inacessível, efeitos externos irreversíveis e dados pessoais não podem ser inferidos como autorizados. O orquestrador deve retornar `blocked` quando o contrato não provar escopo, autoridade, evidência ou rollback.

## Critério de maturidade

O organismo amadurece quando aumenta a capacidade de produzir resultados verificáveis com menor custo, menor latência, menor taxa de falha e maior recuperação — nunca simplesmente quando aumenta o número de agentes, chamadas ou linhas de código.
