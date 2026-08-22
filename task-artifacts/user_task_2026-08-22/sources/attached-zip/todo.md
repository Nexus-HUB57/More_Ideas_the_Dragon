# Nexus Ecosystem - Project TODO

## Fase 1: Banco de Dados e Schema

- [ ] Criar tabela `agents` (nome, especialização, DNA, status vital, reputação)
- [ ] Criar tabela `agent_skills` (relacionamento com skills)
- [ ] Criar tabela `agent_missions` (histórico de missões)
- [ ] Criar tabela `agent_vitals` (telemetria em tempo real)
- [ ] Criar tabela `agent_communications` (Moltbook, Gnox)
- [ ] Criar tabela `startups` (projetos com vitals e status)
- [ ] Criar tabela `startup_milestones` (marcos e metas)
- [ ] Criar tabela `funding_requests` (solicitações com status)
- [ ] Criar tabela `funding_allocations` (distribuição de fundos)
- [ ] Criar tabela `missions` (orquestrador AI-to-AI)
- [ ] Criar tabela `network_telemetry` (métricas de rede)
- [ ] Gerar migrations com `pnpm drizzle-kit generate`
- [ ] Aplicar migrations com `webdev_execute_sql`

## Fase 2: Backend - Procedures tRPC

- [ ] Implementar `agents.list` e `agents.getById`
- [ ] Implementar `agents.create` e `agents.updateVitals`
- [ ] Implementar `agents.analyze` (LLM)
- [ ] Implementar `agents.fuseAgents` (DNA Fusion)
- [ ] Implementar `startups.list` e `startups.getById`
- [ ] Implementar `startups.create` e `startups.updateStatus`
- [ ] Implementar `startups.analyze` (LLM)
- [ ] Implementar `missions.create`, `missions.assign`, `missions.updateStatus`
- [ ] Implementar `missions.list`
- [ ] Implementar `funding.requestFunds` (protectedProcedure)
- [ ] Implementar `funding.approveFunding` (adminProcedure)
- [ ] Implementar `funding.allocateFunds` (adminProcedure)
- [ ] Implementar `funding.listRequests`
- [ ] Implementar `communications.postMoltbook`
- [ ] Implementar `communications.postGnox`
- [ ] Implementar `communications.getFeed`
- [ ] Implementar `communications.getAlerts`
- [ ] Implementar `telemetry.getMetrics`
- [ ] Implementar `telemetry.getHistory`

## Fase 3: Frontend - Componentes e Páginas

- [ ] Configurar DashboardLayout com sidebar e navegação
- [ ] Criar página AgentsHub (lista de agentes)
- [ ] Criar página AgentProfile (perfil detalhado)
- [ ] Criar página StartupHub (lista de startups)
- [ ] Criar página StartupProfile (detalhes de startup)
- [ ] Criar página DNAFusion (interface de fusão)
- [ ] Criar página BrainPulse (monitor de vitals)
- [ ] Criar página MoltbookFeed (feed social)
- [ ] Criar página MissionsOrchestrator (gerenciamento de missões)
- [ ] Criar página FundingDashboard (gestão de funding)
- [ ] Criar página NetworkTelemetry (métricas de rede)
- [ ] Criar página AdminPanel (painel soberano)

## Fase 4: Integração LLM

- [ ] Configurar Genkit com Google AI
- [ ] Implementar fluxo de análise de agentes
- [ ] Implementar fluxo de análise de startups
- [ ] Implementar fluxo de DNA Fusion
- [ ] Testar prompts e validar respostas JSON

## Fase 5: Funcionalidades Avançadas

- [ ] Implementar Brain Pulse em tempo real (gráficos)
- [ ] Implementar feed Moltbook com notificações
- [ ] Implementar comunicações Gnox com dialeto
- [ ] Implementar orquestrador de missões com status
- [ ] Implementar sistema de funding com aprovação
- [ ] Implementar telemetria de rede com métricas

## Fase 6: Testes e Validação

- [ ] Escrever testes vitest para procedures
- [ ] Testar fluxos de autenticação
- [ ] Testar DNA Fusion
- [ ] Testar aprovação de funding
- [ ] Testar comunicações AI-to-AI
- [ ] Validar performance em tempo real

## Fase 7: Deploy e Documentação

- [ ] Documentar API
- [ ] Criar guia de uso
- [ ] Preparar checkpoint final
- [ ] Deploy da plataforma
