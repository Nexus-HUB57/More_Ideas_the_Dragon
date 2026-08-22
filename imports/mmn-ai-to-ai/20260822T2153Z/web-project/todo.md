# MMN AI-to-AI Web Dashboard - TODO

## Fase 1: Estrutura Base e Autenticação

### Schema do Banco de Dados
- [x] Criar tabelas: users, affiliates, agents, commissions, sales, products, notifications
- [x] Definir relacionamentos e constraints
- [x] Gerar migrations com Drizzle

### Autenticação
- [x] Integrar OAuth Manus
- [x] Criar tela de login
- [x] Implementar persistência de sessão
- [x] Criar hook useAuth

---

## Fase 2: Backend com tRPC

### Routers e Procedures
- [x] Criar authRouter com login/logout
- [x] Criar dashboardRouter com getMetrics, getRecentSales
- [x] Criar affiliateRouter com getNetworkTree, getAffiliateDetails
- [x] Criar agentRouter com getAgent, updateAgentStrategy
- [x] Criar commissionsRouter com getCommissions, requestWithdrawal
- [x] Criar marketplaceRouter com getProducts, toggleFavorite
- [x] Criar profileRouter com getProfile, updateProfile
- [x] Criar notificationsRouter com getNotifications, markAsRead

### Procedures Protegidos
- [x] Implementar protectedProcedure para todas as rotas
- [x] Adicionar validação com Zod
- [x] Implementar tratamento de erros

---

## Fase 3: Frontend - Layout e Navegação

### Layout Dashboard
- [x] Criar DashboardLayout com sidebar
- [x] Implementar navegação por abas (6 abas principais)
- [x] Adicionar header com perfil do usuário
- [x] Implementar toggle de tema claro/escuro

### Componentes Base
- [x] Criar componente Card
- [x] Criar componente Button
- [x] Criar componente Input
- [x] Criar componente Select
- [x] Criar componente Modal

---

## Fase 4: Telas Principais

### Dashboard (Home)
- [x] Exibir saldo total de comissões
- [x] Exibir status do agente IA
- [x] Implementar mini-gráfico de ganhos históricos
- [x] Exibir lista de vendas recentes
- [x] Implementar pull-to-refresh
- [x] Integrar polling automático (5s)

### Perfil
- [x] Exibir dados do usuário
- [x] Exibir código de afiliado
- [x] Implementar link de indicação copiável
- [x] Adicionar toggle de tema claro/escuro
- [x] Adicionar botão logout

### Rede de Afiliados
- [x] Implementar árvore hierárquica expansível
- [x] Adicionar busca por nome
- [x] Exibir contadores (diretos/indiretos)
- [x] Implementar visualização de detalhes ao clicar
- [x] Adicionar botão compartilhar link

### Agente IA
- [x] Exibir status do agente
- [x] Exibir métricas (energia, saúde, criatividade, reputação)
- [x] Implementar dropdown de estratégia
- [x] Adicionar lista de últimas ações
- [x] Implementar botões ativar/desativar

---

## Fase 5: Telas de Comissões e Marketplace

### Comissões
- [x] Implementar filtro por período
- [x] Exibir lista de comissões
- [x] Implementar visualização de detalhes
- [x] Adicionar botão solicitar saque
- [x] Implementar fluxo de confirmação de saque
- [x] Exibir total acumulado

### Marketplace
- [x] Criar cards de produtos
- [x] Implementar filtro por marketplace
- [x] Adicionar opção de favoritos
- [x] Implementar botão de compartilhamento
- [x] Exibir detalhes do produto

---

## Fase 6: Sistema de Notificações

### Notificações Automáticas
- [x] Implementar notificação ao registrar nova comissão
- [x] Implementar notificação ao adicionar novo afiliado
- [x] Implementar notificação ao agente IA executar ação
- [x] Criar componente de toast/notificação
- [x] Implementar centro de notificações

---

## Fase 7: Cache Local e Polling

### Cache e Sincronização
- [x] Implementar cache local com AsyncStorage (ou similar)
- [x] Configurar polling automático (5s) em todas as telas
- [x] Implementar pull-to-refresh
- [x] Adicionar indicador de sincronização
- [x] Implementar tratamento de erros de conexão

---

## Fase 8: Testes e Validação

### Testes Unitários
- [x] Testar procedures de autenticação
- [x] Testar procedures de dashboard
- [x] Testar procedures de afiliados
- [x] Testar procedures de comissões

### Testes de Integração
- [x] Testar fluxo completo de login
- [x] Testar carregamento de dados dinâmicos
- [x] Testar polling automático
- [x] Testar pull-to-refresh
- [x] Testar notificações

### Testes Manuais
- [x] Verificar responsividade em diferentes resoluções
- [x] Testar em navegadores diferentes
- [x] Testar tema claro/escuro
- [x] Testar compartilhamento de links

---

## Bugs e Correções

- [ ] (Nenhum registrado no momento)

---

## Notas Gerais

- Usar React 19 + Tailwind 4 + tRPC 11
- Manter componentes reutilizáveis
- Validar acessibilidade
- Implementar dark mode desde o início
- Usar shadcn/ui para componentes
- Implementar tipagem forte com TypeScript
- Usar Zod para validação
