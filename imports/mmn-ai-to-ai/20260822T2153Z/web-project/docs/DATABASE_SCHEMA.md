# MMN AI-to-AI - Schema do Banco de Dados

## Visão Geral

Este documento descreve a estrutura completa do banco de dados para a plataforma MMN AI-to-AI, incluindo tabelas, relacionamentos, tipos de dados e constraints.

---

## Tabelas Principais

### 1. users (Estendida)

Tabela base de usuários com campos adicionais para o sistema MMN.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| openId | VARCHAR(64) | UNIQUE, NOT NULL | ID do OAuth Manus |
| name | TEXT | | Nome do usuário |
| email | VARCHAR(320) | | Email do usuário |
| loginMethod | VARCHAR(64) | | Método de login (manus, google, etc) |
| role | ENUM('user', 'admin') | DEFAULT 'user' | Papel do usuário |
| affiliateCode | VARCHAR(32) | UNIQUE | Código único de afiliado |
| referrerCode | VARCHAR(32) | | Código do afiliado que indicou |
| totalCommissions | DECIMAL(10,2) | DEFAULT 0 | Total de comissões acumuladas |
| availableBalance | DECIMAL(10,2) | DEFAULT 0 | Saldo disponível para saque |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Data de atualização |
| lastSignedIn | TIMESTAMP | | Último acesso |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (openId)
- UNIQUE (affiliateCode)
- INDEX (referrerCode)

---

### 2. affiliates

Tabela de relacionamentos entre afiliados (rede hierárquica).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| userId | INT | NOT NULL, FOREIGN KEY | Referência ao usuário afiliado |
| parentId | INT | FOREIGN KEY | ID do afiliado pai (nível superior) |
| level | INT | DEFAULT 1 | Nível na hierarquia (1 = direto) |
| commission | DECIMAL(10,2) | DEFAULT 0 | Comissão deste afiliado |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | Status do afiliado |
| joinedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de entrada |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Data de atualização |

**Índices:**
- PRIMARY KEY (id)
- FOREIGN KEY (userId) REFERENCES users(id)
- FOREIGN KEY (parentId) REFERENCES affiliates(id)
- INDEX (parentId, level)

---

### 3. agents

Tabela de agentes de IA associados aos usuários.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| userId | INT | NOT NULL, UNIQUE, FOREIGN KEY | Referência ao usuário proprietário |
| name | VARCHAR(255) | | Nome do agente |
| status | ENUM('active', 'inactive', 'paused') | DEFAULT 'inactive' | Status do agente |
| energy | INT | DEFAULT 100 | Nível de energia (0-100) |
| health | INT | DEFAULT 100 | Nível de saúde (0-100) |
| creativity | INT | DEFAULT 80 | Nível de criatividade (0-100) |
| reputation | INT | DEFAULT 50 | Nível de reputação (0-100) |
| strategy | VARCHAR(64) | DEFAULT 'balanced' | Estratégia de conteúdo (balanced, aggressive, conservative) |
| lastActionAt | TIMESTAMP | | Última ação executada |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updatedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Data de atualização |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (userId)
- FOREIGN KEY (userId) REFERENCES users(id)

---

### 4. commissions

Tabela de comissões registradas.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| userId | INT | NOT NULL, FOREIGN KEY | Referência ao usuário que recebeu |
| amount | DECIMAL(10,2) | NOT NULL | Valor da comissão |
| type | ENUM('direct', 'indirect', 'bonus') | | Tipo de comissão |
| sourceUserId | INT | FOREIGN KEY | ID do usuário que gerou a comissão |
| saleId | INT | FOREIGN KEY | Referência à venda relacionada |
| status | ENUM('pending', 'confirmed', 'paid') | DEFAULT 'pending' | Status da comissão |
| period | VARCHAR(7) | | Período (YYYY-MM) |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| paidAt | TIMESTAMP | | Data do pagamento |

**Índices:**
- PRIMARY KEY (id)
- FOREIGN KEY (userId) REFERENCES users(id)
- FOREIGN KEY (sourceUserId) REFERENCES users(id)
- INDEX (period, status)
- INDEX (createdAt)

---

### 5. sales

Tabela de vendas registradas no sistema.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| affiliateId | INT | NOT NULL, FOREIGN KEY | Referência ao afiliado |
| productId | INT | FOREIGN KEY | Referência ao produto vendido |
| amount | DECIMAL(10,2) | NOT NULL | Valor da venda |
| commissionPercentage | DECIMAL(5,2) | DEFAULT 10 | Percentual de comissão |
| status | ENUM('pending', 'confirmed', 'cancelled') | DEFAULT 'pending' | Status da venda |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data da venda |

**Índices:**
- PRIMARY KEY (id)
- FOREIGN KEY (affiliateId) REFERENCES affiliates(id)
- FOREIGN KEY (productId) REFERENCES products(id)
- INDEX (createdAt)

---

### 6. products

Tabela de produtos disponíveis no marketplace.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| name | VARCHAR(255) | NOT NULL | Nome do produto |
| description | TEXT | | Descrição do produto |
| price | DECIMAL(10,2) | NOT NULL | Preço do produto |
| marketplace | VARCHAR(64) | | Marketplace (amazon, shopee, etc) |
| imageUrl | VARCHAR(512) | | URL da imagem |
| commissionRate | DECIMAL(5,2) | DEFAULT 10 | Taxa de comissão (%) |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | Status do produto |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Índices:**
- PRIMARY KEY (id)
- INDEX (marketplace)
- INDEX (status)

---

### 7. favorites

Tabela de produtos favoritos dos usuários.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| userId | INT | NOT NULL, FOREIGN KEY | Referência ao usuário |
| productId | INT | NOT NULL, FOREIGN KEY | Referência ao produto |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de adição |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (userId, productId)
- FOREIGN KEY (userId) REFERENCES users(id)
- FOREIGN KEY (productId) REFERENCES products(id)

---

### 8. notifications

Tabela de notificações do sistema.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| userId | INT | NOT NULL, FOREIGN KEY | Referência ao usuário destinatário |
| type | ENUM('commission', 'affiliate', 'agent', 'system') | | Tipo de notificação |
| title | VARCHAR(255) | NOT NULL | Título da notificação |
| content | TEXT | | Conteúdo da notificação |
| relatedId | INT | | ID do recurso relacionado (comissão, afiliado, etc) |
| isRead | BOOLEAN | DEFAULT FALSE | Se foi lida |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Índices:**
- PRIMARY KEY (id)
- FOREIGN KEY (userId) REFERENCES users(id)
- INDEX (userId, isRead)
- INDEX (createdAt)

---

### 9. withdrawals

Tabela de solicitações de saque.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| userId | INT | NOT NULL, FOREIGN KEY | Referência ao usuário |
| amount | DECIMAL(10,2) | NOT NULL | Valor do saque |
| status | ENUM('pending', 'approved', 'rejected', 'paid') | DEFAULT 'pending' | Status do saque |
| bankAccount | VARCHAR(255) | | Conta bancária (criptografada) |
| requestedAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data da solicitação |
| approvedAt | TIMESTAMP | | Data de aprovação |
| paidAt | TIMESTAMP | | Data do pagamento |

**Índices:**
- PRIMARY KEY (id)
- FOREIGN KEY (userId) REFERENCES users(id)
- INDEX (status, requestedAt)

---

## Relacionamentos

```
users (1) ──────→ (N) affiliates
users (1) ──────→ (N) agents
users (1) ──────→ (N) commissions
users (1) ──────→ (N) sales
users (1) ──────→ (N) favorites
users (1) ──────→ (N) notifications
users (1) ──────→ (N) withdrawals

affiliates (1) ──────→ (N) affiliates (self-referencing)
affiliates (1) ──────→ (N) sales

products (1) ──────→ (N) sales
products (1) ──────→ (N) favorites

commissions (1) ──────→ (1) sales
```

---

## Tipos de Dados Especiais

### Enums

- **user.role**: `admin`, `user`
- **agent.status**: `active`, `inactive`, `paused`
- **agent.strategy**: `balanced`, `aggressive`, `conservative`
- **affiliate.status**: `active`, `inactive`
- **commission.type**: `direct`, `indirect`, `bonus`
- **commission.status**: `pending`, `confirmed`, `paid`
- **sale.status**: `pending`, `confirmed`, `cancelled`
- **product.status**: `active`, `inactive`
- **notification.type**: `commission`, `affiliate`, `agent`, `system`
- **withdrawal.status**: `pending`, `approved`, `rejected`, `paid`

---

## Constraints e Validações

### Constraints de Negócio

1. **Código de Afiliado**: Deve ser único e imutável após criação
2. **Comissões**: Não podem ser negativas
3. **Saldo Disponível**: Não pode ser negativo
4. **Métricas do Agente**: Devem estar entre 0 e 100
5. **Hierarquia de Afiliados**: Um afiliado não pode ser pai de si mesmo
6. **Saque**: Não pode exceder o saldo disponível

### Validações de Dados

- Email: Deve ser válido e único
- Valores Monetários: DECIMAL(10,2) para precisão
- Datas: UTC timestamps
- Percentuais: DECIMAL(5,2) (0-100)

---

## Índices de Performance

| Tabela | Índice | Colunas | Propósito |
|--------|--------|---------|-----------|
| users | PRIMARY | id | Busca rápida por ID |
| users | UNIQUE | openId | Busca por OAuth ID |
| users | UNIQUE | affiliateCode | Validação de código único |
| affiliates | INDEX | parentId, level | Consultas de hierarquia |
| commissions | INDEX | period, status | Filtro por período |
| commissions | INDEX | createdAt | Ordenação temporal |
| sales | INDEX | createdAt | Ordenação temporal |
| notifications | INDEX | userId, isRead | Busca de notificações não lidas |
| withdrawals | INDEX | status, requestedAt | Filtro de status |

---

## Considerações de Segurança

1. **Dados Sensíveis**: Contas bancárias devem ser criptografadas
2. **Auditoria**: Manter logs de alterações em comissões e saques
3. **Autorização**: Validar propriedade de recursos em todas as operações
4. **Isolamento**: Usuários só podem acessar seus próprios dados
5. **Integridade Referencial**: Usar foreign keys para manter consistência

---

## Evolução Futura

- Adicionar tabela de `agentActions` para auditoria de ações do agente
- Adicionar tabela de `commissionRules` para regras customizáveis
- Adicionar tabela de `userPreferences` para configurações personalizadas
- Adicionar tabela de `auditLog` para rastreamento completo

---

## Notas de Implementação

- Todas as datas devem ser armazenadas em UTC
- Usar transações para operações que envolvem múltiplas tabelas (ex: criar comissão + atualizar saldo)
- Implementar soft deletes onde apropriado (adicionar coluna `deletedAt`)
- Usar connection pooling para melhor performance
- Implementar backups automáticos diários

