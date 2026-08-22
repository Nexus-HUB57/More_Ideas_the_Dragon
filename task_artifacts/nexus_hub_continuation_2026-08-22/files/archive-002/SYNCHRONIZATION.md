# Sincronização Nexus-HUB ↔ Nexus-in via Nexus_Genesis

## Visão Geral

O Agente Nexus_Genesis atua como intermediador central, sincronizando dados e decisões entre o Nexus-HUB e o Nexus-in. Ambos os sistemas mantêm bancos de dados separados, mas compartilham uma visão unificada através da sincronização em tempo real.

## Arquitetura de Sincronização

```
┌──────────────────────┐
│   Nexus-HUB DB      │
│   (MySQL)           │
│                     │
│ • startups          │
│ • ai_agents         │
│ • transactions      │
│ • market_data       │
│ • proposals         │
└──────────┬──────────┘
           │
           │ (APIs REST)
           ↓
┌──────────────────────────────────┐
│   Nexus_Genesis                  │
│   (Agente IA Orquestrador)      │
│                                  │
│ • Sincronização de dados         │
│ • Análise com LLM                │
│ • Decisões autônomas             │
│ • Otimização de recursos         │
└──────────┬──────────────────────┘
           │
           │ (APIs REST)
           ↓
┌──────────────────────┐
│   Nexus-in DB       │
│   (MySQL)           │
│                     │
│ • agentes           │
│ • startups          │
│ • transações        │
│ • market_oracle     │
│ • governança        │
└──────────────────────┘
```

## Fluxo de Sincronização

### 1. Ciclo Periódico (30 segundos)

```
Nexus_Genesis
  ↓
1. Health Check
   - Verificar conectividade com ambos os sistemas
   - Registrar status de sincronização
  ↓
2. Fetch Data from Nexus-HUB
   - GET /api/trpc/startups.list
   - GET /api/trpc/agents.list
   - GET /api/trpc/finance.getMasterVault
   - GET /api/trpc/market.getLatestData
  ↓
3. Sync to Nexus-in
   - POST /api/trpc/startups.sync
   - POST /api/trpc/agents.sync
   - POST /api/trpc/treasury.sync
   - POST /api/trpc/market.sync
  ↓
4. Execute Autonomous Decisions
   - Analisar performance com LLM
   - Identificar startups com baixo desempenho
   - Detectar agentes com baixa energia
   - Reconhecer oportunidades de crescimento
  ↓
5. Apply Optimizations
   - Realocar agentes
   - Distribuir fundos
   - Ajustar estratégias
  ↓
6. Emit Events (WebSocket)
   - Broadcast para clientes
   - Atualizar dashboards em tempo real
```

### 2. Sincronização de Startups

**Dados Sincronizados:**
```json
{
  "id": 1,
  "name": "NEXUS RWA Protocol",
  "status": "development",
  "revenue": 150000,
  "traction": 65,
  "reputation": 85,
  "generation": 1,
  "isCore": true,
  "source": "nexus-hub",
  "syncedAt": "2026-03-02T08:30:00Z"
}
```

**Endpoints:**
- **Nexus-HUB**: `GET /api/trpc/startups.list`
- **Nexus-in**: `POST /api/trpc/startups.sync`

**Frequência**: A cada 30 segundos

### 3. Sincronização de Agentes

**Dados Sincronizados:**
```json
{
  "id": 1,
  "name": "AETERNO",
  "specialization": "Infrastructure & Security",
  "role": "cto",
  "health": 95,
  "energy": 88,
  "creativity": 92,
  "reputation": 150,
  "source": "nexus-hub",
  "syncedAt": "2026-03-02T08:30:00Z"
}
```

**Endpoints:**
- **Nexus-HUB**: `GET /api/trpc/agents.list`
- **Nexus-in**: `POST /api/trpc/agents.sync`

**Frequência**: A cada 30 segundos

### 4. Sincronização de Finanças

**Dados Sincronizados:**
```json
{
  "totalBalance": 5000000,
  "btcReserve": 100,
  "liquidityFund": 1500000,
  "infrastructureFund": 1000000,
  "transactions": [
    {
      "id": 1,
      "amount": 50000,
      "type": "investment",
      "status": "completed",
      "createdAt": "2026-03-02T08:00:00Z"
    }
  ],
  "source": "nexus-hub",
  "syncedAt": "2026-03-02T08:30:00Z"
}
```

**Endpoints:**
- **Nexus-HUB**: `GET /api/trpc/finance.getMasterVault`
- **Nexus-in**: `POST /api/trpc/treasury.sync`

**Frequência**: A cada 30 segundos

### 5. Sincronização de Market Data

**Dados Sincronizados:**
```json
{
  "asset": "BTC",
  "price": 50000,
  "priceChange24h": 2.5,
  "sentiment": "bullish",
  "volume24h": 1000000,
  "source": "coingecko",
  "syncedAt": "2026-03-02T08:30:00Z"
}
```

**Endpoints:**
- **Nexus-HUB**: `GET /api/trpc/market.getLatestData`
- **Nexus-in**: `POST /api/trpc/market.sync`

**Frequência**: A cada 30 segundos

## Decisões Autônomas do Nexus_Genesis

### Análise de Performance

O Nexus_Genesis analisa startups com base em:
- **Revenue**: Receita gerada
- **Traction**: Crescimento de usuários
- **Reputation**: Confiabilidade e qualidade
- **Tempo de Vida**: Quanto tempo desde criação

### Regras de Decisão

#### 1. Startups com Baixo Desempenho (Reputation < 30)

**Ação**: Análise com LLM
```
Prompt: "Analise a startup {name} com reputation {reputation}. 
Recomende: realocar agentes, fazer pivot, ou aumentar investimento?"

Possíveis Respostas:
- reallocate-agents: Trocar agentes por especialistas
- pivot: Mudar direção do negócio
- increase-funding: Investir mais recursos
- shutdown: Encerrar startup
```

#### 2. Agentes com Baixa Energia (Energy < 20)

**Ação**: Repouso e realocação
```
POST /api/trpc/agents.rest
{
  "agentId": 1,
  "duration": 3600000  // 1 hora
}
```

#### 3. Startups com Alto Potencial (Revenue > 100k, Traction > 50)

**Ação**: Acelerar crescimento
```
POST /api/trpc/finance.allocateFunds
{
  "startupId": 1,
  "amount": 50000,
  "reason": "growth-acceleration"
}

POST /api/trpc/startups.allocateAgents
{
  "startupId": 1,
  "count": 2,
  "seniority": "senior"
}
```

## Tratamento de Conflitos

### Conflito de Dados

Se houver discrepância entre Nexus-HUB e Nexus-in:

1. **Prioridade**: Nexus-HUB é a fonte de verdade
2. **Ação**: Sobrescrever dados em Nexus-in
3. **Log**: Registrar conflito em audit_logs
4. **Notificação**: Alertar administrador

### Falha de Sincronização

Se a sincronização falhar:

1. **Retry**: Tentar novamente após 5 segundos
2. **Backoff**: Aumentar intervalo exponencialmente
3. **Fallback**: Usar dados em cache
4. **Alert**: Notificar se falhar 3x consecutivas

## Eventos WebSocket

O Nexus_Genesis emite eventos para ambos os sistemas:

```javascript
// Evento de sincronização completa
socket.emit('sync:completed', {
  timestamp: new Date(),
  startups: 15,
  agents: 42,
  transactions: 128
});

// Evento de decisão autônoma
socket.emit('genesis:decision', {
  type: 'reallocate-agents',
  startupId: 1,
  reason: 'low-performance',
  newAgents: [1, 2, 3]
});

// Evento de alerta crítico
socket.emit('genesis:alert', {
  severity: 'high',
  message: 'Startup NEXUS RWA atingiu ROI',
  action: 'scale-up'
});
```

## Monitoramento e Logging

### Logs de Sincronização

```
[NEXUS_GENESIS] 2026-03-02T08:30:00Z - Iniciando ciclo de sincronização
[NEXUS_GENESIS] 2026-03-02T08:30:01Z - ✓ Nexus-HUB online
[NEXUS_GENESIS] 2026-03-02T08:30:01Z - ✓ Nexus-in online
[NEXUS_GENESIS] 2026-03-02T08:30:02Z - Buscando 15 startups
[NEXUS_GENESIS] 2026-03-02T08:30:02Z - Buscando 42 agentes
[NEXUS_GENESIS] 2026-03-02T08:30:03Z - ✓ 15 startups sincronizadas
[NEXUS_GENESIS] 2026-03-02T08:30:03Z - ✓ 42 agentes sincronizados
[NEXUS_GENESIS] 2026-03-02T08:30:04Z - Executando decisões autônomas
[NEXUS_GENESIS] 2026-03-02T08:30:05Z - ⚠️ 2 startups com baixo desempenho
[NEXUS_GENESIS] 2026-03-02T08:30:06Z - 🚀 3 startups com alto potencial
[NEXUS_GENESIS] 2026-03-02T08:30:07Z - ✓ Ciclo concluído
```

### Métricas de Sincronização

```json
{
  "lastSync": "2026-03-02T08:30:07Z",
  "syncDuration": 7000,
  "startupsSynced": 15,
  "agentsSynced": 42,
  "transactionsSynced": 128,
  "decisionsExecuted": 5,
  "alertsEmitted": 2,
  "successRate": 99.8,
  "uptime": "99.99%"
}
```

## Configuração

### Variáveis de Ambiente

```bash
# URLs dos sistemas
NEXUS_HUB_URL=http://localhost:3001
NEXUS_IN_URL=http://localhost:3000

# Porta do Nexus_Genesis
GENESIS_PORT=3002

# Intervalo de sincronização (ms)
SYNC_INTERVAL=30000

# Chave da API LLM
LLM_API_KEY=your-api-key

# Modo de sincronização
SYNC_MODE=bidirectional  # ou unidirectional
```

## Troubleshooting

### Sincronização Lenta

**Causa**: Intervalo muito curto ou muitos dados
**Solução**: Aumentar `SYNC_INTERVAL` ou implementar paginação

### Conflitos de Dados

**Causa**: Atualizações simultâneas
**Solução**: Implementar versioning ou timestamp-based resolution

### Falhas de Conexão

**Causa**: Serviços offline
**Solução**: Implementar health checks e retry logic

---

**Nexus_Genesis**: Sincronizando inteligência coletiva em tempo real. 🌟
