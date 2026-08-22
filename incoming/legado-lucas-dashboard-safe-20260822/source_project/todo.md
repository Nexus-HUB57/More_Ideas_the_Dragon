# Legado Lucas Dashboard - TODO

## Fase 1: Configuração e Banco de Dados
- [x] Definir esquema de dados (drizzle/schema.ts)
  - [x] Tabela de Usuários (já existe)
  - [x] Tabela de Dados Financeiros (KPIs por ano)
  - [x] Tabela de Fundos (FP, FS, FIQ, Endowment)
  - [x] Tabela de Endereços Bitcoin (Gênesis e Cerberus)
  - [x] Tabela de Chaves Privadas (criptografadas)
  - [x] Tabela de Transações Bitcoin
  - [x] Tabela de Alertas e Eventos de Segurança
  - [x] Tabela de Limites Diários (Guardian Protocol)
- [x] Executar migrações de banco de dados (pnpm db:push)
- [x] Adicionar helpers de banco de dados em server/db.ts
- [x] Adicionar procedimentos tRPC em server/routers.ts

## Fase 2: Módulo de Gestão Financeira
- [x] Criar página de Dashboard Financeiro (Home.tsx)
- [x] Implementar visualização de KPIs (Patrimônio Líquido, Lucro Anual, Crescimento PL%, VM, VI, P/B)
- [x] Criar gráficos de evolução ao longo de 11 anos (Ano 0 ao Ano 10) - FinancialDashboard.tsx
- [ ] Implementar Painel de Alocação de Fundos (FP, FS, FIQ, Endowment)
- [ ] Criar visualização de política de alocação híbrida (70% FIQ / 30% FS)
- [x] Implementar procedimentos tRPC para obter dados financeiros (server/routers.ts)

## Fase 3: Módulo Carteira Bitcoin - Gênesis (Hot Wallet)
- [x] Criar página de Carteira Gênesis (client/src/pages/GenesisWallet.tsx)
- [x] Implementar gerenciamento de endereços ativos
- [x] Criar visualização de saldos em tempo real (via UTXO queries)
- [ ] Implementar integração com Blockchair API para consulta de UTXOs
- [ ] Criar formulário para envio de Bitcoin
- [ ] Implementar seleção inteligente de UTXOs
- [ ] Adicionar cálculo automático de taxas de mineração
- [ ] Implementar construção de transações PSBT
- [x] Criar procedimentos tRPC para operações Gênesis

## Fase 4: Módulo Carteira Bitcoin - Cerberus (Cold Storage)
- [x] Criar página de Carteira Cerberus (client/src/pages/CerberusWallet.tsx)
- [ ] Implementar geração segura de Master Key (BIP39/BIP32)
- [ ] Criar derivação de endereços de vault
- [ ] Implementar armazenamento criptografado de chaves privadas
- [ ] Adicionar suporte à passphrase por secret manager (valor não versionado)
- [ ] Criar sistema de backup seguro de Mnemônico
- [ ] Implementar importação de carteiras (wallet.dat, .txt)
- [x] Criar procedimentos tRPC para operações Cerberus

## Fase 5: Sistema de Transações Bitcoin
- [ ] Implementar seleção inteligente de UTXOs (server/services/utxoService.ts)
- [ ] Criar cálculo automático de taxas (server/services/feeCalculator.ts)
- [ ] Implementar construção de PSBT (server/services/psbtBuilder.ts)
- [ ] Implementar assinatura de transações (server/services/transactionSigner.ts)
- [ ] Criar broadcast com fallback (Blockchair, mempool.space, Blockstream.info)
- [ ] Implementar tratamento de erros e retry logic
- [x] Criar procedimentos tRPC para envio de transações

## Fase 6: Monitoramento de Transações
- [x] Criar página de Histórico de Transações (client/src/pages/TransactionsHistory.tsx)
- [x] Implementar rastreamento de status de transações
- [x] Criar contagem de confirmações
- [ ] Implementar atualização em tempo real de status
- [x] Criar visualização de histórico completo de movimentações
- [ ] Implementar job de background para atualizar confirmações
- [x] Criar procedimentos tRPC para obter histórico

## Fase 7: Dashboard de Segurança
- [x] Criar página de Dashboard de Segurança (client/src/pages/SecurityDashboard.tsx)
- [x] Implementar visualização de limites diários (Guardian Protocol)
- [x] Criar alertas de segurança
- [ ] Implementar validação TSRA (mainnet-only)
- [ ] Criar visualização de tentativas de acesso
- [ ] Implementar log de operações críticas
- [x] Criar procedimentos tRPC para dados de segurança

## Fase 8: Sistema de Autenticação e Controle de Acesso
- [ ] Integrar Manus OAuth (já configurado no template)
- [ ] Implementar controle de acesso baseado em roles (admin/user)
- [ ] Criar proteção de rotas sensíveis (Cerberus, transações)
- [ ] Implementar verificação de permissões em procedimentos tRPC
- [ ] Criar página de login (se necessário)
- [ ] Implementar logout seguro

## Fase 9: Sistema de Alertas Automáticos
- [ ] Implementar alertas quando transações Bitcoin excederem limites
- [ ] Criar alertas de tentativas de acesso não autorizado
- [ ] Implementar alertas de operações críticas (Cerberus->Gênesis, alterações Master Key)
- [ ] Integrar notifyOwner para enviar alertas ao proprietário
- [ ] Criar página de Notificações (client/src/pages/Notifications.tsx)
- [ ] Implementar persistência de alertas no banco de dados

## Fase 10: Sistema de Insights e Recomendações Estratégicas
- [ ] Criar página de Insights (client/src/pages/Insights.tsx)
- [ ] Implementar análise de performance histórica (11 anos)
- [ ] Criar recomendações de alocação de fundos
- [ ] Implementar sugestões de otimização de portfolio
- [ ] Integrar LLM para gerar insights inteligentes
- [ ] Criar procedimentos tRPC para obter insights

## Fase 11: Design Visual e Refinamentos
- [x] Definir paleta de cores elegante e perfeita (tema dark com ouro e laranja)
- [x] Implementar tema visual consistente (dark)
- [x] Criar DashboardLayout com navegação lateral
- [x] Implementar layout responsivo
- [ ] Adicionar animações e transições suaves
- [ ] Refinar tipografia e espaçamento
- [ ] Testar acessibilidade
- [ ] Otimizar performance

## Fase 12: Testes e Validação
- [ ] Escrever testes unitários (vitest)
- [ ] Testar fluxos de autenticação
- [ ] Testar operações de carteira Bitcoin
- [ ] Testar cálculos financeiros
- [ ] Testar alertas e notificações
- [ ] Realizar testes de segurança
- [ ] Validar em mainnet (com valores pequenos)

## Fase 13: Entrega e Documentação
- [ ] Criar documentação de uso
- [ ] Criar guia de segurança
- [ ] Preparar checkpoint final
- [ ] Apresentar ao Mestre Lucas Thomaz

## Operação de Integração Segura no GitHub
- [ ] Auditar Nexus-HUB57/More_Ideas_the_Dragon, branches, histórico e estado de trabalho sem alterações destrutivas
- [ ] Inventariar todos os arquivos e artefatos desta tarefa, incluindo documentos, scripts e Documentos.zip
- [ ] Criar área de integração aditiva e manifesto de proveniência, sem sobrescrever caminhos existentes
- [ ] Copiar todos os arquivos e artefatos preservando conteúdo, registrar colisões e calcular hashes
- [ ] Validar integridade end to end, contagens, ZIP e diffs
- [ ] Criar commit completo em branch segura e entregar a referência para revisão/merge
- [ ] Corrigir pendências de TypeScript existentes sem alterar conteúdo de outros desenvolvedores
- [ ] Não incluir segredos, seeds, chaves privadas ou passphrases em commits e artefatos públicos
