# Nexus HUB — Audit Standard + Engineering Harness

## 1. Princípio

Toda ação do Agente Orquestrador deve ser explicável, delimitada e reversível quando tecnicamente possível. O log não é um relatório posterior: é parte do contrato de execução.

## 2. Envelope obrigatório

Cada decisão emite um `AuditEnvelope` com identificador de evento, correlação, missão, agente, ação, risco, estado anterior, estado posterior, referências de evidência, score Harness, referências de ferramentas, resultado, timestamp e digest SHA-256 do envelope canônico.

| Campo | Obrigatoriedade | Regra |
|---|---:|---|
| `eventId` | Sim | UUID único |
| `correlationId` | Sim | Une todos os passos da missão |
| `missionId` | Sim | Vincula ao control plane |
| `actor` | Sim | Agente ou serviço responsável |
| `risk` | Sim | low, medium, high ou critical |
| `before/after` | Sim | Estado observável |
| `evidenceRefs` | Conforme risco | Obrigatório para guarded |
| `harnessScore` | Sim | Score no momento da decisão |
| `toolRefs` | Conforme execução | Nunca registrar segredo bruto |
| `outcome` | Sim | Resultado fechado |
| `digest` | Sim | Evidência de adulteração |

## 3. Gates Harness

O preflight verifica identidade, ownership, definição de pronto, risco, prazo, evidência, aprovação, rollback, idempotência para efeitos externos, revisão de segurança e referência de auditoria. Falha crítica envia a intenção para quarentena; falha recuperável exige coleta de evidência ou rota de recuperação.

## 4. Política de risco

Ações `recommend` somente produzem plano. Ações `execute_reversible` podem operar dentro do budget e de um rollback testado. Ações `execute_guarded` exigem todos os gates, aprovação explícita e evidência. Efeitos financeiros, credenciais, mudanças de infraestrutura e efeitos externos devem permanecer atrás de adapter allowlist, idempotência e revisão específica.

## 5. Auditoria de alteração de código

Nenhum agente reconfigura código inacessível. O alvo deve estar em allowlist, o baseline deve possuir digest, a proposta deve registrar o candidato, e os gates incluem TypeScript, testes, diff review, rollback e smoke test. A promoção é uma nova decisão, não uma continuação implícita do planejamento.

## 6. Retenção e privacidade

Logs devem conter referências e metadados mínimos. Segredos, tokens, passphrases e payloads sensíveis são proibidos. Retenção, acesso e exportação devem ser controlados por política de ambiente e sujeitos a auditoria.

## 7. Critério de qualidade

Uma missão somente é considerada concluída quando sua evidência é reproduzível, seus invariantes permanecem verdadeiros, o Harness passa, o custo observado permanece no orçamento e existe uma explicação suficiente para a decisão. O sistema deve preferir `blocked` a uma conclusão sem prova.
