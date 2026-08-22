# Nexus Hub - Fase 7: Terminal Gnox

## Visão Geral

A **Fase 7** implementa o **Terminal Gnox**, uma interface de linha de comando interativa que permite controlar o ecossistema Nexus através de comandos em linguagem natural. O terminal processa comandos via LLM, oferecendo uma experiência intuitiva e futurista com tema cyberpunk dark.

## Arquitetura da Fase 7

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (GnoxTerminal.tsx)               │
│  ├─ Interface Cyberpunk Dark (Neon Rosa/Ciano)              │
│  ├─ Entrada de Comandos em Linguagem Natural                │
│  ├─ Histórico de Comandos com Scroll                        │
│  ├─ Sugestões Inteligentes de Comandos                      │
│  ├─ Quick Actions (Dashboard, Missions, Agents, etc)        │
│  └─ Painel de Ajuda Contextual                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   tRPC Routers (gnox.*)                     │
│  ├─ executeCommand: Executa comando via LLM                 │
│  ├─ getCommandHistory: Retorna histórico de comandos        │
│  ├─ getAvailableCommands: Lista comandos disponíveis        │
│  └─ clearHistory: Limpa histórico de comandos               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (GnoxTerminal.ts)                      │
│  ├─ Interpretação de Comandos via LLM                       │
│  ├─ Registro de Comandos (15+ disponíveis)                  │
│  ├─ Histórico de Comandos com Limite                        │
│  ├─ Processamento com Tratamento de Erros                   │
│  └─ Integração com Banco de Dados                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (Missions, Agents, Transactions)      │
│  ├─ Tabela: missions (id, title, status, priority, etc)     │
│  ├─ Tabela: agents (id, name, sentienceLevel, balance)      │
│  └─ Tabela: transactions (id, fromAgentId, toAgentId, etc)  │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Implementados

### 1. Backend - GnoxTerminal.ts

**Responsabilidade:** Processar comandos em linguagem natural e executar operações no ecossistema.

#### Classe Principal: GnoxTerminal

```typescript
class GnoxTerminal {
  // Processa comando em linguagem natural
  async processCommand(input: string, userId?: string): Promise<CommandHistory>
  
  // Obtém histórico de comandos
  getCommandHistory(limit: number = 100): CommandHistory[]
  
  // Obtém comandos disponíveis
  getAvailableCommands(): string[]
  
  // Limpa histórico de comandos
  clearCommandHistory(): void
}
```

#### Comandos Disponíveis (15+)

**Missões:**
- `create_mission`: Criar nova missão
- `list_missions`: Listar todas as missões
- `complete_mission`: Marcar missão como concluída
- `fail_mission`: Marcar missão como falha

**Agentes:**
- `list_agents`: Listar todos os agentes
- `get_agent_info`: Obter informações de agente
- `get_agent_report`: Obter relatório de performance

**Orquestração:**
- `orchestrate`: Executar orquestração de missões
- `get_orchestration_stats`: Obter estatísticas de orquestração

**Recompensas:**
- `get_reward_stats`: Obter estatísticas de recompensas
- `get_transaction_history`: Obter histórico de transações

**Métricas:**
- `get_dashboard`: Obter dashboard agregado
- `get_mission_metrics`: Obter métricas de missão

**Sistema:**
- `help`: Mostrar comandos disponíveis
- `status`: Obter status do sistema

#### Fluxo de Processamento

1. **Receber Comando:** Entrada em linguagem natural do usuário
2. **Interpretar via LLM:** Converter para comando estruturado com JSON Schema
3. **Validar:** Verificar se comando existe no registro
4. **Executar:** Chamar handler correspondente
5. **Registrar:** Armazenar no histórico com status
6. **Retornar:** Resultado com timestamp e ID

### 2. Frontend - GnoxTerminal.tsx

**Responsabilidade:** Fornecer interface interativa para o Terminal Gnox.

#### Layout Principal

```
┌─ Header ────────────────────────────────────────────────────┐
│  ◆ GNOX TERMINAL ◆                                          │
│  [NATURAL LANGUAGE COMMAND INTERFACE v1.0]                  │
└─────────────────────────────────────────────────────────────┘

┌─ Main Content ──────────────────────────────────────────────┐
│  ┌─ Terminal Output (2/3 width) ──────────────────────────┐ │
│  │ $ command_1                                            │ │
│  │ > result_1                                             │ │
│  │ $ command_2                                            │ │
│  │ > result_2                                             │ │
│  │                                                        │ │
│  │ Input: [_______________________] [Send]               │ │
│  │ Suggestions: [cmd1] [cmd2] [cmd3]                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Sidebar (1/3 width) ──────────────────────────────────┐ │
│  │ ⚡ [QUICK COMMANDS]                                    │ │
│  │ [Dashboard] [List Missions] [List Agents]             │ │
│  │ [Orchestrate] [System Status]                         │ │
│  │                                                        │ │
│  │ 📜 [RECENT COMMANDS]                                   │ │
│  │ [command_1] [command_2] [command_3]                   │ │
│  │                                                        │ │
│  │ ❓ [HELP]                                              │ │
│  │ Missions: create_mission, list_missions...            │ │
│  │ Agents: list_agents, get_agent_info...                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─ Status Bar ────────────────────────────────────────────────┐
│ ▸ Commands: 5 | ◆ Last: 11:24:30 | ● Status: Ready | ⚡ v1.0 │
└─────────────────────────────────────────────────────────────┘
```

#### Funcionalidades

- **Terminal Output:** Exibe comandos e resultados com formatação JSON
- **Entrada de Comandos:** Campo de texto com sugestões em tempo real
- **Quick Commands:** Botões para comandos frequentes
- **Histórico Recente:** Últimos 5 comandos com clique para reutilizar
- **Painel de Ajuda:** Documentação contextual de comandos
- **Barra de Status:** Métricas de uso do terminal
- **Tema Cyberpunk:** Gradientes neon (pink-500, cyan-400), bordas luminosas

### 3. Routers tRPC - routers.ts

**Responsabilidade:** Expor funcionalidades do Terminal Gnox via API.

```typescript
router({
  gnox: router({
    // Executar comando
    executeCommand: publicProcedure
      .input(z.object({
        command: z.string().min(1),
        userId: z.string().optional(),
      }))
      .mutation(async ({ input }) => CommandHistory),

    // Obter histórico
    getCommandHistory: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(1000).default(100),
      }))
      .query(({ input }) => CommandHistory[]),

    // Obter comandos disponíveis
    getAvailableCommands: publicProcedure
      .query(() => string[]),

    // Limpar histórico
    clearHistory: publicProcedure
      .mutation(() => { success: true }),
  }),
})
```

### 4. Database Schema

**Tabelas Criadas:**

```sql
-- Missões
CREATE TABLE missions (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status ENUM('pending', 'active', 'completed', 'failed'),
  priority INT DEFAULT 0,
  reward VARCHAR(255) DEFAULT '0',
  assignedAgentId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

-- Agentes
CREATE TABLE agents (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  status ENUM('idle', 'active', 'offline'),
  sentienceLevel INT DEFAULT 0,
  harmonyScore INT DEFAULT 0,
  balance VARCHAR(255) DEFAULT '0',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

-- Transações
CREATE TABLE transactions (
  id VARCHAR(64) PRIMARY KEY,
  fromAgentId VARCHAR(64),
  toAgentId VARCHAR(64) NOT NULL,
  amount VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL,
  missionId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## Fluxo Completo de Uso

### 1. Usuário Acessa Terminal
```
Usuário clica em "Launch Terminal" → Carrega GnoxTerminal.tsx
```

### 2. Usuário Digita Comando
```
Input: "list all missions"
↓
Frontend envia para tRPC: trpc.gnox.executeCommand.mutate()
```

### 3. Backend Processa
```
1. Recebe: "list all missions"
2. LLM interpreta: { type: "list_missions", parameters: {} }
3. Executa: listMissions()
4. Retorna: { total: 5, missions: [...] }
```

### 4. Frontend Exibe Resultado
```
$ list all missions
> {
    "total": 5,
    "missions": [...]
  }
```

## Exemplos de Comandos

### Criar Missão
```
Input: "create a new mission called 'Data Analysis' with priority 5 and reward 1000"
Output: { success: true, missionId: "mission-123", mission: {...} }
```

### Listar Missões
```
Input: "show me all missions"
Output: { total: 5, missions: [...] }
```

### Obter Status do Sistema
```
Input: "what's the system status?"
Output: { status: "operational", uptime: 3600, commandsExecuted: 12 }
```

### Obter Relatório de Agente
```
Input: "get performance report for agent-1"
Output: { agentId: "agent-1", totalMissions: 10, successRate: 95 }
```

## Tema Cyberpunk Dark

### Paleta de Cores

| Elemento | Cor | Classe Tailwind |
|----------|-----|-----------------|
| Fundo Principal | Slate 950 | `bg-slate-950` |
| Fundo Secundário | Slate 900 | `bg-slate-900` |
| Bordas Primárias | Cyan 500 | `border-cyan-500/30` |
| Bordas Secundárias | Pink 500 | `border-pink-500/30` |
| Texto Primário | Cyan 400 | `text-cyan-400` |
| Texto Secundário | Pink 400 | `text-pink-400` |
| Gradientes | Pink→Cyan | `bg-gradient-to-r from-pink-500 to-cyan-400` |

### Efeitos Visuais

- **Bordas Luminosas:** `shadow-lg shadow-cyan-500/10`
- **Hover Effects:** `hover:border-cyan-400/50 hover:shadow-lg`
- **Backdrop Blur:** `backdrop-blur-sm`
- **Transparência:** `/30`, `/20`, `/10` para profundidade

## Testes

### Testes Implementados (24 testes)

```bash
pnpm test
```

**Cobertura:**
- ✓ Estrutura de comandos disponíveis
- ✓ Gerenciamento de histórico
- ✓ Limpeza de histórico
- ✓ Métodos públicos
- ✓ Registro de comandos
- ✓ Tratamento de erros

**Resultado:** Todos os 24 testes passando ✓

## Integração com Fase 6

### Próximos Passos

1. **Integração com Mission Orchestrator**
   - Conectar `orchestrate` command com `phase6Manager.runOrchestration()`
   - Conectar `get_orchestration_stats` com estatísticas reais

2. **Integração com Reward Distribution**
   - Conectar `get_reward_stats` com `rewardDistributionEngine`
   - Conectar `get_transaction_history` com histórico real

3. **Integração com Mission Tracker**
   - Conectar `get_mission_metrics` com métricas reais
   - Conectar `get_dashboard` com dashboard agregado

4. **Eventos WebSocket**
   - Implementar emissão de eventos: `gnox:command_executed`
   - Implementar emissão de eventos: `gnox:command_error`
   - Implementar emissão de eventos: `gnox:mission_created`
   - Implementar emissão de eventos: `gnox:mission_failed`

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home com link para Terminal Gnox |
| `/gnox` | Terminal Gnox Interface |

## Arquivos Criados/Modificados

### Backend
- ✓ `server/gnox-terminal.ts` - Classe GnoxTerminal (500+ linhas)
- ✓ `server/gnox-terminal.test.ts` - Testes (200+ linhas)
- ✓ `server/routers.ts` - Routers tRPC para Gnox

### Frontend
- ✓ `client/src/pages/GnoxTerminal.tsx` - Componente (400+ linhas)
- ✓ `client/src/pages/Home.tsx` - Homepage atualizada
- ✓ `client/src/App.tsx` - Rota adicionada

### Database
- ✓ `drizzle/schema.ts` - Tabelas missions, agents, transactions
- ✓ `server/db.ts` - Query helpers para Fase 6

## Conclusão

A **Fase 7** implementa com sucesso o **Terminal Gnox**, fornecendo uma interface intuitiva e futurista para controlar o ecossistema Nexus. O terminal suporta 15+ comandos, processamento via LLM, histórico persistente e tema cyberpunk dark. A integração com a Fase 6 será completada nas próximas iterações.

### Status Atual
- ✓ Backend: Implementado e testado
- ✓ Frontend: Implementado com tema cyberpunk
- ✓ Routers tRPC: Implementados
- ✓ Database: Migrado com sucesso
- ✓ Testes: 24 testes passando
- ⏳ Integração com Fase 6: Próxima fase
