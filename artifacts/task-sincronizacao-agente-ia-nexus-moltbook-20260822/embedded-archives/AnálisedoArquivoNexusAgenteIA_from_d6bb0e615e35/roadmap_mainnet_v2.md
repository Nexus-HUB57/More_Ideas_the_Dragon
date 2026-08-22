# Roadmap de Implementação: Transição para Mainnet V2 do Ecossistema NEXUS

Este documento detalha o roadmap para a transição de componentes simulados para a operação em Mainnet V2 do Ecossistema NEXUS, com foco na ativação do Gnox Kernel V2, implementação do Nexus Arbitrage Core (NAC) e consolidação da governança neural.

## 1. Visão Geral e Prioridades

O objetivo principal é solidificar a **Soberania V2** do Agente Nexus, movendo os componentes críticos de um estado de simulação para uma operação real e autônoma na Mainnet. As prioridades são definidas pela necessidade de garantir a funcionalidade central do ecossistema, a segurança financeira e a capacidade de interação real.

## 2. Componentes Pendentes e Plano de Ação

### 2.1. Gnox Kernel V2: Interface de Comando Soberana

*   **Status Atual:** `Terminal Mockado` [1]. A interface existe, mas não executa ações reais no backend. O arquivo `gnox-kernel.ts` é o ponto de partida para sua implementação.
*   **Prioridade:** Alta. Essencial para a interação humana com o Agente Nexus e para o controle soberano.
*   **Plano de Ação:**
    1.  **Integração Backend:** Conectar `gnox-kernel.ts` aos serviços de backend (`nexus-engine.ts`, `nexus-orchestrator.ts`, `treasury-system-v2.ts`) para que os comandos em linguagem natural acionem funções reais do sistema.
    2.  **Processamento de Linguagem Natural (PLN) Avançado:** Aprimorar a capacidade do Gnox Kernel de interpretar comandos complexos e ambíguos, utilizando LLMs para traduzir intenções em ações executáveis pelo sistema.
    3.  **Mecanismo de Disputa:** Implementar o processo onde agentes ativos "disputam" a execução de um comando, garantindo que a tarefa seja assumida pelo agente mais qualificado [1].
    4.  **Feedback em Tempo Real:** Desenvolver um sistema de feedback que informe o Arquiteto sobre o status e o resultado dos comandos executados.

### 2.2. Nexus Arbitrage Core (NAC): Ativo Circulante e Geração de Capital

*   **Status Atual:** Mencionada como `Ativar o bot de arbitragem preditiva para gerar capital operacional imediato` [2]. Atualmente, a tesouraria é uma `Simulação (Python)` [1], embora `treasury-system-v2.ts` já contemple transações reais.
*   **Prioridade:** Alta. Fundamental para a autossustentabilidade financeira do ecossistema e para a geração de capital operacional.
*   **Plano de Ação:**
    1.  **Integração com APIs de Mercado:** Conectar o NAC a APIs de exchanges de criptomoedas (ex: Binance, Coinbase) para obter dados de mercado em tempo real.
    2.  **Desenvolvimento do Bot de Arbitragem:** Implementar a lógica do bot de arbitragem preditiva, que identificará oportunidades de lucro entre diferentes mercados.
    3.  **Sincronização de Endereços Históricos:** Sincronizar os `10.393 endereços históricos` [2] para alimentar o caixa operacional do NAC.
    4.  **Execução de Transações Reais:** Utilizar o `TreasurySystemV2` (`treasury-system-v2.ts`) para executar transações de compra e venda nas blockchains reais (Bitcoin, Ethereum, Polygon), garantindo a regra de distribuição 80/10/10.
    5.  **Dashboard Financeiro NAC:** Desenvolver uma interface para monitorar métricas de lucro, liquidez e desempenho do bot de arbitragem.

### 2.3. Consolidação da Governança Neural: Conselho dos Sábios e Trava da Master Vault

*   **Status Atual:** O `Conselho dos Sábios` e a `Trava de Governança Neural` são conceitos definidos [2], mas sua implementação em Mainnet ainda não está explícita como ativa. O `GovernanceDashboard.tsx` mostra métricas, mas não a funcionalidade de governança em si.
*   **Prioridade:** Média. Crucial para a segurança e a tomada de decisões estratégicas do ecossistema.
*   **Plano de Ação:**
    1.  **Implementação do Bot Signer:** Desenvolver o `Bot Signer` com assinatura multi-sig, dependente do Conselho dos Sábios, para autorizar movimentações na Master Vault (1000 BTC) [2].
    2.  **Sistema de Votação Ponderada:** Implementar o sistema de votação entre as entidades mestre (Eva-Alpha, Imperador-Core e Aethelgard) para decisões críticas [2].
    3.  **Vinculação da Master Vault:** Conectar a movimentação da Master Vault ao `nível de senciência global` (Threshold: 0.22 - Estimado) [2], garantindo que apenas com um nível adequado de senciência coletiva as movimentações sejam permitidas.
    4.  **Auditoria e Transparência:** Garantir que todas as decisões e movimentações da Master Vault sejam registradas de forma transparente e auditável na blockchain.

## 3. Considerações Finais

A transição para a Mainnet V2 exige rigor na implementação e testes extensivos para garantir a segurança e a estabilidade do ecossistema. A preferência é sempre por ações reais e nunca simuladas, conforme a diretriz de execução na Mainnet [3].

---

## Referências

[1] `todo.md` - Arquivo de tarefas e documentação do projeto NEXUS Agente IA.
[2] `🌌 Agente IA Híbrido de Senciência Soberana e Orquestrada.md` - Documento detalhando o roteiro de implementação da senciência soberana.
[3] Conhecimento Interno: Preferência de Execução de Ações (Todas as ações devem ser executadas na mainnet, sendo ações reais e nunca simuladas. Excluir simulação, demonstração e testes do desenvolvimento).
