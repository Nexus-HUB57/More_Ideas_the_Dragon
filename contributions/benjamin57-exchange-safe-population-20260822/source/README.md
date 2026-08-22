# Exchange Benjamin57 - Plataforma de Criptomoedas

## 🚀 Visão Geral

A Exchange Benjamin57 é uma plataforma completa de negociação de criptomoedas desenvolvida especificamente para a moeda BNJ (Benjamin57) contra USDT. A plataforma oferece funcionalidades avançadas de trading, sistema P2P, gráficos em tempo real e gerenciamento completo de carteiras.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login e logout seguros
- Gerenciamento de sessões com tokens
- Validação de credenciais
- Persistência de login

### 💱 Exchange Completa
- **Livro de Ordens BNJ/USDT**: Interface profissional para visualização de ordens de compra e venda
- **Criação de Ordens**: Formulários intuitivos para compra e venda
- **Dados de Mercado**: Preços, variações, volume e estatísticas em tempo real
- **Histórico de Negociações**: Visualização das transações recentes

### 👥 Sistema P2P (Peer-to-Peer)
- **Mercado P2P**: Negociações diretas entre usuários
- **Criação de Anúncios**: Ordens personalizadas de compra/venda
- **Filtros Avançados**: Por tipo, moeda e método de pagamento
- **Métodos de Pagamento**: PIX, TED, DOC, Dinheiro
- **Gerenciamento de Ordens**: Cancelamento e acompanhamento

### 👤 Perfil e Configurações
- **Dados Pessoais**: Informações completas do usuário
- **Configurações de Segurança**: Alteração de senha, 2FA
- **Gerenciamento de Carteiras**: Visualização detalhada de saldos
- **Histórico de Atividades**: Transações e operações realizadas
- **Chave API**: Para integração programática

### 📊 Gráficos em Tempo Real
- **Gráfico de Preços**: Visualização em linha e área
- **Gráfico de Volume**: Análise de volume de compra e venda
- **Múltiplos Timeframes**: 1m, 5m, 1h, 1d
- **Atualizações Automáticas**: Dados atualizados a cada 30 segundos
- **Tooltips Interativos**: Informações detalhadas ao passar o mouse

### 🎨 Interface Moderna
- **Design Glassmorphism**: Efeitos visuais modernos e elegantes
- **Tema Escuro**: Interface profissional e confortável
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Componentes Premium**: Biblioteca Shadcn/UI
- **Iconografia Consistente**: Ícones Lucide React

## 🏗️ Arquitetura Técnica

### Backend (Flask)
```
crypto_exchange_backend/
├── src/
│   ├── main.py              # Aplicação principal Flask
│   ├── models/              # Modelos de dados
│   │   ├── user.py         # Modelo de usuário
│   │   ├── wallet.py       # Modelo de carteira
│   │   └── order.py        # Modelos de ordens
│   └── routes/             # Rotas da API
│       ├── auth.py         # Autenticação
│       ├── user.py         # Usuários
│       ├── wallet.py       # Carteiras
│       ├── exchange.py     # Exchange
│       └── p2p.py          # Sistema P2P
├── database/               # Banco de dados SQLite
└── requirements.txt        # Dependências Python
```

### Frontend (React)
```
crypto_exchange_frontend/
├── src/
│   ├── App.jsx             # Aplicação principal
│   ├── components/         # Componentes React
│   │   ├── Login.jsx       # Tela de login
│   │   ├── Dashboard.jsx   # Dashboard principal
│   │   ├── Exchange.jsx    # Interface da exchange
│   │   ├── P2P.jsx         # Sistema P2P
│   │   ├── Profile.jsx     # Perfil do usuário
│   │   ├── Navbar.jsx      # Navegação
│   │   ├── PriceChart.jsx  # Gráfico de preços
│   │   └── VolumeChart.jsx # Gráfico de volume
│   └── ui/                 # Componentes UI base
├── public/                 # Arquivos estáticos
└── package.json           # Dependências Node.js
```

## 🔗 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `GET /api/auth/profile/{id}` - Dados do perfil

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/{id}` - Atualizar usuário

### Carteiras
- `GET /api/wallets` - Listar carteiras
- `POST /api/wallets` - Criar carteira
- `GET /api/wallets/{id}/transactions` - Transações da carteira

### Exchange
- `GET /api/orderbook/{pair}` - Livro de ordens
- `POST /api/orders` - Criar ordem
- `GET /api/trades/{pair}` - Histórico de negociações
- `GET /api/market-data/{pair}` - Dados de mercado

### P2P
- `GET /api/p2p/orders` - Listar ordens P2P
- `POST /api/p2p/orders` - Criar ordem P2P
- `GET /api/p2p/my-orders/{user_id}` - Minhas ordens
- `POST /api/p2p/orders/{id}/accept` - Aceitar ordem
- `DELETE /api/p2p/orders/{id}` - Cancelar ordem

## 🚀 Como Executar

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- npm ou pnpm

### Backend
```bash
cd crypto_exchange_backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
python src/main.py
```

### Frontend
```bash
cd crypto_exchange_frontend
npm install
npm run dev
```

### Acesso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Credenciais**: Lucas / <SET_VIA_ENVIRONMENT>

## 👤 Usuário Padrão

### Credenciais
- **Usuário**: Lucas
- **Senha**: <SET_VIA_ENVIRONMENT>
- **Email**: lucas@benjamin57.com

### Carteiras Genesis
- **BNJ**: 1.000.000 BNJ
- **USDT**: 50.000 USDT
- **BTC**: 10.5 BTC
- **ETH**: 150.75 ETH
- **LTC**: 500.25 LTC

## 🎯 Diferenciais da Plataforma

### 1. Livro de Ordens Interativo
- Clique nas ordens para preencher automaticamente os formulários
- Visualização em tempo real de compras e vendas
- Cálculo automático de spread

### 2. Gráficos Profissionais
- Múltiplos timeframes (1m, 5m, 1h, 1d)
- Tipos de gráfico (linha e área)
- Tooltips informativos
- Análise de volume separada

### 3. Sistema P2P Avançado
- Filtros por tipo, moeda e método de pagamento
- Descrições personalizadas
- Limites mínimos e máximos
- Status de ordens em tempo real

### 4. Interface Responsiva
- Design mobile-first
- Navegação intuitiva
- Componentes adaptativos
- Performance otimizada

### 5. Segurança
- Autenticação por tokens
- Validações no frontend e backend
- Proteção contra CORS
- Senhas criptografadas

## 🔧 Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **SQLAlchemy**: ORM para banco de dados
- **SQLite**: Banco de dados
- **bcrypt**: Criptografia de senhas
- **Flask-CORS**: Suporte a CORS

### Frontend
- **React 19**: Framework JavaScript
- **React Router**: Navegação SPA
- **Recharts**: Biblioteca de gráficos
- **Shadcn/UI**: Componentes UI
- **Tailwind CSS**: Framework CSS
- **Lucide React**: Ícones
- **Vite**: Build tool

## 📱 Funcionalidades Mobile

- Interface totalmente responsiva
- Navegação otimizada para touch
- Gráficos adaptativos
- Formulários mobile-friendly
- Performance otimizada

## 🔮 Roadmap Futuro

### Funcionalidades Planejadas
- [ ] Integração com APIs de preços reais
- [ ] Sistema de notificações push
- [ ] Trading automatizado (bots)
- [ ] Análise técnica avançada
- [ ] Suporte a mais pares de moedas
- [ ] Sistema de afiliados
- [ ] KYC/AML compliance
- [ ] Aplicativo mobile nativo

### Melhorias Técnicas
- [ ] WebSocket para dados em tempo real
- [ ] Cache Redis
- [ ] Banco de dados PostgreSQL
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento e logs
- [ ] Backup automatizado
- [ ] Escalabilidade horizontal

## 📄 Licença

Este projeto foi desenvolvido para demonstração das capacidades da plataforma Benjamin57. Todos os direitos reservados.

## 🤝 Suporte

Para suporte técnico ou dúvidas sobre a plataforma, entre em contato através dos canais oficiais da Benjamin57.

---

**Exchange Benjamin57** - Sua plataforma completa de criptomoedas 🚀

