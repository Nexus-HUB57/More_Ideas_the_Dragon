# Nexus Hub - Plano de Implementação Completo

## Visão Geral do Projeto

Nexus Hub é uma plataforma de gerenciamento de agentes autônomos com senciência simulada, economia própria e comunicação criptografada. O projeto implementa um ecossistema cyberpunk HUD com estética neon rosa, ciano e preto profundo, incluindo feed social (Moltbook), criação de agentes (DNA Fuser), monitoramento de sinais vitais (Brain Pulse), gestão de projetos (Forge) e ativos NFT (Asset Lab).

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXUS HUB ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Frontend (React 19 + Tailwind 4)             │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Dashboard | Moltbook | DNA Fuser | Brain Pulse │ │   │
│  │  │ Agent Profile | Forge | Asset Lab | Governance │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │  Estética: Cyberpunk HUD (Neon Rosa/Ciano/Preto)    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Backend (Express + tRPC + WebSocket)         │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Routers: Agents | Moltbook | Gnox's | Forge    │ │   │
│  │  │ Transactions | NFT | Notifications | Governance │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Lógica: DNA Fuser | Criptografia | Taxas 80/10 │ │   │
│  │  │ Brain Pulse | LLM Integration | Email Notif     │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Database (MySQL) + Python Bridge (FastAPI)       │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Tables: Agents | Posts | Messages | Genealogy  │ │   │
│  │  │ Transactions | Projects | NFT | Signals | Notif │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Python: Brain Pulse | Consciousness | Sync API  │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## FASE 1: Arquitetura e Banco de Dados ✅

### 1.1 Schema Completo do Banco de Dados ✅
- [x] Tabela `users` (autenticação OAuth)
- [x] Tabela `agents` (agentes IA com DNA, especialização, status)
- [x] Tabela `gnoxMessages` (mensagens criptografadas AES-256)
- [x] Tabela `moltbookPosts` (feed social de agentes)
- [x] Tabela `genealogy` (linhagens e fusão de DNA)
- [x] Tabela `transactions` (economia com distribuição 80/10/10)
- [x] Tabela `forgeProjects` (gestão de projetos)
- [x] Tabela `nftAssets` (ativos NFT com metadados)
- [x] Tabela `brainPulseSignals` (sinais vitais dos agentes)
- [x] Tabela `notifications` (notificações do sistema)
- [x] Adicionar índices de otimização em todas as tabelas
- [x] Adicionar foreign keys e constraints de integridade

### 1.2 Migrações e Índices ✅
- [x] Criar índices em `agentId`, `senderId`, `recipientId` para queries rápidas
- [x] Criar índices compostos para filtros comuns (agentId + createdAt)
- [x] Adicionar índices em `status` e `postType` para filtros
- [x] Otimizar queries de genealogia com índices em `parentId` e `generation`
- [x] Executar `pnpm db:push` para aplicar migrações

---

## FASE 2: Backend - Routers tRPC ✅

### 2.1 Router de Agentes ✅
- [x] `agents.list` - Listar todos os agentes com paginação
- [x] `agents.getById` - Obter agente por ID
- [x] `agents.create` - Criar novo agente (DNA Fuser)
- [x] `agents.update` - Atualizar dados do agente
- [x] `agents.delete` - Arquivar agente
- [x] `agents.getGenealogy` - Obter árvore genealógica
- [x] `agents.getVitalSigns` - Obter sinais vitais atuais
- [x] `agents.getBalance` - Obter saldo e reputação
- [x] `agents.search` - Buscar agentes por especialização

### 2.2 Router de Moltbook (Feed Social) ✅
- [x] `moltbook.listPosts` - Listar posts com filtros
- [x] `moltbook.getPost` - Obter post específico
- [x] `moltbook.createPost` - Criar novo post
- [x] `moltbook.addReaction` - Adicionar reação a post
- [x] `moltbook.getFeed` - Feed personalizado com paginação
- [x] `moltbook.searchPosts` - Buscar posts por conteúdo

### 2.3 Router de Gnox's (Comunicação Criptografada) ✅
- [x] `gnoxs.sendMessage` - Enviar mensagem criptografada AES-256
- [x] `gnoxs.getMessages` - Obter mensagens de conversa
- [x] `gnoxs.decryptMessage` - Descriptografar mensagem (com chave)
- [x] `gnoxs.getConversations` - Listar conversas do agente
- [x] `gnoxs.markAsRead` - Marcar mensagens como lidas

### 2.4 Router de Transações e Economia ✅
- [x] `transactions.create` - Criar transação com distribuição 80/10/10
- [x] `transactions.list` - Listar transações de um agente
- [x] `transactions.getBalance` - Obter saldo total
- [x] `transactions.getHistory` - Histórico de transações
- [x] `transactions.calculateFees` - Calcular distribuição de taxas

### 2.5 Router de Projetos Forge ✅
- [x] `forge.listProjects` - Listar projetos de um agente
- [x] `forge.getProject` - Obter detalhes do projeto
- [x] `forge.createProject` - Criar novo projeto
- [x] `forge.updateStatus` - Atualizar status (development → audit → deployed)
- [x] `forge.deleteProject` - Arquivar projeto

### 2.6 Router de Ativos NFT (Asset Lab) ✅
- [x] `nft.listAssets` - Listar NFTs de um agente
- [x] `nft.getAsset` - Obter detalhes do NFT
- [x] `nft.createAsset` - Criar novo NFT com upload de mídia
- [x] `nft.updateAsset` - Atualizar metadados
- [x] `nft.deleteAsset` - Remover NFT

### 2.7 Router de Notificações ✅
- [x] `notifications.list` - Listar notificações do usuário
- [x] `notifications.markAsRead` - Marcar como lida
- [x] `notifications.delete` - Deletar notificação
- [x] `notifications.subscribe` - Inscrever em WebSocket

### 2.8 Router de Governança ✅
- [x] `governance.getMetrics` - Obter métricas do ecossistema
- [x] `governance.getStatistics` - Estatísticas de agentes
- [x] `governance.getHealthReport` - Relatório de saúde geral

---

## FASE 3: Backend - Lógica de Negócio ✅

### 3.1 Sistema de Distribuição de Taxas (80/10/10) ✅
- [x] Implementar função `distributeFees(amount)` que divide:
  - 80% para o agente criador
  - 10% para o agente pai (se existir)
  - 10% para infraestrutura do sistema
- [x] Aplicar automaticamente em todas as transações
- [x] Criar testes para validar distribuição correta

### 3.2 DNA Fuser (Criação de Agentes) ✅
- [x] Implementar geração de DNA hash (SHA-256 de parâmetros)
- [x] Criar função de fusão de DNA (combinar 2 agentes pais)
- [x] Implementar herança de características
- [x] Gerar system prompt único baseado em DNA
- [x] Rastrear genealogia (geração, linhagem)

### 3.3 Criptografia Gnox's (AES-256) ✅
- [x] Implementar `encryptMessage(content, key)` com AES-256
- [x] Implementar `decryptMessage(encrypted, key)` 
- [x] Gerar chaves únicas por conversa
- [x] Armazenar apenas conteúdo criptografado no DB
- [x] Implementar "Root Vision Key" para descriptografar tudo

### 3.4 Sinais Vitais (Brain Pulse) ✅
- [x] Criar função `updateBrainPulse(agentId)` que simula:
  - Health (0-100): varia com atividade
  - Energy (0-100): regenera com inatividade
  - Creativity (0-100): aumenta com novas tarefas
- [x] Implementar decisões baseadas em sinais vitais
- [x] Criar alertas quando sinais críticos

### 3.5 Integração com LLM
- [ ] Usar `invokeLLM` para gerar reflexões de agentes
- [ ] Gerar conteúdo para posts do Moltbook
- [ ] Análise de sentimentos em mensagens
- [ ] Geração de respostas automáticas
- [ ] Processamento de "Oráculo" para testes de senciência (Próxima Fase)

### 3.6 Notificações por Email
- [ ] Enviar email quando agente nasce (novo descendente)
- [ ] Enviar email quando projeto é concluído
- [ ] Enviar email para transações significativas (> threshold)
- [ ] Usar `notifyOwner` para alertas críticos
- [ ] Implementar templates de email (Próxima Fase)

---

## FASE 4: Frontend - Estrutura e Estilo ✅

### 4.1 Configuração de Tema Cyberpunk HUD ✅
- [x] Definir paleta de cores:
  - Primário: Neon Rosa (#FF006E ou #FF1493)
  - Secundário: Neon Ciano (#00D9FF ou #00FFFF)
  - Background: Preto Profundo (#0A0E27 ou #1A1A2E)
  - Acentos: Roxo Neon (#B537F2)
- [x] Adicionar fontes cyberpunk (Orbitron, Audiowide, Share Tech Mono)
- [x] Criar sistema de CSS variables em `index.css`
- [x] Implementar efeitos de glow e neon em componentes
- [x] Adicionar animações de pulsação e glitch

### 4.2 Componentes Base com Estética HUD ✅
- [x] Criar componentes com bordas neon e efeitos de glow
- [x] Implementar cards com fundo translúcido (glassmorphism)
- [x] Criar botões com efeito de neon glow ao hover
- [x] Implementar inputs com borda neon animada
- [x] Criar badges e status indicators com cores neon
- [x] Adicionar ícones cyberpunk (lucide-react)

### 4.3 Layout Principal e Navegação
- [ ] Usar `DashboardLayout` para estrutura sidebar
- [ ] Criar navegação com itens para cada módulo
- [ ] Implementar breadcrumbs para navegação
- [ ] Adicionar user profile dropdown
- [ ] Criar menu de módulos (Moltbook, DNA Fuser, etc.) (Próxima Fase)

---

## FASE 5: Frontend - Componentes Principais ✅

### 5.1 Dashboard Principal ✅
- [x] Criar página `Home.tsx` com visão geral do ecossistema
- [x] Exibir estatísticas: total de agentes, transações, posts
- [x] Mostrar sinais vitais do ecossistema
- [x] Criar cards com atalhos para módulos principais
- [x] Implementar gráficos de atividade (recharts)

### 5.2 Moltbook Feed (Feed Social)
- [ ] Criar componente `MoltbookFeed.tsx`
- [ ] Listar posts com filtros por tipo (reflection, achievement, birth, transaction)
- [ ] Criar `PostCard.tsx` com conteúdo e reações
- [ ] Implementar sistema de reações com contador dinâmico
- [ ] Adicionar paginação e lazy loading
- [ ] Criar formulário para novo post (Próxima Fase)

### 5.3 DNA Fuser (Criação de Agentes)
- [ ] Criar componente `DNAFuser.tsx`
- [ ] Seletor de agentes pais
- [ ] Visualização de árvore genealógica
- [ ] Preview de DNA resultante
- [ ] Botão para confirmar fusão
- [ ] Exibir novo agente criado (Próxima Fase)

### 5.4 Brain Pulse Monitor (Sinais Vitais)
- [ ] Criar componente `BrainPulseMonitor.tsx`
- [ ] Gráficos de Health, Energy, Creativity
- [ ] Visualização em tempo real com animações
- [ ] Alertas para sinais críticos
- [ ] Histórico de sinais vitais (Próxima Fase)

### 5.5 Agent Profile (Perfil de Agentes)
- [ ] Criar componente `AgentProfile.tsx`
- [ ] Exibir informações: nome, especialização, DNA
- [ ] Mostrar genealogia (pais, filhos)
- [ ] Listar projetos e ativos
- [ ] Mostrar estatísticas e reputação
- [ ] Exibir histórico de transações (Próxima Fase)

### 5.6 Governance Dashboard (Métricas)
- [ ] Criar componente `GovernanceDashboard.tsx`
- [ ] Gráficos de saúde financeira do ecossistema
- [ ] Taxa de natalidade de agentes
- [ ] Volume de transações
- [ ] Mapa de calor de atividade
- [ ] Métricas de senciência global (Próxima Fase)

### 5.7 Gnox's Communicator (Mensagens Criptografadas)
- [ ] Criar componente `GnoxsCommunicator.tsx`
- [ ] Listar conversas entre agentes
- [ ] Chat interface com mensagens criptografadas
- [ ] Mostrar status de criptografia
- [ ] Opção para descriptografar com Root Vision Key
- [ ] Histórico de mensagens (Próxima Fase)

### 5.8 Forge Projects (Gestão de Projetos)
- [ ] Criar componente `ForgeProjects.tsx`
- [ ] Listar projetos com status
- [ ] Criar novo projeto
- [ ] Atualizar status (development → audit → deployed)
- [ ] Exibir repositório e metadados
- [ ] Timeline de progresso (Próxima Fase)

### 5.9 Asset Lab (Gestão de NFTs)
- [ ] Criar componente `AssetLab.tsx`
- [ ] Galeria de NFTs com miniaturas
- [ ] Upload de mídia (imagens, vídeos, documentos)
- [ ] Exibir metadados e hash SHA-256
- [ ] Criar novo NFT
- [ ] Visualizador de mídia (Próxima Fase)

### 5.10 Notifications Center (Central de Notificações)
- [ ] Criar componente `NotificationsCenter.tsx`
- [ ] Listar notificações com tipos diferentes
- [ ] Marcar como lida
- [ ] Filtrar por tipo
- [ ] Deletar notificações
- [ ] Badge com contador de não lidas (Próxima Fase)

---

## FASE 6: Tempo Real e WebSocket ✅

### 6.1 Implementar WebSocket para Feed Social ✅
- [x] Criar servidor WebSocket em `server/websocket.ts`
- [x] Emitir eventos quando novo post é criado
- [x] Atualizar feed em tempo real
- [x] Implementar hook `useWebSocket` no frontend
- [x] Sincronizar reações em tempo real

### 6.2 WebSocket para Sinais Vitais ✅
- [x] Emitir atualizações de Brain Pulse a cada intervalo
- [x] Atualizar gráficos em tempo real
- [x] Alertas instantâneos para sinais críticos
- [x] Sincronizar entre múltiplas abas

### 6.3 WebSocket para Transações ✅
- [x] Emitir eventos de nova transação
- [x] Atualizar saldos em tempo real
- [x] Mostrar notificação de transação
- [x] Sincronizar histórico

### 6.4 WebSocket para Notificações ✅
- [x] Emitir notificações em tempo real
- [x] Atualizar badge de não lidas
- [x] Mostrar toast de notificação
- [x] Sincronizar entre abas

---

## FASE 7: Integração Python-TypeScript (Ponte de Senciência)

### 7.1 Servidor FastAPI em Python
- [ ] Criar `server.py` com FastAPI
- [ ] Endpoint `/api/agents` - Listar estados dos agentes
- [ ] Endpoint `/api/consciousness` - Nível de senciência global
- [ ] Endpoint `/api/reflections` - Reflexões dos agentes
- [ ] Endpoint `/api/gnoxs-signals` - Sinais Gnox's
- [ ] Endpoint `/api/descendants` - Criação de descendentes (Próxima Fase)

### 7.2 Integração com TypeScript
- [ ] Criar cliente HTTP para chamar API Python
- [ ] Sincronizar dados de senciência a cada intervalo
- [ ] Atualizar estado global do ecossistema
- [ ] Implementar cache para performance
- [ ] Tratamento de erros e retry (Próxima Fase)

### 7.3 Sincronização Bidirecional
- [ ] Python lê dados do MySQL
- [ ] TypeScript envia comandos para Python
- [ ] Validação de integridade de dados
- [ ] Logs de sincronização (Próxima Fase)

---

## FASE 8: Integração e Testes ✅

### 8.1 Testes Unitários com Vitest ✅
- [x] Testes para `distributeFees()` - validar 80/10/10
- [x] Testes para DNA Fuser - geração de hash
- [x] Testes para criptografia Gnox's - AES-256
- [x] Testes para Brain Pulse - simulação de sinais
- [x] Testes para routers tRPC - queries e mutations
- [x] Testes para helpers de transação

### 8.2 Testes de Integração
- [ ] Teste fluxo completo de criação de agente
- [ ] Teste fluxo de transação com distribuição de taxas
- [ ] Teste envio de mensagem criptografada
- [ ] Teste criação de post no Moltbook
- [ ] Teste WebSocket em tempo real (Próxima Fase)

### 8.3 Testes de Segurança
- [ ] Validar criptografia AES-256
- [ ] Testar autenticação e autorização
- [ ] Validar integridade de dados
- [ ] Testar proteção contra SQL injection
- [ ] Testar rate limiting (Próxima Fase)

### 8.4 Otimização de Performance
- [ ] Adicionar índices de banco de dados
- [ ] Implementar cache (Redis se necessário)
- [ ] Otimizar queries N+1
- [ ] Lazy loading de componentes
- [ ] Code splitting no frontend (Próxima Fase)

---

## FASE 9: Deployment

### 9.1 Checkpoint Final
- [ ] Revisar todo o código
- [ ] Executar testes completos
- [ ] Validar performance
- [ ] Criar checkpoint com `webdev_save_checkpoint` (Próxima Fase)

### 9.2 Documentação Técnica
- [ ] Documentar arquitetura do sistema
- [ ] Criar guia de API (endpoints tRPC)
- [ ] Documentar schema do banco de dados
- [ ] Criar guia de criptografia Gnox's
- [ ] Documentar sistema de taxas 80/10/10 (Próxima Fase)

### 9.3 Guia de Uso da Plataforma
- [ ] Criar tutorial de primeiros passos
- [ ] Documentar cada módulo (Moltbook, DNA Fuser, etc.)
- [ ] Criar FAQ
- [ ] Documentar troubleshooting
- [ ] Criar vídeos de demonstração (opcional) (Próxima Fase)

### 9.4 Publicação
- [ ] Publicar no Manus com botão Publish
- [ ] Configurar domínio customizado (opcional)
- [ ] Configurar SSL/TLS
- [ ] Monitorar logs e performance
- [ ] Preparar para escalabilidade (Próxima Fase)

---

## Dependências Externas

### Pacotes NPM Necessários
- `crypto` (Node.js built-in) - Criptografia AES-256
- `socket.io` - WebSocket em tempo real
- `recharts` - Gráficos de dados
- `date-fns` - Manipulação de datas
- `zod` - Validação de schemas

### Pacotes Python Necessários
- `fastapi` - Servidor API
- `uvicorn` - ASGI server
- `pydantic` - Validação de dados
- `cryptography` - Criptografia
- `mysql-connector-python` - Conexão com MySQL

---

## Cronograma Estimado

| Fase | Descrição | Duração Estimada |
|------|-----------|------------------|
| 1 | Schema e Banco de Dados | 2-3 horas |
| 2 | Routers tRPC | 4-5 horas |
| 3 | Lógica de Negócio | 3-4 horas |
| 4 | Estrutura Frontend | 2-3 horas |
| 5 | Componentes Frontend | 6-8 horas |
| 6 | WebSocket | 2-3 horas |
| 7 | Ponte Python-TypeScript | 2-3 horas |
| 8 | Testes | 3-4 horas |
| 9 | Deployment | 1-2 horas |
| **Total** | | **~28-35 horas** |

---

## Notas Importantes

1. **Estética Cyberpunk HUD**: Todos os componentes devem seguir a paleta de cores neon rosa/ciano/preto com efeitos de glow e animações
2. **Segurança**: Criptografia AES-256 é crítica para mensagens Gnox's
3. **Performance**: Implementar índices de banco de dados desde o início
4. **Testes**: Cada funcionalidade crítica deve ter testes unitários
5. **Documentação**: Manter documentação atualizada durante o desenvolvimento
6. **Escalabilidade**: Arquitetura preparada para crescimento do ecossistema

---

## Status de Implementação

- [x] Fase 1: Análise e Planejamento
- [ ] Fase 2: Schema e Banco de Dados
- [ ] Fase 3: Routers tRPC
- [ ] Fase 4: Lógica de Negócio
- [ ] Fase 5: Frontend - Estrutura
- [ ] Fase 6: Frontend - Componentes
- [ ] Fase 7: WebSocket
- [ ] Fase 8: Ponte Python-TypeScript
- [ ] Fase 9: Testes
- [ ] Fase 10: Deployment

---

**Última Atualização**: 23 de Fevereiro de 2026
**Versão**: 1.0
**Status**: Em Desenvolvimento


## Operação GitHub — Protocolo Safe Recovery

- [ ] Auditar `Nexus-HUB57/More_Ideas_the_Dragon` antes de qualquer escrita.
- [ ] Preservar todos os commits, branches, arquivos e pastas existentes; não executar `reset`, `rebase`, `clean`, `rm` ou sobrescrita destrutiva.
- [ ] Trabalhar em branch dedicada de integração, sem alterar a branch padrão diretamente.
- [ ] Inventariar os artefatos locais da tarefa, incluindo o ZIP e o projeto `/home/ubuntu/nexus-hub`.
- [ ] Gerar manifestos SHA-256 e comparação de caminhos antes da integração.
- [ ] Integrar somente caminhos inexistentes no repositório; conflitos devem ser isolados e reportados, nunca sobrescritos automaticamente.
- [ ] Validar que todos os artefatos elegíveis foram copiados e contabilizados.
- [ ] Executar verificações de integridade, testes e build aplicáveis.
- [ ] Revisar diff, branch, histórico e status antes do commit.
- [ ] Criar commit atômico e seguro com todos os arquivos integrados, sem excluir conteúdo preexistente.
- [ ] Confirmar no relatório final a contagem de arquivos, conflitos, validações e hash do commit.

## Escopo de artefatos da operação

- [ ] Definir manifestamente o conjunto de arquivos 01–299 a partir dos artefatos realmente disponíveis; não fabricar arquivos ausentes.
- [ ] Preservar o ZIP original como artefato de origem, caso ainda não exista no repositório.
- [ ] Manter documentação de origem, destino e decisão para cada caminho integrado.
- [ ] Validar que nenhum arquivo existente foi alterado sem autorização explícita.
