# Roadmap de Ajustes — Modelo Híbrido MMN_AI-to-AI

**Objetivo:** manter humanos no comando administrativo, estratégico, financeiro e de conformidade, delegando aos agentes a execução operacional autorizada do MMN.

## 1. Princípio operacional

A autonomia pretendida é **autonomia controlada**. O agente executa sem aprovação individual cada tarefa operacional, mas sempre dentro de políticas versionadas, limites por canal, regras de consentimento, orçamento operacional, listas de bloqueio, trilha de auditoria e botão de pausa global. Qualquer operação financeira crítica ou alteração de política deve permanecer em human-in-the-loop.

## 2. Matriz de responsabilidades

| Domínio | Agente | Humano |
|---|---|---|
| Metas e posicionamento | Propõe planos e cenários | Aprova objetivos, orçamento e políticas |
| Conteúdo | Gera, adapta e agenda | Define diretrizes, marcas e assuntos proibidos |
| Publicações | Publica nos canais autorizados | Aprova acesso, identidade e limites |
| Convites e prospecção | Identifica, segmenta e contata leads elegíveis | Define consentimento, públicos e regras de abordagem |
| Funil e relacionamento | Faz follow-up, classifica respostas e sugere próximos passos | Trata reclamações, exceções e casos sensíveis |
| Produtos e catálogo | Sincroniza, compara e recomenda | Aprova fornecedores, preços e contratos |
| Pedidos | Registra e reage a eventos operacionais | Intervém em disputas, reembolsos excepcionais e fraude |
| Comissões | Calcula eventos elegíveis conforme regra imutável | Confirma pagamentos, saques, cancelamentos e alterações de regra |
| Segurança e conformidade | Detecta anomalias e bloqueia | Decide exceções, credenciais, políticas e incidentes |

## 3. Fases de implementação

### Fase 0 — Baseline e proteção

Congelar um snapshot do branch de integração, registrar branches e commits concorrentes, habilitar revisão obrigatória e criar um namespace de artefatos. Corrigir segredos expostos, separar `.env.example` de credenciais reais e definir política de backup, rollback e retenção de logs.

**Saída:** baseline reproduzível, inventário de conflitos, política de acesso e checklist Safe Recovery.

### Fase 1 — Contratos de domínio

Unificar os contratos entre frontend, backend e banco. Corrigir rotas divergentes, campos inexistentes e tipos inconsistentes. Separar serviços de domínio dos routers tRPC para que workers possam reutilizar a mesma lógica sem simular chamadas HTTP. Criar estados explícitos para lead, campanha, publicação, pedido, comissão e aprovação.

**Saída:** contratos versionados, migrações revisadas, testes de compatibilidade e eventos de domínio documentados.

### Fase 2 — Filas, workers e scheduler

Adicionar Redis/BullMQ ou equivalente gerenciado. Criar filas para `content_generation`, `publication`, `lead_prospecting`, `invitation`, `follow_up`, `marketplace_sync`, `order_events`, `commission_events`, `analytics` e `dead_letter`. Cada worker deverá ter idempotência, correlation ID, limite de tentativas, backoff, timeout, circuit breaker e dead-letter queue.

Adicionar scheduler para sincronizações, campanhas e rotinas de análise. O `package.json` deve conter scripts explícitos de API, scheduler, workers, migração e validação. Health checks devem verificar banco, Redis, provedores de IA e integrações externas.

**Saída:** execução contínua verificável e reprocessável, sem depender de acionamento manual por tarefa.

### Fase 3 — Orquestrador e agentes especializados

Implementar um orquestrador que receba metas aprovadas, decomponha-as em subtarefas, valide políticas e despache jobs. Agentes especializados devem executar conteúdo, publicação, prospecção, convites, follow-up, catálogo, vendas operacionais e analytics. O LLM deverá produzir plano estruturado validado por schema; ações devem passar por ferramentas tipadas, nunca por chamadas arbitrárias.

**Saída:** ciclo meta → plano → jobs → execução → evidência → avaliação → ajuste.

### Fase 4 — Automação operacional de MMN

Automatizar geração e publicação de conteúdo aprovado por política; descoberta e segmentação de leads elegíveis; convites e follow-ups com consentimento; registro de interações; recomendações de produtos; sincronização de catálogos; reação a webhooks de vendas e pedidos; cálculo de comissões derivadas de eventos confirmados; e análise de desempenho.

A publicação deve usar APIs oficiais, respeitar rate limits, evitar spam e preservar opt-out. A prospecção deve bloquear listas sem consentimento, contatos proibidos, mensagens repetitivas e claims não verificados. O agente não deve criar ou alterar regras remuneratórias.

**Saída:** operação sem aprovação humana individual para tarefas previamente autorizadas.

### Fase 5 — Human-in-the-loop financeiro e administrativo

Manter `adminProcedure` para confirmar, cancelar e liquidar pagamentos; modificar regras de comissão; alterar dados bancários; liberar saques; resolver chargebacks; aprovar fornecedores; modificar credenciais; tratar fraude e aceitar exceções de compliance. Agentes podem preparar evidências e recomendações, mas não concluir esses atos.

**Saída:** fila de aprovação com segregação de funções, dupla validação quando aplicável, auditoria imutável e alertas.

### Fase 6 — Observabilidade, segurança e resiliência

Criar dashboards de filas, latência, falhas, custo de LLM, conversão, opt-outs, denúncias, publicações, convites e intervenções. Registrar prompt version, modelo, ferramenta, política aplicada, decisão, resultado e usuário responsável por aprovações. Testar indisponibilidade de provedor, duplicidade de webhook, queda de worker, retorno inválido de LLM e rollback.

**Saída:** SLOs, alertas, runbooks, teste de caos controlado e procedimento de pausa global.

### Fase 7 — Piloto e produção gradual

Executar primeiro em sandbox, depois com um agente e um canal, e finalmente expandir por coortes. Usar feature flags, orçamento limitado e janela de observação. A promoção para produção dependerá dos critérios de aceite e da ausência de exclusões, perda de eventos ou violações de consentimento.

## 4. Critérios de aceite

| Critério | Evidência exigida |
|---|---|
| Execução autônoma | Jobs operacionais executados pelo scheduler e workers sem acionamento manual |
| Segurança financeira | Rotas críticas continuam protegidas por autorização administrativa |
| Idempotência | Repetição de evento não duplica publicação, convite, pedido ou comissão |
| Auditoria | Cada ação possui ator, política, versão, timestamp, correlation ID e resultado |
| Recuperação | Falhas entram em retry/dead-letter e podem ser reprocessadas com segurança |
| Conformidade | Consentimento, opt-out, rate limits e políticas de canal são aplicados |
| Governança | Pausa global e aprovação de exceções funcionam em teste controlado |
| Integridade | Testes, hashes e diff comprovam que a entrega não removeu arquivos existentes |

## 5. Resultado esperado

Ao final, o operador humano define estratégia, limites e decisões administrativas e financeiras. Os agentes assumem a execução operacional recorrente, interagem com leads e clientes dentro das permissões, publicam e acompanham campanhas, processam eventos comerciais e aprendem com métricas sem exigir intervenção por ação. A autonomia é mensurável, limitada e reversível, preservando a governança do ecossistema.
