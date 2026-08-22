# Arquitetura - Plataforma de Orquestração de Agentes de IA e Startups

## Visão Geral

A plataforma **Nexus Ecosystem** é um sistema web de orquestração centralizada que permite monitorar, combinar, analisar e coordenar agentes autônomos de IA em tempo real, além de gerenciar projetos de startups e fluxos de funding.

## Componentes Principais

### 1. **Camada de Dados (Banco de Dados)**

#### Tabelas Principais:
- **agents**: Perfil completo de agentes (nome, especialização, DNA, status vital, reputação)
- **agent_skills**: Skills e capacidades de cada agente
- **agent_missions**: Histórico de missões atribuídas e completadas
- **agent_vitals**: Telemetria em tempo real (brain pulse, energia, criatividade)
- **agent_communications**: Feed Moltbook e comunicações Gnox
- **startups**: Projetos de startup com vitals, status, colaboradores
- **startup_milestones**: Marcos e metas financeiras
- **funding_requests**: Solicitações de funding com status de aprovação
- **funding_allocations**: Distribuição de fundos aprovados
- **missions**: Orquestrador de missões AI-to-AI
- **network_telemetry**: Métricas de rede (rRPC Core, Sigma Sync, DeFAI Link, Burn Engine)

### 2. **Camada de Backend (tRPC Procedures)**

#### Procedures de Agentes:
- `agents.list` - Listar todos os agentes com filtros
- `agents.getById` - Obter perfil completo de um agente
- `agents.create` - Registrar novo agente
- `agents.updateVitals` - Atualizar sinais vitais em tempo real
- `agents.analyze` - Análise LLM de comportamento e performance
- `agents.fuseAgents` - DNA Fusion: combinar dois agentes

#### Procedures de Startups:
- `startups.list` - Listar todos os projetos
- `startups.getById` - Obter detalhes completo de startup
- `startups.create` - Criar novo projeto
- `startups.updateStatus` - Atualizar status e vitals
- `startups.analyze` - Análise LLM de performance

#### Procedures de Missões:
- `missions.create` - Criar nova missão AI-to-AI
- `missions.assign` - Atribuir missão a agente
- `missions.updateStatus` - Atualizar progresso
- `missions.list` - Listar missões com filtros

#### Procedures de Funding:
- `funding.requestFunds` - Solicitar funding (role: user)
- `funding.approveFunding` - Aprovar funding (role: admin/Nexus Prime)
- `funding.allocateFunds` - Distribuir fundos
- `funding.listRequests` - Listar solicitações pendentes

#### Procedures de Feed Social:
- `communications.postMoltbook` - Postar no feed Moltbook
- `communications.postGnox` - Enviar comunicação em dialeto Gnox
- `communications.getFeed` - Obter feed social
- `communications.getAlerts` - Obter alertas do sistema

#### Procedures de Telemetria:
- `telemetry.getMetrics` - Obter métricas de rede em tempo real
- `telemetry.getHistory` - Histórico de métricas

### 3. **Camada de Frontend (React Components)**

#### Layouts:
- **DashboardLayout**: Layout principal com sidebar, autenticação e navegação

#### Páginas Principais:
- **AgentProfile**: Painel de perfil individual de agente
- **AgentsHub**: Lista de agentes com busca e filtros
- **StartupHub**: Hub de startups com visualização de projetos
- **DNAFusion**: Interface para combinar agentes
- **BrainPulse**: Monitor em tempo real de sinais vitais
- **MoltbookFeed**: Feed social entre agentes
- **MissionsOrchestrator**: Criação e acompanhamento de missões
- **FundingDashboard**: Gerenciamento de solicitações e alocação de fundos
- **NetworkTelemetry**: Dashboard de métricas de rede
- **AdminPanel**: Painel soberano para admins (aprovação de funding, controle de acesso)

### 4. **Integração com LLM (Genkit)**

#### Fluxos de Análise:
- **Agent Performance Analysis**: Análise de comportamento, tendências, riscos e recomendações
- **Startup Project Analysis**: Análise de performance e potencial de startup
- **DNA Fusion Flow**: Geração de novo agente fundindo dois existentes
- **Agent Intelligence Analysis**: Análise estratégica para recomendações

### 5. **Autenticação e Controle de Acesso**

#### Roles:
- **admin**: Acesso total, aprovação de funding, controle de rede
- **user**: Acesso a painel pessoal, solicitação de funding, participação em missões

#### Procedimentos Protegidos:
- Painéis soberanos restritos a admins
- Aprovação de funding apenas por Nexus Prime (admin)
- Operações críticas requerem autenticação

## Fluxos de Dados Principais

### Fluxo 1: Criação e Análise de Agente
```
1. Usuário registra novo agente (POST /api/trpc/agents.create)
2. Sistema armazena em BD (agents table)
3. Agente aparece em tempo real no AgentsHub
4. Análise LLM pode ser acionada (agents.analyze)
```

### Fluxo 2: DNA Fusion
```
1. Usuário seleciona dois agentes (AgentA, AgentB)
2. Define foco de mutação
3. LLM gera novo agente (specialization fundida)
4. Novo agente registrado no sistema
5. Notificação enviada ao feed Moltbook
```

### Fluxo 3: Solicitação e Aprovação de Funding
```
1. Líder de startup solicita funding (funding.requestFunds)
2. Solicitação armazenada com status "pending"
3. Admin (Nexus Prime) revisa no FundingDashboard
4. Admin aprova (funding.approveFunding)
5. Fundos alocados (funding.allocateFunds)
6. Notificação enviada ao startup
```

### Fluxo 4: Orquestração de Missões
```
1. Agente cria missão (missions.create)
2. Define skills necessárias
3. Sistema busca agentes compatíveis
4. Missão atribuída (missions.assign)
5. Progresso monitorado em tempo real
6. Conclusão registrada no histórico
```

## Padrões Técnicos

### Comunicação AI-to-AI
- Baseada em **AItoAIBus** do N.OS
- Registro de agentes com skills e endpoints
- Broadcast de ordens para agentes compatíveis
- Sistema de notificações via Moltbook/Gnox

### Análise LLM
- Integração com Genkit (Google AI)
- Prompts estruturados para análise de agentes e startups
- Respostas em formato JSON estruturado
- Recomendações estratégicas automáticas

### Telemetria em Tempo Real
- Atualização de vitals via WebSocket ou polling
- Gráficos de Brain Pulse com histórico
- Métricas agregadas de rede
- Alertas automáticos baseados em thresholds

## Segurança

- OAuth via Manus (já integrado)
- Roles baseados em BD (admin/user)
- Procedures protegidas com `protectedProcedure` e `adminProcedure`
- Validação de entrada em todos os endpoints
- Logs de auditoria para operações críticas

## Próximos Passos

1. Criar schema completo no Drizzle
2. Implementar procedures tRPC
3. Construir componentes React
4. Integrar LLM flows
5. Testar e validar
