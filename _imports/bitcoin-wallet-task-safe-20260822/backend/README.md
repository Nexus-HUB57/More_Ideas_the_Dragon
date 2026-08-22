'''
# Sistema de Carteira Digital Bitcoin

**Versão:** 1.0.0-dev  
**Data:** 06 de Outubro de 2025  
**Autor:** Manus AI (PhD em Engenharia de Software e Ciência da Computação)

---

## 1. Visão Geral do Projeto

Este projeto consiste em um sistema completo de carteira digital Bitcoin, projetado para oferecer armazenamento seguro, gerenciamento de chaves e interação direta com a blockchain Bitcoin (Mainnet). A solução é composta por um backend robusto desenvolvido em **Flask (Python)** e um frontend moderno e responsivo em **React**.

O sistema implementa dois protocolos de segurança críticos:

- **Protocolo TSRA (Transaction Security Real Action):** Garante que todas as operações (consultas de saldo, broadcast de transações) ocorram exclusivamente na **Mainnet**, eliminando qualquer ambiente de teste ou simulação.
- **Protocolo CAISK (Crypto Address Import Security Key):** Assegura que todas as chaves privadas, sejam geradas ou importadas, sejam criptografadas com **AES-256 GCM** antes de serem armazenadas, utilizando uma passphrase mestra para derivação da chave.

## 2. Arquitetura do Sistema

O sistema adota uma arquitetura de microsserviços para garantir escalabilidade, manutenibilidade e separação de responsabilidades.

- **Frontend:** Aplicação de página única (SPA) desenvolvida em **React**, utilizando Vite para o build, Tailwind CSS e shadcn/ui para a interface.
- **Backend:** API RESTful desenvolvida em **Flask (Python)**, responsável pela lógica de negócios.
- **Banco de Dados:** **MongoDB** para armazenamento persistente de dados da carteira (endereços, transações, chaves mestras).
- **Cache:** **Redis** para armazenamento em cache de dados frequentemente acessados, como saldos e listas de endereços, reduzindo a carga nas APIs externas.
- **Blockchain Gateway:** Módulo integrado que se comunica com múltiplas APIs de blockchain (Blockstream, Mempool.space) para garantir alta disponibilidade.

![Arquitetura](https://i.imgur.com/example.png)  
*(Nota: Diagrama de arquitetura conceitual. Um diagrama real pode ser gerado com a ferramenta `manus-render-diagram`)*

## 3. Stack de Tecnologias

| Componente      | Tecnologia/Biblioteca        | Propósito                                       |
|-----------------|------------------------------|-------------------------------------------------|
| **Backend**     | Flask, Python 3.11           | Framework da API RESTful                        |
| **Frontend**    | React, Vite, JavaScript      | Interface do usuário                            |
| **Banco de Dados**| MongoDB                      | Armazenamento persistente de dados              |
| **Cache**       | Redis                        | Cache de dados para performance                 |
| **Criptografia**| PyCryptodome (AES-256 GCM)   | Criptografia de chaves privadas (Protocolo CAISK) |
| **Bitcoin Core**| ecdsa, base58, hashlib       | Geração de chaves/endereços e manipulação       |
| **UI/Estilo**   | Tailwind CSS, shadcn/ui      | Design moderno e responsivo                     |
| **Comunicação** | Requests (Python), Fetch (JS)| Comunicação com APIs                            |

## 4. Estrutura de Diretórios

```
/bitcoin-wallet-backend
├── app/                  # Lógica principal da aplicação Flask
│   ├── __init__.py
│   ├── app.py            # Arquivo principal da aplicação e rotas
│   ├── bitcoin_core.py   # Módulo de interação com Bitcoin
│   ├── crypto_utils.py   # Módulo de criptografia (Protocolo CAISK)
│   ├── database.py       # Gerenciador de banco de dados
│   └── wallet_importer.py# Módulo de importação de carteiras
├── config/               # Arquivos de configuração
│   └── config.py
├── tests/                # Testes unitários e de integração
│   ├── test_bitcoin_core.py
│   └── test_crypto.py
├── requirements.txt      # Dependências do backend
├── SECURITY_AUDIT.md     # Relatório de auditoria de segurança
└── README.md             # Esta documentação

/bitcoin-wallet-frontend
├── src/
│   ├── components/       # Componentes React
│   ├── App.jsx           # Componente principal da aplicação
│   └── ...
├── public/
├── package.json          # Dependências do frontend
└── ...
```

## 5. Guia de Instalação e Execução (Ambiente de Desenvolvimento)

### Pré-requisitos

- Python 3.10+
- Node.js 18+
- MongoDB (servidor local ou em nuvem)
- Redis (servidor local ou em nuvem)

### 5.1. Backend (Flask)

1.  **Clone o repositório e navegue até o diretório do backend:**
    ```bash
    git clone <url_do_repositorio>
    cd bitcoin-wallet-backend
    ```

2.  **Crie e ative um ambiente virtual (recomendado):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Windows: venv\Scripts\activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as variáveis de ambiente (opcional):**
    Crie um arquivo `.env` na raiz do backend para sobrescrever as configurações padrão (ex: `MONGODB_URI`, `REDIS_HOST`).

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    flask run --host=0.0.0.0 --port=5000
    ```
    A API estará disponível em `http://localhost:5000`.

### 5.2. Frontend (React)

1.  **Navegue até o diretório do frontend em um novo terminal:**
    ```bash
    cd ../bitcoin-wallet-frontend
    ```

2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    pnpm run dev --host
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

## 6. Documentação da API

Consulte o arquivo `app/app.py` para a definição completa dos endpoints. As principais rotas são:

- `GET /api/health`: Verifica o status da API e da conexão com a Mainnet.
- `POST /api/wallets`: Cria uma nova carteira.
- `GET /api/wallets`: Lista todas as carteiras.
- `GET /api/wallets/<id>`: Obtém detalhes de uma carteira, incluindo saldo total.
- `POST /api/wallets/<id>/addresses`: Gera um novo endereço para uma carteira.
- `POST /api/wallets/<id>/import`: Importa chaves de um arquivo (`.txt`, `.dat`, etc.).

## 7. Segurança

Consulte o arquivo `SECURITY_AUDIT.md` para uma análise detalhada da segurança do sistema.

**Atenção:** O sistema na versão atual (`1.0.0-dev`) **NÃO É SEGURO PARA PRODUÇÃO**. Faltam mecanismos essenciais como autenticação de usuário, autorização, rate limiting e HTTPS. Utilize apenas em ambiente de desenvolvimento controlado.

---
*Este documento foi gerado por Manus AI, um agente de IA autônomo especializado em engenharia de software.* 
'''
