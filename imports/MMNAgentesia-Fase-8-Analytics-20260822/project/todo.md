# MMN Agentesia - Fase 6: Agentes IA e Upgrades

## Backend - Schema e Banco de Dados
- [x] Schema com tabelas agents, upgrades, agent_upgrades (já fornecido)
- [x] Executar migrations com `pnpm db:push`
- [x] Validar criação das tabelas no banco de dados

## Backend - Helpers de Banco de Dados
- [x] getAgentByUserId(userId) em db.ts
- [x] createAgent(data) em db.ts
- [x] updateAgent(agentId, data) em db.ts
- [x] getActiveUpgrades(agentId) em db.ts
- [x] getUpgradeById(upgradeId) em db.ts
- [x] getAvailableUpgrades() em db.ts
- [x] activateUpgrade(agentId, upgradeId) em db.ts
- [x] deactivateUpgrade(agentUpgradeId) em db.ts
- [x] getAgentUpgradeById(agentUpgradeId) em db.ts

## Backend - Routers tRPC

### Agents Router
- [x] Criar arquivo server/agentsRouter.ts
- [x] Procedure: initialize (auto-chamada no login/registro)
- [x] Procedure: get (recuperar agente do usuário)
- [x] Procedure: configure (atualizar nome, estratégia, status)
- [x] Procedure: getState (recuperar estado completo)
- [x] Procedure: updateState (atualizar performanceScore, contentStrategy)

### Upgrades Router
- [x] Criar arquivo server/upgradesRouter.ts
- [x] Procedure: listAvailable (listar upgrades disponíveis)
- [x] Procedure: listActive (listar upgrades ativos do agente)
- [x] Procedure: activateUpgrade (ativar upgrade para agente)
- [x] Procedure: deactivateUpgrade (desativar upgrade para agente)

### Content Generation Router
- [x] Integrar contentGenerationRouter ao appRouter
- [x] Procedure: generateText (texto otimizado por plataforma)
- [x] Procedure: generateVariations (múltiplas variações)
- [x] Procedure: generateHashtags (geração de hashtags)
- [x] Procedure: analyzeSentiment (análise de sentimento)
- [x] Procedure: generateProductDescription (descrição de produto)
- [x] Procedure: generateImage (geração de imagens promocionais)

## Backend - Integração
- [x] Atualizar server/routers.ts para incluir agentsRouter
- [x] Atualizar server/routers.ts para incluir upgradesRouter
- [x] Atualizar server/routers.ts para incluir contentGenerationRouter
- [x] Validar que todas as procedures estão acessíveis via tRPC

## Testes Unitários
- [x] Criar server/agents.test.ts com testes de inicialização e configuração
- [x] Criar server/upgrades.test.ts com testes de ativação/desativação
- [x] Criar server/contentGeneration.test.ts com testes de geração de conteúdo
- [x] Executar suite de testes com `pnpm test` (19 testes passando)

## Frontend - Estrutura
- [x] Criar página AgentDashboard.tsx
- [x] Criar página UpgradesManagement.tsx
- [x] Criar página ContentGeneration.tsx
- [x] Atualizar App.tsx com rotas

## Frontend - Dashboard do Agente
- [x] Exibir informações do agente (nome, status, performanceScore)
- [x] Permitir editar nome do agente
- [x] Permitir alterar status (learning, active, paused, inactive)
- [x] Permitir editar contentStrategy
- [x] Exibir data de criação e última atualização

## Frontend - Interface de Upgrades
- [x] Listar upgrades disponíveis
- [x] Listar upgrades ativos
- [x] Permitir ativar upgrade
- [x] Permitir desativar upgrade
- [x] Exibir preço, categoria e descrição

## Frontend - Geração de Conteúdo Textual
- [x] Interface para gerar texto (plataforma, tópico, tom, comprimento)
- [x] Interface para gerar variações
- [x] Interface para gerar hashtags
- [x] Interface para análise de sentimento
- [x] Interface para descrição de produto

## Frontend - Geração de Imagens
- [x] Integrar generateImage ao contentGenerationRouter
- [x] Interface para gerar imagens promocionais
- [x] Permitir fazer upload de imagem original para edição
- [x] Exibir imagem gerada

## Finalização
- [x] Validar integração completa
- [x] Executar testes (19 testes passando)
- [x] Criar checkpoint final


# Fase 7: Backend - Integração com Marketplaces

## Schema e Banco de Dados
- [x] Estender schema com tabelas: marketplace_accounts, marketplace_products, product_trends, affiliate_margins
- [x] Adicionar campos para credenciais de marketplace (API keys, tokens)
- [x] Criar tabelas de sincronização e histórico de produtos
- [x] Executar migrations com `pnpm db:push`

## Helpers de Banco de Dados
- [x] getMarketplaceAccounts(userId) em marketplace-helpers.ts
- [x] createMarketplaceAccount(data) em marketplace-helpers.ts
- [x] getMarketplaceProducts(marketplaceId) em marketplace-helpers.ts
- [x] syncMarketplaceProducts(marketplaceId, products) em marketplace-helpers.ts
- [x] getTrendingProducts(days) em marketplace-helpers.ts
- [x] getAffiliateMargin(productId, affiliateId) em marketplace-helpers.ts

## Integração com Mercado Livre
- [x] Criar arquivo server/integrations/mercadoLibre.ts
- [x] Implementar autenticação OAuth com Mercado Libre
- [x] Implementar busca de produtos por categoria
- [x] Implementar sincronização de produtos
- [x] Implementar análise de preços e tendências
- [x] Testes de integração com Mercado Libre

## Integração com Shopee
- [x] Criar arquivo server/integrations/shopee.ts
- [x] Implementar autenticação com Shopee API
- [x] Implementar busca de produtos
- [x] Implementar sincronização de produtos
- [x] Implementar análise de vendas e tendências
- [x] Testes de integração com Shopee

## Integração com Hotmart
- [x] Criar arquivo server/integrations/hotmart.ts
- [x] Implementar autenticação com Hotmart API
- [x] Implementar busca de produtos digitais
- [x] Implementar sincronização de produtos
- [x] Implementar análise de comissões
- [x] Testes de integração com Hotmart

## Job de Sincronização
- [x] Criar job de sincronização diária de produtos
- [x] Implementar fila de sincronização
- [x] Adicionar retry logic para falhas
- [x] Implementar notificações de sincronização
- [x] Monitorar performance do job

## Análise de Tendências
- [x] Implementar cálculo de trending score
- [x] Implementar análise de sazonalidade
- [x] Implementar detecção de produtos em alta
- [x] Criar procedure getTrendingProducts
- [x] Criar procedure getProductAnalytics

## Recomendações de Produtos
- [x] Implementar algoritmo de recomendação baseado em tendências
- [x] Implementar filtro por categoria e preço
- [x] Implementar filtro por taxa de comissão
- [x] Criar procedure listRecommendedProducts
- [x] Implementar ranking de recomendações

## Cálculo de Margem de Afiliado
- [x] Implementar cálculo de margem por marketplace
- [x] Implementar cálculo de comissão por produto
- [x] Implementar histórico de margens
- [x] Criar procedure getAffiliateMargins
- [x] Implementar previsão de ganhos

## Routers tRPC
- [x] Criar marketplacesRouter com procedures
- [x] Procedure: connectMarketplace (conectar conta)
- [x] Procedure: disconnectMarketplace (desconectar)
- [x] Procedure: getMarketplaceAccounts (listar contas)
- [x] Procedure: syncProducts (sincronizar produtos)
- [x] Procedure: getTrendingProducts (listar trending)
- [x] Procedure: getRecommendedProducts (recomendações)
- [x] Procedure: getAffiliateMargins (margens)
- [x] Procedure: getProductAnalytics (analytics)

## Testes de Integração
- [x] Criar server/integrations/mercadoLibre.test.ts
- [x] Criar server/integrations/shopee.test.ts
- [x] Criar server/integrations/hotmart.test.ts
- [x] Criar server/marketplaces.test.ts
- [x] Executar suite de testes de integração (34/37 testes passando)

## Frontend - Interface de Marketplaces
- [x] Criar página MarketplacesManagement.tsx
- [x] Implementar conexão com marketplaces
- [x] Implementar listagem de contas conectadas
- [x] Implementar desconexão de contas
- [x] Implementar sincronização manual

## Frontend - Dashboard de Produtos
- [x] Criar página RecommendedProducts.tsx
- [x] Implementar listagem de produtos sincronizados
- [x] Implementar filtros por marketplace
- [x] Implementar busca de produtos
- [x] Implementar visualização de tendências

## Frontend - Recomendações
- [x] Criar página RecommendedProducts.tsx
- [x] Implementar listagem de produtos recomendados
- [x] Implementar filtros por categoria e preço
- [x] Implementar visualização de margens
- [x] Implementar ação de copiar produto

## Finalização
- [x] Validar integração com todos os marketplaces
- [x] Executar suite completa de testes (34/37 passando)
- [x] Criar checkpoint final da Fase 7
