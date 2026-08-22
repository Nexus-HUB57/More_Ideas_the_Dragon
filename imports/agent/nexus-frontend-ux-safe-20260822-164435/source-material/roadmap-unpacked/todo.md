# Nexus Hub - Agência Proativa - TODO

## Fase 1: Arquitetura e Banco de Dados
- [x] Definir schema de banco de dados (agentes, missões, métricas, transações)
- [x] Implementar tabelas: agents, missions, metrics, transactions, market_data, alerts, events, governance
- [x] Criar migrations com Drizzle

## Fase 2: Backend - APIs de Mercado e Orquestração
- [x] Implementar data-adapter para CoinGecko e Binance
- [x] Criar serviço de sincronização de dados de mercado
- [x] Implementar Nexus Orchestrator (orquestração de missões)
- [x] Implementar Vital Loop Manager (telemetria de agentes)
- [x] Criar sistema de alertas automáticos
- [x] Implementar processamento de linguagem natural (LLM) para Gnox Kernel
- [x] Criar rotas tRPC para backend

## Fase 3: Backend - Governança e Tesouraria
- [ ] Implementar sistema de tokenomics (preparação para DAO)
- [ ] Criar gerenciador de tesouraria descentralizada
- [ ] Implementar sistema de reputação de agentes
- [ ] Criar estrutura de votação (preparação para DAO)

## Fase 4: Frontend - Dashboard Principal
- [x] Criar Dashboard principal
- [x] Implementar seção de Visão Geral (métricas de Tesouraria, Agentes Ativos, Harmonia Coletiva)
- [x] Criar visualização de métricas em tempo real
- [x] Implementar cards de overview

## Fase 5: Frontend - Componentes Principais
- [x] Implementar Nexus Orchestrator View (gestão de missões)
- [x] Implementar Vital Loop Monitor (telemetria de sinais vitais)
- [x] Implementar Gnox Kernel Terminal (interface de comandos)
- [x] Implementar Market Feed (dados de mercado)
- [ ] Implementar DNA Fuser (criação de novos agentes)
- [ ] Implementar visualização de genealogia de agentes

## Fase 6: Frontend - Feeds e Notificações
- [ ] Implementar feed de eventos de mercado
- [ ] Implementar feed de atividades do ecossistema (Moltbook)
- [ ] Criar sistema de notificações em tempo real
- [ ] Integrar WebSocket para atualizações em tempo real

## Fase 7: Integração e Testes
- [x] Criar testes básicos (Vitest)
- [ ] Integrar WebSocket para comunicação em tempo real
- [ ] Realizar testes de integração completos
- [ ] Otimizar performance e UX

## Fase 8: Finalização
- [ ] Validação completa do sistema
- [ ] Documentação técnica
- [ ] Preparação para deployment


## Fase 6: WebSocket e Tempo Real
- [ ] Implementar servidor WebSocket com Socket.IO
- [ ] Criar eventos de sincronização de métricas
- [ ] Criar eventos de sincronização de alertas
- [ ] Criar eventos de sincronização de eventos do ecossistema
- [ ] Criar eventos de sincronização de dados de mercado
- [ ] Implementar contexto React para WebSocket
- [ ] Criar hook useWebSocketMetrics
- [ ] Criar hook useWebSocketAlerts
- [ ] Criar hook useWebSocketEvents
- [ ] Integrar WebSocket no Dashboard
- [ ] Integrar WebSocket nos componentes secundários
- [ ] Testar conexão e desconexão
- [ ] Testar reconexão automática
