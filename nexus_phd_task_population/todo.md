# Nexus Hub - TODO List

## Fase 1: Arquitetura e Banco de Dados
- [x] Expandir schema.ts com todas as tabelas necessárias
- [x] Implementar migrações de banco de dados
- [ ] Criar índices para otimização de queries

## Fase 2: Backend - Routers tRPC
- [x] Implementar router de agentes (CRUD, genealogia, sinais vitais)
- [x] Implementar router de Moltbook (posts, reações, feed)
- [x] Implementar router de comunicação Gnox's (mensagens criptografadas)
- [ ] Implementar router de projetos Forge (CRUD, status)
- [x] Implementar router de transações e economia
- [ ] Implementar router de ativos NFT (Asset Lab)
- [ ] Implementar router de notificações
- [ ] Implementar router de governança (métricas, estatísticas)

## Fase 3: Backend - Lógica de Negócio
- [x] Sistema de distribuição automática de taxas (80/10/10)
- [x] Lógica de criação de agentes (DNA Fuser)
- [x] Sistema de criptografia Gnox's (AES-256)
- [ ] Integração com LLM para processamento de reflexões
- [ ] Sistema de notificações por email ao proprietário
- [ ] Simulação de sinais vitais (Brain Pulse)

## Fase 4: Frontend - Estrutura e Estilo
- [x] Configurar tema cyberpunk (neon rosa, ciano, preto profundo)
- [x] Criar componentes base com estética HUD
- [x] Implementar sistema de cores CSS variables
- [x] Criar layout principal com navegação

## Fase 5: Frontend - Componentes Principais
- [x] Página Home/Dashboard principal
- [ ] Componente Moltbook Feed (feed social em tempo real)
- [ ] Componente DNA Fuser (criação de agentes)
- [ ] Componente Brain Pulse Monitor (sinais vitais)
- [ ] Componente Agent Profile (perfil de agentes)
- [ ] Componente Governance Dashboard (métricas)
- [ ] Componente Gnox's Communicator (mensagens criptografadas)
- [ ] Componente Forge Projects (gestão de projetos)
- [ ] Componente Asset Lab (gestão de NFTs)
- [ ] Componente Notifications Center (notificações)

## Fase 6: Tempo Real e WebSocket
- [ ] Implementar WebSocket para feed social
- [ ] Implementar WebSocket para sinais vitais
- [ ] Implementar WebSocket para transações em tempo real
- [ ] Implementar WebSocket para notificações

## Fase 7: Integração e Testes
- [ ] Testes unitários com Vitest
- [ ] Testes de integração backend-frontend
- [ ] Otimização de performance
- [ ] Testes de segurança (criptografia)

## Fase 8: Deployment
- [ ] Criar checkpoint final
- [ ] Documentação técnica completa
- [ ] Guia de uso da plataforma


## Fase 5.1: Moltbook Feed - Implementação
- [ ] Criar componente MoltbookFeed com listagem de posts
- [ ] Implementar filtros por tipo de postagem (reflection, achievement, birth, transaction, message)
- [ ] Criar componente PostCard com exibição de conteúdo e reações
- [ ] Implementar sistema de reações com contador dinâmico
- [ ] Integrar WebSocket para atualizações em tempo real
- [ ] Criar hook useWebSocket para gerenciar conexões
- [ ] Adicionar paginação e lazy loading
- [ ] Implementar busca e filtros avançados
- [ ] Criar testes para componentes Moltbook
