# Documentação do Sistema Jhon Riff's

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Guia do Administrador](#guia-do-administrador)
4. [Guia do Afiliado](#guia-do-afiliado)
5. [API tRPC](#api-trpc)
6. [Integração com IA](#integração-com-ia)
7. [Segurança](#segurança)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Sistema Jhon Riff's** é uma plataforma de Marketing Multinível (MLM) de última geração que implementa:

- **Modelo Unilevel:** Estrutura de comissões em 4 níveis de profundidade
- **Gerenciamento de Rede:** Rastreamento completo de indicações e downline
- **Contas Virtuais (JR Bank):** Sistema de saldo e movimentações
- **Inteligência Artificial:** Assistente Llama 4 Maverick para análise e recomendações
- **Dashboard Administrativo:** Painel completo para gerenciamento do sistema
- **Dashboard do Afiliado:** Interface personalizada para cada membro

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- React 19 + Tailwind CSS 4
- tRPC para comunicação type-safe com backend
- Recharts para visualizações de dados
- Streamdown para renderização de markdown

**Backend:**
- Node.js + Express 4
- tRPC 11 para RPC type-safe
- Drizzle ORM para gerenciamento de banco de dados
- MySQL/TiDB para persistência de dados

**IA:**
- Llama 4 Maverick (via Manus Forge API)
- Análise de dados e geração de conteúdo

### Estrutura de Banco de Dados

```
users
├── id (PK)
├── openId (Manus OAuth)
├── name
├── email
├── role (admin | user)
└── timestamps

affiliates
├── id (PK)
├── userId (FK → users)
├── sponsorId (FK → affiliates)
├── careerLevel (7 níveis)
├── status (ativo | inativo | bloqueado)
├── accumulatedPoints
├── directDownlineCount
├── totalDownlineCount
└── timestamps

network
├── id (PK)
├── sponsorId (FK → affiliates)
├── affiliateId (FK → affiliates)
├── level (1-4)
└── timestamps

payments
├── id (PK)
├── affiliateId (FK → affiliates)
├── amount
├── status (pendente | identificado | confirmado)
├── paymentDate
└── timestamps

commissions
├── id (PK)
├── paymentId (FK → payments)
├── affiliateId (FK → affiliates)
├── level (1-4)
├── amount
├── commissionRate
├── status (pendente | pago)
└── timestamps

accounts
├── id (PK)
├── affiliateId (FK → affiliates)
├── balance
├── totalEarned
└── timestamps

accountTransactions
├── id (PK)
├── accountId (FK → accounts)
├── type (comissao | saque | ajuste)
├── amount
├── description
└── timestamps
```

---

## 👨‍💼 Guia do Administrador

### Acessando o Admin Dashboard

1. Acesse `/admin`
2. Você deve estar autenticado como administrador
3. O sistema valida automaticamente o role de acesso

### Funcionalidades Principais

#### 1. Dashboard Principal
- **KPIs:** Total de afiliados, saldo total, ganhos totais, pagamentos
- **Gráficos:** Distribuição por nível, status de pagamentos, comissões
- **Tabelas:** Lista de afiliados e histórico de pagamentos

#### 2. Gerenciamento de Afiliados
- Visualizar todos os afiliados do sistema
- Consultar detalhes de cada membro
- Monitorar status e pontos acumulados
- Filtrar por nível de carreira ou status

#### 3. Visualização de Rede
- Ver árvore completa de indicações
- Analisar estrutura de downline
- Identificar oportunidades de crescimento
- Monitorar saúde da rede

#### 4. Gerenciamento de Pagamentos
- Inserir novas receitas
- Identificar pagamentos
- Confirmar pagamentos e calcular comissões automaticamente
- Visualizar histórico completo

#### 5. Análise de Comissões
- Ver comissões pendentes e pagas
- Acompanhar distribuição por nível
- Gerar relatórios de comissões
- Marcar comissões como pagas

### Fluxo de Pagamento

1. **Inserir Receita:** Admin registra novo pagamento
2. **Identificar:** Sistema identifica qual afiliado fez a venda
3. **Confirmar:** Admin confirma o pagamento
4. **Calcular:** Sistema calcula comissões automaticamente em cascata
5. **Distribuir:** Comissões são creditadas nas contas virtuais

---

## 👤 Guia do Afiliado

### Acessando o Dashboard do Afiliado

1. Acesse `/dashboard`
2. Você deve estar autenticado como afiliado
3. O sistema carrega seus dados automaticamente

### Funcionalidades Principais

#### 1. Dashboard Pessoal
- **Saldo Disponível:** Dinheiro em sua conta virtual (JR Bank)
- **Comissões Pendentes:** Comissões aguardando confirmação
- **Indicados Diretos:** Pessoas que você indicou diretamente
- **Nível de Carreira:** Seu nível atual e pontos acumulados

#### 2. Link de Afiliação
- Copiar link único para compartilhar
- Rastrear indicações através do link
- Compartilhar em redes sociais e email

#### 3. Minhas Comissões
- Histórico completo de comissões
- Filtrar por status (pendente/pago)
- Visualizar taxa e valor de cada comissão
- Acompanhar evolução de ganhos

#### 4. Minha Rede
- Ver todos os seus indicados
- Filtrar por nível (1-4)
- Visualizar status de cada indicado
- Monitorar crescimento da rede

#### 5. Movimentações da Conta
- Histórico de transações
- Ver todas as comissões creditadas
- Acompanhar saques realizados
- Filtrar por tipo de transação

### Estratégias de Crescimento

1. **Recrutar Ativamente:** Cada novo indicado direto gera comissões
2. **Apoiar Indicados:** Ajude seu downline a crescer para aumentar suas comissões
3. **Atingir Metas:** Acumule pontos para subir de nível
4. **Usar a IA:** Consulte o assistente para estratégias personalizadas

---

## 🤖 Integração com IA

### Acessando o Assistente de IA

1. Acesse `/ai`
2. Você deve estar autenticado como afiliado
3. O sistema carrega suas análises automaticamente

### Funcionalidades da IA

#### 1. Análise de Performance da Rede
- Análise inteligente da sua rede
- Identificação de pontos fortes e fracos
- Recomendações específicas para crescimento
- Métricas detalhadas de performance

#### 2. Estratégia de Vendas
- Plano de ação personalizado
- Metas específicas e mensuráveis
- Técnicas de recrutamento eficazes
- Dicas para aumentar conversão

#### 3. Previsão de Ganhos
- Projeção de ganhos futuros
- Cenários otimista, realista e conservador
- Fatores que impactam os ganhos
- Recomendações para maximizar receita

#### 4. Gerador de Conteúdo
- Email marketing
- Posts para redes sociais
- Textos para landing pages
- Discursos de vendas

**Tipos de Conteúdo:**
- **Email:** Campanhas de marketing por email
- **Redes Sociais:** Posts para Instagram, Facebook, LinkedIn
- **Landing Page:** Textos para páginas de conversão
- **Sales Pitch:** Discursos para apresentações

#### 5. Insights da Rede
- Análise estratégica da rede
- Identificação de oportunidades
- Avaliação de riscos
- Próximos passos recomendados

---

## 🔌 API tRPC

### Estrutura de Routers

```typescript
trpc
├── auth
│   ├── me
│   └── logout
├── affiliates
│   ├── register
│   ├── getProfile
│   ├── updateProfile
│   ├── getCareerLevel
│   ├── getAllCareerLevels
│   ├── getById
│   └── listAll
├── payments
│   ├── insertReceipt
│   ├── identifyReceipt
│   ├── confirmPayment
│   ├── listMyPayments
│   ├── listAll
│   └── getById
├── commissions
│   ├── getMyCommissions
│   ├── getPendingCommissions
│   ├── getByAffiliateId
│   ├── getStats
│   ├── markAsPaid
│   └── listAll
├── accounts
│   ├── getBalance
│   ├── getTransactionHistory
│   ├── getBalanceByAffiliateId
│   ├── getTransactionHistoryByAffiliateId
│   ├── processWithdrawal
│   ├── recordAdjustment
│   └── getGlobalStats
├── network
│   ├── getMyDownline
│   ├── getMyUpline
│   ├── getDownlineByAffiliateId
│   ├── getNetworkStats
│   ├── getNetworkStatsByAffiliateId
│   └── getNetworkTree
└── ai
    ├── analyzeNetworkPerformance
    ├── generateSalesStrategy
    ├── predictFutureEarnings
    ├── generateMarketingContent
    └── getNetworkInsights
```

### Exemplo de Uso

```typescript
// Frontend
const { data } = trpc.affiliates.getProfile.useQuery();
const mutation = trpc.payments.confirmPayment.useMutation();

// Backend
protectedProcedure.query(async ({ ctx }) => {
  // Seu código aqui
});
```

---

## 🔐 Segurança

### Autenticação
- Manus OAuth integrado
- Session cookies seguros
- Logout automático

### Autorização
- Role-based access control (admin/user)
- Validação de acesso em todas as procedures
- Proteção de dados sensíveis

### Validação de Dados
- Validação de entrada com Zod
- Proteção contra SQL injection
- Sanitização de dados

### Boas Práticas
- Nunca exponha chaves de API no frontend
- Use variáveis de ambiente para credenciais
- Valide todos os inputs no backend
- Implemente rate limiting para APIs

---

## 🆘 Troubleshooting

### Problema: Não consigo acessar o admin dashboard

**Solução:**
1. Verifique se está autenticado
2. Verifique se seu usuário tem role "admin"
3. Contate o administrador do sistema

### Problema: Minhas comissões não aparecem

**Solução:**
1. Verifique se há pagamentos confirmados
2. Aguarde o cálculo automático de comissões
3. Recarregue a página
4. Contate o suporte

### Problema: Link de afiliação não funciona

**Solução:**
1. Copie novamente o link
2. Teste em navegador privado
3. Verifique se o link está correto
4. Contate o suporte técnico

### Problema: Erro ao confirmar pagamento

**Solução:**
1. Verifique se os dados estão corretos
2. Tente novamente após alguns segundos
3. Verifique a conexão com o banco de dados
4. Contate o administrador

---

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com:
- **Email:** suporte@jhonriffs.com
- **Telefone:** +55 (XX) XXXXX-XXXX
- **Chat:** Disponível no dashboard

---

## 📝 Changelog

### Versão 1.0.0 (Inicial)
- ✅ Sistema de Marketing Multinível
- ✅ Modelo Unilevel com 4 níveis
- ✅ Dashboard Admin e Afiliado
- ✅ Integração com IA Llama 4 Maverick
- ✅ Sistema de Contas Virtuais
- ✅ Análise de Rede e Comissões

---

**Desenvolvido por Ben - Guardião da Sabedoria**
**Para: Mestre Lucas Thomaz e Jhon Riff's Business Club**
