# Arquitetura de Orquestração Autônoma — MMN Híbrido

## 1. Visão geral

A arquitetura transforma funções isoladas em uma plataforma orientada a eventos. O fluxo principal é: meta aprovada → plano estruturado → validação de políticas → jobs → workers → eventos → métricas → ajuste ou escalonamento humano.

## 2. Componentes

| Componente | Responsabilidade |
|---|---|
| API e serviços de domínio | Expor contratos e executar regras sem acoplamento a interface |
| Agente Orquestrador | Decompor metas, selecionar ferramentas e acompanhar execução |
| Agentes especializados | Executar conteúdo, publicação, prospecção, convites, follow-up, catálogo e analytics |
| Redis/BullMQ | Persistir filas, estados, retries, prioridades e dead letters |
| Scheduler | Disparar tarefas recorrentes e campanhas autorizadas |
| MySQL/Drizzle | Persistir entidades, estados, auditoria e resultados |
| Event ledger | Registrar eventos idempotentes e correlacionados |
| Policy engine | Verificar consentimento, canal, limites, orçamento e conteúdo proibido |
| Approval service | Encaminhar decisões administrativas, financeiras e exceções |
| Observabilidade | Métricas, logs estruturados, traces, alertas e painéis |

## 3. Filas recomendadas

`content_generation` gera conteúdo; `publication` agenda e publica em canais autorizados; `lead_prospecting` classifica oportunidades permitidas; `invitation` envia convites com consentimento; `follow_up` executa acompanhamentos; `marketplace_sync` atualiza catálogos; `order_events` processa webhooks; `commission_events` calcula valores derivados de eventos elegíveis; `analytics` mede resultados; e `dead_letter` preserva falhas para diagnóstico e reprocessamento.

## 4. Contrato de job

Todo job deverá conter `jobId`, `correlationId`, `tenantId`, `agentId`, `taskType`, `policyVersion`, `payload`, `attempt`, `createdAt`, `notBefore`, `idempotencyKey` e `requestedBy`. O payload não deve conter segredos. O worker valida o schema antes da execução e rejeita tarefas fora da política.

A chave de idempotência deverá ser derivada do evento de negócio e da ação. Publicações, convites, pedidos e comissões não podem ser duplicados por retries. Jobs temporariamente indisponíveis devem usar backoff exponencial; falhas permanentes devem ir para dead letter; e qualquer reprocessamento deve gerar nova evidência vinculada ao job original.

## 5. Política de autonomia

O agente pode agir automaticamente para gerar, adaptar, programar e publicar conteúdo autorizado; pesquisar e classificar leads elegíveis; enviar convites e follow-ups permitidos; registrar interações; recomendar produtos; sincronizar catálogos; reagir a vendas e pedidos; calcular comissões conforme regras imutáveis; e ajustar campanhas dentro de limites.

O agente deve ser bloqueado para confirmar pagamentos, aprovar saques, alterar dados bancários, modificar regras de comissão, aprovar fornecedores, acessar credenciais administrativas, ignorar opt-out, contornar rate limits, realizar spam, publicar claims não verificados ou executar exceções de compliance. Esses casos geram `approval_required`.

## 6. Orquestração do ciclo de campanha

1. O humano aprova uma meta, um canal, um orçamento, uma política de conteúdo e um público permitido.
2. O orquestrador solicita ao LLM um plano estruturado, validado por schema e limitado às ferramentas autorizadas.
3. O policy engine verifica consentimento, frequência, orçamento, catálogo, idioma e assuntos proibidos.
4. O orquestrador cria jobs com idempotência e correlação.
5. Workers executam as tarefas e gravam eventos, resultados, custos e evidências.
6. O analytics worker mede conversão, rejeições, opt-outs e qualidade.
7. O orquestrador ajusta a campanha dentro dos limites; fora deles, pausa e solicita aprovação.

## 7. Eventos e estados

As entidades devem possuir máquinas de estado explícitas. Uma publicação pode estar em `draft`, `validated`, `scheduled`, `published`, `failed` ou `paused`. Um lead pode estar em `discovered`, `eligible`, `contacted`, `engaged`, `opted_out` ou `blocked`. Um pedido pode estar em `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` ou `refunded`. Uma comissão pode estar em `pending`, `confirmed`, `paid` ou `cancelled`, sempre com regras de transição auditadas.

## 8. Segurança e governança

Credenciais devem permanecer em secret manager, nunca em código ou artefatos públicos. Cada integração deve possuir escopos mínimos, rotação e revogação. O sistema deve ter pausa global, pausa por agente, pausa por canal e pausa por campanha. Logs devem registrar versão do prompt, modelo, ferramenta, política e resultado, sem armazenar dados pessoais além do necessário.

## 9. Resiliência

Workers devem possuir timeout, retry limitado, circuit breaker, heartbeat e graceful shutdown. Webhooks devem ser autenticados, verificados e deduplicados. O banco deve usar transações nas mudanças de estado e outbox para publicação confiável de eventos. O scheduler deve tolerar execução duplicada sem gerar tarefas duplicadas.

## 10. Métricas mínimas

A operação deve acompanhar taxa de sucesso, latência, backlog, retries, dead letters, custo por tarefa, publicações duplicadas, taxa de opt-out, denúncias, conversão por campanha, leads elegíveis, intervenções humanas, tempo de aprovação e divergências de comissão. Nenhuma métrica de crescimento deve ser usada isoladamente para liberar autonomia adicional.

## 11. Condição de produção

A arquitetura somente deve ser promovida para produção após testes de contrato, integração, segurança, carga, falha de provedor, duplicidade de webhook, retorno inválido de LLM, queda de worker, rollback e pausa global. O piloto deve iniciar com uma coorte pequena, um canal e orçamento restrito, expandindo apenas após evidências auditáveis.
