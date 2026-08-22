# Jhon Riff's - Sistema de Multinível | TODO

## Fase 4: Lógica Central do Sistema Multinível

### Banco de Dados (Schema)
- [ ] Criar tabela `affiliates` (membros/afiliados)
- [ ] Criar tabela `network` (rede de indicações)
- [ ] Criar tabela `payments` (pagamentos)
- [ ] Criar tabela `commissions` (comissões)
- [ ] Criar tabela `accounts` (contas virtuais - JR Bank)
- [ ] Criar tabela `lottery_tickets` (números da sorte - +Sorte)
- [ ] Criar tabela `career_levels` (níveis de carreira)
- [ ] Executar migrações: `pnpm db:push`

### Procedures tRPC (Backend)
- [ ] Implementar `affiliates.register` (cadastro de novo afiliado)
- [ ] Implementar `affiliates.getProfile` (perfil do afiliado)
- [ ] Implementar `network.getDownline` (rede de indicações)
- [ ] Implementar `payments.insertReceipt` (inserir receita)
- [ ] Implementar `payments.identifyReceipt` (identificar receita)
- [ ] Implementar `payments.confirmPayment` (confirmar pagamento e calcular comissões)
- [ ] Implementar `commissions.calculateUnilevel` (cálculo Unilevel)
- [ ] Implementar `commissions.getCommissions` (listar comissões)
- [ ] Implementar `accounts.getBalance` (saldo da conta virtual)
- [ ] Implementar `lottery.generateTickets` (gerar números da sorte)
- [ ] Implementar `lottery.getTickets` (listar números da sorte)

### Helpers de Banco de Dados (server/db.ts)
- [ ] `getAffiliateByUserId(userId)`
- [ ] `getAffiliateById(affiliateId)`
- [ ] `getNetworkDownline(affiliateId, levels)`
- [ ] `calculateUnilevelCommissions(paymentId, amount)`
- [ ] `getAccountBalance(affiliateId)`
- [ ] `createPaymentRecord(data)`
- [ ] `confirmPaymentAndCommission(paymentId)`

## Fase 5: Interface de Usuário (Frontend)

### Back Office (Admin)
- [ ] Dashboard principal (estatísticas, gráficos)
- [ ] Gerenciamento de afiliados (CRUD)
- [ ] Visualização da rede (árvore de indicações)
- [ ] Gerenciamento de pagamentos (inserir, identificar, conferir)
- [ ] Visualização de comissões
- [ ] Gerenciamento de níveis de carreira
- [ ] Gerenciamento de e-books/infoprodutos
- [ ] Configurações do sistema

### Painel do Afiliado (User)
- [ ] Dashboard pessoal (comissões, saldo, indicados)
- [ ] Conta Virtual (JR Bank) - visualizar saldo
- [ ] Indicados Ativos/Inativos
- [ ] Efetuar Pagamento
- [ ] Recibos
- [ ] Divulgação (banners, links, e-mail marketing)
- [ ] Suporte e Material Complementar

### Sistema de Sorteios (+Sorte)
- [ ] Visualização de números da sorte
- [ ] Histórico de sorteios
- [ ] Prêmios disponíveis
- [ ] Integração com Loteria Federal

## Fase 6: Apresentação e Deploy

- [ ] Criar checkpoint do projeto
- [ ] Documentação final
- [ ] Apresentação ao Mestre Lucas Thomaz

---

## Bugs e Melhorias Reportados

(Nenhum até o momento)
