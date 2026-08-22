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


## Fase 9: População segura do repositório GitHub
- [x] Auditar branches, commits e árvore de Nexus-HUB57/More_Ideas_the_Dragon
- [x] Criar pacote isolado do Nexus Hub sem sobrescrever arquivos remotos
- [x] Incluir manifesto SHA-256 e contagem de arquivos do pacote
- [x] Gerar ZIP end-to-end do pacote com integridade verificável
- [x] Validar que todos os arquivos do pacote foram incluídos
- [ ] Comitar em branch dedicada sem alterar histórico existente
- [ ] Publicar branch dedicada no GitHub e registrar referência do commit
- [ ] Validar o estado remoto após o push
- [ ] Entregar relatório final com arquivos, contagens e salvaguardas
- [x] Confirmar se o pedido se refere a 295 ou 299 artefatos numerados; manter os 299 já existentes intactos

## Fase 9A: Integração WebSocket — arquivos recuperados para o pacote
- [x] Incluir servidor WebSocket e inicialização Express
- [x] Incluir contexto e hooks WebSocket do frontend
- [x] Incluir testes e documentação da integração WebSocket
- [x] Gerar snapshot ZIP sem dependências geradas ou segredos

## Histórico
- O diretório remoto artifacts/end-to-end/001-299/ já contém 299 arquivos rastreados e não será alterado.
- A estratégia desta fase é aditiva, isolada e não destrutiva.

> Nota: o ambiente restaurado não disponibilizou o ZIP original no caminho de recuperação informado; o arquivo será incluído somente se localizado no workspace, sem inventar conteúdo ausente.
- [x] Corrigir staging: excluir diretórios temporários _outer/_nested antes de copiar o pacote
- [x] Verificar novamente que nenhum arquivo .env ou credencial foi incluído
- [x] Remover .project-config.json do snapshot antes da publicação; ele contém credenciais injetadas do ambiente
- [x] Recalcular manifest, contagens e ZIP após a sanitização
