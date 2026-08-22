# Jhon Riff's - Sistema de Multinível | TODO

## Fase 1: Análise e Planejamento ✅
- [x] Análise da documentação do projeto
- [x] Compreensão da estrutura de Marketing Multinível (Unilevel)
- [x] Identificação dos requisitos técnicos
- [x] Planejamento da arquitetura full-stack

## Fase 2: Configuração do Banco de Dados

### Schema e Migrações
- [x] Copiar schema.ts fornecido para o projeto
- [x] Executar `pnpm db:push` para criar as tabelas
- [x] Validar criação de todas as tabelas no banco de dados
- [ ] Criar seed data para níveis de carreira (7 níveis)

### Tabelas Principais
- [x] users (autenticação - já existe)
- [x] affiliates (membros/afiliados)
- [x] network (rede de indicações)
- [x] payments (receitas/pagamentos)
- [x] commissions (comissões calculadas)
- [x] accounts (contas virtuais - JR Bank)
- [x] lotteryTickets (números da sorte - +Sorte)
- [x] careerLevels (configuração dos 7 níveis)

## Fase 3: Lógica Central de Negócios

### Helpers de Banco de Dados (server/db.ts)
- [x] `getAffiliateByUserId(userId)` - Buscar afiliado por usuário
- [x] `getAffiliateById(affiliateId)` - Buscar afiliado por ID
- [x] `getNetworkDownline(affiliateId, levels)` - Obter rede de indicações
- [x] `calculateUnilevelCommissions(paymentId, amount)` - Calcular comissões Unilevel
- [x] `getAccountBalance(affiliateId)` - Obter saldo da conta virtual
- [x] `createPaymentRecord(data)` - Criar registro de pagamento
- [x] `confirmPaymentAndCommission(paymentId)` - Confirmar pagamento e calcular comissões

### Procedures tRPC (Backend - server/routers.ts)
- [x] `affiliates.register` - Cadastro de novo afiliado
- [x] `affiliates.getProfile` - Perfil do afiliado
- [x] `affiliates.updateProfile` - Atualizar perfil
- [x] `affiliates.getCareerLevel` - Obter nível de carreira atual
- [x] `network.getDownline` - Rede de indicações (getMyDownline)
- [x] `network.getUpline` - Cadeia de patrocinadores (getMyUpline)
- [x] `payments.insertReceipt` - Inserir receita
- [x] `payments.identifyReceipt` - Identificar receita
- [x] `payments.confirmPayment` - Confirmar pagamento e calcular comissões
- [x] `payments.listPayments` - Listar pagamentos
- [x] `commissions.calculateUnilevel` - Cálculo Unilevel (integrado em payments)
- [x] `commissions.getCommissions` - Listar comissões
- [x] `commissions.getPendingCommissions` - Comissões pendentes
- [x] `accounts.getBalance` - Saldo da conta virtual
- [x] `accounts.getAccountHistory` - Histórico de movimentações
- [ ] `lottery.generateTickets` - Gerar números da sorte
- [ ] `lottery.getTickets` - Listar números da sorte
- [x] `careerLevels.getAll` - Listar todos os níveis de carreira

## Fase 4: Back Office (Admin Dashboard)

### Layout e Navegação
- [x] Criar DashboardLayout para admin
- [x] Implementar sidebar navigation com menu principal
- [x] Criar header com informações do admin e logout

### Páginas do Admin
- [x] Dashboard principal (estatísticas, gráficos, KPIs)
- [ ] Gerenciamento de afiliados (CRUD - Create, Read, Update, Delete)
- [ ] Visualização da rede (árvore de indicações)
- [ ] Gerenciamento de pagamentos (inserir, identificar, conferir)
- [x] Visualização de comissões (pendentes, pagas)
- [ ] Gerenciamento de níveis de carreira
- [ ] Gerenciamento de e-books/infoprodutos
- [ ] Configurações do sistema

### Componentes Admin
- [x] Tabela de afiliados com filtros e paginação
- [ ] Formulário de cadastro de afiliado
- [ ] Visualizador de árvore de rede
- [x] Tabela de pagamentos com status
- [ ] Formulário de inserção de receita
- [x] Tabela de comissões com status
- [x] Gráficos de estatísticas (faturamento, afiliados, comissões)

## Fase 5: Painel do Afiliado (User Dashboard)

### Layout e Navegação
- [x] Criar layout do painel do afiliado
- [x] Implementar sidebar com menu de usuário
- [x] Criar header com informações do afiliado

### Páginas do Afiliado
- [x] Dashboard pessoal (comissões, saldo, indicados)
- [x] Conta Virtual (JR Bank) - visualizar saldo e histórico
- [x] Indicados Ativos/Inativos - listar rede direta
- [ ] Efetuar Pagamento - formulário de pagamento
- [ ] Recibos - visualizar histórico de pagamentos
- [ ] Divulgação (banners, links, e-mail marketing)
- [ ] Suporte e Material Complementar
- [ ] Perfil do Afiliado (editar dados)

### Componentes do Afiliado
- [x] Card de saldo da conta virtual
- [x] Card de comissões pendentes
- [x] Tabela de indicados
- [ ] Gráfico de evolução de comissões
- [ ] Formulário de pagamento
- [ ] Visualizador de recibos
- [x] Gerador de links de afiliação

## Fase 6: Integração com IA Llama 4 Maverick

### Assistente de IA
- [x] Integrar Llama 4 Maverick para análise de dados
- [x] Criar endpoint para recomendações de estratégia de vendas
- [x] Implementar chatbot de suporte ao afiliado
- [x] Análise preditiva de comissões e ganhos

### Recursos de IA
- [x] Geração de conteúdo de marketing personalizado
- [x] Análise de performance da rede
- [x] Recomendações de crescimento
- [x] Previsão de ganhos

## Fase 7: Testes e Otimização

### Testes
- [ ] Testes unitários para lógica de comissões Unilevel
- [ ] Testes de integração para fluxo de pagamento
- [ ] Testes de autenticação e autorização
- [ ] Testes de performance do banco de dados

### Otimização
- [ ] Otimizar queries de rede (índices no banco)
- [ ] Cache de dados frequentemente acessados
- [ ] Otimização de imagens e assets
- [ ] Análise de performance do frontend

### Segurança
- [ ] Validação de entrada em todos os endpoints
- [ ] Proteção contra SQL injection
- [ ] Rate limiting para APIs
- [ ] Criptografia de dados sensíveis

## Fase 8: Apresentação e Deploy

- [ ] Criar checkpoint do projeto
- [ ] Documentação final do sistema
- [ ] Guia de uso para admin e afiliados
- [ ] Apresentação ao Mestre Lucas Thomaz
- [ ] Deploy em produção

---

## Bugs e Melhorias Reportados

(Nenhum até o momento)

---

## Notas Importantes

- **Modelo de Negócio:** Marketing Multinível (Unilevel) com 7 níveis de carreira
- **Comissões:** 10% (direto), 5% (2º nível), 2,5% (3º nível), 2,5% (4º nível+)
- **Plataformas:** +Sorte (sorteios), JR Bank (contas virtuais), JR Business Academy (treinamentos)
- **Integração IA:** Llama 4 Maverick para análise e recomendações
- **Stack:** Node.js + React + MySQL + tRPC + Tailwind CSS

## Fase de Sincronização Segura com GitHub
- [ ] Inventariar todos os arquivos, diretórios, scripts, documentos e arquivos compactados disponíveis no projeto restaurado
- [ ] Clonar e auditar `Nexus-HUB57/More_Ideas_the_Dragon` sem alterar o repositório remoto
- [ ] Revisar branches, commits recentes, arquivos rastreados e estado de trabalho do repositório
- [ ] Comparar os artefatos locais com o conteúdo do repositório, preservando arquivos e pastas existentes
- [ ] Resolver conflitos exclusivamente por adição de nomes únicos ou cópias versionadas, sem sobrescrever ou excluir
- [ ] Criar inventário e manifesto de integridade dos artefatos sincronizados
- [ ] Validar tipos, testes, build e integridade do pacote ZIP sem executar conteúdo não confiável
- [ ] Criar branch de sincronização segura e commit rastreável
- [ ] Revisar o commit, a branch e a árvore final no GitHub
- [ ] Documentar limitações, conflitos preservados e próximos passos
- [ ] Corrigir e validar a dependência `decimal.js` usada pelos helpers de comissão
- [ ] Reexportar a correção validada no snapshot seguro do GitHub
